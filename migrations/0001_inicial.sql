-- Monte Fuji: estrutura inicial do banco compartilhado (Cloudflare D1)
-- Cada módulo tem a sua tabela. O registro completo fica em "dados" (JSON, no mesmo
-- formato que a tela usa) e as colunas principais são extraídas dele para consulta.
-- Nada é apagado de verdade: a exclusão marca "excluido" e guarda tudo no histórico.

CREATE TABLE usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  nome TEXT NOT NULL,
  iniciais TEXT NOT NULL,
  papel TEXT NOT NULL DEFAULT 'colaborador' CHECK (papel IN ('admin','colaborador','leitura')),
  senha_hash TEXT NOT NULL,
  senha_sal TEXT NOT NULL,
  senha_iter INTEGER NOT NULL,
  trocar_senha INTEGER NOT NULL DEFAULT 1,
  ativo INTEGER NOT NULL DEFAULT 1,
  falhas INTEGER NOT NULL DEFAULT 0,
  bloqueado_ate TEXT,
  criado_em TEXT NOT NULL DEFAULT (datetime('now')),
  ultimo_acesso TEXT
);

CREATE TABLE sessoes (
  token_hash TEXT PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  criado_em TEXT NOT NULL DEFAULT (datetime('now')),
  expira_em TEXT NOT NULL,
  agente TEXT
);
CREATE INDEX sessoes_usuario ON sessoes(usuario_id);

-- contador de versão: sobe a cada gravação e é o que as telas consultam para se atualizar
CREATE TABLE controle (chave TEXT PRIMARY KEY, valor INTEGER NOT NULL);
INSERT INTO controle (chave, valor) VALUES ('versao', 0);

CREATE TABLE clientes (
  chave TEXT PRIMARY KEY, dados TEXT NOT NULL, versao INTEGER NOT NULL, excluido INTEGER NOT NULL DEFAULT 0,
  criado_em TEXT NOT NULL DEFAULT (datetime('now')), criado_por INTEGER REFERENCES usuarios(id),
  atualizado_em TEXT NOT NULL DEFAULT (datetime('now')), atualizado_por INTEGER REFERENCES usuarios(id),
  nome TEXT GENERATED ALWAYS AS (json_extract(dados,'$.nome')) VIRTUAL,
  razao TEXT GENERATED ALWAYS AS (json_extract(dados,'$.razao')) VIRTUAL,
  documento TEXT GENERATED ALWAYS AS (json_extract(dados,'$.doc')) VIRTUAL,
  perfil TEXT GENERATED ALWAYS AS (json_extract(dados,'$.perfil')) VIRTUAL,
  email TEXT GENERATED ALWAYS AS (json_extract(dados,'$.email')) VIRTUAL
);
CREATE INDEX clientes_versao ON clientes(versao);
CREATE INDEX clientes_nome ON clientes(nome);
CREATE INDEX clientes_documento ON clientes(documento);

CREATE TABLE funcionarios (
  chave TEXT PRIMARY KEY, dados TEXT NOT NULL, versao INTEGER NOT NULL, excluido INTEGER NOT NULL DEFAULT 0,
  criado_em TEXT NOT NULL DEFAULT (datetime('now')), criado_por INTEGER REFERENCES usuarios(id),
  atualizado_em TEXT NOT NULL DEFAULT (datetime('now')), atualizado_por INTEGER REFERENCES usuarios(id),
  nome TEXT GENERATED ALWAYS AS (json_extract(dados,'$.nome')) VIRTUAL,
  cargo TEXT GENERATED ALWAYS AS (json_extract(dados,'$.cargo')) VIRTUAL,
  setor TEXT GENERATED ALWAYS AS (json_extract(dados,'$.setor')) VIRTUAL,
  nascimento TEXT GENERATED ALWAYS AS (json_extract(dados,'$.nasc')) VIRTUAL,
  aso TEXT GENERATED ALWAYS AS (json_extract(dados,'$.aso')) VIRTUAL
);
CREATE INDEX funcionarios_versao ON funcionarios(versao);

-- agenda: cada data de um agendamento é um registro; "grupo" junta as datas do mesmo agendamento
CREATE TABLE agenda (
  chave TEXT PRIMARY KEY, dados TEXT NOT NULL, versao INTEGER NOT NULL, excluido INTEGER NOT NULL DEFAULT 0,
  criado_em TEXT NOT NULL DEFAULT (datetime('now')), criado_por INTEGER REFERENCES usuarios(id),
  atualizado_em TEXT NOT NULL DEFAULT (datetime('now')), atualizado_por INTEGER REFERENCES usuarios(id),
  data TEXT GENERATED ALWAYS AS (json_extract(dados,'$.date')) VIRTUAL,
  hora INTEGER GENERATED ALWAYS AS (json_extract(dados,'$.h')) VIRTUAL,
  cliente TEXT GENERATED ALWAYS AS (json_extract(dados,'$.cli')) VIRTUAL,
  servico TEXT GENERATED ALWAYS AS (json_extract(dados,'$.s')) VIRTUAL,
  grupo TEXT GENERATED ALWAYS AS (json_extract(dados,'$.grp')) VIRTUAL,
  garantia_meses INTEGER GENERATED ALWAYS AS (json_extract(dados,'$.gar')) VIRTUAL
);
CREATE INDEX agenda_versao ON agenda(versao);
CREATE INDEX agenda_data ON agenda(data);
CREATE INDEX agenda_cliente ON agenda(cliente);

