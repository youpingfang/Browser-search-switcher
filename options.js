const listEl = document.getElementById("list");
const statusEl = document.getElementById("status");
const addBtn = document.getElementById("add");
const saveBtn = document.getElementById("save");
const resetBtn = document.getElementById("reset");
const rowTemplate = document.getElementById("row-template");
const quickButtonsEl = document.getElementById("quick-buttons");
const maxButtonsInput = document.getElementById("max-buttons");
const themeSelect = document.getElementById("theme");
const languageSelect = document.getElementById("language");
const floatPositionSelect = document.getElementById("float-position");
const tabPositionSelect = document.getElementById("tab-position");

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

const QUICK_ENGINES = [
  {
    name: "Google",
    template: "https://www.google.com/search?q=%s"
  },
  {
    name: "Bing",
    template: "https://www.bing.com/search?q=%s"
  },
  {
    name: "Wikipedia",
    template: "https://en.wikipedia.org/wiki/Special:Search?search=%s"
  },
  {
    name: "Zhihu",
    template: "https://www.zhihu.com/search?q=%s"
  },
  {
    name: "Bilibili",
    template: "https://search.bilibili.com/all?keyword=%s"
  },
  {
    name: "GitHub",
    template: "https://github.com/search?q=%s"
  },
  {
    name: "Taobao",
    template: "https://s.taobao.com/search?q=%s"
  },
  {
    name: "JD",
    template: "https://search.jd.com/Search?keyword=%s"
  },
  {
    name: "Twitter",
    template: "https://twitter.com/search?q=%s"
  },
  {
    name: "YouTube",
    template: "https://www.youtube.com/results?search_query=%s"
  },
  {
    name: "Google Scholar",
    template: "https://scholar.google.com/scholar?q=%s"
  },
  {
    name: "Douyin",
    template: "https://www.douyin.com/search/%s"
  }
];

const I18N = {
  en: {
    title: "Custom Search Engine Settings",
    theme_label: "Theme",
    theme_system: "System",
    theme_light: "Light",
    theme_dark: "Dark",
    lang_label: "Language",
    lang_en: "English",
    lang_zh: "Chinese",
    hint: "Each engine must include a name and a URL template with %s.",
    quick_add: "Quick Add",
    display: "Display",
    floating_count: "Floating buttons count",
    float_position: "Floating position",
    float_top: "Above selection",
    float_bottom: "Below selection",
    tab_position: "New tab position",
    tab_next: "Next to current tab",
    tab_end: "End of window",
    add_engine: "Add Engine",
    save: "Save",
    reset: "Reset Defaults",
    name_label: "Name",
    name_placeholder: "Google",
    template_label: "Template",
    template_placeholder: "https://www.google.com/search?q=%s",
    remove: "Remove",
    status_exists: "Already added.",
    support_title: "Support",
    support_desc: "If this extension helps you, you can support the author.",
    alipay_label: "Alipay QR",
    wechat_pay_label: "WeChat Pay QR",
    wechat_friend_label: "WeChat Friend QR",
    support_copy:
      "Every time I select text to search, I still have to dig through a long right-click menu, which breaks my flow. I built this small tool to make searching smoother: switch engines and search in one step, reduce the friction, and save your energy. If it truly helps you, feel free to scan a QR code to support me, or add me on WeChat to send a red packet. I will keep making it better!",
    wechat_title: "WeChat",
    wechat_desc: "WeChat add-friend QR code.",
    status_saved: "Saved.",
    status_invalid: "Please add at least one valid engine.",
    status_reset: "Reset to defaults.",
    status_autosaved_once: "Auto-saved."
  },
  zh: {
    title: "搜索设置页面",
    theme_label: "主题",
    theme_system: "跟随系统",
    theme_light: "亮色",
    theme_dark: "暗色",
    lang_label: "语言",
    lang_en: "英文",
    lang_zh: "中文",
    hint: "每个引擎必须包含名称和带 %s 的模板 URL。",
    quick_add: "快速添加",
    display: "显示",
    floating_count: "浮层按钮数量",
    float_position: "浮层位置",
    float_top: "上方",
    float_bottom: "下方",
    tab_position: "新标签位置",
    tab_next: "紧跟当前标签",
    tab_end: "窗口末尾",
    add_engine: "添加引擎",
    save: "保存",
    reset: "恢复默认",
    name_label: "名称",
    name_placeholder: "Google",
    template_label: "模板",
    template_placeholder: "https://www.google.com/search?q=%s",
    remove: "删除",
    status_exists: "已添加过。",
    support_title: "支持作者",
    support_desc: "如果这个插件对你有帮助，欢迎支持作者。",
    alipay_label: "支付宝收款码",
    wechat_pay_label: "微信收款码",
    wechat_friend_label: "微信加好友",
    support_copy:
      "每次页面选择文字搜索，去找自己想要的搜索引擎，真的很打断思路。我做这个小工具，目的就是想让搜索更顺手，换个引擎直接搜索一步到位，减少搜索痛苦感，节省你的精力。如果它确实帮到你，也欢迎扫二维码支持一下，或者添加好友发个红包，我会继续把它做得更好！",
    wechat_title: "微信",
    wechat_desc: "微信加好友二维码。",
    status_saved: "已保存。",
    status_invalid: "至少添加一个有效引擎。",
    status_reset: "已恢复默认。",
    status_autosaved_once: "已自动保存。"
  }
};

