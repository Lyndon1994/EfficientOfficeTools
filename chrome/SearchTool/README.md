# Search Tool Chrome Extension

> [中文说明文档（Chinese README）](./README.zh-CN.md)  
> [贡献指南（中文）](./CONTRIBUTE.zh-CN.md) | [Contribution Guide (English)](./CONTRIBUTE.en-US.md)

## Introduction

Search Tool is an efficient browser search enhancement extension. It supports custom search engines, hotkeys, history, clipboard, and LLM (Large Language Model) integration.

## Installation

- **For Chrome users**: Install directly from [Chrome Web Store](https://chromewebstore.google.com/detail/fjjkihnjlinkjpfeooipegebcakeocef)
- **For Edge users**: Install from [Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/opbleegfbmfkdgegdjfmoamflepckigc)

Or for development:

```bash
npm install
npm run build
```
Load the `dist` folder in the Chrome Extensions page.


---

## Option Page Configuration

> You can add screenshots for each section below:  
> ![Add screenshot here](#)

### 1. Search Engine Settings

- **Name**: Display name of the search engine (e.g., "Baidu", "Google")
- **URL**: Search URL, use `%s` as the keyword placeholder (e.g., `https://www.baidu.com/s?wd=%s`)
- **Show in Context Menu** (`inRight`): Whether to show in the right-click menu on web pages
- **Show in Shortcut Panel** (`inShortcuts`): Whether to show in the hotkey popup
- **Show in Popup** (`inPopup`): Whether to show in the extension popup page
- **Show in Top Menu** (`inTooltip`): Whether to show in the top menu on the page
- **Icon**: Upload custom icon (supports URL or base64)

> Drag to sort, click "+" to add a new engine, click "-" to delete.

#### Example

| Name   | URL                                      | Context Menu | Shortcut Panel | Popup | Top Menu |
| ------ | ---------------------------------------- | ------------ | -------------- | ----- | -------- |
| Baidu  | https://www.baidu.com/s?wd=%s            | Yes          | Yes           | Yes   | No       |
| Google | https://www.google.com/search?q=%s       | Yes          | Yes           | Yes   | Yes      |

---

### 2. General Settings

- **Clipboard Enhancement** (`select2clipboard`): Auto-copy selected text
- **Show Top Search Bar** (`showTopSearchSwitch`): Show search bar at the top of the page
- **Open Search in New Tab** (`searchInNewTab`): Whether to open results in a new tab
- **Theme/Font Color** (`themeColor`/`textColor`): Customize theme and font color
- **Enable Suggestions in Popup** (`popupSuggestEnabled`): Enable search suggestions in popup
- **Suggestion Engine** (`popupSuggestEngine`): Use Bing or Google for suggestions
- **Enable History/Bookmark Match** (`popupHistoryEnabled`): Enable history/bookmark match in popup
- **History Days** (`popupHistoryDays`): Number of days for history match in popup

---

### 3. LLM (Large Language Model) Configuration

Support multiple LLM services (OpenAI, Azure OpenAI, etc.), configurable and switchable.

#### Main Config Fields

- **Models JSON**: Model configuration, supports multiple models in JSON format. Each model includes:
  - **active**: Whether to enable this model
  - **endpoint**: API endpoint
  - **method**: HTTP method (e.g., POST)
  - **headers**: Request headers (API Key, Content-Type, etc.)
  - **bodyParams**: Request body parameters
    - **model**: Model name
    - **messages**: Conversation content, always `${MESSAGES}`
    - **temperature**: Sampling temperature
  - **responseParser**: How to parse the response

- **Enable Summarize** (`enableSummarize`): Whether to enable web page summarization
- **Prompt**: User prompt template, supports `{content}` placeholder
- **System Prompt**: System-level prompt, affects model behavior
- **Ask LLM Menus**: Customize multiple prompt menus for quick switching

#### Example (replace `{YOUR-API-KEY}`, sensitive info hidden)

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
      "messages": "${MESSAGES}", // Fixed value
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
      "messages": "${MESSAGES}", // Fixed value
      "temperature": 0.7
    },
    "responseParser": "response.choices[0].message.content"
  }
}
```

#### LLM Demo

1. Paste the above JSON in the "LLM Configuration" section of the Option page.
2. Enable the desired model (`active: true`).
3. Fill in your API Key.
4. Customize Prompt, System Prompt, and menus as needed.
5. Save and enjoy LLM features in the extension.

---

### Domestic LLM Configuration Examples

Below are configuration examples for popular Chinese LLMs. Replace the placeholders with your actual credentials.

#### 1. Baidu ERNIE (文心一言)

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
> **Auth:** Obtain `ACCESS_TOKEN` via Baidu OAuth API (see Baidu docs for `get_access_token`).

#### 2. Tencent Hunyuan (腾讯混元)

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
> **Auth:** Get `SECRET_ID` and `SECRET_KEY` from Tencent Cloud Console.

#### 3. Alibaba Qwen (阿里通义千问)

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
> **Streaming:** Add `"stream": true` in `bodyParams` to enable SSE streaming.

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
> **Auth:** Use your DeepSeek API Key.

---

## Other Notes

- Supports import/export of all configuration (including engines, settings, LLM config, menus, etc.).
- Supports one-click reset of all configuration.
- Please add screenshots in the corresponding sections as needed.

---
