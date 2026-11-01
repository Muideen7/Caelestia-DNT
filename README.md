<div align="center">

# 🌌 Caelestia Dynamic New Tab
### A Minimalist Material Design 3 New Tab & Dynamic Site Themer for Chromium on Wayland / Hyprland

[![Manifest V3](https://img.shields.io/badge/Manifest-V3-6366f1?style=for-the-badge&logo=googlechrome&logoColor=white)](#)
[![Chromium Compatible](https://img.shields.io/badge/Browsers-Brave%20%7C%20Chrome%20%7C%20Edge%20%7C%20Vivaldi-3b82f6?style=for-the-badge&logo=brave&logoColor=white)](#)
[![Compositor](https://img.shields.io/badge/Compositor-Hyprland%20%2F%20Wayland-00c853?style=for-the-badge)](#)
[![Material You](https://img.shields.io/badge/Material%20You-Dynamic%20M3-f59e0b?style=for-the-badge&logo=materialdesign&logoColor=white)](#)

<p align="center">
  A distraction-free, privacy-conscious dashboard that synchronizes with your Linux desktop's active wallpaper palette in real time, respects window tiling, and styles websites like YouTube and GitHub with 0% CPU overhead.
</p>

</div>

---

## 📸 Screenshots

### 1. Standard Mode (Dashboard Overview)
> Clean digital clock, greeting, weather pill, floating search bar, quick shortcuts, tasks checklist, and an auto-saving scratchpad over a frosted desktop wallpaper background.

![Standard Mode](screenshots/standard-mode.png)

---

### 2. Zen / Focus Mode (<kbd>Z</kbd>)
> Press <kbd>Z</kbd> to fade out all widgets and distractions, leaving only the minimal clock, contextual greeting, daily quote, and frosted desktop wallpaper.

![Zen Mode](screenshots/zen-mode.png)

---

### 3. Dynamic Website Theming & Hidden Address Bar
> Applies your desktop wallpaper's Material You palette directly to websites (like GitHub and YouTube) while keeping the window tiled properly in Hyprland with the address bar hidden.

![Website Theming](screenshots/website-theming.png)

---

## ✨ Features

- **🎨 Live Material You Color Parity**: Automatically adapts to dynamic color schemes generated from your wallpaper (`~/.local/state/caelestia/scheme.json`), seamlessly transitioning between light and dark modes.
- **🪟 Tiling-First Window Management**: Unlike traditional fullscreen extensions that hijack your screen, this extension never breaks your window manager's tiling tree. Open apps side-by-side (e.g. Brave next to Foot or Kitty terminal) with proper resizing, gaps, and borders.
- **🧘 Zen / Focus Mode**: Instant toggle with <kbd>Z</kbd> for a zero-distraction view.
- **⌨️ Keyboard Navigation Hints**: Built-in reference for tab navigation (<kbd>Ctrl</kbd> + <kbd>1-9</kbd>, <kbd>Ctrl</kbd> + <kbd>Tab</kbd>, <kbd>Ctrl</kbd> + <kbd>W</kbd>). Toggle the hint bar on/off with <kbd>K</kbd> (or <kbd>H</kbd> / <kbd>?</kbd>).
- **🌤️ Local Weather Pill**: Real-time temperature, condition icon, and city name powered by the Open-Meteo API (cached to prevent unnecessary requests).
- **🔍 Smart Search Bar**: Multi-engine selector (Google, Brave, DuckDuckGo, YouTube, Wikipedia) with direct URL resolution.
- **⚡ Lightweight Site Theming**: Declarative CSS overrides for **YouTube**, **GitHub**, **Reddit**, and **Wikipedia** that eliminate harsh pitch-black/pure-white contrast in favor of your dynamic palette—with **0% CPU/GPU overhead** (no continuous `MutationObserver` loops).
- **📝 Productivity Cards**:
  - **Quick Tasks**: Daily checklist with completion status saved locally.
  - **Scratchpad**: Auto-saving scratchpad for quick notes, links, and commands.

---

## 🌐 Browser Compatibility

This extension is built on standard **Chromium Manifest V3** and is 100% compatible with:

| Browser | Supported Platforms | Notes |
| :--- | :--- | :--- |
| **Brave** | Linux, macOS, Windows | Primary target |
| **Google Chrome** | Linux, macOS, Windows | Fully supported |
| **Microsoft Edge** | Linux, macOS, Windows | Fully supported |
| **Vivaldi** | Linux, macOS, Windows | Fully supported |
| **Chromium / Thorium / CachyOS Browser** | Linux | Fully supported |
| **Ungoogled Chromium** | Linux | Fully supported |

---

## 🚀 Installation

1. Clone or download this repository to your local machine:
   ```bash
   git clone https://github.com/your-username/caelestia-newtab.git
   ```
2. Open your browser and navigate to the Extensions management page:
   - **Brave**: `brave://extensions`
   - **Chrome**: `chrome://extensions`
   - **Edge**: `edge://extensions`
   - **Vivaldi**: `vivaldi://extensions`
3. Enable **Developer mode** (toggle in the top-right corner).
4. Click **Load unpacked** in the top-left corner.
5. Select the `caelestia-newtab` directory.
6. Open a new tab (<kbd>Ctrl</kbd> + <kbd>T</kbd>) to start using it!

---

## 🪟 Hyprland Integration (Hide Address Bar in Tiled Mode)

To achieve the clean, address-bar-free appearance shown in Screenshot 3 while keeping the window tiled properly alongside your terminal and other applications:

### In Caelestia Shell (`~/.config/caelestia/hypr-user.lua`):
Add the client-side fake-fullscreen rule:
```lua
hl.window_rule({ match = { class = "brave-browser" }, fullscreen_state = "0 2" })
```

### In Vanilla Hyprland (`~/.config/hypr/hyprland.conf`):
```ini
windowrulev2 = fullscreenstate 0 2, class:^(brave-browser)$
# Or for Google Chrome:
windowrulev2 = fullscreenstate 0 2, class:^(google-chrome)$
```

> **How it works:**
> - `internal: 0` instructs Hyprland to treat the window as a normal tiled window (respecting gaps, borders, and window resizing).
> - `client: 2` tells the browser it is in fullscreen, causing it to hide the address bar and omnibox header completely.

---

## ⌨️ Keyboard Shortcuts Reference

| Shortcut | Action |
| :--- | :--- |
| <kbd>Z</kbd> | Toggle **Zen Focus Mode** (hides search, widgets, and shortcuts) |
| <kbd>K</kbd> / <kbd>H</kbd> / <kbd>?</kbd> | Toggle **Navigation Hints Bar** (shows/hides the top-right shortcut pills) |
| <kbd>Ctrl</kbd> + <kbd>1</kbd>–<kbd>9</kbd> | Switch to tab 1 through 9 |
| <kbd>Ctrl</kbd> + <kbd>Tab</kbd> | Cycle to next tab |
| <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>Tab</kbd> | Cycle to previous tab |
| <kbd>Ctrl</kbd> + <kbd>W</kbd> | Close active tab |
| <kbd>Ctrl</kbd> + <kbd>T</kbd> | Open new tab |

---

## 🛠️ Customization & Palette Sync

The extension reads its color palette from `caelestia-theme.json`:

```json
{
  "name": "dynamic",
  "mode": "dark",
  "transparency": true,
  "colours": {
    "background": "130d0b",
    "onBackground": "f9e0db",
    "surface": "130d0b",
    "surfaceContainerLow": "1a110f",
    "surfaceContainer": "221715",
    "surfaceContainerHigh": "291d1a",
    "onSurface": "f9e0db",
    "primary": "f9b7a9",
    "onPrimary": "61342a",
    "outline": "84716d"
  }
}
```

- **For Caelestia Shell users**: Palette and desktop wallpaper sync automatically via `~/.config/caelestia/kde-scheme.py` whenever you change your wallpaper or toggle dark/light mode.
- **For Non-Caelestia Hyprland users**: Any tool that exports Material You JSON (such as `matugen`, `wallust`, or `pywal`) can write to `caelestia-theme.json` to achieve the same real-time color synchronization.

---

## 📄 License

MIT License. Designed with ❤️ for clean desktop aesthetics.
