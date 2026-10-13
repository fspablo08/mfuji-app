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

## O que já funciona e o que ainda não
Hoje é o protótipo navegável:
- os dados de exemplo vêm junto com a página;
- o que alguém cadastra fica salvo só naquele navegador e não aparece para os colegas;
- Drive, Conta Azul, consulta de CNPJ e e-mails são simulados.

O próximo passo para uso real é um banco de dados (Cloudflare D1) para a equipe compartilhar os mesmos dados.
