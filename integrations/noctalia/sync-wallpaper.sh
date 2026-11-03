#!/usr/bin/env bash
# Copy the wallpaper Noctalia just applied into the extension directory.
# Noctalia calls this through a user-template post_hook, passing {{ image }}.
set -euo pipefail

image="${1:-}"
if [[ -z "$image" || ! -f "$image" ]]; then
  # Built-in/community colour schemes can render without a source image.
  exit 0
fi

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
extension_dir="${CAELESTIA_DNT_DIR:-$(cd -- "$script_dir/../.." && pwd)}"
output="$extension_dir/noctalia-wallpaper.jpg"

if [[ ! -d "$extension_dir" ]]; then
  echo "Caelestia-DNT: extension directory not found: $extension_dir" >&2
  exit 1
fi

tmp="$(mktemp "$extension_dir/.noctalia-wallpaper.XXXXXX.jpg")"
trap 'rm -f -- "$tmp"' EXIT

if command -v magick >/dev/null 2>&1; then
  magick "$image" -auto-orient -resize '2560x2560>' -strip -quality 86 "$tmp"
elif command -v convert >/dev/null 2>&1; then
  convert "$image" -auto-orient -resize '2560x2560>' -strip -quality 86 "$tmp"
else
  # Fallback: keep the original bytes. Chromium sniffs the image format.
  cp -- "$image" "$tmp"
fi

mv -f -- "$tmp" "$output"
trap - EXIT
