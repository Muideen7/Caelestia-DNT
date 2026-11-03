#!/usr/bin/env bash
# Remove the Noctalia integration and its generated files.
set -euo pipefail

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
repo_dir="$(cd -- "$script_dir/../.." && pwd)"
extension_dir="${CAELESTIA_DNT_DIR:-$repo_dir}"

config_home="${XDG_CONFIG_HOME:-$HOME/.config}"
cache_home="${XDG_CACHE_HOME:-$HOME/.cache}"
config_file="$config_home/noctalia/noctalia-dnt.toml"

rm -f -- "$config_file"
rm -f -- "$extension_dir/noctalia-theme.json" "$extension_dir/noctalia-wallpaper.jpg"
rm -rf -- "$cache_home/noctalia-dnt"

echo "Removed Noctalia integration: $config_file"
echo "Removed generated theme/wallpaper files from: $extension_dir"

if command -v noctalia >/dev/null 2>&1; then
  noctalia msg templates-apply >/dev/null 2>&1 || true
fi
