// Caelestia Fullscreen New Tab Service Worker
// Respects Caelestia's tiling layout (never forces edge-to-edge screen takeover),
// keeps video player fullscreens untouched, and synchronizes theme colors.

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

// We deliberately DO NOT force chrome.windows.update({ state: "fullscreen" }) here.
// This allows Hyprland / Caelestia to naturally tile Brave alongside other apps
// (such as foot terminal) at Caelestia's default window sizes, gaps, and borders,
// while letting native video player toggles (e.g. YouTube) expand normally.

// Message listener for optional actions
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  const winId = sender.tab?.windowId;
  if (!winId) return;

  if (msg.action === 'toggleFullscreen') {
    chrome.windows.get(winId, (win) => {
      const nextState = win.state === 'fullscreen' ? 'normal' : 'fullscreen';
      chrome.windows.update(winId, { state: nextState });
      sendResponse({ state: nextState });
    });
    return true;
  }
});
