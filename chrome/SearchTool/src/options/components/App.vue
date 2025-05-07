<template>
  <!-- LLM 配置说明区域（简洁版，含模型配置示例，国际化） -->
  <div class="info-section" style="margin-bottom: 24px;">
    <el-card shadow="never">
      <template #header>
        <span>{{ getMessage('readmeTitle') || 'Read Me' }}</span>
      </template>
      <div v-html="getMessage('readme')"></div>
      <div style="margin-top: 16px;">
        <strong>{{ getMessage('welcomeContributeTitle') || 'Welcome to contribute:' }}</strong>
        <span>
          {{ getMessage('welcomeContribute') }}
          <a href="https://github.com/Lyndon1994/EfficientOfficeTools/tree/main/chrome/SearchTool" target="_blank">
            {{ getMessage('welcomeContributeLink') || 'Click here.' }}
          </a> 😊
        </span>
      </div>
      <div style="margin-top: 16px;">
        <strong>{{ getMessage('llmConfigDocTitle') || 'LLM 配置说明：' }}</strong>
        <ul>
          <li>{{ getMessage('llmConfigApiKey') || 'API Key: 你的大模型服务密钥。' }}</li>
          <li>{{ getMessage('llmConfigEndpoint') || 'Endpoint: LLM 接口地址，例如 https://my-ai.openai.azure.com/openai/deployments/my-gpt-4.1/chat/completions?api-version=2024-02-15-preview' }}</li>
          <li>{{ getMessage('llmConfigPrompt') || 'Prompt: 用户输入的提示词模板，支持 {content} 占位符。' }}</li>
          <li>{{ getMessage('llmConfigSystemPrompt') || 'System Prompt: 系统级提示词，影响模型行为。' }}</li>
          <li>{{ getMessage('llmConfigMaxTokens') || 'Max Tokens: 返回内容最大长度。' }}</li>
          <li>{{ getMessage('llmConfigTemperature') || 'Temperature: 采样温度，越高越随机。' }}</li>
          <li>{{ getMessage('llmConfigMenus') || '菜单可自定义多组 prompt，方便快速切换。' }}</li>
        </ul>
        <div style="margin-top: 12px; color: #888; font-size: 13px;">
          {{ getMessage('llmModelsJsonTip') || '请在下方填写模型配置（JSON），支持多模型切换。每个模型需包含 active, endpoint, method, headers, bodyParams, responseParser 字段。' }}
        </div>
        <div style="margin-top: 12px;">
          <strong>{{ getMessage('llmModelsJsonExampleTitle') || '模型配置示例：' }}</strong>
          <pre style="background:#f8f8f8;border-radius:4px;padding:8px;overflow:auto;font-size:12px;">
{{ `{
  "openai": {
    "active": false, // is this model enabled?
    "endpoint": "https://api.openai.com/v1/chat/completions",
    "method": "POST",
    "headers": {
      "Authorization": "Bearer {YOUR-API-KEY}", // Replace with your OpenAI API key
      "Content-Type": "application/json"
    },
    "bodyParams": {
      "model": "gpt-3.5-turbo",
      "messages": "{MESSAGES}", // Fixed value
      "temperature": 0.7
    },
    "responseParser": "response.choices[0].message.content"  // Must start with "response."
  },
  "azureopenai": {
    "active": true, // is this model enabled? Only one model can be enabled at a time.
    "endpoint": "https://your-azure-endpoint.openai.azure.com/openai/deployments/gpt-4.1-mini/chat/completions?api-version=2024-02-15-preview",
    "method": "POST",
    "headers": {
      "api-key": "{YOUR-API-KEY}",  // Replace with your Azure OpenAI API key
      "Content-Type": "application/json"
    },
    "bodyParams": {
      "model": "gpt-4.1-mini",
      "messages": "{MESSAGES}",  // Fixed value
      "temperature": 0.7
    },
    "responseParser": "response.choices[0].message.content"  // Must start with "response."
  }
}` }}
          </pre>
        </div>
      </div>
    </el-card>
  </div>

  <el-form
    ref="form"
    label-width="120px"
    size="mini"
    style="width: 100%; min-width: 1000px; min-height: 500px"
  >
    <!-- 搜索引擎配置区域 -->
    <el-card shadow="never" style="margin-bottom: 24px;">
      <template #header>
        <span>{{ getMessage('searchEngine') || '搜索引擎配置' }}</span>
      </template>
      <draggable
        v-model:list="engines"
        @end="onDragEnd"
        handle=".handle"
        item-key="id"
        class="list-group"
      >
        <template #item="{ element }">
          <el-form-item
            label=""
            :key="element.id"
            :gutter="12"
            class="engine-form-item"
          >
            <el-row :gutter="10" class="engine-row">
              <el-col :xs="2" :sm="1">
                <el-icon class="handle"><Rank /></el-icon>
              </el-col>
              <el-col :xs="12" :sm="6" :md="3">
                <el-input
                  :placeholder="getMessage('searchEngine')"
                  v-model="element.name"
                  class="engine-input"
                >
                </el-input>
              </el-col>
              <el-col :xs="12" :sm="6" :md="4">
                <el-tooltip
                  class="item"
                  effect="dark"
                  :content="getMessage('optionsInPopupTip')"
                  placement="top"
                >
                  <el-switch
                    v-model="element.inPopup"
                    :active-text="getMessage('optionsInPopup')"
                  ></el-switch>
                </el-tooltip>
              </el-col>
              <el-col :xs="12" :sm="6" :md="4">
                <el-tooltip
                  class="item"
                  effect="dark"
                  :content="getMessage('inRightTip')"
                  placement="top"
                >
                  <el-switch
                    v-model="element.inRight"
                    :active-text="getMessage('inRight')"
                  ></el-switch>
                </el-tooltip>
              </el-col>
              <el-col :xs="12" :sm="6" :md="4">
                <el-tooltip
                  class="item"
                  effect="dark"
                  :content="getMessage('inShortcutsTip')"
                  placement="top"
                >
                  <el-switch
                    v-model="element.inShortcuts"
                    :active-text="getMessage('inShortcuts')"
                  ></el-switch>
                </el-tooltip>
              </el-col>
              <el-col :xs="12" :sm="6" :md="4">
                <el-tooltip
                  class="item"
                  effect="dark"
                  :content="getMessage('inTooltipTip')"
                  placement="top"
                >
                  <el-switch
                    v-model="element.inTooltip"
                    :active-text="getMessage('inTooltip')"
                  ></el-switch>
                </el-tooltip>
              </el-col>
            </el-row>
            <el-row :gutter="16" class="engine-row">
              <el-col :xs="24" :sm="12" :md="14">
                <el-input
                  :placeholder="getMessage('searchUrl')"
                  v-model="element.url"
                  @input="changeSearchUrl(element)"
                  class="engine-url"
                ></el-input>
              </el-col>
              <el-col :xs="24" :sm="8" :md="8">
                <el-input
                  :placeholder="getMessage('searchIcon')"
                  v-model="element.icon"
                  class="engine-icon"
                >
                  <template v-slot:append>
                    <img :src="element.icon" alt="" height="20px" />
                  </template>
                </el-input>
              </el-col>
              <el-col :xs="6" :sm="2" :md="2" style="min-width: 40px">
                <el-button
                  type="danger"
                  @click="delItem(element.id)"
                  circle
                  style="margin-left: 4px"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </el-col>
              <el-col
                :xs="6"
                :sm="2"
                :md="2"
                v-if="element.id == engines.length"
                style="min-width: 40px"
              >
                <el-button
                  type="info"
                  @click="addItem"
                  circle
                  style="margin-left: 4px"
                >
                  <el-icon><Plus /></el-icon>
                </el-button>
              </el-col>
            </el-row>
          </el-form-item>
        </template>
      </draggable>
    </el-card>

    <!-- 常规设置区域 -->
    <el-card shadow="never" style="margin-bottom: 24px;">
      <template #header>
        <span>{{ getMessage('generalSettings') || '常规设置' }}</span>
      </template>
      <el-form-item label="">
        <el-tooltip
          class="item"
          effect="dark"
          :content="getMessage('select2clipboardTip')"
          placement="top"
        >
          <el-switch
            v-model="settings.select2clipboard"
            :active-text="getMessage('select2clipboard')"
          >
          </el-switch>
        </el-tooltip>
      </el-form-item>
      <el-form-item label="">
        <el-tooltip
          class="item"
          effect="dark"
          :content="getMessage('showTooltipTip')"
          placement="top"
        >
          <el-switch
            v-model="settings.showTooltip"
            :active-text="getMessage('showTooltip')"
          ></el-switch>
        </el-tooltip>
      </el-form-item>
      <el-form-item label="">
        <el-tooltip
          class="item"
          effect="dark"
          :content="getMessage('showTopSearchSwitchTip')"
          placement="top"
        >
          <el-switch
            v-model="settings.showTopSearchSwitch"
            :active-text="getMessage('showTopSearchSwitch')"
          ></el-switch>
        </el-tooltip>
      </el-form-item>
      <el-form-item label="">
        <el-tooltip
          class="item"
          effect="dark"
          :content="getMessage('searchInNewTabTip')"
          placement="top"
        >
          <el-switch
            v-model="settings.searchInNewTab"
            :active-text="getMessage('searchInNewTab')"
          ></el-switch>
        </el-tooltip>
      </el-form-item>
      <el-form-item label="">
        <el-tooltip
          class="item"
          effect="dark"
          :content="getMessage('popupSuggestEnabledTip')"
          placement="top"
        >
          <el-switch
            v-model="settings.popupSuggestEnabled"
            :active-text="getMessage('popupSuggestEnabled')"
          ></el-switch>
        </el-tooltip>
      </el-form-item>
      <el-form-item label="">
        <el-tooltip
          class="item"
          effect="dark"
          :content="getMessage('popupSuggestEngineTip')"
          placement="top"
        >
          <el-select v-model="settings.popupSuggestEngine" style="width: 120px">
            <el-option label="Bing" value="bing"></el-option>
            <el-option label="Google" value="google"></el-option>
          </el-select>
          <span style="margin-left: 8px">{{
            getMessage("popupSuggestEngine")
          }}</span>
        </el-tooltip>
      </el-form-item>
      <el-form-item label="">
        <el-tooltip
          class="item"
          effect="dark"
          :content="getMessage('popupHistoryEnabledTip')"
          placement="top"
        >
          <el-switch
            v-model="settings.popupHistoryEnabled"
            :active-text="getMessage('popupHistoryEnabled')"
          ></el-switch>
        </el-tooltip>
      </el-form-item>
      <el-form-item label="">
        <el-tooltip
          class="item"
          effect="dark"
          :content="getMessage('popupHistoryDaysTip')"
          placement="top"
        >
          <el-input-number
            v-model="settings.popupHistoryDays"
            :min="1"
            :max="365"
            :step="1"
            style="width: 120px"
          ></el-input-number>
          <span style="margin-left: 8px">{{
            getMessage("popupHistoryDays")
          }}</span>
        </el-tooltip>
      </el-form-item>
      <el-form-item label="">
        {{ getMessage("themeColorTip") }}:
        <el-color-picker
          v-model="settings.themeColor"
          show-alpha
          :predefine="predefineColors"
        >
        </el-color-picker>
      </el-form-item>
      <el-form-item label="">
        {{ getMessage("textColorTip") }}:
        <el-color-picker
          v-model="settings.textColor"
          show-alpha
          :predefine="predefineColors"
        >
        </el-color-picker>
      </el-form-item>
    </el-card>

    <!-- LLM 配置区域 -->
    <el-card shadow="never" style="margin-bottom: 24px;">
      <template #header>
        <span>{{ getMessage('llmSettings') || '大模型（LLM）配置' }}</span>
      </template>
      <!-- 新增：模型配置JSON输入框 -->
      <el-form-item :label="getMessage('llmModelsJsonLabel') || 'Models JSON'">
        <el-input
          v-model="llmConfig.llmModels"
          type="textarea"
          :rows="8"
          :placeholder="getMessage('llmModelsJsonPlaceholder')"
          style="width: 100%; max-width: 800px"
        ></el-input>
        <div style="color: #888; font-size: 12px; margin-top: 4px;">
          {{ getMessage('llmModelsJsonTip') || 'Please enter a JSON object. Each key is a model name, and the value is an object with fields: active, endpoint, method, headers, bodyParams, responseParser.' }}
        </div>
      </el-form-item>
      <el-divider></el-divider>
      <el-form-item>
        <el-tooltip
          class="item"
          effect="dark"
          :content="getMessage('enableSummarizeTip') || '是否启用总结全文'"
          placement="top"
        >
          <el-switch
            v-model="llmConfig.enableSummarize"
            :active-text="getMessage('enableSummarize') || '启用总结全文'"
          ></el-switch>
        </el-tooltip>
      </el-form-item>
      <el-form-item :label="getMessage('llmPromptLabel') || 'Prompt'">
        <el-input
          v-model="llmConfig.prompt"
          :placeholder="getMessage('llmPrompt')"
          type="textarea"
          :rows="2"
          style="width: 600px"
        ></el-input>
      </el-form-item>
      <el-form-item :label="getMessage('llmSystemPromptLabel') || 'System Prompt'">
        <el-input
          v-model="llmConfig.systemPrompt"
          :placeholder="getMessage('llmSystemPrompt')"
          type="textarea"
          :rows="2"
          style="width: 600px"
        ></el-input>
      </el-form-item>
      <el-divider></el-divider>
      <el-form-item :label="getMessage('llmAskLlmLabel') || 'Ask LLM'">
        <draggable
          v-model:list="llmChatMenus"
          handle=".llm-menu-handle"
          item-key="id"
          class="list-group"
        >
          <template #item="{ element }">
            <el-row :gutter="8" align="middle" style="margin-bottom: 8px;">
              <el-col :span="1">
                <el-icon class="llm-menu-handle" style="cursor:move;"><Rank /></el-icon>
              </el-col>
              <el-col :span="4">
                <el-input v-model="element.name" :placeholder="getMessage('llmChatMenuName') || 'Name'"></el-input>
              </el-col>
              <el-col :span="6">
                <el-input v-model="element.prompt" :placeholder="getMessage('llmChatMenuPrompt') || 'Prompt, use {content}'"></el-input>
              </el-col>
              <el-col :span="8">
                <el-input v-model="element.systemPrompt" :placeholder="getMessage('llmChatMenuSystemPrompt') || 'System Prompt'"></el-input>
              </el-col>
              <el-col :span="2">
                <el-button
                  type="danger"
                  @click="delChatMenu(element.id)"
                  circle
                  style="margin-left: 4px"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </el-col>
            </el-row>
          </template>
        </draggable>
        <el-button
          type="info"
          @click="addChatMenu"
          circle
          style="margin-left: 4px"
        >
          <el-icon><Plus /></el-icon>
        </el-button>
      </el-form-item>
    </el-card>

    <!-- 操作按钮区域 -->
    <el-form-item>
      <el-button type="danger" @click="reset">{{
        getMessage("reset")
      }}</el-button>
      <el-button type="default" @click="exportConfig">{{
        getMessage("export") || "导出"
      }}</el-button>
      <el-upload
        :show-file-list="false"
        accept=".json"
        :before-upload="importConfig"
      >
        <el-button type="default">{{
          getMessage("import") || "导入"
        }}</el-button>
      </el-upload>
    </el-form-item>
  </el-form>
