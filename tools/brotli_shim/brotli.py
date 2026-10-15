"""A stand-in for the `brotli` Python package, used only by tools/make_fonts.py when the real
package isn't installed. It runs Brotli through Node's built-in zlib, which produces standard
Brotli streams, so fontTools can write WOFF2 files."""
import subprocess

MODE_GENERIC, MODE_TEXT, MODE_FONT = 0, 1, 2

_COMPRESS = """
const zlib = require('zlib');
const chunks = [];
process.stdin.on('data', c => chunks.push(c));
process.stdin.on('end', () => {
  const buf = Buffer.concat(chunks);
  const [mode, quality, lgwin] = process.argv.slice(1).map(Number);
  process.stdout.write(zlib.brotliCompressSync(buf, { params: {
    [zlib.constants.BROTLI_PARAM_MODE]: mode,
    [zlib.constants.BROTLI_PARAM_QUALITY]: quality,
    [zlib.constants.BROTLI_PARAM_LGWIN]: lgwin,
    [zlib.constants.BROTLI_PARAM_SIZE_HINT]: buf.length,
  } }));
});
"""
_DECOMPRESS = """
const zlib = require('zlib');
const chunks = [];
process.stdin.on('data', c => chunks.push(c));
process.stdin.on('end', () => process.stdout.write(zlib.brotliDecompressSync(Buffer.concat(chunks))));
"""


def compress(data, mode=MODE_GENERIC, quality=11, lgwin=22, lgblock=0):
    out = subprocess.run(["node", "-e", _COMPRESS, str(mode), str(quality), str(lgwin)],
                         input=bytes(data), capture_output=True, check=True)
    return out.stdout


def decompress(data):
    out = subprocess.run(["node", "-e", _DECOMPRESS], input=bytes(data), capture_output=True, check=True)
    return out.stdout
