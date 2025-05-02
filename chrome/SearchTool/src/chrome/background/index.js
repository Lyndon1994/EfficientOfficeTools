function parseUrl(url) {
  let obj = {};
  let reg = /([^?=&]+)=([^?=&]+)/g;
  url.replace(reg, function () {
    obj[arguments[1]] = arguments[2];
  });
  return obj;
}

chrome.contextMenus.onClicked.addListener(function (info, tab) {
  // 1. 对话大模型菜单
  if (info.menuItemId && info.menuItemId.startsWith("llm_chat_menu_")) {
    const idx = parseInt(info.menuItemId.replace("llm_chat_menu_", ""));
    chrome.storage.sync.get({ llmChatMenus: [] }, function(items) {
      const menus = Array.isArray(items.llmChatMenus) ? items.llmChatMenus : [];
      const menu = menus[idx];
      if (!menu) return;
      const prompt = (menu.prompt || "").replace("{content}", info.selectionText || "");
      const systemPrompt = menu.systemPrompt || "";
      // 发送消息到 content script，弹出对话框
      chrome.tabs.sendMessage(tab.id, {
        action: "showLLMChatDialog",
        menu: {
          id: menu.id,
          name: menu.name,
          prompt,
          systemPrompt,
          originalPrompt: menu.prompt
        },
        selectionText: info.selectionText || ""
      });
    });
    return;
  }
  if (info.menuItemId === "summarize_full_page") {
    console.debug("[Summarize] 右键菜单触发 summarize_full_page");
    chrome.tabs.sendMessage(tab.id, { action: "getPageContent" }, function (response) {
      if (chrome.runtime.lastError) {
        console.warn("[Summarize] sendMessage(getPageContent) failed:", chrome.runtime.lastError.message);
        return;
      }
      console.debug("[Summarize] 收到页面内容", response);
      if (response && response.content) {
        summarizeContent(response.content).then(summary => {
          console.debug("[Summarize] 总结结果", summary);
          chrome.tabs.sendMessage(tab.id, { action: "showSummaryDialog", summary }, function(resp) {
            if (chrome.runtime.lastError) {
              console.warn("[Summarize] sendMessage(showSummaryDialog) failed:", chrome.runtime.lastError.message);
            }
          });
        }).catch(err => {
          console.error("[Summarize] 总结失败", err);
          chrome.tabs.sendMessage(tab.id, { action: "showSummaryDialog", summary: "总结失败: " + err.message }, function(resp) {
            if (chrome.runtime.lastError) {
              console.warn("[Summarize] sendMessage(showSummaryDialog) failed:", chrome.runtime.lastError.message);
            }
          });
        });
      } else {
        console.warn("[Summarize] 未获取到页面内容");
      }
    });
  } else {
    chrome.tabs.create({
      url: info.menuItemId.replace("%s", encodeURIComponent(info.selectionText)),
    });
  }
});

// LLM参数默认值，key与option页面保持一致
const defaultLLMConfig = {
  llmEnableSummarize: false,
  llmApiKey: "",
  llmEndpoint: "",
  llmPrompt: chrome.i18n.getMessage("llmPrompt") || "请用HTML格式总结以下网页内容，内容要有条理、分点、可直接用于innerHTML展示：\n%s",
  llmMaxTokens: chrome.i18n.getMessage("llmMaxTokens") || "32000",
  llmTemperature: chrome.i18n.getMessage("llmTemperature") || "0.5",
  llmSystemPrompt: chrome.i18n.getMessage("llmSystemPrompt") || "你是一个专业的中文内容总结助手，输出内容必须是可直接用于innerHTML展示的HTML片段。"
};

