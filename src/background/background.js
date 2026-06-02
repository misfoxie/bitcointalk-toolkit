// background.js — MV3 Service Worker
// Handles: CORS bypass for bitcointalk.org fetches, message routing.
// No analytics, no external telemetry, no data leaves the user's machine.

const ALLOWED_HOST = /^https:\/\/bitcointalk\.org\//i;

// ── Message handler ────────────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

  // CORS-bypass fetch — bitcointalk.org only, GET only.
  // credentials: 'include' sends the user's active session cookies so the
  // scraper sees the same content as the logged-in browser view.
  if (message.action === 'fetchUrl') {
    const url = String(message.url || '').trim();
    if (!url || !ALLOWED_HOST.test(url)) {
      sendResponse({ success: false, error: 'Only bitcointalk.org URLs are allowed.' });
      return true;
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    fetch(url, { method: 'GET', credentials: 'include', cache: 'no-store', signal: controller.signal })
      .then(r => {
        const status = r.status;
        if (!r.ok) throw new Error(`HTTP ${status} ${r.statusText}`);
        return r.text().then(html => ({ html, status }));
      })
      .then(({ html, status }) => sendResponse({ success: true, html, method: 'background', status }))
      .catch(err  => sendResponse({ success: false, error: err.message }))
      .finally(() => clearTimeout(timer));
    return true; // keep message channel open for async response
  }

  // Open dashboard in a new tab, optionally jumping to a section via hash
  if (message.action === 'openDashboard') {
    const section = message.section ? `#${message.section}` : '';
    chrome.tabs.create({ url: chrome.runtime.getURL('src/ui/dashboard.html') + section });
    return false;
  }

  // Relay a message payload to all open Bitcointalk tabs
  // (active tab is often the dashboard itself, so query by URL instead)
  if (message.action === 'relayToTab') {
    chrome.tabs.query({ url: 'https://bitcointalk.org/*' }, tabs => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, message.data, () => {
          void chrome.runtime.lastError; // suppress "no receiver" if tab has no content script
        });
      });
    });
    return false;
  }

  if (message.action === 'fetchOfficialDTViaTab') {
    const requestedUrl = String(message.url || 'https://bitcointalk.org/index.php?action=trust;dt').trim();
    if (!ALLOWED_HOST.test(requestedUrl)) {
      sendResponse({ success: false, error: 'Only bitcointalk.org URLs are allowed.' });
      return true;
    }

    chrome.tabs.query({ url: 'https://bitcointalk.org/*' }, tabs => {
      const candidates = tabs.filter(tab => tab?.id);
      if (!candidates.length) {
        sendResponse({ success: false, error: 'Open Bitcointalk in a logged-in tab, then refresh DT cache.' });
        return;
      }

      let index = 0;
      const errors = [];
      const fetchWithTabInjection = (tabId, url, done) => {
        if (!chrome.scripting?.executeScript) {
          done({ success: false, error: 'chrome.scripting is unavailable.' });
          return;
        }

        chrome.scripting.executeScript({
          target: { tabId },
          args: [url],
          func: async url => {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 10000);
            try {
              const response = await fetch(url, { credentials: 'include', cache: 'no-store', signal: controller.signal });
              const html = await response.text();
              if (!response.ok) return { success: false, error: `HTTP ${response.status} ${response.statusText}` };
              return { success: true, html, method: 'injected-tab', status: response.status };
            } catch (err) {
              return { success: false, error: err.message || String(err), method: 'injected-tab' };
            } finally {
              clearTimeout(timer);
            }
          },
        }, results => {
          if (chrome.runtime.lastError) {
            done({ success: false, error: chrome.runtime.lastError.message });
            return;
          }
          done(results?.[0]?.result || { success: false, error: 'No injected fetch result.' });
        });
      };

      const tryNextTab = () => {
        const tab = candidates[index++];
        if (!tab?.id) {
          sendResponse({ success: false, error: errors.join(' | ') || 'No Bitcointalk content-script response.' });
          return;
        }

        chrome.tabs.sendMessage(tab.id, { action: 'fetchOfficialDTPage', url: requestedUrl }, response => {
          if (response?.success && response.html) {
            sendResponse(response);
            return;
          }
          if (chrome.runtime.lastError) errors.push(chrome.runtime.lastError.message);
          else errors.push(response?.error || 'No content-script response from Bitcointalk tab.');

          fetchWithTabInjection(tab.id, requestedUrl, injected => {
            if (injected?.success) {
              sendResponse(injected);
              return;
            }
            errors.push(injected?.error || 'Injected Bitcointalk fetch failed.');
            tryNextTab();
          });
        });
      };

      tryNextTab();
    });
    return true;
  }
});

// ── Extension installed / updated ─────────────────────────────────────────────
chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === 'install') {
    console.log('[BTT] Bitcointalk All-in-One Toolkit installed.');
    // Open dashboard on first install
    chrome.tabs.create({ url: chrome.runtime.getURL('src/ui/dashboard.html') });
  }
});