let currentLang = "en";
let currentSettings = {
  maxButtons: 3,
  theme: "system",
  lang: "zh",
  autoSaveNotified: false,
  floatPosition: "top",
  tabPosition: "next"
};

function t(key) {
  return I18N[currentLang]?.[key] || I18N.en[key] || "";
}

function applyLanguage(lang) {
  currentLang = lang in I18N ? lang : "en";
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.getAttribute("data-i18n"));
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    el.setAttribute(
      "placeholder",
      t(el.getAttribute("data-i18n-placeholder"))
    );
  });
}

function setStatus(messageKey) {
  statusEl.textContent = t(messageKey);
  if (messageKey) {
    setTimeout(() => {
      statusEl.textContent = "";
    }, 2000);
  }
}

function applyTheme(theme) {
  const body = document.body;
  body.classList.remove("theme-dark");
  if (theme === "dark") {
    body.classList.add("theme-dark");
    return;
  }
  if (theme === "system") {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      body.classList.add("theme-dark");
    }
  }
}

let autosaveTimer = null;
function scheduleAutosave() {
  if (autosaveTimer) clearTimeout(autosaveTimer);
  autosaveTimer = setTimeout(async () => {
    const engines = getEnginesFromUI();
    if (!engines.length) {
      setStatus("status_invalid");
      return;
    }
    const settings = getSettingsFromUI();
    if (!settings.autoSaveNotified) {
      settings.autoSaveNotified = true;
      setStatus("status_autosaved_once");
    }
    await chrome.storage.sync.set({ engines, settings });
    applyTheme(settings.theme || "system");
    applyLanguage(settings.lang || "en");
  }, 400);
}

function createRow(engine = { name: "", template: "" }) {
  const node = rowTemplate.content.firstElementChild.cloneNode(true);
  const nameInput = node.querySelector(".name");
  const templateInput = node.querySelector(".template");
  const removeBtn = node.querySelector(".remove");
  const dragBtn = node.querySelector(".drag");
  const moveUpBtn = node.querySelector(".move-up");
  const moveDownBtn = node.querySelector(".move-down");

  nameInput.value = engine.name || "";
  templateInput.value = engine.template || "";

  removeBtn.addEventListener("click", () => {
    node.remove();
    scheduleAutosave();
  });

  moveUpBtn.addEventListener("click", () => {
    const previous = node.previousElementSibling;
    if (previous) {
      listEl.insertBefore(node, previous);
      scheduleAutosave();
    }
  });

  moveDownBtn.addEventListener("click", () => {
    const next = node.nextElementSibling;
    if (next) {
      listEl.insertBefore(next, node);
      scheduleAutosave();
    }
  });

  dragBtn.addEventListener("mousedown", () => {
    node.setAttribute("draggable", "true");
  });

  node.addEventListener("dragstart", (event) => {
    node.classList.add("dragging");
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", "");
  });

  node.addEventListener("dragend", () => {
    node.classList.remove("dragging");
    scheduleAutosave();
  });

  node.addEventListener("keydown", (event) => {
    if (!event.altKey) return;
    if (event.key === "ArrowUp") {
      event.preventDefault();
      const previous = node.previousElementSibling;
      if (previous) {
        listEl.insertBefore(node, previous);
        scheduleAutosave();
      }
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      const next = node.nextElementSibling;
      if (next) {
        listEl.insertBefore(next, node);
        scheduleAutosave();
      }
    }
  });

  [nameInput, templateInput].forEach((input) => {
    input.addEventListener("input", scheduleAutosave);
  });

  return node;
}

