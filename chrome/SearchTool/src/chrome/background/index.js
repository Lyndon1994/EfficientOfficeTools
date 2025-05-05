function parseUrl(url) {
  let obj = {};
  let reg = /([^?=&]+)=([^?=&]+)/g;
  url.replace(reg, function () {
    obj[arguments[1]] = arguments[2];
  });
  return obj;
}

// Add request tracking to prevent duplicates
const processedRequests = new Map();

chrome.contextMenus.onClicked.addListener(function (info, tab) {
  // 1. 对话大模型菜单
  if (info.menuItemId && info.menuItemId.startsWith("llm_chat_menu_")) {
    // Generate a request ID based on the menu ID, tab ID and a timestamp
    const requestId = `${info.menuItemId}_${tab.id}_${Date.now()}`;
    console.debug(`[LLM Chat] Menu clicked, requestId: ${requestId}`);
    
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
        requestId: requestId,
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
  llmModels: '[]', // 与 options 页一致，模型配置JSON字符串
  llmPrompt: chrome.i18n.getMessage("llmPrompt") || "",
  llmSystemPrompt: chrome.i18n.getMessage("llmSystemPrompt") || ""
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

    // 修复：只依赖 enableSummarize
    if (items.llmEnableSummarize) {
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
  if (request.action === "updateMenus") {
    chrome.contextMenus.removeAll();
    if (Array.isArray(request.llmChatMenus)) {
      request.llmChatMenus.forEach((menu, idx) => {
        if (menu && menu.name && menu.prompt) {
          chrome.contextMenus.create({
            title: menu.name,
            id: "llm_chat_menu_" + idx,
            contexts: ["selection"],
          });
        }
      });
    }
    if (Array.isArray(request.enginesMeta)) {
      request.enginesMeta.forEach(function (engine) {
        if (engine.name && engine.url && engine.inRight) {
          chrome.contextMenus.create({
            title: chrome.i18n.getMessage("searchFor", engine.name),
            id: engine.url,
            contexts: ["selection"],
          });
        }
      });
    }
    sendResponse("done");
    return;
  }
  if (request.action === "chatWithLLM" && Array.isArray(request.history)) {
    (async () => {
      try {
        // Add timeout to ensure operation completes within message port lifetime
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("请求超时，请重试")), 60000) // 1-minute timeout
        );
        
        const reply = await Promise.race([
          summarizeContentWithHistory(request.history),
          timeoutPromise
        ]);
        
        try {
          sendResponse({ reply });
        } catch (e) {
          console.error("Failed to send response, message port might be closed:", e);
        }
      } catch (err) {
        console.error("chatWithLLM error:", err);
        try {
          sendResponse({ reply: "对话失败: " + err.message });
        } catch (e) {
          console.error("Failed to send error response, message port might be closed:", e);
        }
      }
    })();
    return true;
  }
  if (request.action === "chatWithLLMMenu" && request.menu) {
    // Check if this is a duplicate request
    const requestKey = JSON.stringify({
      action: request.action,
      menu: request.menu?.name,
      prompt: request.history?.[0]?.content
    });
    
    const now = Date.now();
    const lastRequest = processedRequests.get(requestKey);
    
    // If we've seen this exact request in the last 2 seconds, reject it as a duplicate
    if (lastRequest && (now - lastRequest) < 2000) {
      console.warn("[LLM Chat] Rejecting duplicate request:", requestKey);
      sendResponse({ reply: "正在处理中，请稍候...", duplicate: true });
      return true;
    }
    
    // Mark this request as processed
    processedRequests.set(requestKey, now);
    
    // Clean up old entries every 10 seconds
    if (now % 10000 < 1000) {
      for (const [key, timestamp] of processedRequests.entries()) {
        if (now - timestamp > 10000) {
          processedRequests.delete(key);
        }
      }
    }
    
    (async () => {
      try {
        console.debug("[LLM Chat] Processing request:", requestKey);
        
        // Add timeout to ensure operation completes within message port lifetime
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("请求超时，请重试")), 60000) // 1-minute timeout
        );
        
        const reply = await Promise.race([
          chatWithLLMMenu(request.menu, request.history),
          timeoutPromise
        ]);
        
        try {
          sendResponse({ reply });
        } catch (e) {
          console.error("Failed to send response, message port might be closed:", e);
        }
      } catch (err) {
        console.error("chatWithLLMMenu error:", err);
        try {
          sendResponse({ reply: "对话失败: " + err.message });
        } catch (e) {
          console.error("Failed to send error response, message port might be closed:", e);
        }
      } finally {
        // Remove this request from tracking after processing
        processedRequests.delete(requestKey);
      }
    })();
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

