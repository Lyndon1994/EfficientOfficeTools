var addonConfig = {
  engines: chrome.i18n.getMessage("defaultEnginesConfig"),
  select2clipboard: false,
  showTooltip: false,
  showTopSearchSwitch: true,
  searchInNewTab: true,
  themeStyle: "icon",
  themeColor: "rgba(144, 238, 144, 0.56)",
  textColor: "#202124",
};
var selectTxt = "";

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
  addonConfig.searchInNewTab = items.searchInNewTab;
  addonConfig.themeColor = items.themeColor;

  // 展示顶部切换菜单
  if (addonConfig.showTopSearchSwitch) {
    var domains = document.domain.split(".");
    var needCreateTopTooltip = false;
    if (domains.length >= 2) {
      var domain = domains[1];
      if (domains.length == 2 || domain == "com") {
        domain = domains[0];
      }
      addonConfig.engines.forEach((engine) => {
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
  var tooltipEl = document.getElementById("addon_toptooltip");
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
  var tooltipEl = document.getElementById("addon_tooltip");
  if (tooltipEl) {
    tooltipEl.remove();
  }
}
function copySelectTxt() {
  navigator.clipboard
    .writeText(selectTxt)
    .then(() => {})
    .catch((error) => {
      console.log(`Copy failed! ${error}`);
    });
}
function createTooltip(e) {
  var x = e.pageX;
  var y = e.pageY;
  var tooltip = `<div id="strong_search_menu_id" class="addon_xlj_toobar"style="position: absolute; left: {x}px; top: {y}px; z-index: 100000000;background-color: ${addonConfig.themeColor}">`;

  var reg = /(\w+[^\s]+(\.[^\s]+){1,})/;
  var ret = reg.exec(selectTxt);
  if (ret) {
    var url = ret[1].trim();
    var openTip = chrome.i18n.getMessage("open");
    var copyBtn = `<a class="addon_xlj_copy_toobar addon_xlj_button" style="color:${addonConfig.textColor};" target="${addonConfig.searchInNewTab ? "_blank" : "_self"}" href="${url}">
        <img class="addon_xlj_search_icon" src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/PjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+PHN2ZyB0PSIxNjUxNTgwNDU1NTcwIiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9Ijk0MiIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48ZGVmcz48c3R5bGUgdHlwZT0idGV4dC9jc3MiPjwvc3R5bGU+PC9kZWZzPjxwYXRoIGQ9Ik04MzIgMTI4SDY0MHY2NGgxNDYuNzUyTDUyMS4zNzYgNDU3LjM3Nmw0NS4yNDggNDUuMjQ4TDgzMiAyMzcuMjQ4VjM4NGg2NFYxMjh6IiBmaWxsPSIjZmZmZmZmIiBwLWlkPSI5NDMiPjwvcGF0aD48cGF0aCBkPSJNNzY4IDgzMkgxOTJWMjU2aDM1MnYtNjRIMTYwYTMyIDMyIDAgMCAwLTMyIDMydjY0MGEzMiAzMiAwIDAgMCAzMiAzMmg2NDBhMzIgMzIgMCAwIDAgMzItMzJWNDgwaC02NHYzNTJ6IiBmaWxsPSIjZmZmZmZmIiBwLWlkPSI5NDQiPjwvcGF0aD48L3N2Zz4=">
        <div class="addon_xlj_func">${openTip}</div></a>`;
    tooltip = tooltip + copyBtn;
  }

  var copyTip = chrome.i18n.getMessage("copy");
  if (!addonConfig.select2clipboard) {
    // 选择合适的 emoji（emoji 本身适配深浅色背景）
    let copyIconEmoji = "📋";
    copyBtn = `<div class="addon_xlj_copy_toobar addon_xlj_button" style="font-size:20px;line-height:22px;cursor:pointer;" title="${copyTip}" onclick="navigator.clipboard.writeText('${selectTxt}')">
        ${copyIconEmoji}
      </div>`;
    tooltip = tooltip + copyBtn;
  }

  var searchContent = '<div class="addon_xlj_button">';
  var inTooltipCount = 0;
  addonConfig.engines.forEach((engine) => {
    if (engine.name && engine.url && engine.inTooltip) {
      inTooltipCount += 1;
      var url = engine.url.replace("%s", encodeURIComponent(selectTxt));
      if (addonConfig.themeStyle == "text") {
        searchContent += `<div class="addon_xlj_search_parts_engine addon_xlj_link_color" data-url="${url}" title="${engine.name}"><a style="color:${addonConfig.textColor};" target="${addonConfig.searchInNewTab ? "_blank" : "_self"}" href="${url}">${engine.name}</a></div>`;
      } else {
        var icon = chrome.runtime.getURL(engine.icon);
        if (engine.icon.indexOf("http") !== -1) {
          icon = engine.icon;
        }
        searchContent += `<a class="addon_xlj_search_parts_engine style="color:beige;" target="${addonConfig.searchInNewTab ? "_blank" : "_self"}" href="${url}"><img style="width: 22px; height: 22px;" src="${icon}" alt="${engine.name}"></a>`;
      }
    }
  });
  searchContent += "</div>";
  if (inTooltipCount > 0) {
    tooltip += searchContent;
  }
  if (inTooltipCount == 0 && addonConfig.select2clipboard) {
    return;
  }

  tooltip += "</div>";
  tooltip = tooltip.replace("{x}", x + 5).replace("{y}", y + 20);
  var tooltipEl = document.createElement("div");
  tooltipEl.id = "addon_tooltip";
  tooltipEl.innerHTML = tooltip;
  document.body.appendChild(tooltipEl);
}

document.addEventListener("mouseup", function (event) {
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
  var pinTooltip = `<div id="strong_search_menu_id" class="addon_xlj_toobar" style="position: fixed; left: 60%; top: 0px; z-index: 100000000;background-color: ${addonConfig.themeColor}">`;
  var inTooltipCount = 0;
  var searchContent = '<div class="addon_xlj_button">';
  if (addonConfig.themeColor != "black") {
    searchContent = '<div style="border-right: 0px;" class="addon_xlj_button">';
  }
  var urlObj = parseUrl(window.location.href);
  var query =
    urlObj["wd"] ||
    urlObj["word"] ||
    urlObj["query"] ||
    urlObj["q"] ||
    urlObj["w"] ||
    "";
  query = decodeURI(query);
  if (!query) {
    return;
  }
  addonConfig.engines.forEach((engine) => {
    if (engine.name && engine.url && engine.inPopup) {
      inTooltipCount += 1;
      var url = engine.url.replace("%s", query);
      // searchContent += `<div class="addon_xlj_search_parts_engine addon_xlj_link_color" data-url="${url}" title="${engine.name}" onclick="window.open('${url}')">${engine.name}</div>`;
      if (addonConfig.themeStyle == "text") {
        searchContent += `<div class="addon_xlj_search_parts_engine addon_xlj_link_color" data-url="${url}" title="${engine.name}"><a style="color:${addonConfig.textColor};" target="${addonConfig.searchInNewTab ? "_blank" : "_self"}" href="${url}">${engine.name}</a></div>`;
      } else {
        var icon = chrome.runtime.getURL(engine.icon);
        if (engine.icon.indexOf("http") !== -1) {
          icon = engine.icon;
        }
        searchContent += `<a class="addon_xlj_search_parts_engine style="color:beige;" target="${addonConfig.searchInNewTab ? "_blank" : "_self"}" href="${url}"><img style="width: 22px; height: 22px;" src="${icon}" alt="${engine.name}"></a>`;
      }
    }
  });
  searchContent += "</div>";
  if (inTooltipCount <= 0) {
    return;
  }
  pinTooltip += searchContent;
  if (addonConfig.themeColor != "black") {
    pinTooltip += `<div class="addon_xlj_copy_toobar addon_xlj_button"title="close" onclick="document.getElementById('addon_toptooltip').remove()">
        <div class="addon_xlj_func">X</div></div>`;
  } else {
    pinTooltip += `<div class="addon_xlj_copy_toobar addon_xlj_button"title="close" onclick="document.getElementById('addon_toptooltip').remove()">
        <div class="addon_xlj_func addon_xlj_link_color">X</div></div>`;
  }

  pinTooltip += "</div>";
  var tooltipEl = document.createElement("div");
  tooltipEl.id = "addon_toptooltip";
  tooltipEl.innerHTML = pinTooltip;
  document.body.appendChild(tooltipEl);
}

function parseUrl(url) {
  var obj = {};
  var reg = /([^?=&]+)=([^?=&]+)/g;
  url.replace(reg, function () {
    obj[arguments[1]] = arguments[2];
  });
  return obj;
}
