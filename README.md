<!-- Caelestia-DNT: Material You New Tab for Caelestia Shell & Hyprland -->
<h1 align="center">

<img src="icons/icon128.png" width="64" alt="Caelestia-DNT Logo">
<br>
Caelestia-DNT: Dynamic New Tab

</h1>

<div align="center">

**A keyboard-first, distraction-free new tab and dynamic site themer strictly synchronized with Caelestia Shell & Hyprland Linux.**

</div>

<div align="center">

[![Manifest V3](https://img.shields.io/badge/Manifest-V3-6366f1?style=for-the-badge&logo=googlechrome&logoColor=white)](#)
[![Chromium Compatible](https://img.shields.io/badge/Browsers-Brave%20%7C%20Chrome%20%7C%20Edge%20%7C%20Vivaldi-3b82f6?style=for-the-badge&logo=brave&logoColor=white)](#)
[![Compositor](https://img.shields.io/badge/Compositor-Hyprland%20%2F%20Wayland-00c853?style=for-the-badge)](#)
[![Material You](https://img.shields.io/badge/Material%20You-Dynamic%20M3-f59e0b?style=for-the-badge&logo=materialdesign&logoColor=white)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](#)

</div>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-screenshots">Screenshots</a> •
  <a href="#-keyboard-shortcuts">Keyboard Shortcuts</a> •
  <a href="#-installation-guide">Installation Guide</a> •
  <a href="#-dynamic-theming-engine">Dynamic Theming</a> •
  <a href="#-privacy-policy">Privacy Policy</a> •
  <a href="#-license">License</a>
</p>

<img src="screenshots/zen-mode.png" alt="Caelestia-DNT Poster" width="100%">

---

## ✨ Features

- **Caelestia Shell Synchronization**: Automatically reads your desktop's live Material You color palette (`~/.local/state/caelestia/scheme.json`) whenever your wallpaper changes in Hyprland.
- **Hyprland Tiling Compliance**: Respects Wayland tiling gaps, window borders, and normal window states without breaking your window manager layout.
- **Zen / Focus Mode (<kbd>Z</kbd>)**: Opens by default in a clean, distraction-free view with a large clock, personalized greeting, and inspirational quotes. Enters immersive fullscreen and hides the browser address bar.
- **Integrated Quick Search (<kbd>S</kbd>)**: Instant floating search overlay with tab-to-switch search engines (Google, DuckDuckGo, YouTube, GitHub, Reddit, Wikipedia, Brave).
- **Curated Dynamic Website Theming**: Injects your desktop's exact wallpaper colors into **YouTube**, **GitHub**, **Reddit**, and **Wikipedia** with 100% dynamic token resolution and 0% CPU overhead.
- **Dashboard Tools (<kbd>Z</kbd>)**: Quick shortcuts grid, daily interactive task checklist, and an auto-saving scratchpad for quick notes.
- **Dynamic Motivational Quotes**: Curated collection across philosophy, anime, literature, and donghua with instant clipboard copy (<kbd>C</kbd>) and random refresh (<kbd>R</kbd>).
- **Quick Browser Menu (<kbd>P</kbd>)**: Fast keyboard access to tabs, downloads, history, bookmarks, and preferences.

---

## 📸 Screenshots

### 1. Zen / Focus Mode
> Distraction-free view featuring large clock, greeting, inspirational quote, and wallpaper background.

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
| <kbd>Z</kbd> | **Toggle Zen Mode** | Switch between minimalist Zen focus and full dashboard (hides address bar) |
| <kbd>S</kbd> or <kbd>/</kbd> | **Instant Search** | Opens floating search bar with search engine cycling via <kbd>Tab</kbd> |
| <kbd>P</kbd> | **Browser Menu** | Quick jump to tabs, history, downloads, bookmarks, and settings |
| <kbd>,</kbd> | **Preferences** | Open options page for display name, search engine, and layout preferences |
| <kbd>H</kbd> | **History** | Jump directly to browser browsing history |
| <kbd>C</kbd> | **Copy Quote** | Instantly copy current inspirational quote to clipboard |
| <kbd>R</kbd> | **New Quote** | Fetch a new random motivational quote |
| <kbd>K</kbd> | **Toggle Shortcuts Bar** | Show or collapse bottom navigation key hints |
| <kbd>Esc</kbd> | **Dismiss / Return** | Close open overlays, search dialogs, or return focus to the page |

---

## 📥 Installation Guide

### Prerequisites
* Arch Linux (or any Linux distribution running **Hyprland** and **Caelestia Shell**).
* Any Chromium-based browser (**Brave**, **Google Chrome**, **Microsoft Edge**, **Vivaldi**).

---

### 1. Clone the Extension
```bash
git clone https://github.com/Muideen7/Caelestia-DNT.git ~/.config/caelestia/caelestia-dnt
```

---

### 2. Load into Chromium Browser
1. Open your browser and navigate to `chrome://extensions` (or `brave://extensions`).
2. Toggle **Developer mode** in the top right corner.
3. Click **Load unpacked** and select the `~/.config/caelestia/caelestia-dnt` directory.
4. Open a new tab (`Ctrl + T`) to launch Caelestia-DNT!

---

### 3. Configure Caelestia Shell Integration
To sync wallpapers and colors automatically whenever your desktop theme changes, register the sync command in `~/.config/caelestia/cli.json`:

```json
{
  "theme": {
    "postHook": "cp -f "$HOME/.local/state/caelestia/scheme.json" "$HOME/.config/caelestia/caelestia-dnt/caelestia-theme.json""
  },
  "wallpaper": {
    "postHook": "cp -f "$HOME/.local/state/caelestia/scheme.json" "$HOME/.config/caelestia/caelestia-dnt/caelestia-theme.json""
  }
}
```

---

## 🎨 Dynamic Theming Engine

Caelestia-DNT utilizes **100% dynamic token resolution** with zero hardcoded colors:

1. **Wallpaper Extraction**: Whenever you switch wallpapers in Caelestia Shell, Material You extracts the dominant seed hue, generates tonal containers, surfaces, borders, and semantic accents.
2. **PostHook Delivery**: The scheme is written to `caelestia-theme.json`, which the background service worker broadcasts into `chrome.storage.local`.
3. **Declarative DOM Injection**: `content.js` resolves all CSS variables (`--bgColor-default`, `--color-accent-fg`, etc.) from the active palette and applies them dynamically to supported sites without layout breakage.

---

## 🛡 Privacy Policy

Caelestia-DNT is built strictly for personal privacy:
- **No Analytics & No Trackers**: No telemetry, analytics, or remote logging.
- **100% Local Storage**: Tasks, notes, display name, and preferences remain solely on your machine.
- **No Ads & Free**: Completely open-source under the MIT License.

---

## 📜 License

This project is licensed under the **MIT License**. See the [LICENSE](./LICENSE) file for details.
