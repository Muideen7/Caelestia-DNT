// Caelestia Material You declarative CSS injector
// Targets YouTube, GitHub, Reddit, and Wikipedia with 0% CPU overhead (no MutationObservers)

(() => {
  'use strict';

  const STYLE_ID = 'caelestia-dynamic-site-theme';

  function camelToKebab(str) {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
  }

  function getHex(val) {
    if (!val) return '';
    return val.startsWith('#') ? val : `#${val}`;
  }

  function buildYouTubeCSS(colors, isDark) {
    const bg = getHex(colors.background) || (isDark ? '#130d0b' : '#fff8f6');
    const surface = getHex(colors.surface) || bg;
    const surfaceLow = getHex(colors.surfaceContainerLow) || (isDark ? '#1a110f' : '#fef0ee');
    const surfaceMid = getHex(colors.surfaceContainer) || (isDark ? '#221715' : '#fae9e7');
    const surfaceHigh = getHex(colors.surfaceContainerHigh) || (isDark ? '#291d1a' : '#f4e4e1');
    const surfaceHighest = getHex(colors.surfaceContainerHighest) || (isDark ? '#302220' : '#eedddb');
    const onSurface = getHex(colors.onSurface) || (isDark ? '#f9e0db' : '#221918');
    const onSurfaceVar = getHex(colors.onSurfaceVariant) || (isDark ? '#bca6a2' : '#534341');
    const outline = getHex(colors.outlineVariant) || (isDark ? '#554441' : '#d8c2bf');
    const primary = getHex(colors.primary) || (isDark ? '#f9b7a9' : '#8c4e44');
    const onPrimary = getHex(colors.onPrimary) || (isDark ? '#61342a' : '#ffffff');
    const primContainer = getHex(colors.primaryContainer) || (isDark ? '#76453b' : '#ffdad4');
    const onPrimContainer = getHex(colors.onPrimaryContainer) || (isDark ? '#ffdbd4' : '#3a0b06');

    return `
      /* --- YouTube Caelestia Material You Overrides --- */
      html, html[dark], [dark], ytd-app {
        --yt-spec-base-background: ${bg} !important;
        --yt-spec-raised-background: ${surfaceLow} !important;
        --yt-spec-menu-background: ${surfaceMid} !important;
        --yt-spec-general-background-a: ${bg} !important;
        --yt-spec-general-background-b: ${surfaceMid} !important;
        --yt-spec-brand-background-solid: ${bg} !important;
        --yt-spec-brand-background-primary: ${surfaceMid} !important;
        --yt-spec-brand-background-secondary: ${surfaceHigh} !important;
        --yt-spec-badge-chip-background: ${surfaceHigh} !important;
        --yt-spec-text-primary: ${onSurface} !important;
        --yt-spec-text-secondary: ${onSurfaceVar} !important;
        --yt-spec-static-brand-white: ${onSurface} !important;
        --yt-spec-call-to-action: ${primary} !important;
        --yt-spec-touch-response: ${primary} !important;
        --ytd-searchbox-background: ${surfaceLow} !important;
        --ytd-searchbox-text-color: ${onSurface} !important;
        background-color: ${bg} !important;
      }

      /* Masthead & Search */
      #masthead, ytd-masthead {
        background-color: ${surfaceMid} !important;
        border-bottom: 1px solid ${outline} !important;
      }

      #search-form, #container.ytd-searchbox {
        background-color: ${surfaceLow} !important;
        border-color: ${outline} !important;
      }

      #search-icon-legacy.ytd-searchbox {
        background-color: ${surfaceHigh} !important;
        border-color: ${outline} !important;
      }

      /* Guide Sidebar */
      #guide-content.ytd-app, ytd-guide-renderer, ytd-mini-guide-renderer {
        background-color: ${surfaceLow} !important;
      }

      /* Video Watch Page */
      ytd-watch-flexy {
        background-color: ${bg} !important;
      }

      /* Filter Chips */
      yt-chip-cloud-chip-renderer[chip-style="STYLE_DEFAULT"] {
        background-color: ${surfaceHigh} !important;
        color: ${onSurface} !important;
      }

      yt-chip-cloud-chip-renderer[chip-style="STYLE_DEFAULT"][selected] {
        background-color: ${primContainer} !important;
        color: ${onPrimContainer} !important;
      }

      /* Action buttons & Subscribe */
      ytd-button-renderer.ytd-subscribe-button-renderer ytd-button-renderer button,
      #subscribe-button button {
        background-color: ${primary} !important;
        color: ${onPrimary} !important;
        border-radius: 9999px !important;
      }

      /* Dialogs & Menus */
      ytd-menu-popup-renderer, tp-yt-paper-dialog {
        background-color: ${surfaceMid} !important;
        border: 1px solid ${outline} !important;
        border-radius: 16px !important;
      }
    `;
  }

  function buildGitHubCSS(colors, isDark) {
    const bg = getHex(colors.background) || (isDark ? '#130d0b' : '#fff8f6');
    const surfaceLow = getHex(colors.surfaceContainerLow) || (isDark ? '#1a110f' : '#fef0ee');
    const surfaceMid = getHex(colors.surfaceContainer) || (isDark ? '#221715' : '#fae9e7');
    const onSurface = getHex(colors.onSurface) || (isDark ? '#f9e0db' : '#221918');
    const onSurfaceVar = getHex(colors.onSurfaceVariant) || (isDark ? '#bca6a2' : '#534341');
    const outline = getHex(colors.outlineVariant) || (isDark ? '#554441' : '#d8c2bf');
    const primary = getHex(colors.primary) || (isDark ? '#f9b7a9' : '#8c4e44');

    return `
      /* --- GitHub Caelestia Material You Overrides --- */
      html, body, [data-color-mode="dark"] {
        --color-canvas-default: ${bg} !important;
        --color-canvas-subtle: ${surfaceLow} !important;
        --color-canvas-inset: ${surfaceLow} !important;
        --color-border-default: ${outline} !important;
        --color-border-muted: ${outline} !important;
        --color-fg-default: ${onSurface} !important;
        --color-fg-muted: ${onSurfaceVar} !important;
        --color-accent-fg: ${primary} !important;
        --color-accent-emphasis: ${primary} !important;
        background-color: ${bg} !important;
      }

      header.AppHeader {
        background-color: ${surfaceMid} !important;
        border-bottom: 1px solid ${outline} !important;
      }
    `;
  }

  function buildRedditCSS(colors, isDark) {
    const bg = getHex(colors.background) || (isDark ? '#130d0b' : '#fff8f6');
    const surfaceMid = getHex(colors.surfaceContainer) || (isDark ? '#221715' : '#fae9e7');
    const onSurface = getHex(colors.onSurface) || (isDark ? '#f9e0db' : '#221918');
    const outline = getHex(colors.outlineVariant) || (isDark ? '#554441' : '#d8c2bf');
    const primary = getHex(colors.primary) || (isDark ? '#f9b7a9' : '#8c4e44');

    return `
      /* --- Reddit Caelestia Material You Overrides --- */
      body, shreddit-app, [color-scheme="dark"] {
        --color-neutral-background: ${bg} !important;
        --color-neutral-background-weak: ${surfaceMid} !important;
        --color-neutral-content: ${onSurface} !important;
        --color-primary-background: ${primary} !important;
        background-color: ${bg} !important;
      }

      reddit-header-large, header {
        background-color: ${surfaceMid} !important;
        border-bottom: 1px solid ${outline} !important;
      }
    `;
  }

  function buildWikipediaCSS(colors, isDark) {
    const bg = getHex(colors.background) || (isDark ? '#130d0b' : '#fff8f6');
    const surfaceLow = getHex(colors.surfaceContainerLow) || (isDark ? '#1a110f' : '#fef0ee');
    const onSurface = getHex(colors.onSurface) || (isDark ? '#f9e0db' : '#221918');
    const onSurfaceVar = getHex(colors.onSurfaceVariant) || (isDark ? '#bca6a2' : '#534341');
    const outline = getHex(colors.outlineVariant) || (isDark ? '#554441' : '#d8c2bf');
    const primary = getHex(colors.primary) || (isDark ? '#f9b7a9' : '#8c4e44');

    return `
      /* --- Wikipedia Caelestia Material You Overrides --- */
      body, .mw-body, #content {
        background-color: ${bg} !important;
        color: ${onSurface} !important;
        border-color: ${outline} !important;
      }

      .mw-body a, #mw-content-text a {
        color: ${primary} !important;
      }

      #mw-navigation, .vector-header, .vector-sticky-header {
        background-color: ${surfaceLow} !important;
        color: ${onSurfaceVar} !important;
      }
    `;
  }

  function applyCaelestiaTheme(theme) {
    if (!theme || !theme.colours) return;

    const hostname = window.location.hostname.toLowerCase();
    const colors = theme.colours;
    const isDark = theme.mode !== 'light';

    let css = '';
    if (hostname.includes('youtube.com')) {
      css = buildYouTubeCSS(colors, isDark);
    } else if (hostname.includes('github.com')) {
      css = buildGitHubCSS(colors, isDark);
    } else if (hostname.includes('reddit.com')) {
      css = buildRedditCSS(colors, isDark);
    } else if (hostname.includes('wikipedia.org')) {
      css = buildWikipediaCSS(colors, isDark);
    }

    if (!css) return;

    let style = document.getElementById(STYLE_ID);
    if (!style) {
      style = document.createElement('style');
      style.id = STYLE_ID;
      const target = document.head || document.documentElement;
      target.appendChild(style);
    }
    style.textContent = css;
  }

  // 1. Initial load from chrome.storage
  try {
    chrome.storage.local.get(['caelestia_theme'], (result) => {
      if (result.caelestia_theme) {
        applyCaelestiaTheme(result.caelestia_theme);
      }
    });
  } catch (e) {}

  // 2. React dynamically whenever Caelestia theme / wallpaper / mode changes
  try {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local' && changes.caelestia_theme?.newValue) {
        applyCaelestiaTheme(changes.caelestia_theme.newValue);
      }
    });
  } catch (e) {}
})();
