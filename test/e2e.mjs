// Teste ponta a ponta (login, cadastro/edição/exclusão, persistência, duas sessões e atualização automática).
// Precisa do Playwright: npm i --no-save playwright && BASE=http://localhost:8787 EMAIL=... SENHA=... node test/e2e.mjs
// Cria registros marcados com "ZZ-TESTE-CLAUDE" e usuários zz.*@mfuji.test, e apaga os registros no final.
import { chromium } from "playwright";

const BASE = process.env.BASE;
const EMAIL = process.env.EMAIL, SENHA = process.env.SENHA;
const TAG = "ZZ-TESTE-CLAUDE " + Date.now().toString(36);
const browser = await chromium.launch({ ...(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {}) });
const ok = [], ruim = [];
function check(nome, cond, extra = "") { (cond ? ok : ruim).push(nome + (extra ? " · " + extra : "")); console.log((cond ? "OK   " : "FALHA") + " " + nome + (extra ? " · " + extra : "")); }
async function espera(page, fn, arg, ms = 25000) { const t0 = Date.now(); try { await page.waitForFunction(fn, arg, { timeout: ms, polling: 250 }); return Date.now() - t0; } catch { return -1; } }

async function entrar(ctx, email, senha, nova) {
  const p = await ctx.newPage();
  p.on("pageerror", (e) => console.log("  [erro js]", e.message));
  await p.goto(BASE + "/");
  await p.fill("#email", email); await p.fill("#senha", senha); await p.click("#bt1");
  if (nova) { await p.waitForSelector("#fTroca:not([hidden])"); await p.fill("#nova", nova); await p.fill("#conf", nova); await p.click("#bt2"); }
  await p.waitForURL(BASE + "/", { timeout: 20000 });
  await p.waitForFunction(() => window.MF_BOOT && typeof CLIENTES !== "undefined");
  return p;
}

// 0) sem login
const anon = await browser.newContext();
const pa = await anon.newPage();
const r0 = await pa.goto(BASE + "/");
check("Endereço público responde e pede login", pa.url().includes("/login") && r0.ok());
const api0 = await pa.evaluate(async () => (await fetch("/api/dados")).status);
check("API recusa acesso sem login", api0 === 401, "status " + api0);
const html0 = await pa.evaluate(async () => (await fetch("/index.html", { redirect: "manual" })).type);
check("Página do sistema não é entregue sem login", html0 === "opaqueredirect");
await pa.fill("#email", EMAIL); await pa.fill("#senha", "senha-errada-123"); await pa.click("#bt1");
await pa.waitForSelector("#err1:not([hidden])");
check("Senha errada é recusada", (await pa.textContent("#err1")).includes("incorretos"));
await anon.close();

// 1) sessão A (administrador)
const ctxA = await browser.newContext();
const A = await entrar(ctxA, EMAIL, SENHA);
check("Login do administrador", await A.evaluate(() => EU.papel === "admin"));

// cria um colaborador B pela API do administrador (mesmo caminho da tela Configurações › Usuários)
const emailB = "zz.teste." + Date.now().toString(36) + "@mfuji.test";
const nb = await A.evaluate(async (e) => (await api("POST", "/api/usuarios", { nome: "ZZ Teste Colaborador", email: e, papel: "colaborador" })), emailB);
check("Administrador cria colaborador com senha temporária", !!nb.senha_temporaria);
const ctxB = await browser.newContext();
const B = await entrar(ctxB, emailB, nb.senha_temporaria, "SenhaDoB-2026");
check("Colaborador entra e troca a senha no primeiro acesso", await B.evaluate(() => EU.papel === "colaborador"));
const ub = await B.evaluate(async () => { try { await api("GET", "/api/backup"); return "permitiu"; } catch (e) { return e.status; } });
check("Colaborador não acessa backup completo (permissão no servidor)", ub === 403, String(ub));

// 2) cadastro pela tela (A) -> aparece sozinho em B
await A.evaluate(() => { location.hash = "#cli"; });
await A.evaluate((n) => openCliModal(n), TAG);
await A.fill("#ncDoc", "");
await A.fill("#ncCon", "Contato Teste");
await A.fill("#ncEm", "teste@mfuji.test");
await A.click("#ncSave");
await B.evaluate(() => { location.hash = "#cli"; });
const t1 = await espera(B, (n) => CLIENTES.some((c) => c.nome === n) && document.querySelector("#cTb").textContent.includes(n), TAG);
check("Cadastro feito em A aparece em B sem recarregar", t1 >= 0, t1 >= 0 ? `${(t1 / 1000).toFixed(1)} s` : "não apareceu");

// 3) edição em B -> A
await B.evaluate((n) => { const c = CLIENTES.find((x) => x.nome === n); CLI_SEL = c.id; CLI_OPEN = true; VIEWS.cli.show(); }, TAG);
await B.click("[data-cedit]");
await B.fill("#ncCon", "Contato Editado");
await B.click("#ncSave");
const t2 = await espera(A, (n) => { const c = CLIENTES.find((x) => x.nome === n); return c && c.contato === "Contato Editado"; }, TAG);
check("Edição feita em B aparece em A", t2 >= 0, t2 >= 0 ? `${(t2 / 1000).toFixed(1)} s` : "");

