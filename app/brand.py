"""Cross-Border & FX brand: tokens from docs/DESIGN.md, global CSS and small HTML helpers."""
import html

T = {
    "pine950": "#081F1B", "pine900": "#0B2E28", "pine700": "#13493F", "pine500": "#1F6F5F",
    "mist": "#EEF3F1", "surface": "#FFFFFF", "surface2": "#E3ECE8", "line": "#CFDDD7",
    "ink": "#0F1F1B", "ink2": "#3F524B", "muted": "#56675F",
    "saffron": "#F2B544", "saffronInk": "#7A4F00", "saffronSoft": "#FBEFD3",
    "fx": "#245C8A", "gain": "#17663F", "gainSoft": "#DDF1E5", "loss": "#A3341F", "lossSoft": "#F8E1DA",
}
PAIR_COLORS = {
    "USD/EUR": "#1F6F5F", "USD/GBP": "#245C8A", "USD/MXN": "#B8641A", "USD/CAD": "#6B5BA8",
    "USD/INR": "#A3341F", "USD/JPY": "#3F524B", "USD/BRL": "#8A6A00", "USD/AUD": "#2F8A8A",
}

LOGO = """<svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true"><rect width="32" height="32" rx="8" fill="#0B2E28" stroke="#2C5A50"/><path d="M7 22 C 11 9, 21 9, 25 22" fill="none" stroke="#F2B544" stroke-width="2.4" stroke-linecap="round"/><path d="M21.5 19.5 L25 22 L26.4 17.9" fill="none" stroke="#F2B544" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="7" cy="22" r="2.2" fill="#E9F2EE"/><path d="M16 6 V 26" stroke="#E9F2EE" stroke-width="1.4" stroke-opacity=".45"/></svg>"""

import base64 as _b64
LOGO_IMG = ('<img alt="Cross-Border & FX logo" width="30" height="30" src="data:image/svg+xml;base64,'
            + _b64.b64encode(LOGO.replace('aria-hidden="true"', 'xmlns="http://www.w3.org/2000/svg"').encode()).decode() + '">')

