<!-- eslint-disable prettier/prettier -->
<template>
    <el-form :style="tableheightWithPadding" ref="form" label-width="10px" size="mini" @submit.prevent>
        <el-row style="width: inherit;">
            <el-autocomplete
                ref="queryInput"
                style="width: inherit;"
                class="inline-input"
                v-model="query"
                @focus="handleFocus"
                :fetch-suggestions="querySearch"
                placeholder="Search ..."
                :trigger-on-focus="false"
                :popper-append-to-body="false"
                :highlight-first-item="highlightFirstItem"
                @select="handleSelect"
                @keyup.enter="onSubmit"
                @blur="handleBlur"
                @input="handleQueryInput"
            >
                <template v-slot="{ item }">
                    <span v-html="item.value"></span>
                </template>
            </el-autocomplete>
        </el-row>
        
        <!-- 修改为两列布局 -->
        <el-row
            ref="engineRow"
            :style="computedEngineRowStyle"
            :class="{'engine-row-fixed-bottom': enginesFixedBottom}"
        >
            <!-- 左侧搜索引擎区域 -->
            <div class="engine-options-area" :class="{'full-width': !showHistoryDaysTooltip}">
                <el-tag v-for="item in engines" :key="item.id" :type="item.id - 1 == selectId ? 'success' : 'info'"
                    :hit="item.id - 1 == selectId" :color="item.id - 1 == selectId ? '' : 'Transparent'" @click="search(item)"
                    @mouseenter="selectSearch(item)" style="margin-right: 4px; margin-bottom: 10px;">
                    <img v-if="item.icon || item.iconData" style="width: 30px; height: 30px;" :src="item.iconData || item.icon" />
                    <span v-if="!item.icon && !item.iconData">{{ item.name }}</span>
                </el-tag>
            </div>
            
            <!-- 右侧历史天数区域 -->
            <div v-if="showHistoryDaysTooltip" class="history-days-area">
                <el-tooltip class="item" effect="light" :disabled="disabledHistoryTooltip"
                    :content="getMessage('historyDaysTip')" placement="top">
                    <el-slider :input-size="mini" v-model="historyDays" :max="365" @change="onChangeHistoryDays"></el-slider>
                </el-tooltip>
            </div>

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
            enginesFixedBottom: false,
            engineRowLines: 1,
            suggestionsVisible: false,
            suggestionBoxHeight: 0,
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
            };
            let that = this;
            console.log("[popup] init defaultConfig:", defaultConfig);
            chrome.storage.sync.get(defaultConfig, function (items) {
                console.log("[popup] chrome.storage.sync.get result:", items);
                let rawEngines;
                try {
                    rawEngines = JSON.parse(items.engines);
                } catch (e) {
                    console.error("[popup] Failed to parse engines from storage:", items.engines, e);
                    rawEngines = [];
                }
                // 从 local 获取 iconData
                chrome.storage.local.get(null, function(localItems) {
                    let offset = 0;
                    that.engines = rawEngines.filter(item => {
                        if (item.name && item.url && item.inPopup === true) {
                            offset++;
                            item.id = offset;
                            if (localItems && localItems['iconData_' + item.id]) {
                                item.iconData = localItems['iconData_' + item.id];
                            }
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
                    console.log("[popup] loaded engines:", that.engines);
                    console.log("[popup] loaded first:", that.first);
                    console.log("[popup] get with selectId", that.selectId);
                    if (that.selectId >= that.engines.length) {
                        that.selectId = 0;
                        console.log("[popup] change selectId to", that.selectId);
                    }
                });
            });

            chrome.tabs.query({ active: true }, function (tabs) {
                let tab = tabs[0];
                let urlObj = parseUrl(tab.url);
                that.query = urlObj['wd'] || urlObj['word'] || urlObj['q'] || urlObj['query'] || urlObj['w'] || "";
                that.query = decodeURI(that.query);
                that.tabIndex = tab.index;
                console.log("[popup] tab info:", tab, "parsed query:", that.query);
            });
            this.$nextTick(() => {
                this.$refs['queryInput'].focus();
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
            if (e.keyCode == 9) {
                if (document.getElementsByClassName("el-autocomplete-suggestion")) {
                    document.getElementsByClassName("el-autocomplete-suggestion")[0].style.display = "block";
                }
                e.preventDefault();
                this.changeSelectId();
                return false;
            }
            return false;
        },
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
                        let data = JSON.parse(res.data.replace(/window.google.ac.h\((.*)\)/, "$1"));
                        let results = Array.isArray(data[1]) ? data[1].map(i => ({ value: i[0] })) : [];
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
                    if (res.status == 200) {
                        let data = JSON.parse(res.data.replace(/.*window.bing.sug\((.*)\/\* pageview_candidate \*\/\)\;/, "$1"));
                        if (data['AS']['FullResults'] <= 0) {
                            return;
                        }
                        let results = data.AS.Results.flatMap(result => result.Suggests.map(suggest => ({ value: suggest.Txt })));
                        const topQ = that.queryMatchHistory.filter(item => item.pin).concat(that.queryMatchHistory.filter((obj) => obj.visitCount && obj.visitCount >= 3)).slice(0, 1);
                        const topQUrls = topQ.map(item => item.url);
                        if (topQ) {
                            that.highlightFirstItem = true;
                        }
                        const lastQ = that.queryMatchHistory.filter((obj) => !topQUrls.includes(obj.url));
                        results = topQ.concat(results.slice(0, 5)).concat(lastQ).concat(results.slice(5))
                        that.tableheight.height = that.getHeight(results.length) + 'px';
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
        querySearch(queryString, cb) {
            if (this.popupSuggestEnabled || this.popupHistoryEnabled) {
                this.suggestionsVisible = true;
                this.queryMatch(queryString, (results) => {
                    if (results && results.length > 0) {
                        this.suggestionBoxHeight = Math.min(300, results.length * 34);
                    } else {
                        this.suggestionBoxHeight = 0;
                    }
                    cb(results);
                });
            } else {
                this.suggestionsVisible = false;
                console.log("no suggestion");
                cb([]);
            }
        },
        queryMatch(queryString, cb) {
            let that = this;
            let bookmarks = [];
            this.queryMatchHistory = [];
            console.log("query match start: " + queryString + " history days: " + this.historyDays);

            if (this.popupSuggestEnabled) {
                this.tableheight.width = largeWidth;
                this.enginesFixedBottom = true;
                if (this.popupSuggestEngine === 'bing') {
                    this.bingSuggest(queryString, cb);
                } else if (this.popupSuggestEngine === 'google') {
                    this.googleSuggest(queryString, cb);
                }
            } else {
                this.enginesFixedBottom = false;
            }

            if (!this.popupHistoryEnabled) {
                this.enginesFixedBottom = false;
                return;
            }
            this.tableheight.width = largeWidth;
            this.enginesFixedBottom = true;
            this.showHistoryDaysTooltip = true;

            chrome.bookmarks.search(queryString, function (results) {
                bookmarks = results.filter((obj) => obj['url'] != null).slice(0, 10);
            })
            let queryFormats = queryString.match(/^[^-]+/);
            let filterStrs = queryString.match(/(?<=-)\w+/g);
            queryString = queryFormats ? queryFormats[0] : queryString;
            chrome.history.search({
                "text": queryString,
                "maxResults": 30,
                "startTime": new Date().getTime() - that.historyDays * 86400000
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
                        if (element.dateAdded) {
                            element['value'] = `⭐️${element['value']}`;
                        }
                        queryString.split(/[\s\+]+/).forEach(iq => {
                            iq = iq.trim();
                            if (iq) {
                                element['value'] = element['value'].replaceAll(iq, `<b>${iq}</b>`);
                            }
                        });
                        let domain = new URL(element['url']).hostname;
                        if (element.visitCount && domain.indexOf(queryString)===0) {
                            element['pin'] = true;
                        }
                        if (element['url'].indexOf("http") != -1) {
                            element['value'] = `<img src="https://icon.horse/icon/${domain}" style="width: 18px; vertical-align: middle;"> ${element['value']}`
                        }
                    });
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
        handleQueryInput() {
            this.$nextTick(() => {
                const suggestionEl = document.querySelector('.el-autocomplete-suggestion');
                if (suggestionEl) {
                    this.suggestionsVisible = suggestionEl.style.display !== 'none';
                    this.updateEngineRowLines();
                }
            });
        },
        onChangeHistoryDays() {
            this.disabledHistoryTooltip=true;
            if (document.getElementsByClassName("el-autocomplete-suggestion")) {
                document.getElementsByClassName("el-autocomplete-suggestion")[0].style.display = "block";
            }
        },
        updateEngineRowLines() {
            this.$nextTick(() => {
                const row = this.$refs.engineRow;
                if (row) {
                    const rowHeight = row.offsetHeight || 1;
                    const lineHeight = 38;
                    this.engineRowLines = Math.max(1, Math.round(rowHeight / lineHeight));
                    
                    if (this.suggestionsVisible && this.enginesFixedBottom) {
                        const suggestionEl = document.querySelector('.el-autocomplete-suggestion');
                        if (suggestionEl) {
                            this.suggestionBoxHeight = suggestionEl.offsetHeight || 0;
                        }
                    }
                }
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
    computed: {
        tableheightWithPadding() {
            if (!this.enginesFixedBottom) {
                return this.tableheight;
            }
            
            const engineHeight = this.engineRowLines * 38 + 16;
            return {
                ...this.tableheight,
                paddingBottom: `${engineHeight}px`
            };
        },
        computedEngineRowStyle() {
            const baseStyle = { 
                marginTop: '12px', 
                display: 'flex', 
                flexWrap: 'wrap', 
                alignItems: 'center'
            };
            
            if (!this.enginesFixedBottom) {
                return {
                    ...baseStyle,
                    width: 'inherit',
                    position: 'relative',
                    zIndex: 100
                };
            }
            
            if (this.suggestionsVisible && this.suggestionBoxHeight > 0) {
                return {
                    ...baseStyle,
                    position: 'absolute',
                    left: 0,
                    bottom: 0,
                    width: '100%',
                    zIndex: 200
                };
            }
            
            return baseStyle;
        },
        historyDaysTooltipStyle() {
            if (!this.enginesFixedBottom) {
                return {
                    position: 'absolute',
                    right: '40px',
                    top: '0px'
                };
            }
            
            if (this.suggestionsVisible) {
                return {
                    position: 'absolute',
                    right: '40px',
                    bottom: `${this.engineRowLines * 38 + 8}px`,
                    zIndex: 300,
                    background: '#fff',
                    padding: '4px 0'
                };
            }
            
            return {
                position: 'fixed',
                right: '40px',
                bottom: `${this.engineRowLines * 38 + 56}px`,
                zIndex: 300,
                background: '#fff',
                padding: '4px 0'
            };
        }
    },
    watch: {
        query: function (query) {
            if (query == "") {
                this.tableheight.height = defaultHeight;
                this.suggestionsVisible = false;
            } else {
                this.$nextTick(() => {
                    const suggestionEl = document.querySelector('.el-autocomplete-suggestion');
                    if (suggestionEl) {
                        this.suggestionsVisible = suggestionEl.style.display !== 'none';
                    }
                });
            }
        },
        engines() {
            this.updateEngineRowLines();
        },
        enginesFixedBottom() {
            this.updateEngineRowLines();
        },
        suggestionsVisible() {
            this.updateEngineRowLines();
        }
    },

    mounted() {
        this.updateEngineRowLines();
    },
    updated() {
        this.updateEngineRowLines();
    }
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

<style>
/* 让 el-autocomplete 的下拉建议面板 z-index 更低，避免遮挡 engine 图标 */
.el-autocomplete-suggestion {
  z-index: 50 !important;
}

.el-tag {
    border-color: #d9ecff;
}

.engine-row-fixed-bottom {
  position: fixed !important;
  left: 0;
  bottom: 0;
  width: 100vw !important;
  background: #fff;
  z-index: 210 !important;
  box-shadow: 0 -2px 8px rgba(0,0,0,0.08);
  padding-bottom: 8px;
  padding-top: 8px;
  /* 新增布局样式 */
  display: flex !important;
}

/* 当搜索建议打开时的样式 */
.suggestions-active .engine-row-fixed-bottom {
  position: absolute !important;
  bottom: 0;
}

/* 新增搜索引擎选项区域样式 */
.engine-options-area {
  flex: 0 0 80%;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  overflow-y: auto;
  max-height: 150px;
}

/* 当历史天数工具提示不显示时，引擎选项占据全宽 */
.engine-options-area.full-width {
  flex: 0 0 100%;
}

/* 新增历史天数区域样式 */
.history-days-area {
  flex: 0 0 20%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 0px;
}

/* 历史天数区域内的滑块样式 */
.history-days-area .el-slider {
  width: 100%;
}
</style>
