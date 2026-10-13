# Sistema Monte Fuji

Sistema interno da Monte Fuji (agenda, ordens de serviço, clientes, e-mails, a receber, funcionários).
Hoje é o protótipo navegável: dados de exemplo e integrações (Drive, Conta Azul, CNPJ, e-mail) simuladas.

## Estrutura
- `src/`: código-fonte (`shell.html`, `app.css`, `data.js`, `app1.js`, `app2.js`).
- `build.py`: junta os fontes em `public/index.html`.
- `public/index.html`: a página publicada.
- `wrangler.jsonc`: configuração do Worker `mfuji` na Cloudflare (serve a pasta `public/`).

## Publicação
Com o repositório ligado ao Worker `mfuji` na Cloudflare, cada envio para a branch `main` publica sozinho.
Detalhes em `COMO-PUBLICAR.md`.

Depois de mudar algo em `src/`, rode `python3 build.py` e envie `public/index.html` junto.
