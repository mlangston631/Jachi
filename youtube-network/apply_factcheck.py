"""Apply the fact-checkers' corrections to channels.json.

Each correction must match the current text exactly once, or it is refused and reported: a correction aimed at
wording that has since changed must be re-judged by a person, not forced in. Every applied change is recorded in the
channel's history with the reason and sources, so the "why" behind each line survives. Running it a second time
changes nothing: every correction is refused because the wording it targets is already gone (exit status 1 says so).
"""
import json, sys
chs = json.load(open('channels.json'))
res = json.load(open('factcheck/results.json'))
by_n = {c['n']: c for c in chs}
applied, refused = 0, []
for r in res:
    c, final = by_n[r['channel']], r.get('final') or {}
    for e in final.get('edits', []):
        q, new = e['quote'], e['replace_with']
        if e['where'] == 'title':
            hits = [i for i, t in enumerate(c['titles']) if t == q]
            if len(hits) != 1:
                refused.append((c['n'], e['where'], q, f'{len(hits)} matches')); continue
            c['titles'][hits[0]] = new
            if c['scriptTitle'] == q: c['scriptTitle'] = new
        else:
            k = c['script'].count(q)
            if k != 1:
                refused.append((c['n'], e['where'], q, f'{k} matches')); continue
            c['script'] = c['script'].replace(q, new)
        c['history'].append({'step': 'fact-check', 'field': e['where'], 'from': q, 'to': new,
                             'reason': e['reason'], 'sources': e.get('sources', []), 'confidence': e.get('confidence')})
        applied += 1
    if final.get('publish_sources'):
        c['sources'] = final['publish_sources']
    if final.get('remaining_doubts'):
        c['open_questions'] = final['remaining_doubts']
json.dump(chs, open('channels.json', 'w'), indent=1, ensure_ascii=False)
print('applied', applied)
for x in refused: print('REFUSED ch%s %s: %r (%s)' % x)
sys.exit(1 if refused else 0)
