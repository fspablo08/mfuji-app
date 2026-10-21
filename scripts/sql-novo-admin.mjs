// Gera o SQL para criar (ou recuperar) um administrador com senha temporária.
// Uso: node scripts/sql-novo-admin.mjs "Nome" email@exemplo.com
// Rode o SQL no banco (painel do D1 ou wrangler d1 execute). No primeiro acesso o sistema pede uma senha nova.
import { webcrypto as crypto } from "node:crypto";

const [nome, email] = process.argv.slice(2);
if (!nome || !email) { console.error('uso: node scripts/sql-novo-admin.mjs "Nome" email'); process.exit(1); }
const abc = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const senha = [...crypto.getRandomValues(new Uint8Array(12))].map((x) => abc[x % abc.length]).join("").replace(/(.{4})(?!$)/g, "$1-");
const sal = crypto.getRandomValues(new Uint8Array(16));
const iter = 100000;
const chave = await crypto.subtle.importKey("raw", new TextEncoder().encode(senha), "PBKDF2", false, ["deriveBits"]);
const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: sal, iterations: iter }, chave, 256);
const b64 = (b) => Buffer.from(b).toString("base64");
const p = nome.trim().split(/\s+/);
const ini = (p[0][0] + (p.length > 1 ? p[p.length - 1][0] : p[0][1] || "")).toUpperCase();
const q = (s) => "'" + String(s).replace(/'/g, "''") + "'";
console.log(`-- senha temporária: ${senha}`);
console.log(`INSERT INTO usuarios (email, nome, iniciais, papel, senha_hash, senha_sal, senha_iter, trocar_senha) VALUES (${q(email.toLowerCase())}, ${q(nome)}, ${q(ini)}, 'admin', ${q(b64(bits))}, ${q(b64(sal))}, ${iter}, 1)
ON CONFLICT (email) DO UPDATE SET papel = 'admin', ativo = 1, senha_hash = excluded.senha_hash, senha_sal = excluded.senha_sal, senha_iter = excluded.senha_iter, trocar_senha = 1, falhas = 0, bloqueado_ate = NULL;`);
