import json,sys
for f in sys.argv[1:]:
    d=json.load(open(f))
    if isinstance(d,dict): d=[d]
    for q in d:
        print("=== ",q.get('query'),q.get('period'))
        for v in q['videos']:
            print(f"{(v.get('outlier') or 0):7.2f} | {v.get('views'):>9} | subs {v.get('subs')} | {v.get('channel')} | {round((v.get('length_s') or 0)/60,1)}m | {v.get('age_days')}d | {v.get('title')}")
