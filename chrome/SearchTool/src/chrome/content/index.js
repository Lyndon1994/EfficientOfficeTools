var addonConfig = {
  engines: chrome.i18n.getMessage("defaultEnginesConfig"),
  select2clipboard: false,
  showTooltip: false,
  showTopSearchSwitch: true,
  searchInNewTab: true,
  themeStyle: "icon",
  themeColor: "rgba(144, 238, 144, 0.56)",
  textColor: "#202124",
};
var selectTxt = "";

var lasturl = window.location.href;
function isHashChanged() {
  var cururl = window.location.href;
  if (lasturl == cururl) {
    return false;
  }
  lasturl = cururl;
  return true;
}

// 读取数据，第一个参数是指定要读取的key以及设置默认值
chrome.storage.sync.get(addonConfig, function (items) {
  addonConfig.engines = JSON.parse(items.engines);
  // 从 local 获取 iconData
  chrome.storage.local.get(null, function(localItems) {
    addonConfig.engines.forEach(engine => {
      if (localItems && localItems['iconData_' + engine.name]) {
        engine.icon = localItems['iconData_' + engine.name];
      }
    });
    addonConfig.select2clipboard = items.select2clipboard;
    addonConfig.showTooltip = items.showTooltip;
    addonConfig.showTopSearchSwitch = items.showTopSearchSwitch;
    addonConfig.searchInNewTab = items.searchInNewTab;
    addonConfig.themeColor = items.themeColor;
    addonConfig.textColor = items.textColor || "#202124";

    // 展示顶部切换菜单
    if (addonConfig.showTopSearchSwitch) {
      var domains = document.domain.split(".");
      var needCreateTopTooltip = false;
      if (domains.length >= 2) {
        var domain = domains[1];
        if (domains.length == 2 || domain == "com") {
          domain = domains[0];
        }
        addonConfig.engines.forEach((engine) => {
          if (engine.url && engine.inPopup && engine.url.indexOf(domain) != -1) {
            needCreateTopTooltip = true;
          }
        });
        if (domain == "baidu" || domain == "google") {
          // baidu或者Google搜索词变化后网页不刷新，onhashchange也监听不了
          setInterval(function () {
            var ischanged = isHashChanged();
            if (ischanged) {
              hashChange();
            }
          }, 3000);
        }
      }
      if (needCreateTopTooltip) {
        createTopTooltip();
      }
    }
    return true;
  });
});

//监听触发操作
function hashChange() {
  var tooltipEl = document.getElementById("addon_toptooltip");
  if (tooltipEl) {
    tooltipEl.remove();
  }
  createTopTooltip();
}

