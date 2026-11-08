#!/usr/bin/env python3
"""Dependency-free static checks for PedidoClaro."""
from html.parser import HTMLParser
from pathlib import Path
import json, shutil, subprocess, sys
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
    required_files=["index.html","app.js","styles.css","manifest.webmanifest","sw.js","icon.svg"]
    for name in required_files:
        if not (ROOT/name).is_file(): raise SystemExit("Falta archivo requerido: "+name)
    source=(ROOT/"index.html").read_text(encoding="utf-8")
    js=(ROOT/"app.js").read_text(encoding="utf-8")
    sw=(ROOT/"sw.js").read_text(encoding="utf-8")
    manifest=json.loads((ROOT/"manifest.webmanifest").read_text(encoding="utf-8"))
    p=PageParser();p.feed(source)
    if p.lang!="es" or "PedidoClaro" not in "".join(p.title): raise SystemExit("Idioma o título incorrecto")
    required_ids=['id="order-list"','id="detail-panel"','id="parse-order"','id="activity-list"','id="view-guide"','id="import-csv"','id="backup-data"','id="restore-data"']
    missing=[x for x in required_ids if x not in source]
    if missing: raise SystemExit("Faltan controles: "+", ".join(missing))
    for token in ("pedidoclaro-demo-v2","function renderList","function renderDetail","function exportCsv","function parseText","function importCsvFile","function backupData","function restoreData","serviceWorker.register"):
        if token not in js: raise SystemExit("Falta funcionalidad JS: "+token)
    if "CACHE_NAME" not in sw or "PedidoClaro" not in manifest.get("name",""): raise SystemExit("PWA incompleta")
    for token in ('id="view-catalog"', 'id="catalog-import"', 'id="catalog-export"', 'id="product-dialog"'):
        if token not in source: raise SystemExit("Falta catálogo: "+token)
    for token in ("catalogSeed", "function renderCatalog", "function catalogCsvExport", "function catalogCsvImport", "catalog-file", "catalogProduct", "Precio distinto al catálogo", "data-catalog-apply", "data-product-edit", "editingCatalogSku", "duplicateSku", "Referencia repetida en el pedido", "product?.price??r.price", "const importBatch=", 'sourceRef=get("order")||"Importación sin número"', "sourceId:key", "v>999999"):
        if token not in js: raise SystemExit("Falta funcionalidad catálogo: "+token)
    if "datos ficticios" not in source.lower() or "no contiene ia" not in source.lower(): raise SystemExit("Faltan avisos de demo")
    node=shutil.which("node")
    if node:
        for name in ["app.js","sw.js"]:
            result=subprocess.run([node,"--check",str(ROOT/name)],text=True,capture_output=True)
            if result.returncode: print(result.stderr,file=sys.stderr); raise SystemExit(name+": error de sintaxis")
        for number,inline in enumerate(p.scripts,1):
            result=subprocess.run([node,"--check","-"],input=inline,text=True,capture_output=True)
            if result.returncode: print(result.stderr,file=sys.stderr); raise SystemExit(f"JavaScript inline {number}: error")
    print(f"OK: {len(p.ids)} IDs únicos, manifest válido, PWA offline, importación CSV, copias JSON y JavaScript.")
    if not node: print("Aviso: Node.js no disponible; sintaxis JS no comprobada.")
if __name__=="__main__": main()
