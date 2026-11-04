#!/usr/bin/env python3
"""
Caelestia-DNT universal desktop bridge daemon.

Zero-dependency HTTP server that streams the live Material 3 palette and
wallpaper from Linux desktop environments (Noctalia/Niri, Caelestia/Hyprland,
GNOME, KDE Plasma, Sway, XFCE, Pywal, Matugen, etc.) to the browser extension.

Endpoints:
    GET /theme          -> JSON palette snapshot & metadata
    GET /wallpaper.jpg  -> current wallpaper image bytes
    GET /desktop-info   -> DE/WM detection, tiling status, mode
"""
from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import mimetypes
import os
import pathlib
import re
import shutil
import subprocess
import sys
import urllib.parse

# Prevent Python from creating __pycache__ inside the extension folder
# (Chromium forbids loading unpacked extensions with directories starting with '_')
sys.dont_write_bytecode = True

PORT = 39123
HOST = "127.0.0.1"

HOME = pathlib.Path.home()
PROJECT_DIR = pathlib.Path(__file__).resolve().parent
BUNDLED_SCHEME = PROJECT_DIR / "caelestia-theme.json"
BUNDLED_WP = PROJECT_DIR / "wallpaper.jpg"

# 1. Noctalia Shell paths
NOCTALIA_COLORS = HOME / ".config/noctalia/colors.json"
NOCTALIA_WALLPAPERS = HOME / ".cache/noctalia/wallpapers.json"
NOCTALIA_SETTINGS = HOME / ".local/state/noctalia/settings.toml"
EXTENSION_THEME = pathlib.Path(
    os.environ.get("CAELESTIA_DNT_DIR", HOME / ".config/caelestia/caelestia-dnt")
) / "noctalia-theme.json"

# 2. Caelestia Shell paths
SCHEME_JSON = HOME / ".local/state/caelestia/scheme.json"
SHELL_JSON = HOME / ".config/caelestia/shell.json"
WP_CURRENT = HOME / ".local/state/caelestia/wallpaper/current"

# 3. Universal Linux Rice tools
PYWAL_COLORS = HOME / ".cache/wal/colors.json"
MATUGEN_COLORS = HOME / ".config/matugen/colors.json"
MATUGEN_CACHE = HOME / ".cache/matugen/colors.json"
WALLUST_COLORS = HOME / ".cache/wallust/nix-colors.json"
WALLUST_FALLBACK = HOME / ".cache/wallust/colors.json"

# 4. KDE Plasma configs
KDE_GLOBALS = HOME / ".config/kdeglobals"
KDE_PLASMA_APPLETS = HOME / ".config/plasma-org.kde.plasma.desktop-appletsrc"

# 5. XFCE / Waypaper / Feh / Nitrogen configs
FEH_BG = HOME / ".fehbg"
NITROGEN_CFG = HOME / ".config/nitrogen/bg-saved.cfg"
WAYPAPER_CFG = HOME / ".config/waypaper/config.ini"


def _read_json(path):
    try:
        p = pathlib.Path(path)
        if p.exists():
            return json.loads(p.read_text())
    except Exception:
        pass
    return None


def _read_toml_table_value(path, section, key):
    """Minimal TOML reader for config values without external dependencies."""
    try:
        p = pathlib.Path(path)
        if not p.exists():
            return None
        lines = p.read_text().splitlines()
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


def _run_cmd(cmd, timeout=1.5):
    """Run shell command safely with timeout and return trimmed stdout."""
    try:
        res = subprocess.run(
            cmd,
            shell=isinstance(cmd, str),
            stdout=subprocess.PIPE,
            stderr=subprocess.DEVNULL,
            text=True,
            timeout=timeout,
        )
        if res.returncode == 0:
            return res.stdout.strip()
    except Exception:
        pass
    return None


# --- Desktop & Compositor Detection ---

