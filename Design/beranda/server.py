"""Local-only static SPA preview. Run: python3 server.py"""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse
import os

os.chdir(Path(__file__).resolve().parent)

class Handler(SimpleHTTPRequestHandler):
    def end_headers(self):
        # Revalidate every file so edited modules are never served stale from cache.
        self.send_header('Cache-Control', 'no-cache')
        super().end_headers()

    def do_GET(self):
        path = urlparse(self.path).path
        if not Path(self.translate_path(path)).exists() and not Path(path).suffix:
            self.path = '/index.html'
        super().do_GET()

if __name__ == '__main__':
    print('sugarWise: http://localhost:3001', flush=True)
    ThreadingHTTPServer(('127.0.0.1', 3001), Handler).serve_forever()
