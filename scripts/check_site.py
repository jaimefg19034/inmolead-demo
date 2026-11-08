#!/usr/bin/env python3
"""Dependency-free static checks for the PedidoClaro GitHub Pages demo."""
from html.parser import HTMLParser
from pathlib import Path
import shutil
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
HTML = ROOT / "index.html"

class Parser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = set()
        self.title_open = False
        self.title = []
        self.lang = None
        self.scripts = []
        self.in_script = False
        self.script = []
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "html":
            self.lang = attrs.get("lang")
        if "id" in attrs:
            value = attrs["id"]
            if value in self.ids:
                raise ValueError(f"ID duplicado: {value}")
            self.ids.add(value)
        if tag == "title":
            self.title_open = True
        if tag == "script" and not attrs.get("src"):
            self.in_script = True
            self.script = []
    def handle_endtag(self, tag):
        if tag == "title":
            self.title_open = False
        if tag == "script" and self.in_script:
            self.scripts.append("".join(self.script))
            self.in_script = False
    def handle_data(self, data):
        if self.title_open:
            self.title.append(data)
        if self.in_script:
            self.script.append(data)

def main():
    if not HTML.exists():
        raise SystemExit("Falta index.html")
    source = HTML.read_text(encoding="utf-8")
    parser = Parser()
    parser.feed(source)
    if parser.lang != "es":
        raise SystemExit("El documento debe declarar lang=es")
    if "PedidoClaro" not in "".join(parser.title):
        raise SystemExit("El título no identifica PedidoClaro")
    if len(parser.ids) < 10:
        raise SystemExit("Faltan controles clave de la demo")
    required = ["id=\"list\"", "id=\"detail\"", "id=\"approve\"", "id=\"parse\"", "No tiene IA", "datos ficticios"]
    missing = [item for item in required if item.lower() not in source.lower()]
    if missing:
        raise SystemExit("Faltan elementos/avisos requeridos: " + ", ".join(missing))
    if not parser.scripts:
        raise SystemExit("No se ha encontrado JavaScript inline")
    node = shutil.which("node")
    if node:
        for number, js in enumerate(parser.scripts, start=1):
            result = subprocess.run([node, "--check", "-"], input=js, text=True, capture_output=True)
            if result.returncode:
                print(result.stderr, file=sys.stderr)
                raise SystemExit(f"JavaScript inline {number}: error de sintaxis")
    print(f"OK: PedidoClaro, {len(parser.ids)} IDs únicos, {len(parser.scripts)} bloque(s) JS.")
    if not node:
        print("Aviso: Node.js no disponible; se omitió el chequeo de sintaxis JS.")

if __name__ == "__main__":
    main()
