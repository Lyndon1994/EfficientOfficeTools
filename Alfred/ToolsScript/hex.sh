# 10进制转16进制
hex=$(echo "obase=16;$1"|bc | tr "A-Z" "a-z")
echo "{\"items\": [{\"title\": \"$hex\", \"arg\": \"$hex\"}] }"