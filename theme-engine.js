// theme-engine.js - Cross-platform theme palette generator and extractor for Caelestia-DNT
// Supports:
// 1. Caelestia Dynamic (from local caelestia-theme.json)
// 2. Custom Wallpaper client-side color extraction via HTML5 Canvas
// 3. Curated Designer Presets (Caelestia Violet, Catppuccin Mocha, Tokyo Night, Nord Frost, Forest Matcha, Sunset Ember)

(function(global) {
  'use strict';

  // --- Curated Preset Palettes ---
  const PRESETS = {
    'caelestia-violet': {
      name: 'Caelestia Violet',
      mode: 'dark',
      colours: {
        primary: '#f9b7a9',
        onPrimary: '#61342a',
        primaryContainer: '#76453b',
        onPrimaryContainer: '#ffdbd4',
        surface: '#130d0b',
        onSurface: '#f9e0db',
        surfaceVariant: '#302220',
        onSurfaceVariant: '#bca6a2',
        surfaceContainer: '#221715',
        surfaceContainerHigh: '#291d1a',
        surfaceContainerHighest: '#302220',
        surfaceContainerLow: '#1a110f',
        outline: '#84716d',
        outlineVariant: '#554441',
        secondary: '#e7bdb4',
        onSecondary: '#563933',
        secondaryContainer: '#51342e',
        onSecondaryContainer: '#dfb6ad',
        tertiary: '#ffe4c0',
        onTertiary: '#6d501d',
        tertiaryContainer: '#fed494',
        onTertiaryContainer: '#644715'
      }
    },
    'catppuccin-mocha': {
      name: 'Catppuccin Mocha',
      mode: 'dark',
      colours: {
        primary: '#cba6f7',
        onPrimary: '#11111b',
        primaryContainer: '#45355c',
        onPrimaryContainer: '#f5e0dc',
        surface: '#1e1e2e',
        onSurface: '#cdd6f4',
        surfaceVariant: '#313244',
        onSurfaceVariant: '#bac2de',
        surfaceContainer: '#181825',
        surfaceContainerHigh: '#24273a',
        surfaceContainerHighest: '#313244',
        surfaceContainerLow: '#11111b',
        outline: '#7f849c',
        outlineVariant: '#45475a',
        secondary: '#f5c2e7',
        onSecondary: '#181825',
        secondaryContainer: '#533c50',
        onSecondaryContainer: '#f5e0dc',
        tertiary: '#89dceb',
        onTertiary: '#11111b',
        tertiaryContainer: '#29434e',
        onTertiaryContainer: '#b4befe'
      }
    },
    'tokyo-night': {
      name: 'Tokyo Night',
      mode: 'dark',
      colours: {
        primary: '#7aa2f7',
        onPrimary: '#1a1b26',
        primaryContainer: '#283457',
        onPrimaryContainer: '#c0caf5',
        surface: '#1a1b26',
        onSurface: '#c0caf5',
        surfaceVariant: '#24283b',
        onSurfaceVariant: '#a9b1d6',
        surfaceContainer: '#16161e',
        surfaceContainerHigh: '#1f2335',
        surfaceContainerHighest: '#292e42',
        surfaceContainerLow: '#13141c',
        outline: '#7aa2f7',
        outlineVariant: '#3b4261',
        secondary: '#bb9af7',
        onSecondary: '#1a1b26',
        secondaryContainer: '#3d3859',
        onSecondaryContainer: '#cfc9ff',
        tertiary: '#7dcfff',
        onTertiary: '#1a1b26',
        tertiaryContainer: '#274b5e',
        onTertiaryContainer: '#bfe3ff'
      }
    },
    'nord-frost': {
      name: 'Nord Frost',
      mode: 'dark',
      colours: {
        primary: '#88c0d0',
        onPrimary: '#2e3440',
        primaryContainer: '#3b4252',
        onPrimaryContainer: '#eceff4',
        surface: '#2e3440',
        onSurface: '#eceff4',
        surfaceVariant: '#3b4252',
        onSurfaceVariant: '#d8dee9',
        surfaceContainer: '#242933',
        surfaceContainerHigh: '#3b4252',
        surfaceContainerHighest: '#434c5e',
        surfaceContainerLow: '#1e222a',
        outline: '#81a1c1',
        outlineVariant: '#4c566a',
        secondary: '#81a1c1',
        onSecondary: '#2e3440',
        secondaryContainer: '#3b4252',
        onSecondaryContainer: '#d8dee9',
        tertiary: '#b48ead',
        onTertiary: '#2e3440',
        tertiaryContainer: '#453a47',
        onTertiaryContainer: '#eceff4'
      }
    },
    'forest-matcha': {
      name: 'Forest Matcha',
      mode: 'dark',
      colours: {
        primary: '#a6d189',
        onPrimary: '#1e291b',
        primaryContainer: '#31442c',
        onPrimaryContainer: '#d8eed0',
        surface: '#161c15',
        onSurface: '#e4eee2',
        surfaceVariant: '#252f23',
        onSurfaceVariant: '#bac8b6',
        surfaceContainer: '#121711',
        surfaceContainerHigh: '#1e261c',
        surfaceContainerHighest: '#2b3629',
        surfaceContainerLow: '#0e120d',
        outline: '#788f73',
        outlineVariant: '#3e4e3b',
        secondary: '#81c8be',
        onSecondary: '#142926',
        secondaryContainer: '#254440',
        onSecondaryContainer: '#caf0ea',
        tertiary: '#e5c890',
        onTertiary: '#332711',
        tertiaryContainer: '#4a3d24',
        onTertiaryContainer: '#fae6c0'
      }
    },
    'sunset-ember': {
      name: 'Sunset Ember',
      mode: 'dark',
      colours: {
        primary: '#ff8a65',
        onPrimary: '#3e1709',
        primaryContainer: '#5e2a16',
        onPrimaryContainer: '#ffd6c4',
        surface: '#181210',
        onSurface: '#f5e4df',
        surfaceVariant: '#2e211c',
        onSurfaceVariant: '#d4bcb3',
        surfaceContainer: '#130d0b',
        surfaceContainerHigh: '#211815',
        surfaceContainerHighest: '#2f221e',
        surfaceContainerLow: '#0c0807',
        outline: '#997365',
        outlineVariant: '#543b31',
        secondary: '#ffb74d',
        onSecondary: '#3b2400',
        secondaryContainer: '#5c3d0e',
        onSecondaryContainer: '#ffe6bf',
        tertiary: '#f48fb1',
        onTertiary: '#3d1020',
        tertiaryContainer: '#5e2338',
        onTertiaryContainer: '#ffd6e3'
      }
    }
  };

  // Convert RGB to Hex string
  function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => Math.round(Math.max(0, Math.min(255, x))).toString(16).padStart(2, '0')).join('');
  }

  // Convert Hex to RGB object
  function hexToRgb(hex) {
    let clean = hex.replace('#', '');
    if (clean.length === 3) {
      clean = clean.split('').map(c => c + c).join('');
    }
    const num = parseInt(clean, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255
    };
  }

  // Convert RGB to HSL
  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return [h * 360, s, l];
  }

  // Convert HSL to RGB
  function hslToRgb(h, s, l) {
    h = (h % 360) / 360;
    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    return rgbToHex(r * 255, g * 255, b * 255);
  }

  // Extract dominant accent color from image via HTML5 Canvas
  function extractPaletteFromImage(imageEl) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const width = 120;
    const height = Math.max(1, Math.round((imageEl.naturalHeight || imageEl.height || 100) * (width / (imageEl.naturalWidth || imageEl.width || 100))));
    canvas.width = width;
    canvas.height = height;

    try {
      ctx.drawImage(imageEl, 0, 0, width, height);
      const imgData = ctx.getImageData(0, 0, width, height).data;

      // Sample pixels and bin by hue
      const bins = Array(12).fill(0).map(() => ({ count: 0, rSum: 0, gSum: 0, bSum: 0, satSum: 0 }));
      let totalSamples = 0;

      for (let i = 0; i < imgData.length; i += 16) { // step by 4 pixels (16 bytes)
        const r = imgData[i];
        const g = imgData[i + 1];
        const b = imgData[i + 2];
        const a = imgData[i + 3];

        if (a < 128) continue; // ignore transparent
        const [h, s, l] = rgbToHsl(r, g, b);

        // Ignore extreme black / extreme white for primary accent extraction
        if (l < 0.12 || l > 0.90 || s < 0.15) continue;

        const binIdx = Math.floor(h / 30) % 12;
        bins[binIdx].count += 1 + s * 1.5; // weigh saturated colors higher
        bins[binIdx].rSum += r;
        bins[binIdx].gSum += g;
        bins[binIdx].bSum += b;
        bins[binIdx].satSum += s;
        totalSamples++;
      }

      // Find top color bin
      bins.sort((a, b) => b.count - a.count);
      let dominantHex = '#f9b7a9'; // fallback

      if (bins[0] && bins[0].count > 0) {
        const count = bins[0].count;
        const avgR = bins[0].rSum / count;
        const avgG = bins[0].gSum / count;
        const avgB = bins[0].bSum / count;
        dominantHex = rgbToHex(avgR, avgG, avgB);
      }

      const palette = generateMaterialPalette(dominantHex, true);
      palette._dominantHex = dominantHex;
      return palette;
    } catch (err) {
      console.warn('Canvas color extraction error, fallback to default:', err);
      return PRESETS['caelestia-violet'].colours;
    }
  }

  // Generate full harmonious Material You style tokens from a single key hex color picked from wallpaper
  function generateMaterialPalette(keyHex, isDark = true) {
    const rgb = hexToRgb(keyHex);
    const [h, s] = rgbToHsl(rgb.r, rgb.g, rgb.b);

    const sat = Math.max(0.35, Math.min(0.85, s));
    const secHue = (h + 30) % 360;
    const tertHue = (h + 60) % 360;

    if (isDark) {
      return {
        primary: hslToRgb(h, sat, 0.78),
        onPrimary: hslToRgb(h, sat, 0.18),
        primaryContainer: hslToRgb(h, sat, 0.28),
        onPrimaryContainer: hslToRgb(h, sat, 0.92),

        surface: hslToRgb(h, 0.12, 0.06),
        onSurface: hslToRgb(h, 0.15, 0.92),
        surfaceVariant: hslToRgb(h, 0.14, 0.16),
        onSurfaceVariant: hslToRgb(h, 0.12, 0.74),

        surfaceContainer: hslToRgb(h, 0.12, 0.10),
        surfaceContainerHigh: hslToRgb(h, 0.12, 0.13),
        surfaceContainerHighest: hslToRgb(h, 0.12, 0.16),
        surfaceContainerLow: hslToRgb(h, 0.12, 0.08),

        outline: hslToRgb(h, 0.15, 0.52),
        outlineVariant: hslToRgb(h, 0.15, 0.28),

        secondary: hslToRgb(secHue, sat * 0.7, 0.75),
        onSecondary: hslToRgb(secHue, sat * 0.7, 0.18),
        secondaryContainer: hslToRgb(secHue, sat * 0.7, 0.26),
        onSecondaryContainer: hslToRgb(secHue, sat * 0.7, 0.90),

        tertiary: hslToRgb(tertHue, sat * 0.8, 0.80),
        onTertiary: hslToRgb(tertHue, sat * 0.8, 0.18),
        tertiaryContainer: hslToRgb(tertHue, sat * 0.8, 0.28),
        onTertiaryContainer: hslToRgb(tertHue, sat * 0.8, 0.92),

        // Harmonious semantic colors derived dynamically from wallpaper hue
        green: hslToRgb(142, sat * 0.75, 0.75),
        success: hslToRgb(142, sat * 0.75, 0.75),
        yellow: hslToRgb(45, sat * 0.85, 0.80),
        peach: hslToRgb(30, sat * 0.85, 0.80),
        error: hslToRgb(8, sat * 0.85, 0.75),
        red: hslToRgb(8, sat * 0.85, 0.75),
        mauve: hslToRgb(285, sat * 0.70, 0.80),
        blue: hslToRgb(215, sat * 0.80, 0.78)
      };
    } else {
      return {
        primary: hslToRgb(h, sat, 0.40),
        onPrimary: '#ffffff',
        primaryContainer: hslToRgb(h, sat, 0.90),
        onPrimaryContainer: hslToRgb(h, sat, 0.12),

        surface: hslToRgb(h, 0.08, 0.98),
        onSurface: hslToRgb(h, 0.10, 0.12),
        surfaceVariant: hslToRgb(h, 0.10, 0.90),
        onSurfaceVariant: hslToRgb(h, 0.10, 0.32),

        surfaceContainer: hslToRgb(h, 0.08, 0.94),
        surfaceContainerHigh: hslToRgb(h, 0.08, 0.92),
        surfaceContainerHighest: hslToRgb(h, 0.08, 0.90),
        surfaceContainerLow: hslToRgb(h, 0.08, 0.96),

        outline: hslToRgb(h, 0.10, 0.50),
        outlineVariant: hslToRgb(h, 0.10, 0.78),

        secondary: hslToRgb(secHue, sat * 0.7, 0.42),
        onSecondary: '#ffffff',
        secondaryContainer: hslToRgb(secHue, sat * 0.7, 0.90),
        onSecondaryContainer: hslToRgb(secHue, sat * 0.7, 0.14),

        tertiary: hslToRgb(tertHue, sat * 0.8, 0.42),
        onTertiary: '#ffffff',
        tertiaryContainer: hslToRgb(tertHue, sat * 0.8, 0.92),
        onTertiaryContainer: hslToRgb(tertHue, sat * 0.8, 0.14),

        // Harmonious semantic colors derived dynamically from wallpaper hue (Light mode)
        green: hslToRgb(142, sat * 0.75, 0.35),
        success: hslToRgb(142, sat * 0.75, 0.35),
        yellow: hslToRgb(45, sat * 0.85, 0.40),
        peach: hslToRgb(30, sat * 0.85, 0.45),
        error: hslToRgb(8, sat * 0.85, 0.45),
        red: hslToRgb(8, sat * 0.85, 0.45),
        mauve: hslToRgb(285, sat * 0.70, 0.45),
        blue: hslToRgb(215, sat * 0.80, 0.40)
      };
    }
  }

  // Apply colors to document root
  function applyPaletteToRoot(colours, rootEl = document.documentElement) {
    if (!colours) return;
    for (const [key, rawVal] of Object.entries(colours)) {
      if (typeof rawVal !== 'string') continue;
      const hex = rawVal.startsWith('#') ? rawVal : `#${rawVal}`;
      const kebab = key.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
      rootEl.style.setProperty(`--md-sys-color-${kebab}`, hex);
    }
  }

  global.CaelestiaThemeEngine = {
    PRESETS,
    rgbToHex,
    hexToRgb,
    rgbToHsl,
    hslToRgb,
    generateMaterialPalette,
    extractPaletteFromImage,
    applyPaletteToRoot
  };
})(typeof window !== 'undefined' ? window : this);