// 动态变量注入函数
function buildConfig(configJSON, variables) {
  // 深拷贝
  const config = JSON.parse(JSON.stringify(configJSON));
  // 如果有 bodyParams.messages 并且 variables.MESSAGES 存在，则直接赋值
  if (
    config.bodyParams &&
    Object.prototype.hasOwnProperty.call(config.bodyParams, "messages") &&
    variables.MESSAGES
  ) {
    config.bodyParams.messages = variables.MESSAGES;
  }
  // 其他字段做字符串占位符替换
  function replaceVars(obj) {
    for (const key in obj) {
      if (typeof obj[key] === "string") {
        obj[key] = obj[key].replace(/\${(.*?)}/g, (_, k) =>
          variables[k] !== undefined ? variables[k] : ""
        );
      } else if (typeof obj[key] === "object" && obj[key] !== null) {
        replaceVars(obj[key]);
      }
    }
  }
  // 跳过 bodyParams.messages
  if (config.bodyParams) {
    for (const key in config.bodyParams) {
      if (key !== "messages") {
        if (typeof config.bodyParams[key] === "string") {
          config.bodyParams[key] = config.bodyParams[key].replace(/\${(.*?)}/g, (_, k) =>
            variables[k] !== undefined ? variables[k] : ""
          );
        } else if (typeof config.bodyParams[key] === "object" && config.bodyParams[key] !== null) {
          replaceVars(config.bodyParams[key]);
        }
      }
    }
  }
  // 其他顶层字段
  for (const key in config) {
    if (key !== "bodyParams" && typeof config[key] === "string") {
      config[key] = config[key].replace(/\${(.*?)}/g, (_, k) =>
        variables[k] !== undefined ? variables[k] : ""
      );
    }
  }
  return config;
}

// 获取 models 配置（从 storage 读取并解析）
async function getActiveModelConfig() {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get({ llmModels: "" }, function(items) {
      let models = {};
      try {
        if (typeof items.llmModels === "string" && items.llmModels.trim()) {
          models = JSON.parse(items.llmModels);
        }
      } catch (e) {
        // ignore parse error
      }
      // 取第一个 active 的模型
      for (const [name, cfg] of Object.entries(models)) {
        if (cfg && cfg.active) {
          resolve({ name, config: cfg });
          return;
        }
      }
      resolve(null);
    });
  });
}

// 通用请求函数
async function callModel(configName, variables) {
  // 读取 models 配置
  const { name, config } = await getActiveModelConfig() || {};
  if (!config) throw new Error("No active model config found");
  const modelConfig = buildConfig(config, variables);

  try {
    const response = await fetch(modelConfig.endpoint, {
      method: modelConfig.method || "POST",
      headers: modelConfig.headers || {},
      body: modelConfig.method === "GET" ? undefined : JSON.stringify(modelConfig.bodyParams)
    });
    const data = await response.json();
    // 安全解析 responseParser
    if (typeof modelConfig.responseParser === "string") {
      // 只支持以 response. 开头的路径，如 response.choices[0].message.content
      if (modelConfig.responseParser.startsWith("response.")) {
        let val = data;
        try {
          // 去掉 response. 前缀
          const pathArr = modelConfig.responseParser.replace(/^response\./, "").split(".");
          for (let i = 0; i < pathArr.length; i++) {
            let part = pathArr[i];
            // 处理数组下标
            const arrayMatch = part.match(/^(\w+)\[(\d+)\]$/);
            if (arrayMatch) {
              const arrKey = arrayMatch[1];
              const arrIdx = Number(arrayMatch[2]);
              val = val[arrKey];
              if (!Array.isArray(val) || val.length <= arrIdx) {
                return "";
              }
              val = val[arrIdx];
            } else {
              val = val[part];
            }
            if (val === undefined || val === null) {
              return "";
            }
          }
          return val;
        } catch (e) {
          return "";
        }
      } else {
        // 不支持其他类型
        return "";
      }
    }
    return data;
  } catch (error) {
    console.error(`${configName || name} API Error:`, error);
    throw error;
  }
}

