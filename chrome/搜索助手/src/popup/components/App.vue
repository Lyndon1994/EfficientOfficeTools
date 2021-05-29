<template>
<el-form>
    <el-row v-for="item in engines" :key="item.id">
        <el-col :span="24">
            <el-button type="text" @click="search(item)" :style="randomRgb()">{{item.name}}</el-button>
        </el-col>
    </el-row>
</el-form>
</template>

<script>
export default {
    name: "App",

    components: {},

    data() {
        return {
            engines: [],
        };
    },

    methods: {
        randomRgb() {
            let R = Math.floor(Math.random() * 255);
            let G = Math.floor(Math.random() * 255);
            let B = Math.floor(Math.random() * 255);
            return {
                color: 'rgb(' + R + ',' + G + ',' + B + ')'
            };
        },
        init() {
            let defaultConfig = {
                'engines': '[{\"name\":\"百度\",\"url\":\"https://www.baidu.com/s?wd=%s\",\"inPopup\":true,\"id\":\"1\",\"inShortcuts\":true,\"inRight\":true},{\"name\":\"Google\",\"url\":\"https://www.google.com.hk/search?ie=utf-8&q=%s\",\"inPopup\":true,\"id\":\"2\",\"inRight\":false,\"inShortcuts\":true}]'
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
        },
        search(item) {
            chrome.tabs.getSelected(null, function (tab) {
                let urlObj = parseUrl(tab.url);
                let query = urlObj['wd'] || urlObj['word'] || urlObj['w'] || urlObj['q'] || urlObj['query'];
                if (query) {
                    chrome.tabs.update({
                        url: item.url.replace('%s', query)
                    });
                    window.close();
                } else {
                    window.open(item.url.replace('%s', ''));
                    window.close();
                }
            });
        }
    },

    created() {
        this.init();
    },

    computed: {},

    mounted() {}
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
