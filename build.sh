#!/bin/sh
set -eu
ROOT="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
PROJ="$ROOT"
REFHOST="okland-com"
CAP="/Users/jackgreenberg/Desktop/rank-and-rent/David/clones/_captures/okland-com"
CFG="$ROOT/home.config.json"
MAP="/Users/jackgreenberg/Desktop/rank-and-rent/David/clones/scripts/relabel-map-okland-com.json"
VOICE="/Users/jackgreenberg/Desktop/rank-and-rent/David/clones/scripts/voice/commercial-roofing.json"

test -f "$CAP/public/home.html.ref"
mkdir -p "$PROJ/public"
rm -rf "$PROJ/public/assets-f"
cp -R "$CAP/public/assets-f" "$PROJ/public/assets-f"
# The rendered site uses donor CSS/font chrome only. Runtime scripts, captured
# photo payloads, and misclassified HTML responses are unreferenced and must not
# ship as public donor content.
rm -rf "$PROJ/public/assets-f/js" "$PROJ/public/assets-f/img"
find "$PROJ/public/assets-f/misc" -type f ! -name "6b4bf437242213.ico" -delete
for p in home about contact index slug; do cp "$CAP/public/$p.html.ref" "$PROJ/public/$p.html.ref"; done
rm -f "$PROJ/public/asset-manifest.json"
rm -rf "$PROJ/public/ours"
mkdir -p "$PROJ/public/ours"
cp -R "$PROJ/public/images/." "$PROJ/public/ours/"
mkdir -p "$PROJ/qa-out"

python3 /Users/jackgreenberg/Desktop/rank-and-rent/David/clones/scripts/normalize_content.py \
  "$PROJ" --voice "$VOICE"
python3 /Users/jackgreenberg/Desktop/rank-and-rent/David/clones/scripts/relabel_engine.py \
  --config "$CFG" --map "$MAP" --voice "$VOICE"
python3 "$PROJ/scripts/repair-logo-contrast.py" "$PROJ"
rm -f "$PROJ/public/"*.html.ref
python3 "$PROJ/scripts/normalize-contact-forms.py" "$PROJ"
python3 "$PROJ/scripts/hobo-seo-finalize.py" "$PROJ"
node "$PROJ/scripts/rebuild-provo-funnel.mjs"
python3 /Users/jackgreenberg/Desktop/rank-and-rent/David/clones/scripts/verify_site.py \
  "$PROJ" --map "$MAP" --json "$PROJ/qa-out/verify.json"
node /Users/jackgreenberg/Desktop/rank-and-rent/David/clones/scripts/qa_shots.mjs "$PROJ" --port 4881
echo "BUILD COMPLETE — gates green. Human QA: open $PROJ/qa-out/CONTACT-SHEET.html"
