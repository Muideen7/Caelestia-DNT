<!-- Caelestia-DNT: Material You New Tab for Noctalia/Niri and Caelestia/Hyprland -->
<h1 align="center">

<img src="icons/icon128.png" width="64" alt="Caelestia-DNT Logo">
<br>
Caelestia-DNT: Dynamic New Tab

</h1>

<div align="center">

**A keyboard-first, distraction-free new tab and dynamic site themer that follows your Linux desktop's Material You wallpaper palette.**

</div>

<div align="center">

[![Manifest V3](https://img.shields.io/badge/Manifest-V3-6366f1?style=for-the-badge&logo=googlechrome&logoColor=white)](#)
[![Chromium Compatible](https://img.shields.io/badge/Browsers-Thorium%20%7C%20Brave%20%7C%20Chrome%20%7C%20Edge%20%7C%20Vivaldi-3b82f6?style=for-the-badge&logo=brave&logoColor=white)](#)
[![Universal Linux](https://img.shields.io/badge/Linux-All%20DEs%20%26%20WMs-00c853?style=for-the-badge&logo=linux&logoColor=white)](#)
[![Noctalia + Niri](https://img.shields.io/badge/Noctalia%20%2B%20Niri-Supported-00c853?style=for-the-badge)](#)
[![Caelestia + Hyprland](https://img.shields.io/badge/Caelestia%20%2B%20Hyprland-Supported-00c853?style=for-the-badge)](#)
[![Material You](https://img.shields.io/badge/Material%20You-Dynamic%20M3-f59e0b?style=for-the-badge&logo=materialdesign&logoColor=white)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](#)

</div>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-compositor--tiling-engine">Tiling & Compositor Engine</a> •
  <a href="#-screenshots">Screenshots</a> •
  <a href="#-keyboard-shortcuts">Keyboard Shortcuts</a> •
  <a href="#-universal-linux-installation">Universal Install</a> •
  <a href="#-dynamic-theming-engine">Dynamic Theming</a> •
  <a href="#-privacy">Privacy</a> •
  <a href="#-license">License</a>
</p>

<img src="screenshots/zen-mode.png" alt="Caelestia-DNT Poster" width="100%">

---

## ✨ Features

- **Universal Linux Desktop Synchronization**: Auto-detects and synchronizes with **Noctalia (Niri)**, **Caelestia (Hyprland)**, **GNOME**, **KDE Plasma (5 & 6)**, **Sway**, **XFCE**, and wallpaper/theming tools (**Matugen**, **Pywal**, **Wallust**, **swww**, **hyprpaper**, **feh**, **nitrogen**, **waypaper**).
- **Tiling & Compositor-Aware Fullscreen Engine**: Built specifically for tiling compositors (Niri, Hyprland, Sway, i3) as well as floating desktops. Offers *Tiling Immersive* fullscreen that respects your tiling columns, smart gaps, and status bar (Waybar/Noctalia/Hyprpanel) without hijacking display outputs.
- **Dynamic Resizing Engine**: Automatically adapts layout when windows are split or columns resize:
  - *Compact* (<700px / 1/3 Niri column / vertical splits): fluid typography clamping, stacked widgets, and compact search.
  - *Split* (700px–1150px / 50-50 splits): balanced 2-column cards.
  - *Wide & Ultra-wide* (>1800px): centered content with full edge-to-edge wallpaper bleed.
  - *Compositor Single-App / Monocle*: automatically applies optimal padding when a browser window fills the workspace.
- **Native Messaging & Zero-Port Bridge**: Connects via WebExtensions Native Messaging (`./install-native-host.sh`) or a local Python bridge daemon (`caelestia-bridge.py`).
- **In-Browser HTML5 Canvas Palette Extraction**: Instant Material You palette generation directly from wallpaper image with full dark/light mode support.
- **Zen / Focus Mode (<kbd>Z</kbd>)**: Opens by default in a clean, distraction-free view with a large clock, greeting, and inspirational quotes.
- **Integrated Quick Search (<kbd>S</kbd>)**: Instant floating search overlay with a search-engine dropdown (Google, Brave, DuckDuckGo, YouTube, Wikipedia).
- **Curated website theming**: Injects your desktop palette into **YouTube**, **GitHub**, **Reddit**, and **Wikipedia**.
- **Dashboard tools**: Quick shortcuts grid, daily task checklist, and an auto-saving scratchpad.
- **Dynamic motivational quotes**: Curated collection with instant clipboard copy (<kbd>C</kbd>) and random refresh (<kbd>R</kbd>).
- **Quick Browser Menu (<kbd>P</kbd>)**: Fast keyboard access to tabs, downloads, history, bookmarks, extensions, and preferences.

---

## 📐 Compositor & Tiling Engine

Tiling compositors (like Niri, Hyprland, and Sway) manage windows dynamically. When traditional browser extensions trigger F11 window fullscreen, the compositor takes over the entire monitor, breaking your tiling layout and hiding your status bars.

Caelestia-DNT provides **three configurable fullscreen strategies**:

1. **Tiling Immersive (Default)**:
   - Operates *inside* the current window tile / column.
   - Hides navigation bars and expands clock, search, and wallpaper edge-to-edge.
   - Respects compositor margins, gaps, columns, and bars.
2. **Native Display Fullscreen (F11)**:
   - Classic OS window fullscreen across the monitor.
3. **HTML5 Tab Fullscreen**:
   - In-browser fullscreen API.

---

## ⌨️ Keyboard Shortcuts

| Key | Action | Description |
| :---: | :--- | :--- |
| <kbd>Z</kbd> | **Toggle Zen Mode** | Switch between minimalist Zen focus and full productivity dashboard |
| <kbd>F</kbd> / <kbd>F11</kbd> | **Toggle Fullscreen** | Toggle immersive tiling fullscreen or OS display fullscreen |
| <kbd>S</kbd> or <kbd>/</kbd> | **Instant Search** | Opens the floating search bar |
| <kbd>P</kbd> | **Browser Menu** | Quick jump to tabs, history, downloads, bookmarks, and settings |
| <kbd>,</kbd> | **Preferences** | Open the options page |
| <kbd>H</kbd> | **History** | Jump directly to browser history |
| <kbd>D</kbd> | **Downloads** | Jump directly to downloads |
| <kbd>B</kbd> | **Bookmarks** | Jump directly to bookmarks |
| <kbd>E</kbd> | **Extensions** | Jump directly to extensions |
| <kbd>C</kbd> | **Copy Quote** | Copy the current quote to the clipboard |
| <kbd>R</kbd> | **New Quote** | Fetch a new random quote |
| <kbd>K</kbd> | **Toggle Hints Bar** | Show or collapse the top navigation hints bar |
| <kbd>?</kbd> | **Welcome Tour** | Reopen the onboarding wizard |
| <kbd>Esc</kbd> | **Dismiss / Return** | Close overlays, search, or return focus to the page |

---

## 📥 Universal Linux Installation

### Option 1: Native Messaging Host (Recommended — Zero Open Ports)

Run once to register the native messaging host with all detected Chromium browsers (Thorium, Brave, Chrome, Chromium, Edge, Vivaldi):

```bash
chmod +x install-native-host.sh
./install-native-host.sh
```

### Option 2: Desktop Bridge Daemon

Alternatively, start the lightweight desktop bridge daemon (supports systemd user service):

```bash
python3 caelestia-bridge.py
```

### 1. Zen / Focus Mode
> Distraction-free view featuring a large clock, greeting, inspirational quote, and wallpaper background.

<img src="screenshots/zen-mode.png" alt="Zen Mode" width="100%">

---

### 2. Standard Dashboard Mode (<kbd>Z</kbd>)
> Full productivity dashboard with quick shortcuts, daily tasks checklist, and persistent scratchpad.

<img src="screenshots/standard-mode.png" alt="Standard Dashboard Mode" width="100%">

---

### 3. Dynamic Website Theming & Hidden Address Bar
> Automatically styles complex platforms like GitHub and YouTube using your desktop's active wallpaper palette.

<img src="screenshots/website-theming.png" alt="Website Theming" width="100%">

---

## ⌨️ Keyboard Shortcuts

| Key | Action | Description |
| :---: | :--- | :--- |
| <kbd>Z</kbd> / <kbd>F11</kbd> | **Toggle Zen Mode** | Switch between minimalist Zen focus and full dashboard (native window fullscreen) |
| <kbd>S</kbd> or <kbd>/</kbd> | **Instant Search** | Opens the floating search bar |
| <kbd>P</kbd> | **Browser Menu** | Quick jump to tabs, history, downloads, bookmarks, and settings |
| <kbd>,</kbd> | **Preferences** | Open the options page |
| <kbd>H</kbd> | **History** | Jump directly to browser history |
| <kbd>D</kbd> | **Downloads** | Jump directly to downloads |
| <kbd>B</kbd> | **Bookmarks** | Jump directly to bookmarks |
| <kbd>E</kbd> | **Extensions** | Jump directly to extensions |
| <kbd>C</kbd> | **Copy Quote** | Copy the current quote to the clipboard |
| <kbd>R</kbd> | **New Quote** | Fetch a new random quote |
| <kbd>K</kbd> | **Toggle Hints Bar** | Show or collapse the bottom navigation hints |
| <kbd>?</kbd> | **Welcome Tour** | Reopen the onboarding wizard |
| <kbd>Esc</kbd> | **Dismiss / Return** | Close overlays, search, or return focus to the page |

---

## 📥 Installation: CachyOS → Niri → Noctalia

### Prerequisites

- CachyOS / Arch Linux running **Niri** and **Noctalia Shell**.
- A Chromium-based browser. **Thorium** is used in the examples.
- `ImageMagick` (`magick`) for wallpaper resizing — already present on most CachyOS installs.

### 1. Clone the extension

```bash
git clone https://github.com/Muideen7/Caelestia-DNT.git ~/.config/caelestia/caelestia-dnt
cd ~/.config/caelestia/caelestia-dnt
```

### 2. Install the Noctalia bridge

```bash
./integrations/noctalia/install.sh
```

This writes `~/.config/noctalia/noctalia-dnt.toml`, copies the current wallpaper into the extension, and runs `noctalia msg templates-apply`. No background daemon is required.

If your extension lives somewhere else:

```bash
./integrations/noctalia/install.sh --extension-dir /path/to/extension
```

### 3. Load into Thorium / Chromium

1. Open `thorium://extensions` or `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked** and select `~/.config/caelestia/caelestia-dnt`.
4. Open a new tab (`Ctrl + T`).

### 4. Optional: theme the actual tab strip

Noctalia can also generate a Chromium theme extension:

1. In `chrome://extensions`, click **Load unpacked**.
2. Select `~/.cache/noctalia-dnt/thorium-theme`.
3. Restart Thorium after a palette or light/dark change.

This colors the browser frame, tab strip, toolbar, bookmark bar, and omnibox. The new tab itself is still rendered by Caelestia-DNT.

### 5. Verify the live sync

```bash
noctalia msg color-scheme-get      # should start with "wallpaper"
noctalia msg templates-apply
noctalia msg wallpaper-next        # change wallpaper, then reopen the new tab
noctalia msg theme-mode-toggle     # switch light/dark, then reopen the new tab
```

### How the Noctalia integration works

Noctalia renders two user templates whenever the palette changes:

| Generated file | Purpose |
|---|---|
| `<extension>/noctalia-theme.json` | Full Material 3 token snapshot read by the extension |
| `<extension>/noctalia-wallpaper.jpg` | Resized copy of the active wallpaper |
| `~/.cache/noctalia-dnt/thorium-theme/manifest.json` | Optional Chromium browser theme |

Both extension files are gitignored, so the repo stays clean. See [`integrations/noctalia/README.md`](integrations/noctalia/README.md) for the template reference, manual configuration, and troubleshooting.

---

## 🦀 Legacy: Caelestia + Hyprland

The original Caelestia workflow is still supported.

### 1. Clone

```bash
git clone https://github.com/Muideen7/Caelestia-DNT.git ~/.config/caelestia/caelestia-dnt
```

### 2. Load the extension

`chrome://extensions` → Developer mode → **Load unpacked** → select the clone directory.

### 3. Sync the scheme on wallpaper/theme changes

Register the post-hooks in `~/.config/caelestia/cli.json`:

```json
{
  "theme": {
    "postHook": "cp -f \"$HOME/.local/state/caelestia/scheme.json\" \"$HOME/.config/caelestia/caelestia-dnt/caelestia-theme.json\""
  },
  "wallpaper": {
    "postHook": "cp -f \"$HOME/.local/state/caelestia/scheme.json\" \"$HOME/.config/caelestia/caelestia-dnt/caelestia-theme.json\""
  }
}
```

The extension reads `noctalia-theme.json` first and falls back to `caelestia-theme.json`.

### Optional desktop bridge (packed installs)

`caelestia-bridge.py` serves the scheme and wallpaper over `http://127.0.0.1:39123` for setups where Noctalia/Caelestia cannot write inside the extension directory (for example, a Chrome Web Store install). It is not needed for the unpacked Noctalia workflow above.

---

## 🎨 Dynamic Theming Engine

Caelestia-DNT resolves colors dynamically at runtime:

1. **Palette generation**: Noctalia (or Caelestia) extracts a Material 3 palette from the active wallpaper.
2. **Template delivery**: Noctalia's template engine writes `noctalia-theme.json` with all semantic roles, plus `noctalia-wallpaper.jpg`.
3. **Extension application**: `newtab.js` maps the tokens to CSS custom properties and the wallpaper; the service worker broadcasts the same snapshot to `content.js`.
4. **Site injection**: `content.js` remaps the design tokens of YouTube, GitHub, Reddit, and Wikipedia without breaking their layouts.

Theme sources available in Preferences:

- **Desktop Dynamic** — live Noctalia/Caelestia palette (default).
- **Wallpaper Color Extractor** — upload any image and extract a palette in-browser.
- **Designer Presets** — Caelestia Violet, Catppuccin Mocha, Tokyo Night, Nord Frost, Forest Matcha, Sunset Ember.

---

## 🛡 Privacy

- **No analytics or telemetry.**
- Tasks, notes, display name, shortcuts, and preferences are stored locally.
- The new tab uses a few optional network services: Open-Meteo and ipapi.co for the weather pill, Quotable/DummyJSON for occasional online quotes, Google's favicon service for shortcut icons, and Google Fonts for typography. These requests are not used for tracking, but they do leave your machine. Block them at the network level if you prefer a fully offline new tab.
- The optional Python bridge binds to `127.0.0.1` only.

---

## 📜 License

This project is licensed under the **MIT License**. See the [LICENSE](./LICENSE) file for details.
