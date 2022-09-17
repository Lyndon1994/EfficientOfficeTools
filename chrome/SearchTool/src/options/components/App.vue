<template>
    <el-form ref="form" label-width="10px" size="mini" style="width: 1000px; height: 500px;">
        <el-form-item label="" v-for="item in engines" :key="item.id" :gutter="12">
            <el-row>
                <el-col :span="2">
                    <el-tooltip class="item" effect="dark" :content="getMessage('optionsSortIdTip')" placement="top">
                        <el-input size="mini" :placeholder="getMessage('optionsSortId')" v-model="item.id"
                            style="width: 70px"></el-input>
                    </el-tooltip>
                </el-col>
                <el-col :span="3">
                    <el-tooltip class="item" effect="dark" :content="getMessage('optionsInPopupTip')" placement="top">
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
                <el-col :span="3">
                    <el-input :placeholder="getMessage('searchEngine')" v-model="item.name" style="width: 100px">
                    </el-input>
                </el-col>
                <el-col :span="9">
                    <el-input :placeholder="getMessage('searchUrl')" v-model="item.url" style="width: 360px"></el-input>
                </el-col>
                <el-col :span="6">
                    <el-input :placeholder="getMessage('searchIcon')" v-model="item.icon" style="width: 240px">
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
                <el-switch v-model="settings.showTopSearchSwitch" :active-text="getMessage('showTopSearchSwitch')"></el-switch>
            </el-tooltip>
        </el-form-item>
        <!-- <el-form-item label="" hidden>
            <el-input type="textarea" v-model="logmsg"></el-input>
        </el-form-item> -->

        <el-form-item>
            <!-- <el-button type="primary" @click="onSubmit">{{getMessage('save')}}</el-button> -->
            <!-- <el-button type="success" @click="addItem">{{getMessage('create')}}</el-button> -->
            <el-button type="danger" @click="reset">{{getMessage('reset')}}</el-button>
        </el-form-item>
</el-form>

</template>

<script>
var debounce = require('lodash.debounce');

/* eslint-disable */
export default {
    name: "App",

    components: {},

    data() {
        return {
            openHiTip: false,
            logmsg: "", // options页面consolo.log打印不出来，用这个输出到页面中
            engines: [],
            settings: {
                select2clipboard: false,
                showTooltip: false,
                showTopSearchSwitch: true,
            }
        };
    },

    methods: {
        init() {
            let defaultConfig = {
                engines: this.getMessage('defaultEnginesConfig'),
                select2clipboard: false,
                showTooltip: false,
                showTopSearchSwitch: true,
            }; // 默认配置
            // 读取数据，第一个参数是指定要读取的key以及设置默认值
            let that = this;
            chrome.storage.sync.get(defaultConfig, function (items) {
                that.engines = JSON.parse(items.engines);
                that.settings.select2clipboard = items.select2clipboard;
                that.settings.showTooltip = items.showTooltip;
                that.settings.showTopSearchSwitch = items.showTopSearchSwitch;
                return true;
            });
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
            this.engines = sortByKey(this.engines, "id");
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

function sortByKey(array, key) {
    return array.sort(function (a, b) {
        var x = a[key];
        var y = b[key];
        return x < y ? -1 : x > y ? 1 : 0;
    });
}
</script>
