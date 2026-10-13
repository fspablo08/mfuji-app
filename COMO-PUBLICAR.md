# Como publicar o sistema Monte Fuji (Cloudflare)

O sistema roda no Worker **mfuji** da Cloudflare (`mfuji.pablovsfernandes.workers.dev`).

## Publicação automática pelo GitHub (uma vez só)
1. Em https://dash.cloudflare.com, abra **Workers e Pages** > **mfuji** > **Settings**.
2. Em **Build** > **Git repository**, clique em **Connect** e autorize o GitHub.
3. Escolha o repositório `fspablo08/mfuji-app`, branch `main`.
4. Deixe o comando de build vazio. O comando de deploy fica `npx wrangler deploy` (o padrão). Salve.

A partir daí, cada mudança enviada para a branch `main` vira uma nova publicação sozinha, em mais ou menos um minuto.
O andamento aparece na aba **Deployments** do Worker.

## Trancar o acesso (antes de usar com dados reais)
O endereço workers.dev é público. No Worker **mfuji**, aba **Access** (ou **Settings** > **Domains & Routes** > workers.dev > Cloudflare Access), ative o acesso e permita só os e-mails da equipe, por exemplo `@mfuji.com.br`. Cada pessoa entra com um código enviado por e-mail. Grátis até 50 usuários.

## Endereço próprio (opcional)
Na aba **Domains**, adicione por exemplo `sistema.mfuji.com.br`. O domínio precisa estar gerenciado na Cloudflare.

## Publicação manual (alternativa)
No Worker **mfuji**, **New deployment** e arraste o arquivo `public/index.html`.

## Onde ficam os dados
- O sistema começa vazio. Tudo o que for cadastrado fica salvo no navegador do computador onde foi feito.
- Outro computador ou outro navegador não vê esses dados, e limpar o histórico do navegador apaga tudo.
- Em **Configurações** > **Backup dos dados**, use **Baixar backup** com frequência. **Restaurar backup** carrega o arquivo em outro computador.
- A consulta de CNPJ já é real (Receita Federal pela BrasilAPI). Drive, Gmail e Conta Azul ainda não estão conectados.

O próximo passo para a equipe toda usar os mesmos dados é o banco de dados (Cloudflare D1).
