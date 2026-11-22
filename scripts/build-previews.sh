#!/usr/bin/env bash
# Rebuild the list-page preview thumbnails from the diagram-design repository.
#
# For each diagram type this script:
#   1. downloads the official example-<slug>.html page from
#      github.com/cathrynlavery/diagram-design (skills/diagram-design/assets)
#   2. renders it with headless Chrome at 900px wide, 2x device scale (1800px wide PNG)
#   3. trims the screenshot to the actual content
#   4. letterboxes it into 480x300 (list cards) and 1760x1100 (detail page + zoom)
#   5. writes src/previews/<slug>.webp, src/previews/<slug>@detail.webp and
#      re-embeds all previews into client.js
#
# Usage:   scripts/build-previews.sh [--only <slug>]
# Needs:   curl, Chrome/Chromium, python3 + Pillow, node
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REPO_RAW="https://raw.githubusercontent.com/cathrynlavery/diagram-design/main/skills/diagram-design/assets"
CHROME="${CHROME_PATH:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
NODE="${NODE:-node}"
# first python3 that actually has Pillow (the DSH bundled runtime usually does)
if [ -z "${PYTHON:-}" ]; then
  for candidate in python3 "$HOME/.dsh/dsh-runtimes/dsh-primary-runtime/dependencies/python/bin/python3"; do
    if command -v "$candidate" >/dev/null 2>&1 && "$candidate" -c 'import PIL' >/dev/null 2>&1; then
      PYTHON="$candidate"
      break
    fi
  done
fi
PYTHON="${PYTHON:-python3}"
WORK="${WORK:-/tmp/diagram-leapavid-previews}"
ONLY=""

while [ $# -gt 0 ]; do
  case "$1" in
    --only) ONLY="$2"; shift 2 ;;
    *) echo "unknown argument: $1" >&2; exit 2 ;;
  esac
done

[ -x "$CHROME" ] || { echo "Chrome not found at $CHROME (set CHROME_PATH)" >&2; exit 1; }
"$PYTHON" -c 'import PIL' 2>/dev/null || { echo "python3 with Pillow is required (set PYTHON)" >&2; exit 1; }

mkdir -p "$WORK/src" "$WORK/raw" "$ROOT/src/previews"

# slug <TAB> example file
"$NODE" -e '
const map = require(process.argv[1]);
for (const t of map) if (!process.argv[2] || t.slug === process.argv[2]) console.log(t.slug + "\t" + t.file);
' "$ROOT/src/preview-map.json" "$ONLY" > "$WORK/list.tsv"

echo "types: $(wc -l < "$WORK/list.tsv" | tr -d ' ')"

# download (skip anything already cached in $WORK)
while IFS="$(printf '\t')" read -r slug file; do
  [ -s "$WORK/src/$file" ] || curl -fsSL "$REPO_RAW/$file" -o "$WORK/src/$file"
done < "$WORK/list.tsv"

render() {
  "$CHROME" --headless=new --no-sandbox --disable-gpu --hide-scrollbars \
    --user-data-dir="$WORK/chrome-$3" --window-size=900,2000 --force-device-scale-factor=2 \
    --default-background-color=ffffffff --virtual-time-budget=5000 \
    --screenshot="$WORK/raw/$1.png" "file://$WORK/src/$2" >/dev/null 2>&1
}

i=0
while IFS="$(printf '\t')" read -r slug file; do
  # skip renders already cached in $WORK/raw (delete that file to force a re-render)
  if [ -s "$WORK/raw/$slug.png" ]; then
    continue
  fi
  i=$((i + 1))
  render "$slug" "$file" $((i % 4)) &
  if [ $((i % 4)) -eq 0 ]; then
    wait
  fi
done < "$WORK/list.tsv"
wait

ROOT="$ROOT" WORK="$WORK" ONLY="$ONLY" "$PYTHON" - <<'PY'
import glob, os
from PIL import Image, ImageChops

W, H = 480, 300        # list card thumbnails
DW, DH = 1760, 1100    # detail page + zoom, from the same 2x render
work = os.environ['WORK']
only = os.environ.get('ONLY') or ''
out_dir = os.path.join(os.environ['ROOT'], 'src', 'previews')
os.makedirs(out_dir, exist_ok=True)

total = 0
for path in sorted(glob.glob(os.path.join(work, 'raw', '*.png'))):
    slug = os.path.basename(path)[:-4]
    if only and slug != only:
        continue
    im = Image.open(path).convert('RGB')
    edge = list(im.crop((0, 0, im.width, 8)).getdata()) + list(im.crop((0, im.height - 8, im.width, im.height)).getdata())
    bg = max(set(edge), key=edge.count)
    diff = ImageChops.difference(im, Image.new('RGB', im.size, bg)).convert('L').point(lambda v: 255 if v > 14 else 0)
    box = diff.getbbox()
    if box:
        pad = 36  # 18 CSS px at the 2x render scale
        im = im.crop((max(0, box[0] - pad), max(0, box[1] - pad), min(im.width, box[2] + pad), min(im.height, box[3] + pad)))
    thumb = im.copy()
    thumb.thumbnail((W - 8, H - 8), Image.LANCZOS)
    canvas = Image.new('RGB', (W, H), bg)
    canvas.paste(thumb, ((W - thumb.width) // 2, (H - thumb.height) // 2))
    canvas.save(os.path.join(out_dir, slug + '.webp'), 'WEBP', quality=72, method=6)

    big = im.copy()
    big.thumbnail((DW - 24, DH - 24), Image.LANCZOS)
    detail = Image.new('RGB', (DW, DH), bg)
    detail.paste(big, ((DW - big.width) // 2, (DH - big.height) // 2))
    detail.save(os.path.join(out_dir, slug + '@detail.webp'), 'WEBP', quality=76, method=6)
    total += 1
print('previews written:', total, 'thumbs + details ->', out_dir)
PY

"$NODE" "$ROOT/scripts/embed-previews.mjs"
