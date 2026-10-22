/* Sistema Monte Fuji: servidor (Cloudflare Worker)
 * - protege as páginas e os dados com login individual (sessão em cookie HttpOnly)
 * - guarda tudo no banco D1 (env.DB) e devolve só o que mudou para as telas se atualizarem
 * - faz um backup diário no KV (env.BACKUPS)
 */

const APP_VERSAO = "2.0.2";

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
    if (p === "/api/google" && m === "GET") return googleStatus(env);
    if (p === "/api/google/conectar" && m === "GET") return googleConectar(url, env, eu);
    if (p === "/api/google/retorno" && m === "GET") return googleRetorno(request, url, env, eu);
    if (p === "/api/google/desconectar" && m === "POST") return googleDesconectar(env, eu);
    if (p === "/api/drive/pastas" && m === "GET") return drivePastas(url, env);
    if (p === "/api/os" && m === "POST") return osCriar(request, env, eu);
    if (p === "/api/os/drive" && m === "POST") return osSalvarDrive(request, env, eu);
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
  /* o acesso pode ser um e-mail ou um nome de usuário (letras, números, ponto, hífen ou sublinhado) */
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && !/^[a-z0-9._-]{3,40}$/.test(email)) falha(400, "Informe um e-mail ou um usuário (só letras, números, ponto, hífen ou sublinhado).");
  if (!PAPEIS.includes(papel)) falha(400, "Perfil inválido.");
  if (await env.DB.prepare("SELECT 1 FROM usuarios WHERE email = ?").bind(email).first()) falha(409, "Já existe um usuário com este acesso.");
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

/* ===== Google Drive: ordens de serviço na pasta de cada cliente =====
 * A conta Google da empresa autoriza uma vez (Configurações › Integrações › Conectar). O servidor guarda só a
 * autorização (refresh token) na tabela "integracoes" e pede um acesso temporário ao Google quando precisa.
 * Segredos (Cloudflare › mfuji-app › Settings › Variables and Secrets): GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET.
 * Variáveis (wrangler.jsonc): DRIVE_RAIZ (pasta "Monte Fuji Dedetizadora e Desentupidora") e OS_MODELO (documento modelo).
 * Pastas: RAIZ / "01 - 2026" / "01 - Clientes Ativos" (ou Avulsos, Orçamentos) / pasta do cliente. */
const G_ESCOPOS = "openid email https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/documents";
const G_PASTA = "application/vnd.google-apps.folder";
let gAcesso = null; /* acesso temporário guardado enquanto o servidor está de pé: { token, expira } */
let gPastasCache = null; /* { em, lista } */
/* GOOGLE_TESTE (só no teste local, test/drive.mjs): manda os pedidos ao Google para um Google simulado */
function gFetch(env, endereco, init) { return fetch(env.GOOGLE_TESTE ? endereco.replace("https://", env.GOOGLE_TESTE + "/") : endereco, init); }

function gConfigurado(env) { return !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET && env.DRIVE_RAIZ && env.OS_MODELO); }
async function gLer(env, chave) { return await env.DB.prepare("SELECT valor FROM integracoes WHERE chave = ?").bind(chave).first("valor"); }

async function googleStatus(env) {
  const conta = gConfigurado(env) ? await gLer(env, "google_conta") : null;
  const ligado = conta ? !!(await gLer(env, "google_refresh")) : false;
  return json({ configurado: gConfigurado(env), conectado: ligado, conta: ligado ? conta : null, raiz: env.DRIVE_RAIZ || null });
}

function cookieEstado(v, maxAge) { return `mf_gestado=${v}; Path=/api/google; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`; }

