#!/usr/bin/env python3
"""Small static checks for the InmoLead demo; no third-party packages."""
from html.parser import HTMLParser
from pathlib import Path
import shutil
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
HTML = ROOT / "index.html"

class SiteParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = set()
        self.title_open = False
        self.title_text = []
        self.lang = None
        self.scripts = []
        self.in_script = False
        self.script_buffer = []
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "html":
            self.lang = attrs.get("lang")
        if "id" in attrs:
            if attrs["id"] in self.ids:
                raise ValueError(f"ID duplicado: {attrs['id']}")
            self.ids.add(attrs["id"])
        if tag == "title":
            self.title_open = True
        if tag == "script" and not attrs.get("src"):
            self.in_script = True
            self.script_buffer = []
    def handle_endtag(self, tag):
        if tag == "title":
            self.title_open = False
        if tag == "script" and self.in_script:
            self.scripts.append("".join(self.script_buffer))
            self.in_script = False
    def handle_data(self, data):
        if self.title_open:
            self.title_text.append(data)
        if self.in_script:
            self.script_buffer.append(data)

def main():
    if not HTML.exists():
        raise SystemExit("Falta index.html")
    source = HTML.read_text(encoding="utf-8")
    parser = SiteParser()
    parser.feed(source)
    if parser.lang != "es":
        raise SystemExit("El documento debe declarar lang=es")
    if not "".join(parser.title_text).strip():
        raise SystemExit("Falta un título de página")
    if not parser.scripts:
        raise SystemExit("No se ha encontrado JavaScript inline")
    if "modo demostración" not in source.lower() or "no tiene" not in source.lower():
        raise SystemExit("Falta el aviso de limitaciones de la demo")
    node = shutil.which("node")
    if node:
        for number, js in enumerate(parser.scripts, start=1):
            result = subprocess.run([node, "--check", "-"], input=js, text=True, capture_output=True)
            if result.returncode:
                print(result.stderr, file=sys.stderr)
                raise SystemExit(f"JavaScript inline {number}: error de sintaxis")
    print(f"OK: HTML leído, {len(parser.ids)} IDs únicos, {len(parser.scripts)} bloque(s) JS.")
    if not node:
        print("Aviso: Node.js no está disponible; se omitió el chequeo de sintaxis JS.")

if __name__ == "__main__":
    main()
