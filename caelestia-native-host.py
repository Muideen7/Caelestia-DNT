#!/usr/bin/env python3
"""
Caelestia-DNT WebExtension Native Messaging Host.

Communicates with Chromium-based browsers via standard input/output using the
WebExtension Native Messaging JSON protocol (4-byte length prefix + UTF-8 JSON).

Zero-dependency; provides live desktop theme, wallpaper, and compositor info
without needing an open network port.
"""
import json
import os
import pathlib
import struct
import sys

# Prevent Python from creating __pycache__ inside the extension folder
# (Chromium forbids loading unpacked extensions with directories starting with '_')
sys.dont_write_bytecode = True

# Import bridge resolvers
CURRENT_DIR = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(CURRENT_DIR))

try:
    import importlib
    bridge = importlib.import_module("caelestia-bridge")
except Exception as e:
    bridge = None


def read_message():
    """Read a native message from standard input (4-byte length prefix)."""
    raw_length = sys.stdin.buffer.read(4)
    if not raw_length or len(raw_length) < 4:
        return None
    message_length = struct.unpack("@I", raw_length)[0]
    raw_message = sys.stdin.buffer.read(message_length)
    if not raw_message:
        return None
    return json.loads(raw_message.decode("utf-8"))


def send_message(message_content):
    """Send a native message to standard output (4-byte length prefix)."""
    encoded_content = json.dumps(message_content).encode("utf-8")
    encoded_length = struct.pack("@I", len(encoded_content))
    sys.stdout.buffer.write(encoded_length)
    sys.stdout.buffer.write(encoded_content)
    sys.stdout.buffer.flush()


def handle_request(req):
    action = req.get("action") if isinstance(req, dict) else "getTheme"

    if action == "ping":
        return {"status": "ok", "version": "1.4.0"}

    if action in ("getTheme", "refreshTheme"):
        if not bridge:
            return {"status": "error", "message": "Bridge module unavailable"}
        theme = bridge.current_theme() or {}
        wp = bridge.current_wallpaper()
        if wp and wp.exists():
            theme["wallpaper_path"] = str(wp)
        return {"status": "ok", "theme": theme}

    if action == "getDesktopInfo":
        if not bridge:
            return {"status": "error", "message": "Bridge module unavailable"}
        info = bridge.detect_desktop()
        info["mode"] = bridge.detect_system_color_scheme()
        wp = bridge.current_wallpaper()
        info["wallpaper"] = str(wp) if wp else None
        return {"status": "ok", "desktop_info": info}

    return {"status": "unknown_action", "action": action}


def main():
    while True:
        try:
            req = read_message()
            if req is None:
                break
            response = handle_request(req)
            send_message(response)
        except (KeyboardInterrupt, SystemExit):
            break
        except Exception as e:
            send_message({"status": "error", "error": str(e)})


if __name__ == "__main__":
    main()

