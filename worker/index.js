/* Sistema Monte Fuji: servidor (Cloudflare Worker)
 * - protege as páginas e os dados com login individual (sessão em cookie HttpOnly)
 * - guarda tudo no banco D1 (env.DB) e devolve só o que mudou para as telas se atualizarem
 * - faz um backup diário no KV (env.BACKUPS)
 */

const APP_VERSAO = "2.0.0";

/* coleções da tela -> tabelas do banco */
const COL = {
  CLIENTES: "clientes",
  FUNC: "funcionarios",
  EVENTS: "agenda",
  OSL: "ordens_servico",
  TAREFAS: "tarefas",
  RECEBER: "receber",
  EMAILS: "emails",
  VK: "avisos_garantia",
};
const COLS = Object.keys(COL);
const PAPEIS = ["admin", "colaborador", "leitura"];
const SESSAO_DIAS = 30;
const PBKDF2_ITER = 100000;
const MAX_FALHAS = 5;
const BLOQUEIO_MIN = 15;
const BACKUP_DIAS = 60;

export default {
  async fetch(request, env, ctx) {
    try {
      return await rotear(request, env, ctx);
    } catch (e) {
      if (e instanceof Resposta) return e.res;
      console.error(e && e.stack || e);
      return json({ erro: "Erro no servidor. Tente de novo em instantes." }, 500);
    }
  },
  async scheduled(event, env, ctx) {
    ctx.waitUntil(backupDiario(env));
  },
};

class Resposta { constructor(res) { this.res = res; } }
function falha(status, erro) { throw new Resposta(json({ erro }, status)); }

function json(obj, status = 200, extra = {}) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", ...extra },
  });
}

async function rotear(request, env, ctx) {
  const url = new URL(request.url);
  const p = url.pathname;
  const m = request.method;

  if (m !== "GET" && m !== "HEAD") {
    /* contra envio de formulários de outros sites (CSRF) */
    const origem = request.headers.get("Origin");
    if (origem && origem !== url.origin) falha(403, "Origem não permitida.");
    if (!(request.headers.get("Content-Type") || "").includes("application/json")) falha(415, "Formato inválido.");
  }

  if (p === "/api/saude") {
    const r = await env.DB.prepare("SELECT valor FROM controle WHERE chave='versao'").first();
    return json({ ok: true, app: APP_VERSAO, banco: r ? "ok" : "sem estrutura" });
  }
  if (p === "/login" || p === "/login.html") return pagina(env, request, "/login");
  if (p === "/api/login" && m === "POST") return login(request, env);
  if (p === "/api/logout" && m === "POST") return logout(request, env);

  const eu = await sessao(request, env);

  if (p.startsWith("/api/")) {
    if (!eu) falha(401, "Sua sessão terminou. Entre de novo.");
    if (p === "/api/senha" && m === "POST") return trocarSenha(request, env, eu);
    if (p === "/api/eu") return json({ usuario: publico(eu) });
    if (eu.trocar_senha) falha(403, "Defina uma nova senha antes de continuar.");
    if (p === "/api/dados" && m === "GET") return json(await tudo(env));
    if (p === "/api/mudancas" && m === "GET") return mudancas(url, env);
    if (p === "/api/sync" && m === "POST") return sincronizar(request, env, eu);
    if (p === "/api/usuarios" && m === "GET") return usuariosListar(env, eu);
    if (p === "/api/usuarios" && m === "POST") return usuariosCriar(request, env, eu);
    const um = p.match(/^\/api\/usuarios\/(\d+)$/);
    if (um && m === "POST") return usuariosAlterar(request, env, eu, +um[1]);
    if (p === "/api/backup" && m === "GET") return backupBaixar(env, eu);
    if (p === "/api/backups" && m === "GET") return backupsListar(env, eu);
    const bm = p.match(/^\/api\/backups\/([\w.:-]+)$/);
    if (bm && m === "GET") return backupGuardado(env, eu, bm[1]);
    if (p === "/api/importar" && m === "POST") return importar(request, env, eu);
    falha(404, "Rota não encontrada.");
  }

  /* páginas: só com login */
  if (m !== "GET" && m !== "HEAD") falha(405, "Método não permitido.");
  if (!eu) return Response.redirect(url.origin + "/login", 302);
  if (eu.trocar_senha) return Response.redirect(url.origin + "/login?trocar=1", 302);
  if (p === "/" || p === "/index.html" || !p.includes(".")) return app(env, request, eu);
  return new Response("Não encontrado", { status: 404 });
}

