#!/usr/bin/env bash
# install-native-host.sh - Register Caelestia-DNT Native Messaging Host
# Supports Chromium, Google Chrome, Brave, Thorium, Microsoft Edge, and Vivaldi.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HOST_SCRIPT="$SCRIPT_DIR/caelestia-native-host.py"
HOST_NAME="com.caelestia.dnt"

chmod +x "$HOST_SCRIPT"
chmod +x "$SCRIPT_DIR/caelestia-bridge.py"

# Known Chromium-based user NativeMessagingHosts directories
TARGET_DIRS=(
  "$HOME/.config/google-chrome/NativeMessagingHosts"
  "$HOME/.config/chromium/NativeMessagingHosts"
  "$HOME/.config/BraveSoftware/Brave-Browser/NativeMessagingHosts"
  "$HOME/.config/thorium/NativeMessagingHosts"
  "$HOME/.config/microsoft-edge/NativeMessagingHosts"
  "$HOME/.config/vivaldi/NativeMessagingHosts"
)

MANIFEST_CONTENT=$(cat <<EOF
{
  "name": "$HOST_NAME",
  "description": "Caelestia-DNT Universal Desktop Bridge",
  "path": "$HOST_SCRIPT",
  "type": "stdio",
  "allowed_origins": [
    "chrome-extension://*/*"
  ]
}
EOF
)

INSTALLED_COUNT=0

for dir in "${TARGET_DIRS[@]}"; do
  # Install if parent browser configuration directory exists on the system
  parent="$(dirname "$dir")"
  if [[ -d "$parent" ]]; then
    mkdir -p "$dir"
    echo "$MANIFEST_CONTENT" > "$dir/$HOST_NAME.json"
    echo "✔ Registered Native Host in: $dir"
    INSTALLED_COUNT=$((INSTALLED_COUNT + 1))
  fi
done

echo ""
echo "✨ Caelestia-DNT Native Messaging Host installed for $INSTALLED_COUNT browser profile(s)."
echo "   Host binary path: $HOST_SCRIPT"
