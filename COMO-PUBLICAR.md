# Sistema Monte Fuji: publicação, usuários e backup

Endereço: **https://mfuji-app.pablovsfernandes.workers.dev**

## Como funciona
- **Servidor**: Worker `mfuji-app` na Cloudflare (código em `worker/index.js`). Ele entrega as telas só depois do login e responde a API dos dados.
- **Banco de dados**: Cloudflare D1, banco `mfuji-db` (id `5b7f760b-07f6-440b-8cec-79009bbe2aef`), região leste da América do Norte. Uma tabela por módulo: `clientes`, `funcionarios`, `agenda`, `ordens_servico`, `tarefas`, `receber`, `emails`, `avisos_garantia`, além de `usuarios`, `sessoes`, `historico` e `controle`. A estrutura está em `migrations/`.
- **Backups automáticos**: KV `mfuji-backups`, uma cópia completa por dia às 3h (Brasília), guardada por 60 dias, e outra antes de cada importação.
- **Atualização entre usuários**: cada tela pergunta ao servidor a cada 5 segundos (15 s quando parada, pausa com a aba escondida) se algo mudou e se redesenha sozinha. Uma mudança feita por uma pessoa aparece para as outras em até uns 5 a 10 segundos. Se a pessoa estiver digitando ou com uma janela aberta, a tela espera ela terminar para se redesenhar.
- **Nada some de verdade**: excluir marca o registro como excluído e guarda como estava na tabela `historico` (quem, quando, antes e depois).

## Usuários
- Configurações › **Usuários** › **Novo usuário** (só administrador). O sistema mostra uma senha temporária uma única vez, com botão para copiar as instruções. No primeiro acesso a pessoa cria a senha dela.
- Perfis: **Administrador** (tudo, inclusive usuários e backups), **Colaborador** (usa todo o sistema), **Somente consulta** (vê, não altera). As permissões são verificadas no servidor.
- Esqueceu a senha: abra o usuário e clique em **Redefinir senha**. Para tirar o acesso de alguém, **Desativar acesso** (a pessoa é desconectada na hora).
- Bloqueio: 5 senhas erradas seguidas travam a conta por 15 minutos.
- Se o único administrador perder o acesso: rode `node scripts/sql-novo-admin.mjs "Nome" email` e execute o SQL gerado no banco (painel do D1 › Console, ou pelo Claude com o conector da Cloudflare).

## Publicar uma nova versão (pelo Claude)
1. Peça a mudança ao Claude neste projeto. Ele altera os arquivos em `src/` (telas) ou `worker/` (servidor), roda `python3 build.py` e testa localmente (`npx wrangler dev` + `test/e2e.mjs`).
2. Se a mudança precisar de coluna ou tabela nova, ele cria um arquivo novo em `migrations/` (nunca edita os antigos) e aplica no banco de produção **antes** de publicar, com o conector da Cloudflare. Migrações só acrescentam; nada que apague dados é feito sem a sua confirmação.
3. Ele envia para a branch `main` do GitHub (`fspablo08/mfuji-app`). A Cloudflare publica sozinha em cerca de 1 minuto (Workers & Pages › mfuji-app › Deployments).
4. Os dados não são afetados pela publicação: ficam no banco, separados do código.

Conferir se a versão nova entrou: abrir `/api/saude` no navegador mostra a versão do servidor.

## Backup e recuperação
- **Baixar agora**: Configurações › Banco de dados e backup › **Baixar backup agora** (arquivo .json com tudo).
- **Backups automáticos**: mesmo cartão › **Backups automáticos** › Baixar.
- **Restaurar**: **Restaurar de um arquivo**. Mostra antes o que vai entrar; só acrescenta o que não existe, sem apagar nem sobrescrever.
- **Voltar o banco inteiro para um momento do passado** (ex.: algo foi apagado em massa): D1 Time Travel, minuto a minuto (7 dias no plano gratuito, 30 no pago). No terminal: `npx wrangler d1 time-travel restore mfuji-db --timestamp=2026-10-21T12:00:00-03:00`. Isso substitui o banco atual pelo daquele momento, então baixe um backup antes. O Claude pode fazer isso por você, com a sua confirmação.
- **Desfazer uma alteração específica**: a tabela `historico` guarda o antes e o depois de cada mudança.

## Custos
Tudo roda no plano gratuito da Cloudflare: Workers (100 mil requisições por dia), D1 (5 GB, 5 milhões de leituras e 100 mil gravações por dia) e KV. Com a atualização automática, cada pessoa com o sistema aberto e em uso faz cerca de 720 requisições por hora. Até umas 12 pessoas usando o dia inteiro cabe no gratuito. Passando disso, o plano Workers Paid custa US$ 5 por mês e cobre muito mais.

## Endereço próprio (opcional)
Em Workers & Pages › mfuji-app › Settings › Domains & Routes, adicione por exemplo `sistema.mfuji.com.br` (o domínio precisa estar na Cloudflare).
