#!/usr/bin/env python3
"""A local stand-in for Netlify, for testing: serves public/ with the headers from netlify.toml.

  python3 tests/serve.py            # http://127.0.0.1:8765
  python3 tests/serve.py 9000       # another port

Like Netlify it serves public/404.html for unknown paths. Unlike Netlify it has no form backend and
no functions, so form posts get a 501 and /api/chat a 404 (the browser tests stand in for both).
Over plain http the HSTS header and the CSP's upgrade-insecure-requests are left out; on Netlify
everything is https, where they do nothing to same-site requests.
"""
import fnmatch
import sys
import threading
import tomllib
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"


RULES = tomllib.loads((ROOT / "netlify.toml").read_text()).get("headers", [])


def headers_for(path):
    """The headers netlify.toml gives this path (every matching rule applies, like on Netlify)."""
    headers = {}
    for rule in RULES:
        if fnmatch.fnmatch(path, rule.get("for", "")):
            headers.update(rule.get("values", {}))
    headers.pop("Strict-Transport-Security", None)
    if "Content-Security-Policy" in headers:
        headers["Content-Security-Policy"] = "; ".join(
            d.strip() for d in headers["Content-Security-Policy"].split(";")
            if d.strip() and d.strip() != "upgrade-insecure-requests")
    return headers


class Handler(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass

    def end_headers(self):
        headers = headers_for(self.path.split("?")[0])
        for k, v in headers.items():
            self.send_header(k, v)
        if "Cache-Control" not in headers:
            self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def send_error(self, code, message=None, explain=None):
        if code == 404 and (PUBLIC / "404.html").exists():
            body = (PUBLIC / "404.html").read_bytes()
            self.send_response(404)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            if self.command != "HEAD":
                self.wfile.write(body)
            return
        super().send_error(code, message, explain)

    def translate_path(self, path):
        # /__dist/... serves the (undeployed) artifact preview from dist/, for the preview tests.
        if path.startswith("/__dist/"):
            return str(ROOT / "dist" / Path(path.split("?")[0][len("/__dist/"):]).name)
        return super().translate_path(path)

    def do_POST(self):
        self.send_error(501, "No form backend or functions in the local server")


Handler.extensions_map = {**SimpleHTTPRequestHandler.extensions_map, ".mjs": "text/javascript", ".ico": "image/x-icon",
                          ".woff2": "font/woff2"}


def start(port=8765):
    """Start the server in a background thread and return it (used by tests/qa.py)."""
    server = ThreadingHTTPServer(("127.0.0.1", port), partial(Handler, directory=str(PUBLIC)))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    return server


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8765
    print(f"Serving {PUBLIC} at http://127.0.0.1:{port}  (Ctrl+C to stop)")
    server = ThreadingHTTPServer(("127.0.0.1", port), partial(Handler, directory=str(PUBLIC)))
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
