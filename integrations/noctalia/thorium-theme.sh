#!/usr/bin/env bash
# Noctalia post_hook for the optional Thorium/Chromium chrome theme.
# The rendered manifest lives in a stable cache directory; Chromium keeps the
# unpacked theme installed and picks up palette rewrites after a restart.
set -euo pipefail

theme_dir="${XDG_CACHE_HOME:-$HOME/.cache}/noctalia-dnt/thorium-theme"
note_file="$theme_dir/INSTALL.txt"

mkdir -p "$theme_dir"

if [[ ! -f "$note_file" ]]; then
  cat >"$note_file" <<EOF
Noctalia theme for Thorium / Chromium — load it once:

  1. Open Thorium and go to chrome://extensions
  2. Enable Developer mode (top-right toggle)
  3. Click "Load unpacked" and choose:
     $theme_dir

The theme stays installed. Noctalia rewrites manifest.json on every palette
change; restart Thorium after a palette or light/dark change to apply it.
EOF
  echo "Noctalia: load the browser theme once from chrome://extensions (details in $note_file)" >&2
fi