function appendEngine(engine) {
  const existing = getEnginesFromUI();
  const duplicate = existing.some(
    (item) =>
      item.name.toLowerCase() === engine.name.toLowerCase() ||
      item.template === engine.template
  );
  if (duplicate) {
    setStatus("status_exists");
    return;
  }
  listEl.appendChild(createRow(engine));
  scheduleAutosave();
}

function renderQuickButtons() {
  if (!quickButtonsEl) return;
  quickButtonsEl.innerHTML = "";
  QUICK_ENGINES.forEach((engine) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = engine.name;
    btn.addEventListener("click", () => appendEngine(engine));
    quickButtonsEl.appendChild(btn);
  });
}

function getDragAfterElement(container, y) {
  const rows = [...container.querySelectorAll(".row:not(.dragging)")];
  return rows.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset, element: child };
      }
      return closest;
    },
    { offset: Number.NEGATIVE_INFINITY, element: null }
  ).element;
}

listEl.addEventListener("dragover", (event) => {
  event.preventDefault();
  const dragging = listEl.querySelector(".dragging");
  if (!dragging) return;
  const afterElement = getDragAfterElement(listEl, event.clientY);
  if (!afterElement) {
    listEl.appendChild(dragging);
  } else {
    listEl.insertBefore(dragging, afterElement);
  }
});

async function loadEngines() {
  const result = await chrome.storage.sync.get(["engines", "settings"]);
  const engines = Array.isArray(result.engines) && result.engines.length
    ? result.engines
    : DEFAULT_ENGINES;
  const settings = result.settings || {
    maxButtons: 3,
    theme: "system",
    lang: "zh",
    autoSaveNotified: false,
    floatPosition: "top",
    tabPosition: "next"
  };
  currentSettings = {
    maxButtons: 3,
    theme: "system",
    lang: "zh",
    autoSaveNotified: false,
    floatPosition: "top",
    tabPosition: "next",
    ...settings
  };

  listEl.innerHTML = "";
  engines.forEach((engine) => listEl.appendChild(createRow(engine)));
  maxButtonsInput.value = Number.isFinite(currentSettings.maxButtons)
    ? currentSettings.maxButtons
    : 3;
  themeSelect.value = currentSettings.theme || "system";
  applyTheme(currentSettings.theme || "system");
  languageSelect.value = currentSettings.lang || "en";
  applyLanguage(currentSettings.lang || "en");
  floatPositionSelect.value = currentSettings.floatPosition || "top";
  tabPositionSelect.value = currentSettings.tabPosition || "next";
}

function getEnginesFromUI() {
  const rows = Array.from(listEl.querySelectorAll(".row"));
  return rows
    .map((row) => ({
      name: row.querySelector(".name").value.trim(),
      template: row.querySelector(".template").value.trim()
    }))
    .filter((engine) => engine.name && engine.template.includes("%s"));
}

function getSettingsFromUI() {
  const value = Number.parseInt(maxButtonsInput.value, 10);
  const maxButtons = Number.isFinite(value) && value > 0 ? value : 3;
  return {
    ...currentSettings,
    maxButtons,
    theme: themeSelect.value || "system",
    lang: languageSelect.value || "en",
    floatPosition: floatPositionSelect.value || "top",
    tabPosition: tabPositionSelect.value || "next"
  };
}

addBtn.addEventListener("click", () => {
  listEl.appendChild(createRow());
  scheduleAutosave();
});

saveBtn.addEventListener("click", async () => {
  const engines = getEnginesFromUI();
  if (!engines.length) {
    setStatus("status_invalid");
    return;
  }
  const settings = getSettingsFromUI();
  await chrome.storage.sync.set({ engines, settings });
  setStatus("status_saved");
  applyTheme(settings.theme || "system");
  applyLanguage(settings.lang || "en");
});

resetBtn.addEventListener("click", async () => {
  await chrome.storage.sync.set({
    engines: DEFAULT_ENGINES,
    settings: {
      maxButtons: 3,
      theme: "system",
      lang: "zh",
      autoSaveNotified: false
    }
  });
  await loadEngines();
  setStatus("status_reset");
});

maxButtonsInput.addEventListener("input", scheduleAutosave);
themeSelect.addEventListener("change", scheduleAutosave);
languageSelect.addEventListener("change", scheduleAutosave);
floatPositionSelect.addEventListener("change", scheduleAutosave);
tabPositionSelect.addEventListener("change", scheduleAutosave);

window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
  if (themeSelect.value === "system") {
    applyTheme("system");
  }
});

loadEngines();
renderQuickButtons();