</template>

<script>
var debounce = require("lodash.debounce");
import { defineComponent } from "vue";
import draggable from "vuedraggable";
import { Delete, Plus, Rank } from "@element-plus/icons-vue";

/* eslint-disable */
export default defineComponent({
    name: "App",

    components: { 
      draggable,
      Delete,
      Plus,
      Rank
    },

    data() {
        return {
            openHiTip: false,
            logmsg: "", // options页面consolo.log打印不出来，用这个输出到页面中
            engines: [],
            settings: {
                select2clipboard: false,
                showTooltip: false,
                showTopSearchSwitch: true,
                searchInNewTab: true,
                themeColor: 'rgba(144, 238, 144, 0.56)',
                textColor: '#202124', // 新增
                popupSuggestEnabled: true,
                popupSuggestEngine: 'bing',
                popupHistoryEnabled: true,
                popupHistoryDays: 90,
            },
            llmConfig: {
                enableSummarize: false,
                llmModels: '[]', // 新增，模型配置JSON字符串
                prompt: "",
                systemPrompt: ""
            },
            llmChatMenus: [
                // { id: 1, name: "对话助手", prompt: "请用中文简要回答：{content}", systemPrompt: "", max_tokens: 2048, temperature: 0.5 }
            ],
            predefineColors: [
                '#FFFFFF',
                '#ff4500',
                '#ff8c00',
                '#ffd700',
                '#90ee90',
                '#00ced1',
                '#1e90ff',
                '#c71585',
                'rgba(255, 69, 0, 0.68)',
                'rgb(255, 120, 0)',
                'hsv(51, 100, 98)',
                'hsva(120, 40, 94, 0.5)',
                'hsl(181, 100%, 37%)',
                'hsla(209, 100%, 56%, 0.73)',
                '#c7158577'
            ]
        };
    },

    methods: {
        init() {
            let defaultConfig = {
                engines: this.getMessage('defaultEnginesConfig'),
                select2clipboard: false,
                showTooltip: false,
                showTopSearchSwitch: true,
                searchInNewTab: true,
                themeColor: 'rgba(144, 238, 144, 0.56)',
                textColor: '#202124', // 新增
                popupSuggestEnabled: true,
                popupSuggestEngine: 'bing',
                popupHistoryEnabled: true,
                popupHistoryDays: 90,
                llmEnableSummarize: false,
                llmModels: '[]', // 新增
                llmPrompt: this.getMessage('llmPrompt'),
                llmSystemPrompt: this.getMessage('llmSystemPrompt'),
                llmChatMenus: [],
            }; // 默认配置
            let that = this;
            console.log("[options] init defaultConfig:", defaultConfig);
            chrome.storage.sync.get(defaultConfig, function (items) {
                console.log("[options] chrome.storage.sync.get result:", items);
                let engines = JSON.parse(items.engines);
                // 先从 local 取 iconData
                chrome.storage.local.get(null, function(localItems) {
                    engines.forEach(engine => {
                        if (localItems && localItems['iconData_' + engine.name]) {
                            engine.iconData = localItems['iconData_' + engine.name];
                        }
                    });
                    that.engines = engines;
                    that.settings.select2clipboard = items.select2clipboard;
                    that.settings.showTooltip = items.showTooltip;
                    that.settings.showTopSearchSwitch = items.showTopSearchSwitch;
                    that.settings.searchInNewTab = items.searchInNewTab;
                    that.settings.themeColor = items.themeColor;
                    that.settings.textColor = items.textColor; // 新增
                    that.settings.popupSuggestEnabled = items.popupSuggestEnabled;
                    that.settings.popupSuggestEngine = items.popupSuggestEngine;
                    that.settings.popupHistoryEnabled = items.popupHistoryEnabled;
                    that.settings.popupHistoryDays = items.popupHistoryDays;
                    that.llmConfig.enableSummarize = items.llmEnableSummarize || false;
                    that.llmConfig.llmModels = items.llmModels || '[]';
                    that.llmConfig.prompt = items.llmPrompt || "";
                    that.llmConfig.systemPrompt = items.llmSystemPrompt || "";
                    let loadedMenus = Array.isArray(items.llmChatMenus) ? items.llmChatMenus : [];
                    that.llmChatMenus = loadedMenus.map((menu, idx) => ({
                        id: typeof menu.id !== 'undefined' ? menu.id : idx + 1,
                        name: menu.name || "",
                        prompt: menu.prompt || "",
                        systemPrompt: menu.systemPrompt || ""
                    }));
                    console.log("[options] loaded engines:", that.engines);
                    console.log("[options] loaded settings:", that.settings);
                });
                return true;
            });
        },
        onDragEnd(evt) {
            console.log(this.engines, "form.engines");
            // Update IDs to match new order
            this.engines.forEach((engine, index) => {
                engine.id = index + 1;
            });
        },
        changeSearchUrl(item) {
            if (!item.icon) {
                let reg = /(https?\:\/\/[^\/]+).*\?.*/;
                let ret = reg.exec(item.url);
                if (ret) {
                    item.icon = ret[1].trim() + "/favicon.ico";
                }
            }
        },
        addItem() {
            this.engines.push({
                id: this.engines.length + 1
            });
        },
        delItem(id) {
            this.engines = this.engines.filter((item) => {
                if (item.id != id) {
                    return item;
                }
            });
        },
        async fetchIconData(iconUrl) {
            if (!iconUrl || iconUrl.startsWith('data:')) return iconUrl;
            try {
                const response = await fetch(iconUrl, {mode: 'cors'});
                const blob = await response.blob();
                return await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                });
            } catch (e) {
                return iconUrl; // fallback
            }
        },
        async onSubmit() {
            let that = this;
            let offset = 0;
            this.engines = this.engines.filter((item) => {
                offset++;
                item.id = offset;
                return item;
            });
            // 先存 iconData 到 local
            let localIconData = {};
            // 先获取已有的iconData，避免重复下载和保存
            const localItems = await new Promise(resolve => {
                chrome.storage.local.get(null, resolve);
            });
            for (let engine of this.engines) {
                // 只用 name 做 key
                let iconKeyByName = engine.name ? 'iconData_' + engine.name : null;
                let alreadyExists = false;
                if (iconKeyByName && localItems[iconKeyByName]) {
                    engine.iconData = localItems[iconKeyByName];
                    alreadyExists = true;
                }
                if (!alreadyExists && engine.icon && !engine.icon.startsWith('data:')) {
                    engine.iconData = await this.fetchIconData(engine.icon);
                } else if (!alreadyExists && engine.icon && engine.icon.startsWith('data:')) {
                    engine.iconData = engine.icon;
                }
                // 只保存新的iconData
                if (engine.iconData) {
                    if (iconKeyByName && !localItems[iconKeyByName]) {
                        localIconData[iconKeyByName] = engine.iconData;
                    }
                }
            }
            if (Object.keys(localIconData).length > 0) {
                chrome.storage.local.set(localIconData, function() {
                    console.log("[options] chrome.storage.local.set iconData:", localIconData);
                });
            }
            // sync 只存元数据
            const enginesMeta = this.engines.map(({iconData, ...rest}) => rest);
            const saveObj = {
                engines: JSON.stringify(enginesMeta),
                select2clipboard: this.settings.select2clipboard,
                showTooltip: this.settings.showTooltip,
                showTopSearchSwitch: this.settings.showTopSearchSwitch,
                searchInNewTab: this.settings.searchInNewTab,
                themeColor: this.settings.themeColor,
                textColor: this.settings.textColor, // 新增
                popupSuggestEnabled: this.settings.popupSuggestEnabled,
                popupSuggestEngine: this.settings.popupSuggestEngine,
                popupHistoryEnabled: this.settings.popupHistoryEnabled,
                popupHistoryDays: this.settings.popupHistoryDays,
                llmEnableSummarize: this.llmConfig.enableSummarize,
                llmModels: this.llmConfig.llmModels,
                llmPrompt: this.llmConfig.prompt,
                llmSystemPrompt: this.llmConfig.systemPrompt,
                llmChatMenus: this.llmChatMenus.map(menu => ({
                    id: menu.id,
                    name: menu.name,
                    prompt: menu.prompt,
                    systemPrompt: menu.systemPrompt
                })),
            };
            console.log("[options] onSubmit saveObj:", saveObj);
            chrome.runtime.sendMessage({ action: "updateMenus", enginesMeta, llmChatMenus: this.llmChatMenus }, function (response) {
                console.log("[options] runtime.sendMessage response:", response);
            });
            chrome.storage.sync.set(saveObj,
                function () {
                    console.log("[options] chrome.storage.sync.set success", saveObj);
                    that.$message({
                        message: that.getMessage('saved') + ". " + that.getMessage('refresh'),
                        type: "success",
                    });
                    return true;
                }
            );
        },
        exportConfig() {
            // 导出时合并 iconData
            chrome.storage.local.get(null, (localItems) => {
                const enginesWithIcon = this.engines.map(engine => {
                    // 只用 iconData_{name}
                    let iconData = engine.name ? localItems['iconData_' + engine.name] : undefined;
                    return {...engine, iconData};
                });
                const data = {
                    engines: enginesWithIcon,
                    settings: this.settings,
                    llmConfig: this.llmConfig,
                    llmChatMenus: this.llmChatMenus.map(menu => ({
                        id: menu.id,
                        name: menu.name,
                        prompt: menu.prompt,
                        systemPrompt: menu.systemPrompt
                    }))
                };
                const json = JSON.stringify(data, null, 2);
                const blob = new Blob([json], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "search_tool_config.json";
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            });
        },
        importConfig(file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    console.log("[options] importConfig loaded data:", data);
                    if (data.engines && data.settings) {
                        this.engines = data.engines;
                        this.settings = Object.assign(this.settings, data.settings);
                        if (!this.settings.textColor) {
                            this.settings.textColor = '#202124';
                        }
                        if (data.llmConfig) {
                            // 兼容旧结构
                            if (typeof data.llmConfig.llmModels === 'string') {
                                this.llmConfig.llmModels = data.llmConfig.llmModels;
                            } else if (Array.isArray(data.llmConfig.llmModels)) {
                                this.llmConfig.llmModels = JSON.stringify(data.llmConfig.llmModels, null, 2);
                            } else {
                                this.llmConfig.llmModels = '';
                            }
                            this.llmConfig.enableSummarize = !!data.llmConfig.enableSummarize;
                            this.llmConfig.prompt = data.llmConfig.prompt || "";
                            this.llmConfig.systemPrompt = data.llmConfig.systemPrompt || "";
                        }
                        if (Array.isArray(data.llmChatMenus)) {
                            this.llmChatMenus = data.llmChatMenus.map((menu, idx) => ({
                                id: typeof menu.id !== 'undefined' ? menu.id : idx + 1,
                                name: menu.name || "",
                                prompt: menu.prompt || "",
                                systemPrompt: menu.systemPrompt || ""
                            }));
                        }
                        // 导入 iconData 到 local
                        let localIconData = {};
                        this.engines.forEach(engine => {
                            if (engine.iconData && engine.name) {
                                localIconData['iconData_' + engine.name] = engine.iconData;
                            }
                        });
                        chrome.storage.local.set(localIconData, function() {
                            console.log("[options] importConfig set iconData to local:", localIconData);
                        });
                        this.onSubmit();
                        this.$message.success(this.getMessage('importSuccess') || '导入成功');
                    } else {
                        this.$message.error(this.getMessage('importInvalid') || '无效的配置文件');
                    }
                } catch (err) {
                    console.error("[options] importConfig parse error:", err);
                    this.$message.error(this.getMessage('importInvalid') || '无效的配置文件');
                }
            };
            reader.readAsText(file);
            return false;
        },
        addChatMenu() {
            this.llmChatMenus.push({
                id: this.llmChatMenus.length > 0 ? Math.max(...this.llmChatMenus.map(m => m.id)) + 1 : 1,
                name: "",
                prompt: "",
                systemPrompt: ""
            });
        },
        delChatMenu(id) {
            this.llmChatMenus = this.llmChatMenus.filter(menu => menu.id !== id);
        },
        reset() {
            let that = this;
            this.$confirm(
                that.getMessage('reset') + '?',
                that.getMessage('confirmTitle') || 'Confirm',
                {
                    confirmButtonText: that.getMessage('confirmYes') || 'Yes',
                    cancelButtonText: that.getMessage('confirmNo') || 'No',
                    type: 'warning'
                }
            ).then(() => {
                chrome.storage.local.clear(function (items) {
                    console.log("local storage cleared", items);
                });
                chrome.storage.sync.clear(function (items) {
                    console.log("[options] chrome.storage.sync.clear done", items);
                    that.$message({
                        message: that.getMessage('reseted'),
                        type: "success",
                    });
                    return true;
                });
                location.reload();
            }).catch(() => {
            });
        },
        getMessage(key) {
            // 兼容 i18n 未配置 fallback
            return chrome.i18n.getMessage(key) || '';
        },
        autosave: debounce(function (val, old) {
            if (JSON.stringify(val) != JSON.stringify(old)) {
                this.onSubmit();
                if (!this.openHiTip) {
                    this.openHiTip = true;
                }
            }
        }, 1000),
    },

    created() {
        this.init();
    },

    computed: {
        newForm() {
            return JSON.parse(JSON.stringify([this.engines, this.settings, this.llmConfig, this.llmChatMenus]));
        }
    },

    watch: {
        newForm: {
            handler(curVal, oldVal) {
                if (this.isWatch) {
                    this.autosave(curVal, oldVal)
                } else {
                    this.isWatch = true;
                }
            },
            deep: true
        }
    },

    mounted() { },
});
</script>

