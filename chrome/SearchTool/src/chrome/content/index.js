var addonConfig = {
    engines: chrome.i18n.getMessage('defaultEnginesConfig'),
    select2clipboard: false,
    showTooltip: true,
};
var selectTxt = '';
// 读取数据，第一个参数是指定要读取的key以及设置默认值
chrome.storage.sync.get(addonConfig, function (items) {
    addonConfig.engines = JSON.parse(items.engines);
    addonConfig.select2clipboard = items.select2clipboard;
    addonConfig.showTooltip = items.showTooltip;
    return true;
});

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
    .then(() => {})
    .catch((error) => { console.log(`Copy failed! ${error}`) })
}
function createTooltip(e) {
    var x = e.pageX;
    var y = e.pageY;
    var tooltip = '<div id="strong_search_menu_id" class="addon_xlj_toobar"style="position: absolute; left: {x}px; top: {y}px; z-index: 100000000;">';
    
    var copyTip = chrome.i18n.getMessage('copy');
    if (!addonConfig.select2clipboard) {
        var copyBtn = `<div class="addon_xlj_copy_toobar addon_xlj_button"title="${copyTip}"><div class="addon_xlj_func addon_xlj_link_color" onclick="navigator.clipboard.writeText('${selectTxt}')">${copyTip}</div></div>`;
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
    tooltip = tooltip.replace('{x}', x + 10).replace('{y}', y + 10)
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
    setTimeout(function() {
        removeTooltip();
        if (addonConfig.showTooltip && selectTxt) {
            createTooltip(event);
        }
    }, 200);
});