/* ===== páginas ===== */
async function pagina(env, request, caminho) {
  const r = await env.ASSETS.fetch(new Request(new URL(caminho, request.url)));
  const h = new Headers(r.headers);
  h.set("Cache-Control", "no-store");
  h.set("X-Content-Type-Options", "nosniff");
  h.set("Referrer-Policy", "same-origin");
  h.set("X-Frame-Options", "DENY");
  return new Response(r.body, { status: r.status, headers: h });
}

async function app(env, request, eu) {
  const r = await env.ASSETS.fetch(new Request(new URL("/", request.url)));
  if (!r.ok) return r;
  const html = await r.text();
  const boot = await tudo(env);
  boot.usuario = publico(eu);
  /* "<" vira < para o JSON não fechar a tag script */
  const dados = JSON.stringify(boot).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
  const i = html.indexOf("<script>");
  const out = html.slice(0, i) + "<script>window.MF_BOOT=" + dados + "</script>\n" + html.slice(i);
  return new Response(out, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "same-origin",
      "X-Frame-Options": "DENY",
    },
  });
}

/* ===== dados ===== */
async function tudo(env, comExcluidos = false) {
  const stmts = [env.DB.prepare("SELECT valor FROM controle WHERE chave='versao'")];
  for (const c of COLS) {
    stmts.push(env.DB.prepare(`SELECT dados FROM ${COL[c]} ${comExcluidos ? "" : "WHERE excluido=0"} ORDER BY rowid ${c === "OSL" ? "DESC" : "ASC"}`));
  }
  const rs = await env.DB.batch(stmts);
  const out = { ver: rs[0].results[0].valor, dados: {} };
  COLS.forEach((c, i) => { out.dados[c] = rs[i + 1].results.map((x) => JSON.parse(x.dados)); });
  return out;
}

async function mudancas(url, env) {
  const desde = Math.max(0, parseInt(url.searchParams.get("desde") || "0", 10) || 0);
  const v = await env.DB.prepare("SELECT valor FROM controle WHERE chave='versao'").first("valor");
  if (v <= desde) return json({ ver: v });
  const rs = await env.DB.batch(COLS.map((c) => env.DB.prepare(`SELECT chave, dados, excluido FROM ${COL[c]} WHERE versao > ? AND versao <= ? ORDER BY rowid`).bind(desde, v)));
  const mud = {};
  COLS.forEach((c, i) => { if (rs[i].results.length) mud[c] = rs[i].results.map((x) => [x.chave, x.excluido ? null : x.dados]); });
  return json({ ver: v, mud });
}

/* chave de cada registro: igual à usada na tela */
function chaveDe(c, x) {
  if (c === "OSL") return String(x[0]);
  if (c === "VK") return String(x);
  return x && x.id != null ? String(x.id) : JSON.stringify(x);
}

async function corpo(request, limite = 8_000_000) {
  const t = await request.text();
  if (t.length > limite) falha(413, "Envio grande demais.");
  try { return JSON.parse(t); } catch { falha(400, "Formato inválido."); }
}

async function sincronizar(request, env, eu) {
  if (eu.papel === "leitura") falha(403, "Seu acesso é somente para consulta.");
  const b = await corpo(request);
  const ops = Array.isArray(b.ops) ? b.ops : null;
  if (!ops || ops.length > 5000) falha(400, "Lista de alterações inválida.");
  for (const o of ops) {
    if (!COL[o.c] || typeof o.k !== "string" || !o.k || o.k.length > 300) falha(400, "Alteração inválida.");
    if (o.d !== null) {
      if (typeof o.d !== "string" || o.d.length > 500_000) falha(400, "Registro inválido.");
      try { const x = JSON.parse(o.d); if (chaveDe(o.c, x) !== o.k) throw 0; } catch { falha(400, "Registro inválido."); }
    }
  }
  const r = await aplicar(env, ops, eu.id, "sync");
  return json({ ok: true, ver: r.ver, rejeitados: r.rejeitados });
}

