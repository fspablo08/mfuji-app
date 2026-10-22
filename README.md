# Sistema Monte Fuji

Sistema interno da Monte Fuji (agenda, ordens de serviço, clientes, e-mails, a receber, funcionários),
com login individual e banco de dados compartilhado na Cloudflare (D1). Endereço: https://mfuji-app.pablovsfernandes.workers.dev

## Estrutura
- `src/`: telas (`shell.html`, `app.css`, `data.js`, `app1.js`, `app2.js`, `app3.js`) e a tela de login (`login.html`).
  `data.js` tem a ligação com o banco: carga inicial, envio das alterações e atualização automática.
- `build.py`: junta os fontes em `public/index.html` e `public/login.html`.
- `worker/index.js`: servidor (login, sessões, permissões, API dos dados, importação, backup diário).
- `migrations/`: estrutura do banco D1, um arquivo por mudança.
- `scripts/sql-novo-admin.mjs`: gera o SQL para criar ou recuperar um administrador.
- `test/e2e.mjs`: teste ponta a ponta com duas sessões.
- `wrangler.jsonc`: Worker `mfuji-app`, banco `mfuji-db`, KV `mfuji-backups` e o horário do backup.

## Rodar localmente
```
npm install
python3 build.py
npx wrangler d1 migrations apply mfuji-db --local
node scripts/sql-novo-admin.mjs "Teste" teste@mfuji.test > /tmp/admin.sql && npx wrangler d1 execute mfuji-db --local --file /tmp/admin.sql
npx wrangler dev        # http://localhost:8787
```

Publicação, usuários, backup e custos: `COMO-PUBLICAR.md`. Ligação com o Google Drive: `COMO-CONECTAR-GOOGLE.md`.

Teste do Google Drive com um Google simulado: `EMAIL=... SENHA=... node test/drive.mjs` (sobe o próprio `wrangler dev`).