// 获取选中的文本
function getSelectText() {
  var txt = "";
  if (document.selection) {
    txt = document.selection.createRange().text;
  } else {
    txt = document.getSelection();
    //txt = window.getSelection();
  }
  return txt.toString().trim();
}
function removeTooltip() {
  var tooltipEl = document.getElementById("addon_tooltip");
  if (tooltipEl) {
    tooltipEl.remove();
  }
}
function copySelectTxt() {
  navigator.clipboard
    .writeText(selectTxt)
    .then(() => {})
    .catch((error) => {
      console.log(`Copy failed! ${error}`);
    });
}
function createTooltip(e) {
  var x = e.pageX;
  var y = e.pageY;
  var tooltip = `<div id="strong_search_menu_id" class="addon_xlj_toobar" style="position: absolute; left: {x}px; top: {y}px; z-index: 100000000; background-color: ${addonConfig.themeColor}; color: ${addonConfig.textColor};">`;

  var reg = /(\w+[^\s]+(\.[^\s]+){1,})/;
  var ret = reg.exec(selectTxt);
  if (ret) {
    var url = ret[1].trim();
    var openTip = chrome.i18n.getMessage("open");
    var copyBtn = `<a class="addon_xlj_copy_toobar addon_xlj_button" style="color:${addonConfig.textColor};" target="${addonConfig.searchInNewTab ? "_blank" : "_self"}" href="${url}">
        <img class="addon_xlj_search_icon" src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/PjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+PHN2ZyB0PSIxNjUxNTgwNDU1NTcwIiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9Ijk0MiIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48ZGVmcz48c3R5bGUgdHlwZT0idGV4dC9jc3MiPjwvc3R5bGU+PC9kZWZzPjxwYXRoIGQ9Ik04MzIgMTI4SDY0MHY2NGgxNDYuNzUyTDUyMS4zNzYgNDU3LjM3Nmw0NS4yNDggNDUuMjQ4TDgzMiAyMzcuMjQ4VjM4NGg2NFYxMjh6IiBmaWxsPSIjZmZmZmZmIiBwLWlkPSI5NDMiPjwvcGF0aD48cGF0aCBkPSJNNzY4IDgzMkgxOTJWMjU2aDM1MnYtNjRIMTYwYTMyIDMyIDAgMCAwLTMyIDMydjY0MGEzMiAzMiAwIDAgMCAzMiAzMmg2NDBhMzIgMzIgMCAwIDAgMzItMzJWNDgwaC02NHYzNTJ6IiBmaWxsPSIjZmZmZmZmIiBwLWlkPSI5NDQiPjwvcGF0aD48L3N2Zz4=">
        <div class="addon_xlj_func">${openTip}</div></a>`;
    tooltip = tooltip + copyBtn;
  }

  var copyTip = chrome.i18n.getMessage("copy");
  if (!addonConfig.select2clipboard) {
    let copyIconEmoji = "📋";
    copyBtn = `<div class="addon_xlj_copy_toobar addon_xlj_button" style="font-size:20px;line-height:22px;cursor:pointer;color:${addonConfig.textColor};" title="${copyTip}" onclick="navigator.clipboard.writeText('${selectTxt}')">
        ${copyIconEmoji}
      </div>`;
    tooltip = tooltip + copyBtn;
  }

  var searchContent = '<div class="addon_xlj_button">';
  var inTooltipCount = 0;
  addonConfig.engines.forEach((engine) => {
    if (engine.name && engine.url && engine.inTooltip) {
      inTooltipCount += 1;
      var url = engine.url.replace("%s", encodeURIComponent(selectTxt));
      if (addonConfig.themeStyle == "text" || !(engine.icon || engine.iconData)) {
        searchContent += `<div class="addon_xlj_search_parts_engine addon_xlj_link_color" data-url="${url}" title="${engine.name}"><a style="color:${addonConfig.textColor};" target="${addonConfig.searchInNewTab ? "_blank" : "_self"}" href="${url}">${engine.name}</a></div>`;
      } else {
        var icon = engine.iconData || engine.icon;
        searchContent += `<a class="addon_xlj_search_parts_engine" style="color:${addonConfig.textColor};" target="${addonConfig.searchInNewTab ? "_blank" : "_self"}" href="${url}"><img style="width: 22px; height: 22px;" src="${icon}" alt="${engine.name}"></a>`;
      }
    }
  });
  searchContent += "</div>";
  if (inTooltipCount > 0) {
    tooltip += searchContent;
  }
  if (inTooltipCount == 0 && addonConfig.select2clipboard) {
    return;
  }

  tooltip += "</div>";
  tooltip = tooltip.replace("{x}", x + 5).replace("{y}", y + 20);
  var tooltipEl = document.createElement("div");
  tooltipEl.id = "addon_tooltip";
  tooltipEl.innerHTML = tooltip;
  document.body.appendChild(tooltipEl);
}

document.addEventListener("mouseup", function (event) {
  selectTxt = getSelectText();
  if (addonConfig.select2clipboard) {
    copySelectTxt();
  }
  // 需要等一会，否则点击菜单的时候，这里就remove了，导致点击不了。
  setTimeout(function () {
    removeTooltip();
    if (addonConfig.showTooltip && selectTxt) {
      createTooltip(event);
    }
  }, 100);
});

