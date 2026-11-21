# Cross-Border & FX: v2 changes

This branch rebuilds the pack to the Snow Packs v2 bar (see [`COCO-V2-INSTRUCTIONS.md`](COCO-V2-INSTRUCTIONS.md)). What stays the same: the use case (an FX and treasury desk's corridor volume, FX margin and FX P&L), the eight corridors and their drivers, the grounded-note loop (fact pack → draft → verifier), the Snowflake features (`AI_COMPLETE`, the `CROSS_BORDER_SV` semantic view, the `CROSS_BORDER_AGENT` Cortex Agent, Streamlit in Snowflake), the Streamlit stack, the object names, the notebook and the owner line.

## Screen by screen

### App shell (new)
- **Before:** a Streamlit title, a warning banner and a sidebar button.
- **After:** a branded top bar (Cross-Border & FX logo, Sample/Live switch, environment badge, role chip) and five tabs. Tokens, fonts and motion follow [`docs/DESIGN.md`](docs/DESIGN.md).
- **Why:** v2 asks for a commercial-looking product with an always-visible mode switch. The old app had no Sample mode; it needed a Snowflake session to start.

### Desk (new)
- KPI tiles (volume, FX P&L, blended margin, transactions) with year-on-year deltas, sparklines and count-up, an "on the desk this month" insight, stacked volume by corridor with tooltips and legend, a ranked 12-month FX P&L list, and corridor status counts.
- **Why:** the old app opened on a list of saved notes, so a first-time reader saw no numbers until they ran the AI.

### Corridors (new)
- A sortable, filterable table (search, status, margin floor) with status pills and sparklines; selecting a row opens a detail panel with KPIs, FX P&L against margin, the FX path and the monthly rows.
- **Why:** gives the drill-down and decision flow v2 asks for, from the same `CROSS_BORDER_BENCHMARK` view.

### FX & Margin (new)
- FX rates indexed to July 2024 on one axis, growth vs margin bubbles sized by FX P&L, and a monthly margin heatmap.

### Desk Notes (was the whole app)
- Same loop and prompts, plus: a scope picker (all corridors or one), staged progress steps, a streaming reveal, the verifier's flags shown above the note, sources (fact-pack rows, months, model, latency) under it, and a note library.
- **Fixes:**
  - `AI_COMPLETE` returns its text JSON-encoded through Snowpark (`"..."` with escaped quotes). The old verifier never parsed it, so every note was badged Needs review. Both the app and the notebook now decode it first.
  - The verifier prompt now says that rounding to display units counts as supported; without that it flagged "$96.9M" against 96,860,400.
  - `CROSS_BORDER_REPORTS` also stores the flags, fact pack, model and latency.
- On the synthetic data, 7 of 9 notes now verify, and the 2 flags are real: a hedge word, and a wrong "led absolute growth" claim.

### Ask the Desk (new in the app)
- The agent existed before but only in Snowsight. The app now calls it with `SNOWFLAKE.CORTEX.DATA_AGENT_RUN`, shows staged steps, the answer, the result table and the SQL Cortex Analyst wrote.
- The agent spec gains an `execution_environment` warehouse and a "do not name real companies" instruction.

### Landing page (`docs/index.html`, replaces the root `index.html`)
- Its own identity: a dark pine hero with a corridor-arc map, a problem-first headline, six captioned screenshots with alt text, a "how Snowflake does each step" strip, run options, a disclaimer and doc links. It supports dark mode, works at phone width and loads no CDN scripts (fonts are bundled).

### Hosted example (`docs/try/`, replaces the root `try/`)
- A dependency-free static copy of all five screens on the same data, with SVG charts, tooltips, a sortable table, a drawer, staged AI and the "Sample AI response" label. The Live button explains how to run Live mode.

## Data, SQL and repo

- **Seeded generator:** `data/generate.py` (seed `20240701`) replaces `RANDOM()` in SQL. It keeps the original drivers and formulas and writes `data/*.csv`, `app/sample/*.csv` and the INSERT block in `sql/setup.sql`. Planted stories are in [`data/README.md`](data/README.md).
- **SQL:** `app/setup.sql`, `app/setup_synthetic.sql` and `app/teardown.sql` become `sql/setup.sql` and `sql/cleanup.sql`.
  - The two setup files were identical apart from a note, so they are merged into one.
  - Setup adds a least-privilege `CROSS_BORDER_FX_ROLE` that owns everything, a `corridor_name` column, extra columns on `CROSS_BORDER_REPORTS`, and an `APP_STAGE` stage for the Streamlit app.
  - Cleanup drops the objects as that role, then drops the role.
- **Removed:** the root `index.html`, `styles.css`, `try/` and `assets/` (old screenshots), replaced under `docs/`.
- **Added:**
  - `app/` modules: `data.py`, `ai.py`, `brand.py`, `views/`, plus `requirements.txt` and `environment.yml` pinned to Streamlit 1.50.0.
  - `scripts/capture_sample.py` (Live → Sample AI) and `scripts/build_example.py`.
  - `package.json` with `npm run build:example`, and `.gitignore`.
- **Verified live** on 2026-11-20 in a Snowflake demo account with key-pair auth:
  - setup ran in 11 s;
  - every screen ran in Live mode;
  - notes took 6–19 s and agent answers 14–26 s;
  - Live and Sample data are identical;
  - `CREATE STREAMLIT` from the stage succeeded;
  - cleanup left nothing behind (checked with SHOW).

## What to do after merging

1. **Pages:** Settings → Pages → Build and deployment → *Deploy from a branch*, branch `main`, folder **`/docs`** (it was `/ (root)`). `docs/.nojekyll` is included, so the `_`-free example and fonts are served as-is.
2. After Pages redeploys, open `https://sfc-gh-jsoliz.github.io/sfguide-cross-border-fx/` and `/try/`, and check that every CSS and JS file referenced from `/try/index.html` returns 200 (`app.css`, `app.js`, `data.js`, `../assets/tokens.css`).
3. Optional: Settings → *Template repository*, and add topics (`snowflake`, `financial-services`, `payments`, `cortex`).
4. Rebuild commands, if you change the data or the AI samples:

   ```bash
   python3 data/generate.py                    # regenerate data and the setup.sql data block
   # run sql/setup.sql, then with Live env vars set:
   python3 scripts/capture_sample.py           # recapture Sample AI responses from Live
   npm run build:example                        # or: python3 scripts/build_example.py
   ```

5. The catalog card for this pack will need new screenshots: `docs/images/cards/cross-border-fx-1.jpg` … `-6.jpg` (960×600, under 100 KB each, dashboard first) are ready for the catalog PR.
