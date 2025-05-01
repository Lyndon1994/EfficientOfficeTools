<!-- eslint-disable prettier/prettier -->
<template>
    <el-form :style="tableheight" ref="form" label-width="10px" size="mini" @submit.prevent>
        <el-row style="width: inherit;">
            <el-autocomplete
                size="small"
                ref="queryInput"
                style="width: inherit;"
                class="inline-input"
                v-model="query"
                @focus="handleFocus"
                :fetch-suggestions="(popupSuggestEnabled || popupHistoryEnabled) ? queryMatch : null"
                placeholder="Search ..."
                :trigger-on-focus="false"
                :popper-append-to-body="false"
                :highlight-first-item="highlightFirstItem"
                @select="handleSelect"
                @keyup.enter="onSubmit"
                @blur="handleBlur"
            >
                <template v-slot="{ item }">
                    <span v-html="item.value"></span>
                </template>
            </el-autocomplete>
        </el-row>
        <el-row :style="{ width: 'inherit', marginTop: '10px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', position: 'relative', zIndex: 100 }">
            <el-tag v-for="item in engines" :key="item.id" :type="item.id - 1 == selectId ? 'success' : 'info'"
                :hit="item.id - 1 == selectId" :color="item.id - 1 == selectId ? '' : 'Transparent'" @click="search(item)"
                @mouseenter="selectSearch(item)" style="margin-right: 4px; margin-bottom: 4px;">
                <img v-if="item.icon" style="width: 30px; height: 30px;" :src="item.icon" />
                <span v-if="!item.icon">{{ item.name }}</span>
            </el-tag>
            <span v-if="showHistoryDaysTooltip">
                <el-tooltip class="item" effect="light" :disabled="disabledHistoryTooltip"
                    :content="getMessage('historyDaysTip')" placement="top">
                    <el-slider :input-size="mini" style="position: absolute; right: 30px; width: 100px; top: 0px;"
                        v-model="historyDays" :max="365" @change="onChangeHistoryDays"></el-slider>
                </el-tooltip>
            </span>

            <i class="el-icon-setting" @click="setting()"
                style="cursor: pointer; position: absolute; top: 15px; right: 1px; opacity: 0.2;"></i>
            <el-popover trigger="manual" placement="bottom" width="160" v-model="first">
                <p>{{ getMessage("tabTip") }}</p>
                <div style="text-align: right; margin: 0">
                    <el-button size="mini" type="text" @click="setFirst()">{{
                        getMessage("dontTip")
                    }}</el-button>
                </div>
            </el-popover>
        </el-row>
    </el-form>
</template>