function createTopTooltip() {
  console.log("createTopTooltip");
  var pinTooltip = `<div id="strong_search_menu_id" class="addon_xlj_toobar" style="position: fixed; left: 60%; top: 0px; z-index: 100000000; background-color: ${addonConfig.themeColor}; color: ${addonConfig.textColor};">`;
  var inTooltipCount = 0;
  var searchContent = '<div class="addon_xlj_button">';
  if (addonConfig.themeColor != "black") {
    searchContent = '<div style="border-right: 0px;" class="addon_xlj_button">';
  }
  var urlObj = parseUrl(window.location.href);
  var query =
    urlObj["wd"] ||
    urlObj["word"] ||
    urlObj["query"] ||
    urlObj["q"] ||
    urlObj["w"] ||
    "";
  query = decodeURI(query);
  if (!query) {
    return;
  }
  addonConfig.engines.forEach((engine) => {
    if (engine.name && engine.url && engine.inPopup) {
      inTooltipCount += 1;
      var url = engine.url.replace("%s", query);
      if (addonConfig.themeStyle == "text" || !(engine.icon || engine.iconData)) {
        searchContent += `<div class="addon_xlj_search_parts_engine addon_xlj_link_color" data-url="${url}" title="${engine.name}"><a style="color:${addonConfig.textColor};" target="${addonConfig.searchInNewTab ? "_blank" : "_self"}" href="${url}">${engine.name}</a></div>`;
      } else {
        var icon = engine.iconData || engine.icon;
        searchContent += `<a class="addon_xlj_search_parts_engine" style="color:${addonConfig.textColor};" target="${addonConfig.searchInNewTab ? "_blank" : "_self"}" href="${url}"><img style="width: 22px; height: 22px;" src="${icon}" alt="${engine.name}"></a>`;
      }
    }
  });
  searchContent += "</div>";
  if (inTooltipCount <= 0) {
    return;
  }
  pinTooltip += searchContent;
  if (addonConfig.themeColor != "black") {
    pinTooltip += `<div class="addon_xlj_copy_toobar addon_xlj_button" title="close" style="color:${addonConfig.textColor};" onclick="document.getElementById('addon_toptooltip').remove()">
        <div class="addon_xlj_func">X</div></div>`;
  } else {
    pinTooltip += `<div class="addon_xlj_copy_toobar addon_xlj_button" title="close" style="color:${addonConfig.textColor};" onclick="document.getElementById('addon_toptooltip').remove()">
        <div class="addon_xlj_func addon_xlj_link_color">X</div></div>`;
  }

  pinTooltip += "</div>";
  var tooltipEl = document.createElement("div");
  tooltipEl.id = "addon_toptooltip";
  tooltipEl.innerHTML = pinTooltip;
  document.body.appendChild(tooltipEl);
}

function parseUrl(url) {
  var obj = {};
  var reg = /([^?=&]+)=([^?=&]+)/g;
  url.replace(reg, function () {
    obj[arguments[1]] = arguments[2];
  });
  return obj;
}

console.debug("[ContentScript] content script loaded");

// 监听 background script 消息
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.debug("[ContentScript] onMessage", request);
  if (request.action === "getPageContent") {
    // 返回页面正文内容
    sendResponse({ content: document.body ? document.body.innerText : document.documentElement.innerText });
    return true;
  }
  if (request.action === "showSummaryDialog") {
    showSummaryDialog(request.summary, request.messages);
    // Send immediate response instead of returning true without sending a response
    sendResponse({ success: true });
    // Don't return true since we're not sending an async response
  }
  if (request.action === "showLLMChatDialog" && request.menu) {
    // Store the requestId to track this specific request
    const requestId = request.requestId || Date.now().toString();
    console.debug(`[ContentScript] Showing LLM chat dialog for request ${requestId}`);
    
    showLLMChatDialog(request.menu, request.selectionText || "", requestId);
    sendResponse({ success: true, requestId: requestId });
  }
});