/* Grava as alterações numa única transação (batch do D1) e sobe a versão uma vez.
 * ops: [{c, k, d (texto JSON ou null para excluir), n (1 = registro novo na tela)}] */
async function aplicar(env, ops, uid, modo) {
  const rejeitados = [];
  /* aviso de garantia: uma anotação só por aviso, mesmo com duas pessoas abrindo o sistema juntas */
  const avisos = ops.filter((o) => o.c === "TAREFAS" && o.d !== null && !o.rej).map((o) => ({ o, vk: JSON.parse(o.d).vk })).filter((x) => x.vk);
  if (avisos.length) {
    const vks = [...new Set(avisos.map((x) => x.vk))];
    for (const parte of fatias(vks, 90)) {
      const rs = await env.DB.prepare(`SELECT chave, aviso_garantia FROM tarefas WHERE excluido=0 AND aviso_garantia IN (${parte.map(() => "?").join(",")})`).bind(...parte).all();
      for (const x of avisos) {
        const outro = rs.results.find((r) => r.aviso_garantia === x.vk && r.chave !== x.o.k);
        if (outro && !x.o.rej) { x.o.rej = "aviso"; rejeitados.push({ c: "TAREFAS", k: x.o.k, motivo: "aviso" }); }
      }
    }
  }
  const validas = ops.filter((o) => !o.rej);
  const DB = env.DB;
  const VER = "(SELECT valor FROM controle WHERE chave='versao')";
  const stmts = [DB.prepare("UPDATE controle SET valor = valor + 1 WHERE chave='versao'")];
  const grupos = {};
  for (const o of validas) (grupos[o.c] = grupos[o.c] || []).push({ k: o.k, d: o.d, n: o.n && o.d !== null ? 1 : 0 });
  const conferir = [];
  for (const c of Object.keys(grupos)) {
    const t = COL[c];
    for (const parte of fatiasPorTamanho(grupos[c], 900_000)) {
      const lote = JSON.stringify(parte);
      /* histórico: só o que muda de fato */
      stmts.push(DB.prepare(
        `INSERT INTO historico (tabela, chave, acao, dados_antes, dados_depois, usuario_id)
         SELECT ?1, j.k,
           CASE WHEN ?3 = 'importar' THEN 'importar' WHEN j.d IS NULL THEN 'excluir' WHEN t.chave IS NULL OR t.excluido = 1 THEN 'criar' ELSE 'alterar' END,
           CASE WHEN t.excluido = 0 THEN t.dados END, j.d, ?2
         FROM (SELECT json_extract(value,'$.k') AS k, json_extract(value,'$.d') AS d, json_extract(value,'$.n') AS n FROM json_each(?4)) j
         LEFT JOIN ${t} t ON t.chave = j.k
         WHERE ((j.d IS NULL AND t.chave IS NOT NULL AND t.excluido = 0)
            OR (j.d IS NOT NULL AND (t.chave IS NULL OR t.excluido = 1 OR t.dados IS NOT j.d)))
           AND NOT (j.n = 1 AND t.chave IS NOT NULL AND t.excluido = 0)`
      ).bind(t, uid, modo, lote));
      stmts.push(DB.prepare(
        `INSERT INTO ${t} (chave, dados, versao, criado_por, atualizado_por)
         SELECT json_extract(value,'$.k'), json_extract(value,'$.d'), ${VER}, ?1, ?1
         FROM json_each(?2) WHERE json_extract(value,'$.d') IS NOT NULL AND json_extract(value,'$.n') = 0
         ON CONFLICT (chave) DO UPDATE SET dados = excluded.dados, versao = excluded.versao, excluido = 0,
           atualizado_em = datetime('now'), atualizado_por = excluded.atualizado_por
         WHERE ${t}.dados IS NOT excluded.dados OR ${t}.excluido = 1`
      ).bind(uid, lote));
      if (parte.some((x) => x.n)) {
        /* registro novo na tela: se a chave já existe com outro conteúdo (ex.: duas pessoas gerando
           a mesma OS ao mesmo tempo), não sobrescreve; a tela recebe de volta e renumera o dela */
        stmts.push(DB.prepare(
          `INSERT INTO ${t} (chave, dados, versao, criado_por, atualizado_por)
           SELECT json_extract(value,'$.k'), json_extract(value,'$.d'), ${VER}, ?1, ?1
           FROM json_each(?2) WHERE json_extract(value,'$.n') = 1
           ON CONFLICT (chave) DO UPDATE SET dados = excluded.dados, versao = excluded.versao, excluido = 0,
             atualizado_em = datetime('now'), atualizado_por = excluded.atualizado_por
           WHERE ${t}.excluido = 1`
        ).bind(uid, lote));
        conferir.push({ c, idx: stmts.length, novos: parte.filter((x) => x.n) });
        stmts.push(DB.prepare(`SELECT chave, dados FROM ${t} WHERE chave IN (SELECT json_extract(value,'$.k') FROM json_each(?1) WHERE json_extract(value,'$.n') = 1)`).bind(lote));
      }
      stmts.push(DB.prepare(
        `UPDATE ${t} SET excluido = 1, versao = ${VER}, atualizado_em = datetime('now'), atualizado_por = ?1
         WHERE excluido = 0 AND chave IN (SELECT json_extract(value,'$.k') FROM json_each(?2) WHERE json_extract(value,'$.d') IS NULL)`
      ).bind(uid, lote));
    }
  }
  stmts.push(DB.prepare("SELECT valor FROM controle WHERE chave='versao'"));
  const rs = await DB.batch(stmts);
  for (const cf of conferir) {
    const gravado = new Map(rs[cf.idx].results.map((x) => [x.chave, x.dados]));
    for (const x of cf.novos) if (gravado.get(x.k) !== x.d) rejeitados.push({ c: cf.c, k: x.k, motivo: "existe" });
  }
  return { ver: rs[rs.length - 1].results[0].valor, rejeitados };
}

