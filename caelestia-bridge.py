#!/usr/bin/env python3
"""
Caelestia-DNT Desktop Bridge Daemon
Zero-dependency HTTP server that streams live Caelestia Shell Material 3 themes 
and wallpapers to Caelestia-DNT browser extensions (Chrome Web Store, Firefox, etc.)
without requiring hardcoded file paths or file:// permissions.
"""
from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import os
import pathlib
import sys

PORT = 39123
HOST = "127.0.0.1"

HOME = pathlib.Path.home()
SCHEME_JSON = HOME / ".local/state/caelestia/scheme.json"
SHELL_JSON = HOME / ".config/caelestia/shell.json"
WP_CURRENT = HOME / ".local/state/caelestia/wallpaper/current"

class CaelestiaBridgeHandler(BaseHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "*")
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def do_GET(self):
        if self.path.startswith("/theme"):
            if not SCHEME_JSON.exists():
                self.send_error(404, "Scheme JSON not found")
                return
            try:
                data = json.loads(SCHEME_JSON.read_text())
                transparency = True
                if SHELL_JSON.exists():
                    try:
                        s_data = json.loads(SHELL_JSON.read_text())
                        transparency = s_data.get("appearance", {}).get("transparency", {}).get("enabled", True)
                    except Exception:
                        pass
                data["transparency"] = transparency
                data["username"] = os.environ.get("USER", "FrontendGeek").capitalize()
                data["wallpaper_url"] = f"http://{HOST}:{PORT}/wallpaper.jpg"

                body = json.dumps(data).encode("utf-8")
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Content-Length", str(len(body)))
                self.end_headers()
                self.wfile.write(body)
            except Exception as e:
                self.send_error(500, str(e))

        elif self.path.startswith("/wallpaper.jpg"):
            if not WP_CURRENT.exists():
                self.send_error(404, "Wallpaper not found")
                return
            try:
                wp_file = WP_CURRENT.resolve()
                wp_bytes = wp_file.read_bytes()
                self.send_response(200)
                self.send_header("Content-Type", "image/jpeg")
                self.send_header("Content-Length", str(len(wp_bytes)))
                self.end_headers()
                self.wfile.write(wp_bytes)
            except Exception as e:
                self.send_error(500, str(e))
        else:
            self.send_error(404, "Endpoint not found")

    def log_message(self, format, *args):
        pass  # Quiet logging

def main():
    server = HTTPServer((HOST, PORT), CaelestiaBridgeHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()

if __name__ == "__main__":
    main()
