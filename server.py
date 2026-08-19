import http.server
import socketserver
import webbrowser
import threading
import sys
import os

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class SafeHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        # Prevent caching for active development
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()

# Update extensions map to ensure modern browsers treat JS files correctly
SafeHandler.extensions_map.update({
    '.js': 'application/javascript',
    '.jsx': 'application/javascript',
    '.css': 'text/css',
    '.html': 'text/html',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
})

def start_server():
    socketserver.TCPServer.allow_reuse_address = True
    while True:
        try:
            global PORT
            with socketserver.TCPServer(("", PORT), SafeHandler) as httpd:
                print(f"\n========================================================")
                print(f" AegisNet local web server started at http://localhost:{PORT}")
                print(f" Serving files from: {DIRECTORY}")
                print(f" Press Ctrl+C in the terminal to stop the server.")
                print(f"========================================================\n")
                
                # Auto-open browser in a thread after server starts
                threading.Timer(1.0, lambda: webbrowser.open(f"http://localhost:{PORT}")).start()
                httpd.serve_forever()
        except OSError as e:
            if e.errno == 98 or e.errno == 10048: # Port already in use
                print(f"Port {PORT} is in use, trying next port...")
                PORT += 1
            else:
                print(f"Server error: {e}")
                sys.exit(1)

if __name__ == "__main__":
    try:
        start_server()
    except KeyboardInterrupt:
        print("\nStopping AegisNet server. Goodbye!")
        sys.exit(0)