CSS = """
<style>
@font-face{font-family:"Space Grotesk";src:url("app/static/fonts/space-grotesk-latin-400-normal.woff2") format("woff2");font-weight:400;font-display:swap}
@font-face{font-family:"Space Grotesk";src:url("app/static/fonts/space-grotesk-latin-500-normal.woff2") format("woff2");font-weight:500;font-display:swap}
@font-face{font-family:"Space Grotesk";src:url("app/static/fonts/space-grotesk-latin-600-normal.woff2") format("woff2");font-weight:600;font-display:swap}
@font-face{font-family:"Space Grotesk";src:url("app/static/fonts/space-grotesk-latin-700-normal.woff2") format("woff2");font-weight:700;font-display:swap}
@font-face{font-family:"JetBrains Mono";src:url("app/static/fonts/jetbrains-mono-latin-400-normal.woff2") format("woff2");font-weight:400;font-display:swap}
@font-face{font-family:"JetBrains Mono";src:url("app/static/fonts/jetbrains-mono-latin-600-normal.woff2") format("woff2");font-weight:600;font-display:swap}
@property --n{syntax:"<integer>";initial-value:0;inherits:false}
:root{--pine950:#081F1B;--pine900:#0B2E28;--pine700:#13493F;--pine500:#1F6F5F;--mist:#EEF3F1;--surface:#fff;--surface2:#E3ECE8;--line:#CFDDD7;--ink:#0F1F1B;--ink2:#3F524B;--muted:#56675F;--saffron:#F2B544;--saffronInk:#7A4F00;--saffronSoft:#FBEFD3;--fx:#245C8A;--gain:#17663F;--gainSoft:#DDF1E5;--loss:#A3341F;--lossSoft:#F8E1DA;
 --sans:"Space Grotesk",ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;--mono:"JetBrains Mono",ui-monospace,SFMono-Regular,Menlo,monospace}
html{overflow-x:clip}
html,body,[class*="st-"],.stMarkdown,button,input,textarea,select{font-family:var(--sans)}
[data-testid="stHeader"]{display:none}
[data-testid="stToolbar"],[data-testid="stDecoration"],#MainMenu,footer{display:none}
.stApp{background:var(--mist)}
.block-container,[data-testid="stMainBlockContainer"]{padding-top:0!important;margin-top:-1px;max-width:1280px;padding-left:1.25rem;padding-right:1.25rem}
/* top bar */
.st-key-topbar{background:var(--pine950);box-shadow:0 0 0 100vmax var(--pine950);clip-path:inset(0 -100vmax);padding:.75rem 0;margin-bottom:.1rem}
.st-key-topbar [data-testid="stHorizontalBlock"]{align-items:center;gap:.75rem;flex-wrap:wrap}
.fv-brand{display:flex;align-items:center;gap:.65rem;color:#E9F2EE;min-width:0}
.fv-brand b{font-size:1.02rem;font-weight:600;letter-spacing:-.01em;white-space:nowrap}
.fv-brand span{display:block;font-size:.74rem;color:#A9C2B9;white-space:nowrap}
.fv-chips{display:flex;gap:.45rem;justify-content:flex-end;flex-wrap:wrap}
.fv-chip{display:inline-flex;align-items:center;gap:.35rem;font-size:.74rem;border-radius:999px;padding:.22rem .6rem;border:1px solid #2C5A50;color:#D7E6E0;white-space:nowrap;max-width:100%}
.fv-chip.sample{background:var(--saffronSoft);color:var(--saffronInk);border-color:#E9CF92;font-weight:600}
.fv-chip.live{background:#163F35;color:#BDF0D8;border-color:#2E7A62;font-weight:600}
.fv-dot{width:7px;height:7px;border-radius:50%;background:currentColor}
.st-key-topbar [data-testid="stButtonGroup"] button,.st-key-topbar [data-baseweb="button-group"] button{background:transparent;color:#D7E6E0;border-color:#2C5A50;font-size:.8rem;min-height:2rem;padding:.15rem .8rem}
.st-key-topbar [data-testid="stButtonGroup"] button[kind$="Active"],.st-key-topbar [data-testid="stButtonGroup"] button[aria-checked="true"]{background:var(--saffron);color:var(--pine950);border-color:var(--saffron)}
/* nav */
.st-key-nav{border-bottom:1px solid var(--line);margin-bottom:1.1rem;overflow-x:auto;position:relative}
.st-key-nav [role="radiogroup"]{flex-wrap:nowrap!important;gap:0!important}
.st-key-nav label[data-baseweb="radio"]{margin:0!important;padding:.75rem .95rem .7rem;border-bottom:2px solid transparent;white-space:nowrap;cursor:pointer}
.st-key-nav label[data-baseweb="radio"]>div:first-child{display:none}
.st-key-nav label[data-baseweb="radio"] p{font-weight:500;color:var(--ink2);font-size:.92rem}
.st-key-nav label[data-baseweb="radio"]:has(input:checked){border-bottom-color:var(--pine500)}
.st-key-nav label[data-baseweb="radio"]:has(input:checked) p{color:var(--ink);font-weight:600}
.st-key-nav label[data-baseweb="radio"]:hover p{color:var(--pine500)}
/* headings */
.fv-h{display:flex;align-items:flex-end;justify-content:space-between;gap:1rem;flex-wrap:wrap;margin:.2rem 0 .9rem}
.fv-h h1{font-size:1.65rem;line-height:1.15;margin:0;color:var(--ink);font-weight:600;letter-spacing:-.02em;padding:0}
.fv-h p{margin:.25rem 0 0;color:var(--muted);font-size:.9rem;max-width:62ch}
.fv-cap{display:inline-flex;gap:.35rem;align-items:center;font-size:.72rem;color:var(--pine500);background:#E2F0EB;border:1px solid #C3DDD3;border-radius:6px;padding:.2rem .5rem;font-weight:500;max-width:100%;flex-wrap:wrap}
.fv-cap.sample{color:var(--saffronInk);background:var(--saffronSoft);border-color:#E9CF92}
/* cards */
.fv-card,[class*="st-key-card"]{background:var(--surface);border:1px solid var(--line);border-radius:12px;min-width:0}
[class*="st-key-card"]{padding:1rem 1.1rem .6rem;animation:fvIn .18s ease-out both}
[class*="st-key-card"]:hover{border-color:#B7CCC4}
.fv-card{padding:1rem 1.1rem}
[data-testid="stMarkdownContainer"] p.fv-card-h,.fv-card-h{font-weight:600;font-size:.98rem;color:var(--ink);margin:0 0 .15rem}
[data-testid="stMarkdownContainer"] p.fv-card-s,.fv-card-s{font-size:.8rem;color:var(--muted);margin:0 0 .6rem}
@keyframes fvIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
/* kpis */
.fv-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:.8rem;margin-bottom:1rem}
.fv-kpi{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:.85rem 1rem;position:relative;overflow:hidden;animation:fvIn .18s ease-out both;transition:transform .15s,border-color .15s}
.fv-kpi:hover{transform:translateY(-1px);border-color:#B7CCC4}
.fv-kpi:nth-child(2){animation-delay:.04s}.fv-kpi:nth-child(3){animation-delay:.08s}.fv-kpi:nth-child(4){animation-delay:.12s}
.fv-kpi::before{content:"";position:absolute;inset:0 0 auto 0;height:3px;background:linear-gradient(90deg,var(--pine500),var(--saffron))}
.fv-kpi .k{font-size:.76rem;color:var(--muted);font-weight:500}
.fv-kpi .v{font-family:var(--mono);font-size:1.7rem;font-weight:600;color:var(--ink);margin:.25rem 0 .1rem;font-variant-numeric:tabular-nums;letter-spacing:-.02em}
.fv-kpi .v .cnt{animation:fvCount .7s ease-out forwards;counter-reset:n var(--n)}
.fv-kpi .v .cnt::after{content:counter(n)}
@keyframes fvCount{from{--n:0}}
.fv-kpi .d{font-size:.76rem;color:var(--muted)}
.fv-kpi svg{position:absolute;right:.7rem;bottom:.7rem;opacity:.9}
.up{color:var(--gain);font-weight:600}.down{color:var(--loss);font-weight:600}
/* pills */
.fv-pill{display:inline-flex;align-items:center;gap:.3rem;font-size:.72rem;font-weight:600;border-radius:999px;padding:.15rem .55rem;white-space:nowrap}
.fv-pill.ok{background:var(--gainSoft);color:var(--gain)}
.fv-pill.warn{background:var(--lossSoft);color:var(--loss)}
.fv-pill.acc{background:#DCEBF6;color:#1D4E77}
.fv-pill.steady{background:var(--surface2);color:var(--ink2)}
.fv-pill.mw{background:var(--saffronSoft);color:var(--saffronInk)}
/* ranked list */
.fv-rank{list-style:none;margin:0;padding:0}
.fv-rank li{display:grid;grid-template-columns:1.4rem 1fr auto;gap:.6rem;align-items:center;padding:.5rem 0;border-bottom:1px solid #E6EEEA;font-size:.86rem}
.fv-rank li:last-child{border-bottom:0}
.fv-rank .i{font-family:var(--mono);color:var(--muted);font-size:.78rem}
.fv-rank .bar{height:6px;border-radius:3px;background:var(--surface2);margin-top:.3rem;overflow:hidden}
.fv-rank .bar i{display:block;height:100%;border-radius:3px}
.fv-rank .n{font-family:var(--mono);font-weight:600;font-variant-numeric:tabular-nums}
/* insight */
.fv-insight{border-left:3px solid var(--saffron);background:var(--surface);border-radius:0 10px 10px 0;padding:.7rem .9rem;font-size:.86rem;color:var(--ink2);margin:.2rem 0 1rem;border-top:1px solid var(--line);border-right:1px solid var(--line);border-bottom:1px solid var(--line)}
.fv-insight b{color:var(--ink)}
/* skeleton */
.fv-skel{border-radius:10px;background:linear-gradient(90deg,#E3ECE8 25%,#F2F6F4 37%,#E3ECE8 63%);background-size:400% 100%;animation:fvSh 1.3s ease infinite}
@keyframes fvSh{0%{background-position:100% 50%}100%{background-position:0 50%}}
/* ai */
.fv-steps{list-style:none;padding:0;margin:.2rem 0 .6rem}
.fv-steps li{display:flex;gap:.55rem;align-items:flex-start;font-size:.85rem;padding:.28rem 0;color:var(--muted)}
.fv-steps li.done{color:var(--ink2)}.fv-steps li.now{color:var(--ink);font-weight:500}
.fv-steps .ic{width:16px;height:16px;border-radius:50%;flex:none;margin-top:2px;border:2px solid var(--line)}
.fv-steps li.done .ic{background:var(--pine500);border-color:var(--pine500);box-shadow:inset 0 0 0 3px #fff}
.fv-steps li.now .ic{border-color:var(--saffron);border-top-color:transparent;animation:fvSpin .8s linear infinite}
@keyframes fvSpin{to{transform:rotate(360deg)}}
.fv-src{font-size:.78rem;color:var(--muted);border-top:1px dashed var(--line);margin-top:.6rem;padding-top:.5rem}
.fv-src code{font-family:var(--mono);font-size:.74rem;background:var(--surface2);border-radius:4px;padding:.05rem .3rem;color:var(--ink2)}
[class*="st-key-note_body"] h1,[class*="st-key-card_answer"] h1{font-size:1.3rem!important;line-height:1.3!important;padding:.4rem 0!important}[class*="st-key-note_body"] h2,[class*="st-key-card_answer"] h2{font-size:1.05rem!important;padding:.6rem 0 .2rem!important}
[data-testid="stMarkdownContainer"] table{font-size:.84rem}
[data-testid="stMarkdownContainer"] th{background:var(--surface2)}
.fv-empty{text-align:center;padding:2.2rem 1rem;color:var(--muted);font-size:.9rem}
.fv-empty b{display:block;color:var(--ink);font-size:1rem;margin-bottom:.25rem}
/* buttons */
.stButton>button[kind="primary"]{background:var(--pine500);border-color:var(--pine500);color:#fff;font-weight:600}
.stButton>button[kind="primary"]:hover{background:var(--pine700);border-color:var(--pine700)}
.stButton>button{border-radius:8px}
[data-testid="stDataFrame"]{border-radius:10px}
@media (max-width:760px){
 .fv-kpis{grid-template-columns:repeat(2,minmax(0,1fr))}
 .fv-kpi .v{font-size:1.3rem}
 .fv-kpi svg{display:none}
 .fv-h h1{font-size:1.35rem}
 .fv-chips{justify-content:flex-start}
 .fv-brand span{white-space:normal}
}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
</style>
"""


