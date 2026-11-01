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
chrome.runtime.onInstalled.addListener(syncThemeToStorage);
chrome.runtime.onStartup.addListener(syncThemeToStorage);
setInterval(syncThemeToStorage, 3000);

// Message listener for browser actions and navigation
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  const winId = sender.tab?.windowId;

  if (msg.action === 'openSettings') {
    const targetUrl = 'chrome://settings/';
    if (sender.tab?.id) {
      chrome.tabs.update(sender.tab.id, { url: targetUrl }).catch(() => {
        chrome.tabs.create({ url: targetUrl });
      });
    } else {
      chrome.tabs.create({ url: targetUrl });
    }
    sendResponse({ status: 'settings_opened' });
    return true;
  }

  if (msg.action === 'openUrl' && msg.url) {
    const targetUrl = msg.url.endsWith('/') || msg.url.includes('?') ? msg.url : `${msg.url}/`;
    if (sender.tab?.id) {
      chrome.tabs.update(sender.tab.id, { url: targetUrl }).catch(() => {
        chrome.tabs.create({ url: targetUrl });
      });
    } else {
      chrome.tabs.create({ url: targetUrl });
    }
    sendResponse({ status: 'url_opened' });
    return true;
  }

  if (msg.action === 'toggleFullscreen') {
    if (winId) {
      chrome.windows.get(winId, (win) => {
        const nextState = win.state === 'fullscreen' ? 'normal' : 'fullscreen';
        chrome.windows.update(winId, { state: nextState });
        sendResponse({ state: nextState });
      });
      return true;
    }
  }
});
