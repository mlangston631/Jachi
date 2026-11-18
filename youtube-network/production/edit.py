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
import json, os, subprocess, sys

W, H, FPS = 1920, 1080, 30
MONO = '/usr/share/fonts/truetype/jetbrains-mono/JetBrainsMono-Bold.ttf'
SANS = '/usr/share/fonts/opentype/inter/Inter-SemiBold.otf'

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
    if shot.get('recreation'):
        out.append(f"drawtext=fontfile={SANS}:text='RECREATION':fontsize=26:fontcolor=0xF4F2EA@0.85:x=60:y=h-80:box=1:boxcolor=0x1C1D20@0.55:boxborderw=12")
    for t in shot.get('text', []):
        a = max(0.0, t.get('at', start) - start)
        fade = f"alpha='if(lt(t,{a}),0,min(1,(t-{a})/0.35))'"
        font = MONO if t.get('mono', True) else SANS
        x = t.get('x', '(w-text_w)/2'); y = t.get('y', '(h-text_h)/2')
        box = ':box=1:boxcolor=0x1C1D20@0.6:boxborderw=18' if t.get('box') else ''
        out.append(f"drawtext=fontfile={font}:text='{esc(t['text'])}':fontsize={t.get('size', 64)}:fontcolor={t.get('color', '0xF4F2EA')}:x={x}:y={y}:{fade}{box}")
    return ','.join(out)

def render_shot(i, shot, start, dur, base, tmp):
    out = os.path.join(tmp, f'shot{i:02d}.mp4')
    src = os.path.join(base, shot['src'])
    frames = int(round(dur * FPS))
    if src.endswith('.mp4'):
        stretch = dur / float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', src],
                                             capture_output=True, text=True).stdout)
        chain = f"scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},setpts={max(1.0, stretch):.4f}*PTS,fps={FPS}"
        inp = ['-i', src]
    else:
        # Slow push-in (or pull-out) about the chosen point, on a 2x upscale so the move doesn't jitter.
        z0, z1 = shot.get('zoom', [1.0, 1.10])
        fx, fy = shot.get('focus', [0.5, 0.5])
        chain = (f"scale={W*2}:{H*2}:force_original_aspect_ratio=increase,crop={W*2}:{H*2},"
                 f"zoompan=z='{z0}+({z1}-{z0})*on/{frames}':x='(iw-iw/zoom)*{fx}':y='(ih-ih/zoom)*{fy}':d=1:s={W}x{H}:fps={FPS}")
        inp = ['-loop', '1', '-framerate', str(FPS), '-t', f'{dur:.3f}', '-i', src]
    if shot.get('darken'):
        chain += f",eq=brightness=-{shot['darken']}"
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
    parts = [render_shot(i, s, cuts[i], cuts[i + 1] - cuts[i], base, tmp) for i, s in enumerate(edl['shots'])]
    lst = os.path.join(tmp, 'list.txt')
    open(lst, 'w').write(''.join(f"file '{p}'\n" for p in parts))
    picture = os.path.join(tmp, 'picture.mp4')
    run(['-f', 'concat', '-safe', '0', '-i', lst, '-c', 'copy', picture])
    out = os.path.join(base, edl['output'])
    # Sound: narration up front; under it a low brown-noise drone made here (no licence needed), ducked well below.
    run(['-i', picture, '-i', narr, '-f', 'lavfi', '-t', f'{total:.3f}', '-i', 'anoisesrc=color=brown:amplitude=0.6',
         '-filter_complex',
         f"[2:a]lowpass=f=180,volume=0.10,afade=t=in:d=1.5,afade=t=out:st={total-1.5:.2f}:d=1.5[d];"
         f"[1:a]apad=whole_dur={total:.3f},volume=1.0[n];[n][d]amix=inputs=2:duration=first:normalize=0,loudnorm=I=-16:TP=-1.5[a]",
         '-map', '0:v', '-map', '[a]', '-c:v', 'libx264', '-preset', 'slow', '-crf', '21', '-maxrate', '12M', '-bufsize', '24M', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-c:a', 'aac', '-b:a', '192k', '-shortest', out])
    print(out)

if __name__ == '__main__':
    main(sys.argv[1])
