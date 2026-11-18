#!/usr/bin/env python3
"""Finds when each sentence of a narration section is spoken, without a speech recogniser.

    python3 -I production/align.py narration.wav text.txt     prints sentence start/end times as JSON

The narration was read at an even pace, so a sentence's length in characters predicts its length in time. Pauses are
found with ffmpeg's silencedetect; a small dynamic program then picks, for every sentence end, the pause that best
fits that prediction (each sentence ends in a pause, in order). Cuts placed on these pauses land between sentences.
"""
import json, re, subprocess, sys

def pauses(wav, noise='-38dB', d=0.22):
    r = subprocess.run(['ffmpeg', '-v', 'info', '-i', wav, '-af', f'silencedetect=noise={noise}:d={d}', '-f', 'null', '-'],
                       capture_output=True, text=True).stderr
    out, start = [], None
    for line in r.splitlines():
        m = re.search(r'silence_start: ([\d.]+)', line)
        if m:
            start = float(m.group(1))
        m = re.search(r'silence_end: ([\d.]+) \| silence_duration: ([\d.]+)', line)
        if m and start is not None:
            out.append((start, float(m.group(1)))); start = None
    return out

def duration(wav):
    return float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', wav],
                                capture_output=True, text=True).stdout)

def sentences(text):
    """[(paragraph index, sentence text)], split after . ? ! (and closing quotes) followed by a space."""
    out = []
    for pi, para in enumerate([p for p in text.split('\n\n') if p.strip()]):
        for s in re.split(r'(?:(?<=[.?!])|(?<=[.?!]["”’)]))\s+(?=[A-Z0-9"“$])', para.strip()):
            if s.strip():
                out.append((pi, s.strip()))
    return out

def align(wav, text):
    P = pauses(wav); T = duration(wav)
    lead = P[0][1] if P and P[0][0] < 0.05 else 0.0
    P = [p for p in P if p[0] > 0.05 and p[1] < T - 0.05]
    S = sentences(text)
    n, m = len(S) - 1, len(P)          # n sentence ends to place on pauses (the last one ends with the audio)
    pre = [0.0]
    for x in P:
        pre.append(pre[-1] + x[1] - x[0])
    # Speaking rate from the audio with every pause taken out, spread over the text's characters.
    rate = (T - lead - pre[-1]) / sum(len(x) for _, x in S)
    INF = float('inf')
    def speech(a_end, b_start, ja, jb):  # speaking time between two pauses, without the pauses inside
        return b_start - a_end - (pre[jb] - pre[ja + 1] if jb > ja + 1 else 0.0)
    def cost(i, ja, jb):
        a_end = lead if ja < 0 else P[ja][1]
        sp = speech(a_end, P[jb][0], ja if ja >= 0 else -1, jb) if ja >= 0 else P[jb][0] - lead - pre[jb]
        pred = rate * len(S[i][1])
        return (sp - pred) ** 2 / max(pred, 0.5) - 0.6 * min(P[jb][1] - P[jb][0], 1.4)
    best = [[INF] * m for _ in range(n)]; back = [[-1] * m for _ in range(n)]
    for j in range(m):
        best[0][j] = cost(0, -1, j)
    for i in range(1, n):
        for j in range(i, m):
            for k in range(max(0, j - 25), j):
                if best[i - 1][k] < INF:
                    v = best[i - 1][k] + cost(i, k, j)
                    if v < best[i][j]:
                        best[i][j], back[i][j] = v, k
    picks = []
    if n > 0:
        # The last sentence runs from its pause to the end of the audio: include that in the choice.
        def tail(j):
            return (T - P[j][1] - (pre[m] - pre[j + 1]) - rate * len(S[-1][1])) ** 2 / max(rate * len(S[-1][1]), 0.5)
        j = min(range(m), key=lambda j: best[n - 1][j] + tail(j))
        for i in range(n - 1, -1, -1):
            picks.append(j); j = back[i][j]
        picks.reverse()
    res, t0 = [], lead
    for k, (pi, s) in enumerate(S):
        if k < n:
            a, b = P[picks[k]]
            res.append({'para': pi, 'text': s, 'start': round(t0, 3), 'end': round(a, 3)}); t0 = b
        else:
            res.append({'para': pi, 'text': s, 'start': round(t0, 3), 'end': round(T, 3)})
    return {'duration': T, 'sentences': res, 'pauses': P}

if __name__ == '__main__':
    print(json.dumps(align(sys.argv[1], open(sys.argv[2]).read()), indent=1))
