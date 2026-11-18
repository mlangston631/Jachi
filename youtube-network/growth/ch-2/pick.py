import json,sys
out=sys.argv[1]; ids=sys.argv[2].split(','); files=sys.argv[3:]
seen={}
for f in files:
    for q in json.load(open(f)):
        for v in q['videos']:
            if v['id'] in ids and v['id'] not in seen: seen[v['id']]=v
json.dump([{"query":"curated","videos":list(seen.values())}],open(out,'w'),indent=1)
print(len(seen),'of',len(ids))