-- ordens de serviço: a tela guarda [número, data, cliente, serviço, técnico, valor, status]
CREATE TABLE ordens_servico (
  chave TEXT PRIMARY KEY, dados TEXT NOT NULL, versao INTEGER NOT NULL, excluido INTEGER NOT NULL DEFAULT 0,
  criado_em TEXT NOT NULL DEFAULT (datetime('now')), criado_por INTEGER REFERENCES usuarios(id),
  atualizado_em TEXT NOT NULL DEFAULT (datetime('now')), atualizado_por INTEGER REFERENCES usuarios(id),
  numero TEXT GENERATED ALWAYS AS (json_extract(dados,'$[0]')) VIRTUAL,
  data TEXT GENERATED ALWAYS AS (json_extract(dados,'$[1]')) VIRTUAL,
  cliente TEXT GENERATED ALWAYS AS (json_extract(dados,'$[2]')) VIRTUAL,
  servico TEXT GENERATED ALWAYS AS (json_extract(dados,'$[3]')) VIRTUAL,
  status TEXT GENERATED ALWAYS AS (json_extract(dados,'$[6]')) VIRTUAL
);
CREATE INDEX ordens_servico_versao ON ordens_servico(versao);
CREATE INDEX ordens_servico_cliente ON ordens_servico(cliente);

CREATE TABLE tarefas (
  chave TEXT PRIMARY KEY, dados TEXT NOT NULL, versao INTEGER NOT NULL, excluido INTEGER NOT NULL DEFAULT 0,
  criado_em TEXT NOT NULL DEFAULT (datetime('now')), criado_por INTEGER REFERENCES usuarios(id),
  atualizado_em TEXT NOT NULL DEFAULT (datetime('now')), atualizado_por INTEGER REFERENCES usuarios(id),
  titulo TEXT GENERATED ALWAYS AS (json_extract(dados,'$.t')) VIRTUAL,
  coluna TEXT GENERATED ALWAYS AS (json_extract(dados,'$.col')) VIRTUAL,
  prazo TEXT GENERATED ALWAYS AS (json_extract(dados,'$.due')) VIRTUAL,
  aviso_garantia TEXT GENERATED ALWAYS AS (json_extract(dados,'$.vk')) VIRTUAL
);
CREATE INDEX tarefas_versao ON tarefas(versao);
CREATE INDEX tarefas_aviso ON tarefas(aviso_garantia);

CREATE TABLE receber (
  chave TEXT PRIMARY KEY, dados TEXT NOT NULL, versao INTEGER NOT NULL, excluido INTEGER NOT NULL DEFAULT 0,
  criado_em TEXT NOT NULL DEFAULT (datetime('now')), criado_por INTEGER REFERENCES usuarios(id),
  atualizado_em TEXT NOT NULL DEFAULT (datetime('now')), atualizado_por INTEGER REFERENCES usuarios(id),
  cliente TEXT GENERATED ALWAYS AS (json_extract(dados,'$.nome')) VIRTUAL,
  documento TEXT GENERATED ALWAYS AS (json_extract(dados,'$.doc')) VIRTUAL,
  valor REAL GENERATED ALWAYS AS (json_extract(dados,'$.valor')) VIRTUAL,
  vencimento TEXT GENERATED ALWAYS AS (json_extract(dados,'$.venc')) VIRTUAL,
  pago_em TEXT GENERATED ALWAYS AS (json_extract(dados,'$.pago')) VIRTUAL,
  nota_fiscal TEXT GENERATED ALWAYS AS (json_extract(dados,'$.nf')) VIRTUAL
);
CREATE INDEX receber_versao ON receber(versao);
CREATE INDEX receber_vencimento ON receber(vencimento);

CREATE TABLE emails (
  chave TEXT PRIMARY KEY, dados TEXT NOT NULL, versao INTEGER NOT NULL, excluido INTEGER NOT NULL DEFAULT 0,
  criado_em TEXT NOT NULL DEFAULT (datetime('now')), criado_por INTEGER REFERENCES usuarios(id),
  atualizado_em TEXT NOT NULL DEFAULT (datetime('now')), atualizado_por INTEGER REFERENCES usuarios(id)
);
CREATE INDEX emails_versao ON emails(versao);

-- avisos de garantia já gerados (para a anotação de contato sair uma vez só)
CREATE TABLE avisos_garantia (
  chave TEXT PRIMARY KEY, dados TEXT NOT NULL, versao INTEGER NOT NULL, excluido INTEGER NOT NULL DEFAULT 0,
  criado_em TEXT NOT NULL DEFAULT (datetime('now')), criado_por INTEGER REFERENCES usuarios(id),
  atualizado_em TEXT NOT NULL DEFAULT (datetime('now')), atualizado_por INTEGER REFERENCES usuarios(id)
);
CREATE INDEX avisos_garantia_versao ON avisos_garantia(versao);

-- histórico de todas as alterações (quem, quando e como estava antes), para auditoria e recuperação
CREATE TABLE historico (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tabela TEXT NOT NULL,
  chave TEXT NOT NULL,
  acao TEXT NOT NULL CHECK (acao IN ('criar','alterar','excluir','importar')),
  dados_antes TEXT,
  dados_depois TEXT,
  usuario_id INTEGER REFERENCES usuarios(id),
  em TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX historico_registro ON historico(tabela, chave);
CREATE INDEX historico_em ON historico(em);
