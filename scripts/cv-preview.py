"""Render the same content as make_cv.py to HTML->PDF, so the layout can be
seen before Word ever opens it. QuickLook does not render tab stops, which
makes it useless for checking a two-column resume."""
import base64, os, subprocess, sys, tempfile, time, shutil, html
import make_cv as C

FONT = "/System/Library/Fonts/Supplemental/Baskerville.ttc"
faces = ""
if os.path.exists(FONT):
    b64 = base64.b64encode(open(FONT, "rb").read()).decode()
    faces = (f"@font-face{{font-family:Bask;src:url(data:font/collection;base64,{b64});}}")

import re as _re
def esc(t): return html.escape(t, quote=False)
def rich(t):
    """Same **bold** markers make_cv.py understands."""
    return _re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", html.escape(t, quote=False))

def row(l, r, cls):
    return f'<div class="row {cls}"><span>{esc(l)}</span><span>{esc(r)}</span></div>'

out = [f'<h1>{esc(C.NAME)}</h1>',
       '<p class="contact">' + '  |  '.join(esc(c) for c in C.CONTACT) + '</p>']

out.append('<h2>Skills</h2>')
for label, items in C.SKILLS:
    out.append(f'<p class="skill"><b>{esc(label)}:</b> {esc(items)}</p>')

out.append('<h2>Experience</h2>')
for j in C.EXPERIENCE:
    out.append(row(j["org"], j["dates"], "b"))
    out.append(row(j["role"], j["place"], "i"))
    out.append('<ul class="dot">' + ''.join(f'<li>{rich(b)}</li>' for b in j["bullets"]) + '</ul>')

out.append('<h2>Projects</h2>')
for p in C.PROJECTS:
    out.append(f'<p class="proj"><b>{esc(p["name"])}</b> | <i>{esc(p["stack"])}</i></p>')
    out.append('<ul class="ast">' + ''.join(f'<li>{rich(b)}</li>' for b in p["bullets"]) + '</ul>')

out.append('<h2>Education</h2>')
for e in C.EDUCATION:
    out.append(row(e["school"], e["place"], "b"))
    out.append(row(e["degree"], e["when"], "i"))

CSS = faces + """
@page{size:Letter;margin:0.45in 0.5in 0.4in;}
body{font-family:Bask,Baskerville,serif;font-size:%.1fpt;line-height:1.16;margin:0;color:#000;}
h1{font-size:20pt;text-align:center;margin:0;font-weight:400;font-variant:small-caps;letter-spacing:.06em;}
.contact{text-align:center;font-size:9pt;margin:1pt 0 0;}
h2{font-size:12pt;font-weight:400;font-variant:small-caps;letter-spacing:.05em;
   margin:5pt 0 2pt;border-bottom:.6pt solid #000;padding-bottom:1pt;}
.skill{margin:0 0 .5pt;padding-left:.14in;}
.row{display:flex;justify-content:space-between;margin:0;}
.row.b{font-weight:700;margin-top:2pt;}
.row.i{font-style:italic;}
ul{margin:.5pt 0 0;padding-left:.24in;list-style:none;}
li{margin:0 0 .5pt;text-indent:-.14in;}
ul.dot li:before{content:"\\2022  ";}
ul.ast li:before{content:"*  ";}
.proj{margin:2pt 0 0;}
""" % C.BODY_PT

doc = f"<!doctype html><meta charset=utf-8><style>{CSS}</style>" + "".join(out)
tmp = tempfile.mkdtemp(prefix="cvprev-")
page = os.path.join(tmp, "p.html"); open(page, "w").write(doc)
OUT = sys.argv[1]
if os.path.exists(OUT): os.remove(OUT)
proc = subprocess.Popen(["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "--headless=new","--disable-gpu","--no-first-run",f"--user-data-dir={tmp}/prof",
  "--no-pdf-header-footer",f"--print-to-pdf={OUT}",f"file://{page}"],
  stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
try:
    end = time.time()+60
    while time.time() < end:
        if os.path.exists(OUT) and os.path.getsize(OUT) > 1024:
            with open(OUT,"rb") as f:
                f.seek(-1024, os.SEEK_END)
                if b"%%EOF" in f.read(): break
        time.sleep(0.3)
finally:
    proc.terminate()
    try: proc.wait(timeout=8)
    except Exception: proc.kill()
    shutil.rmtree(tmp, ignore_errors=True)
print("preview:", OUT)
