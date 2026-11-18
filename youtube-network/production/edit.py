#!/usr/bin/env python3
"""Cuts a documentary sequence from an edit decision list (EDL), with ffmpeg.

    python3 -I production/edit.py production/ep01-petters/coldopen.json

The EDL (JSON) names the narration, the shots in order (each a still with a slow camera move, or a video clip), and
text overlays timed against the narration. Every shot is rendered at 1920x1080, 30 fps, with the channel's look
(film grain, vignette), then cut together and laid over the narration plus a quiet drone generated here, so the
sequence carries no third-party music. The final encode is capped at about 12 Mbps (YouTube's recommended range for
1080p30), since grain inflates file size at high quality settings. Shots marked "recreation" get a "Recreation" label, as the channel's rules
require for illustrative scenes.
"""
import hashlib, json, os, subprocess, sys
from concurrent.futures import ThreadPoolExecutor
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import mg

W, H, FPS = 1920, 1080, 30
LOOK_VERSION = 2
MONO = '/usr/share/fonts/truetype/jetbrains-mono/JetBrainsMono-Bold.ttf'
SANS = '/usr/share/fonts/opentype/inter/Inter-SemiBold.otf'
MONO_M = '/usr/share/fonts/truetype/jetbrains-mono/JetBrainsMono-Medium.ttf'

def run(args):
    r = subprocess.run(['ffmpeg', '-v', 'error', '-y'] + args, capture_output=True, text=True)
    if r.returncode:
        sys.exit('ffmpeg failed:\n' + r.stderr[-3000:])

def esc(t):
    """Text for drawtext, escaped for ffmpeg's filter syntax."""
    return t.replace('\\', '\\\\').replace("'", "’").replace(':', '\\:').replace('%', '\\%').replace(',', '\\,')

def look(chain):
    """The channel's finishing: slight contrast, vignette, fine grain."""
    return chain + ',eq=contrast=1.06:saturation=0.92,vignette=PI/5,noise=alls=5:allf=t,format=yuv420p'

def overlays(shot, start):
    """drawtext filters for a shot; times in the EDL are on the narration clock, converted to shot time."""
    out = []
    lab = shot.get('label') or ('Recreation' if shot.get('recreation') else None)
    if lab and not isinstance(shot['src'], dict):
        # The channel's label: bottom-left, mono 500, 28 px, paper white on a 60% near-black bar (shot list 1.9).
        out.append(f"drawtext=fontfile={MONO_M}:text='{esc(lab)}':fontsize=28:fontcolor=0xF4F2EA@0.9:x=74:y=h-96:box=1:boxcolor=0x1C1D20@0.6:boxborderw=14")
    for t in shot.get('text', []):
        a = max(0.0, t.get('at', start) - start)
        fade = f"alpha='if(lt(t,{a}),0,min(1,(t-{a})/0.35))'"
        font = MONO if t.get('mono', True) else SANS
        x = t.get('x', '(w-text_w)/2'); y = t.get('y', '(h-text_h)/2')
        box = ':box=1:boxcolor=0x1C1D20@0.6:boxborderw=18' if t.get('box') else ''
        out.append(f"drawtext=fontfile={font}:text='{esc(t['text'])}':fontsize={t.get('size', 64)}:fontcolor={t.get('color', '0xF4F2EA')}:x={x}:y={y}:{fade}{box}")
    return ','.join(out)

