# Noctalia Shell integration

This directory connects **Caelestia-DNT** to **Noctalia Shell** on **Niri**.
Noctalia renders its live Material 3 palette into the extension whenever the
wallpaper, palette, or light/dark mode changes. The wallpaper is copied into the
extension automatically, so the new tab and supported websites follow the same
colors as your desktop.

No daemon, Python bridge, or polling timer is required.

## Install

```bash
./integrations/noctalia/install.sh
```

The installer:

1. Writes `~/.config/noctalia/noctalia-dnt.toml` with two user templates.
2. Copies the current wallpaper to `<extension>/noctalia-wallpaper.jpg`.
3. Runs `noctalia msg templates-apply`.
4. Prints the one-time browser steps.

If the extension lives somewhere other than this repository, pass the path:

```bash
./integrations/noctalia/install.sh --extension-dir ~/.config/caelestia/caelestia-dnt
```

Then load the extension in Thorium/Chromium:

1. `chrome://extensions`
2. Enable **Developer mode**
3. **Load unpacked** → select the extension directory

For the optional browser-chrome theme (tab strip, toolbar, frame):

1. `chrome://extensions` → **Load unpacked**
2. Select `~/.cache/noctalia-dnt/thorium-theme`

The theme is generated from the same palette. Restart the browser after a
palette or light/dark change so Chromium re-reads the theme manifest.

## Generated files

| File | Meaning |
|---|---|
| `<extension>/noctalia-theme.json` | Theme snapshot read by `newtab.js` and the service worker |
| `<extension>/noctalia-wallpaper.jpg` | Resized copy of the active Noctalia wallpaper |
| `~/.cache/noctalia-dnt/thorium-theme/manifest.json` | Optional Chromium theme extension |

Both extension files are gitignored.

## How it works

```toml
[theme.templates.user.noctalia_dnt]
input_path  = "/path/to/integrations/noctalia/theme.json.tpl"
output_path = "/path/to/extension/noctalia-theme.json"
post_hook   = "bash \"/path/to/sync-wallpaper.sh\" \"{{ image }}\""
hook_async  = false
```

Noctalia's template engine resolves `{{ colors.*.default.hex }}` for the active
mode and writes the JSON atomically. `{{ image }}` is the wallpaper that
produced the palette.

## Uninstall

```bash
./integrations/noctalia/uninstall.sh
```

Then remove the unpacked extension(s) from `chrome://extensions` if desired.

## Troubleshooting

- **`noctalia-theme.json` is missing** — run `noctalia msg templates-apply`.
  Check Noctalia Settings → Templates for the `noctalia_dnt` entries.
- **Colors do not change** — confirm the active source is wallpaper:
  `noctalia msg color-scheme-get` should start with `wallpaper`.
- **Browser chrome theme is stale** — restart Thorium. Chromium reads the
  unpacked theme manifest at startup.
- **No wallpaper on the new tab** — verify `noctalia-wallpaper.jpg` exists and
  that ImageMagick (`magick`) is installed.
