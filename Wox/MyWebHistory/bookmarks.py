import os
import sys
import logging
import json

# platform_table maps the name of user's OS to a platform code
platform_table = {
        'linux': 0,
        'linux2': 0,
        'darwin': 1,
        'cygwin': 2,
        'win32': 2,
        }

# it supports Linux, MacOS, and Windows platforms.
try:
    user_platformcode = platform_table[sys.platform]
except KeyError:
    class NotAvailableOS(Exception):
        pass
    raise NotAvailableOS("It does not support your OS.")


def get_bookmarks_path(browsers=None) -> dict:
    """Returns the path of the bookmarks"""
    platform_code = user_platformcode
    browser_path_dict = dict()
    # if it is a windows
    if platform_code == 2:
        homepath = os.path.expanduser("~")
        if not browsers or 'edge' in browsers:
            browser_path_dict['edge'] = []
            abs_edge_path = os.path.join(homepath, 'AppData', 'Local', 'Microsoft', 'Edge', 'User Data', 'Default', 'Bookmarks')
            if os.path.exists(abs_edge_path):
                browser_path_dict['edge'].append(abs_edge_path)
            for i in range(5):
                abs_edge_path = os.path.join(homepath, 'AppData', 'Local', 'Microsoft', 'Edge', 'User Data', f'Profile {i}', 'Bookmarks')
                if os.path.exists(abs_edge_path):
                    browser_path_dict['edge'].append(abs_edge_path)
        if not browsers or 'chrome' in browsers:
            browser_path_dict['chrome'] = []
            abs_chrome_path = os.path.join(homepath, 'AppData', 'Local', 'Google', 'Chrome', 'User Data', 'Default', 'Bookmarks')
            if os.path.exists(abs_chrome_path):
                browser_path_dict['chrome'].append(abs_chrome_path)
            for i in range(5):
                abs_chrome_path = os.path.join(homepath, 'AppData', 'Local', 'Google', 'Chrome', 'User Data', f'Profile {i}', 'Bookmarks')
                if os.path.exists(abs_chrome_path):
                    browser_path_dict['chrome'].append(abs_chrome_path)
        return browser_path_dict
        
def filter_bookmarks(bookmark, keyword = "", result = []):
    if bookmark.get('type', '') == 'folder' and bookmark.get('children'):
        for item in bookmark['children']:
            filter_bookmarks(item, keyword, result)
    elif bookmark.get('type', '') == 'url' and (keyword in bookmark.get('name') or keyword in bookmark.get('url')):
        result.append((bookmark.get('url', ''), bookmark.get('name')))

def get_bookmarks(keyword = "", browsers=None) -> dict:
    # browserhistory is a dictionary that stores the query results based on the name of browsers.
    bookmarks = {}

    # call get_database_paths() to get database paths.
    paths2databases = get_bookmarks_path(browsers)

    for browser, paths in paths2databases.items():
        try:
            bookmarks[browser] = []
            for path in paths:
                with open(path, 'r', encoding='utf-8') as f:
                    roots = json.loads(f.read())['roots']
                    for i in ['bookmark_bar', 'other', 'synced']:
                        bookmark = roots[i]
                        filter_bookmarks(bookmark, keyword, bookmarks[browser])
        except Exception as err:
            import traceback
            logging.error(traceback.format_exc())
    
    return bookmarks