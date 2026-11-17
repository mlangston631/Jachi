#!/usr/bin/env python3
"""Reads a YouTube channel page by handle and prints what YouTube shows publicly: id, title, handle, description,
keywords, subscriber/video counts. Used to confirm a channel really exists and was set up as the kit says."""
import json, re, subprocess, sys
UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'
def page(handle):
    r = subprocess.run(['curl', '-s', '-m', '30', '-A', UA, '-H', 'Accept-Language: en-US,en;q=0.9', '-H', 'Cookie: SOCS=CAI; CONSENT=YES+1',
                        '-w', '\n%{http_code}', f'https://www.youtube.com/{handle}'], capture_output=True, text=True)
    body, _, code = r.stdout.rpartition('\n')
    if code == '404': return {'handle': handle, 'exists': False}
    m = re.search(r'var ytInitialData = (\{.*?\});</script>', body, re.S)
    if code != '200' or not m: return {'handle': handle, 'exists': None, 'why': f'HTTP {code}, no channel data'}
    d = json.loads(m.group(1)); md = d.get('metadata', {}).get('channelMetadataRenderer', {})
    return {'handle': handle, 'exists': True, 'id': md.get('externalId'), 'title': md.get('title'),
            'url': md.get('vanityChannelUrl'), 'description': md.get('description'), 'keywords': md.get('keywords'),
            'family_safe': md.get('isFamilySafe')}
print(json.dumps([page(h) for h in sys.argv[1:]], indent=1, ensure_ascii=False))
