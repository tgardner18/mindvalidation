"""Local dev server that disables browser caching, so edits to CSS/JS always show on refresh.

Run from the project root: python3 dev/serve.py [port]   (default 8000), or: npm run serve
"""
import http.server
import sys


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, must-revalidate')
        self.send_header('Expires', '0')
        super().end_headers()


if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    print(f'Serving http://localhost:{port} (no-cache)')
    http.server.ThreadingHTTPServer(('', port), NoCacheHandler).serve_forever()
