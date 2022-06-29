<template>
    <!-- // @submit.prevent.native="searchFirst"  -->
    <el-form ref="form" label-width="10px" size="mini" style="width: 300px; height: 70px;">
        <el-row>
            <el-input ref="queryInput" style="width: 300px" placeholder="Search ..." @focus="$event.target.select()"
                v-model="query">
                <i slot="suffix" class="el-input__icon el-icon-search"></i>
            </el-input>
        </el-row>
        <el-row>
            <el-tag v-for="(item, index) in engines" :key="item.id" :type="index == selectId ? 'success' : 'info'"
                :hit="index == selectId" :color="index == selectId ? '':'Transparent'" @click="search(item)">
                <img v-if="item.icon" style="width: 30px; height: 30px;" :src="item.icon" />
                <span v-if="!item.icon">{{ item.name }}</span>
            </el-tag>
            <i class="el-icon-setting" @click="setting()" style="cursor: pointer; position: absolute; top: 15px; right: 1px; opacity: 0.2;"></i>
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
        };
    },

    methods: {
        init() {
            let defaultConfig = {
                'engines': chrome.i18n.getMessage('defaultEnginesConfig')
            }; // 默认配置
            // 读取数据，第一个参数是指定要读取的key以及设置默认值
            let that = this;
            chrome.storage.sync.get(defaultConfig, function (items) {
                that.engines = JSON.parse(items.engines);
                that.engines = that.engines.filter(item => {
                    if (item.name && item.url && item.inPopup === true) {
                        return item;
                    }
                });
                console.log(that.engines);
            });

            chrome.tabs.getSelected(null, function (tab) {
                let urlObj = parseUrl(tab.url);
                that.query = urlObj['wd'] || urlObj['word'] || urlObj['w'] || urlObj['q'] || urlObj['query'] || "";
                that.query = decodeURI(that.query);
                that.tabIndex = tab.index;
            });
            // 聚焦搜索框
            this.$nextTick(() => {
                this.$refs['queryInput'].focus();
                // this.$refs['queryInput'].setSelectionRange(0, 10);
            });
        },
        search(item, shift = false) {
            if (this.query && !shift) {
                chrome.tabs.update({
                    url: item.url.replace('%s', this.query)
                });
                window.close();
            } else {
                chrome.tabs.create({
                    url: item.url.replace('%s', this.query),
                    index: this.tabIndex + 1,
                });
                // window.open(item.url.replace('%s', this.query));
                window.close();
            }
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
            var url = chrome.extension.getURL('options.html');
            window.open(url);
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
    url.replace(reg, function () {
        obj[arguments[1]] = arguments[2]
    })
    return obj
}
</script>
