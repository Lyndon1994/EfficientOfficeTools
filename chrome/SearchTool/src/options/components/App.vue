<template>
  <el-form
    ref="form"
    label-width="10px"
    size="mini"
    style="width: 100%; min-width: 1000px; min-height: 500px"
  >
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
            <el-col :xs="8" :sm="4" :md="2">
              <el-input
                :placeholder="getMessage('searchEngine')"
                v-model="element.name"
                class="engine-input"
              >
              </el-input>
            </el-col>
            <el-col :xs="12" :sm="6" :md="3">
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
            <el-col :xs="12" :sm="6" :md="3">
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
            <el-col :xs="24" :sm="12" :md="9">
              <el-input
                :placeholder="getMessage('searchUrl')"
                v-model="element.url"
                @input="changeSearchUrl(element)"
                class="engine-url"
                style="min-width: 180px;"
              ></el-input>
            </el-col>
            <el-col :xs="18" :sm="9" :md="8">
              <el-input
                :placeholder="getMessage('searchIcon')"
                v-model="element.icon"
                class="engine-icon"
                style="min-width: 120px;"
              >
                <template v-slot:append>
                  <img :src="element.icon" alt="" height="20px" />
                </template>
              </el-input>
            </el-col>
            <el-col :xs="3" :sm="1" :md="1" style="min-width: 40px;">
              <el-button
                type="danger"
                @click="delItem(element.id)"
                circle
                style="margin-left: 4px;"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </el-col>
            <el-col :xs="3" :sm="1" :md="1" v-if="element.id == engines.length" style="min-width: 40px;">
              <el-button
                type="info"
                @click="addItem"
                circle
                style="margin-left: 4px;"
              >
                <el-icon><Plus /></el-icon>
              </el-button>
            </el-col>
          </el-row>
        </el-form-item>
      </template>
    </draggable>

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
        <el-select v-model="settings.popupSuggestEngine" style="width: 120px;">
          <el-option label="Bing" value="bing"></el-option>
          <el-option label="Google" value="google"></el-option>
        </el-select>
        <span style="margin-left: 8px;">{{ getMessage('popupSuggestEngine') }}</span>
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
          style="width: 120px;"
        ></el-input-number>
        <span style="margin-left: 8px;">{{ getMessage('popupHistoryDays') }}</span>
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

    <el-form-item>
      <el-button type="danger" @click="reset">{{
        getMessage("reset")
      }}</el-button>
      <el-button type="primary" @click="exportConfig">{{
        getMessage("export") || "导出"
      }}</el-button>
      <el-upload
        :show-file-list="false"
        accept=".json"
        :before-upload="importConfig"
      >
        <el-button type="success">{{
          getMessage("import") || "导入"
        }}</el-button>
      </el-upload>
    </el-form-item>
  </el-form>
</template>

<script>
var debounce = require("lodash.debounce");
import { defineComponent } from 'vue';
import draggable from "vuedraggable";
import { Delete, Plus, Rank } from '@element-plus/icons-vue';

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
            }; // 默认配置
            // 读取数据，第一个参数是指定要读取的key以及设置默认值
            let that = this;
            chrome.storage.sync.get(defaultConfig, function (items) {
                that.engines = JSON.parse(items.engines);
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
                return true;
            });
            this.openReadme();
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
        onSubmit() {
            let that = this;
            let offset = 0;
            this.engines = this.engines.filter((item) => {
                offset++;
                item.id = offset;
                return item;
            });
            // 发送给background.js，更新右键菜单
            chrome.runtime.sendMessage(this.engines, function (response) {
                console.log(response);
            });
            chrome.storage.sync.set({
                engines: JSON.stringify(this.engines),
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
            },
                function () {
                    console.log("saved");
                    that.$message({
                        message: that.getMessage('saved') + ". " + that.getMessage('refresh'),
                        type: "success",
                    });
                    return true;
                }
            );
        },
        reset() {
            let that = this;
            this.$confirm(that.getMessage('reset') + '?', 'Confirm', {
                confirmButtonText: 'Yes',
                cancelButtonText: 'No',
                type: 'warning'
            }).then(() => {
                chrome.storage.sync.clear(function (items) {
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
        exportConfig() {
            const data = {
                engines: this.engines,
                settings: this.settings
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
        },
        importConfig(file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    if (data.engines && data.settings) {
                        this.engines = data.engines;
                        this.settings = Object.assign(this.settings, data.settings);
                        // 兼容旧配置
                        if (!this.settings.textColor) {
                            this.settings.textColor = '#202124';
                        }
                        this.onSubmit();
                        this.$message.success(this.getMessage('importSuccess') || '导入成功');
                    } else {
                        this.$message.error(this.getMessage('importInvalid') || '无效的配置文件');
                    }
                } catch (err) {
                    this.$message.error(this.getMessage('importInvalid') || '无效的配置文件');
                }
            };
            reader.readAsText(file);
            // 阻止 el-upload 默认上传
            return false;
        },
        getMessage(key) {
            return chrome.i18n.getMessage(key);
        },
        autosave: debounce(function (val, old) {
            if (JSON.stringify(val) != JSON.stringify(old)) {
                this.onSubmit();
                if (!this.openHiTip) {
                    this.openHi();
                    this.openHiTip = true;
                }
            }
        }, 1000),
        openHi() {
            this.$notify({
                title: 'Hi',
                dangerouslyUseHTMLString: true,
                message: this.getMessage('comment'),
                duration: 0
            });
        },
        openReadme() {
            this.$notify({
                title: 'Read Me',
                dangerouslyUseHTMLString: true,
                message: this.getMessage('readme'),
                duration: 0
            });
            let that = this;
            setTimeout(function(){ 
                that.$notify({
                    title: 'Welcome to contribute',
                    dangerouslyUseHTMLString: true,
                    message: "You are more than welcome to contribute code to improve the tool. <a href='https://github.com/Lyndon1994/EfficientOfficeTools/tree/main/chrome/SearchTool'>Click here.</a> 😊",
                    duration: 0
                });
            }, 3000);
        }
    },

    created() {
        this.init();
    },

    computed: {
        newForm() {
            return JSON.parse(JSON.stringify([this.engines, this.settings]))
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
}

.engine-input {
  width: 100%;
  min-width: 60px;
  max-width: 100px;
}

.engine-url {
  width: 100%;
  min-width: 180px;
}

.engine-icon {
  width: 100%;
  min-width: 120px;
}

@media (max-width: 600px) {
  .engine-row {
    flex-wrap: wrap;
  }
  .engine-url, .engine-icon {
    min-width: 100px;
  }
  .el-col {
    margin-bottom: 8px;
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
</style>
