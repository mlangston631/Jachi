import json,sys
period=sys.argv[1]; files=sys.argv[2:]
seen={}
for f in files:
    for q in json.load(open(f)):
        for v in q['videos']:
            if v.get('outlier') and v['id'] not in seen:
                v['_q']=q['query']; seen[v['id']]=v
for v in sorted(seen.values(), key=lambda v:-v['outlier']):
    if v['outlier']>=2:
        print(f"{v['id']} {v['outlier']:7.2f} {v['views']:>9} {v['subs']:>8} {round(v['length_s']/60)}m {v['age_days']}d | {v['channel']} | {v['title'][:95]}")
