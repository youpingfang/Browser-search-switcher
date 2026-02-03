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
    chrome.tabs.create({ url });
  });
});

chrome.runtime.onMessage.addListener((message) => {
  if (!message || message.type !== "open-url" || !message.url) return;
  chrome.tabs.create({ url: message.url });
});

chrome.runtime.onMessage.addListener((message) => {
  if (!message || message.type !== "open-options") return;
  chrome.runtime.openOptionsPage();
});