function fatias(a, n) { const out = []; for (let i = 0; i < a.length; i += n) out.push(a.slice(i, i + n)); return out; }
function fatiasPorTamanho(a, max) {
  const out = []; let cur = [], tam = 0;
  for (const x of a) {
    const t = (x.d ? x.d.length : 0) + x.k.length + 20;
    if (cur.length && tam + t > max) { out.push(cur); cur = []; tam = 0; }
    cur.push(x); tam += t;
  }
  if (cur.length) out.push(cur);
  return out;
}

/* ===== importação (dados do navegador da versão anterior ou arquivo de backup) ===== */
function semAcento(s) { return String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim(); }
function digitos(s) { return String(s || "").replace(/\D/g, ""); }
/* o que torna dois registros "o mesmo", para não duplicar */
function assinatura(c, x) {
  try {
    switch (c) {
      case "CLIENTES": { const d = digitos(x.doc); return d.length >= 11 ? "doc:" + d + ":" + semAcento(x.nome) : "nome:" + semAcento(x.nome); }
      case "FUNC": return semAcento(x.nome) + "|" + (x.nasc || "");
      case "RECEBER": return [semAcento(x.nome), x.valor, x.venc, x.serv].join("|");
      case "TAREFAS": return x.vk ? "vk:" + x.vk : [semAcento(x.t), x.col, x.due || "", semAcento(x.d)].join("|");
      case "EVENTS": return [x.date, x.h, semAcento(x.cli), (x.svs || [x.s]).join(",")].join("|");
      case "OSL": return "os:" + x[0];
      case "VK": return "vk:" + x;
      default: { const y = { ...x }; delete y.id; return JSON.stringify(y); }
    }
  } catch { return JSON.stringify(x); }
}

