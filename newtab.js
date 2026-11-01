// Caelestia Clean New Tab logic
// Syncs dynamic Material You palette & mode from Caelestia Shell, transparency, live weather, Zen mode, and clean widgets.

(() => {
  'use strict';

  // --- 1. Dynamic Caelestia Theme & Transparency Sync ---
  const themeModeEl = document.getElementById('themeMode');
  const themeNameEl = document.getElementById('themeName');

  function camelToKebab(str) {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
  }

  let lastThemeJsonStr = '';

  async function loadCaelestiaTheme() {
    try {
      const resp = await fetch(`./caelestia-theme.json?t=${Date.now()}`);
      if (!resp.ok) return;
      const text = await resp.text();
      if (text === lastThemeJsonStr) return; // No change
      lastThemeJsonStr = text;

      const theme = JSON.parse(text);
      const root = document.documentElement;

      // Apply light or dark mode attribute
      const mode = theme.mode || 'dark';
      root.setAttribute('data-theme', mode);
      if (themeModeEl) {
        themeModeEl.textContent = mode.charAt(0).toUpperCase() + mode.slice(1);
      }
      if (themeNameEl) {
        const name = theme.name ? theme.name.charAt(0).toUpperCase() + theme.name.slice(1) : 'Dynamic';
        themeNameEl.textContent = `Caelestia ${name}`;
      }

      // Sync Caelestia Transparency
      const isTransparent = theme.transparency !== false;
      root.setAttribute('data-transparency', isTransparent ? 'true' : 'false');

      // Apply Material You colour tokens
      if (theme.colours) {
        for (const [key, rawVal] of Object.entries(theme.colours)) {
          if (typeof rawVal !== 'string') continue;
          const hex = rawVal.startsWith('#') ? rawVal : `#${rawVal}`;
          const varName = `--md-sys-color-${camelToKebab(key)}`;
          root.style.setProperty(varName, hex);
        }
      }
    } catch (err) {
      console.debug('Theme fetch error (using fallback defaults):', err);
    }
  }

  loadCaelestiaTheme();
  setInterval(loadCaelestiaTheme, 3000);

  // --- 2. Live Digital Clock, Greeting, and Daily Quote ---
  const clockTimeEl = document.getElementById('clockTime');
  const greetingTextEl = document.getElementById('greetingText');
  const dateTextEl = document.getElementById('dateText');
  const dailyQuoteEl = document.getElementById('dailyQuote');

  const QUOTES = [
    '"Simplicity is the ultimate sophistication." — Leonardo da Vinci',
    '"Make it work, make it right, make it fast." — Kent Beck',
    '"Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away."',
    '"The only way to go fast, is to go well." — Robert C. Martin',
    '"Focus on being productive instead of busy." — Tim Ferriss',
    '"Design is not just what it looks like and feels like. Design is how it works." — Steve Jobs'
  ];

  function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    if (clockTimeEl) {
      clockTimeEl.textContent = `${hours}:${minutes}`;
    }

    const h = now.getHours();
    let greeting = 'Good Day';
    if (h >= 5 && h < 12) {
      greeting = 'Good Morning';
    } else if (h >= 12 && h < 17) {
      greeting = 'Good Afternoon';
    } else if (h >= 17 && h < 22) {
      greeting = 'Good Evening';
    } else {
      greeting = 'Good Night';
    }

    if (greetingTextEl) greetingTextEl.textContent = greeting;

    if (dateTextEl) {
      dateTextEl.textContent = now.toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      });
    }
  }

  function updateDailyQuote() {
    if (!dailyQuoteEl) return;
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now - start;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    dailyQuoteEl.textContent = QUOTES[dayOfYear % QUOTES.length];
  }

  updateClock();
  updateDailyQuote();
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

  // --- 4. Navigation Shortcuts Bar Toggle (Show / Hide) ---
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

  // --- 5. Zen / Focus Mode ---
  const btnZenToggle = document.getElementById('btnZenToggle');
  let isZenMode = localStorage.getItem('caelestia_zen') === 'true';

  function applyZenMode(enabled) {
    isZenMode = enabled;
    localStorage.setItem('caelestia_zen', String(enabled));
    document.body.classList.toggle('zen-mode', enabled);
    if (btnZenToggle) {
      btnZenToggle.classList.toggle('active', enabled);
      btnZenToggle.title = enabled ? 'Exit Zen Mode (Z)' : 'Enter Zen Mode (Z)';
    }
  }

  if (btnZenToggle) {
    btnZenToggle.addEventListener('click', () => applyZenMode(!isZenMode));
  }

  // --- Instant Keyboard Focus & Fast Workflow ---
  function claimFocus() {
    window.focus();
    if (document.activeElement && document.activeElement !== document.body && document.activeElement !== document.documentElement) {
      document.activeElement.blur();
    }
  }

  claimFocus();
  window.addEventListener('load', claimFocus);
  window.addEventListener('mouseenter', claimFocus);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      claimFocus();
    }
  });

  document.addEventListener('keydown', (e) => {
    const activeTag = document.activeElement?.tagName?.toLowerCase();
    const isEditing = activeTag === 'input' || activeTag === 'textarea';

    // Escape always blurs any active input back to dashboard shortcut mode
    if (e.key === 'Escape' && isEditing) {
      document.activeElement.blur();
      claimFocus();
      return;
    }

    if (isEditing) return;

    if (e.key === 'z' || e.key === 'Z') {
      e.preventDefault();
      applyZenMode(!isZenMode);
    } else if (e.key === 'k' || e.key === 'K' || e.key === 'h' || e.key === 'H' || e.key === '?') {
      e.preventDefault();
      showHints = !showHints;
      updateHintsVisibility();
    } else if (e.key === '/' || e.key === 's' || e.key === 'S') {
      if (searchInput && !isZenMode) {
        e.preventDefault();
        searchInput.focus();
        searchInput.select();
      }
    }
  });

  applyZenMode(isZenMode);

  // --- 6. Search Engine Selector & Submission ---
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
  const searchInput = document.getElementById('searchInput');

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

      if (isUrl) {
        const dest = /^https?:\/\//i.test(query) ? query : `https://${query}`;
        window.location.href = dest;
      } else {
        const engine = ENGINES[currentEngineKey] || ENGINES.google;
        window.location.href = `${engine.url}${encodeURIComponent(query)}`;
      }
    });
  }

  // --- 7. Quick Shortcuts Grid (Clean & Commonly Used Websites) ---
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
        // Exclude AI providers from shortcuts
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

    // Add Shortcut item
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
      list.push({
        id: String(Date.now()),
        title,
        url,
      });
      saveShortcuts(list);
      renderShortcuts();
      closeShortcutModal();
    });
  }

  renderShortcuts();

  // --- 8. Quick Tasks Widget ---
  const DEFAULT_TODOS = [
    { id: 1, text: 'Customizable quick task list', done: false },
    { id: 2, text: 'Press Z to enter Zen Focus Mode', done: false },
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

  // --- 9. Scratchpad Widget (Auto-Save) ---
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
})();
