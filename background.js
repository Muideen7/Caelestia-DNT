// Caelestia-DNT service worker
// Keeps the desktop theme snapshot in chrome.storage, brokers browser actions,
// and toggles native window fullscreen for Zen mode.

const THEME_FILES = ['noctalia-theme.json', 'caelestia-theme.json'];
const THEME_SOURCE_KEY = 'caelestia_theme_source';
const THEME_ALARM = 'caelestia-theme-sync';
let lastThemeJson = '';

// Resolve the active theme source. Anything other than the desktop-dynamic
// source (preset / wallpaper-upload) is published by the options page, so the
// service worker must not overwrite it.
async function getThemeSource() {
  try {
    const data = await chrome.storage.local.get([THEME_SOURCE_KEY]);
    return data[THEME_SOURCE_KEY] || 'caelestia-dynamic';
  } catch (_) {
    return 'caelestia-dynamic';
  }
}

// Try the Noctalia snapshot first, then the bundled Caelestia snapshot.
async function fetchThemeSnapshot() {
  for (const file of THEME_FILES) {
    try {
      const url = chrome.runtime.getURL(file);
      const resp = await fetch(`${url}?t=${Date.now()}`, { cache: 'no-store' });
      if (resp.ok) return await resp.json();
    } catch (_) {
      // Try the next candidate.
    }
  }
  return null;
}

async function syncThemeToStorage(force = false) {
  try {
    const source = await getThemeSource();
    if (source !== 'caelestia-dynamic') return;

    const theme = await fetchThemeSnapshot();
    if (!theme) return;

    const serialized = JSON.stringify(theme);
    if (!force && serialized === lastThemeJson) return;
    lastThemeJson = serialized;
    await chrome.storage.local.set({ caelestia_theme: theme });
  } catch (e) {
    console.debug('Theme storage sync error:', e);
  }
}

function ensureThemeAlarm() {
  if (!chrome.alarms) return;
  chrome.alarms.create(THEME_ALARM, { periodInMinutes: 1 });
}

// Initial sync, periodic refresh, and first-run onboarding.
syncThemeToStorage();
ensureThemeAlarm();

chrome.runtime.onInstalled.addListener((details) => {
  syncThemeToStorage(true);
  ensureThemeAlarm();
  if (details.reason === 'install') {
    chrome.tabs.create({ url: 'newtab.html#onboarding' });
  }
});

chrome.runtime.onStartup.addListener(() => {
  syncThemeToStorage(true);
  ensureThemeAlarm();
});

if (chrome.alarms?.onAlarm) {
  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === THEME_ALARM) syncThemeToStorage(true);
  });
}

// Message listener for browser actions, navigation, theme refreshes, and
// Zen fullscreen management.
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'refreshTheme') {
    syncThemeToStorage(true)
      .then(() => sendResponse({ status: 'ok' }))
      .catch((err) => sendResponse({ status: 'error', message: String(err) }));
    return true;
  }

  if (msg.action === 'setFullscreen') {
    const targetWinId = sender.tab?.windowId;
    const targetState = msg.fullscreen ? 'fullscreen' : 'normal';

    if (targetWinId) {
      chrome.windows.update(targetWinId, { state: targetState }, (win) => {
        sendResponse({ status: 'ok', state: win?.state || targetState });
      });
    } else {
      chrome.windows.getCurrent((win) => {
        if (win) {
          chrome.windows.update(win.id, { state: targetState }, (updatedWin) => {
            sendResponse({ status: 'ok', state: updatedWin?.state || targetState });
          });
        } else {
          sendResponse({ status: 'error', message: 'No window found' });
        }
      });
    }
    return true; // Keep asynchronous response channel open
  }

  if (msg.action === 'openSettings') {
    chrome.tabs.create({ url: 'chrome://settings' }, () => {
      sendResponse({ status: 'settings_opened' });
    });
    return true;
  }

  if (msg.action === 'openUrl' && msg.url) {
    chrome.tabs.create({ url: msg.url }, () => {
      sendResponse({ status: 'url_opened' });
    });
    return true;
  }
});
