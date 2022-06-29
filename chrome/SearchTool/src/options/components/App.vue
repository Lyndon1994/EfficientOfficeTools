<template>
    <el-form ref="form" label-width="10px" size="mini" style="width: 1000px; height: 500px;">
        <el-form-item label="" v-for="item in engines" :key="item.id" :gutter="12">
            <el-row>
                <el-col :span="2">
                    <el-tooltip class="item" effect="dark" :content="getMessage('optionsSortIdTip')" placement="top">
                        <el-input size="mini" :placeholder="getMessage('optionsSortId')" v-model="item.id" style="width: 70px"></el-input>
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
                    <el-tooltip class="item" effect="dark" :content="getMessage('inShortcutsTip')"
                        placement="top">
                        <el-switch v-model="item.inShortcuts" :active-text="getMessage('inShortcuts')"></el-switch>
                    </el-tooltip>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="3">
                    <el-input :placeholder="getMessage('searchEngine')" v-model="item.name" style="width: 100px"></el-input>
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
            </el-row>
        </el-form-item>

        <el-form-item label="" hidden>
            <el-input type="textarea" v-model="logmsg"></el-input>
        </el-form-item>

        <el-form-item>
            <el-button type="primary" @click="onSubmit">{{getMessage('save')}}</el-button>
            <el-button type="success" @click="addItem">{{getMessage('create')}}</el-button>
            <!-- <el-button type="danger" @click="reset">恢复初始设置</el-button> -->
        </el-form-item>
    </el-form>
</template>

<script>
/* eslint-disable */
export default {
    name: "App",

    components: {},

    data() {
        return {
            logmsg: "", // options页面consolo.log打印不出来，用这个输出到页面中
            engines: [], // engines: [{"name":"百度","url":"https://www.baidu.com/s?wd=%s","inPopup":true,"id":"1","inShortcuts":true,"inRight":true},{"name":"Google","url":"https://www.google.com.hk/search?ie=utf-8&q=%s","inPopup":true,"id":"2","inRight":false,"inShortcuts":true}],
        };
    },

    methods: {
        init() {
            let defaultConfig = {
                engines: this.getMessage('defaultEnginesConfig'),
            }; // 默认配置
            // 读取数据，第一个参数是指定要读取的key以及设置默认值
            let that = this;
            chrome.storage.sync.get(defaultConfig, function (items) {
                that.engines = JSON.parse(items.engines);
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
            this.logmsg += "submit!";
            let that = this;
            this.engines = sortByKey(this.engines, "id");
            let offset = 0;
            this.engines = this.engines.filter((item) => {
                if (item.name && item.url) {
                    offset++;
                    item.id = offset;
                    return item;
                }
            });
            // 发送给background.js，更新右键菜单
            chrome.runtime.sendMessage(this.engines, function (response) {
                console.log(response);
            });
            chrome.storage.sync.set({
                engines: JSON.stringify(this.engines)
            },
                function () {
                    that.logmsg += that.getMessage('saved');
                    that.$message({
                        message: that.getMessage('saved'),
                        type: "success",
                    });
                    return true;
                }
            );
        },
        reset() {
            let that = this;
            chrome.storage.sync.clear(function (items) {
                that.$message({
                    message: that.getMessage('reseted'),
                    type: "success",
                });
                return true;
            });
        },
        getMessage(key) {
            return chrome.i18n.getMessage(key);
        }
    },

    created() {
        this.init();
    },

    computed: {},

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