function addContextMenus() {
  chrome.contextMenus.removeAll();
  let defaultConfig = {
    engines: chrome.i18n.getMessage("defaultEnginesConfig"),
    llmChatMenus: [],
  }; // 默认配置
  chrome.storage.sync.get({ ...defaultConfig, ...defaultLLMConfig }, function (items) {
    // 1. 先添加对话大模型菜单
    if (Array.isArray(items.llmChatMenus)) {
      items.llmChatMenus.forEach((menu, idx) => {
        if (menu && menu.name && menu.prompt) {
          chrome.contextMenus.create({
            title: menu.name,
            id: "llm_chat_menu_" + idx,
            contexts: ["selection"],
          });
        }
      });
    }
    // 2. 再添加 engines
    let engines = JSON.parse(items.engines);
    engines.forEach(function (engine) {
      if (engine.name && engine.url && engine.inRight) {
        chrome.contextMenus.create({
          title: chrome.i18n.getMessage("searchFor", engine.name),
          id: engine.url,
          contexts: ["selection"],
        });
      }
    });
    // 3. 总结全文菜单
    console.debug("[Summarize] 添加右键菜单", items);

    const enableSummarize = items.llmEnableSummarize;
    const apiKey = items.llmApiKey;
    const endpoint = items.llmEndpoint;
    if (enableSummarize && apiKey && endpoint) {
      chrome.contextMenus.create({
        title: chrome.i18n.getMessage("summarizeFullPage") || "总结全文",
        id: "summarize_full_page",
        contexts: ["page"],
      });
    }
  });
}

chrome.runtime.onStartup.addListener(addContextMenus);
chrome.runtime.onInstalled.addListener(addContextMenus);

// 监听来自content-script的消息
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (Array.isArray(request)) {
    // 兼容旧代码
    request.forEach(function (engine) {
      if (engine.name && engine.url && engine.inRight) {
        chrome.contextMenus.create({
          title: chrome.i18n.getMessage("searchFor", engine.name),
          id: engine.url,
          contexts: ["selection"],
        });
      }
    });
    sendResponse("done");
    return;
  }
  if (request.action === "chatWithLLM" && Array.isArray(request.history)) {
    // 多轮对话
    summarizeContentWithHistory(request.history).then(reply => {
      sendResponse({ reply });
    }).catch(err => {
      sendResponse({ reply: "对话失败: " + err.message });
    });
    return true; // 表示异步
  }
  if (request.action === "chatWithLLMMenu" && request.menu) {
    // 单轮/多轮对话，参数来自 menu
    chatWithLLMMenu(request.menu, request.history).then(reply => {
      sendResponse({ reply });
    }).catch(err => {
      sendResponse({ reply: "对话失败: " + err.message });
    });
    return true;
  }
});

chrome.commands.onCommand.addListener(function (command) {
  if (command === "toggle-search") {
    chrome.tabs.query({ active: true }, function (tabs) {
      let tab = tabs[0];
      let urlObj = parseUrl(tab.url);
      let domain = tab.url.split("/")[2].split(".")[1];
      let query =
        urlObj["wd"] ||
        urlObj["word"] ||
        urlObj["w"] ||
        urlObj["q"] ||
        urlObj["query"];
      if (query) {
        let defaultConfig = {
          engines: chrome.i18n.getMessage("defaultEnginesConfig"),
        }; // 默认配置
        chrome.storage.sync.get(defaultConfig, function (items) {
          let engines = JSON.parse(items.engines);
          if (engines.length < 1) {
            console.log("no engine");
            return;
          }
          let you = false;
          let over = false;
          engines.forEach(function (engine) {
            if (over) {
              return;
            }
            if (engine.name && engine.url && engine.inShortcuts) {
              if (you === true) {
                over = true;
                chrome.tabs.update({ url: engine.url.replace("%s", query) });
                // window.close(); 关了就不好使了
                return;
              }
              engine.domain = engine.url.split("/")[2].split(".")[1];
              // 匹配当前url域名是否存在于engines中
              if (engine.domain == domain) {
                you = true;
              }
            }
          });
          if (over === false) {
            chrome.tabs.update({ url: engines[0].url.replace("%s", query) });
            // window.close(); 关了就不好使了
          }
          return;
        });
      }
    });
  }
});