def esc(s):
    return html.escape(str(s))


def usd(x, d=1):
    x = float(x)
    if abs(x) >= 1e9:
        return f"${x / 1e9:.{d + 1}f}B"
    if abs(x) >= 1e6:
        return f"${x / 1e6:.{d}f}M"
    if abs(x) >= 1e3:
        return f"${x / 1e3:.0f}K"
    return f"${x:,.0f}"


def pct(x, d=1, sign=True):
    return f"{x * 100:+.{d}f}%" if sign else f"{x * 100:.{d}f}%"


def delta(x, text):
    cls = "up" if x >= 0 else "down"
    arrow = "▲" if x >= 0 else "▼"
    return f'<span class="{cls}">{arrow} {esc(text)}</span>'


def spark(values, color="#1F6F5F", w=86, h=28):
    lo, hi = min(values), max(values)
    rng = (hi - lo) or 1
    pts = " ".join(f"{i * w / (len(values) - 1):.1f},{h - 2 - (v - lo) / rng * (h - 4):.1f}" for i, v in enumerate(values))
    return f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" aria-hidden="true"><polyline fill="none" stroke="{color}" stroke-width="1.8" stroke-linejoin="round" points="{pts}"/></svg>'


def kpi(label, value_html, delta_html, values=None):
    s = spark(values) if values else ""
    return f'<div class="fv-kpi"><div class="k">{esc(label)}</div><div class="v">{value_html}</div><div class="d">{delta_html}</div>{s}</div>'


