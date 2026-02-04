let enginesCache = [];
let maxButtons = 3;
let floatEl = null;
let lastSelection = "";
let dropdownEl = null;
let uiLang = "zh";
let translateProvider = "google";

const LABELS = {
  zh: {
    copy: "复制",
    more: "更多",
    settings: "设置",
    translate: "翻译",
    translate_back: "原页面"
  },
  en: {
    copy: "Copy",
    more: "More",
    settings: "Settings",
    translate: "Translate Page",
    translate_back: "Original Page"
  }
};

function t(key) {
  return (LABELS[uiLang] && LABELS[uiLang][key]) || LABELS.zh[key];
}

function getTopEngines() {
  return enginesCache.slice(0, maxButtons);
}

async function loadEngines() {
  const result = await chrome.storage.sync.get(["engines", "settings"]);
  const engines = Array.isArray(result.engines) ? result.engines : [];
  const settings = result.settings || {};
  maxButtons = Number.isFinite(settings.maxButtons) ? settings.maxButtons : 3;
  if (maxButtons < 1) maxButtons = 1;
  window.__mesFloatPosition = settings.floatPosition || "top";
  uiLang = settings.lang || "zh";
  translateProvider = settings.translateProvider || "google";
  enginesCache = engines.filter((e) => e && e.name && e.template);
}

function createFloat() {
  const el = document.createElement("div");
  el.className = "mes-float";
  el.style.display = "none";
  document.body.appendChild(el);
  return el;
}

function clearFloat() {
  if (!floatEl) return;
  floatEl.style.display = "none";
  floatEl.innerHTML = "";
  dropdownEl = null;
}

function renderButtons(selectionText) {
  if (!floatEl) floatEl = createFloat();
  floatEl.innerHTML = "";
  const engines = getTopEngines();

  const copyBtn = document.createElement("button");
  copyBtn.type = "button";
  copyBtn.textContent = t("copy");
  copyBtn.addEventListener("click", async (event) => {
    event.stopPropagation();
    try {
      await navigator.clipboard.writeText(selectionText);
    } catch (err) {
      const textarea = document.createElement("textarea");
      textarea.value = selectionText;
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
    }
    clearFloat();
  });
  floatEl.appendChild(copyBtn);

  engines.forEach((engine) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = engine.name;
    btn.addEventListener("click", (event) => {
      event.stopPropagation();
      const query = encodeURIComponent(selectionText);
      const url = engine.template.replace(/%s/g, query);
      chrome.runtime.sendMessage({ type: "open-url", url });
    });
    floatEl.appendChild(btn);
  });

  const translateBtn = document.createElement("button");
  translateBtn.type = "button";
  translateBtn.textContent = t("translate");
  translateBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    const query = encodeURIComponent(selectionText);
    const hasCJK = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/.test(selectionText);
    const targetLang = hasCJK ? "en" : "zh-CN";
    let url = "";
    if (translateProvider === "baidu") {
      url = `https://fanyi.baidu.com/#auto/${encodeURIComponent(targetLang)}/${query}`;
    } else if (translateProvider === "bing") {
      url = `https://www.bing.com/translator?from=auto&to=${encodeURIComponent(targetLang)}&text=${query}`;
    } else {
      url = `https://translate.google.com/?sl=auto&tl=${encodeURIComponent(targetLang)}&text=${query}&op=translate`;
    }
    chrome.runtime.sendMessage({ type: "open-url", url });
  });
  floatEl.appendChild(translateBtn);

  const remaining = enginesCache.slice(engines.length);
  if (remaining.length) {
    const moreWrap = document.createElement("div");
    moreWrap.className = "mes-more";
    const moreBtn = document.createElement("button");
    moreBtn.type = "button";
    moreBtn.textContent = t("more");
    moreBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      if (dropdownEl) {
        dropdownEl.classList.toggle("open");
        return;
      }
      dropdownEl = document.createElement("div");
      dropdownEl.className = "mes-dropdown open";

      remaining.forEach((engine) => {
        const item = document.createElement("button");
        item.type = "button";
        item.textContent = engine.name;
        item.addEventListener("click", (e) => {
          e.stopPropagation();
          const query = encodeURIComponent(selectionText);
          const url = engine.template.replace(/%s/g, query);
          chrome.runtime.sendMessage({ type: "open-url", url });
        });
        dropdownEl.appendChild(item);
      });

      const divider = document.createElement("div");
      divider.className = "mes-divider";
      dropdownEl.appendChild(divider);

      const settingsBtn = document.createElement("button");
      settingsBtn.type = "button";
      settingsBtn.textContent = t("settings");
      settingsBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        chrome.runtime.sendMessage({ type: "open-options" });
      });
      dropdownEl.appendChild(settingsBtn);

      moreWrap.appendChild(dropdownEl);
    });
    moreWrap.appendChild(moreBtn);
    floatEl.appendChild(moreWrap);
  }

}

function positionFloat(rect) {
  if (!floatEl) return;
  const padding = 16;
  const floatWidth = floatEl.offsetWidth;
  const floatHeight = floatEl.offsetHeight;
  const viewportBottom = window.scrollY + window.innerHeight;

  const prefer = window.__mesFloatPosition || "top";
  let top = prefer === "bottom"
    ? window.scrollY + rect.bottom + padding
    : window.scrollY + rect.top - floatHeight - padding;
  if (prefer === "bottom" && top + floatHeight > viewportBottom - padding) {
    top = window.scrollY + rect.top - floatHeight - padding;
  } else if (prefer === "top" && top < window.scrollY + padding) {
    top = window.scrollY + rect.bottom + padding;
  }
  top = Math.min(top, viewportBottom - floatHeight - padding);

  let left = window.scrollX + rect.left;
  const viewportRight = window.scrollX + window.innerWidth;
  if (left + floatWidth > viewportRight - padding) {
    left = viewportRight - floatWidth - padding;
  }
  left = Math.max(left, window.scrollX + padding);

  floatEl.style.top = `${top}px`;
  floatEl.style.left = `${left}px`;
}

function handleSelection() {
  const selection = window.getSelection();
  if (!selection || selection.isCollapsed) {
    lastSelection = "";
    clearFloat();
    return;
  }

  const text = selection.toString().trim();
  if (!text) {
    lastSelection = "";
    clearFloat();
    return;
  }

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) {
    clearFloat();
    return;
  }

  lastSelection = text;
  renderButtons(text);
  floatEl.style.display = "flex";
  positionFloat(rect);
}

document.addEventListener("mouseup", (event) => {
  if (floatEl && floatEl.contains(event.target)) return;
  setTimeout(handleSelection, 0);
});

document.addEventListener("scroll", () => {
  clearFloat();
});

document.addEventListener("mousedown", (event) => {
  if (floatEl && floatEl.contains(event.target)) return;
  if (!window.getSelection()?.isCollapsed && lastSelection) return;
  clearFloat();
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "sync" && (changes.engines || changes.settings)) {
    loadEngines();
  }
});

loadEngines();
