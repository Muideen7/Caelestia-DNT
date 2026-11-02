// Caelestia Fullscreen New Tab Service Worker
// Manages internal browser shortcuts, tiling compliance, and theme broadcasting.

// Broadcasts theme from caelestia-theme.json into chrome.storage.local
async function syncThemeToStorage() {
  try {
    const data = await chrome.storage.local.get(['caelestia_theme_source']);
    if (data.caelestia_theme_source === 'wallpaper-upload') {
      return;
    }
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

// Message listener for browser actions, navigation, and Zen fullscreen management
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
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
