"""Serve the offline trainer on loopback only. Python 3.9+."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import argparse
import threading
import webbrowser


class LocalHandler(SimpleHTTPRequestHandler):
    # ES modules require a JavaScript MIME type, even on systems whose MIME
    # registry associates .js with text/plain (notably some Windows installs).
    extensions_map = {
        **SimpleHTTPRequestHandler.extensions_map,
        '.js': 'text/javascript',
        '.mjs': 'text/javascript',
        '.css': 'text/css',
    }


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--port', type=int, default=8765)
    parser.add_argument('--no-browser', action='store_true')
    args = parser.parse_args()
    if not 1 <= args.port <= 65535:
        parser.error('--port must be between 1 and 65535')
    handler = partial(LocalHandler, directory=str(Path(__file__).resolve().parent / 'web'))
    try:
        server = ThreadingHTTPServer(('127.0.0.1', args.port), handler)
    except OSError as error:
        raise SystemExit(f'Cannot start server: {error}. Try --port 8766.')
    url = f'http://127.0.0.1:{args.port}'
    print(f'Aim Labs: {url}\nPress Ctrl+C to stop.', flush=True)
    if not args.no_browser:
        threading.Timer(.5, lambda: webbrowser.open(url)).start()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
