"""Junta os arquivos de src/ nas páginas publicadas em public/.

- public/index.html: o sistema (o servidor só entrega depois do login, já com os dados do banco)
- public/login.html: a tela de entrada

Uso: python3 build.py
"""
import re
from pathlib import Path

raiz = Path(__file__).parent
src = raiz / "src"
pub = raiz / "public"

head = (
    '<!doctype html>\n<html lang="pt-BR">\n<head>\n<meta charset="utf-8">\n'
    '<meta name="viewport" content="width=device-width, initial-scale=1">\n'
)

page = (src / "shell.html").read_text(encoding="utf-8")
css = (src / "app.css").read_text(encoding="utf-8")
js = "\n".join((src / f).read_text(encoding="utf-8") for f in ("data.js", "app1.js", "app2.js", "app3.js"))
page = page.replace("/*CSS*/", css).replace("/*JS*/", js)
pub.mkdir(exist_ok=True)
(pub / "index.html").write_text(head + page + "\n</html>\n", encoding="utf-8")

logo = re.search(r'var LOGO="([^"]+)"', (src / "data.js").read_text(encoding="utf-8")).group(1)
login = (src / "login.html").read_text(encoding="utf-8").replace("/*LOGO*/", logo)
(pub / "login.html").write_text(head + login + "\n</html>\n", encoding="utf-8")
print("ok:", pub / "index.html", pub / "login.html")
