#!/usr/bin/env python3
"""
Caelestia-DNT desktop bridge daemon.

Zero-dependency HTTP server that streams the live Material 3 palette and
wallpaper from Noctalia Shell (Niri) or Caelestia Shell (Hyprland) to the
browser extension, without file:// permissions.

Endpoints:
    GET /theme          -> JSON palette snapshot
    GET /wallpaper.jpg  -> current wallpaper bytes

Only needed for packed installs where the desktop cannot write directly into
the extension directory. The unpacked Noctalia user-template workflow does not
need this daemon.
"""
from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import mimetypes
import os
import pathlib
import re
import sys

PORT = 39123
HOST = "127.0.0.1"

HOME = pathlib.Path.home()
SCHEME_JSON = HOME / ".local/state/caelestia/scheme.json"
SHELL_JSON = HOME / ".config/caelestia/shell.json"
WP_CURRENT = HOME / ".local/state/caelestia/wallpaper/current"

NOCTALIA_COLORS = HOME / ".config/noctalia/colors.json"
NOCTALIA_WALLPAPERS = HOME / ".cache/noctalia/wallpapers.json"
NOCTALIA_SETTINGS = HOME / ".local/state/noctalia/settings.toml"
EXTENSION_THEME = pathlib.Path(
    os.environ.get("CAELESTIA_DNT_DIR", HOME / ".config/caelestia/caelestia-dnt")
) / "noctalia-theme.json"


def _read_json(path):
    try:
        return json.loads(path.read_text())
    except Exception:
        return None


def _read_toml_table_value(path, section, key):
    """Minimal TOML reader for the one value the bridge needs."""
    try:
        lines = path.read_text().splitlines()
    except Exception:
        return None

    current = None
    pattern = re.compile(r"^\s*" + re.escape(key) + r"\s*=\s*\"(.*)\"\s*$")
    for line in lines:
        stripped = line.strip()
        if stripped.startswith("[") and stripped.endswith("]"):
            current = stripped[1:-1].strip()
            continue
        if current == section:
            match = pattern.match(line)
            if match:
                return match.group(1)
    return None


def noctalia_wallpaper():
    data = _read_json(NOCTALIA_WALLPAPERS) or {}

    wallpapers = data.get("wallpapers") or {}
    for entry in wallpapers.values():
        candidate = entry.get("dark") or entry.get("light")
        if candidate and pathlib.Path(candidate).exists():
            return pathlib.Path(candidate)

    default = data.get("defaultWallpaper")
    if default and pathlib.Path(default).exists():
        return pathlib.Path(default)

    # settings.toml stores the last/default wallpaper for the default output.
    for section in ("wallpaper.default", "wallpaper.last"):
        candidate = _read_toml_table_value(NOCTALIA_SETTINGS, section, "path")
        if candidate and pathlib.Path(candidate).exists():
            return pathlib.Path(candidate)

    return None


def caelestia_wallpaper():
    if not WP_CURRENT.exists():
        return None
    try:
        resolved = WP_CURRENT.resolve()
        return resolved if resolved.exists() else None
    except Exception:
        return None


def current_wallpaper():
    return noctalia_wallpaper() or caelestia_wallpaper()


def _noctalia_colours():
    """Map Noctalia's compact colors.json into the extension token names."""
    data = _read_json(NOCTALIA_COLORS)
    if not data:
        return None

    surface = data.get("mSurface", "#17130e")
    surface_variant = data.get("mSurfaceVariant", surface)
    outline = data.get("mOutline", surface_variant)
    primary = data.get("mPrimary", "#ffb953")
    tertiary = data.get("mTertiary", primary)

    return {
        "primary": primary,
        "onPrimary": data.get("mOnPrimary", "#452b00"),
        "primaryContainer": surface_variant,
        "onPrimaryContainer": data.get("mOnSurface", "#eae1d9"),
        "secondary": data.get("mSecondary", primary),
        "onSecondary": data.get("mOnSecondary", "#3e2d16"),
        "secondaryContainer": surface_variant,
        "onSecondaryContainer": data.get("mOnSurface", "#eae1d9"),
        "tertiary": tertiary,
        "onTertiary": data.get("mOnTertiary", "#253515"),
        "tertiaryContainer": surface_variant,
        "onTertiaryContainer": data.get("mOnSurface", "#eae1d9"),
        "error": data.get("mError", "#ffb4ab"),
        "onError": data.get("mOnError", "#690005"),
        "background": surface,
        "onBackground": data.get("mOnSurface", "#eae1d9"),
        "surface": surface,
        "onSurface": data.get("mOnSurface", "#eae1d9"),
        "surfaceVariant": surface_variant,
        "onSurfaceVariant": data.get("mOnSurfaceVariant", "#d3c4b4"),
        "surfaceDim": surface,
        "surfaceBright": surface_variant,
        "surfaceContainerLowest": surface,
        "surfaceContainerLow": surface,
        "surfaceContainer": surface_variant,
        "surfaceContainerHigh": surface_variant,
        "surfaceContainerHighest": surface_variant,
        "outline": outline,
        "outlineVariant": outline,
        "green": data.get("mHover", tertiary),
        "success": data.get("mHover", tertiary),
        "yellow": data.get("mHover", tertiary),
        "peach": tertiary,
        "red": data.get("mError", "#ffb4ab"),
        "mauve": tertiary,
        "blue": primary,
    }


def noctalia_theme():
    # A generated extension snapshot is the richest source when available.
    generated = _read_json(EXTENSION_THEME)
    if generated and generated.get("colours"):
        return generated

    colours = _noctalia_colours()
    if not colours:
        return None

    return {
        "name": "Noctalia",
        "desktop": "noctalia",
        "mode": "dark",
        "transparency": True,
        "colours": colours,
    }


def caelestia_theme():
    data = _read_json(SCHEME_JSON)
    if not data:
        return None

    transparency = True
    if SHELL_JSON.exists():
        try:
            shell = _read_json(SHELL_JSON) or {}
            transparency = (
                shell.get("appearance", {})
                .get("transparency", {})
                .get("enabled", True)
            )
        except Exception:
            pass

    data["transparency"] = transparency
    return data


def current_theme():
    theme = noctalia_theme() or caelestia_theme()
    if not theme:
        return None

    theme["username"] = os.environ.get("USER", "FrontendGeek").capitalize()
    theme["wallpaper_url"] = f"http://{HOST}:{PORT}/wallpaper.jpg"
    return theme


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
            try:
                theme = current_theme()
                if not theme:
                    self.send_error(404, "No Noctalia or Caelestia theme found")
                    return

                body = json.dumps(theme).encode("utf-8")
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Content-Length", str(len(body)))
                self.end_headers()
                self.wfile.write(body)
            except Exception as e:
                self.send_error(500, str(e))

        elif self.path.startswith("/wallpaper.jpg"):
            wallpaper = current_wallpaper()
            if not wallpaper:
                self.send_error(404, "Wallpaper not found")
                return
            try:
                wp_bytes = wallpaper.read_bytes()
                content_type = mimetypes.guess_type(str(wallpaper))[0] or "image/jpeg"
                self.send_response(200)
                self.send_header("Content-Type", content_type)
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