def counter(prefix, number, suffix=""):
    """Animated integer count-up (CSS @property), with prefix/suffix text."""
    return f'{esc(prefix)}<span class="cnt" style="--n:{int(number)}"></span>{esc(suffix)}'


def header(title, sub, cap, sample=False):
    c = "fv-cap sample" if sample else "fv-cap"
    return f'<div class="fv-h"><div><h1>{esc(title)}</h1><p>{esc(sub)}</p></div><span class="{c}">{cap}</span></div>'


STATUS_CLASS = {"Accelerating": "acc", "Steady": "steady", "Margin watch": "mw"}


def pill(status):
    return f'<span class="fv-pill {STATUS_CLASS.get(status, "steady")}">{esc(status)}</span>'


def verdict(status):
    if status == "verified":
        return '<span class="fv-pill ok">✓ Verified</span>'
    return '<span class="fv-pill warn">! Needs review</span>'


def skeleton(rows=((4, 96), (1, 300))):
    out = []
    for n, h in rows:
        cells = "".join(f'<div class="fv-skel" style="height:{h}px"></div>' for _ in range(n))
        out.append(f'<div style="display:grid;grid-template-columns:repeat({n},minmax(0,1fr));gap:.8rem;margin-bottom:.9rem">{cells}</div>')
    return "".join(out)


def steps_html(steps, current, finished=False):
    items = []
    for i, s in enumerate(steps):
        cls = "done" if (i < current or finished) else ("now" if i == current else "")
        items.append(f'<li class="{cls}"><span class="ic"></span><span>{esc(s)}</span></li>')
    return f'<ul class="fv-steps">{"".join(items)}</ul>'


def md_safe(text):
    """Model markdown for st.markdown: dollar signs are not LaTeX, "•" lines become list items."""
    lines = []
    for ln in (text or "").replace("$", "\\$").split("\n"):
        s = ln.lstrip()
        lines.append("- " + s[1:].lstrip() if s.startswith("•") else ln)
    return "\n".join(lines)
