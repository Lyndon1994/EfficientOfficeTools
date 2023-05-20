<template>
    <el-form ref="form" label-width="10px" size="mini" style="width: 300px; height: 70px;">
        <el-row>
            <el-input ref="queryInput" style="width: 300px" placeholder="Search ..." @focus="$event.target.select()"
                v-model="query">
                <i slot="suffix" class="el-input__icon el-icon-search"></i>
            </el-input>
        </el-row>
        <el-row>
            <el-tag v-for="(item, index) in engines" :key="item.id" :type="item.id - 1 == selectId ? 'success' : 'info'"
                :hit="item.id - 1 == selectId" :color="item.id - 1 == selectId ? '':'Transparent'"
                @click="search(item)" @mouseenter.native="selectSearch(item)">
                <img v-if="item.icon" style="width: 30px; height: 30px;" :src="item.icon" />
                <span v-if="!item.icon">{{ item.name }}</span>
            </el-tag>
            <i class="el-icon-setting" @click="setting()" style="cursor: pointer; position: absolute; top: 15px; right: 1px; opacity: 0.2;"></i>
            <el-popover
                trigger="manual"
                placement="bottom"
                width="160"
                v-model="first">
                <p>{{getMessage("tabTip")}}</p>
                <div style="text-align: right; margin: 0">
                    <el-button size="mini" type="text" @click="setFirst()">{{getMessage("dontTip")}}</el-button>
                </div>
            </el-popover>
        </el-row>
    </el-form>
</template>

<script>
/* eslint-disable */
export default {
    name: "App",

    components: {},

    data() {
        return {
            engines: [],
            query: "",
            selectId: 0,
            tabIndex: -1,
            first: false,
            searchInNewTab: true,
        };
    },

    methods: {
        init() {
            let defaultConfig = {
                'engines': chrome.i18n.getMessage('defaultEnginesConfig'),
                'first': true,
                'selectId': 0,
                'searchInNewTab': true,
            }; // 默认配置
            // 读取数据，第一个参数是指定要读取的key以及设置默认值
            let that = this;
            chrome.storage.sync.get(defaultConfig, function (items) {
                that.engines = JSON.parse(items.engines);
                let offset = 0;
                that.engines = that.engines.filter(item => {
                    if (item.name && item.url && item.inPopup === true) {
                        offset++;
                        item.id = offset;
                        return item;
                    }
                });
                that.first = items.first;
                that.selectId = items.selectId;
                that.searchInNewTab = items.searchInNewTab;
                console.log(that.engines);
                console.log(that.first);
                console.log("get with selectId " + that.selectId);
                if (that.selectId >= that.engines.length) {
                    that.selectId = 0;
                    console.log("change selectId to "+that.selectId);
                }
            });

            chrome.tabs.query({active: true}, function (tabs) {
                let tab = tabs[0];
                let urlObj = parseUrl(tab.url);
                that.query = urlObj['wd'] || urlObj['word'] || urlObj['q'] || urlObj['query'] || urlObj['w'] || "";
                that.query = decodeURI(that.query);
                that.tabIndex = tab.index;
            });
            // 聚焦搜索框
            this.$nextTick(() => {
                this.$refs['queryInput'].focus();
                // this.$refs['queryInput'].setSelectionRange(0, 10);
            });
        },
        getMessage(key) {
            return chrome.i18n.getMessage(key);
        },
        search(item, shift = false) {
            chrome.storage.sync.set({
                selectId: this.selectId
            });
            if (this.searchInNewTab) {
                shift = !shift;
            }
            this.query = this.query.trim();
            if (this.query && !shift) {
                chrome.tabs.update({
                    url: item.url.replace('%s', this.query)
                });
                window.close();
            } else if(this.query) {
                chrome.tabs.create({
                    url: item.url.replace('%s', this.query),
                    index: this.tabIndex + 1,
                });
                window.close();
            }
        },
        selectSearch(item) {
            this.selectId = item.id - 1;
        },
        searchFirst(shift = false) {
            this.search(this.engines[this.selectId], shift);
        },
        changeSelectId() {
            this.selectId = (this.selectId + 1) % this.engines.length;
        },
        onKeyDown(e) {
            // enter + shift
            if (e.shiftKey && e.keyCode == 13) {
                e.preventDefault();
                this.searchFirst(true);
                return false;
            }
            if (e.keyCode == 13) {
                e.preventDefault();
                this.searchFirst();
                return false;
            }
            // tab
            if (e.keyCode == 9) {
                e.preventDefault();
                this.changeSelectId();
                return false;
            }
            return false;
        },
        // Options page button
        setting() {
            var url = chrome.runtime.getURL('options.html');
            chrome.tabs.create({
                url: url
            });
        },
        setFirst(){
            this.first = false;
            chrome.storage.sync.set({
                first: false
            });
        }
    },

    created() {
        this.init();
        window.addEventListener('keydown', this.onKeyDown);
    },
    beforeDestroy() {
        window.removeEventListener('keydown', this.onKeyDown);
    },
    computed: {},

    mounted() { }
};

function parseUrl(url) {
    let obj = {}
    let reg = /([^?=&]+)=([^?=&]+)/g
    url = url.replace(/#.*/, '');
    url.replace(reg, function () {
        obj[arguments[1]] = arguments[2]
    })
    return obj
}
</script>
