// Teste do Google Drive nas ordens de serviço, com um Google simulado (nada sai para o Google de verdade).
// Sobe o próprio `wrangler dev` (porta 8790) com GOOGLE_TESTE apontando para o Google simulado (porta 8791).
// Usa o banco local do wrangler: rode antes as migrações --local e crie um admin com scripts/sql-novo-admin.mjs.
// npm i --no-save playwright && EMAIL=teste@mfuji.test SENHA=<temporária ou atual> node test/drive.mjs
import { chromium } from "playwright";
import { createServer } from "node:http";
import { spawn, execFileSync } from "node:child_process";

const EMAIL = process.env.EMAIL, SENHA = process.env.SENHA, NOVA = process.env.NOVA || "senha-de-teste-123";
const RAIZ = "raiz0000000000", MODELO = "modelo00000000";
const TAG = "ZZ-TESTE-CLAUDE";

/* ===== Google simulado ===== */
const pastas = [
  { id: "ano2026xxxxxxx", name: "01 - 2026", parents: [RAIZ] },
  { id: "marketingxxxxx", name: "03 - Marketing", parents: [RAIZ] },
  { id: "ativosxxxxxxxx", name: "01 - Clientes Ativos", parents: ["ano2026xxxxxxx"] },
  { id: "avulsosxxxxxxx", name: "02 - Avulsos", parents: ["ano2026xxxxxxx"] },
  { id: "financeiroxxxx", name: "04 - Financeiro", parents: ["ano2026xxxxxxx"] },
  { id: "paesaggioxxxxx", name: "Cond. Ed. Paesaggio Villa Lobos", parents: ["ativosxxxxxxxx"] },
  { id: "claudiamorixxx", name: "Claudia Mori", parents: ["avulsosxxxxxxx"] },
  { id: "cobrancasxxxxx", name: "Cobranças", parents: ["financeiroxxxx"] },
];
const G = { copias: [], trocas: {}, lixeira: [], falharDocs: 0, tokens: 0 };
async function google(req) {
  const u = new URL(req.url);
  const j = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "Content-Type": "application/json" } });
  if (u.host === "oauth2.googleapis.com" && u.pathname === "/token") {
    const b = new URLSearchParams(await req.text());
    G.tokens++;
    if (b.get("client_secret") !== "segredo") return j({ error: "invalid_client" }, 401);
    if (b.get("grant_type") === "authorization_code") {
      const idt = "x." + btoa(JSON.stringify({ email: "atendimento@mfuji.com.br" })).replace(/=+$/, "") + ".y";
      return j({ access_token: "acesso1", expires_in: 3600, refresh_token: "refresh-secreto", scope: "openid https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/documents email", id_token: idt });
    }
    return j({ access_token: "acesso2", expires_in: 3600 });
  }
  if (u.host === "oauth2.googleapis.com" && u.pathname === "/revoke") return j({});
  if (!/^Bearer acesso/.test(req.headers.get("Authorization") || "")) return j({ error: { message: "sem token" } }, 401);
  if (u.host === "www.googleapis.com" && u.pathname === "/drive/v3/files" && req.method === "GET") {
    const pais = [...u.searchParams.get("q").matchAll(/'([\w-]+)' in parents/g)].map((m) => m[1]);
    return j({ files: pastas.filter((f) => pais.includes(f.parents[0])) });
  }
  let m = u.pathname.match(/^\/drive\/v3\/files\/([\w-]+)\/copy$/);
  if (m) {
    if (m[1] !== MODELO) return j({ error: { message: "não achei" } }, 404);
    const b = await req.json(), id = "doc" + (G.copias.length + 1) + "xxxxxxxxxx";
    G.copias.push({ id, ...b });
    return j({ id, name: b.name, webViewLink: "https://docs.google.com/document/d/" + id + "/edit" });
  }
  m = u.pathname.match(/^\/v1\/documents\/([\w-]+):batchUpdate$/);
  if (m) {
    if (G.falharDocs > 0) { G.falharDocs--; return j({ error: { message: "falhou" } }, 500); }
    G.trocas[m[1]] = Object.fromEntries((await req.json()).requests.map((r) => [r.replaceAllText.containsText.text, r.replaceAllText.replaceText]));
    return j({ replies: [] });
  }
  m = u.pathname.match(/^\/drive\/v3\/files\/([\w-]+)$/);
  if (m && req.method === "PATCH") { G.lixeira.push(m[1]); return j({ id: m[1] }); }
  return new Response("fora do Google simulado: " + req.url, { status: 599 });
}

