import urllib
import sys
import json

# urlencode

query = sys.argv[1] if len(sys.argv) > 1 else ""



output = urllib.quote(query)

items = []
item = {}
item['title'] = output
item['arg'] = output
items.append(item)

res = {
   "items": items
}

print(json.dumps(res))