def detect_desktop():
    """Detect desktop environment, compositor, and whether it's a tiling manager."""
    xdg_desktop = (os.environ.get("XDG_CURRENT_DESKTOP") or "").lower()
    session = (os.environ.get("DESKTOP_SESSION") or "").lower()
    gdm_session = (os.environ.get("GDMSESSION") or "").lower()
    wayland = bool(os.environ.get("WAYLAND_DISPLAY"))

    compositor = "unknown"
    is_tiling = False

    if "hyprland" in xdg_desktop or os.environ.get("HYPRLAND_INSTANCE_SIGNATURE"):
        compositor = "hyprland"
        is_tiling = True
    elif "niri" in xdg_desktop or os.environ.get("NIRI_SOCKET"):
        compositor = "niri"
        is_tiling = True
    elif "sway" in xdg_desktop or os.environ.get("SWAYSOCK"):
        compositor = "sway"
        is_tiling = True
    elif "river" in xdg_desktop:
        compositor = "river"
        is_tiling = True
    elif "i3" in xdg_desktop or "i3" in session:
        compositor = "i3"
        is_tiling = True
    elif "bspwm" in xdg_desktop or "bspwm" in session:
        compositor = "bspwm"
        is_tiling = True
    elif "gnome" in xdg_desktop or "gnome" in session:
        compositor = "mutter"
    elif "kde" in xdg_desktop or "plasma" in xdg_desktop:
        compositor = "kwin"
    elif "xfce" in xdg_desktop:
        compositor = "xfwm4"

    return {
        "desktop": xdg_desktop or session or gdm_session or "linux",
        "compositor": compositor,
        "is_tiling": is_tiling,
        "is_wayland": wayland,
    }


def detect_system_color_scheme():
    """Detect light/dark theme preference across Linux desktops."""
    # 1. Noctalia
    if NOCTALIA_SETTINGS.exists():
        mode = _read_toml_table_value(NOCTALIA_SETTINGS, "appearance", "color_scheme")
        if mode:
            return "dark" if "dark" in mode.lower() else "light"

    # 2. Caelestia
    cael = _read_json(SCHEME_JSON)
    if cael and cael.get("mode"):
        return cael["mode"]

    # 3. GNOME / GTK settings via gsettings
    if shutil.which("gsettings"):
        scheme = _run_cmd(["gsettings", "get", "org.gnome.desktop.interface", "color-scheme"])
        if scheme:
            cleaned = scheme.strip("'\"").lower()
            if "dark" in cleaned:
                return "dark"
            elif "light" in cleaned or "default" in cleaned:
                return "light"

    # 4. KDE Plasma settings
    if KDE_GLOBALS.exists():
        try:
            content = KDE_GLOBALS.read_text()
            match = re.search(r"ColorScheme\s*=\s*(.*)", content)
            if match:
                val = match.group(1).lower()
                if "dark" in val or "black" in val:
                    return "dark"
                elif "light" in val or "breeze" in val:
                    return "light"
        except Exception:
            pass

    # 5. FreeDesktop Portal DBus
    dbus_res = _run_cmd(
        "gdbus call --session --dest org.freedesktop.portal.Desktop "
        "--object-path /org/freedesktop/portal/desktop "
        "--method org.freedesktop.portal.Settings.Read "
        "'org.freedesktop.appearance' 'color-scheme'"
    )
    if dbus_res:
        # returns <(<uint32 1>,)> where 1=dark, 2=light, 0=default
        if "1" in dbus_res:
            return "dark"
        elif "2" in dbus_res:
            return "light"

    return "dark"


# --- Wallpaper Resolvers ---

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

    for section in ("wallpaper.default", "wallpaper.last"):
        candidate = _read_toml_table_value(NOCTALIA_SETTINGS, section, "path")
        if candidate and pathlib.Path(candidate).exists():
            return pathlib.Path(candidate)
    return None


def caelestia_wallpaper():
    if WP_CURRENT.exists():
        try:
            resolved = WP_CURRENT.resolve()
            if resolved.exists():
                return resolved
        except Exception:
            pass
    if BUNDLED_WP.exists():
        return BUNDLED_WP
    return None


