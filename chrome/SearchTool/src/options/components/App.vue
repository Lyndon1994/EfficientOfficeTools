<template>
    <el-form ref="form" label-width="10px" size="mini" style="width: 1000px; height: 500px;">
        <draggable v-model="engines" @end="onDragEnd" handle=".handle">
            <transition-group>
                <el-form-item label="" v-for="(item, index) in engines" :key="item.id" :gutter="12">
                    <el-row>
                        <el-col :span="1">
                            <i class="el-icon-rank handle"></i>
                            <!-- <el-tag size="small">{{item.id}}</el-tag> -->
                        </el-col>
                        <el-col :span="2">
                            <el-input :placeholder="getMessage('searchEngine')" v-model="item.name" style="width: 80px">
                            </el-input>
                        </el-col>
                        <el-col :span="3">
                            <el-tooltip class="item" effect="dark" :content="getMessage('optionsInPopupTip')"
                                placement="top">
                                <el-switch v-model="item.inPopup" :active-text="getMessage('optionsInPopup')"></el-switch>
                            </el-tooltip>
                        </el-col>
                        <el-col :span="3">
                            <el-tooltip class="item" effect="dark" :content="getMessage('inRightTip')" placement="top">
                                <el-switch v-model="item.inRight" :active-text="getMessage('inRight')"></el-switch>
                            </el-tooltip>
                        </el-col>
                        <el-col :span="4">
                            <el-tooltip class="item" effect="dark" :content="getMessage('inShortcutsTip')" placement="top">
                                <el-switch v-model="item.inShortcuts" :active-text="getMessage('inShortcuts')"></el-switch>
                            </el-tooltip>
                        </el-col>
                        <el-col :span="4">
                            <el-tooltip class="item" effect="dark" :content="getMessage('inTooltipTip')" placement="top">
                                <el-switch v-model="item.inTooltip" :active-text="getMessage('inTooltip')"></el-switch>
                            </el-tooltip>
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col :span="9">
                            <el-input :placeholder="getMessage('searchUrl')" v-model="item.url"
                                @input="changeSearchUrl(item)" style="width: 360px"></el-input>
                        </el-col>
                        <el-col :span="8">
                            <el-input :placeholder="getMessage('searchIcon')" v-model="item.icon" style="width: 320px">
                                <img slot="append" :src="item.icon" alt="" height="20px" />
                            </el-input>
                        </el-col>
                        <el-col :span="1">
                            <el-button type="danger" icon="el-icon-delete" @click="delItem(item.id)" circle></el-button>
                        </el-col>
                        <el-col :span="1" v-if="item.id == engines.length">
                            <el-button type="info" icon="el-icon-plus" @click="addItem" circle></el-button>
                        </el-col>
                    </el-row>
                </el-form-item>
            </transition-group>
        </draggable>

        <el-form-item label="">
            <el-tooltip class="item" effect="dark" :content="getMessage('select2clipboardTip')" placement="top">
                <el-switch v-model="settings.select2clipboard" :active-text="getMessage('select2clipboard')">
                </el-switch>
            </el-tooltip>
        </el-form-item>
        <el-form-item label="">
            <el-tooltip class="item" effect="dark" :content="getMessage('showTooltipTip')" placement="top">
                <el-switch v-model="settings.showTooltip" :active-text="getMessage('showTooltip')"></el-switch>
            </el-tooltip>
        </el-form-item>
        <el-form-item label="">
            <el-tooltip class="item" effect="dark" :content="getMessage('showTopSearchSwitchTip')" placement="top">
                <el-switch v-model="settings.showTopSearchSwitch"
                    :active-text="getMessage('showTopSearchSwitch')"></el-switch>
            </el-tooltip>
        </el-form-item>
        <el-form-item label="">
            <el-tooltip class="item" effect="dark" :content="getMessage('searchInNewTabTip')" placement="top">
                <el-switch v-model="settings.searchInNewTab" :active-text="getMessage('searchInNewTab')"></el-switch>
            </el-tooltip>
        </el-form-item>

        <el-form-item label="">
            {{ getMessage('themeColorTip') }}: 
            <el-color-picker v-model="settings.themeColor" show-alpha :predefine="predefineColors">
            </el-color-picker>
        </el-form-item>

        <el-form-item>
            <!-- <el-button type="primary" @click="onSubmit">{{getMessage('save')}}</el-button> -->
            <!-- <el-button type="success" @click="addItem">{{getMessage('create')}}</el-button> -->
            <el-button type="danger" @click="reset">{{
                getMessage("reset")
            }}</el-button>
        </el-form-item>
    </el-form>
</template>

<script>
var debounce = require("lodash.debounce");
import draggable from "vuedraggable";

/* eslint-disable */
export default {
    name: "App",

    components: { draggable },

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
                return true;
            });
            this.openReadme();
        },
        onDragEnd() {
            console.log(this.engines, "form.engines");
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
                // 如果过滤，自动保存会有问题。
                // if (item.name && item.url) {
                offset++;
                item.id = offset;
                return item;
                // }
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
};
</script>