async function googleConectar(url, env, eu) {
  if (eu.papel !== "admin") falha(403, "Só o administrador conecta o Google Drive.");
  if (!gConfigurado(env)) falha(409, "Falta configurar a ligação com o Google (veja o guia de configuração).");
  const estado = b64url(crypto.getRandomValues(new Uint8Array(24)));
  const q = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID, redirect_uri: url.origin + "/api/google/retorno", response_type: "code",
    scope: G_ESCOPOS, access_type: "offline", prompt: "consent", include_granted_scopes: "true", state: estado,
    login_hint: env.GOOGLE_CONTA || "atendimento@mfuji.com.br",
  });
  return new Response(null, { status: 302, headers: { Location: "https://accounts.google.com/o/oauth2/v2/auth?" + q, "Set-Cookie": cookieEstado(estado, 600), "Cache-Control": "no-store" } });
}

async function googleRetorno(request, url, env, eu) {
  const volta = (r) => new Response(null, { status: 302, headers: { Location: url.origin + "/?google=" + r + "#cfg", "Set-Cookie": cookieEstado("", 0), "Cache-Control": "no-store" } });
  if (eu.papel !== "admin" || !gConfigurado(env)) return volta("erro");
  const m = (request.headers.get("Cookie") || "").match(/(?:^|;\s*)mf_gestado=([A-Za-z0-9_-]{20,})/);
  const estado = url.searchParams.get("state") || "";
  if (!m || !iguais(m[1], estado)) return volta("erro");
  const code = url.searchParams.get("code");
  if (!code) return volta("cancelado");
  const r = await gFetch(env, "https://oauth2.googleapis.com/token", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ code, client_id: env.GOOGLE_CLIENT_ID, client_secret: env.GOOGLE_CLIENT_SECRET, redirect_uri: url.origin + "/api/google/retorno", grant_type: "authorization_code" }),
  });
  const t = await r.json().catch(() => ({}));
  if (!r.ok || !t.refresh_token) { console.error("google token", r.status, t.error); return volta("erro"); }
  if (!String(t.scope || "").includes("auth/drive") || !String(t.scope || "").includes("auth/documents")) return volta("permissoes");
  let conta = "";
  try { conta = JSON.parse(atob(t.id_token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))).email || ""; } catch { /* sem e-mail, segue */ }
  await env.DB.batch([
    env.DB.prepare("INSERT INTO integracoes (chave, valor, atualizado_por) VALUES ('google_refresh', ?1, ?2) ON CONFLICT (chave) DO UPDATE SET valor = excluded.valor, atualizado_em = datetime('now'), atualizado_por = excluded.atualizado_por").bind(t.refresh_token, eu.id),
    env.DB.prepare("INSERT INTO integracoes (chave, valor, atualizado_por) VALUES ('google_conta', ?1, ?2) ON CONFLICT (chave) DO UPDATE SET valor = excluded.valor, atualizado_em = datetime('now'), atualizado_por = excluded.atualizado_por").bind(conta, eu.id),
  ]);
  gAcesso = { token: t.access_token, expira: Date.now() + (t.expires_in - 120) * 1000 };
  gPastasCache = null;
  return volta("ok");
}

async function googleDesconectar(env, eu) {
  if (eu.papel !== "admin") falha(403, "Só o administrador desconecta o Google Drive.");
  const rt = await gLer(env, "google_refresh");
  await env.DB.prepare("DELETE FROM integracoes WHERE chave IN ('google_refresh','google_conta')").run();
  gAcesso = null; gPastasCache = null;
  if (rt) await gFetch(env, "https://oauth2.googleapis.com/revoke", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ token: rt }) }).catch(() => {});
  return json({ ok: true });
}