async function importar(request, env, eu) {
  if (eu.papel !== "admin") falha(403, "Só o administrador pode importar dados.");
  const b = await corpo(request, 20_000_000);
  const fonte = b.dados || {};
  const simular = !!b.simular;
  const atual = await tudo(env, true);
  const ativos = await tudo(env, false);
  const ops = [], resumo = {};
  let seq = Date.now() * 10;
  for (const c of COLS) {
    const lista = Array.isArray(fonte[c]) ? fonte[c] : [];
    if (!lista.length) continue;
    const r = (resumo[c] = { recebidos: lista.length, novos: 0, duplicados: 0, renumerados: 0, invalidos: 0 });
    const assin = new Set(ativos.dados[c].map((x) => assinatura(c, x)));
    const chavesAtivas = new Set(ativos.dados[c].map((x) => chaveDe(c, x)));
    const todasChaves = new Set(atual.dados[c].map((x) => chaveDe(c, x)));
    const itens = c === "OSL" ? lista.slice().reverse() : lista; /* OS: a mais nova fica por último na gravação */
    for (let x of itens) {
      if (x === null || x === undefined || (c === "OSL" && !Array.isArray(x)) || (c !== "OSL" && c !== "VK" && typeof x !== "object")) { r.invalidos++; continue; }
      const s = assinatura(c, x);
      if (assin.has(s)) { r.duplicados++; continue; }
      let k = chaveDe(c, x);
      if (chavesAtivas.has(k)) {
        /* mesma chave, conteúdo diferente: entra com um código novo, sem sobrescrever */
        x = { ...x };
        if (c === "EVENTS") { let i = 1; while (chavesAtivas.has(x.id + "-i" + i)) i++; x.id = x.id + "-i" + i; }
        else if (c === "OSL" || c === "VK") { r.duplicados++; continue; }
        else { do { seq++; } while (chavesAtivas.has(String(seq))); x.id = seq; }
        k = chaveDe(c, x);
        r.renumerados++;
      }
      assin.add(s); chavesAtivas.add(k); todasChaves.add(k);
      ops.push({ c, k, d: JSON.stringify(x) });
      r.novos++;
    }
  }
  if (simular || !ops.length) return json({ ok: true, simulado: simular, resumo, ver: atual.ver });
  /* cópia de segurança antes de importar */
  if (env.BACKUPS) await env.BACKUPS.put("antes-importacao-" + new Date().toISOString().replace(/[:.]/g, "-"), JSON.stringify(dump(atual)), { expirationTtl: BACKUP_DIAS * 86400 });
  const res = await aplicar(env, ops, eu.id, "importar");
  return json({ ok: true, resumo, ver: res.ver });
}

/* ===== backup ===== */
function dump(t) {
  const o = { sistema: "Monte Fuji", versao: 2, gerado: new Date().toISOString(), versao_banco: t.ver };
  for (const c of COLS) o[c] = t.dados[c];
  return o;
}
async function backupBaixar(env, eu) {
  if (eu.papel !== "admin") falha(403, "Só o administrador pode baixar o backup completo.");
  const d = dump(await tudo(env));
  return json(d, 200, { "Content-Disposition": `attachment; filename="backup-monte-fuji-${d.gerado.slice(0, 10)}.json"` });
}
async function backupsListar(env, eu) {
  if (eu.papel !== "admin") falha(403, "Só o administrador vê os backups.");
  const l = await env.BACKUPS.list();
  return json({ backups: l.keys.map((k) => k.name).sort().reverse() });
}
async function backupGuardado(env, eu, nome) {
  if (eu.papel !== "admin") falha(403, "Só o administrador baixa backups.");
  const v = await env.BACKUPS.get(nome);
  if (v === null) falha(404, "Backup não encontrado.");
  return new Response(v, { headers: { "Content-Type": "application/json", "Cache-Control": "no-store", "Content-Disposition": `attachment; filename="${nome}.json"` } });
}
async function backupDiario(env) {
  const t = await tudo(env);
  await env.BACKUPS.put("backup-" + new Date().toISOString().slice(0, 10), JSON.stringify(dump(t)), { expirationTtl: BACKUP_DIAS * 86400 });
  await env.DB.prepare("DELETE FROM sessoes WHERE expira_em < datetime('now')").run();
}

/* ===== login e sessões ===== */
function b64(buf) { return btoa(String.fromCharCode(...new Uint8Array(buf))); }
function b64url(buf) { return b64(buf).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); }
function deB64(s) { return Uint8Array.from(atob(s), (ch) => ch.charCodeAt(0)); }
async function sha256(txt) { return [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(txt)))].map((x) => x.toString(16).padStart(2, "0")).join(""); }

export async function hashSenha(senha, salB64, iter) {
  const chave = await crypto.subtle.importKey("raw", new TextEncoder().encode(senha), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: deB64(salB64), iterations: iter }, chave, 256);
  return b64(bits);
}
async function novaSenhaHash(senha) {
  const sal = b64(crypto.getRandomValues(new Uint8Array(16)));
  return { sal, iter: PBKDF2_ITER, hash: await hashSenha(senha, sal, PBKDF2_ITER) };
}
function iguais(a, b) {
  if (a.length !== b.length) return false;
  let r = 0; for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}
