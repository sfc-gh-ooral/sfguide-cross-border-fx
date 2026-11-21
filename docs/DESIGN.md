# Design: Cross-Border & FX

The v2 app and guide share one fictional brand. This file is the source of truth for colors, type and layout; the Streamlit theme (`app/.streamlit/config.toml`), the app stylesheet (`app/brand.py`), the hosted example (`docs/try/`) and the landing page (`docs/index.html`) all take their tokens from here.

## Brand

- **Name:** Cross-Border & FX. A cross-border and FX workspace for the treasury and FX desk of a fictional payments processor. The app carries the product name only, with no fictional company brand.
- **Audience:** heads of FX and treasury, corridor managers and payments finance analysts. They read basis points, currency pairs and month-end numbers every day.
- **Voice:** a desk, not a dashboard. Short, numeric, calm. Labels use the trade's words (corridor, pair, margin in bps, FX P&L). Every number says its unit. AI text is called a "desk note" and always shows where its numbers came from.
- **Logo mark:** a weather vane whose arrow is a corridor arc, drawn as one stroke.

```svg
<svg viewBox="0 0 32 32" width="32" height="32" aria-hidden="true">
  <rect width="32" height="32" rx="8" fill="#0B2E28"/>
  <path d="M7 22 C 11 9, 21 9, 25 22" fill="none" stroke="#F2B544" stroke-width="2.4" stroke-linecap="round"/>
  <path d="M21.5 19.5 L25 22 L26.4 17.9" fill="none" stroke="#F2B544" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="7" cy="22" r="2.2" fill="#E9F2EE"/>
  <path d="M16 6 V 26" stroke="#E9F2EE" stroke-width="1.4" stroke-opacity=".45"/>
</svg>
```

## Palette

| Token | Hex | Use |
|---|---|---|
| `pine-950` | `#081F1B` | Top bar, hero background |
| `pine-900` | `#0B2E28` | Logo tile, dark panels |
| `pine-700` | `#13493F` | Hover on dark, chart ink |
| `pine-500` | `#1F6F5F` | Primary buttons, active tab underline, links |
| `mist` | `#EEF3F1` | App canvas |
| `surface` | `#FFFFFF` | Cards, tables |
| `surface-2` | `#E3ECE8` | Table header, chips |
| `line` | `#CFDDD7` | Borders, grid lines |
| `ink` | `#0F1F1B` | Body text |
| `ink-2` | `#3F524B` | Secondary text |
| `muted` | `#56675F` | Captions (AA on white and mist) |
| `saffron` | `#F2B544` | Accent on dark only (arcs, logo, active nav) |
| `saffron-ink` | `#7A4F00` | Accent text on light, "Sample" badge text |
| `saffron-soft` | `#FBEFD3` | Sample badge, highlight fill |
| `fx` | `#245C8A` | FX-rate lines |
| `gain` | `#17663F` | Positive deltas, Verified pill text |
| `gain-soft` | `#DDF1E5` | Verified pill fill |
| `loss` | `#A3341F` | Negative deltas, Needs-review pill text |
| `loss-soft` | `#F8E1DA` | Needs-review pill fill |

Eight corridor colors (charts only, each checked against white for 3:1 non-text contrast): USD/EUR `#1F6F5F`, USD/GBP `#245C8A`, USD/MXN `#B8641A`, USD/CAD `#6B5BA8`, USD/INR `#A3341F`, USD/JPY `#3F524B`, USD/BRL `#8A6A00`, USD/AUD `#2F8A8A`.

Dark mode: the landing page follows `prefers-color-scheme` (canvas `#0C1916`, surface `#13241F`, ink `#E6EFEB`, muted `#9DB2AA`, links `#7FD1B9`). The app stays light: a desk tool read beside spreadsheets, and the brief's screens are dense tables that read best on white.

## Typography

- **Space Grotesk** (400/500/600/700) for headings, navigation and UI text. Its squared terminals suit a trading-desk feel without the monospace look other packs use.
- **JetBrains Mono** (400/600) only for figures: KPI values, table numbers, rates and bps, with tabular figures so columns line up.
- Both are SIL Open Font License fonts, bundled in the repository (`app/static/fonts`, `docs/fonts`) with their licenses. No font CDN.
- Scale: 12 / 13 / 14 / 16 / 20 / 28 / 44 px. KPI values 28 px mono.

## Layout model

- **App:** a full-width pine top bar (logo, product name, Sample/Live switch, environment badge, user/role chip) above a horizontal tab row: Desk, Corridors, FX & Margin, Desk Notes, Ask the Desk. No sidebar. Content sits in a 1,280 px max-width column on the mist canvas.
- **Density:** medium-high. Four KPI tiles in a row, then a two-thirds/one-third grid (chart + ranked list). Tables use 36 px rows.
- **Detail:** clicking a corridor opens a detail panel (a Streamlit dialog in the app, a slide-in drawer in the hosted example) with sparkline, FX path, margin and P&L by month.
- **Phone (390 px):** tiles stack two by two, the tab row scrolls sideways inside itself, tables scroll inside their card, nothing scrolls the page sideways.

## Charts

- Altair in the app, hand-written SVG in the hosted example; same look in both.
- Thin 2 px lines, no area fills except the stacked-volume chart (fill at 85% opacity), light `line` gridlines on the y axis only, no chart borders.
- Every chart has a legend (or a direct label when it has one series) and a tooltip with month, corridor and value with its unit.
- Indexed FX chart (rate ÷ first month × 100) so pairs with very different rates share one axis.

## Motion

- Tiles and cards fade and rise 6 px on load (180 ms, staggered 40 ms).
- KPI values count up once on load (CSS `@property` counter, 700 ms ease-out).
- Skeleton shimmer while data loads; staged AI steps tick in one by one, then the note reveals word by word.
- Hover: cards lift 1 px with a stronger border; table rows tint `surface-2`.
- Everything respects `prefers-reduced-motion`.

## What makes it distinct

Compared with live catalog packs (landing pages and Try apps checked on 2026-11-20):

| Pack | Its look | What this pack avoids |
|---|---|---|
| Auto Finance Portfolio Analytics | Night navy with lime, mono type | No lime, no navy-black, mono only for figures |
| Workforce Intelligence | Cream paper, plum, serif headings | No cream or serif; cool mist canvas, grotesk type |
| Payment Fraud Workbench | Near-black UI, lime signal and pink | Light app, no neon accents |
| Collections Copilot | Lavender canvas, dusk violet, Bricolage | No violet family, different typeface |
| Regulatory Change Tracker | Paper and red, IBM Plex Mono, Source Serif | No paper-and-red, no Plex |
| Loan File Review | Cobalt rail sidebar, Bricolage, Geist Mono | Top bar instead of a side rail, pine instead of cobalt |
| Card Fraud Console, Loss Triangle | Snowflake-blue and purple gradients | No Snowflake blue, no purple |

The hero is also new to the catalog: a dark pine band with a corridor-arc map (saffron arcs from one origin node to eight destination pairs), not a screenshot-on-gradient or a split hero.
