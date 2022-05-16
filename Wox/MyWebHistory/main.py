# -*- coding: utf-8 -*-
# 固定写法，导入相关类库和函数
from util import WoxEx, WoxAPI, load_module, Log

# 统一加载模块
with load_module():
    import browserhistory as bh
    import bookmarks
    import webbrowser
    from urllib.parse import urlparse

class SearchBrowserHistory(WoxEx):

    # query is default function to receive realtime keystrokes from wox launcher
    def query(self, query):
        results = []
        try:
            history = bookmarks.get_bookmarks(query, ['edge'])
            for item in history.get('edge', []):
                results.append({
                    "Title": item[1],
                    "SubTitle": item[0],
                    "IcoPath":"Images/web_search.png",
                    "JsonRPCAction": {
                        'method': 'openlink',
                        'parameters': ["{}".format(item[0])],
                        'dontHideAfterAction': False
                    }
                })

            history = bh.get_browserhistory(query, ['edge'])
            for item in history.get('edge', []):
                results.append({
                    "Title": item[1],
                    "SubTitle": item[0],
                    "IcoPath":"Images/web_search.png",
                    "JsonRPCAction": {
                        'method': 'openlink',
                        'parameters': ["{}".format(item[0])],
                        'dontHideAfterAction': False
                    }
                })
        except Exception as err:
            Log.error(err)
        return results

    def openlink(self, url):
        webbrowser.open(url)
        return None
    
if __name__ == "__main__":
    SearchBrowserHistory()