function senhaTemporaria() {
  const abc = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const r = crypto.getRandomValues(new Uint8Array(12));
  return [...r].map((x) => abc[x % abc.length]).join("").replace(/(.{4})(?!$)/g, "$1-");
}
function senhaFraca(s) {
  if (typeof s !== "string" || s.length < 8) return "A senha precisa ter pelo menos 8 caracteres.";
  if (s.length > 200) return "Senha longa demais.";
  return null;
}
function publico(u) { return { id: u.id, nome: u.nome, email: u.email, iniciais: u.iniciais, papel: u.papel, trocar_senha: !!u.trocar_senha }; }
function cookieSessao(token, maxAge) { return `mf_sessao=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`; }
function lerCookie(request) {
  const c = request.headers.get("Cookie") || "";
  const m = c.match(/(?:^|;\s*)mf_sessao=([A-Za-z0-9_-]{20,})/);
  return m ? m[1] : null;
}

async function sessao(request, env) {
  const t = lerCookie(request);
  if (!t) return null;
  return await env.DB.prepare(
    `SELECT u.id, u.nome, u.email, u.iniciais, u.papel, u.trocar_senha FROM sessoes s JOIN usuarios u ON u.id = s.usuario_id
     WHERE s.token_hash = ? AND s.expira_em > datetime('now') AND u.ativo = 1`
  ).bind(await sha256(t)).first();
}

async function login(request, env) {
  const b = await corpo(request, 10_000);
  const email = String(b.email || "").trim().toLowerCase();
  const senha = String(b.senha || "");
  const u = email ? await env.DB.prepare("SELECT * FROM usuarios WHERE email = ?").bind(email).first() : null;
  const erro = "E-mail ou senha incorretos.";
  if (!u || !u.ativo) { await hashSenha(senha, "AAAAAAAAAAAAAAAAAAAAAA==", PBKDF2_ITER); falha(401, erro); }
  if (u.bloqueado_ate && u.bloqueado_ate > agoraSql()) falha(429, `Muitas tentativas erradas. Tente de novo em ${BLOQUEIO_MIN} minutos.`);
  const h = await hashSenha(senha, u.senha_sal, u.senha_iter);
  if (!iguais(h, u.senha_hash)) {
    const f = u.falhas + 1;
    if (f >= MAX_FALHAS) await env.DB.prepare(`UPDATE usuarios SET falhas = 0, bloqueado_ate = datetime('now', '+${BLOQUEIO_MIN} minutes') WHERE id = ?`).bind(u.id).run();
    else await env.DB.prepare("UPDATE usuarios SET falhas = ? WHERE id = ?").bind(f, u.id).run();
    falha(401, erro);
  }
  const token = b64url(crypto.getRandomValues(new Uint8Array(32)));
  await env.DB.batch([
    env.DB.prepare("UPDATE usuarios SET falhas = 0, bloqueado_ate = NULL, ultimo_acesso = datetime('now') WHERE id = ?").bind(u.id),
    env.DB.prepare(`INSERT INTO sessoes (token_hash, usuario_id, expira_em, agente) VALUES (?, ?, datetime('now', '+${SESSAO_DIAS} days'), ?)`)
      .bind(await sha256(token), u.id, (request.headers.get("User-Agent") || "").slice(0, 200)),
  ]);
  return json({ ok: true, usuario: publico(u) }, 200, { "Set-Cookie": cookieSessao(token, SESSAO_DIAS * 86400) });
}
function agoraSql() { return new Date().toISOString().replace("T", " ").slice(0, 19); }

async function logout(request, env) {
  const t = lerCookie(request);
  if (t) await env.DB.prepare("DELETE FROM sessoes WHERE token_hash = ?").bind(await sha256(t)).run();
  return json({ ok: true }, 200, { "Set-Cookie": cookieSessao("", 0) });
}