<script>
/* eslint-disable */
const defaultHeight = '63px';
const defaultWidth = '300px';
const largeWidth = '700px';
export default {
    name: "App",

    components: {},

    data() {
        return {
            tableheight: { height: defaultHeight, width: defaultWidth },
            engines: [],
            query: "",
            selectId: 0,
            tabIndex: -1,
            first: false,
            searchInNewTab: true,
            queryMatchHistory: [],
            historyDays: 90,
            showHistoryDaysTooltip: false,
            disabledHistoryTooltip: false,
            preHeight: defaultHeight,
            highlightFirstItem: false,
            popupSuggestEnabled: true,
            popupSuggestEngine: 'bing',
            popupHistoryEnabled: true,
            popupHistoryDays: 90,
        };
    },

    methods: {
        init() {
            let defaultConfig = {
                'engines': chrome.i18n.getMessage('defaultEnginesConfig'),
                'first': true,
                'selectId': 0,
                'searchInNewTab': true,
                'popupSuggestEnabled': true,
                'popupSuggestEngine': 'bing',
                'popupHistoryEnabled': true,
                'popupHistoryDays': 90,
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
                that.popupSuggestEnabled = items.popupSuggestEnabled;
                that.popupSuggestEngine = items.popupSuggestEngine;
                that.popupHistoryEnabled = items.popupHistoryEnabled;
                that.popupHistoryDays = items.popupHistoryDays;
                that.historyDays = that.popupHistoryDays;
                console.log(that.engines);
                console.log(that.first);
                console.log("get with selectId " + that.selectId);
                if (that.selectId >= that.engines.length) {
                    that.selectId = 0;
                    console.log("change selectId to " + that.selectId);
                }
            });

            chrome.tabs.query({ active: true }, function (tabs) {
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
            } else if (this.query) {
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
        onSubmit() {
            this.searchFirst(false);
        },
        searchFirst(shift = false) {
            this.search(this.engines[this.selectId], shift);
        },
        changeSelectId() {
            this.selectId = (this.selectId + 1) % this.engines.length;
        },
        onKeyDown(e) {
            // enter + shift
            // if (e.shiftKey && e.keyCode == 13) {
            //     e.preventDefault();
            //     this.searchFirst(true);
            //     return false;
            // }
            // if (e.keyCode == 13) {
            //     e.preventDefault();
            //     this.searchFirst();
            //     return false;
            // }
            // tab
            if (e.keyCode == 9) {
                // 让input后选项somehow就出不来
                if (document.getElementsByClassName("el-autocomplete-suggestion")) {
                    document.getElementsByClassName("el-autocomplete-suggestion")[0].style.display = "block";
                }
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
        setFirst() {
            this.first = false;
            chrome.storage.sync.set({
                first: false
            });
        },
        unique(arr, val) {
            const res = new Map();
            return arr.filter(item => !res.has(item[val]) && res.set(item[val], 1))
        },
        getHeight(length) {
            if (length == 0) return 63;
            if (length == 1) return 132;
            return Math.min(360, (90 + length * 34));
        },
        googleSuggest(queryString, cb) {
            let that = this;
            this.highlightFirstItem = false;
            try {
                this.$axios.get(`https://suggestqueries.google.com/complete/search?client=youtube&q=${queryString}&jsonp=window.google.ac.h`).then(function (res) {
                    if (res.status == 200) {
                        // Google 返回格式: [query, [[suggest1, ...], [suggest2, ...], ...], {...}]
                        let data = JSON.parse(res.data.replace(/window.google.ac.h\((.*)\)/, "$1"));
                        let results = Array.isArray(data[1]) ? data[1].map(i => ({ value: i[0] })) : [];
                        // 置顶 pin 或高频历史
                        const topQ = that.queryMatchHistory.filter(item => item.pin).concat(that.queryMatchHistory.filter(obj => obj.visitCount && obj.visitCount >= 3)).slice(0, 1);
                        const topQUrls = topQ.map(item => item.url);
                        if (topQ.length > 0) {
                            that.highlightFirstItem = true;
                        }
                        const lastQ = that.queryMatchHistory.filter(obj => !topQUrls.includes(obj.url));
                        results = topQ.concat(results.slice(0, 5)).concat(lastQ).concat(results.slice(5));
                        that.tableheight.height = that.getHeight(results.length) + 'px';
                        cb(results);
                    }
                }, function () {
                    console.log('request suggestqueries.google.com failed');
                });
            }
            catch (err) {
                console.log(err);
            }
        },
        bingSuggest(queryString, cb) {
            let that = this;
            this.highlightFirstItem = false;
            try {
                this.$axios.get(`https://api.bing.com/qsonhs.aspx?type=cb&q=${queryString}&cb=window.bing.sug`).then(function (res) {
                    // console.log("bing res.body:");
                    // console.log(res);
                    if (res.status == 200) {
                        let data = JSON.parse(res.data.replace(/.*window.bing.sug\((.*)\/\* pageview_candidate \*\/\)\;/, "$1"));
                        if (data['AS']['FullResults'] <= 0) {
                            return;
                        }
                        let results = data.AS.Results.flatMap(result => result.Suggests.map(suggest => ({ value: suggest.Txt })));
                        // 调整排序放在最前面
                        const topQ = that.queryMatchHistory.filter(item => item.pin).concat(that.queryMatchHistory.filter((obj) => obj.visitCount && obj.visitCount >= 3)).slice(0, 1);
                        const topQUrls = topQ.map(item => item.url);
                        if (topQ) {
                            // TODO somehow 没起作用
                            that.highlightFirstItem = true;
                        }
                        const lastQ = that.queryMatchHistory.filter((obj) => !topQUrls.includes(obj.url));
                        results = topQ.concat(results.slice(0, 5)).concat(lastQ).concat(results.slice(5))
                        that.tableheight.height = that.getHeight(results.length) + 'px';
                        // console.log(results);
                        cb(results);
                    }
                }, function () {
                    console.log('request api.bing.com failed');
                });
            }
            catch (err) {
                console.log(err);
            }
        },
        queryMatch(queryString, cb) {
            // 控制建议和历史/收藏夹匹配
            let that = this;
            let bookmarks = [];
            this.queryMatchHistory = [];
            console.log("query match start: " + queryString + " history days: " + this.historyDays);

            // 搜索建议
            if (this.popupSuggestEnabled) {
                this.tableheight.width = largeWidth;
                if (this.popupSuggestEngine === 'bing') {
                    this.bingSuggest(queryString, cb);
                } else if (this.popupSuggestEngine === 'google') {
                    this.googleSuggest(queryString, cb);
                }
            }

            // 历史/收藏夹匹配
            if (!this.popupHistoryEnabled) {
                return;
            }
            this.tableheight.width = largeWidth;
            this.showHistoryDaysTooltip = true;

            chrome.bookmarks.search(queryString, function (results) {
                bookmarks = results.filter((obj) => obj['url'] != null).slice(0, 10);
            })
            // TODO: 过滤减号后面的字符
            let queryFormats = queryString.match(/^[^-]+/);
            let filterStrs = queryString.match(/(?<=-)\w+/g);
            queryString = queryFormats ? queryFormats[0] : queryString;
            chrome.history.search({
                "text": queryString,
                "maxResults": 30,
                "startTime": new Date().getTime() - that.historyDays * 86400000 // 90 day ago
            },
                function (results) {
                    console.log("bookmarks");
                    console.log(bookmarks);
                    console.log("history:");
                    console.log(results);
                    results = that.unique(bookmarks.concat(results), 'url');
                    results.forEach(element => {
                        let url = element['url'].replace(/^https?:\/\/(www\.)?/, "");
                        element['value'] = `${element['title']} - <span style="color:blue;">${url}</span>`;
                        // 收藏夹前面加五角星
                        if (element.dateAdded) {
                            element['value'] = `⭐️${element['value']}`;
                        }
                        // 空格分割再加粗
                        queryString.split(/[\s\+]+/).forEach(iq => {
                            iq = iq.trim();
                            if (iq) {
                                element['value'] = element['value'].replaceAll(iq, `<b>${iq}</b>`);
                            }
                        });
                        let domain = new URL(element['url']).hostname;
                        // 如果query和url完全匹配，则置顶，只匹配history
                        if (element.visitCount && domain.indexOf(queryString)===0) {
                            element['pin'] = true;
                        }
                        // 用这个service获取icon
                        if (element['url'].indexOf("http") != -1) {
                            //element['value'] = `<img src="https://www.google.com/s2/favicons?domain=${element['url']}" style="width: 18px; vertical-align: middle;"> ${element['value']}`
                            element['value'] = `<img src="https://icon.horse/icon/${domain}" style="width: 18px; vertical-align: middle;"> ${element['value']}`
                        }
                    });
                    // 过滤减号后面的字符
                    if (filterStrs && filterStrs.length > 0) {
                        filterStrs.forEach(filterStr => {
                            filterStr = filterStr.trim().toLowerCase();
                            if (filterStr) {
                                results = results.filter((obj) => obj['url'].toLowerCase().indexOf(filterStr) == -1 && obj['title'].toLowerCase().indexOf(filterStr) == -1);
                            }
                        })
                    }
                    
                    that.queryMatchHistory = results;
                    that.tableheight.height = that.getHeight(results.length) + 'px';
                    cb(results);
                },
            );
        },
        handleSelect(item) {
            console.log(item);
            if (item.url) {
                if (this.searchInNewTab) {
                    chrome.tabs.create({
                        url: item.url,
                        index: this.tabIndex + 1,
                    });
                    window.close();
                } else {
                    chrome.tabs.update({
                        url: item.url
                    });
                    window.close();
                }
            } else {
                this.searchFirst();
            }
        },
        handleBlur(event) {
            console.log("blur")
        },
        handleFocus(event) {
            console.log("focus")
            event.target.select();
        },
        onChangeHistoryDays() {
            this.disabledHistoryTooltip=true;
            if (document.getElementsByClassName("el-autocomplete-suggestion")) {
                document.getElementsByClassName("el-autocomplete-suggestion")[0].style.display = "block";
            }
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
    watch: {
        query: function (query) {
            if (query == "") {
                this.tableheight.height = defaultHeight;
            }
        }
    },

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
