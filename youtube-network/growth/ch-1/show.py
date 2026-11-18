import json,sys
for f in sys.argv[1:]:
    d=json.load(open(f))
    for q in d:
        print(f"\n=== {q['query']} ({q['period']}) n={len(q['videos'])}")
        for v in q['videos']:
            o=v.get('outlier')
            print(f"{(o if o is not None else '-'):>7} | {v['views']:>9} | {v.get('subs') or '-':>9} | {v.get('age_days')}d | {round((v.get('length_s') or 0)/60,1)}m | {v['channel'][:24]:24} | {v['title'][:95]}")
