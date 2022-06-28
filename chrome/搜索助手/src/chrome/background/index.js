function parseUrl(url) {
    let obj = {}
    let reg = /([^?=&]+)=([^?=&]+)/g
    url.replace(reg, function () {
        obj[arguments[1]] = arguments[2]
    })
    return obj
}

chrome.contextMenus.onClicked.addListener(function (info, tab) {
    window.open(info.menuItemId.replace('%s', encodeURIComponent(info.selectionText)));
});

function addContextMenus() {
    chrome.contextMenus.removeAll();
    let defaultConfig = { 'engines': '[{\"name\":\"百度\",\"url\":\"https://www.baidu.com/s?wd=%s\",\"inPopup\":true,\"id\":\"1\",\"inShortcuts\":true,\"inRight\":true},{\"name\":\"Google\",\"url\":\"https://www.google.com.hk/search?ie=utf-8&q=%s\",\"inPopup\":true,\"id\":\"2\",\"inRight\":false,\"inShortcuts\":true}]' }; // 默认配置
    chrome.storage.sync.get(defaultConfig, function (items) {
        let engines = JSON.parse(items.engines);
        engines.forEach(function (engine) {
            if (engine.name && engine.url && engine.inRight) {
                chrome.contextMenus.create({
                    "title": "使用" + engine.name + "搜索“%s”",
                    "id": engine.url,
                    "contexts": ["selection"]
                });
            }
        });
    });
}

chrome.runtime.onStartup.addListener(addContextMenus);
chrome.runtime.onInstalled.addListener(addContextMenus);

// 监听来自content-script的消息
chrome.runtime.onMessage.addListener(function(engines, sender, sendResponse)
{
    chrome.contextMenus.removeAll();
    engines.forEach(function (engine) {
        if (engine.name && engine.url && engine.inRight) {
            chrome.contextMenus.create({
                "title": "使用" + engine.name + "搜索“%s”",
                "id": engine.url,
                "contexts": ["selection"]
            });
        }
    });
    sendResponse("done");
    // return true;
});

chrome.commands.onCommand.addListener(function (command) {
    if (command === 'toggle-search') {
        chrome.tabs.getSelected(null, function (tab) {
            let urlObj = parseUrl(tab.url);
            let domain = tab.url.split('/')[2].split('.')[1];
            let query = urlObj['wd'] || urlObj['word'] || urlObj['w'] || urlObj['q'] || urlObj['query'];
            if (query) {
                let defaultConfig = { 'engines': '[{\"name\":\"百度\",\"url\":\"https://www.baidu.com/s?wd=%s\",\"inPopup\":true,\"id\":\"1\",\"inShortcuts\":true,\"inRight\":true},{\"name\":\"Google\",\"url\":\"https://www.google.com.hk/search?ie=utf-8&q=%s\",\"inPopup\":true,\"id\":\"2\",\"inRight\":false,\"inShortcuts\":true}]' }; // 默认配置
                chrome.storage.sync.get(defaultConfig, function (items) {
                    let engines = JSON.parse(items.engines);
                    if (engines.length < 1) {
                        console.log("no engine")
                        return;
                    }
                    let you = false;
                    let over = false;
                    engines.forEach(function (engine) {
                        if (over) {
                            return;
                        }
                        if (engine.name && engine.url && engine.inShortcuts) {
                            if (you === true) {
                                over = true;
                                chrome.tabs.update({ url: engine.url.replace('%s', query) });
                                // window.close(); 关了就不好使了
                                return;
                            }
                            engine.domain = engine.url.split('/')[2].split('.')[1];
                            // 匹配当前url域名是否存在于engines中
                            if (engine.domain == domain) {
                                you = true;
                            }
                        }
                    });
                    if (over === false) {
                        chrome.tabs.update({ url: engines[0].url.replace('%s', query) });
                        // window.close(); 关了就不好使了
                    }
                    return;
                });
            }
        });
    }
})