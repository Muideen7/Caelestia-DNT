// Options & Preferences Logic for Caelestia Dynamic New Tab

(() => {
  'use strict';

  // --- 1. Dynamic Theme Loading ---
  function camelToKebab(str) {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
  }

  async function loadTheme() {
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

  // --- 4. Startup & View Mode ---
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

  // --- 5. Navigation Hints Bar ---
  const showHints = localStorage.getItem('caelestia_show_hints') !== 'false';
  if (toggleHints) {
    toggleHints.checked = showHints;
    toggleHints.addEventListener('change', () => {
      localStorage.setItem('caelestia_show_hints', String(toggleHints.checked));
      showToast(toggleHints.checked ? 'Hints bar enabled' : 'Hints bar hidden');
    });
  }

  // --- 6. Search Engine ---
  const currentEngine = localStorage.getItem('caelestia_engine') || 'google';
  const engineRadio = document.querySelector(`input[name="searchEngine"][value="${currentEngine}"]`);
  if (engineRadio) engineRadio.checked = true;

  document.querySelectorAll('input[name="searchEngine"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      localStorage.setItem('caelestia_engine', radio.value);
      showToast(`Default search set to ${radio.value.toUpperCase()}`);
    });
  });

  // --- 7. Replay Onboarding Tour ---
  if (btnRestartTour) {
    btnRestartTour.addEventListener('click', () => {
      localStorage.removeItem('caelestia_onboarded');
      window.location.href = 'newtab.html#onboarding';
    });
  }
})();
