// Caelestia-DNT new tab logic
// Keyboard-first flow: Zen mode default, S/slash quick search, P browser menu,
// loading states, and Noctalia/Caelestia desktop theming.

(() => {
  'use strict';

  // --- 0. Chromium New Tab Autofocus Workaround ---
  // When a new tab opens, Chromium traps focus inside the native Omnibox.
  // Performing a single replace with ?focus=1 forces Chromium to yield full keyboard focus to web contents.
  if (!window.location.search.includes('focus=1')) {
    const hash = window.location.hash || '';
    window.location.replace(`newtab.html?focus=1${hash}`);
    return;
  }

  // --- 1. Dynamic Theme, Presets, and Wallpaper Extraction Sync ---
  const themeModeEl = document.getElementById('themeMode');
  const themeNameEl = document.getElementById('themeName');
  const engine = window.CaelestiaThemeEngine;
  const THEME_FILES = ['noctalia-theme.json', 'caelestia-theme.json'];

  function camelToKebab(str) {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
  }

  let lastThemeJsonStr = '';

  function setWallpaper(url) {
    const wpEl = document.getElementById('wallpaperBg');
    if (!wpEl) return;
    if (!url) {
      wpEl.style.backgroundImage = '';
      return;
    }
    // Probe first so a missing generated wallpaper falls back to the CSS default
    // instead of replacing it with a broken image URL.
    const probe = new Image();
    probe.onload = () => {
      wpEl.style.backgroundImage = `url("${url}")`;
    };
    probe.onerror = () => {
      wpEl.style.backgroundImage = '';
    };
    probe.src = url;
  }

  function applyTheme(theme, fromBridge = false) {
    if (!theme) return;
    try {
      const root = document.documentElement;
      const mode = theme.mode || 'dark';
      root.setAttribute('data-theme', mode);
      root.setAttribute('data-transparency', theme.transparency === false ? 'false' : 'true');

      if (themeModeEl) {
        themeModeEl.textContent = mode.charAt(0).toUpperCase() + mode.slice(1);
      }
      if (themeNameEl) {
        let name = theme.name || 'Dynamic';
        if (theme.desktop === 'noctalia') {
          themeNameEl.textContent = name;
        } else if (theme.desktop === 'caelestia') {
          themeNameEl.textContent = `Caelestia ${name.charAt(0).toUpperCase() + name.slice(1)}`;
        } else {
          themeNameEl.textContent = name;
        }
      }

      if (theme.username && !localStorage.getItem('caelestia_username')) {
        localStorage.setItem('caelestia_username', theme.username);
        if (typeof updateClock === 'function') updateClock();
      }

      if (theme.colours) {
        for (const [key, rawVal] of Object.entries(theme.colours)) {
          if (typeof rawVal !== 'string') continue;
          const hex = rawVal.startsWith('#') ? rawVal : `#${rawVal}`;
          root.style.setProperty(`--md-sys-color-${camelToKebab(key)}`, hex);
        }
      }

      const wpUrl = theme.wallpaper_url || theme.wallpaper;
      if (wpUrl) {
        const isAbsolute = /^(?:https?:|data:|blob:)/i.test(wpUrl);
        const resolvedWp = isAbsolute ? wpUrl : `${wpUrl}?t=${Date.now()}`;
        setWallpaper(resolvedWp);

        // If theme has no pre-computed color tokens, extract dynamically from wallpaper
        if (!theme.colours && engine?.extractPaletteFromImage) {
          const probe = new Image();
          probe.crossOrigin = 'anonymous';
          probe.onload = () => {
            const extracted = engine.extractPaletteFromImage(probe, mode !== 'light');
            if (extracted && engine.applyPaletteToRoot) {
              engine.applyPaletteToRoot(extracted, root);
              if (chrome?.storage?.local) {
                chrome.storage.local.set({ caelestia_theme: { ...theme, colours: extracted } });
              }
            }
          };
          probe.src = resolvedWp;
        }
      }
    } catch (e) {
      console.debug('Error applying theme tokens:', e);
    }
  }

  async function loadCaelestiaTheme() {
    const themeSource = localStorage.getItem('caelestia_theme_source') || 'caelestia-dynamic';

    // 1. Locally extracted wallpaper palette.
    if (themeSource === 'wallpaper-upload') {
      const customPaletteRaw = localStorage.getItem('caelestia_custom_palette');
      const customWallpaper = localStorage.getItem('caelestia_custom_wallpaper_data');
      if (customPaletteRaw) {
        try {
          const colours = JSON.parse(customPaletteRaw);
          const isDark = (localStorage.getItem('caelestia_theme_mode') || 'dark') === 'dark';
          lastThemeJsonStr = '';
          document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
          document.documentElement.setAttribute('data-transparency', 'true');
          if (engine?.applyPaletteToRoot) engine.applyPaletteToRoot(colours);
          if (themeModeEl) themeModeEl.textContent = isDark ? 'Dark' : 'Light';
          if (themeNameEl) themeNameEl.textContent = 'Wallpaper';
          if (customWallpaper) setWallpaper(customWallpaper);
          return;
        } catch (e) {
          console.debug('Failed to parse custom palette:', e);
        }
      }
    }

    // 2. Curated designer preset.
    if (themeSource === 'preset') {
      const presetKey = localStorage.getItem('caelestia_theme_preset') || 'caelestia-violet';
      const preset = engine?.PRESETS?.[presetKey];
      if (preset) {
        lastThemeJsonStr = '';
        document.documentElement.setAttribute('data-theme', preset.mode || 'dark');
        document.documentElement.setAttribute('data-transparency', 'true');
        if (engine?.applyPaletteToRoot) engine.applyPaletteToRoot(preset.colours);
        if (themeModeEl) themeModeEl.textContent = (preset.mode || 'dark') === 'dark' ? 'Dark' : 'Light';
        if (themeNameEl) themeNameEl.textContent = preset.name;
        setWallpaper('wallpaper.jpg');
        return;
      }
    }

    // 3. Desktop-dynamic: Native Messaging Host -> Local HTTP Bridge -> Bundled Snapshots
    let theme = null;
    let fromBridge = false;

    // 3A. Try Native Messaging Host
    if (chrome?.runtime?.sendNativeMessage) {
      try {
        const nativeResp = await new Promise((resolve) => {
          chrome.runtime.sendNativeMessage(
            'com.caelestia.dnt',
            { action: 'getTheme' },
            (resp) => {
              if (chrome.runtime.lastError || !resp || resp.status !== 'ok') {
                resolve(null);
              } else {
                resolve(resp.theme);
              }
            }
          );
        });
        if (nativeResp && (nativeResp.colours || nativeResp.wallpaper_url || nativeResp.wallpaper_path)) {
          theme = nativeResp;
          fromBridge = true;
        }
      } catch (_) {}
    }

    // 3B. Try Local HTTP Bridge
    if (!theme) {
      try {
        const bridgeResp = await fetch('http://127.0.0.1:39123/theme', {
          cache: 'no-store',
          signal: AbortSignal.timeout(400)
        });
        if (bridgeResp.ok) {
          theme = await bridgeResp.json();
          fromBridge = true;
        }
      } catch (_) {}
    }

    // 3C. Try bundled snapshots
    if (!theme) {
      for (const file of THEME_FILES) {
        try {
          const resp = await fetch(`./${file}?t=${Date.now()}`, { cache: 'no-store' });
          if (resp.ok) {
            theme = await resp.json();
            break;
          }
        } catch (_) {}
      }
    }

    if (!theme) return;

    const themeStr = JSON.stringify(theme);
    if (themeStr === lastThemeJsonStr) return;
    lastThemeJsonStr = themeStr;
    applyTheme(theme, fromBridge);
  }

  function refreshBackgroundTheme() {
    try {
      if (chrome?.runtime?.sendMessage) {
        chrome.runtime.sendMessage({ action: 'refreshTheme' }, () => void chrome.runtime.lastError);
      }
    } catch (_) {}
  }

  // Load theme immediately on tab creation
  loadCaelestiaTheme();
  refreshBackgroundTheme();

  // Refresh theme only when user switches back to this tab (0% CPU / zero battery drain when idle)
  window.addEventListener('focus', () => {
    loadCaelestiaTheme();
    updateClock();
    refreshBackgroundTheme();
  });

  // --- 2. Live Digital Clock, Greeting, and Daily Quote ---
  const clockTimeEl = document.getElementById('clockTime');
  const greetingTextEl = document.getElementById('greetingText');
  const greetingSalutationEl = document.getElementById('greetingSalutation');
  const greetingUsernameEl = document.getElementById('greetingUsername');
  const dateTextEl = document.getElementById('dateText');
  const dailyQuoteEl = document.getElementById('dailyQuote');

  function getUsername() {
    return localStorage.getItem('caelestia_username') || 'FrontendGeek';
  }

  function setUsername(name) {
    const clean = (name || '').trim();
    if (clean) {
      localStorage.setItem('caelestia_username', clean);
    }
    updateClock();
  }

  // Display name & theme changes configured via Options page & Onboarding
  if (chrome?.storage?.onChanged) {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local') {
        if (changes.caelestia_username) {
          localStorage.setItem('caelestia_username', changes.caelestia_username.newValue);
          updateClock();
        }
        if (changes.caelestia_theme_source || changes.caelestia_theme_preset || changes.caelestia_custom_palette) {
          if (changes.caelestia_theme_source) {
            localStorage.setItem('caelestia_theme_source', changes.caelestia_theme_source.newValue);
          }
          if (changes.caelestia_theme_preset) {
            localStorage.setItem('caelestia_theme_preset', changes.caelestia_theme_preset.newValue);
          }
          if (changes.caelestia_custom_palette) {
            localStorage.setItem('caelestia_custom_palette', JSON.stringify(changes.caelestia_custom_palette.newValue));
          }
          loadCaelestiaTheme();
        }
      }
    });
  }

  window.addEventListener('storage', (e) => {
    if (e.key === 'caelestia_username') {
      updateClock();
    }
    if ((e.key && e.key.startsWith('caelestia_theme_')) || e.key === 'caelestia_custom_palette') {
      loadCaelestiaTheme();
    }
  });

  function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    if (clockTimeEl) {
      clockTimeEl.textContent = `${hours}:${minutes}`;
    }

    const h = now.getHours();
    let salutation = 'Good Day';
    if (h >= 5 && h < 12) {
      salutation = 'Good Morning';
    } else if (h >= 12 && h < 17) {
      salutation = 'Good Afternoon';
    } else if (h >= 17 && h < 22) {
      salutation = 'Good Evening';
    } else {
      salutation = 'Good Night';
    }

    const user = getUsername();
    if (greetingSalutationEl) {
      greetingSalutationEl.textContent = salutation;
    }
    if (greetingUsernameEl && !greetingUsernameEl.classList.contains('editing')) {
      greetingUsernameEl.textContent = user;
    } else if (greetingTextEl && !greetingSalutationEl) {
      greetingTextEl.textContent = `${salutation}, ${user}`;
    }

    if (dateTextEl) {
      dateTextEl.textContent = now.toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      });
    }
  }

  // --- Dynamic Per-Tab Quotes (Donghua, Anime, Philosophy, Science, Online) ---
  const quotesEngine = window.CaelestiaQuotes;

  async function updateTabQuote() {
    if (!dailyQuoteEl) return;

    // 1. Immediately display a random curated quote from our extensive offline database
    // (ensures 0ms instant display without layout shift)
    if (quotesEngine?.getRandomLocalQuote) {
      const initialQuote = quotesEngine.getRandomLocalQuote();
      dailyQuoteEl.textContent = quotesEngine.formatQuote(initialQuote);
    }

    // 2. 50% chance to fetch an online quote from public APIs when online
    if (Math.random() > 0.5 && quotesEngine?.fetchOnlineQuote) {
      try {
        const onlineQuote = await quotesEngine.fetchOnlineQuote();
        if (onlineQuote && onlineQuote.quote && dailyQuoteEl) {
          dailyQuoteEl.textContent = quotesEngine.formatQuote(onlineQuote);
        }
      } catch (err) {
        // Fallback remains the initial curated quote
      }
    }
  }

  async function copyCurrentQuote() {
    if (!dailyQuoteEl) return;
    const text = dailyQuoteEl.textContent.trim();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch (_) {
      // Clipboard permission can be denied; leave the quote untouched.
    }
  }

  updateClock();
  updateTabQuote();
  setInterval(updateClock, 1000);

  // --- 3. Live Weather Widget ---
  const weatherIconEl = document.getElementById('weatherIcon');
  const weatherTempEl = document.getElementById('weatherTemp');
  const weatherLocEl = document.getElementById('weatherLoc');
  const weatherPill = document.getElementById('weatherPill');

  function getWeatherIcon(wmoCode) {
    if (wmoCode === 0) return 'wb_sunny';
    if (wmoCode <= 3) return 'partly_cloudy_day';
    if (wmoCode <= 48) return 'cloud';
    if (wmoCode <= 67) return 'rainy';
    if (wmoCode <= 77) return 'ac_unit';
    if (wmoCode <= 82) return 'rainy';
    if (wmoCode <= 99) return 'thunderstorm';
    return 'wb_sunny';
  }

  async function fetchWeather(force = false) {
    const cached = localStorage.getItem('caelestia_weather');
    if (!force && cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < 30 * 60 * 1000) {
          applyWeather(parsed);
          return;
        }
      } catch (e) {}
    }

    try {
      const geoResp = await fetch('https://ipapi.co/json/');
      if (!geoResp.ok) throw new Error('Geo failed');
      const geo = await geoResp.json();
      const lat = geo.latitude || 52.52;
      const lon = geo.longitude || 13.41;
      const city = geo.city || 'Local';

      const wResp = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
      if (!wResp.ok) throw new Error('Meteo failed');
      const wData = await wResp.json();
      const cur = wData.current_weather;

      const weatherObj = {
        temp: Math.round(cur.temperature),
        code: cur.weathercode,
        city: city,
        timestamp: Date.now()
      };

      localStorage.setItem('caelestia_weather', JSON.stringify(weatherObj));
      applyWeather(weatherObj);
    } catch (err) {
      if (weatherTempEl) weatherTempEl.textContent = '22°C';
      if (weatherLocEl) weatherLocEl.textContent = 'Active';
    }
  }

  function applyWeather(w) {
    if (weatherTempEl) weatherTempEl.textContent = `${w.temp}°C`;
    if (weatherLocEl) weatherLocEl.textContent = w.city;
    if (weatherIconEl) weatherIconEl.textContent = getWeatherIcon(w.code);
  }

  if (weatherPill) {
    weatherPill.addEventListener('click', () => fetchWeather(true));
  }
  fetchWeather();

  // --- 4. Navigation Shortcuts Bar Toggle ---
  const btnToggleHints = document.getElementById('btnToggleHints');
  const navHintsContainer = document.getElementById('navHintsContainer');
  const iconToggleHints = document.getElementById('iconToggleHints');

  let showHints = localStorage.getItem('caelestia_show_hints') !== 'false';

  function updateHintsVisibility() {
    if (navHintsContainer) {
      navHintsContainer.classList.toggle('hidden', !showHints);
    }
    if (iconToggleHints) {
      iconToggleHints.textContent = showHints ? 'keyboard' : 'keyboard_hide';
    }
    if (btnToggleHints) {
      btnToggleHints.title = showHints ? 'Hide navigation shortcuts (Shortcut: K)' : 'Show navigation shortcuts (Shortcut: K)';
      btnToggleHints.classList.toggle('active', showHints);
    }
    localStorage.setItem('caelestia_show_hints', String(showHints));
  }

  if (btnToggleHints) {
    btnToggleHints.addEventListener('click', () => {
      showHints = !showHints;
      updateHintsVisibility();
    });
  }
  updateHintsVisibility();

  // --- 5. Zen / Focus Mode & Compositor-Aware Fullscreen Engine ---
  const btnZenToggle = document.getElementById('btnZenToggle');
  const btnFullscreenToggle = document.getElementById('btnFullscreenToggle');
  const iconFullscreen = document.getElementById('iconFullscreen');
  const searchSection = document.getElementById('searchSection');
  const searchInput = document.getElementById('searchInput');

  let isZenMode = localStorage.getItem('caelestia_zen') !== 'false';
  let isZenFullscreenEnabled = localStorage.getItem('caelestia_zen_fullscreen') !== 'false';
  let isFullscreenActive = false;

  function getFullscreenStrategy() {
    return localStorage.getItem('caelestia_fullscreen_strategy') || 'tiling-immersive';
  }

  // --- Compositor & Tiling Window Manager Resizing Engine ---
  function updateCompositorLayoutClasses() {
    const root = document.body;
    if (!root) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    // Clean old layout classes
    root.classList.remove('layout-compact', 'layout-split', 'layout-wide', 'layout-ultrawide', 'compositor-single-app');

    // 1. Tiling Compact: Width < 700px (1/3 Niri column, vertical monitor, or narrow split)
    if (width < 700 || (width / Math.max(1, height)) < 0.85) {
      root.classList.add('layout-compact');
    } else if (width < 1150) {
      // 2. Tiling Split: 700px - 1150px (50/50 horizontal split)
      root.classList.add('layout-split');
    } else if (width <= 1800) {
      // 3. Wide: Standard widescreen / full workspace
      root.classList.add('layout-wide');
    } else {
      // 4. Ultra-wide: 21:9 or 32:9 monitors
      root.classList.add('layout-ultrawide');
    }

    // 5. Compositor Single-App / Monocle: When window spans practically the entire display workspace
    if (window.screen && width >= (screen.availWidth - 60) && height >= (screen.availHeight - 90)) {
      root.classList.add('compositor-single-app');
    }
  }

  // Initialize observer and window resize listener
  if (window.ResizeObserver) {
    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(updateCompositorLayoutClasses);
    });
    resizeObserver.observe(document.documentElement);
  }
  window.addEventListener('resize', () => {
    requestAnimationFrame(updateCompositorLayoutClasses);
  }, { passive: true });
  updateCompositorLayoutClasses();

  async function toggleFullscreen(userTriggered = true, forceState = null) {
    const strategy = getFullscreenStrategy();
    const shouldBeFullscreen = forceState !== null ? forceState : !isFullscreenActive;
    isFullscreenActive = shouldBeFullscreen;

    if (iconFullscreen) {
      iconFullscreen.textContent = shouldBeFullscreen ? 'fullscreen_exit' : 'fullscreen';
    }
    if (btnFullscreenToggle) {
      btnFullscreenToggle.classList.toggle('active', shouldBeFullscreen);
      btnFullscreenToggle.title = shouldBeFullscreen ? 'Exit Fullscreen (F)' : 'Toggle Immersive Fullscreen (F)';
    }

    if (strategy === 'tiling-immersive') {
      // Edge-to-edge immersion inside the current window tile / column without breaking tiling
      document.body.classList.toggle('tiling-fullscreen', shouldBeFullscreen);
    } else if (strategy === 'tab-fullscreen') {
      try {
        if (shouldBeFullscreen && !document.fullscreenElement && document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        } else if (!shouldBeFullscreen && document.fullscreenElement && document.exitFullscreen) {
          await document.exitFullscreen();
        }
      } catch (err) {
        console.debug('Tab fullscreen error:', err);
      }
    } else {
      // native-display (F11 OS display fullscreen)
      try {
        if (chrome?.runtime?.sendMessage) {
          chrome.runtime.sendMessage({
            action: 'setFullscreen',
            fullscreen: shouldBeFullscreen,
            strategy: 'native-display'
          });
        }
      } catch (err) {
        console.debug('Window fullscreen error:', err);
      }
    }
  }

  if (btnFullscreenToggle) {
    btnFullscreenToggle.addEventListener('click', () => toggleFullscreen(true));
  }

  async function applyZenMode(enabled, userTriggered = false) {
    isZenMode = enabled;
    localStorage.setItem('caelestia_zen', String(enabled));
    document.body.classList.toggle('zen-mode', enabled);
    if (btnZenToggle) {
      btnZenToggle.classList.toggle('active', enabled);
      btnZenToggle.title = enabled ? 'Exit Zen Mode (Z)' : 'Enter Zen Mode (Z)';
    }
    if (!enabled && searchSection) {
      searchSection.classList.remove('search-active');
    }

    if (userTriggered && isZenFullscreenEnabled) {
      await toggleFullscreen(false, enabled);
    }
  }

  if (btnZenToggle) {
    btnZenToggle.addEventListener('click', () => applyZenMode(!isZenMode, true));
  }

  applyZenMode(isZenMode, false);

  // Sync Zen Mode whenever native window fullscreen (F11 / Esc) changes
  if (window.matchMedia) {
    window.matchMedia('(display-mode: fullscreen)').addEventListener('change', (e) => {
      if (isZenFullscreenEnabled && e.matches !== isZenMode) {
        applyZenMode(e.matches, false);
      }
    });
  }
  document.addEventListener('fullscreenchange', () => {
    const isFs = !!document.fullscreenElement;
    isFullscreenActive = isFs;
    if (iconFullscreen) iconFullscreen.textContent = isFs ? 'fullscreen_exit' : 'fullscreen';
    if (isZenFullscreenEnabled && isFs !== isZenMode) {
      applyZenMode(isFs, false);
    }
  });

  // --- 6. Navigation Loading Feedback State ---
  const topProgressBar = document.getElementById('topProgressBar');
  const loadingToast = document.getElementById('loadingToast');
  const loadingToastText = document.getElementById('loadingToastText');
  const searchSubmitIcon = document.getElementById('searchSubmitIcon');

  function startNavigationLoading(destinationLabel, targetUrl) {
    if (topProgressBar) topProgressBar.classList.add('active');
    if (loadingToast && loadingToastText) {
      loadingToastText.textContent = destinationLabel ? `Opening ${destinationLabel}...` : 'Navigating...';
      loadingToast.classList.add('active');
    }

    if (searchSubmitIcon) {
      searchSubmitIcon.textContent = 'progress_activity';
      searchSubmitIcon.classList.add('spin');
    }

    const submitBtn = searchForm?.querySelector('.search-submit-btn');
    if (submitBtn) submitBtn.classList.add('loading');

    if (targetUrl) {
      setTimeout(() => {
        window.location.href = targetUrl;
      }, 50);
    }
  }

  function stopNavigationLoading() {
    if (topProgressBar) topProgressBar.classList.remove('active');
    if (loadingToast) loadingToast.classList.remove('active');
    if (searchSubmitIcon) {
      searchSubmitIcon.textContent = 'arrow_forward';
      searchSubmitIcon.classList.remove('spin');
    }
    const submitBtn = searchForm?.querySelector('.search-submit-btn');
    if (submitBtn) submitBtn.classList.remove('loading');
  }

  // --- 7. Browser Quick Menu Modal (Shortcut: P or Button) ---
  const btnBrowserMenu = document.getElementById('btnBrowserMenu');
  const browserMenuModal = document.getElementById('browserMenuModal');
  const btnCloseBrowserMenu = document.getElementById('btnCloseBrowserMenu');

  function openBrowserMenu() {
    if (browserMenuModal) {
      browserMenuModal.classList.add('open');
    }
  }

  function closeBrowserMenu() {
    if (browserMenuModal) {
      browserMenuModal.classList.remove('open');
      claimFocus();
    }
  }

  if (btnBrowserMenu) btnBrowserMenu.addEventListener('click', openBrowserMenu);
  if (btnCloseBrowserMenu) btnCloseBrowserMenu.addEventListener('click', closeBrowserMenu);

  const menuItemTour = document.getElementById('menuItemTour');
  if (menuItemTour) {
    menuItemTour.addEventListener('click', () => {
      closeBrowserMenu();
      openOnboarding();
    });
  }

  function openInternalUrl(url, label) {
    startNavigationLoading(label, null);
    try {
      if (chrome?.tabs?.create) {
        chrome.tabs.create({ url });
      } else if (chrome?.runtime?.sendMessage) {
        chrome.runtime.sendMessage({ action: 'openUrl', url });
      } else {
        window.open(url, '_blank');
      }
    } catch (e) {
      if (chrome?.runtime?.sendMessage) {
        chrome.runtime.sendMessage({ action: 'openUrl', url });
      }
    }
    setTimeout(stopNavigationLoading, 400);
  }

  function openBrowserSettings() {
    startNavigationLoading('Settings', null);
    try {
      if (chrome?.tabs?.create) {
        chrome.tabs.create({ url: 'chrome://settings' });
      } else if (chrome?.runtime?.sendMessage) {
        chrome.runtime.sendMessage({ action: 'openSettings' });
      } else {
        window.open('chrome://settings', '_blank');
      }
    } catch (e) {
      if (chrome?.runtime?.sendMessage) {
        chrome.runtime.sendMessage({ action: 'openSettings' });
      }
    }
    setTimeout(stopNavigationLoading, 400);
  }

  document.querySelectorAll('.menu-item').forEach((item) => {
    item.addEventListener('click', () => {
      const url = item.getAttribute('data-url');
      const label = item.querySelector('.menu-label')?.textContent || '';
      if (url) {
        openInternalUrl(url, label);
        setTimeout(() => {
          closeBrowserMenu();
        }, 400);
      }
    });
  });

  // --- 7b. Enhanced Onboarding Modal Wizard (Interactive Experience) ---
  const onboardingModal = document.getElementById('onboardingModal');
  const dot1 = document.getElementById('dot1');
  const dot2 = document.getElementById('dot2');
  const dot3 = document.getElementById('dot3');
  const dot4 = document.getElementById('dot4');
  const step1 = document.getElementById('onboardingStep1');
  const step2 = document.getElementById('onboardingStep2');
  const step3 = document.getElementById('onboardingStep3');
  const step4 = document.getElementById('onboardingStep4');
  const btnNextStep1 = document.getElementById('btnNextStep1');
  const btnBackStep2 = document.getElementById('btnBackStep2');
  const btnNextStep2 = document.getElementById('btnNextStep2');
  const btnBackStep3 = document.getElementById('btnBackStep3');
  const btnNextStep3 = document.getElementById('btnNextStep3');
  const btnBackStep4 = document.getElementById('btnBackStep4');
  const btnFinishOnboarding = document.getElementById('btnFinishOnboarding');
  const btnSkipOnboarding = document.getElementById('btnSkipOnboarding');
  const onboardingNameInput = document.getElementById('onboardingNameInput');
  const onboardingGreetingPreview = document.getElementById('onboardingGreetingPreview');
  const previewClock = document.getElementById('previewClock');
  const obZen = document.getElementById('obZen');
  const obDash = document.getElementById('obDash');
  const obZenFullscreen = document.getElementById('obZenFullscreen');

  let currentStep = 1;

  function updateGreetingPreview() {
    if (!onboardingGreetingPreview) return;
    const hour = new Date().getHours();
    let salutation = 'Good morning';
    if (hour >= 12 && hour < 17) salutation = 'Good afternoon';
    else if (hour >= 17 || hour < 5) salutation = 'Good evening';

    const rawName = (onboardingNameInput?.value || '').trim();
    const displayName = rawName || 'Friend';
    onboardingGreetingPreview.textContent = `${salutation}, ${displayName}`;

    if (previewClock) {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      previewClock.textContent = `${h}:${m}`;
    }
  }

  function showStep(stepNum) {
    currentStep = stepNum;
    if (step1) step1.classList.toggle('active', stepNum === 1);
    if (step2) step2.classList.toggle('active', stepNum === 2);
    if (step3) step3.classList.toggle('active', stepNum === 3);
    if (step4) step4.classList.toggle('active', stepNum === 4);

    if (dot1) dot1.classList.toggle('active', stepNum === 1);
    if (dot2) dot2.classList.toggle('active', stepNum === 2);
    if (dot3) dot3.classList.toggle('active', stepNum === 3);
    if (dot4) dot4.classList.toggle('active', stepNum === 4);

    if (stepNum === 2) {
      updateGreetingPreview();
      if (onboardingNameInput) {
        setTimeout(() => {
          onboardingNameInput.focus();
          onboardingNameInput.select();
        }, 50);
      }
    }
  }

  function openOnboarding() {
    if (!onboardingModal) return;
    const currentName = getUsername();
    if (onboardingNameInput) {
      onboardingNameInput.value = currentName !== 'FrontendGeek' ? currentName : '';
    }
    const isZen = localStorage.getItem('caelestia_zen') !== 'false';
    if (obZen && obDash) {
      obZen.checked = isZen;
      obDash.checked = !isZen;
    }
    const isFs = localStorage.getItem('caelestia_zen_fullscreen') !== 'false';
    if (obZenFullscreen) {
      obZenFullscreen.checked = isFs;
    }
    updateGreetingPreview();
    showStep(1);
    onboardingModal.classList.add('open');
  }

  function closeOnboarding() {
    if (onboardingModal) {
      onboardingModal.classList.remove('open');
      claimFocus();
    }
  }

  if (btnNextStep1) btnNextStep1.addEventListener('click', () => showStep(2));
  if (btnBackStep2) btnBackStep2.addEventListener('click', () => showStep(1));
  if (btnNextStep2) btnNextStep2.addEventListener('click', () => showStep(3));
  if (btnBackStep3) btnBackStep3.addEventListener('click', () => showStep(2));
  if (btnNextStep3) btnNextStep3.addEventListener('click', () => showStep(4));
  if (btnBackStep4) btnBackStep4.addEventListener('click', () => showStep(3));

  if (onboardingNameInput) {
    onboardingNameInput.addEventListener('input', updateGreetingPreview);
    onboardingNameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        showStep(3);
      }
    });
  }

  function completeOnboarding() {
    const enteredName = (onboardingNameInput?.value || '').trim();
    if (enteredName) {
      setUsername(enteredName);
      if (chrome?.storage?.local) {
        chrome.storage.local.set({ caelestia_username: enteredName });
      }
    }
    if (obZen && obDash) {
      const isZen = obZen.checked;
      localStorage.setItem('caelestia_zen', String(isZen));
      applyZenMode(isZen, false);
    }
    if (obZenFullscreen) {
      const isFs = obZenFullscreen.checked;
      localStorage.setItem('caelestia_zen_fullscreen', String(isFs));
      isZenFullscreenEnabled = isFs;
      if (chrome?.storage?.local) {
        chrome.storage.local.set({ caelestia_zen_fullscreen: isFs });
      }
    }
    localStorage.setItem('caelestia_onboarded_v2', 'true');
    localStorage.setItem('caelestia_onboarded', 'true');
    if (chrome?.storage?.local) {
      chrome.storage.local.set({ caelestia_onboarded_v2: true, caelestia_onboarded: true });
    }
    closeOnboarding();
  }

  if (btnFinishOnboarding) btnFinishOnboarding.addEventListener('click', completeOnboarding);
  if (btnSkipOnboarding) btnSkipOnboarding.addEventListener('click', completeOnboarding);

  function checkOnboarding() {
    const isFirstTime = !localStorage.getItem('caelestia_onboarded_v2');
    const isHashTrigger = window.location.hash === '#onboarding';
    if (isFirstTime || isHashTrigger) {
      if (isHashTrigger && window.history?.replaceState) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
      openOnboarding();
    }
  }

  // --- 8. Instant Keyboard Claim & Workflow Shortcuts ---
  const keyboardTrap = document.getElementById('keyboardTrap');

  function openOptionsPage() {
    startNavigationLoading('Preferences', 'options.html');
  }

  function claimFocus() {
    try {
      if (searchSection?.classList.contains('search-active')) {
        if (searchInput && document.activeElement !== searchInput) {
          searchInput.focus();
        }
        return;
      }
      if (onboardingModal?.classList.contains('open')) {
        if (currentStep === 2 && onboardingNameInput) {
          onboardingNameInput.focus();
        }
        return;
      }
      if (browserMenuModal?.classList.contains('open') || document.getElementById('shortcutModal')?.classList.contains('open')) {
        return;
      }
      if (keyboardTrap) {
        keyboardTrap.focus();
      } else if (document.body) {
        document.body.focus();
      }
    } catch (e) {}
  }

  claimFocus();
  window.addEventListener('load', claimFocus);
  window.addEventListener('mouseenter', claimFocus);
  window.addEventListener('focus', claimFocus);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      claimFocus();
    }
  });

  document.addEventListener('keydown', (e) => {
    // 0. Resolve active editing element safely BEFORE anything else
    const activeEl = document.activeElement;
    const activeTag = activeEl?.tagName?.toLowerCase();
    const isEditing = (activeTag === 'textarea' || (activeTag === 'input' && activeEl?.id !== 'keyboardTrap')) || activeEl?.isContentEditable === true;
    const isSearchActive = searchSection?.classList.contains('search-active');
    const isOnboardingOpen = onboardingModal?.classList.contains('open');

    // 1. Escape key handling (works even while editing or modal open)
    if (e.key === 'Escape') {
      let handled = false;
      if (isOnboardingOpen) {
        closeOnboarding();
        handled = true;
      }
      if (browserMenuModal?.classList.contains('open')) {
        closeBrowserMenu();
        handled = true;
      }
      const sModal = document.getElementById('shortcutModal');
      if (sModal?.classList.contains('open')) {
        sModal.classList.remove('open');
        claimFocus();
        handled = true;
      }
      if (isSearchActive) {
        searchSection.classList.remove('search-active');
        if (searchInput) searchInput.blur();
        claimFocus();
        handled = true;
      } else if (isEditing) {
        if (activeEl && typeof activeEl.blur === 'function') activeEl.blur();
        claimFocus();
        handled = true;
      }
      if (handled) {
        e.preventDefault();
        return;
      }
    }

    // 2. SEARCH-ACTIVE SHIELD:
    // If search mode is active, NEVER allow single-key navigation (H for history, D for downloads, etc.) to fire!
    // All typing is routed into searchInput.
    if (isSearchActive) {
      if (e.ctrlKey || e.altKey || e.metaKey) {
        return;
      }
      if (e.key === 'Enter') {
        if (searchInput && document.activeElement !== searchInput) {
          e.preventDefault();
          searchForm?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
        }
        return;
      }
      // If focus was lost from searchInput (e.g. user pressed S then didn't focus on search input):
      if (searchInput && document.activeElement !== searchInput) {
        searchInput.focus();
        if (e.key.length === 1) {
          e.preventDefault();
          searchInput.value += e.key;
          searchInput.setSelectionRange(searchInput.value.length, searchInput.value.length);
        }
      }
      return;
    }

    // 3. ONBOARDING MODAL ACTIVE:
    if (isOnboardingOpen) {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (currentStep === 1) {
          showStep(2);
        } else if (currentStep === 2) {
          showStep(3);
        } else if (currentStep === 3) {
          btnFinishOnboarding?.click();
        }
      }
      return;
    }

    // CRITICAL: If typing inside any input or textarea, do NOT intercept or trigger shortcuts!
    if (isEditing) return;

    // Do NOT trigger single-key actions if modifier keys (Ctrl, Alt, Meta) are held!
    // This strictly preserves native browser shortcuts (Ctrl+P print, Ctrl+S save, Ctrl+T new tab, etc.)
    if (e.ctrlKey || e.altKey || e.metaKey) {
      if (e.ctrlKey && !e.altKey && !e.metaKey && e.key === ',') {
        e.preventDefault();
        openOptionsPage();
      }
      return;
    }

    // 2. Settings / Preferences shortcut: Comma (,) alone
    if (e.key === ',') {
      e.preventDefault();
      openOptionsPage();
      return;
    }

    // 3. When Browser Menu modal is open, quick-trigger items
    if (browserMenuModal?.classList.contains('open')) {
      const k = e.key.toLowerCase();
      const routeMap = {
        h: { url: 'chrome://history', label: 'History' },
        d: { url: 'chrome://downloads', label: 'Downloads' },
        b: { url: 'chrome://bookmarks', label: 'Bookmarks' },
        e: { url: 'chrome://extensions', label: 'Extensions' },
        s: { url: 'chrome://settings', label: 'Settings' },
        ',': { url: 'options.html', label: 'Preferences' },
        o: { url: 'options.html', label: 'Preferences' }
      };
      if (routeMap[k] || routeMap[e.key]) {
        const item = routeMap[k] || routeMap[e.key];
        e.preventDefault();
        openInternalUrl(item.url, item.label);
        setTimeout(() => {
          closeBrowserMenu();
        }, 400);
        return;
      }
    }

    // 4. Quick Key Shortcuts (Single Key, Non-Conflicting, Outside Inputs)
    const key = e.key.toLowerCase();

    // S or / -> Open Search
    if (key === 's' || key === '/') {
      e.preventDefault();
      if (searchSection && searchInput) {
        searchSection.classList.add('search-active');
        setTimeout(() => {
          searchInput.focus();
          searchInput.select();
        }, 10);
      }
      return;
    }

    // P -> Toggle Browser Quick Menu
    if (key === 'p') {
      e.preventDefault();
      if (browserMenuModal?.classList.contains('open')) {
        closeBrowserMenu();
      } else {
        openBrowserMenu();
      }
      return;
    }

    // F -> Toggle Immersive Fullscreen
    if (key === 'f') {
      e.preventDefault();
      toggleFullscreen(true);
      return;
    }

    // F11 -> Toggle Fullscreen / Window state
    if (e.key === 'F11') {
      e.preventDefault();
      toggleFullscreen(true);
      return;
    }

    // Z -> Toggle Zen Mode
    if (key === 'z') {
      e.preventDefault();
      applyZenMode(!isZenMode, true);
      return;
    }

    // K -> Toggle Navigation Hints Bar
    if (key === 'k') {
      e.preventDefault();
      showHints = !showHints;
      updateHintsVisibility();
      return;
    }

    // ? -> Open the Welcome Tour / Setup wizard
    if (e.key === '?') {
      e.preventDefault();
      closeBrowserMenu();
      openOnboarding();
      return;
    }

    // C -> Copy the current quote, R -> fetch a new one
    if (key === 'c') {
      e.preventDefault();
      copyCurrentQuote();
      return;
    }
    if (key === 'r') {
      e.preventDefault();
      updateTabQuote();
      return;
    }

    // Direct Browser Navigation Keys (H, D, B, E)
    if (key === 'h') {
      e.preventDefault();
      openInternalUrl('chrome://history', 'History');
      return;
    }
    if (key === 'd') {
      e.preventDefault();
      openInternalUrl('chrome://downloads', 'Downloads');
      return;
    }
    if (key === 'b') {
      e.preventDefault();
      openInternalUrl('chrome://bookmarks', 'Bookmarks');
      return;
    }
    if (key === 'e') {
      e.preventDefault();
      openInternalUrl('chrome://extensions', 'Extensions');
      return;
    }
  });

  // --- 9. Search Engine Selector & Submission ---
  const ENGINES = {
    google: { name: 'Google', icon: 'search', url: 'https://www.google.com/search?q=' },
    brave: { name: 'Brave Search', icon: 'shield', url: 'https://search.brave.com/search?q=' },
    duckduckgo: { name: 'DuckDuckGo', icon: 'travel_explore', url: 'https://duckduckgo.com/?q=' },
    youtube: { name: 'YouTube', icon: 'smart_display', url: 'https://www.youtube.com/results?search_query=' },
    wikipedia: { name: 'Wikipedia', icon: 'menu_book', url: 'https://en.wikipedia.org/wiki/Special:Search?search=' },
  };

  let currentEngineKey = localStorage.getItem('caelestia_engine') || 'google';
  if (!ENGINES[currentEngineKey]) currentEngineKey = 'google';

  const btnEngineSelect = document.getElementById('btnEngineSelect');
  const engineDropdown = document.getElementById('engineDropdown');
  const engineIcon = document.getElementById('engineIcon');
  const engineName = document.getElementById('engineName');
  const searchForm = document.getElementById('searchForm');

  function setEngine(key) {
    if (!ENGINES[key]) return;
    currentEngineKey = key;
    localStorage.setItem('caelestia_engine', key);
    if (engineIcon) engineIcon.textContent = ENGINES[key].icon;
    if (engineName) engineName.textContent = ENGINES[key].name;
    if (engineDropdown) engineDropdown.classList.remove('open');
  }

  setEngine(currentEngineKey);

  if (btnEngineSelect && engineDropdown) {
    btnEngineSelect.addEventListener('click', (e) => {
      e.stopPropagation();
      engineDropdown.classList.toggle('open');
    });

    document.querySelectorAll('.engine-opt').forEach((opt) => {
      opt.addEventListener('click', () => {
        const eng = opt.getAttribute('data-engine');
        setEngine(eng);
      });
    });

    document.addEventListener('click', (e) => {
      if (!engineDropdown.contains(e.target) && e.target !== btnEngineSelect) {
        engineDropdown.classList.remove('open');
      }
    });
  }

  if (searchForm && searchInput) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const query = searchInput.value.trim();
      if (!query) return;

      const isUrl = /^https?:\/\//i.test(query) || (
        /^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/.*)?$/i.test(query) && !query.includes(' ')
      );

      let dest = '';
      let label = '';
      if (isUrl) {
        dest = /^https?:\/\//i.test(query) ? query : `https://${query}`;
        label = query;
      } else {
        const engine = ENGINES[currentEngineKey] || ENGINES.google;
        dest = `${engine.url}${encodeURIComponent(query)}`;
        label = `${engine.name}: "${query}"`;
      }

      startNavigationLoading(label, dest);
    });
  }

  // --- 10. Quick Shortcuts Grid ---
  const DEFAULT_SHORTCUTS = [
    { id: '1', title: 'YouTube', url: 'https://youtube.com' },
    { id: '2', title: 'Reddit', url: 'https://reddit.com' },
    { id: '3', title: 'Wikipedia', url: 'https://wikipedia.org' },
    { id: '4', title: 'Arch Linux', url: 'https://archlinux.org' },
  ];

  function getShortcuts() {
    try {
      const data = localStorage.getItem('caelestia_shortcuts');
      if (data) {
        const parsed = JSON.parse(data);
        return parsed.filter(s => !/chatgpt|openai|claude|gemini|perplexity/i.test(s.title + ' ' + s.url));
      }
    } catch (e) {}
    return DEFAULT_SHORTCUTS;
  }

  function saveShortcuts(list) {
    localStorage.setItem('caelestia_shortcuts', JSON.stringify(list));
  }

  const shortcutsGrid = document.getElementById('shortcutsGrid');
  const shortcutModal = document.getElementById('shortcutModal');
  const modalLinkTitle = document.getElementById('modalLinkTitle');
  const modalLinkUrl = document.getElementById('modalLinkUrl');
  const btnCloseModal = document.getElementById('btnCloseModal');
  const btnCancelModal = document.getElementById('btnCancelModal');
  const btnSaveShortcut = document.getElementById('btnSaveShortcut');

  function renderShortcuts() {
    if (!shortcutsGrid) return;
    shortcutsGrid.innerHTML = '';
    const list = getShortcuts();

    list.forEach((item) => {
      let domain = '';
      try {
        domain = new URL(item.url).hostname;
      } catch (e) {
        domain = item.url;
      }

      const a = document.createElement('a');
      a.className = 'shortcut-item';
      a.href = item.url;
      a.addEventListener('click', (e) => {
        e.preventDefault();
        startNavigationLoading(item.title, item.url);
      });

      const iconBox = document.createElement('div');
      iconBox.className = 'shortcut-icon-box';

      const img = document.createElement('img');
      img.src = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;
      img.alt = item.title;
      img.loading = 'lazy';
      img.onerror = () => {
        img.remove();
        const span = document.createElement('span');
        span.className = 'material-symbols-rounded';
        span.textContent = 'public';
        iconBox.appendChild(span);
      };
      iconBox.appendChild(img);

      const titleSpan = document.createElement('span');
      titleSpan.className = 'shortcut-title';
      titleSpan.textContent = item.title;

      const delBtn = document.createElement('button');
      delBtn.className = 'shortcut-del-btn';
      delBtn.innerHTML = '&times;';
      delBtn.title = 'Remove';
      delBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const filtered = getShortcuts().filter((s) => s.id !== item.id);
        saveShortcuts(filtered);
        renderShortcuts();
      });

      a.appendChild(iconBox);
      a.appendChild(titleSpan);
      a.appendChild(delBtn);
      shortcutsGrid.appendChild(a);
    });

    const addCard = document.createElement('div');
    addCard.className = 'shortcut-item';
    addCard.style.cursor = 'pointer';
    addCard.title = 'Add shortcut';

    const addIconBox = document.createElement('div');
    addIconBox.className = 'shortcut-icon-box';
    const addIcon = document.createElement('span');
    addIcon.className = 'material-symbols-rounded';
    addIcon.textContent = 'add';
    addIconBox.appendChild(addIcon);

    const addTitle = document.createElement('span');
    addTitle.className = 'shortcut-title';
    addTitle.textContent = 'Add Link';

    addCard.appendChild(addIconBox);
    addCard.appendChild(addTitle);
    addCard.addEventListener('click', openShortcutModal);

    shortcutsGrid.appendChild(addCard);
  }

  function openShortcutModal() {
    if (modalLinkTitle) modalLinkTitle.value = '';
    if (modalLinkUrl) modalLinkUrl.value = '';
    if (shortcutModal) {
      shortcutModal.classList.add('open');
      if (modalLinkTitle) modalLinkTitle.focus();
    }
  }

  function closeShortcutModal() {
    if (shortcutModal) shortcutModal.classList.remove('open');
    claimFocus();
  }

  if (btnCloseModal) btnCloseModal.addEventListener('click', closeShortcutModal);
  if (btnCancelModal) btnCancelModal.addEventListener('click', closeShortcutModal);

  if (btnSaveShortcut) {
    btnSaveShortcut.addEventListener('click', () => {
      let title = modalLinkTitle.value.trim();
      let url = modalLinkUrl.value.trim();
      if (!url) return;
      if (!/^https?:\/\//i.test(url)) {
        url = `https://${url}`;
      }
      if (!title) {
        try {
          title = new URL(url).hostname.replace(/^www\./, '');
        } catch (e) {
          title = 'Link';
        }
      }

      const list = getShortcuts();
      list.push({ id: String(Date.now()), title, url });
      saveShortcuts(list);
      renderShortcuts();
      closeShortcutModal();
    });
  }

  renderShortcuts();

  // --- 11. Quick Tasks Widget ---
  const DEFAULT_TODOS = [
    { id: 1, text: 'Clean keyboard-centric dashboard', done: true },
    { id: 2, text: 'Press S to search, P for menu', done: false },
  ];

  function getTodos() {
    try {
      const data = localStorage.getItem('caelestia_todos');
      if (data) return JSON.parse(data);
    } catch (e) {}
    return DEFAULT_TODOS;
  }

  function saveTodos(list) {
    localStorage.setItem('caelestia_todos', JSON.stringify(list));
  }

  const todoList = document.getElementById('todoList');
  const btnAddTask = document.getElementById('btnAddTask');
  const todoInputRow = document.getElementById('todoInputRow');
  const todoInput = document.getElementById('todoInput');
  const btnSaveTask = document.getElementById('btnSaveTask');

  function renderTodos() {
    if (!todoList) return;
    todoList.innerHTML = '';
    const list = getTodos();

    list.forEach((item) => {
      const row = document.createElement('div');
      row.className = `todo-item ${item.done ? 'done' : ''}`;

      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.className = 'todo-checkbox';
      cb.checked = item.done;
      cb.addEventListener('change', () => {
        item.done = cb.checked;
        saveTodos(list);
        renderTodos();
      });

      const label = document.createElement('span');
      label.textContent = item.text;
      label.style.flex = '1';
      label.addEventListener('click', () => {
        cb.checked = !cb.checked;
        item.done = cb.checked;
        saveTodos(list);
        renderTodos();
      });

      const delBtn = document.createElement('button');
      delBtn.className = 'todo-item-del';
      delBtn.innerHTML = '<span class="material-symbols-rounded" style="font-size:16px;">close</span>';
      delBtn.title = 'Delete task';
      delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const filtered = getTodos().filter((t) => t.id !== item.id);
        saveTodos(filtered);
        renderTodos();
      });

      row.appendChild(cb);
      row.appendChild(label);
      row.appendChild(delBtn);
      todoList.appendChild(row);
    });
  }

  if (btnAddTask && todoInputRow && todoInput) {
    btnAddTask.addEventListener('click', () => {
      const isOpen = todoInputRow.style.display !== 'none';
      todoInputRow.style.display = isOpen ? 'none' : 'flex';
      if (!isOpen) todoInput.focus();
    });

    const handleSaveTask = () => {
      const text = todoInput.value.trim();
      if (!text) return;
      const list = getTodos();
      list.push({ id: Date.now(), text, done: false });
      saveTodos(list);
      todoInput.value = '';
      todoInputRow.style.display = 'none';
      renderTodos();
    };

    if (btnSaveTask) btnSaveTask.addEventListener('click', handleSaveTask);
    todoInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleSaveTask();
      if (e.key === 'Escape') todoInputRow.style.display = 'none';
    });
  }

  renderTodos();

  // --- 12. Scratchpad Widget (Auto-Save) ---
  const noteArea = document.getElementById('noteArea');
  const noteStatus = document.getElementById('noteStatus');

  if (noteArea) {
    noteArea.value = localStorage.getItem('caelestia_scratchpad') || '';

    let saveTimeout = null;
    noteArea.addEventListener('input', () => {
      if (noteStatus) noteStatus.textContent = 'Saving...';
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        localStorage.setItem('caelestia_scratchpad', noteArea.value);
        if (noteStatus) noteStatus.textContent = 'Auto-saved';
      }, 500);
    });
  }

  // --- 13. Chrome Web Store First-Run Onboarding Check ---
  checkOnboarding();
})();
