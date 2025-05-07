# Search Tool 浏览器插件

## 简介

Search Tool 是一款高效的浏览器搜索增强插件，支持自定义搜索引擎、快捷键、历史记录、剪贴板操作，并集成大模型（LLM）能力。

## 安装

- **Chrome 用户**：请直接访问 [Chrome Web Store 安装](https://chromewebstore.google.com/detail/fjjkihnjlinkjpfeooipegebcakeocef)
- **Edge 用户**：请访问 [Edge Add-ons 安装](https://microsoftedge.microsoft.com/addons/detail/opbleegfbmfkdgegdjfmoamflepckigc)

开发者可本地调试：

```bash
npm install
npm run build
```
在 Chrome 扩展页面加载 `dist` 文件夹。

---

## Option 页面配置说明

> 下方每个区域可补充截图说明：  
> ![此处补充截图](#)

### 1. 搜索引擎配置

- **名称**：搜索引擎显示名称（如“百度”、“Google”）
- **URL**：搜索链接，使用 `%s` 作为关键词占位符（如 `https://www.baidu.com/s?wd=%s`）
- **是否出现在右键菜单**（inRight）：决定是否在网页右键菜单显示
- **是否出现在快捷键轮盘**（inShortcuts）：决定是否在快捷键弹窗显示
- **是否出现在弹窗**（inPopup）：决定是否在插件弹窗页面显示
- **是否出现在顶部菜单**（inTooltip）：决定是否在页面顶部菜单显示
- **图标**：可上传自定义图标（支持 URL 或 base64）

> 可拖拽排序，点击加号添加新引擎，点击减号删除。

#### 示例

| 名称   | URL                                      | 右键菜单 | 快捷键轮盘 | 弹窗 | 顶部菜单 |
| ------ | ---------------------------------------- | -------- | ---------- | ---- | -------- |
| 百度   | https://www.baidu.com/s?wd=%s            | 是       | 是         | 是   | 否       |
| Google | https://www.google.com/search?q=%s       | 是       | 是         | 是   | 是       |

---

### 2. 通用设置

- **剪贴板增强**（select2clipboard）：选中文字自动复制
- **显示顶部搜索栏**（showTopSearchSwitch）：页面顶部显示搜索入口
- **新标签页打开搜索**（searchInNewTab）：搜索结果是否在新标签页打开
- **主题色/文字色**（themeColor/textColor）：自定义插件主题与文字颜色
- **弹窗启用搜索建议**（popupSuggestEnabled）：弹窗页面是否启用搜索建议
- **建议引擎**（popupSuggestEngine）：弹窗建议使用 Bing 或 Google
- **启用历史和收藏夹匹配**（popupHistoryEnabled）：弹窗页面是否启用历史记录和收藏夹匹配
- **历史匹配天数**（popupHistoryDays）：弹窗页面匹配历史记录的默认天数

---

### 3. LLM（大模型）配置

支持自定义多种 LLM 服务（如 OpenAI、Azure OpenAI），可配置多个模型，灵活切换。

#### 主要配置项

- **Models JSON**：模型配置，支持多个模型，格式为 JSON。每个模型包含如下字段：
  - **active**：是否启用该模型
  - **endpoint**：API 接口地址
  - **method**：请求方法（如 POST）
  - **headers**：请求头（如 API Key、Content-Type）
  - **bodyParams**：请求体参数
    - **model**：模型名称
    - **messages**：对话内容，固定为 `${MESSAGES}`
    - **temperature**：采样温度
  - **responseParser**：如何解析返回内容

- **启用总结全文**（enableSummarize）：是否启用网页内容总结
- **Prompt**：用户输入的提示词模板，支持 `{content}` 占位符
- **System Prompt**：系统级提示词，影响模型行为
- **Ask LLM 菜单**：可自定义多组 prompt，方便快速切换

#### 配置示例（请替换 `{YOUR-API-KEY}`，已隐藏敏感信息）

```json
{
  "openai": {
    "active": false,
    "endpoint": "https://api.openai.com/v1/chat/completions",
    "method": "POST",
    "headers": {
      "Authorization": "Bearer {YOUR-API-KEY}",
      "Content-Type": "application/json"
    },
    "bodyParams": {
      "model": "gpt-3.5-turbo",
      "messages": "${MESSAGES}",
      "temperature": 0.7
    },
    "responseParser": "response.choices[0].message.content"
  },
  "azureopenai": {
    "active": true,
    "endpoint": "https://your-azure-endpoint.openai.azure.com/openai/deployments/gpt-4.1-mini/chat/completions?api-version=2024-02-15-preview",
    "method": "POST",
    "headers": {
      "api-key": "{YOUR-API-KEY}",
      "Content-Type": "application/json"
    },
    "bodyParams": {
      "model": "gpt-4.1-mini",
      "messages": "${MESSAGES}",
      "temperature": 0.7
    },
    "responseParser": "response.choices[0].message.content"
  }
}
```

#### LLM 配置 Demo

1. 在 Option 页面“LLM 配置”区域粘贴上述 JSON。
2. 勾选需要启用的模型（`active: true`）。
3. 填写自己的 API Key。
4. 可自定义 Prompt、System Prompt 及多组菜单。
5. 保存后即可在插件内体验 LLM 能力。

---

### 国内主流大模型配置示例

以下为常见国内大模型的配置 JSON 示例，请将占位符替换为你自己的密钥。

#### 1. 百度文心一言（ERNIE）

```json
{
  "ernie": {
    "endpoint": "https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions_pro",
    "method": "POST",
    "headers": {
      "Content-Type": "application/json",
      "Authorization": "Bearer ${ACCESS_TOKEN}"
    },
    "bodyParams": {
      "messages": "${MESSAGES}",
      "temperature": 1.0,
      "response_format": "json_object"
    },
    "responseParser": "response.result"
  }
}
```
> **认证说明**：需先调用百度 OAuth 接口获取 `ACCESS_TOKEN`（参考官方文档 get_access_token 方法）。

#### 2. 腾讯混元

```json
{
  "hunyuan": {
    "endpoint": "https://hunyuan.cloud.tencent.com/hyllm/v1/chat/completions",
    "method": "POST",
    "headers": {
      "Content-Type": "application/json",
      "Authorization": "${SECRET_ID}:${SECRET_KEY}"
    },
    "bodyParams": {
      "model": "hunyuan-lite",
      "messages": "${MESSAGES}",
      "stream": false
    },
    "responseParser": "response.choices[0].message.content"
  }
}
```
> **密钥说明**：SECRET_ID 和 SECRET_KEY 需在腾讯云控制台获取。

#### 3. 阿里通义千问

```json
{
  "qwen": {
    "endpoint": "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation",
    "method": "POST",
    "headers": {
      "Content-Type": "application/json",
      "Authorization": "Bearer ${API_KEY}"
    },
    "bodyParams": {
      "model": "qwen-plus",
      "input": {
        "messages": "${MESSAGES}"
      },
      "parameters": {
        "temperature": 0.8,
        "top_p": 0.9
      }
    },
    "responseParser": "response.output.choices[0].message.content"
  }
}
```
> **流式支持**：如需流式返回，可在 `bodyParams` 增加 `"stream": true`。

#### 4. DeepSeek

```json
{
  "deepseek": {
    "endpoint": "https://api.deepseek.com/chat/completions",
    "method": "POST",
    "headers": {
      "Content-Type": "application/json",
      "Authorization": "Bearer ${API_KEY}",
      "Accept-Version": "v3"
    },
    "bodyParams": {
      "model": "deepseek-chat",
      "messages": "${MESSAGES}",
      "temperature": 1,
      "frequency_penalty": 0,
      "max_tokens": 2048
    },
    "responseParser": "response.choices[0].message.content"
  }
}
```
> **认证说明**：使用你的 DeepSeek API Key。

---

## 其他说明

- 支持导入/导出全部配置（含引擎、设置、LLM 配置、菜单等）。
- 支持一键重置所有配置。
- 如需截图说明，请在对应区域补充。

---
