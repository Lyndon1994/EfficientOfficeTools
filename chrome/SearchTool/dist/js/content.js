var addonConfig = {
    engines: chrome.i18n.getMessage('defaultEnginesConfig'),
    select2clipboard: false,
    showTooltip: false,
    showTopSearchSwitch: true,
};
var selectTxt = '';

var lasturl = window.location.href;
function isHashChanged() {
    var cururl = window.location.href;
    if (lasturl == cururl) {
        return false;
    }
    lasturl = cururl;
    return true;
}

// 读取数据，第一个参数是指定要读取的key以及设置默认值
chrome.storage.sync.get(addonConfig, function (items) {
    addonConfig.engines = JSON.parse(items.engines);
    addonConfig.select2clipboard = items.select2clipboard;
    addonConfig.showTooltip = items.showTooltip;
    addonConfig.showTopSearchSwitch = items.showTopSearchSwitch;

    // 展示顶部切换菜单
    if (addonConfig.showTopSearchSwitch) {
        var domains = document.domain.split('.')
        var needCreateTopTooltip = false;
        if (domains.length >= 2) {
            var domain = domains[1];
            if (domains.length == 2 || domain == "com") {
                domain = domains[0];
            }
            addonConfig.engines.forEach(engine => {
                if (engine.url && engine.inPopup && engine.url.indexOf(domain) != -1) {
                    needCreateTopTooltip = true;
                }
            });
            if (domain == "baidu" || domain == "google") {
                // baidu或者Google搜索词变化后网页不刷新，onhashchange也监听不了
                setInterval(function () {
                    var ischanged = isHashChanged();
                    if (ischanged) {
                        hashChange();
                    }
                }, 3000);
            }
        }
        if (needCreateTopTooltip) {
            createTopTooltip();
        }
    }
    return true;
});


//监听触发操作
function hashChange() {
    var tooltipEl = document.getElementById('addon_toptooltip');
    if (tooltipEl) {
        tooltipEl.remove();
    }
    createTopTooltip();
}

// 获取选中的文本
function getSelectText() {
    var txt = "";
    if (document.selection) {
        txt = document.selection.createRange().text;
    } else {
        txt = document.getSelection();
        //txt = window.getSelection();
    }
    return txt.toString().trim();
}
function removeTooltip() {
    var tooltipEl = document.getElementById('addon_tooltip');
    if (tooltipEl) {
        tooltipEl.remove();
    }
}
function copySelectTxt() {
    navigator.clipboard.writeText(selectTxt)
        .then(() => { })
        .catch((error) => { console.log(`Copy failed! ${error}`) })
}
function createTooltip(e) {
    var x = e.pageX;
    var y = e.pageY;
    var tooltip = '<div id="strong_search_menu_id" class="addon_xlj_toobar"style="position: absolute; left: {x}px; top: {y}px; z-index: 100000000;">';

    var reg = /(\w+[^\s]+(\.[^\s]+){1,})/;
    var ret = reg.exec(selectTxt);
    if (ret) {
        var url = ret[1].trim();
        var openTip = chrome.i18n.getMessage('open');
        var copyBtn = `<div class="addon_xlj_copy_toobar addon_xlj_button"title="${openTip} ${url}" onclick="window.open('${url}')">
        <img class="addon_xlj_search_icon" src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/PjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+PHN2ZyB0PSIxNjUxNTgwNDU1NTcwIiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9Ijk0MiIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48ZGVmcz48c3R5bGUgdHlwZT0idGV4dC9jc3MiPjwvc3R5bGU+PC9kZWZzPjxwYXRoIGQ9Ik04MzIgMTI4SDY0MHY2NGgxNDYuNzUyTDUyMS4zNzYgNDU3LjM3Nmw0NS4yNDggNDUuMjQ4TDgzMiAyMzcuMjQ4VjM4NGg2NFYxMjh6IiBmaWxsPSIjZmZmZmZmIiBwLWlkPSI5NDMiPjwvcGF0aD48cGF0aCBkPSJNNzY4IDgzMkgxOTJWMjU2aDM1MnYtNjRIMTYwYTMyIDMyIDAgMCAwLTMyIDMydjY0MGEzMiAzMiAwIDAgMCAzMiAzMmg2NDBhMzIgMzIgMCAwIDAgMzItMzJWNDgwaC02NHYzNTJ6IiBmaWxsPSIjZmZmZmZmIiBwLWlkPSI5NDQiPjwvcGF0aD48L3N2Zz4=">
        <div class="addon_xlj_func addon_xlj_link_color">${openTip}</div></div>`;
        tooltip = tooltip + copyBtn;
    }

    var copyTip = chrome.i18n.getMessage('copy');
    if (!addonConfig.select2clipboard) {
        var copyBtn = `<div class="addon_xlj_copy_toobar addon_xlj_button"title="${copyTip}" onclick="navigator.clipboard.writeText('${selectTxt}')">
        <img class="addon_xlj_search_icon" src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/PjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+PHN2ZyB0PSIxNjU1Nzc5ODc4NDY4IiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjE0MTciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCI+PGRlZnM+PHN0eWxlIHR5cGU9InRleHQvY3NzIj5AZm9udC1mYWNlIHsgZm9udC1mYW1pbHk6IGZlZWRiYWNrLWljb25mb250OyBzcmM6IHVybCgiLy9hdC5hbGljZG4uY29tL3QvZm9udF8xMDMxMTU4X3U2OXc4eWh4ZHUud29mZjI/dD0xNjMwMDMzNzU5OTQ0IikgZm9ybWF0KCJ3b2ZmMiIpLCB1cmwoIi8vYXQuYWxpY2RuLmNvbS90L2ZvbnRfMTAzMTE1OF91Njl3OHloeGR1LndvZmY/dD0xNjMwMDMzNzU5OTQ0IikgZm9ybWF0KCJ3b2ZmIiksIHVybCgiLy9hdC5hbGljZG4uY29tL3QvZm9udF8xMDMxMTU4X3U2OXc4eWh4ZHUudHRmP3Q9MTYzMDAzMzc1OTk0NCIpIGZvcm1hdCgidHJ1ZXR5cGUiKTsgfQo8L3N0eWxlPjwvZGVmcz48cGF0aCBkPSJNMzc3IDQzMmgzNDlhOCA4IDAgMCAxIDggOHY0OGE4IDggMCAwIDEtOCA4SDM3N2E4IDggMCAwIDEtOC04di00OGE4IDggMCAwIDEgOC04eiBtMCAxNjBoMjU4YTggOCAwIDAgMSA4IDh2NDhhOCA4IDAgMCAxLTggOEgzNzdhOCA4IDAgMCAxLTgtOHYtNDhhOCA4IDAgMCAxIDgtOHogbS02NS0yODB2NTc2aDQ4MFYzMTJIMzEyeiBtLTQwLTcyaDU2MGMxNy42NzMgMCAzMiAxNC4zMjcgMzIgMzJ2NjU2YzAgMTcuNjczLTE0LjMyNyAzMi0zMiAzMkgyNzJjLTE3LjY3MyAwLTMyLTE0LjMyNy0zMi0zMlYyNzJjMC0xNy42NzMgMTQuMzI3LTMyIDMyLTMyeiBtLTg4LTU2djY2NGE4IDggMCAwIDEtOCA4aC01NmE4IDggMCAwIDEtOC04VjE0NGMwLTE3LjY3MyAxNC4zMjctMzIgMzItMzJoNjMyYTggOCAwIDAgMSA4IDh2NTZhOCA4IDAgMCAxLTggOEgxODR6IiBmaWxsPSIjZmZmZmZmIiBwLWlkPSIxNDE4Ij48L3BhdGg+PC9zdmc+">
        <div class="addon_xlj_func addon_xlj_link_color">${copyTip}</div></div>`;
        tooltip = tooltip + copyBtn;
    }

    var searchContent = '<div class="addon_xlj_button">';
    var inTooltipCount = 0;
    addonConfig.engines.forEach(engine => {
        if (engine.name && engine.url && engine.inTooltip) {
            inTooltipCount += 1;
            var url = engine.url.replace('%s', encodeURIComponent(selectTxt));
            searchContent += `<div class="addon_xlj_search_parts_engine addon_xlj_link_color" data-url="${url}" title="${engine.name}" onclick="window.open('${url}')">${engine.name}</div>`;
        }
    });
    searchContent += '</div>';
    if (inTooltipCount > 0) {
        tooltip += searchContent;
    }
    if (inTooltipCount == 0 && addonConfig.select2clipboard) {
        return;
    }

    tooltip += '</div>';
    tooltip = tooltip.replace('{x}', x + 5).replace('{y}', y + 20)
    var tooltipEl = document.createElement("div");
    tooltipEl.id = 'addon_tooltip';
    tooltipEl.innerHTML = tooltip;
    document.body.appendChild(tooltipEl);
}