// LangChain Azure OpenAI 调用函数（直接 HTTP 请求，不用 langchain）
async function summarizeContent(content) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(defaultLLMConfig, async function (llmConfig) {
      try {
        // 检查必要参数
        if (!llmConfig.llmApiKey || !llmConfig.llmEndpoint) {
          reject(new Error("未配置API Key或Endpoint"));
          return;
        }
        const apiKey = llmConfig.llmApiKey;
        const endpoint = llmConfig.llmEndpoint;
        const prompt = (llmConfig.llmPrompt || defaultLLMConfig.llmPrompt).replace("%s", content);
        const max_tokens = parseInt(llmConfig.llmMaxTokens) || parseInt(defaultLLMConfig.llmMaxTokens);
        const temperature = parseFloat(llmConfig.llmTemperature) || parseFloat(defaultLLMConfig.llmTemperature);
        const systemPrompt = llmConfig.llmSystemPrompt || defaultLLMConfig.llmSystemPrompt;

        const body = {
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt }
          ],
          max_tokens: max_tokens,
          temperature: temperature,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0
        };

        const res = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "api-key": apiKey
          },
          body: JSON.stringify(body)
        });

        if (!res.ok) {
          const errText = await res.text();
          reject(new Error("API请求失败: " + res.status + " " + errText));
          return;
        }

        const data = await res.json();
        resolve(
          data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content
            ? data.choices[0].message.content.trim()
            : "未获取到总结内容"
        );
      } catch (err) {
        reject(err);
      }
    });
  });
}

// 新增多轮对话函数
async function summarizeContentWithHistory(history) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(defaultLLMConfig, async function (llmConfig) {
      try {
        // 检查必要参数
        if (!llmConfig.llmApiKey || !llmConfig.llmEndpoint) {
          reject(new Error("未配置API Key或Endpoint"));
          return;
        }
        const apiKey = llmConfig.llmApiKey;
        const endpoint = llmConfig.llmEndpoint;
        const max_tokens = parseInt(llmConfig.llmMaxTokens) || parseInt(defaultLLMConfig.llmMaxTokens);
        const temperature = parseFloat(llmConfig.llmTemperature) || parseFloat(defaultLLMConfig.llmTemperature);
        const systemPrompt = llmConfig.llmSystemPrompt || defaultLLMConfig.llmSystemPrompt;

        const body = {
          messages: [
            { role: "system", content: systemPrompt },
            ...history
          ],
          max_tokens: max_tokens,
          temperature: temperature,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0
        };

        const res = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "api-key": apiKey
          },
          body: JSON.stringify(body)
        });

        if (!res.ok) {
          const errText = await res.text();
          reject(new Error("API请求失败: " + res.status + " " + errText));
          return;
        }
        const data = await res.json();
        resolve(
          data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content
            ? data.choices[0].message.content.trim()
            : "未获取到回复内容"
        );
      } catch (err) {
        reject(err);
      }
    });
  });
}

// 新增：对话大模型菜单调用
async function chatWithLLMMenu(menu, history) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(defaultLLMConfig, async function (llmConfig) {
      try {
        if (!llmConfig.llmApiKey || !llmConfig.llmEndpoint) {
          reject(new Error("未配置API Key或Endpoint"));
          return;
        }
        const apiKey = llmConfig.llmApiKey;
        const endpoint = llmConfig.llmEndpoint;
        const prompt = menu.prompt;
        const systemPrompt = menu.systemPrompt || llmConfig.llmSystemPrompt || defaultLLMConfig.llmSystemPrompt;
        const max_tokens = parseInt(llmConfig.llmMaxTokens) || 2048;
        const temperature = parseFloat(llmConfig.llmTemperature) || 0.5;

        const body = {
          messages: [
            { role: "system", content: systemPrompt },
            ...history
          ],
          max_tokens: max_tokens,
          temperature: temperature,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0
        };

        if (history.length === 0) {
          body.messages.push({ role: "user", content: prompt });
        }

        const res = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "api-key": apiKey
          },
          body: JSON.stringify(body)
        });

        if (!res.ok) {
          const errText = await res.text();
          reject(new Error("API请求失败: " + res.status + " " + errText));
          return;
        }
        const data = await res.json();
        resolve(
          data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content
            ? data.choices[0].message.content.trim()
            : "未获取到回复内容"
        );
      } catch (err) {
        reject(err);
      }
    });
  });
}