def render_shot(i, shot, start, dur, base, tmp):
    key = hashlib.sha1(json.dumps([shot, round(start, 3), round(dur, 3), LOOK_VERSION], sort_keys=True).encode()).hexdigest()[:12]
    out = os.path.join(tmp, f'shot{i:03d}-{key}.mp4')
    if os.path.exists(out):          # unchanged shot: reuse the earlier render
        return out
    if isinstance(shot['src'], dict):  # a motion graphic, drawn to the exact length of the shot
        spec = dict(shot['src']['mg'])
        if shot.get('label'):
            spec['label'] = shot['label']
        src = os.path.join(tmp, f'mg-{key}.mp4')
        mg.render(spec, dur, src)
    else:
        src = os.path.join(base, shot['src'])
    frames = int(round(dur * FPS))
    if src.endswith('.mp4'):
        clip = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', src],
                                    capture_output=True, text=True).stdout) - shot.get('from', 0)
        # A clip slows by at most 30% to fill its shot; past that its last frame holds (a slow-motion crawl reads as fake).
        stretch = min(1.3, max(1.0, dur / clip))
        z = shot.get('zoom', [1.0])[0]; fx, fy = shot.get('focus', [0.5, 0.5])
        crop = f",crop=iw/{z}:ih/{z}:(iw-iw/{z})*{fx}:(ih-ih/{z})*{fy},scale={W}:{H}" if z != 1.0 else ''
        chain = (f"scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H}{crop},setpts={stretch:.4f}*PTS,fps={FPS},"
                 f"tpad=stop_mode=clone:stop_duration={max(0.0, dur - clip * stretch) + 0.2:.3f}")
        inp = (['-ss', str(shot['from'])] if shot.get('from') else []) + ['-i', src]
    else:
        # Slow push-in (or pull-out) about the chosen point, on a 2x upscale so the move doesn't jitter.
        z0, z1 = shot.get('zoom', [1.0, 1.10])
        fx, fy = shot.get('focus', [0.5, 0.5])
        chain = (f"scale={W*2}:{H*2}:force_original_aspect_ratio=increase,crop={W*2}:{H*2},"
                 f"zoompan=z='{z0}+({z1}-{z0})*on/{frames}':x='(iw-iw/zoom)*{fx}':y='(ih-ih/zoom)*{fy}':d=1:s={W}x{H}:fps={FPS}")
        inp = ['-loop', '1', '-framerate', str(FPS), '-t', f'{dur:.3f}', '-i', src]
    if shot.get('darken'):
        chain += f",eq=brightness=-{shot['darken']}"
    for j, (bx, by, bw, bh) in enumerate(shot.get('blur', [])):
        # Softens a region (fractions of the frame) beyond recognition: a face that a generated scene let through.
        x, y, w, h = int(bx * W), int(by * H), int(bw * W) // 2 * 2, int(bh * H) // 2 * 2
        chain += f",split[m{j}][c{j}];[c{j}]crop={w}:{h}:{x}:{y},boxblur=28:4[b{j}];[m{j}][b{j}]overlay={x}:{y}"
    ov = overlays(shot, start)
    chain = look(chain + (',' + ov if ov else '') + f",fade=t=in:st=0:d=0.12,trim=duration={dur:.3f}")
    run(inp + ['-vf', chain, '-an', '-frames:v', str(frames), '-r', str(FPS), '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', out])
    return out

def main(edl_path):
    edl = json.load(open(edl_path))
    base = os.path.dirname(os.path.abspath(edl_path))
    tmp = os.path.join(base, 'build'); os.makedirs(tmp, exist_ok=True)
    narr = os.path.join(base, edl['narration'])
    total = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', narr],
                                 capture_output=True, text=True).stdout) + edl.get('tail', 0.0)
    cuts = [s['at'] for s in edl['shots']] + [total]
    with ThreadPoolExecutor(int(os.environ.get('EDIT_JOBS', '4'))) as ex:
        parts = list(ex.map(lambda i: render_shot(i, edl['shots'][i], cuts[i], cuts[i + 1] - cuts[i], base, tmp), range(len(edl['shots']))))
    lst = os.path.join(tmp, os.path.splitext(os.path.basename(edl['output']))[0] + '-list.txt')
    open(lst, 'w').write(''.join(f"file '{p}'\n" for p in parts))
    picture = os.path.join(tmp, os.path.splitext(os.path.basename(edl['output']))[0] + '-picture.mp4')
    run(['-f', 'concat', '-safe', '0', '-i', lst, '-c', 'copy', picture])
    out = os.path.join(base, edl['output'])
    # Sound: narration up front; under it a low brown-noise drone made here (no licence needed), ducked well below,
    # and the synthesised effects track (sfx.py) for the cues in the edit list.
    import sfx
    fx = sfx.track(edl.get('sfx', []), total, os.path.join(tmp, os.path.splitext(os.path.basename(edl['output']))[0] + '-sfx.wav'))
    run(['-i', picture, '-i', narr, '-f', 'lavfi', '-t', f'{total:.3f}', '-i', 'anoisesrc=color=brown:amplitude=0.6', '-i', fx,
         '-filter_complex',
         f"[2:a]lowpass=f=180,volume=0.10,afade=t=in:d=1.5,afade=t=out:st={total-1.5:.2f}:d=1.5[d];"
         f"[3:a]volume={edl.get('sfx_gain', 0.32)}[f];"
         f"[1:a]apad=whole_dur={total:.3f},volume=1.0[n];[n][d][f]amix=inputs=3:duration=first:normalize=0,loudnorm=I=-16:TP=-1.5[a]",
         '-map', '0:v', '-map', '[a]', '-c:v', 'libx264', '-preset', 'medium', '-crf', '21', '-maxrate', '12M', '-bufsize', '24M', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-c:a', 'aac', '-b:a', '192k', '-shortest', out])
    print(out)

if __name__ == '__main__':
    main(sys.argv[1])