document.addEventListener('mouseup', function (event) {
    selectTxt = getSelectText();
    if (addonConfig.select2clipboard) {
        copySelectTxt();
    }
    // 需要等一会，否则点击菜单的时候，这里就remove了，导致点击不了。
    setTimeout(function () {
        removeTooltip();
        if (addonConfig.showTooltip && selectTxt) {
            createTooltip(event);
        }
    }, 100);
});

function createTopTooltip() {
    console.log("createTopTooltip");
    var pinTooltip = '<div id="strong_search_menu_id" class="addon_xlj_toobar"style="position: fixed; left: 60%; top: 0px; z-index: 100000000;">';
    var inTooltipCount = 0;
    var searchContent = '<div class="addon_xlj_button">';
    var urlObj = parseUrl(window.location.href);
    var query = urlObj['wd'] || urlObj['word'] || urlObj['query'] || urlObj['q'] || urlObj['w'] || "";
    query = decodeURI(query);
    if (!query) {
        return;
    }
    addonConfig.engines.forEach(engine => {
        if (engine.name && engine.url && engine.inPopup) {
            inTooltipCount += 1;
            var url = engine.url.replace('%s', encodeURIComponent(query));
            searchContent += `<div class="addon_xlj_search_parts_engine addon_xlj_link_color" data-url="${url}" title="${engine.name}" onclick="window.open('${url}')">${engine.name}</div>`;
        }
    });
    searchContent += '</div>';
    if (inTooltipCount <= 0) {
        return;
    }
    pinTooltip += searchContent;
    pinTooltip += `<div class="addon_xlj_copy_toobar addon_xlj_button"title="close" onclick="document.getElementById('addon_toptooltip').remove()">
        <div class="addon_xlj_func addon_xlj_link_color">X</div></div>`;

    pinTooltip += '</div>';
    var tooltipEl = document.createElement("div");
    tooltipEl.id = 'addon_toptooltip';
    tooltipEl.innerHTML = pinTooltip;
    document.body.appendChild(tooltipEl);
}

function parseUrl(url) {
    var obj = {}
    var reg = /([^?=&]+)=([^?=&]+)/g
    url.replace(reg, function () {
        obj[arguments[1]] = arguments[2]
    })
    return obj
}
