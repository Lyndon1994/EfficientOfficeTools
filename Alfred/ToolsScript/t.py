from subprocess import Popen, PIPE
import sys
import json

query = sys.argv[1] if len(sys.argv) > 1 else ""

if query[0] == '1':
	query = '@' + query

formats = [
    "%Y-%m-%d %H:%M:%S",
    "%Y%m%d %H:%M:%S",
    "%Y%m%d",
    "%H:%M:%S",
    "%s"
]

items = []

for format in formats:
    process = Popen(["/usr/local/bin/gdate","-d",query,"+"+format], stdout=PIPE)
    (output, err) = process.communicate()
    exit_code = process.wait()
    output = output.replace("\n", "")
    item = {}
    item['title'] = output
    item['arg'] = output
    items.append(item)

res = {
   "items": items
}

print(json.dumps(res))