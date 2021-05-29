
chrome.contextMenus.onClicked.addListener(function (info, tab) {
	if (info.menuItemId == "baidu_search") {
		window.open('https://www.baidu.com/s?ie=utf-8&wd=' + encodeURIComponent(info.selectionText));
	}
});

chrome.runtime.onInstalled.addListener(function () {
	chrome.contextMenus.create({
		"title": "使用百度搜索“%s”",
		"id": "baidu_search",
		"contexts": ["selection"]
	});
});

function parseUrl(url) {
	let obj = {}
	let reg = /([^?=&]+)=([^?=&]+)/g
	url.replace(reg, function () {
		obj[arguments[1]] = arguments[2]
	})
	return obj
}

chrome.commands.onCommand.addListener(function (command) {
	if (command === 'toggle-search') {
		chrome.tabs.getSelected(null, function (tab) {
			urlObj = parseUrl(tab.url)
			if (tab.url.search("baidu.com/s") != -1) {
				query = urlObj['wd'] || urlObj['word'];
				if (query) {
					chrome.tabs.update({ url: 'https://www.google.com.hk/search?ie=utf-8&q=' + query });
					window.close();
					// window.open('https://www.google.com/search?ie=utf-8&q=' + query);
				}
			}
			if (tab.url.search("google.com") != -1) {
				query = urlObj['q'];
				if (query) {
					chrome.tabs.update({ url: 'https://www.baidu.com/s?ie=utf-8&wd=' + query });
					window.close();
					// window.open('https://www.baidu.com/s?ie=utf-8&wd=' + query);
				}
			}
		});
	}
})