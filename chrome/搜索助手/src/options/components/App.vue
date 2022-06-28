<template>
    <el-form ref="form" label-width="10px" size="mini" style="width: 1000px; height: 500px;">
        <el-form-item label="" v-for="item in engines" :key="item.id" :gutter="12">
            <el-row>
                <el-col :span="2">
                    <el-tooltip class="item" effect="dark" content="保存后将根据该字段从小到大排序" placement="top">
                        <el-input size="mini" placeholder="排序ID" v-model="item.id" style="width: 70px"></el-input>
                    </el-tooltip>
                </el-col>
                <el-col :span="3">
                    <el-tooltip class="item" effect="dark" content="选中后将展示在Popup页面（浏览器右上角点击插件弹出的页面）" placement="top">
                        <el-switch v-model="item.inPopup" active-text="popup页面"></el-switch>
                    </el-tooltip>
                </el-col>
                <el-col :span="3">
                    <el-tooltip class="item" effect="dark" content="选中后将展示在右键菜单（如果只选中一个，则会出现在右键顶级菜单）" placement="top">
                        <el-switch v-model="item.inRight" active-text="右键菜单"></el-switch>
                    </el-tooltip>
                </el-col>
                <el-col :span="3">
                    <el-tooltip class="item" effect="dark" content="选中后将支持快捷键在搜索引擎中切换，比如在百度搜索页面，按下快捷键，快速切换为Google搜索"
                        placement="top">
                        <el-switch v-model="item.inShortcuts" active-text="快捷切换"></el-switch>
                    </el-tooltip>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="3">
                    <el-input placeholder="搜索引擎" v-model="item.name" style="width: 100px"></el-input>
                </el-col>
                <el-col :span="9">
                    <el-input placeholder="查询地址，%s替代检索词" v-model="item.url" style="width: 360px"></el-input>
                </el-col>
                <el-col :span="6">
                    <el-input placeholder="icon url， 一般为网站根地址+/favicon.ico" v-model="item.icon" style="width: 240px"></el-input>
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
            <el-button type="primary" @click="onSubmit">保存</el-button>
            <el-button type="success" @click="addItem">新增</el-button>
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
                engines: '[{"name":"百度","url":"https://www.baidu.com/s?wd=%s","inPopup":true,"id":"1","inShortcuts":true,"inRight":true},{"name":"Google","url":"https://www.google.com.hk/search?ie=utf-8&q=%s","inPopup":true,"id":"2","inRight":false,"inShortcuts":true}]',
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
                    that.logmsg += "保存成功!";
                    that.$message({
                        message: "保存成功",
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
                    message: "重置成功",
                    type: "success",
                });
                return true;
            });
        },
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