// 4) agendamento e anotação (A) -> B
await A.evaluate((n) => { EVENTS.push({ id: "g" + Date.now() + "-0", grp: "gz", date: TD, h: 9, dur: 1, s: "Dedetização", svs: ["Dedetização"], cli: n, gar: 3, obs: "teste" }); TAREFAS.push({ id: nid(TAREFAS), col: "todo", t: n + " nota", d: "", due: "", who: EU.iniciais, done: false }); dbSave(); }, TAG);
const t3 = await espera(B, (n) => EVENTS.some((e) => e.cli === n) && TAREFAS.some((t) => t.t === n + " nota"), TAG);
check("Agendamento e anotação de A chegam em B", t3 >= 0, t3 >= 0 ? `${(t3 / 1000).toFixed(1)} s` : "");

// 5) OS ao mesmo tempo nas duas sessões: ninguém sobrescreve ninguém
const [osA, osB] = await Promise.all([A, B].map((P, i) => P.evaluate(([n, i]) => { const no = nextOS(); OSL.unshift([no, TD, n, i ? "Desratização" : "Dedetização", "—", 0, "Aguardando assinatura"]); dbSave(); return no; }, [TAG, i])));
const t4 = await espera(A, (n) => OSL.filter((o) => o[2] === n).length === 2, TAG);
const t4b = await espera(B, (n) => OSL.filter((o) => o[2] === n).length === 2, TAG);
const nums = await A.evaluate((n) => OSL.filter((o) => o[2] === n).map((o) => o[0]), TAG);
check("Duas OS criadas ao mesmo tempo ficam as duas, com números diferentes", t4 >= 0 && t4b >= 0 && new Set(nums).size === 2, `${osA}/${osB} -> ${nums.join(", ")}`);

// 6) exclusão em A -> some em B
await A.evaluate((n) => { const c = CLIENTES.find((x) => x.nome === n); CLI_SEL = c.id; CLI_OPEN = true; location.hash = "#cli"; VIEWS.cli.show(); }, TAG);
await A.click("[data-cedit]");
await A.click("#ncDel"); await A.click("#ncDel");
const t5 = await espera(B, (n) => !CLIENTES.some((c) => c.nome === n), TAG);
check("Exclusão feita em A some em B", t5 >= 0, t5 >= 0 ? `${(t5 / 1000).toFixed(1)} s` : "");

// 7) persistência: sair e entrar de novo
await A.evaluate((n) => { RECEBER.push({ id: nid(RECEBER), nome: n, doc: "—", contato: "—", tel: "—", email: "—", serv: "Teste", os: "", valor: 1, nf: "", nfData: "", cob: "", canal: "", forma: "Pix", venc: TD, pago: "", hist: [], obs: "" }); dbSave(); }, TAG);
await A.waitForFunction(() => !SYNC.enviando && dbOps().length === 0);
await A.evaluate(() => api("POST", "/api/logout", {}));
await ctxA.close();
const ctxA2 = await browser.newContext();
const A2 = await entrar(ctxA2, EMAIL, SENHA);
const pers = await A2.evaluate((n) => ({ ev: EVENTS.some((e) => e.cli === n), rec: RECEBER.some((r) => r.nome === n), cli: CLIENTES.some((c) => c.nome === n), os: OSL.filter((o) => o[2] === n).length }), TAG);
check("Dados continuam após sair e entrar (outro navegador limpo)", pers.ev && pers.rec && !pers.cli && pers.os === 2, JSON.stringify(pers));

// 8) somente consulta: o servidor recusa gravação
const emailC = "zz.leitura." + Date.now().toString(36) + "@mfuji.test";
const nc = await A2.evaluate(async (e) => api("POST", "/api/usuarios", { nome: "ZZ Teste Leitura", email: e, papel: "leitura" }), emailC);
const ctxC = await browser.newContext();
const C = await entrar(ctxC, emailC, nc.senha_temporaria, "SenhaDoC-2026");
const sc = await C.evaluate(async () => { try { await api("POST", "/api/sync", { ops: [{ c: "VK", k: "x", d: "\"x\"" }] }); return "gravou"; } catch (e) { return e.status; } });
check("Perfil somente consulta não consegue gravar", sc === 403, String(sc));

if (process.env.LIMPAR !== "0") {
  // limpeza dos registros de teste (pela própria API, fica no histórico)
  await A2.evaluate((n) => {
    for (const k of ["EVENTS", "TAREFAS", "RECEBER"]) { const a = window[k]; for (let i = a.length - 1; i >= 0; i--) { const x = a[i]; if ((x.cli || x.nome || x.t || "").startsWith(n)) a.splice(i, 1); } }
    for (let i = OSL.length - 1; i >= 0; i--) if (OSL[i][2] === n) OSL.splice(i, 1);
    dbSave();
  }, TAG);
  await A2.waitForFunction(() => !SYNC.enviando && dbOps().length === 0);
  const sobra = await A2.evaluate(async (n) => { const d = await api("GET", "/api/dados"); return JSON.stringify(d.dados).includes(n); }, TAG);
  check("Registros de teste removidos", !sobra);
}
console.log(JSON.stringify({ emails_teste: [emailB, emailC], tag: TAG }));
console.log(`\n${ok.length} ok, ${ruim.length} falha(s)`);
await browser.close();
process.exit(ruim.length ? 1 : 0);