/* acesso temporário (1 hora) a partir da autorização guardada */
async function gToken(env) {
  if (!gConfigurado(env)) falha(409, "O Google Drive ainda não foi configurado no sistema.");
  if (gAcesso && gAcesso.expira > Date.now()) return gAcesso.token;
  const rt = await gLer(env, "google_refresh");
  if (!rt) falha(409, "O Google Drive não está conectado. O administrador conecta em Configurações › Integrações.");
  const r = await gFetch(env, "https://oauth2.googleapis.com/token", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ refresh_token: rt, client_id: env.GOOGLE_CLIENT_ID, client_secret: env.GOOGLE_CLIENT_SECRET, grant_type: "refresh_token" }),
  });
  const t = await r.json().catch(() => ({}));
  if (!r.ok) {
    console.error("google refresh", r.status, t.error);
    if (t.error === "invalid_grant") {
      await env.DB.prepare("DELETE FROM integracoes WHERE chave = 'google_refresh'").run();
      falha(409, "A autorização do Google expirou ou foi retirada. O administrador precisa conectar de novo em Configurações › Integrações.");
    }
    falha(502, "O Google não respondeu. Tente de novo em instantes.");
  }
  gAcesso = { token: t.access_token, expira: Date.now() + (t.expires_in - 120) * 1000 };
  return gAcesso.token;
}

async function gApi(env, metodo, endereco, corpoJson) {
  const tok = await gToken(env);
  const r = await gFetch(env, endereco, { method: metodo, headers: { Authorization: "Bearer " + tok, ...(corpoJson ? { "Content-Type": "application/json" } : {}) }, body: corpoJson ? JSON.stringify(corpoJson) : undefined });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) {
    console.error("google api", metodo, endereco.split("?")[0], r.status, j.error && j.error.message);
    if (r.status === 401) gAcesso = null;
    if (r.status === 404) falha(404, "O Google Drive não encontrou a pasta ou o modelo. Confira se a conta conectada tem acesso a eles.");
    if (r.status === 403) falha(403, "A conta Google conectada não tem permissão para gravar nesta pasta.");
    falha(502, "O Google Drive recusou o pedido. Tente de novo em instantes.");
  }
  return j;
}

/* subpastas (só pastas, fora da lixeira) de uma lista de pastas */
async function gFilhas(env, pais) {
  const out = [];
  for (const parte of fatias(pais, 40)) {
    const q = `(${parte.map((id) => `'${id.replace(/[^\w-]/g, "")}' in parents`).join(" or ")}) and mimeType = '${G_PASTA}' and trashed = false`;
    let pagina = "";
    do {
      const p = new URLSearchParams({ q, fields: "nextPageToken,files(id,name,parents)", pageSize: "1000", supportsAllDrives: "true", includeItemsFromAllDrives: "true", ...(pagina ? { pageToken: pagina } : {}) });
      const j = await gApi(env, "GET", "https://www.googleapis.com/drive/v3/files?" + p);
      out.push(...(j.files || []));
      pagina = j.nextPageToken || "";
    } while (pagina);
  }
  return out;
}

/* pastas de clientes: RAIZ / ano / grupo (Clientes Ativos, Avulsos, Orçamentos...) / cliente */
async function pastasClientes(env, forcar) {
  if (!forcar && gPastasCache && Date.now() - gPastasCache.em < 60_000) return gPastasCache.lista;
  const anos = (await gFilhas(env, [env.DRIVE_RAIZ])).filter((f) => /\b20\d\d\b/.test(f.name));
  const grupos = anos.length ? (await gFilhas(env, anos.map((f) => f.id))).filter((f) => !/financeiro/i.test(f.name)) : [];
  const nomeAno = new Map(anos.map((f) => [f.id, f.name.match(/\b20\d\d\b/)[0]]));
  const nomeGrupo = new Map(grupos.map((f) => [f.id, nomeAno.get(f.parents[0]) + " / " + f.name.replace(/^\s*\d+\s*-\s*/, "")]));
  const lista = grupos.length ? (await gFilhas(env, grupos.map((f) => f.id))).map((f) => ({ id: f.id, nome: f.name.trim(), grupo: nomeGrupo.get(f.parents[0]) || "" })) : [];
  lista.sort((a, b) => b.grupo.localeCompare(a.grupo) || a.nome.localeCompare(b.nome, "pt-BR"));
  gPastasCache = { em: Date.now(), lista };
  return lista;
}

