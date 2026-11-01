<div align="center">

# 🌌 Caelestia Dynamic New Tab
### A Keyboard-First Material Design 3 New Tab & Dynamic Site Themer for Chromium on Wayland / Hyprland

[![Manifest V3](https://img.shields.io/badge/Manifest-V3-6366f1?style=for-the-badge&logo=googlechrome&logoColor=white)](#)
[![Chromium Compatible](https://img.shields.io/badge/Browsers-Brave%20%7C%20Chrome%20%7C%20Edge%20%7C%20Vivaldi-3b82f6?style=for-the-badge&logo=brave&logoColor=white)](#)
[![Compositor](https://img.shields.io/badge/Compositor-Hyprland%20%2F%20Wayland-00c853?style=for-the-badge)](#)
[![Material You](https://img.shields.io/badge/Material%20You-Dynamic%20M3-f59e0b?style=for-the-badge&logo=materialdesign&logoColor=white)](#)

<p align="center">
  A keyboard-centric, distraction-free dashboard that synchronizes with your Linux desktop's active wallpaper palette in real time, respects window tiling, and styles websites like YouTube and GitHub with 0% CPU overhead.
</p>

</div>

---

## 📸 Screenshots

### 1. Zen / Focus Mode (Default View on Every New Tab)
> Opens by default in clean Zen mode with a minimal clock, contextual greeting, daily quote, and frosted desktop wallpaper. Press <kbd>S</kbd> or <kbd>/</kbd> anytime to summon the search bar.

![Zen Mode](screenshots/zen-mode.png)

---

### 2. Standard Mode (<kbd>Z</kbd>)
> Toggle the full dashboard view with <kbd>Z</kbd> to access quick shortcuts, tasks checklist, and an auto-saving scratchpad.

![Standard Mode](screenshots/standard-mode.png)

---

### 3. Dynamic Website Theming & Hidden Address Bar
> Applies your desktop wallpaper's Material You palette directly to websites (like GitHub and YouTube) in both Light and Dark mode while keeping the window tiled properly in Hyprland with the address bar hidden.

![Website Theming](screenshots/website-theming.png)

---

## ✨ Features

- **🧘 Keyboard-First Zen Mode by Default**: Every new tab opens in a peaceful, distraction-free Zen state. No need to click or move your mouse—keyboard focus is instantly asserted.
- **🔍 Quick Search Pop-over (<kbd>S</kbd> or <kbd>/</kbd>)**: Tap <kbd>S</kbd> or <kbd>/</kbd> anywhere on the page to instantly pop up the search bar, type your query or URL, and press <kbd>Enter</kbd>. Press <kbd>Esc</kbd> to return to clean Zen mode.
- **⚙️ Browser Quick Menu (<kbd>P</kbd>) & Settings (<kbd>Ctrl</kbd> + <kbd>P</kbd>)**:
  - Press <kbd>P</kbd> to open the Browser Quick Menu (History, Bookmarks, Downloads, Extensions, Settings).
  - Press <kbd>Ctrl</kbd> + <kbd>P</kbd> to jump straight into Browser Settings.
- **🎨 Live Material You Color Parity**: Automatically adapts to dynamic color schemes generated from your wallpaper (`~/.local/state/caelestia/scheme.json`), seamlessly transitioning between light and dark modes with WCAG AAA high contrast readability.
- **🪟 Tiling-First Window Management**: Never breaks your window manager's tiling tree. Open apps side-by-side (e.g. Brave next to Foot or Kitty terminal) with proper resizing, gaps, and borders.
- **⌨️ Toggleable Navigation Hints Bar (<kbd>K</kbd> / <kbd>?</kbd>)**: Built-in reference for tab navigation. Toggle on/off with <kbd>K</kbd>.
- **🌤️ Local Weather Pill**: Real-time temperature, condition icon, and city name powered by the Open-Meteo API.
- **⚡ Lightweight Site Theming**: Declarative CSS overrides for **YouTube**, **GitHub**, **Reddit**, and **Wikipedia** that eliminate harsh pitch-black/pure-white contrast in favor of your dynamic palette—with **0% CPU/GPU overhead** (no continuous `MutationObserver` loops).
- **📝 Productivity Cards**:
  - **Quick Tasks**: Daily checklist with completion status saved locally.
  - **Scratchpad**: Auto-saving scratchpad for quick notes, links, and commands.

---

## ⌨️ Keyboard Shortcuts Reference

| Shortcut | Action |
| :--- | :--- |
| <kbd>S</kbd> or <kbd>/</kbd> | **Summon Quick Search** (instantly type a query or URL, <kbd>Enter</kbd> to go) |
| <kbd>Esc</kbd> | **Dismiss Search or Close Menus** (returns focus to dashboard) |
| <kbd>P</kbd> | **Open Browser Quick Menu** (History, Bookmarks, Downloads, Extensions) |
| <kbd>Ctrl</kbd> + <kbd>P</kbd> | **Open Browser Settings** (`chrome://settings`) |
| <kbd>Z</kbd> | **Toggle Zen Focus Mode** (switches between Zen and full widget dashboard) |
| <kbd>K</kbd> / <kbd>H</kbd> / <kbd>?</kbd> | **Toggle Navigation Hints Bar** (shows/hides the top-right shortcut pills) |
| <kbd>Ctrl</kbd> + <kbd>1</kbd>–<kbd>9</kbd> | Switch to tab 1 through 9 |
| <kbd>Ctrl</kbd> + <kbd>Tab</kbd> | Cycle to next tab |
| <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>Tab</kbd> | Cycle to previous tab |
| <kbd>Ctrl</kbd> + <kbd>W</kbd> | Close active tab |
| <kbd>Ctrl</kbd> + <kbd>T</kbd> | Open new tab |

---

## 🌐 Browser Compatibility

Built with standard **Chromium Manifest V3** and 100% compatible with:
- **Brave**
- **Google Chrome**
- **Microsoft Edge**
- **Vivaldi**
- **Chromium / Thorium / CachyOS Browser**
- **Ungoogled Chromium**

---

## 🪟 Hyprland Integration (Hide Address Bar in Tiled Mode)

To achieve the clean, address-bar-free appearance while keeping the window tiled properly alongside your terminal:

### In Caelestia Shell (`~/.config/caelestia/hypr-user.lua`):
```lua
hl.window_rule({ match = { class = "brave-browser" }, fullscreen_state = "0 2" })
```

### In Vanilla Hyprland (`~/.config/hypr/hyprland.conf`):
```ini
windowrulev2 = fullscreenstate 0 2, class:^(brave-browser)$
```

---

## 📄 License

MIT License. Designed with ❤️ for clean desktop aesthetics.