// summarizeContent 支持 models JSON 配置（不再兼容旧配置）
async function summarizeContent(content) {
  const activeModel = await getActiveModelConfig();
  if (!activeModel || !activeModel.config) {
    throw new Error("No active model config found");
  }
  // 读取 option 页面 prompt/systemPrompt
  let optionPrompts = await new Promise(resolve => {
    chrome.storage.sync.get({ llmPrompt: "", llmSystemPrompt: "" }, resolve);
  });
  const userPrompt = (optionPrompts.llmPrompt || "").replace("{content}", content);
  const systemPrompt = optionPrompts.llmSystemPrompt || "";

  let messages = [];
  // system prompt
  if (
    activeModel.config.bodyParams &&
    activeModel.config.bodyParams.messages &&
    Array.isArray(activeModel.config.bodyParams.messages)
  ) {
    // 如果用户在json里配置了messages模板，则用模板
    messages = activeModel.config.bodyParams.messages.map(m => {
      const replaced = {};
      for (const key in m) {
        if (typeof m[key] === "string") {
          replaced[key] = m[key].replace(/\${content}/g, content);
        } else {
          replaced[key] = m[key];
        }
      }
      return replaced;
    });
  } else {
    // 默认拼装：先 systemPrompt，再 option prompt，再正文内容
    if (systemPrompt) {
      messages.push({ role: "system", content: systemPrompt });
    } else if (activeModel.config.systemPrompt) {
      messages.push({ role: "system", content: activeModel.config.systemPrompt });
    }
    if (userPrompt) {
      messages.push({ role: "user", content: userPrompt });
    }
    // 兼容原有逻辑，正文内容也加一条 user message
    messages.push({ role: "user", content });
  }
  const variables = {
    MESSAGES: messages
  };
  const result = await callModel(activeModel.name, variables);
  return typeof result === "string" ? result : JSON.stringify(result);
}

// 新增多轮对话函数
async function summarizeContentWithHistory(history) {
  const activeModel = await getActiveModelConfig();
  if (!activeModel || !activeModel.config) {
    throw new Error("No active model config found");
  }
  // 读取 option 页面 prompt/systemPrompt
  let optionPrompts = await new Promise(resolve => {
    chrome.storage.sync.get({ llmPrompt: "", llmSystemPrompt: "" }, resolve);
  });
  const userPrompt = optionPrompts.llmPrompt || "";
  const systemPrompt = optionPrompts.llmSystemPrompt || "";

  let messages = [];
  if (Array.isArray(history) && history.length > 0) {
    messages = history;
  } else {
    if (systemPrompt) {
      messages.push({ role: "system", content: systemPrompt });
    } else if (activeModel.config.systemPrompt) {
      messages.push({ role: "system", content: activeModel.config.systemPrompt });
    }
    if (userPrompt) {
      messages.push({ role: "user", content: userPrompt });
    }
  }
  const variables = {
    MESSAGES: messages
  };
  const result = await callModel(activeModel.name, variables);
  return typeof result === "string" ? result : JSON.stringify(result);
}

// 新增：对话大模型菜单调用
async function chatWithLLMMenu(menu, history) {
  const activeModel = await getActiveModelConfig();
  if (!activeModel || !activeModel.config) {
    throw new Error("No active model config found");
  }
  // 只传递最终 MESSAGES
  let messages = [];
  if (history && history.length > 0) {
    messages = history;
  } else {
    // 修复：加上 systemPrompt
    if (menu.systemPrompt) {
      messages.push({ role: "system", content: menu.systemPrompt });
    }
    messages.push({ role: "user", content: menu.prompt });
  }
  const variables = {
    MESSAGES: messages
  };
  const result = await callModel(activeModel.name, variables);
  return typeof result === "string" ? result : JSON.stringify(result);
}