async function drivePastas(url, env) {
  return json({ pastas: await pastasClientes(env, url.searchParams.get("atualizar") === "1") });
}

/* ===== ordens de serviço geradas pelo servidor =====
 * Registro da OS: [número, data, cliente, serviço (resumo), técnico, valor, status, {sv, obs, pasta, doc}] */
function hojeBr() { return new Date(Date.now() - 3 * 3600_000).toISOString().slice(0, 10); }
function dataExtenso(d) {
  const M = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
  const [a, m, dia] = d.split("-").map(Number);
  return `${dia} de ${M[m - 1]} de ${a}`;
}
function textoOuTraco(s) { s = String(s || "").trim(); return s || "-"; }

/* cria o documento a partir do modelo, já na pasta do cliente */
async function gerarDocOS(env, os, cli, pasta) {
  const extra = os[7] || {};
  const nome = `${os[0]} - Termo de execução de serviço - ${os[2]}`.slice(0, 250);
  const copia = await gApi(env, "POST", `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(env.OS_MODELO)}/copy?supportsAllDrives=true&fields=id,name,webViewLink`, { name: nome, parents: [pasta.id] });
  const campos = {
    NOME: textoOuTraco(cli.nome || os[2]),
    DOC: textoOuTraco(cli.doc),
    ENDERECO: textoOuTraco(String(cli.end || "").replace(/ · /g, ", ")),
    RESPONSAVEL: textoOuTraco(String(cli.contato || "").split("(")[0]),
    TELEFONE: textoOuTraco(cli.tel),
    SERVICO: textoOuTraco(extra.sv || os[3]).toUpperCase(),
    OBS: textoOuTraco(extra.obs),
    DATA: dataExtenso(os[1]),
  };
  try {
    await gApi(env, "POST", `https://docs.googleapis.com/v1/documents/${copia.id}:batchUpdate`, {
      requests: Object.entries(campos).map(([k, v]) => ({ replaceAllText: { containsText: { text: `{{${k}}}`, matchCase: true }, replaceText: v } })),
    });
  } catch (e) {
    /* documento pela metade não fica na pasta do cliente */
    await gApi(env, "PATCH", `https://www.googleapis.com/drive/v3/files/${copia.id}?supportsAllDrives=true`, { trashed: true }).catch(() => {});
    throw e;
  }
  return { id: copia.id, url: copia.webViewLink || `https://docs.google.com/document/d/${copia.id}/edit`, nome: copia.name || nome };
}

async function pastaValida(env, id) {
  if (typeof id !== "string" || !/^[\w-]{10,100}$/.test(id)) return null;
  return (await pastasClientes(env)).find((f) => f.id === id) || (await pastasClientes(env, true)).find((f) => f.id === id) || null;
}

async function proximoNumeroOS(env, ano) {
  const rs = await env.DB.prepare("SELECT chave FROM ordens_servico WHERE chave LIKE ?").bind(`OS-${ano}-%`).all();
  return rs.results.reduce((m, x) => Math.max(m, parseInt(x.chave.split("-")[2], 10) || 0), 0) + 1;
}

async function gravarOS(env, os, uid, nova) {
  const r = await aplicar(env, [{ c: "OSL", k: os[0], d: JSON.stringify(os), n: nova ? 1 : 0 }], uid, "sync");
  return !r.rejeitados.length;
}