// 简单弹窗显示总结内容
function showSummaryDialog(summary, messages) {
  // 移除已存在的弹窗
  let old = document.getElementById("addon_summary_dialog");
  if (old) old.remove();

  // 保留全文 summary 内容
  let summaryContent = summary;

  // 仅保存对话历史（不含 summary/网页内容）
  let chatHistory = messages || [];

  // summary 直接作为 HTML 展示
  let dialog = document.createElement("div");
  dialog.id = "addon_summary_dialog";
  dialog.style.position = "fixed";
  dialog.style.top = "10%";
  dialog.style.left = "50%";
  dialog.style.transform = "translateX(-50%)";
  dialog.style.background = "#fff";
  dialog.style.color = "#222";
  dialog.style.padding = "24px 32px";
  dialog.style.border = "1px solid #888";
  dialog.style.borderRadius = "8px";
  dialog.style.zIndex = 999999999;
  dialog.style.boxShadow = "0 4px 24px rgba(0,0,0,0.15)";
  dialog.style.maxWidth = "600px";
  dialog.style.maxHeight = "60vh";
  dialog.style.overflowY = "auto";
  dialog.innerHTML = `
    <div style="font-weight:bold;margin-bottom:8px;">${chrome.i18n.getMessage("summarizeFullPage") || "总结全文"}</div>
    <div style="white-space:normal;" id="addon_summary_dialog_content">${summaryContent}</div>
    <div id="addon_summary_dialog_chat" style="margin-top:16px;"></div>
    <div style="display:flex;gap:8px;margin-top:12px;">
      <input id="addon_summary_dialog_input" type="text" style="flex:1;padding:4px 8px;" placeholder="${chrome.i18n.getMessage("llmInputPlaceholder") || "继续提问..."}">
      <button id="addon_summary_dialog_send" style="padding:4px 16px;">${chrome.i18n.getMessage("llmSendBtn") || "发送"}</button>
      <button id="addon_summary_dialog_close" style="padding:4px 16px;">${chrome.i18n.getMessage("llmCloseBtn") || "关闭"}</button>
    </div>
  `;
  document.body.appendChild(dialog);

  // 关闭按钮
  document.getElementById("addon_summary_dialog_close").onclick = function () {
    dialog.remove();
  };

  // 发送按钮
  document.getElementById("addon_summary_dialog_send").onclick = sendUserMessage;
  document.getElementById("addon_summary_dialog_input").addEventListener("keydown", function(e) {
    if (e.key === "Enter") sendUserMessage();
  });

  function appendMessage(role, content) {
    const chatDiv = document.getElementById("addon_summary_dialog_chat");
    const msgDiv = document.createElement("div");
    // 国际化处理：你/助手
    let roleLabel = "";
    if (role === "user") {
      roleLabel = chrome.i18n.getMessage("llmUserLabel") || "🧑";
    } else {
      roleLabel = chrome.i18n.getMessage("llmAssistantLabel") || "🤖";
    }
    msgDiv.style.margin = "8px 0";
    msgDiv.innerHTML = `<b>${roleLabel}:</b> <span>${content}</span>`;
    chatDiv.appendChild(msgDiv);
    chatDiv.scrollTop = chatDiv.scrollHeight;
  }

  function sendUserMessage() {
    const input = document.getElementById("addon_summary_dialog_input");
    const question = input.value.trim();
    if (!question) return;
    appendMessage("user", question);
    
    const history = [
      ...chatHistory,
      { role: "assistant", content: summaryContent },
      { role: "user", content: question }
    ];
    
    input.value = "";
    // 显示loading
    appendMessage("assistant", chrome.i18n.getMessage("llmThinking") || "思考中...");
    // 发送到background
    chrome.runtime.sendMessage(
      { action: "chatWithLLM", history },
      function(response) {
        // 移除最后一个"思考中..."消息
        const chatDiv = document.getElementById("addon_summary_dialog_chat");
        if (chatDiv.lastChild && chatDiv.lastChild.innerText.includes(chrome.i18n.getMessage("llmThinking") || "思考中")) {
          chatDiv.removeChild(chatDiv.lastChild);
        }
        if (response && response.reply) {
          appendMessage("assistant", response.reply);
          // 只保存用户和助手的对话，不保存 summaryContent 或 pageContent
          chatHistory.push({ role: "user", content: question });
          chatHistory.push({ role: "assistant", content: response.reply });
        } else {
          appendMessage("assistant", chrome.i18n.getMessage("llmChatFailed") || "对话失败，请重试。");
        }
      }
    );
  }
}