<style scoped>
.engine-form-item {
  margin-bottom: 20px;
}

.engine-row {
  margin-bottom: 10px;
  display: flex;       /* 改为弹性布局 */
  flex-wrap: wrap;     /* 自动换行 */
}
.engine-row > .el-col {
  padding-left: 20px;    /* 增加左右内边距 */
  padding-right: 20px;
  margin-bottom: 12px;   /* 增加底部间距 */
}

.engine-input {
  width: 100%;
  min-width: 60px;
  max-width: 100px;
}

.engine-url {
  width: 100%;
  min-width: 280px;      /* 缩小最小宽度 */
  max-width: 500px;      /* 合理最大宽度 */
}

.engine-icon {
  width: 100%;
  min-width: 180px;      /* 缩小最小宽度 */
  max-width: 300px;      /* 合理最大宽度 */
}

@media (max-width: 1000px) {
  .engine-row {
    flex-wrap: wrap;
  }
  .engine-url {
    min-width: 350px;
    max-width: 100%;
  }
  .engine-icon {
    min-width: 250px;
    max-width: 100%;
  }
  .el-col {
    margin-bottom: 12px; /* 增加响应式模式下的间距 */
  }
}

@media (max-width: 1000px) {
  .el-switch {
    margin-bottom: 8px;
  }
}

.list-group {
  width: 100%;
}

.handle {
  cursor: move;
}

.info-section {
  max-width: 1100px;
  margin: 0 auto 24px auto;
}
</style>
