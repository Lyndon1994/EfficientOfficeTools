# -*- coding: utf-8 -*-
# 固定写法，导入相关类库和函数
from util import WoxEx, WoxAPI, load_module, Log

# 统一加载模块
with load_module():
    import browserhistory as bh
    import bookmarks
    import vschistory
    import webbrowser
    import os

class SearchBrowserHistory(WoxEx):

    def add_vschistory(self, query, results):
        history = vschistory.get_vschistory(query)
        for item in history:
            results.append({
                "Title": item[1].split('/')[-1],
                "SubTitle": item[0],
                "IcoPath":"Images/ms-visual-studio-code.png",
                "JsonRPCAction": {
                    'method': 'openvsc',
                    'parameters': [item[0], item[2]],
                    'dontHideAfterAction': False
                }
            })

    # query is default function to receive realtime keystrokes from wox launcher
    def query(self, query):
        query = query.lower()
        results = []
        try:
            qs = query.split()
            if qs[0] == 'vsc':
                if len(qs) > 1:
                    self.add_vschistory(' '.join(qs[1:]), results)
                else:
                    self.add_vschistory("", results)
                return results
            self.add_vschistory(query, results)

            history = bookmarks.get_bookmarks(query, ['edge'])
            for item in history.get('edge', []):
                results.append({
                    "Title": item[1],
                    "SubTitle": item[0],
                    "IcoPath":"Images/favorite.png",
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
                    "IcoPath":"Images/browser.png",
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

    def openvsc(self, url, remote=None):
        try:
            if remote:
                os.popen(f"code --remote {remote} {url}")
            else:
                os.popen(f"code {url}")
        except Exception as err:
            import traceback
            Log.error(traceback.format_exc())
        return None
    
if __name__ == "__main__":
    SearchBrowserHistory()
