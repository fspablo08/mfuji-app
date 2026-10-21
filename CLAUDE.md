# Regras para alterar o sistema Monte Fuji

- Os dados reais da empresa estão no D1 `mfuji-db` (id 5b7f760b-07f6-440b-8cec-79009bbe2aef). Nunca apague, recrie ou reescreva tabelas/dados de produção sem confirmação explícita do Pablo. Nunca use localStorage como fonte dos registros.
- Telas: edite `src/` e rode `python3 build.py` (o `public/` gerado vai junto no commit). Servidor: `worker/index.js`.
- As telas guardam os registros em arrays globais (CLIENTES, FUNC, OSL, EMAILS, TAREFAS, EVENTS, RECEBER, VK) e chamam `dbSave()`; `data.js` compara com o banco e envia só o que mudou. Uma coleção nova precisa entrar em `DB_KEYS` (data.js), em `COL` (worker) e ganhar tabela numa migração nova.
- Mudança de estrutura: crie `migrations/000N_descricao.sql` (só acrescentar: CREATE TABLE, ADD COLUMN, CREATE INDEX). Aplique em produção com o conector da Cloudflare (d1_database_query) ANTES do merge, e registre em `d1_migrations` (INSERT INTO d1_migrations (name) VALUES ('000N_descricao.sql')). O build da Cloudflare não roda migrações.
- Teste local antes de publicar: `npx wrangler d1 migrations apply mfuji-db --local`, `npx wrangler dev`, `test/e2e.mjs`.
- Publicar = merge na `main` (a Cloudflare faz o deploy do Worker `mfuji-app` sozinha). Confira com `/api/saude` (suba `APP_VERSAO` no worker a cada versão).
- Senhas e tokens nunca no código do navegador. Permissões sempre conferidas no servidor.
