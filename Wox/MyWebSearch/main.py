# -*- coding: utf-8 -*-

from wox import Wox
# import logging
import webbrowser

# logging.basicConfig(level=logging.DEBUG,
#                     format='%(asctime)s %(filename)s[line:%(lineno)d] %(levelname)s %(message)s',
#                     datefmt='%a, %d %b %Y %H:%M:%S',
#                     filename="debug.log",
#                     filemode='a')

class Main(Wox):

    # query is default function to receive realtime keystrokes from wox launcher
    def query(self, query):
        results = []
        results.append({
            "Title": f"{query}",
            "SubTitle": "Search Google",
            "IcoPath":"Images/google.png",
            "JsonRPCAction": {
                'method': 'google',
                'parameters': ["{}".format(query)],
                'dontHideAfterAction': False
            }
        })
        results.append({
            "Title": query,
            "SubTitle": "Serach Baidu",
            "IcoPath":"Images/baidu.png",
            "JsonRPCAction": {
                'method': 'baidu',
                'parameters': ["{}".format(query)],
                'dontHideAfterAction': False
            }
        })
        results.append({
            "Title": query,
            "SubTitle": "Search Bing",
            "IcoPath":"Images/bing.png",
            "JsonRPCAction": {
                'method': 'bing',
                'parameters': ["{}".format(query)],
                'dontHideAfterAction': False
            }
        })
        return results

    def google(self, query):
        webbrowser.open(f"https://www.google.com/search?q={query}")
        return None
    
    def baidu(self, query):
        webbrowser.open(f"https://www.baidu.com/#ie=UTF-8&wd={query}")
        return None
    
    def bing(self, query):
        webbrowser.open(f"https://www.bing.com/search?q={query}")
        return None

if __name__ == "__main__":
    Main()
