const DEFAULT_ENGINES = [
  {
    name: "Google",
    template: "https://www.google.com/search?q=%s"
  },
  {
    name: "Bing",
    template: "https://www.bing.com/search?q=%s"
  },
  {
    name: "DuckDuckGo",
    template: "https://duckduckgo.com/?q=%s"
  },
  {
    name: "Wikipedia",
    template: "https://en.wikipedia.org/wiki/Special:Search?search=%s"
  }
];

async function getEngines() {
  const result = await chrome.storage.sync.get("engines");
  if (!Array.isArray(result.engines) || result.engines.length === 0) {
    await chrome.storage.sync.set({ engines: DEFAULT_ENGINES });
    return DEFAULT_ENGINES;
  }
  return result.engines;
}

async function rebuildMenus() {
  await chrome.contextMenus.removeAll();
  const engines = await getEngines();

  engines.forEach((engine, index) => {
    if (!engine || !engine.name || !engine.template) return;
    chrome.contextMenus.create({
      id: `engine-${index}`,
      title: `${index + 1}. ${engine.name}`,
      contexts: ["selection"]
    });
  });
}

chrome.runtime.onInstalled.addListener(() => {
  rebuildMenus();
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "sync" && changes.engines) {
    rebuildMenus();
  }
});

async function openNextToTab(tabId, url) {
  try {
    const tab = await chrome.tabs.get(tabId);
    chrome.tabs.create({
      url,
      index: tab.index + 1,
      openerTabId: tab.id
    });
  } catch (err) {
    chrome.tabs.create({ url });
  }
}

async function openAtEnd(url) {
  chrome.tabs.create({ url });
}

async function openWithPreference(tabId, url) {
  const result = await chrome.storage.sync.get(["settings"]);
  const position = result.settings?.tabPosition || "next";
  if (position === "end") {
    return openAtEnd(url);
  }
  return openNextToTab(tabId, url);
}

chrome.contextMenus.onClicked.addListener((info) => {
  if (!info.selectionText) return;
  const menuId = String(info.menuItemId || "");
  if (!menuId.startsWith("engine-")) return;

  const index = Number(menuId.slice("engine-".length));
  getEngines().then((engines) => {
    const engine = engines[index];
    if (!engine || !engine.template) return;
    const query = encodeURIComponent(info.selectionText);
    const url = engine.template.replace(/%s/g, query);
    openWithPreference(info.tabId, url);
  });
});

chrome.runtime.onMessage.addListener((message, sender) => {
  if (!message || message.type !== "open-url" || !message.url) return;
  if (sender && sender.tab && sender.tab.id != null) {
    openWithPreference(sender.tab.id, message.url);
  } else {
    chrome.tabs.create({ url: message.url });
  }
});

chrome.runtime.onMessage.addListener((message) => {
  if (!message || message.type !== "open-options") return;
  chrome.runtime.openOptionsPage();
});
