import os
import sqlite3
import sys
import logging
import json
import urllib.parse

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


def get_vscdb_path() -> str:
    """Returns the path of the bookmarks"""
    platform_code = user_platformcode
    # if it is a windows
    if platform_code == 2:
        homepath = os.path.expanduser("~")
        # C:/Users/yilin3/AppData/Roaming/Code/User/globalStorage/state.vscdb.backup
        abs_path = os.path.join(
            homepath, 'AppData', 'Roaming', 'Code', 'User', 'globalStorage', 'state.vscdb.backup')
        if os.path.exists(abs_path):
            return abs_path
        return ""

def get_vschistory(keyword="") -> list:
    # browserhistory is a dictionary that stores the query results based on the name of browsers.
    history = []

    # call get_database_paths() to get database paths.
    paths2databases = get_vscdb_path()
    if not paths2databases:
        return history

    try:
        conn = sqlite3.connect(paths2databases)
        cursor = conn.cursor()
        # cursor.execute('pragma encoding=utf8')
        _SQL = """select value as result from ItemTable where key = 'history.recentlyOpenedPathsList'"""
        # query_result will store the result of query
        cursor.execute(_SQL)
        query_result = cursor.fetchall()
        if len(query_result) > 0 and len(query_result[0]) > 0:
            result = query_result[0][0]
            for item in json.loads(result)['entries']:
                if keyword == "":
                    if 'folderUri' in item:
                        history.append((
                            trip_name(item['folderUri']), 
                            trip_name(item.get('label', item['folderUri'])), 
                            item.get('remoteAuthority')
                        ))
                    elif 'fileUri' in item:
                        history.append((
                            trip_name(item['fileUri']), 
                            trip_name(item['fileUri']), 
                            item.get('remoteAuthority')))
                    continue
                if keyword in item.get('folderUri', '').lower():
                    history.append((
                        trip_name(item['folderUri']), 
                        trip_name(item.get('label', item['folderUri'])), 
                        item.get('remoteAuthority')
                    ))
                elif keyword in item.get('fileUri', '').lower():
                    history.append((
                        trip_name(item['fileUri']), 
                        trip_name(item['fileUri']), 
                        item.get('remoteAuthority')))

        # close cursor and connector
        cursor.close()
        conn.close()
        # put the query result based on the name of browsers.
    except Exception as err:
        import traceback
        logging.error(traceback.format_exc())

    return history

def trip_name(url):
    return urllib.parse.unquote(url).replace('file:///', '')