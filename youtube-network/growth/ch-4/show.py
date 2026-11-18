import json,sys
for f in sys.argv[1:]:
    for q in json.load(open(f)):
        print(f"\n=== {q['query']} [{q['period']}] {q.get('error','')}")
        for v in q.get('videos',[]):
            L = round(v['length_s']/60,1) if v.get('length_s') else None
            print(f"{str(v.get('outlier')):>7} | {v.get('views') or 0:>10,} v | {str(v.get('subs')):>9} s | {str(v.get('age_days')):>4}d | {str(L):>5}m | {v['channel'][:28]:28} | {v['title'][:95]}")