def gnome_wallpaper():
    if not shutil.which("gsettings"):
        return None
    for key in ("picture-uri-dark", "picture-uri"):
        res = _run_cmd(["gsettings", "get", "org.gnome.desktop.background", key])
        if res:
            cleaned = res.strip("'\"")
            if cleaned.startswith("file://"):
                p = pathlib.Path(urllib.parse.unquote(cleaned[7:]))
                if p.exists() and p.is_file():
                    return p
            elif pathlib.Path(cleaned).exists() and pathlib.Path(cleaned).is_file():
                return pathlib.Path(cleaned)
    return None


def kde_wallpaper():
    if not KDE_PLASMA_APPLETS.exists():
        return None
    try:
        text = KDE_PLASMA_APPLETS.read_text()
        # Look for Image=file:///... or Image=/...
        matches = re.findall(r"Image\s*=\s*(?:file://)?([^\r\n]+)", text)
        for cand in reversed(matches):
            p = pathlib.Path(urllib.parse.unquote(cand.strip()))
            if p.exists() and p.is_file():
                return p
        # Look for usersWallpapers=/...
        matches_users = re.findall(r"usersWallpapers\s*=\s*([^\r\n,]+)", text)
        for cand in reversed(matches_users):
            p = pathlib.Path(urllib.parse.unquote(cand.strip()))
            if p.exists() and p.is_file():
                return p
    except Exception:
        pass
    return None


def swww_wallpaper():
    if not shutil.which("swww"):
        return None
    out = _run_cmd(["swww", "query"])
    if out:
        # Format: "eDP-1: 1920x1080..., currently displaying: image: /path/to/wp"
        match = re.search(r"image:\s*(.+)$", out, re.MULTILINE)
        if match:
            p = pathlib.Path(match.group(1).strip())
            if p.exists() and p.is_file():
                return p
    return None


def hyprpaper_wallpaper():
    if not shutil.which("hyprctl"):
        return None
    out = _run_cmd(["hyprctl", "hyprpaper", "listactive"])
    if out:
        for line in out.splitlines():
            # Format: "eDP-1 = /path/to/image"
            if "=" in line:
                cand = line.split("=", 1)[1].strip()
                p = pathlib.Path(cand)
                if p.exists() and p.is_file():
                    return p
    return None


def waypaper_wallpaper():
    if not WAYPAPER_CFG.exists():
        return None
    try:
        text = WAYPAPER_CFG.read_text()
        match = re.search(r"wallpaper\s*=\s*(.+)", text)
        if match:
            p = pathlib.Path(os.path.expanduser(match.group(1).strip()))
            if p.exists() and p.is_file():
                return p
    except Exception:
        pass
    return None


def feh_wallpaper():
    if not FEH_BG.exists():
        return None
    try:
        text = FEH_BG.read_text()
        match = re.search(r"['\"]([^'\"]+\.(?:jpe?g|png|webp))['\"]", text, re.IGNORECASE)
        if match:
            p = pathlib.Path(os.path.expanduser(match.group(1).strip()))
            if p.exists() and p.is_file():
                return p
    except Exception:
        pass
    return None


def nitrogen_wallpaper():
    if not NITROGEN_CFG.exists():
        return None
    try:
        text = NITROGEN_CFG.read_text()
        matches = re.findall(r"file\s*=\s*(.+)", text)
        for cand in reversed(matches):
            p = pathlib.Path(os.path.expanduser(cand.strip()))
            if p.exists() and p.is_file():
                return p
    except Exception:
        pass
    return None


def xfce_wallpaper():
    if not shutil.which("xfconf-query"):
        return None
    out = _run_cmd(
        ["xfconf-query", "-c", "xfce4-desktop", "-p", "/backdrop/screen0/monitor0/workspace0/last-image"]
    )
    if out:
        p = pathlib.Path(out.strip())
        if p.exists() and p.is_file():
            return p
    return None


def current_wallpaper():
    """Resolve wallpaper in priority order preserving Noctalia & Caelestia setups."""
    return (
        noctalia_wallpaper()
        or caelestia_wallpaper()
        or swww_wallpaper()
        or hyprpaper_wallpaper()
        or gnome_wallpaper()
        or kde_wallpaper()
        or waypaper_wallpaper()
        or feh_wallpaper()
        or nitrogen_wallpaper()
        or xfce_wallpaper()
    )


