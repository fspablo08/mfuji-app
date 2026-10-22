# Ligar o sistema ao Google Drive (ordens de serviço)

Depois de ligado, ao clicar em **Gerar OS e salvar no Drive** o sistema cria o *Termo de execução de serviço*
como documento Google, no modelo da Monte Fuji, dentro da pasta do cliente em
**Monte Fuji Dedetizadora e Desentupidora › 01 - 2026 › (Clientes Ativos, Avulsos ou Orçamentos) › cliente**.

Os conectores do Google que você usa no Claude servem só ao Claude. O sistema precisa da própria autorização,
feita uma vez com a conta **atendimento@mfuji.com.br** (dona das pastas). Leva uns 10 minutos e é gratuito.

## 1. Google Cloud (uma vez)
Entre em https://console.cloud.google.com com **atendimento@mfuji.com.br**.

1. No topo, **Selecionar projeto › Novo projeto**. Nome: `Sistema Monte Fuji`. Criar e selecionar.
2. **APIs e serviços › Biblioteca**: procure e clique em **Ativar** em **Google Drive API** e em **Google Docs API**.
3. Menu **Google Auth Platform** (ou "Tela de permissão OAuth") › **Primeiros passos**:
   - Nome do app: `Sistema Monte Fuji`; e-mail de suporte: atendimento@mfuji.com.br.
   - Público: **Interno** (aparece quando mfuji.com.br é Google Workspace; é o melhor, sem aviso e sem prazo).
   - Se só aparecer **Externo** (conta Google comum): escolha Externo e, depois de criar, vá em **Público** e clique em
     **Publicar app** (em produção). Sem publicar, a autorização vence a cada 7 dias. Na hora de conectar o Google vai
     mostrar "app não verificado": clique em **Avançado › Acessar Sistema Monte Fuji**. É o seu próprio app.
4. **Clientes › Criar cliente**:
   - Tipo: **Aplicativo da Web**. Nome: `mfuji-app`.
   - **URIs de redirecionamento autorizados**: `https://mfuji-app.pablovsfernandes.workers.dev/api/google/retorno`
     (se um dia usar um endereço próprio, acrescente também `https://SEU-ENDERECO/api/google/retorno`).
   - Criar. Copie o **ID do cliente** e a **Chave secreta do cliente**.

## 2. Cloudflare (uma vez)
dash.cloudflare.com › **Workers & Pages › mfuji-app › Settings › Variables and Secrets › Add**:
- Tipo **Secret**, nome `GOOGLE_CLIENT_ID`, valor: o ID do cliente.
- Tipo **Secret**, nome `GOOGLE_CLIENT_SECRET`, valor: a chave secreta.
- **Deploy**.

A chave secreta fica só na Cloudflare: nunca no código nem no GitHub (o repositório é público).

## 3. No sistema (uma vez)
Entre como administrador › **Configurações › Integrações › Google Drive › Conectar**. Entre com
**atendimento@mfuji.com.br** e marque todas as permissões. Pronto: aparece "Conectado".

## Como fica o dia a dia
1. **Ordens de serviço** › escolha o cliente. A pasta dele é encontrada pelo nome
   ("Cond. Ed. Paesaggio Villa Lobos" casa com "Condomínio Edifício Paesaggio Villa Lobos").
   Se não achar, clique em **Escolher pasta**, uma vez só: o sistema guarda no cadastro do cliente.
2. Descreva o serviço, observações e data.
3. **Gerar OS e salvar no Drive**. O documento `OS-2026-0001 - Termo de execução de serviço - Cliente`
   aparece na pasta do cliente e o link fica na lista de OS (botão **Abrir**).
4. Se o Google falhar, a OS fica registrada mesmo assim e aparece o botão **Salvar no Drive** para tentar de novo.

## Detalhes
- Modelo usado: **05 - Modelos › Modelo do sistema - Termo de execução de serviço (OS)**. Dá para mudar a aparência
  à vontade, desde que os campos entre chaves continuem lá: `{{NOME}}`, `{{DOC}}`, `{{ENDERECO}}`, `{{RESPONSAVEL}}`,
  `{{TELEFONE}}`, `{{SERVICO}}`, `{{OBS}}`, `{{DATA}}`. Não apague nem mova o modelo (o sistema usa o id dele, em `wrangler.jsonc`).
- Pastas que o sistema lista: as de clientes dentro de cada pasta de ano (`01 - 2026`, `01 - 2027`...), menos Financeiro.
  Quando criar a pasta de 2027, as pastas novas entram sozinhas.
- Desconectar: Configurações › Integrações › Google Drive › Desconectar (a autorização é apagada e revogada no Google).
- A autorização fica só no servidor (tabela `integracoes` do banco), nunca vai para o navegador.