async function trocarSenha(request, env, eu) {
  const b = await corpo(request, 10_000);
  const u = await env.DB.prepare("SELECT * FROM usuarios WHERE id = ?").bind(eu.id).first();
  if (!iguais(await hashSenha(String(b.atual || ""), u.senha_sal, u.senha_iter), u.senha_hash)) falha(400, "A senha atual não confere.");
  const fr = senhaFraca(b.nova); if (fr) falha(400, fr);
  if (b.nova === b.atual) falha(400, "A nova senha precisa ser diferente da atual.");
  const n = await novaSenhaHash(b.nova);
  const atual = await sha256(lerCookie(request));
  await env.DB.batch([
    env.DB.prepare("UPDATE usuarios SET senha_hash = ?, senha_sal = ?, senha_iter = ?, trocar_senha = 0 WHERE id = ?").bind(n.hash, n.sal, n.iter, eu.id),
    env.DB.prepare("DELETE FROM sessoes WHERE usuario_id = ? AND token_hash <> ?").bind(eu.id, atual),
  ]);
  return json({ ok: true });
}

/* ===== usuários (administrador) ===== */
function iniciaisDe(nome) {
  const p = String(nome).trim().split(/\s+/).filter(Boolean);
  return ((p[0] || "?")[0] + (p.length > 1 ? p[p.length - 1][0] : (p[0] || "?")[1] || "")).toUpperCase();
}
async function usuariosListar(env, eu) {
  if (eu.papel !== "admin") return json({ usuarios: [publico(eu)] });
  const rs = await env.DB.prepare("SELECT id, nome, email, iniciais, papel, ativo, trocar_senha, ultimo_acesso, criado_em FROM usuarios ORDER BY ativo DESC, nome").all();
  return json({ usuarios: rs.results });
}
async function usuariosCriar(request, env, eu) {
  if (eu.papel !== "admin") falha(403, "Só o administrador cadastra usuários.");
  const b = await corpo(request, 10_000);
  const nome = String(b.nome || "").trim(), email = String(b.email || "").trim().toLowerCase(), papel = b.papel || "colaborador";
  if (!nome) falha(400, "Informe o nome.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) falha(400, "Informe um e-mail válido.");
  if (!PAPEIS.includes(papel)) falha(400, "Perfil inválido.");
  if (await env.DB.prepare("SELECT 1 FROM usuarios WHERE email = ?").bind(email).first()) falha(409, "Já existe um usuário com este e-mail.");
  const temp = senhaTemporaria();
  const h = await novaSenhaHash(temp);
  await env.DB.prepare("INSERT INTO usuarios (email, nome, iniciais, papel, senha_hash, senha_sal, senha_iter, trocar_senha) VALUES (?, ?, ?, ?, ?, ?, ?, 1)")
    .bind(email, nome, iniciaisDe(nome), papel, h.hash, h.sal, h.iter).run();
  return json({ ok: true, senha_temporaria: temp });
}
async function usuariosAlterar(request, env, eu, id) {
  if (eu.papel !== "admin") falha(403, "Só o administrador altera usuários.");
  const b = await corpo(request, 10_000);
  const u = await env.DB.prepare("SELECT * FROM usuarios WHERE id = ?").bind(id).first();
  if (!u) falha(404, "Usuário não encontrado.");
  const nome = b.nome !== undefined ? String(b.nome).trim() : u.nome;
  const papel = b.papel !== undefined ? b.papel : u.papel;
  const ativo = b.ativo !== undefined ? (b.ativo ? 1 : 0) : u.ativo;
  if (!nome) falha(400, "Informe o nome.");
  if (!PAPEIS.includes(papel)) falha(400, "Perfil inválido.");
  if (id === eu.id && (papel !== "admin" || !ativo)) falha(400, "Você não pode tirar o seu próprio acesso de administrador.");
  const stmts = [env.DB.prepare("UPDATE usuarios SET nome = ?, iniciais = ?, papel = ?, ativo = ? WHERE id = ?").bind(nome, iniciaisDe(nome), papel, ativo, id)];
  let temp = null;
  if (b.redefinir_senha) {
    temp = senhaTemporaria();
    const h = await novaSenhaHash(temp);
    stmts.push(env.DB.prepare("UPDATE usuarios SET senha_hash = ?, senha_sal = ?, senha_iter = ?, trocar_senha = 1, falhas = 0, bloqueado_ate = NULL WHERE id = ?").bind(h.hash, h.sal, h.iter, id));
  }
  if (b.redefinir_senha || !ativo) stmts.push(env.DB.prepare("DELETE FROM sessoes WHERE usuario_id = ?").bind(id));
  await env.DB.batch(stmts);
  return json({ ok: true, senha_temporaria: temp });
}
