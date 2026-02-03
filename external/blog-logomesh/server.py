#!/usr/bin/env python3
import http.server
import socketserver
import os

PORT = 5000
HOST = "0.0.0.0"

class NoCacheHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()
    
    def do_GET(self):
        # Block access to private directory
        if self.path.startswith('/private') or '/private/' in self.path:
            self.send_error(403, "Forbidden: Access to this resource is denied")
            return
        
        # Serve all other requests normally
        super().do_GET()

os.chdir(os.path.dirname(os.path.abspath(__file__)))

with socketserver.TCPServer((HOST, PORT), NoCacheHTTPRequestHandler) as httpd:
    print(f"Server running at http://{HOST}:{PORT}/")
    httpd.serve_forever()
