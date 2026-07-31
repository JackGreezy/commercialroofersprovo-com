#!/usr/bin/env python3
"""Give Provo's dark wordmark a consistent light header plate."""

from pathlib import Path
import re
import sys


public = Path(sys.argv[1]) / "public"
marker = "rr-provo-logo-contrast"
style = f"""<style id="{marker}">
#tNav #navbar #logo{{
  background:#fff!important;border-radius:0 0 8px 8px!important;
  box-shadow:0 4px 16px rgba(0,0,0,.22)!important
}}
#tNav #navbar #logo>a{{background:#fff!important;border-radius:inherit!important}}
@media(max-width:760px){{
  #tNav #navbar #logo{{border-radius:0 0 6px 0!important}}
}}
</style>"""

changed = 0
for path in public.rglob("*.html"):
    original = path.read_text(errors="ignore")
    updated = re.sub(
        rf'<style id="{marker}">.*?</style>',
        "",
        original,
        flags=re.S,
    )
    updated = re.sub(
        r'(<img\b(?=[^>]*\bclass="[^"]*\brr-brand-logo\b[^"]*")[^>]*?)\sstyle="[^"]*"([^>]*>)',
        r"\1\2",
        updated,
        flags=re.I,
    )
    if "</head>" in updated:
        updated = updated.replace("</head>", style + "</head>", 1)
    if updated != original:
        path.write_text(updated)
        changed += 1

print(f"Provo logo contrast repaired: pages={changed}")
