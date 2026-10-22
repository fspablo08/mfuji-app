-- Monte Fuji: ligação com o Google Drive (ordens de serviço salvas na pasta de cada cliente)
-- Guarda a autorização da conta Google da empresa. Só o servidor lê esta tabela; nada daqui vai para as telas.
CREATE TABLE integracoes (
  chave TEXT PRIMARY KEY,
  valor TEXT NOT NULL,
  atualizado_em TEXT NOT NULL DEFAULT (datetime('now')),
  atualizado_por INTEGER REFERENCES usuarios(id)
);
