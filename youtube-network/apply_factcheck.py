"""Apply reviewers' corrections to channels.json.

    python3 -I apply_factcheck.py                                   fact-check team (factcheck/results.json)
    python3 -I apply_factcheck.py --rules results/rules-review.json YouTube rules team (only what its skeptic kept)

Each correction must match the current text exactly once, or it is refused and reported: a correction aimed at
wording that has since changed (say, a title the fact-checkers already rewrote) must be re-judged by a person, not
forced in. Every applied change is recorded in the channel's history with its step, reason and sources, so the "why"
behind each line survives. Running it a second time changes nothing: every correction is refused because the wording
it targets is already gone (exit status 1 says so).
"""
import json, sys

chs = json.load(open('channels.json'))
by_n = {c['n']: c for c in chs}

def factcheck_edits():
    """(channel, edit, step) from the fact-check team: final.edits, plus its publish_sources and doubts."""
    for r in json.load(open('factcheck/results.json')):
        final, c = r.get('final') or {}, by_n[r['channel']]
        if final.get('publish_sources'):
            c['sources'] = final['publish_sources']
        if final.get('remaining_doubts'):
            c['open_questions'] = final['remaining_doubts']
        for e in final.get('edits', []):
            yield r['channel'], e, 'fact-check'

def rules_edits(path):
    """(channel, edit, step) from the YouTube rules team: only findings its skeptic kept or added, and only edits to
    the kit's own text. 'setup' edits are wording for the kit page itself and are applied by hand in build.mjs."""
    data = json.load(open(path))
    for r in data.get('result', data):
        if not r.get('channel'):
            continue
        p = r.get('proved') or {}
        for f in (p.get('kept') or []) + (p.get('added') or []):
            ke = f.get('kit_edit') or {}
            where = {'description': 'description', 'titles': 'title', 'title': 'title', 'script': 'script'}.get(ke.get('field'))
            if where and ke.get('quote') and ke.get('replace_with'):
                yield r['channel'], {'where': where, 'quote': ke['quote'], 'replace_with': ke['replace_with'],
                                     'reason': f"{f.get('topic')}: {f.get('action', '')}",
                                     'sources': [f['source_url']] if f.get('source_url') else []}, 'youtube-rules'

def apply(c, where, quote, new):
    """Replace quote with new in one field if it occurs exactly once; return None, or why it was refused."""
    if where == 'title':
        hits = [i for i, t in enumerate(c['titles']) if t == quote]
        if len(hits) != 1:
            return f'{len(hits)} matching titles'
        c['titles'][hits[0]] = new
        if c['scriptTitle'] == quote:
            c['scriptTitle'] = new
        return None
    field = 'description' if where == 'description' else 'script'
    k = c[field].count(quote)
    if k != 1:
        return f'{k} matches in {field}'
    c[field] = c[field].replace(quote, new)
    return None

edits = rules_edits(sys.argv[sys.argv.index('--rules') + 1]) if '--rules' in sys.argv else factcheck_edits()
applied, refused = 0, []
for n, e, step in edits:
    c = by_n[n]
    why_not = apply(c, e['where'], e['quote'], e['replace_with'])
    if why_not:
        refused.append((n, step, e['where'], e['quote'][:90], why_not))
        continue
    c['history'].append({'step': step, 'field': e['where'], 'from': e['quote'], 'to': e['replace_with'],
                         'reason': e['reason'], 'sources': e.get('sources', []), 'confidence': e.get('confidence')})
    applied += 1

json.dump(chs, open('channels.json', 'w'), indent=1, ensure_ascii=False)
print('applied', applied)
for x in refused:
    print('REFUSED ch%s (%s) %s: %r (%s)' % x)
sys.exit(1 if refused else 0)