// 新增：对话大模型菜单弹窗
function showLLMChatDialog(menu, selectionText, requestId) {
  console.debug(`[ContentScript] Inside showLLMChatDialog, requestId: ${requestId}`);
  
  // 移除已存在的弹窗
  let old = document.getElementById("addon_summary_dialog");
  if (old) {
    console.debug("[ContentScript] Removing existing dialog");
    old.remove();
  }

  let summaryContent = ""; // 首次为空
  let chatHistory = [
    { role: "system", content: menu.systemPrompt || "" },
    { role: "user", content: menu.prompt }
  ];
  
  // 添加标记，防止重复发送
  let messageProcessing = false;
  let dialogId = `dialog_${Date.now()}`;

  let dialog = document.createElement("div");
  dialog.id = "addon_summary_dialog";
  dialog.dataset.dialogId = dialogId;
  dialog.style.position = "fixed";
  dialog.style.top = "10%";
  dialog.style.left = "50%";
  dialog.style.transform = "translateX(-50%)";
  dialog.style.background = "#fff";
  dialog.style.color = "#222";
  dialog.style.padding = "24px 32px";
  dialog.style.border = "1px solid #888";
  dialog.style.borderRadius = "8px";
  dialog.style.zIndex = 999999999;
  dialog.style.boxShadow = "0 4px 24px rgba(0,0,0,0.15)";
  dialog.style.maxWidth = "600px";
  dialog.style.maxHeight = "60vh";
  dialog.style.overflowY = "auto";
  dialog.innerHTML = `
    <div style="font-weight:bold;margin-bottom:8px;">${menu.name || chrome.i18n.getMessage("llmChatDialogTitle") || "对话助手"}</div>
    <div style="white-space:normal;" id="addon_summary_dialog_content">${summaryContent}</div>
    <div id="addon_summary_dialog_chat" style="margin-top:16px;"></div>
    <div style="display:flex;gap:8px;margin-top:12px;">
      <input id="addon_summary_dialog_input" type="text" style="flex:1;padding:4px 8px;" placeholder="${chrome.i18n.getMessage("llmInputPlaceholder") || "请输入..."}">
      <button id="addon_summary_dialog_send" style="padding:4px 16px;">${chrome.i18n.getMessage("llmSendBtn") || "发送"}</button>
      <button id="addon_summary_dialog_close" style="padding:4px 16px;">${chrome.i18n.getMessage("llmCloseBtn") || "关闭"}</button>
    </div>
  `;
  document.body.appendChild(dialog);

  document.getElementById("addon_summary_dialog_close").onclick = function () {
    dialog.remove();
  };

  document.getElementById("addon_summary_dialog_send").onclick = sendUserMessage;
  document.getElementById("addon_summary_dialog_input").addEventListener("keydown", function(e) {
    if (e.key === "Enter") sendUserMessage();
  });

  function appendMessage(role, content) {
    const chatDiv = document.getElementById("addon_summary_dialog_chat");
    const msgDiv = document.createElement("div");
    let roleLabel = "";
    if (role === "user") {
      roleLabel = chrome.i18n.getMessage("llmUserLabel") || "🧑";
    } else {
      roleLabel = chrome.i18n.getMessage("llmAssistantLabel") || "🤖";
    }
    msgDiv.style.margin = "8px 0";
    msgDiv.innerHTML = `<b>${roleLabel}:</b> <span>${content}</span>`;
    chatDiv.appendChild(msgDiv);
    chatDiv.scrollTop = chatDiv.scrollHeight;
  }

  // 首次自动发送 prompt
  function sendFirstPrompt() {
    // 检查是否已经在处理请求
    if (messageProcessing) {
      console.debug(`[ContentScript] Already processing a request for dialog ${dialogId}, skipping`);
      return;
    }
    
    messageProcessing = true;
    console.debug(`[ContentScript] Sending first prompt for dialog ${dialogId}`);
    
    // 检查对话框是否还存在
    if (!document.getElementById("addon_summary_dialog")) {
      console.debug(`[ContentScript] Dialog no longer exists, not sending request`);
      return;
    }
    
    appendMessage("user", menu.prompt);
    appendMessage("assistant", chrome.i18n.getMessage("llmThinking") || "思考中...");
    
    chrome.runtime.sendMessage(
      { 
        action: "chatWithLLMMenu", 
        menu, 
        history: chatHistory,
        dialogId: dialogId,
        requestId: requestId
      },
      function(response) {
        messageProcessing = false;
        
        // 检查是否为重复请求
        if (response && response.duplicate) {
          console.debug(`[ContentScript] Received duplicate response for ${dialogId}`);
          return;
        }
        
        // 检查对话框是否还存在
        const chatDiv = document.getElementById("addon_summary_dialog_chat");
        if (!chatDiv) {
          console.debug(`[ContentScript] Dialog no longer exists when receiving response`);
          return;
        }
        
        // 移除最后一个"思考中..."消息
        if (chatDiv.lastChild && chatDiv.lastChild.innerText && 
            chatDiv.lastChild.innerText.includes(chrome.i18n.getMessage("llmThinking") || "思考中")) {
          chatDiv.removeChild(chatDiv.lastChild);
        }
        
        if (response && response.reply) {
          appendMessage("assistant", response.reply);
          chatHistory.push({ role: "assistant", content: response.reply });
        } else {
          appendMessage("assistant", chrome.i18n.getMessage("llmChatFailed") || "对话失败，请重试。");
        }
      }
    );
  }

  // 使用setTimeout确保在DOM加载后再发送，避免竞争条件
  console.debug(`[ContentScript] Setting timeout to send first prompt for dialog ${dialogId}`);
  setTimeout(sendFirstPrompt, 100);

  function sendUserMessage() {
    // 检查是否已经在处理请求
    if (messageProcessing) return;
    messageProcessing = true;
    
    const input = document.getElementById("addon_summary_dialog_input");
    const question = input.value.trim();
    if (!question) {
      messageProcessing = false;
      return;
    }
    appendMessage("user", question);
    input.value = "";
    appendMessage("assistant", chrome.i18n.getMessage("llmThinking") || "思考中...");
    // 构造完整 history
    const history = [
      ...chatHistory,
      { role: "user", content: question }
    ];
    chrome.runtime.sendMessage(
      { 
        action: "chatWithLLMMenu", 
        menu, 
        history,
        dialogId: dialogId 
      },
      function(response) {
        messageProcessing = false;
        // 检查对话框是否还存在
        const chatDiv = document.getElementById("addon_summary_dialog_chat");
        if (!chatDiv) {
          console.debug(`[ContentScript] Dialog no longer exists when receiving response`);
          return;
        }
        
        // 移除最后一个"思考中..."消息
        if (chatDiv.lastChild && chatDiv.lastChild.innerText && 
            chatDiv.lastChild.innerText.includes(chrome.i18n.getMessage("llmThinking") || "思考中")) {
          chatDiv.removeChild(chatDiv.lastChild);
        }
        
        if (response && response.reply) {
          appendMessage("assistant", response.reply);
          chatHistory.push({ role: "user", content: question });
          chatHistory.push({ role: "assistant", content: response.reply });
        } else {
          appendMessage("assistant", chrome.i18n.getMessage("llmChatFailed") || "对话失败，请重试。");
        }
      }
    );
  }
}
