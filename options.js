// Options & Preferences Logic for Caelestia Dynamic New Tab

(() => {
  'use strict';

  // --- 1. Dynamic Theme Loading & Engine ---
  const engine = window.CaelestiaThemeEngine;

  async function loadTheme() {
    const themeSource = localStorage.getItem('caelestia_theme_source') || 'caelestia-dynamic';

    if (themeSource === 'preset') {
      const presetKey = localStorage.getItem('caelestia_theme_preset') || 'caelestia-violet';
      const preset = engine?.PRESETS?.[presetKey];
      if (preset) {
        document.documentElement.setAttribute('data-theme', preset.mode || 'dark');
        engine.applyPaletteToRoot(preset.colours);
      }
      return;
    }

    if (themeSource === 'wallpaper-upload') {
      const savedPaletteStr = localStorage.getItem('caelestia_custom_palette');
      if (savedPaletteStr) {
        try {
          const palette = JSON.parse(savedPaletteStr);
          document.documentElement.setAttribute('data-theme', 'dark');
          engine.applyPaletteToRoot(palette);
          return;
        } catch (e) {
          console.debug('Failed to parse custom palette:', e);
        }
      }
    }

    // Default: Caelestia Dynamic from local JSON (Linux / Caelestia Shell)
    try {
      const resp = await fetch(`./caelestia-theme.json?t=${Date.now()}`);
      if (!resp.ok) return;
      const theme = await resp.json();
      const root = document.documentElement;

      const mode = theme.mode || 'dark';
      root.setAttribute('data-theme', mode);

      if (theme.colours) {
        for (const [key, rawVal] of Object.entries(theme.colours)) {
          if (typeof rawVal !== 'string') continue;
          const hex = rawVal.startsWith('#') ? rawVal : `#${rawVal}`;
          root.style.setProperty(`--md-sys-color-${camelToKebab(key)}`, hex);
        }
      }
    } catch (e) {
      console.debug('Theme load error:', e);
    }
  }

  function camelToKebab(str) {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
  }

  loadTheme();

  // --- 2. Element References ---
  const displayNameInput = document.getElementById('displayNameInput');
  const btnSaveName = document.getElementById('btnSaveName');
  const greetingPreview = document.getElementById('greetingPreview');
  const radioZen = document.getElementById('radioZen');
  const radioDashboard = document.getElementById('radioDashboard');
  const toggleHints = document.getElementById('toggleHints');
  const btnRestartTour = document.getElementById('btnRestartTour');
  const saveToast = document.getElementById('saveToast');

  let toastTimer = null;
  function showToast(msg = 'Settings saved successfully!') {
    if (!saveToast) return;
    saveToast.textContent = msg;
    saveToast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      saveToast.classList.remove('show');
    }, 2400);
  }

  // --- 3. Profile & Display Name ---
  function updatePreview(name) {
    const clean = (name || '').trim() || 'FrontendGeek';
    if (greetingPreview) {
      greetingPreview.textContent = `Good Day, ${clean}`;
    }
  }

  const savedName = localStorage.getItem('caelestia_username') || 'FrontendGeek';
  if (displayNameInput) {
    displayNameInput.value = savedName;
    updatePreview(savedName);

    displayNameInput.addEventListener('input', () => {
      updatePreview(displayNameInput.value);
    });

    displayNameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        saveDisplayName();
      }
    });
  }

  function saveDisplayName() {
    const clean = (displayNameInput?.value || '').trim() || 'FrontendGeek';
    localStorage.setItem('caelestia_username', clean);
    if (chrome?.storage?.local) {
      chrome.storage.local.set({ caelestia_username: clean });
    }
    updatePreview(clean);
    showToast('Display name saved!');
  }

  if (btnSaveName) {
    btnSaveName.addEventListener('click', saveDisplayName);
  }

  // --- 4. Theming & Wallpaper Controller ---
  const wallpaperUploadBox = document.getElementById('wallpaperUploadBox');
  const presetsSection = document.getElementById('presetsSection');
  const wallpaperFileInput = document.getElementById('wallpaperFileInput');
  const wallpaperDropZone = document.getElementById('wallpaperDropZone');
  const wallpaperPreviewBar = document.getElementById('wallpaperPreviewBar');
  const wallpaperThumb = document.getElementById('wallpaperThumb');
  const wallpaperFilename = document.getElementById('wallpaperFilename');
  const extractedSwatches = document.getElementById('extractedSwatches');
  const btnResetWallpaper = document.getElementById('btnResetWallpaper');
  const presetBtns = document.querySelectorAll('.preset-btn');

  function updateThemeSourceUI(source) {
    if (wallpaperUploadBox) {
      wallpaperUploadBox.style.display = source === 'wallpaper-upload' ? 'flex' : 'none';
    }
    if (presetsSection) {
      presetsSection.style.display = source === 'preset' ? 'flex' : 'none';
    }
  }

  // Restore saved theme source radio
  const savedThemeSource = localStorage.getItem('caelestia_theme_source') || 'caelestia-dynamic';
  const currentSourceRadio = document.querySelector(`input[name="themeSource"][value="${savedThemeSource}"]`);
  if (currentSourceRadio) currentSourceRadio.checked = true;
  updateThemeSourceUI(savedThemeSource);

  // Restore saved preset active state
  const savedPreset = localStorage.getItem('caelestia_theme_preset') || 'caelestia-violet';
  presetBtns.forEach((btn) => {
    btn.classList.toggle('active', btn.getAttribute('data-preset') === savedPreset);
  });

  // Switch theme source
  document.querySelectorAll('input[name="themeSource"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      const newSource = radio.value;
      localStorage.setItem('caelestia_theme_source', newSource);
      if (chrome?.storage?.local) {
        chrome.storage.local.set({ caelestia_theme_source: newSource });
      }
      updateThemeSourceUI(newSource);
      loadTheme();

      let msg = 'Switched to Caelestia Dynamic sync';
      if (newSource === 'wallpaper-upload') msg = 'Wallpaper Color Extractor active';
      if (newSource === 'preset') msg = 'Designer Presets active';
      showToast(msg);
    });
  });

  // Handle Preset selection
  presetBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const presetKey = btn.getAttribute('data-preset');
      presetBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      localStorage.setItem('caelestia_theme_source', 'preset');
      localStorage.setItem('caelestia_theme_preset', presetKey);
      if (chrome?.storage?.local) {
        chrome.storage.local.set({
          caelestia_theme_source: 'preset',
          caelestia_theme_preset: presetKey
        });
      }

      const presetRadio = document.getElementById('themeSourcePreset');
      if (presetRadio) presetRadio.checked = true;
      updateThemeSourceUI('preset');

      const preset = engine?.PRESETS?.[presetKey];
      if (preset) {
        document.documentElement.setAttribute('data-theme', preset.mode || 'dark');
        engine.applyPaletteToRoot(preset.colours);
        showToast(`Theme set to ${preset.name}`);
      }
    });
  });

  // Render extracted swatches in preview bar
  function renderSwatches(palette) {
    if (!extractedSwatches || !palette) return;
    extractedSwatches.innerHTML = '';
    const sampleKeys = ['primary', 'secondary', 'tertiary', 'surfaceVariant', 'outline'];
    sampleKeys.forEach((k) => {
      if (palette[k]) {
        const dot = document.createElement('div');
        dot.className = 'color-swatch';
        dot.style.backgroundColor = palette[k];
        dot.title = `${k}: ${palette[k]}`;
        extractedSwatches.appendChild(dot);
      }
    });
  }

  // Restore wallpaper preview if saved
  const savedWallpaperData = localStorage.getItem('caelestia_custom_wallpaper_data');
  if (savedWallpaperData && wallpaperThumb && wallpaperPreviewBar) {
    wallpaperThumb.src = savedWallpaperData;
    wallpaperPreviewBar.style.display = 'flex';
    const savedPaletteStr = localStorage.getItem('caelestia_custom_palette');
    if (savedPaletteStr) {
      try {
        renderSwatches(JSON.parse(savedPaletteStr));
      } catch (e) {}
    }
  }

  // Process selected wallpaper image
  function processWallpaperFile(file) {
    if (!file || !file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, WEBP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imgDataUrl = e.target.result;
      const img = new Image();
      img.onload = () => {
        // Extract palette
        const palette = engine.extractPaletteFromImage(img);

        // Save palette & thumbnail
        localStorage.setItem('caelestia_theme_source', 'wallpaper-upload');
        localStorage.setItem('caelestia_custom_palette', JSON.stringify(palette));
        try {
          // Store thumbnail data URL
          localStorage.setItem('caelestia_custom_wallpaper_data', imgDataUrl);
        } catch (storageErr) {
          console.warn('Image too large for full storage, palette saved:', storageErr);
        }

        if (chrome?.storage?.local) {
          chrome.storage.local.set({
            caelestia_theme: {
              name: 'wallpaper-extracted',
              mode: 'dark',
              colours: palette,
              _dominantHex: palette._dominantHex
            },
            caelestia_theme_source: 'wallpaper-upload',
            caelestia_custom_palette: palette,
            caelestia_custom_wallpaper_data: imgDataUrl
          });
        }

        // Apply immediately
        engine.applyPaletteToRoot(palette);

        // Update preview UI
        if (wallpaperThumb) wallpaperThumb.src = imgDataUrl;
        if (wallpaperFilename) wallpaperFilename.textContent = file.name;
        if (wallpaperPreviewBar) wallpaperPreviewBar.style.display = 'flex';
        renderSwatches(palette);

        const wpRadio = document.getElementById('themeSourceWallpaper');
        if (wpRadio) wpRadio.checked = true;
        updateThemeSourceUI('wallpaper-upload');

        showToast('Wallpaper colors extracted & applied!');
      };
      img.src = imgDataUrl;
    };
    reader.readAsDataURL(file);
  }

  // File input change
  if (wallpaperFileInput) {
    wallpaperFileInput.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (file) processWallpaperFile(file);
    });
  }

  // Drag and drop onto dropzone
  if (wallpaperDropZone) {
    ['dragenter', 'dragover'].forEach((eventName) => {
      wallpaperDropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        wallpaperDropZone.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach((eventName) => {
      wallpaperDropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        wallpaperDropZone.classList.remove('dragover');
      });
    });

    wallpaperDropZone.addEventListener('drop', (e) => {
      const file = e.dataTransfer?.files?.[0];
      if (file) processWallpaperFile(file);
    });
  }

  // Reset custom wallpaper
  if (btnResetWallpaper) {
    btnResetWallpaper.addEventListener('click', () => {
      localStorage.removeItem('caelestia_custom_palette');
      localStorage.removeItem('caelestia_custom_wallpaper_data');
      if (wallpaperPreviewBar) wallpaperPreviewBar.style.display = 'none';
      if (extractedSwatches) extractedSwatches.innerHTML = '';
      if (wallpaperFileInput) wallpaperFileInput.value = '';

      // Fallback to Dynamic
      localStorage.setItem('caelestia_theme_source', 'caelestia-dynamic');
      const dynamicRadio = document.getElementById('themeSourceDynamic');
      if (dynamicRadio) dynamicRadio.checked = true;
      updateThemeSourceUI('caelestia-dynamic');
      loadTheme();
      showToast('Reset to Caelestia Dynamic theme');
    });
  }

  // --- 5. Startup & View Mode ---
  const isZenDefault = localStorage.getItem('caelestia_zen') !== 'false';
  if (radioZen && radioDashboard) {
    if (isZenDefault) {
      radioZen.checked = true;
    } else {
      radioDashboard.checked = true;
    }

    document.querySelectorAll('input[name="defaultView"]').forEach((radio) => {
      radio.addEventListener('change', () => {
        const isZen = radioZen.checked;
        localStorage.setItem('caelestia_zen', String(isZen));
        showToast(isZen ? 'Default startup set to Zen Mode' : 'Default startup set to Full Dashboard');
      });
    });
  }

  // --- 6. Navigation Hints Bar ---
  const showHints = localStorage.getItem('caelestia_show_hints') !== 'false';
  if (toggleHints) {
    toggleHints.checked = showHints;
    toggleHints.addEventListener('change', () => {
      localStorage.setItem('caelestia_show_hints', String(toggleHints.checked));
      showToast(toggleHints.checked ? 'Hints bar enabled' : 'Hints bar hidden');
    });
  }

  // --- 7. Search Engine ---
  const currentEngine = localStorage.getItem('caelestia_engine') || 'google';
  const engineRadio = document.querySelector(`input[name="searchEngine"][value="${currentEngine}"]`);
  if (engineRadio) engineRadio.checked = true;

  document.querySelectorAll('input[name="searchEngine"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      localStorage.setItem('caelestia_engine', radio.value);
      showToast(`Default search set to ${radio.value.toUpperCase()}`);
    });
  });

  // --- 8. Replay Onboarding Tour ---
  if (btnRestartTour) {
    btnRestartTour.addEventListener('click', () => {
      localStorage.removeItem('caelestia_onboarded');
      window.location.href = 'newtab.html#onboarding';
    });
  }
})();

