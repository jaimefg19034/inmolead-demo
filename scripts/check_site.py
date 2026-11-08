#!/usr/bin/env python3
"""Dependency-free static checks for PedidoClaro."""
from html.parser import HTMLParser
from pathlib import Path
import shutil, subprocess, sys
ROOT=Path(__file__).resolve().parents[1]
class PageParser(HTMLParser):
    def __init__(self):
        super().__init__(); self.ids=set(); self.lang=None; self.title=[]; self.in_title=False; self.scripts=[]; self.in_script=False; self.script=[]
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if tag=="html": self.lang=a.get("lang")
        if "id" in a:
            if a["id"] in self.ids: raise ValueError("ID duplicado: "+a["id"])
            self.ids.add(a["id"])
        if tag=="title": self.in_title=True
        if tag=="script" and not a.get("src"): self.in_script=True; self.script=[]
    def handle_endtag(self,tag):
        if tag=="title": self.in_title=False
        if tag=="script" and self.in_script: self.scripts.append("".join(self.script)); self.in_script=False
    def handle_data(self,data):
        if self.in_title:self.title.append(data)
        if self.in_script:self.script.append(data)
def main():
    page=ROOT/"index.html"; app=ROOT/"app.js"; css=ROOT/"styles.css"
    for p in (page,app,css):
        if not p.is_file(): raise SystemExit("Falta archivo requerido: "+str(p.relative_to(ROOT)))
    source=page.read_text(encoding="utf-8"); js=app.read_text(encoding="utf-8")
    p=PageParser();p.feed(source)
    if p.lang!="es" or "PedidoClaro" not in "".join(p.title): raise SystemExit("Idioma o título incorrecto")
    required=['id="order-list"','id="detail-panel"','id="parse-order"','id="activity-list"','id="view-guide"']
    missing=[x for x in required if x not in source]
    if missing: raise SystemExit("Faltan controles: "+", ".join(missing))
    for token in ("pedidoclaro-demo-v2","function renderList","function renderDetail","function exportCsv","function parseText","addEventListener"):
        if token not in js: raise SystemExit("Falta funcionalidad JS: "+token)
    if "datos ficticios" not in source.lower() or "no contiene ia" not in source.lower(): raise SystemExit("Faltan avisos de demo")
    node=shutil.which("node")
    if node:
        result=subprocess.run([node,"--check",str(app)],text=True,capture_output=True)
        if result.returncode: print(result.stderr,file=sys.stderr); raise SystemExit("JavaScript: error de sintaxis")
        for number,inline in enumerate(p.scripts,1):
            result=subprocess.run([node,"--check","-"],input=inline,text=True,capture_output=True)
            if result.returncode: print(result.stderr,file=sys.stderr); raise SystemExit(f"JavaScript inline {number}: error")
    print(f"OK: HTML válido a nivel estructural, {len(p.ids)} IDs únicos, app.js y styles.css presentes.")
    if not node: print("Aviso: Node.js no disponible; sintaxis JS no comprobada.")
if __name__=="__main__": main()