# --- Theme & Color Resolvers ---

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
    if not data and BUNDLED_SCHEME.exists():
        data = _read_json(BUNDLED_SCHEME)
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
    data["desktop"] = "caelestia"
    return data


def matugen_theme():
    for p in (MATUGEN_COLORS, MATUGEN_CACHE):
        data = _read_json(p)
        if data:
            mode = detect_system_color_scheme()
            colours = data.get("colors", {}).get(mode) or data.get("colors") or data
            if isinstance(colours, dict) and "primary" in colours:
                return {
                    "name": "Matugen Dynamic",
                    "desktop": "matugen",
                    "mode": mode,
                    "transparency": True,
                    "colours": colours,
                }
    return None


def pywal_theme():
    data = _read_json(PYWAL_COLORS)
    if not data:
        return None
    colors = data.get("colors", {})
    special = data.get("special", {})
    bg = special.get("background", "#121212")
    fg = special.get("foreground", "#e0e0e0")

    primary = colors.get("color4", "#7aa2f7")
    secondary = colors.get("color5", "#bb9af7")
    tertiary = colors.get("color6", "#7dcfff")

    mapped = {
        "primary": primary,
        "onPrimary": bg,
        "primaryContainer": colors.get("color8", "#444b6a"),
        "onPrimaryContainer": fg,
        "secondary": secondary,
        "onSecondary": bg,
        "secondaryContainer": colors.get("color8", "#444b6a"),
        "onSecondaryContainer": fg,
        "tertiary": tertiary,
        "onTertiary": bg,
        "tertiaryContainer": colors.get("color8", "#444b6a"),
        "onTertiaryContainer": fg,
        "background": bg,
        "onBackground": fg,
        "surface": bg,
        "onSurface": fg,
        "surfaceVariant": colors.get("color0", bg),
        "onSurfaceVariant": colors.get("color7", fg),
        "surfaceContainer": colors.get("color0", bg),
        "outline": colors.get("color8", "#565f89"),
        "error": colors.get("color1", "#f7768e"),
        "success": colors.get("color2", "#9ece6a"),
    }
    return {
        "name": "Pywal",
        "desktop": "pywal",
        "mode": "dark",
        "transparency": True,
        "colours": mapped,
    }


def generic_desktop_theme():
    """Fallback theme synthesizer when wallpaper is detected on GNOME, KDE, or generic WMs."""
    wp = current_wallpaper()
    mode = detect_system_color_scheme()
    info = detect_desktop()

    bundled = _read_json(BUNDLED_SCHEME) or {}
    colours = bundled.get("colours")

    theme_name = f"{info['desktop'].capitalize()} Dynamic" if info['desktop'] != 'linux' else "Linux Dynamic"

    return {
        "name": theme_name,
        "desktop": info["desktop"],
        "mode": mode,
        "transparency": True,
        "is_tiling": info["is_tiling"],
        "compositor": info["compositor"],
        "wallpaper_detected": bool(wp),
        "colours": colours,
    }


def current_theme():
    theme = (
        noctalia_theme()
        or caelestia_theme()
        or matugen_theme()
        or pywal_theme()
        or generic_desktop_theme()
    )
    if not theme:
        return None

    theme["username"] = os.environ.get("USER", "FrontendGeek").capitalize()
    theme["wallpaper_url"] = f"http://{HOST}:{PORT}/wallpaper.jpg"
    theme["desktop_info"] = detect_desktop()
    return theme


# --- HTTP Server Handler ---

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
                    self.send_error(404, "No desktop theme found")
                    return

                body = json.dumps(theme).encode("utf-8")
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Content-Length", str(len(body)))
                self.end_headers()
                self.wfile.write(body)
            except Exception as e:
                self.send_error(500, str(e))

        elif self.path.startswith("/desktop-info"):
            try:
                info = detect_desktop()
                info["mode"] = detect_system_color_scheme()
                wp = current_wallpaper()
                info["wallpaper"] = str(wp) if wp else None
                body = json.dumps(info).encode("utf-8")
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

