"""Junta os arquivos de src/ em public/index.html (o que a Cloudflare publica).

Uso: python3 build.py
"""
from pathlib import Path

src = Path(__file__).parent / "src"
out = Path(__file__).parent / "public" / "index.html"

page = (src / "shell.html").read_text(encoding="utf-8")
css = (src / "app.css").read_text(encoding="utf-8")
js = "\n".join((src / f).read_text(encoding="utf-8") for f in ("data.js", "app1.js", "app2.js"))
page = page.replace("/*CSS*/", css).replace("/*JS*/", js)

head = (
    '<!doctype html>\n<html lang="pt-BR">\n<head>\n<meta charset="utf-8">\n'
    '<meta name="viewport" content="width=device-width, initial-scale=1">\n'
)
out.parent.mkdir(exist_ok=True)
out.write_text(head + page + "\n</html>\n", encoding="utf-8")
print("ok:", out)
