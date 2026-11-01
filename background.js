// Caelestia Fullscreen New Tab Service Worker
// Manages internal browser shortcuts, tiling compliance, and theme broadcasting.

// Broadcasts theme from caelestia-theme.json into chrome.storage.local
async function syncThemeToStorage() {
  try {
    const url = chrome.runtime.getURL('caelestia-theme.json');
    const resp = await fetch(`${url}?t=${Date.now()}`);
    if (resp.ok) {
      const theme = await resp.json();
      chrome.storage.local.set({ caelestia_theme: theme });
    }
  } catch (e) {
    console.debug('Theme storage sync error:', e);
  }
}

// Initial sync and periodic theme broadcast
syncThemeToStorage();
chrome.runtime.onInstalled.addListener((details) => {
  syncThemeToStorage();
  if (details.reason === 'install') {
    chrome.tabs.create({ url: 'newtab.html#onboarding' });
  }
});
chrome.runtime.onStartup.addListener(syncThemeToStorage);
setInterval(syncThemeToStorage, 3000);

// Ensure window always stays in normal state (never edge-to-edge fullscreen)
// This guarantees it respects Caelestia Shell's default single app size and tiling gaps
function enforceNormalWindowState(win) {
  if (win && win.state === 'fullscreen') {
    chrome.windows.update(win.id, { state: 'normal' });
  }
}

chrome.windows.onCreated.addListener(enforceNormalWindowState);
chrome.runtime.onStartup.addListener(() => {
  chrome.windows.getAll((windows) => {
    windows.forEach(enforceNormalWindowState);
  });
});

// Message listener for browser actions and navigation
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
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
