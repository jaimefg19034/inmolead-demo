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
    required_ids=['id="order-list"','id="detail-panel"','id="parse-order"','id="activity-list"','id="view-guide"','id="import-csv"','id="backup-data"','id="restore-data"','id="export-all-xlsx"','id="catalog-export-xlsx"','id="catalog-template"','id="import-preview-confirm"','id="import-preview-content"','id="view-clients"','id="view-analytics"','id="clients-table-body"','id="analytics-kpis"','id="analytics-status"','id="analytics-top-clients"']
    missing=[x for x in required_ids if x not in source]
    if missing: raise SystemExit("Faltan controles: "+", ".join(missing))
    for token in ("pedidoclaro-demo-v2","function renderList","function renderDetail","function exportCsv", "function zipStore", "function downloadXlsx", "function exportOrdersXlsx", "function exportCatalogXlsx", "function downloadImportErrors", "function validateCsvHeaders", "async function showImportPreview", "import-preview-dialog", "function parseNumber", "lastIndexOf(",")", "encabezados repetidos o ambiguos", "seenSkus=new Set()", "SKU duplicado dentro del mismo CSV", "Número de columnas distinto al encabezado","function parseText","function importCsvFile", "pedidoclaro-errores-pedidos.csv", "pedidoclaro-errores-catalogo.csv","function backupData","function restoreData","serviceWorker.register"):
        if token not in js: raise SystemExit("Falta funcionalidad JS: "+token)
    if "CACHE_NAME" not in sw or "PedidoClaro" not in manifest.get("name",""): raise SystemExit("PWA incompleta")
    restore_guard='if(!l||typeof l!=="object"||Array.isArray(l))throw new Error("Línea inválida en "'
    if restore_guard not in js: raise SystemExit("Falta la validación defensiva de líneas en copias JSON")
    restore_start=js.index("async function restoreData(file){")
    restore_end=js.index("function initHelpCenter(){",restore_start)
    restore=js[restore_start:restore_end]
    for token in ("const nextState={...state,orders:restoredOrders", "backupData();", "state=nextState;", 'if(!l||typeof l!=="object"||Array.isArray(l))', "if(data.catalog!==undefined&&!Array.isArray(data.catalog))", "const cleanRules=cleanRuleSet(data.rules||defaultRules)"):
        if token not in restore: raise SystemExit("Falta protección en la restauración de copias: "+token)
    if restore.index("const nextState=")>restore.index("if(!confirm(") or restore.index("state=nextState;")<restore.index("backupData();"):
        raise SystemExit("La restauración no prepara los datos antes de sustituir el estado")
    for token in ("async function csvFingerprint(content)", "function auditImportRows(rows,kind,fingerprint)", 'const source=get("order")||"__FILE__:"+fingerprint,key=JSON.stringify([source,client])', 'if(state.orders.some(o=>o.sourceId===key)&&item.status!=="rejected")', 'const raw=await file.text(),fingerprint=await csvFingerprint(raw),rows=csvParse(raw)', 'const importBatch="__FILE__:"+stableFingerprint', "importCsvFile(task.file,task.fingerprint)"):
        if token not in js: raise SystemExit("Falta protección contra reimportación CSV: "+token)
    if "audit.issues=audit.rows.filter" not in js or "pendingImport.audit.issues" not in js or "Descargar incidencias" not in source: raise SystemExit("Falta la exportación completa de incidencias CSV")
    import_start=js.index("async function importCsvFile(file,fingerprint){")
    import_end=js.index("function backupData(){",import_start)
    csv_import=js[import_start:import_end]
    for token in ("const existingSources=new Set(state.orders.map(o=>o.sourceId)),newOrders=[]", "let added=0,skipped=0,nextCounter=", "newOrders.push({id:\"PD-\"+nextCounter", "state.orders=[...newOrders,...state.orders]", "state.counter=nextCounter", "state.selected=newOrders[0].id"):
        if token not in csv_import: raise SystemExit("Falta preparación transaccional en importación CSV: "+token)
    if csv_import.index("newOrders.push(")>csv_import.index("state.orders=[...newOrders,...state.orders]") or csv_import.index("state.orders=[...newOrders,...state.orders]")>csv_import.index("state.counter=nextCounter"):
        raise SystemExit("La importación CSV modifica el estado antes de preparar todos los pedidos")
    for token in ('id="view-catalog"', 'id="catalog-import"', 'id="catalog-export"', 'id="product-dialog"'):
        if token not in source: raise SystemExit("Falta catálogo: "+token)
    for token in ("catalogSeed", "function renderCatalog", "function catalogCsvExport", "function catalogCsvImport", "catalog-file", "catalogProduct", "Precio distinto al catálogo", "data-catalog-apply", "data-product-edit", "editingCatalogSku", "duplicateSku", "Referencia repetida en el pedido", "product?.price??r.price", "const importBatch=", 'sourceRef=get("order")||"Importación sin número"', "sourceId:key", "JSON.stringify([source,client])", "v>999999", "const orderIds=new Set(),sourceIds=new Set()", "catalogSkus=new Set()", "referencias SKU duplicadas"):
        if token not in js: raise SystemExit("Falta funcionalidad catálogo: "+token)
    for token in ('data-view="clients"','data-view="analytics"'):
        if token not in source: raise SystemExit("Falta navegación: "+token)
    if "datos ficticios" not in source.lower() or "no contiene ia" not in source.lower(): raise SystemExit("Faltan avisos de demo")
    node=shutil.which("node")
    if node:
        for name in ["app.js","sw.js"]:
            result=subprocess.run([node,"--check",str(ROOT/name)],text=True,capture_output=True)
            if result.returncode: print(result.stderr,file=sys.stderr); raise SystemExit(name+": error de sintaxis")
        for number,inline in enumerate(p.scripts,1):
            result=subprocess.run([node,"--check","-"],input=inline,text=True,capture_output=True)
            if result.returncode: print(result.stderr,file=sys.stderr); raise SystemExit(f"JavaScript inline {number}: error")
    print(f"OK: {len(p.ids)} IDs únicos, manifest válido, PWA offline, importación CSV con informes de errores, exportación XLSX, copias JSON y JavaScript.")
    if not node: print("Aviso: Node.js no disponible; sintaxis JS no comprobada.")
if __name__=="__main__": main()