/* ===== servidor local com o Google simulado ===== */
const simulado = createServer(async (rq, rs) => {
  const partes = []; for await (const x of rq) partes.push(x);
  const corpo = Buffer.concat(partes);
  const req = new Request("https://" + rq.url.slice(1), { method: rq.method, headers: rq.headers, body: corpo.length ? corpo : undefined });
  const r = await google(req);
  rs.writeHead(r.status, { "Content-Type": r.headers.get("Content-Type") || "text/plain" }); rs.end(await r.text());
}).listen(8791);
function sql(q) { return JSON.parse(execFileSync("npx", ["wrangler", "d1", "execute", "mfuji-db", "--local", "--json", "--command", q], { encoding: "utf8" }))[0].results; }
sql("DELETE FROM integracoes");
const vars = { GOOGLE_CLIENT_ID: "cliente.apps.googleusercontent.com", GOOGLE_CLIENT_SECRET: "segredo", DRIVE_RAIZ: RAIZ, OS_MODELO: MODELO, GOOGLE_TESTE: "http://127.0.0.1:8791" };
const dev = spawn("npx", ["wrangler", "dev", "--port", "8790", ...Object.entries(vars).flatMap(([k, v]) => ["--var", k + ":" + v])], { stdio: ["ignore", "pipe", "pipe"], detached: true });
await new Promise((ok, erro) => { const t = setTimeout(() => erro(new Error("wrangler dev não subiu")), 60000); dev.stdout.on("data", (d) => { if (/Ready on/.test(d)) { clearTimeout(t); ok(); } }); });
const BASE = "http://localhost:8790";
process.on("exit", () => { try { process.kill(-dev.pid); } catch {} });
process.on("uncaughtException", (e) => { console.log("FALHA", e.message); process.exit(1); });
if (process.env.LOG) dev.stdout.on("data", (d) => process.stdout.write("  [dev] " + d));
const DB = { prepare: (q) => ({ bind: (...a) => ({ first: (c) => { const r = sql(a.reduce((x, v) => x.replace("?", "'" + String(v).replace(/'/g, "''") + "'"), q))[0]; return r ? r[c] : null; } }), first: (c) => { const r = sql(q)[0]; return r ? r[c] : null; } }) };

const ok = [], ruim = [];
function check(nome, cond, extra = "") { (cond ? ok : ruim).push(nome); console.log((cond ? "OK   " : "FALHA") + " " + nome + (extra ? " · " + extra : "")); }
const browser = await chromium.launch({ ...(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {}) });
const ctx = await browser.newContext();
const p = await ctx.newPage();
p.on("pageerror", (e) => console.log("  [erro js]", e.message));
await p.goto(BASE + "/");
await p.fill("#email", EMAIL); await p.fill("#senha", SENHA); await p.click("#bt1");
await p.waitForTimeout(1500);
if (await p.$("#fTroca:not([hidden])")) { await p.fill("#nova", NOVA); await p.fill("#conf", NOVA); await p.click("#bt2"); }
await p.waitForURL(BASE + "/", { timeout: 20000 });
await p.waitForFunction(() => window.MF_BOOT && typeof CLIENTES !== "undefined");

/* 1) estado antes de conectar */
await p.goto(BASE + "/#cfg"); await p.waitForSelector("#intG a[href='/api/google/conectar']");
check("Configurações mostra Conectar para o administrador", true);
const semLigacao = await p.evaluate(async () => (await fetch("/api/drive/pastas")).status);
check("Lista de pastas recusa sem conexão", semLigacao === 409);

/* 2) conectar */
/* o botão Conectar leva ao Google; aqui o "Google" aceita na hora e devolve o código para o sistema */
const ida = await ctx.request.get(BASE + "/api/google/conectar", { maxRedirects: 0 });
const auth = new URL(ida.headers()["location"]);
check("Pede ao Google acesso ao Drive e aos Docs, offline", auth.host === "accounts.google.com" && /auth\/drive/.test(auth.searchParams.get("scope")) && /auth\/documents/.test(auth.searchParams.get("scope")) && auth.searchParams.get("access_type") === "offline");
const falso = await ctx.request.get(BASE + "/api/google/retorno?code=codigo&state=errado", { maxRedirects: 0 });
check("Retorno com estado errado é recusado", /google=erro/.test(falso.headers()["location"]));
const ida2 = await ctx.request.get(BASE + "/api/google/conectar", { maxRedirects: 0 });
await p.goto(BASE + "/api/google/retorno?code=codigo&state=" + new URL(ida2.headers()["location"]).searchParams.get("state"));
await p.waitForURL(/#cfg/, { timeout: 15000 }); await p.waitForSelector("#intG .pill.ok", { timeout: 10000 });
check("Conectado com a conta atendimento@", (await p.textContent("#intG")).includes("atendimento@mfuji.com.br"));
const guardado = await DB.prepare("SELECT valor FROM integracoes WHERE chave='google_refresh'").first("valor");
check("Autorização guardada só no servidor", guardado === "refresh-secreto");
const vazou = await p.evaluate(async () => JSON.stringify(await (await fetch("/api/dados")).json()) + document.documentElement.outerHTML);
check("Autorização não aparece nos dados nem na página", !vazou.includes("refresh-secreto"));
const ps = await p.evaluate(async () => (await (await fetch("/api/drive/pastas")).json()).pastas);
check("Pastas dos clientes lidas por ano e grupo (sem Financeiro)", ps.length === 2 && ps.some((f) => f.nome === "Claudia Mori" && f.grupo === "2026 / Avulsos"), JSON.stringify(ps.map((f) => f.grupo + " / " + f.nome)));

/* 3) clientes de teste */
const ids = await p.evaluate((tag) => {
  const a = { id: nid(CLIENTES), nome: "Condomínio Edifício Paesaggio Villa Lobos", razao: "Cond Ed Paesaggio " + tag, doc: "12.345.678/0001-90", end: "Rua X, 10 · Vila Leopoldina, São Paulo/SP", contato: "Marta (síndica)", tel: "(11) 99999-0000", email: "", perfil: "Condomínio" };
  CLIENTES.push(a);
  const b = { id: a.id + 1, nome: tag + " Mori", razao: "", doc: "", end: "", contato: "", tel: "", email: "", perfil: "Residencial" };
  CLIENTES.push(b); dbSave(); return [a.id, b.id];
}, TAG);
await p.waitForFunction(() => !SYNC.enviando && !dbOps().length, null, { timeout: 15000 });

/* 4) OS com a pasta encontrada pelo nome */
await p.goto(BASE + "/#os"); await p.waitForSelector("#oCli");
await p.fill("#oCli", "Condomínio Edifício Paesaggio Villa Lobos"); await p.dispatchEvent("#oCli", "input");
await p.waitForFunction(() => document.querySelector("#oDrive").textContent.includes("Paesaggio Villa Lobos") && document.querySelector("#oDrive").textContent.includes("Encontrada pelo nome"), null, { timeout: 10000 });
check("Pasta do cliente encontrada pelo nome", true, await p.textContent("#oDrive b"));
check("Botão diz que salva no Drive", (await p.textContent("#oGen")).includes("salvar no Drive"));
await p.fill("#oSv", "Dedetização e desratização das áreas comuns"); await p.fill("#oObs", "Retorno em 30 dias");
await p.click("#oGen");
await p.waitForFunction(() => OSL[0] && OSL[0][7] && OSL[0][7].doc, null, { timeout: 15000 });
const os1 = await p.evaluate(() => OSL[0]);
const c1 = G.copias[G.copias.length - 1];
check("Documento criado na pasta do cliente", c1.parents[0] === "paesaggioxxxxx" && c1.name === os1[0] + " - Termo de execução de serviço - Condomínio Edifício Paesaggio Villa Lobos", c1.name);
const t1 = G.trocas[c1.id] || {};
check("Campos do modelo preenchidos", t1["{{SERVICO}}"] === "DEDETIZAÇÃO E DESRATIZAÇÃO DAS ÁREAS COMUNS" && t1["{{OBS}}"] === "Retorno em 30 dias" && t1["{{RESPONSAVEL}}"] === "Marta" && t1["{{ENDERECO}}"] === "Rua X, 10, Vila Leopoldina, São Paulo/SP" && /de \w+ de 20\d\d$/.test(t1["{{DATA}}"]), JSON.stringify(t1));
check("Link do documento na lista de OS", !!(await p.$(`#osTb a[href="${os1[7].doc.url}"]`)));
await p.waitForFunction((id) => CLIENTES.find((c) => c.id === id).pastaId === "paesaggioxxxxx", ids[0], { timeout: 10000 }).catch(() => {});
const ligada = await DB.prepare("SELECT json_extract(dados,'$.pastaId') v FROM clientes WHERE chave = ?").bind(String(ids[0])).first("v");
check("Pasta fica guardada no cadastro do cliente", ligada === "paesaggioxxxxx");

/* 5) cliente sem pasta com o mesmo nome: escolhe na lista */
await p.fill("#oCli", TAG + " Mori"); await p.dispatchEvent("#oCli", "input");
await p.waitForFunction(() => document.querySelector("#oDrive").textContent.includes("não encontrada"), null, { timeout: 10000 });
check("Avisa quando não acha a pasta", true);
await p.fill("#oSv", "Desentupimento da pia"); await p.click("#oGen");
await p.waitForSelector("#drvModal:not([hidden]) [data-fold='claudiamorixxx']");
check("Abre a lista de pastas do Drive, com a mais parecida primeiro", (await p.getAttribute("#dvL li:first-child", "data-fold")) === "claudiamorixxx");
await p.click("[data-fold='claudiamorixxx']");
await p.waitForFunction((n) => OSL.length >= n && OSL[0][7] && OSL[0][7].doc && OSL[0][2].includes("Mori"), 2, { timeout: 15000 });
check("OS salva na pasta escolhida", G.copias[G.copias.length - 1].parents[0] === "claudiamorixxx");

/* 6) falha no Google: a OS fica registrada e dá para tentar de novo */
G.falharDocs = 1;
await p.fill("#oSv", "Limpeza da caixa d'água"); await p.click("#oGen");
await p.waitForFunction(() => document.querySelector("[data-osdrive]"), null, { timeout: 15000 });
check("OS registrada mesmo com o Google falhando", true);
check("Documento pela metade vai para a lixeira", G.lixeira.length === 1);
await p.click("[data-osdrive]");
await p.waitForFunction(() => OSL[0][7] && OSL[0][7].doc, null, { timeout: 15000 });
check("Salvar no Drive de novo funciona", G.copias[G.copias.length - 1].parents[0] === "claudiamorixxx");

/* 7) números seguidos, sem repetir */
const nums = await p.evaluate(() => OSL.slice(0, 3).map((o) => o[0]));
check("Números de OS seguidos", new Set(nums).size === 3, nums.join(", "));

/* 8) pasta inválida é recusada pelo servidor */
const inval = await p.evaluate(async (id) => (await fetch("/api/os", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ cli: id, servico: "x", pastaId: "cobrancasxxxxx" }) })).status, ids[1]);
check("Servidor recusa pasta fora das pastas de clientes", inval === 400);

/* 9) desconectar */
await p.goto(BASE + "/#cfg"); await p.waitForSelector("[data-gdesc]");
await p.click("[data-gdesc]"); await p.click("[data-gdesc]");
await p.waitForSelector("#intG a[href='/api/google/conectar']", { timeout: 10000 });
check("Desconectar apaga a autorização", !(await DB.prepare("SELECT valor FROM integracoes WHERE chave='google_refresh'").first("valor")));

/* limpeza: tira os registros de teste */
await p.evaluate((tag) => {
  for (let i = OSL.length - 1; i >= 0; i--) if (OSL[i][2].includes("Paesaggio Villa Lobos") || OSL[i][2].includes(tag)) OSL.splice(i, 1);
  for (let i = CLIENTES.length - 1; i >= 0; i--) if ((CLIENTES[i].razao || "").includes(tag) || CLIENTES[i].nome.includes(tag)) CLIENTES.splice(i, 1);
  dbSave();
}, TAG);
await p.waitForFunction(() => !SYNC.enviando && !dbOps().length, null, { timeout: 15000 });
await browser.close(); simulado.close();
console.log(`\n${ok.length} ok, ${ruim.length} falha(s)`);
process.exit(ruim.length ? 1 : 0);