/* POST /api/os: registra a OS (número dado pelo servidor) e, com o Drive conectado, salva o documento na pasta do cliente */
async function osCriar(request, env, eu) {
  if (eu.papel === "leitura") falha(403, "Seu acesso é somente para consulta.");
  const b = await corpo(request, 50_000);
  const cli = await env.DB.prepare("SELECT dados FROM clientes WHERE chave = ? AND excluido = 0").bind(String(b.cli || "")).first("dados");
  if (!cli) falha(400, "Escolha um cliente cadastrado.");
  const c = JSON.parse(cli);
  const sv = String(b.servico || "").trim(), obs = String(b.obs || "").trim();
  if (!sv) falha(400, "Descreva o serviço a ser executado.");
  if (sv.length > 3000 || obs.length > 5000) falha(400, "Texto longo demais.");
  const data = /^\d{4}-\d{2}-\d{2}$/.test(b.data || "") ? b.data : hojeBr();
  /* pasta: a escolhida na tela, conferida na lista real do Drive */
  let pasta = null, aviso = null, doc = null;
  const usarDrive = b.drive !== false && gConfigurado(env) && !!(await gLer(env, "google_refresh"));
  if (usarDrive) {
    pasta = await pastaValida(env, b.pastaId || c.pastaId);
    if (!pasta) falha(400, "Escolha a pasta do cliente no Google Drive antes de gerar a OS.");
  }
  const ano = hojeBr().slice(0, 4);
  let os = null;
  for (let n = await proximoNumeroOS(env, ano), tent = 0; tent < 5; n++, tent++) {
    const cand = [`OS-${ano}-${String(n).padStart(4, "0")}`, data, c.nome, sv.length > 60 ? sv.slice(0, 58) + "…" : sv, "—", 0, "Aguardando assinatura", { sv, obs, ...(pasta ? { pasta: { id: pasta.id, nome: pasta.grupo + " / " + pasta.nome } } : {}) }];
    if (await gravarOS(env, cand, eu.id, true)) { os = cand; break; }
  }
  if (!os) falha(409, "Não consegui reservar um número de OS. Tente de novo.");
  if (usarDrive) {
    try {
      doc = await gerarDocOS(env, os, c, pasta);
      os[7].doc = doc;
      await gravarOS(env, os, eu.id, false);
    } catch (e) {
      /* a OS fica registrada; dá para tentar de novo pelo botão "Salvar no Drive" da lista */
      if (!(e instanceof Resposta)) console.error(e && e.stack || e);
      aviso = (e instanceof Resposta && (await e.res.json().catch(() => ({}))).erro) || "Não consegui salvar no Google Drive.";
    }
  } else aviso = gConfigurado(env) ? "O Google Drive não está conectado: a OS foi registrada sem o documento." : null;
  return json({ ok: true, numero: os[0], doc, pasta: os[7].pasta || null, aviso });
}

/* POST /api/os/drive: tenta de novo salvar no Drive uma OS já registrada */
async function osSalvarDrive(request, env, eu) {
  if (eu.papel === "leitura") falha(403, "Seu acesso é somente para consulta.");
  const b = await corpo(request, 10_000);
  const d = await env.DB.prepare("SELECT dados FROM ordens_servico WHERE chave = ? AND excluido = 0").bind(String(b.numero || "")).first("dados");
  if (!d) falha(404, "OS não encontrada.");
  const os = JSON.parse(d);
  if (!os[7] || typeof os[7] !== "object") os[7] = { sv: os[3], obs: "" };
  if (os[7].doc) return json({ ok: true, numero: os[0], doc: os[7].doc });
  const cli = await env.DB.prepare("SELECT dados FROM clientes WHERE excluido = 0 AND nome = ? LIMIT 1").bind(os[2]).first("dados");
  const c = cli ? JSON.parse(cli) : { nome: os[2] };
  const pasta = await pastaValida(env, b.pastaId || (os[7].pasta && os[7].pasta.id) || c.pastaId);
  if (!pasta) falha(400, "Escolha a pasta do cliente no Google Drive.");
  os[7].pasta = { id: pasta.id, nome: pasta.grupo + " / " + pasta.nome };
  os[7].doc = await gerarDocOS(env, os, c, pasta);
  await gravarOS(env, os, eu.id, false);
  return json({ ok: true, numero: os[0], doc: os[7].doc });
}
