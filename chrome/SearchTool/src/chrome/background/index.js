function parseUrl(url) {
    let obj = {}
    let reg = /([^?=&]+)=([^?=&]+)/g
    url.replace(reg, function () {
        obj[arguments[1]] = arguments[2]
    })
    return obj
}

chrome.contextMenus.onClicked.addListener(function (info, tab) {
    chrome.tabs.create({
        url: info.menuItemId.replace('%s', encodeURIComponent(info.selectionText))
    });
});

function addContextMenus() {
    chrome.contextMenus.removeAll();
    let defaultConfig = { 'engines': chrome.i18n.getMessage('defaultEnginesConfig') }; // 默认配置
    chrome.storage.sync.get(defaultConfig, function (items) {
        let engines = JSON.parse(items.engines);
        engines.forEach(function (engine) {
            if (engine.name && engine.url && engine.inRight) {
                chrome.contextMenus.create({
                    "title": chrome.i18n.getMessage('searchFor', engine.name),
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
                "title": chrome.i18n.getMessage('searchFor', engine.name),
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
        chrome.tabs.query({active: true}, function (tabs) {
            let tab = tabs[0];
            let urlObj = parseUrl(tab.url);
            let domain = tab.url.split('/')[2].split('.')[1];
            let query = urlObj['wd'] || urlObj['word'] || urlObj['w'] || urlObj['q'] || urlObj['query'];
            if (query) {
                let defaultConfig = { 'engines': chrome.i18n.getMessage('defaultEnginesConfig') }; // 默认配置
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