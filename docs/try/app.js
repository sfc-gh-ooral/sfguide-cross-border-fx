/* Cross-Border & FX: hosted no-account example. Same data and logic as the
   Streamlit app's Sample mode (app/data.py). Always Sample mode; AI answers were
   captured from Live runs and are labeled "Sample AI response". No dependencies. */
(function () {
  "use strict";
  var D = window.CBFX;
  var COLORS = { "USD/EUR": "#1F6F5F", "USD/GBP": "#245C8A", "USD/MXN": "#B8641A", "USD/CAD": "#6B5BA8",
    "USD/INR": "#A3341F", "USD/JPY": "#3F524B", "USD/BRL": "#8A6A00", "USD/AUD": "#2F8A8A" };
  var PAIRS = Object.keys(COLORS);
  var SCOPES = { ALL: "All corridors", COR_USEU: "USD/EUR · Germany", COR_USGB: "USD/GBP · United Kingdom",
    COR_USMX: "USD/MXN · Mexico", COR_USIN: "USD/INR · India", COR_USCA: "USD/CAD · Canada",
    COR_USJP: "USD/JPY · Japan", COR_USBR: "USD/BRL · Brazil", COR_USAU: "USD/AUD · Australia" };
  var ASK_STEPS = ["Sending the question to the Cross-Border FX Agent (DATA_AGENT_RUN)",
    "Cortex Analyst writes SQL over the CROSS_BORDER_SV semantic view",
    "Running the SQL on SNOWPACK_CROSS_BORDER_FX_WH", "Composing the answer from the result set"];
  var MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var MONTH_LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  // ---------------------------------------------------------------- data
  var corr = {}; D.corridors.forEach(function (c) { corr[c.corridor_id] = c; });
  var fx = {}; D.fx.forEach(function (r) { fx[r.currency_pair + "|" + r.month_end] = r.fx_rate; });
  var rows = D.volume.map(function (v) {
    var c = corr[v.corridor_id];
    return Object.assign({}, v, { corridor_name: c.corridor_name, currency_pair: c.currency_pair, fx_rate: fx[c.currency_pair + "|" + v.month_end] });
  });
  var months = Array.from(new Set(rows.map(function (r) { return r.month_end; }))).sort();
  function byCorr(id) { return rows.filter(function (r) { return r.corridor_id === id; }).sort(function (a, b) { return a.month_end < b.month_end ? -1 : 1; }); }
  function sum(a, f) { return a.reduce(function (s, x) { return s + f(x); }, 0); }
  function mean(a) { return a.reduce(function (s, x) { return s + x; }, 0) / a.length; }
  function summary() {
    return Object.keys(corr).map(function (id) {
      var g = byCorr(id), l12 = g.slice(-12), p12 = g.slice(0, g.length - 12);
      var f3 = mean(g.slice(0, 3).map(function (r) { return r.fx_margin_bps; })), l3 = mean(g.slice(-3).map(function (r) { return r.fx_margin_bps; }));
      var pg = sum(l12, function (r) { return r.fx_pnl_usd; }) / sum(p12, function (r) { return r.fx_pnl_usd; }) - 1;
      var status = (l3 - f3 <= -3) ? "Margin watch" : (pg >= 0.15 ? "Accelerating" : "Steady");
      return { id: id, corridor: corr[id].corridor_name, pair: corr[id].currency_pair, status: status,
        volLatest: g[g.length - 1].cross_border_volume_usd, volGrowth: g[g.length - 1].cross_border_volume_usd / g[0].cross_border_volume_usd - 1,
        m3: Math.round(l3 * 10) / 10, dm: Math.round((l3 - f3) * 10) / 10, pnl12: sum(l12, function (r) { return r.fx_pnl_usd; }), pnlGrowth: pg,
        fxChange: g[g.length - 1].fx_rate / g[0].fx_rate - 1, trend: g.map(function (r) { return r.cross_border_volume_usd; }) };
    }).sort(function (a, b) { return b.pnl12 - a.pnl12; });
  }
  var SUMM = summary();

  // ---------------------------------------------------------------- format
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function usd(x, d) { d = d == null ? 1 : d; var a = Math.abs(x); if (a >= 1e9) return "$" + (x / 1e9).toFixed(d + 1) + "B"; if (a >= 1e6) return "$" + (x / 1e6).toFixed(d) + "M"; if (a >= 1e3) return "$" + Math.round(x / 1e3) + "K"; return "$" + Math.round(x); }
  function pct(x, d) { d = d == null ? 1 : d; return (x >= 0 ? "+" : "") + (x * 100).toFixed(d) + "%"; }
  function delta(x, t) { return '<span class="' + (x >= 0 ? "up" : "down") + '">' + (x >= 0 ? "▲ " : "▼ ") + esc(t) + "</span>"; }
  function mlabel(s) { var p = s.split("-"); return MON[+p[1] - 1] + " " + p[0].slice(2); }
  function mlong(s) { var p = s.split("-"); return MONTH_LONG[+p[1] - 1] + " " + p[0]; }
  function money(x) { return "$" + Math.round(x).toLocaleString("en-US"); }
  function pill(s) { return '<span class="pill ' + s.replace(" ", "-") + '">' + esc(s) + "</span>"; }
  function verdict(s) { return s === "verified" ? '<span class="pill ok">✓ Verified</span>' : '<span class="pill warn">! Needs review</span>'; }
  function cap(t) { return '<span class="cap">Sample data · ' + esc(t) + "</span>"; }
  function head(t, s, c) { return '<div class="h"><div><h1>' + esc(t) + "</h1><p>" + esc(s) + "</p></div>" + c + "</div>"; }

  // ---------------------------------------------------------------- tooltip
  var tip = document.getElementById("tip");
  function showTip(e, html) { tip.innerHTML = html; tip.hidden = false; var x = e.clientX + 14, y = e.clientY + 14; var w = tip.offsetWidth, h = tip.offsetHeight; if (x + w > innerWidth - 8) x = e.clientX - w - 14; if (y + h > innerHeight - 8) y = e.clientY - h - 14; tip.style.left = Math.max(8, x) + "px"; tip.style.top = Math.max(8, y) + "px"; }
  function hideTip() { tip.hidden = true; }
  function bindTips(root) {
    root.querySelectorAll("[data-tip]").forEach(function (el) {
      el.addEventListener("mousemove", function (e) { showTip(e, el.getAttribute("data-tip")); });
      el.addEventListener("mouseleave", hideTip);
    });
  }

  // ---------------------------------------------------------------- charts (SVG)
  function spark(vals, color) {
    var w = 86, h = 28, lo = Math.min.apply(null, vals), hi = Math.max.apply(null, vals), r = (hi - lo) || 1;
    var pts = vals.map(function (v, i) { return (i * w / (vals.length - 1)).toFixed(1) + "," + (h - 2 - (v - lo) / r * (h - 4)).toFixed(1); }).join(" ");
    return '<svg width="' + w + '" height="' + h + '" aria-hidden="true"><polyline fill="none" stroke="' + (color || "#1F6F5F") + '" stroke-width="1.8" points="' + pts + '"/></svg>';
  }
  function niceTicks(lo, hi, n) {
    var span = hi - lo || 1, step = Math.pow(10, Math.floor(Math.log10(span / n))), err = span / n / step;
    step *= err >= 7.5 ? 10 : err >= 3 ? 5 : err >= 1.5 ? 2 : 1;
    var t = [], s = Math.floor(lo / step) * step; for (var v = s; v <= hi + step * .01; v += step) t.push(+v.toFixed(10)); return t;
  }
  function frame(W, H, ticks, y, fmt, xlabels, x) {
    var g = "";
    ticks.forEach(function (t) { g += '<line x1="44" x2="' + (W - 8) + '" y1="' + y(t) + '" y2="' + y(t) + '" stroke="#E1EAE6"/><text x="38" y="' + (y(t) + 4) + '" text-anchor="end">' + fmt(t) + "</text>"; });
    xlabels.forEach(function (i) { g += '<text x="' + x(i) + '" y="' + (H - 6) + '" text-anchor="middle">' + mlabel(months[i]) + "</text>"; });
    return g;
  }
  function xIdx(n) { var out = []; for (var i = 2; i < n; i += 4) out.push(i); return out; }
  function stackedArea(hidden) {
    var W = 760, H = 300, pairs = PAIRS.filter(function (p) { return !hidden[p]; });
    var tot = months.map(function (m) { return sum(rows.filter(function (r) { return r.month_end === m && pairs.indexOf(r.currency_pair) >= 0; }), function (r) { return r.cross_border_volume_usd; }) / 1e9; });
    var max = Math.max.apply(null, tot.concat([0.1])), ticks = niceTicks(0, max, 5); max = ticks[ticks.length - 1];
    var x = function (i) { return 44 + i * (W - 52) / (months.length - 1); }, y = function (v) { return H - 24 - v / max * (H - 36); };
    var base = months.map(function () { return 0; }), paths = "";
    pairs.forEach(function (p) {
      var top = months.map(function (m, i) { var r = rows.find(function (q) { return q.month_end === m && q.currency_pair === p; }); return base[i] + r.cross_border_volume_usd / 1e9; });
      var d = "M" + top.map(function (v, i) { return x(i) + "," + y(v); }).join("L") + "L" + base.map(function (v, i) { return x(i) + "," + y(v); }).reverse().join("L") + "Z";
      paths += '<path d="' + d + '" fill="' + COLORS[p] + '" fill-opacity=".85"/>';
      base = top;
    });
    var hits = months.map(function (m, i) {
      var parts = pairs.map(function (p) { var r = rows.find(function (q) { return q.month_end === m && q.currency_pair === p; }); return "<br>" + p + ": $" + (r.cross_border_volume_usd / 1e9).toFixed(3) + "B"; }).join("");
      var w = (W - 52) / (months.length - 1);
      return '<rect x="' + (x(i) - w / 2) + '" y="10" width="' + w + '" height="' + (H - 34) + '" fill="transparent" data-tip="<b>' + mlong(m) + "</b><br>Total: $" + tot[i].toFixed(2) + "B" + esc(parts) + '"/>';
    }).join("");
    return '<svg class="chart" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Stacked monthly volume by corridor, USD billions">' +
      frame(W, H, ticks, y, function (t) { return t.toFixed(1); }, xIdx(months.length), x) + paths + hits + "</svg>";
  }
  function lines(series, opts) {
    var W = opts.w || 760, H = opts.h || 300, all = [];
    series.forEach(function (s) { all = all.concat(s.vals); });
    var lo = Math.min.apply(null, all), hi = Math.max.apply(null, all), ticks = niceTicks(lo, hi, 5);
    lo = ticks[0]; hi = ticks[ticks.length - 1];
    var x = function (i) { return 44 + i * (W - 52) / (months.length - 1); }, y = function (v) { return H - 24 - (v - lo) / ((hi - lo) || 1) * (H - 36); };
    var out = frame(W, H, ticks, y, opts.fmt || function (t) { return t; }, xIdx(months.length), x);
    if (opts.ref != null) out += '<line x1="44" x2="' + (W - 8) + '" y1="' + y(opts.ref) + '" y2="' + y(opts.ref) + '" stroke="#9DB2AA" stroke-dasharray="4 3"/>';
    series.forEach(function (s) {
      out += '<polyline fill="none" stroke="' + s.color + '" stroke-width="2" stroke-linejoin="round" points="' + s.vals.map(function (v, i) { return x(i) + "," + y(v); }).join(" ") + '"/>';
    });
    var w = (W - 52) / (months.length - 1);
    out += months.map(function (m, i) {
      var t = series.map(function (s) { return "<br>" + s.name + ": " + s.tip(i); }).join("");
      return '<rect x="' + (x(i) - w / 2) + '" y="10" width="' + w + '" height="' + (H - 34) + '" fill="transparent" data-tip="<b>' + mlong(m) + "</b>" + esc(t) + '"/>';
    }).join("");
    return '<svg class="chart" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="' + esc(opts.label) + '">' + out + "</svg>";
  }
  function legend(hidden, id) {
    return '<div class="legend" id="' + id + '">' + PAIRS.map(function (p) {
      return '<button type="button" data-pair="' + p + '" aria-pressed="' + (!hidden[p]) + '"><i style="background:' + COLORS[p] + '"></i>' + p + "</button>";
    }).join("") + "</div>";
  }
  function scatter(list) {
    var W = 460, H = 300, xs = list.map(function (s) { return s.volGrowth * 100; }), ys = list.map(function (s) { return s.m3; });
    var xt = niceTicks(0, Math.max.apply(null, xs), 5), yt = niceTicks(Math.min.apply(null, ys) - 3, Math.max.apply(null, ys) + 3, 5);
    var x = function (v) { return 44 + (v - xt[0]) / (xt[xt.length - 1] - xt[0]) * (W - 60); }, y = function (v) { return H - 34 - (v - yt[0]) / (yt[yt.length - 1] - yt[0]) * (H - 46); };
    var maxP = Math.max.apply(null, list.map(function (s) { return s.pnl12; }));
    var g = "";
    yt.forEach(function (t) { g += '<line x1="44" x2="' + (W - 8) + '" y1="' + y(t) + '" y2="' + y(t) + '" stroke="#E1EAE6"/><text x="38" y="' + (y(t) + 4) + '" text-anchor="end">' + t + "</text>"; });
    xt.forEach(function (t) { g += '<text x="' + x(t) + '" y="' + (H - 16) + '" text-anchor="middle">' + t + "%</text>"; });
    g += '<text x="' + (W / 2) + '" y="' + (H - 1) + '" text-anchor="middle">Volume growth since Jul 2024</text>';
    list.forEach(function (s) {
      var r = 6 + 16 * Math.sqrt(s.pnl12 / maxP);
      g += '<circle cx="' + x(s.volGrowth * 100) + '" cy="' + y(s.m3) + '" r="' + r.toFixed(1) + '" fill="' + COLORS[s.pair] + '" fill-opacity=".85" stroke="#fff" data-tip="<b>' + s.pair + "</b><br>Volume growth: " + (s.volGrowth * 100).toFixed(1) + "%<br>Margin (3-month avg): " + s.m3 + " bps<br>FX P&amp;L 12m: " + usd(s.pnl12) + '"/>';
      g += '<text x="' + (x(s.volGrowth * 100) + r + 3) + '" y="' + (y(s.m3) + 4) + '" style="fill:#3F524B">' + s.pair.slice(4) + "</text>";
    });
    return '<svg class="chart" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Volume growth against margin by corridor">' + g + "</svg>";
  }
  function heat(pairs) {
    var all = rows.filter(function (r) { return pairs.indexOf(r.currency_pair) >= 0; }).map(function (r) { return r.fx_margin_bps; });
    var lo = Math.min.apply(null, all), hi = Math.max.apply(null, all);
    function col(v) { var t = (v - lo) / ((hi - lo) || 1); var a = [234, 243, 239], b = [11, 46, 40]; return "rgb(" + a.map(function (c, i) { return Math.round(c + (b[i] - c) * t); }).join(",") + ")"; }
    var h = '<div class="scroll"><div class="heat" style="grid-template-columns:64px repeat(' + months.length + ',minmax(18px,1fr));min-width:560px">';
    pairs.forEach(function (p) {
      h += '<div style="color:var(--ink2);align-self:center">' + p + "</div>";
      months.forEach(function (m) { var r = rows.find(function (q) { return q.month_end === m && q.currency_pair === p; }); h += '<div class="c" style="background:' + col(r.fx_margin_bps) + '" data-tip="<b>' + p + "</b><br>" + mlong(m) + "<br>Margin: " + r.fx_margin_bps + " bps<br>FX P&amp;L: " + money(r.fx_pnl_usd) + '"></div>'; });
    });
    h += "<div></div>" + months.map(function (m, i) { return '<div style="color:var(--muted);text-align:center">' + (i % 4 === 0 ? mlabel(m) : "") + "</div>"; }).join("");
    return h + '</div></div><div class="legend"><span>' + lo + ' bps</span><span style="flex:0 0 120px;height:9px;border-radius:5px;background:linear-gradient(90deg,' + col(lo) + "," + col(hi) + ')"></span><span>' + hi + " bps</span></div>";
  }

  // ---------------------------------------------------------------- views
  var main = document.getElementById("main");
  var VIEWS = { "Desk": desk, "Corridors": corridors, "FX & Margin": fxMargin, "Desk Notes": notes, "Ask the Desk": ask };
  var state = { view: "Desk", hiddenDesk: {}, hiddenFx: {}, sort: { k: "pnl12", d: -1 }, q: "", status: "", minBps: 0, note: null, answer: null, busy: false };

  function monthAgg() {
    return months.map(function (m) {
      var r = rows.filter(function (q) { return q.month_end === m; }), v = sum(r, function (q) { return q.cross_border_volume_usd; }), p = sum(r, function (q) { return q.fx_pnl_usd; });
      return { m: m, vol: v, pnl: p, txn: sum(r, function (q) { return q.txn_count; }), bps: p / v * 10000 };
    });
  }
  function count(el) {
    el.querySelectorAll("[data-count]").forEach(function (n) {
      var target = parseFloat(n.getAttribute("data-count")), dec = +n.getAttribute("data-dec"), t0 = null;
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) { n.textContent = target.toFixed(dec); return; }
      function step(ts) { t0 = t0 || ts; var k = Math.min(1, (ts - t0) / 700); n.textContent = (target * (1 - Math.pow(1 - k, 3))).toFixed(dec); if (k < 1) requestAnimationFrame(step); }
      requestAnimationFrame(step);
    });
  }
  function kpi(label, pre, num, dec, suf, d, vals) {
    return '<div class="kpi"><div class="k">' + esc(label) + '</div><div class="v">' + pre + '<span data-count="' + num + '" data-dec="' + dec + '">0</span>' + suf + '</div><div class="d">' + d + "</div>" + spark(vals) + "</div>";
  }

  function desk() {
    var a = monthAgg(), cur = a[a.length - 1], ya = a[a.length - 13], trail = a.slice(-12);
    var fastest = SUMM.slice().sort(function (p, q) { return q.volGrowth - p.volGrowth; })[0];
    var dec = a.filter(function (r) { return r.m.slice(5, 7) === "12"; }).pop(), oct = a.find(function (r) { return r.m === dec.m.slice(0, 4) + "-10-31"; });
    var top = SUMM[0].pnl12, yl = mlabel(ya.m).replace(" ", " 20");
    var h = head("Corridor desk", "Month-end " + mlong(cur.m) + " across 8 USD settlement corridors. Every figure comes from CROSS_BORDER_BENCHMARK.", cap("CROSS_BORDER_BENCHMARK view"));
    h += '<div class="kpis">' +
      kpi("Cross-border volume, month", "$", cur.vol / 1e9, 2, "B", delta(cur.vol / ya.vol - 1, ((cur.vol / ya.vol - 1) * 100).toFixed(1) + "% vs " + yl), trail.map(function (r) { return r.vol; })) +
      kpi("FX P&L, month", "$", cur.pnl / 1e6, 1, "M", delta(cur.pnl / ya.pnl - 1, ((cur.pnl / ya.pnl - 1) * 100).toFixed(1) + "% vs " + yl), trail.map(function (r) { return r.pnl; })) +
      kpi("Blended FX margin", "", cur.bps, 1, " bps", delta(cur.bps - ya.bps, (cur.bps - ya.bps >= 0 ? "+" : "") + (cur.bps - ya.bps).toFixed(1) + " bps vs " + yl), trail.map(function (r) { return r.bps; })) +
      kpi("Transactions, month", "", cur.txn / 1e6, 2, "M", delta(cur.txn / ya.txn - 1, ((cur.txn / ya.txn - 1) * 100).toFixed(1) + "% vs " + yl), trail.map(function (r) { return r.txn; })) + "</div>";
    h += '<div class="insight"><b>On the desk this month.</b> ' + fastest.pair + " is the fastest-growing lane (" + pct(fastest.volGrowth, 0) + " monthly volume since Jul 2024). Holiday lift: total volume rose " + pct(dec.vol / oct.vol - 1) + " from October to December " + dec.m.slice(0, 4) + ", then fell back in January. Open <b>Corridors</b> for any lane, or <b>Desk Notes</b> for a verified write-up.</div>";
    h += '<div class="grid2"><div class="card"><p class="ch">Monthly volume by corridor</p><p class="cs">Stacked, USD billions. Hover for a month; click the legend to hide a pair.</p><div id="area">' + stackedArea(state.hiddenDesk) + "</div>" + legend(state.hiddenDesk, "lg-desk") + "</div>";
    h += '<div class="card"><p class="ch">FX P&amp;L, last 12 months</p><p class="cs">Ranked by corridor; bar shows share of the leader.</p><ul class="rank">' + SUMM.map(function (s, i) {
      return '<li><span class="i">' + String(i + 1).padStart(2, "0") + "</span><div><div>" + s.pair + ' <span style="color:var(--muted)">· ' + esc(s.corridor.split("→")[1].trim()) + '</span></div><div class="bar"><i style="width:' + (s.pnl12 / top * 100).toFixed(0) + "%;background:" + COLORS[s.pair] + '"></i></div></div><div><div class="n">' + usd(s.pnl12) + "</div>" + delta(s.pnlGrowth, pct(s.pnlGrowth, 0)) + "</div></li>";
    }).join("") + "</ul></div></div>";
    var c = { Accelerating: 0, Steady: 0, "Margin watch": 0 }; SUMM.forEach(function (s) { c[s.status]++; });
    h += '<div class="card"><p class="ch">Corridor status</p><p class="cs">Margin watch: 3-month average margin down 3 bps or more since the start of the window. Accelerating: otherwise, FX P&amp;L up 15% or more on the prior 12 months.</p>' + Object.keys(c).map(function (k) { return pill(k) + ' <span style="font-family:var(--mono);margin-right:1rem">' + c[k] + "</span>"; }).join("") + "</div>";
    main.innerHTML = h; count(main); bindTips(main);
    main.querySelector("#lg-desk").addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return; var p = b.getAttribute("data-pair");
      state.hiddenDesk[p] = !state.hiddenDesk[p]; b.setAttribute("aria-pressed", String(!state.hiddenDesk[p]));
      main.querySelector("#area").innerHTML = stackedArea(state.hiddenDesk); bindTips(main.querySelector("#area"));
    });
  }

  var COLS = [["corridor", "Corridor"], ["pair", "Pair"], ["status", "Status"], ["volLatest", "Volume, latest"], ["trend", "Volume trend"], ["volGrowth", "Vol. growth"], ["m3", "Margin 3m (bps)"], ["dm", "Δ margin (bps)"], ["pnl12", "FX P&L 12m"], ["pnlGrowth", "P&L growth"]];
  function corridors() {
    var h = head("Corridors", "Every lane in the book. Filter, sort any column, and open a row for its detail.", cap("CROSS_BORDER_BENCHMARK view"));
    h += '<div class="card"><div class="filters"><label class="f">Search corridor or pair<input id="q" type="search" placeholder="e.g. INR or Brazil" value="' + esc(state.q) + '"></label>' +
      '<label class="f">Status<select id="st"><option value="">All statuses</option>' + ["Accelerating", "Steady", "Margin watch"].map(function (s) { return "<option" + (state.status === s ? " selected" : "") + ">" + s + "</option>"; }).join("") + "</select></label>" +
      '<label class="f">Min margin: <span id="bv">' + state.minBps + '</span> bps<input id="bps" type="range" min="0" max="100" step="5" value="' + state.minBps + '"></label></div></div>';
    h += '<div class="card" id="tbl"></div>';
    main.innerHTML = h;
    ["q", "st", "bps"].forEach(function (id) { main.querySelector("#" + id).addEventListener("input", function () { state.q = main.querySelector("#q").value; state.status = main.querySelector("#st").value; state.minBps = +main.querySelector("#bps").value; main.querySelector("#bv").textContent = state.minBps; table(); }); });
    table();
  }
  function table() {
    var q = state.q.toLowerCase(), list = SUMM.filter(function (s) {
      return (!q || s.corridor.toLowerCase().indexOf(q) >= 0 || s.pair.toLowerCase().indexOf(q) >= 0) && (!state.status || s.status === state.status) && s.m3 >= state.minBps;
    });
    var k = state.sort.k, d = state.sort.d;
    list.sort(function (a, b) { var x = a[k], y = b[k]; if (k === "trend") { x = a.volGrowth; y = b.volGrowth; } return (x > y ? 1 : x < y ? -1 : 0) * d; });
    var el = main.querySelector("#tbl");
    if (!list.length) { el.innerHTML = '<div class="empty"><b>No corridors match these filters</b>Clear the search or lower the margin floor.</div>'; return; }
    var h = '<p class="ch">' + list.length + ' corridors</p><p class="cs">Click a header to sort; click a row (or press Enter on it) for the detail drawer.</p><div class="scroll"><table class="t"><thead><tr>' + COLS.map(function (c) {
      var s = state.sort.k === c[0] ? (state.sort.d > 0 ? " ▲" : " ▼") : "";
      return '<th aria-sort="' + (s ? (state.sort.d > 0 ? "ascending" : "descending") : "none") + '"><button type="button" data-k="' + c[0] + '">' + esc(c[1]) + s + "</button></th>";
    }).join("") + "</tr></thead><tbody>";
    list.forEach(function (s) {
      h += '<tr tabindex="0" data-id="' + s.id + '"><td>' + esc(s.corridor) + "</td><td>" + s.pair + "</td><td>" + pill(s.status) + '</td><td class="n">' + money(s.volLatest) + "</td><td>" + spark(s.trend, COLORS[s.pair]) + '</td><td class="n">' + pct(s.volGrowth, 0) + '</td><td class="n">' + s.m3.toFixed(1) + '</td><td class="n">' + (s.dm >= 0 ? "+" : "") + s.dm.toFixed(1) + '</td><td class="n">' + money(s.pnl12) + '</td><td class="n">' + pct(s.pnlGrowth, 0) + "</td></tr>";
    });
    el.innerHTML = h + "</tbody></table></div>";
    el.querySelectorAll("th button").forEach(function (b) { b.addEventListener("click", function () { var k = b.getAttribute("data-k"); state.sort = { k: k, d: state.sort.k === k ? -state.sort.d : -1 }; table(); }); });
    el.querySelectorAll("tbody tr").forEach(function (tr) {
      tr.addEventListener("click", function () { openDrawer(tr.getAttribute("data-id")); });
      tr.addEventListener("keydown", function (e) { if (e.key === "Enter") openDrawer(tr.getAttribute("data-id")); });
    });
  }

  var drawer = document.getElementById("drawer"), scrim = document.getElementById("scrim"), lastFocus = null;
  function openDrawer(id) {
    var s = SUMM.find(function (x) { return x.id === id; }), g = byCorr(id);
    lastFocus = document.activeElement;
    var h = '<button class="x" type="button" id="close">Close ✕</button><p class="cs" style="margin:0">Corridor detail</p><div style="display:flex;gap:.6rem;align-items:center;flex-wrap:wrap;margin:.2rem 0 .8rem"><b style="font-size:1.15rem">' + esc(s.corridor) + '</b><span class="pill Steady">' + s.pair + "</span>" + pill(s.status) + "</div>";
    h += '<div class="kpis" style="grid-template-columns:repeat(2,minmax(0,1fr))">' +
      '<div class="kpi"><div class="k">Volume, latest month</div><div class="v">' + usd(s.volLatest) + '</div><div class="d">' + delta(s.volGrowth, pct(s.volGrowth, 0) + " since Jul 2024") + "</div></div>" +
      '<div class="kpi"><div class="k">FX P&amp;L, last 12 months</div><div class="v">' + usd(s.pnl12) + '</div><div class="d">' + delta(s.pnlGrowth, pct(s.pnlGrowth, 0) + " vs prior 12") + "</div></div>" +
      '<div class="kpi"><div class="k">Margin, 3-month avg</div><div class="v">' + s.m3.toFixed(1) + ' bps</div><div class="d">' + delta(s.dm, (s.dm >= 0 ? "+" : "") + s.dm.toFixed(1) + " bps vs first 3 months") + "</div></div>" +
      '<div class="kpi"><div class="k">FX rate, latest</div><div class="v">' + g[g.length - 1].fx_rate.toFixed(4) + '</div><div class="d">' + delta(s.fxChange, pct(s.fxChange) + " " + s.pair) + "</div></div></div>";
    h += '<div class="card"><p class="ch">FX P&amp;L by month (USD)</p>' + lines([{ name: "FX P&L", color: "#1F6F5F", vals: g.map(function (r) { return r.fx_pnl_usd / 1e6; }), tip: function (i) { return money(g[i].fx_pnl_usd) + " · " + g[i].fx_margin_bps + " bps"; } }], { h: 200, fmt: function (t) { return "$" + t + "M"; }, label: "FX P&L by month" }) + "</div>";
    h += '<div class="card"><p class="ch">' + s.pair + ' month-end rate (synthetic)</p>' + lines([{ name: s.pair, color: "#245C8A", vals: g.map(function (r) { return r.fx_rate; }), tip: function (i) { return g[i].fx_rate.toFixed(4); } }], { h: 170, fmt: function (t) { return +t.toFixed(3); }, label: s.pair + " rate by month" }) + "</div>";
    h += '<div class="card"><div class="scroll"><table class="t" style="min-width:560px"><thead><tr><th><button>Month-end</button></th><th><button>Volume</button></th><th><button>Margin bps</button></th><th><button>FX P&amp;L</button></th><th><button>FX rate</button></th></tr></thead><tbody>' +
      g.slice().reverse().map(function (r) { return "<tr><td>" + r.month_end + '</td><td class="n">' + money(r.cross_border_volume_usd) + '</td><td class="n">' + r.fx_margin_bps + '</td><td class="n">' + money(r.fx_pnl_usd) + '</td><td class="n">' + r.fx_rate.toFixed(4) + "</td></tr>"; }).join("") + "</tbody></table></div>";
    h += '<div class="src">Source: <code>CROSS_BORDER_BENCHMARK</code> where corridor_id = <code>' + id + "</code> · " + g.length + " month-ends</div></div>";
    document.getElementById("drawer-in").innerHTML = h;
    drawer.classList.add("open"); drawer.setAttribute("aria-hidden", "false"); scrim.hidden = false; bindTips(drawer);
    document.getElementById("close").focus();
    document.getElementById("close").addEventListener("click", closeDrawer);
  }
  function closeDrawer() { drawer.classList.remove("open"); drawer.setAttribute("aria-hidden", "true"); scrim.hidden = true; if (lastFocus) lastFocus.focus(); }
  scrim.addEventListener("click", closeDrawer);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && drawer.classList.contains("open")) closeDrawer(); });

  function fxMargin() {
    var pairs = PAIRS.filter(function (p) { return !state.hiddenFx[p]; });
    var h = head("FX & margin", "How the synthetic dollar moved against each pair, and what the desk earned per dollar settled.", cap("CROSS_BORDER_BENCHMARK view"));
    if (!pairs.length) pairs = [];
    var ser = pairs.map(function (p) {
      var g = rows.filter(function (r) { return r.currency_pair === p; }).sort(function (a, b) { return a.month_end < b.month_end ? -1 : 1; });
      return { name: p, color: COLORS[p], vals: g.map(function (r) { return r.fx_rate / g[0].fx_rate * 100; }), tip: function (i) { return g[i].fx_rate.toFixed(4) + " (index " + (g[i].fx_rate / g[0].fx_rate * 100).toFixed(1) + ")"; } };
    });
    h += '<div class="grid32"><div class="card"><p class="ch">FX rate, indexed (first month = 100)</p><p class="cs">Above 100: the dollar buys more of that currency than in July 2024. Click the legend to hide a pair.</p>' +
      (ser.length ? lines(ser, { ref: 100, fmt: function (t) { return t; }, label: "FX rates indexed to July 2024" }) : '<div class="empty"><b>No pairs selected</b>Turn a pair back on in the legend.</div>') + legend(state.hiddenFx, "lg-fx") + "</div>";
    h += '<div class="card"><p class="ch">Growth vs margin</p><p class="cs">Bubble size: FX P&amp;L, last 12 months.</p>' + scatter(SUMM.filter(function (s) { return pairs.indexOf(s.pair) >= 0; }).length ? SUMM.filter(function (s) { return pairs.indexOf(s.pair) >= 0; }) : SUMM) + "</div></div>";
    h += '<div class="card"><p class="ch">FX margin by month (bps)</p><p class="cs">Darker is richer. Single-month moves of a few bps are noise; compare 3-month averages on Corridors.</p>' + heat(pairs.length ? pairs : PAIRS) + "</div>";
    main.innerHTML = h; bindTips(main);
    main.querySelector("#lg-fx").addEventListener("click", function (e) { var b = e.target.closest("button"); if (!b) return; var p = b.getAttribute("data-pair"); state.hiddenFx[p] = !state.hiddenFx[p]; fxMargin(); });
  }

  // ---------------------------------------------------------------- AI (sample replay)
  function md(src) {
    var lines_ = src.replace(/\r/g, "").split("\n"), out = "", i = 0;
    function inline(t) { return esc(t).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/`([^`]+)`/g, "<code>$1</code>"); }
    while (i < lines_.length) {
      var l = lines_[i];
      if (/^\s*\|/.test(l)) {
        var tb = []; while (i < lines_.length && /^\s*\|/.test(lines_[i])) { tb.push(lines_[i]); i++; }
        var cells = function (r) { return r.trim().replace(/^\||\|$/g, "").split("|").map(function (c) { return c.trim(); }); };
        var body = tb.filter(function (r, j) { return !(j === 1 && /^[\s|:-]+$/.test(r)); });
        out += '<div class="scroll"><table><thead><tr>' + cells(body[0]).map(function (c) { return "<th>" + inline(c) + "</th>"; }).join("") + "</tr></thead><tbody>" + body.slice(1).map(function (r) { return "<tr>" + cells(r).map(function (c) { return "<td>" + inline(c) + "</td>"; }).join("") + "</tr>"; }).join("") + "</tbody></table></div>";
        continue;
      }
      if (/^#{1,3} /.test(l)) { var n = l.match(/^#+/)[0].length; out += "<h" + n + ">" + inline(l.replace(/^#+ /, "")) + "</h" + n + ">"; }
      else if (/^\s*[-*•] /.test(l)) { var li = []; while (i < lines_.length && /^\s*[-*•] /.test(lines_[i])) { li.push("<li>" + inline(lines_[i].replace(/^\s*[-*•] /, "")) + "</li>"); i++; } out += "<ul>" + li.join("") + "</ul>"; continue; }
      else if (/^\s*\d+\. /.test(l)) { var ol = []; while (i < lines_.length && /^\s*\d+\. /.test(lines_[i])) { ol.push("<li>" + inline(lines_[i].replace(/^\s*\d+\. /, "")) + "</li>"); i++; } out += "<ol>" + ol.join("") + "</ol>"; continue; }
      else if (/^---+$/.test(l.trim())) out += "<hr>";
      else if (l.trim()) out += "<p>" + inline(l) + "</p>";
      i++;
    }
    return out;
  }
  function stepsHtml(steps, cur, done) { return '<ul class="steps">' + steps.map(function (s, i) { return '<li class="' + (done || i < cur ? "done" : i === cur ? "now" : "") + '"><span class="ic"></span><span>' + esc(s) + "</span></li>"; }).join("") + "</ul>"; }
  function staged(el, steps, cb) {
    var total = 4000 + Math.random() * 4000, i = 0;
    el.innerHTML = '<div class="card">' + stepsHtml(steps, 0) + "</div>";
    var t = setInterval(function () { i++; if (i >= steps.length) { clearInterval(t); el.innerHTML = '<div class="card">' + stepsHtml(steps, steps.length, true) + "</div>"; cb(); return; } el.innerHTML = '<div class="card">' + stepsHtml(steps, i) + "</div>"; }, total / steps.length);
  }
  function streamInto(el, text, done) {
    var words = text.split(" "), n = 0;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { el.innerHTML = md(text); if (done) done(); return; }
    var t = setInterval(function () { n += 4; el.innerHTML = md(words.slice(0, n).join(" ")); if (n >= words.length) { clearInterval(t); el.innerHTML = md(text); if (done) done(); } }, 30);
  }
  var SAMPLE_LBL = '<span class="cap">Sample AI response · captured from a Live run</span>';
  function noteSteps(scope) {
    return ["Building the fact pack: " + (scope === "ALL" ? 16 : 2) + " rows from CROSS_BORDER_BENCHMARK (first and latest month-end)",
      "Drafting the desk note with AI_COMPLETE (claude-sonnet-4-5) under the DATA RULES",
      "Fact-checking every number against the fact pack with a second AI_COMPLETE pass", "Saving the note and verdict to CROSS_BORDER_REPORTS"];
  }
  function noteHtml(n) {
    var fp = n.fact_pack || [], ms = Array.from(new Set(fp.map(function (r) { return r.month; }))).sort();
    var e = (n.edits || []);
    return '<div style="display:flex;gap:.5rem;flex-wrap:wrap;align-items:center">' + verdict(n.status) + SAMPLE_LBL + '<span style="font-size:.8rem;color:var(--muted)">residual hedges: ' + n.residual_hedges + " · flagged: " + e.length + "</span></div>" +
      (e.length ? '<div class="insight" style="border-left-color:var(--loss);margin-top:.7rem"><b>Verifier flagged</b><br>' + e.map(function (x) { return "• " + esc(x); }).join("<br>") + "</div>" : "") +
      '<div class="note" id="notebody"></div><div class="src">Sources: ' + fp.length + " rows of <code>CROSS_BORDER_BENCHMARK</code> · months " + ms.map(function (m) { return "<code>" + m + "</code>"; }).join(", ") + " · model <code>" + esc(n.model) + "</code> · " + (n.latency_ms / 1000).toFixed(1) + " s measured in Live</div>";
  }
  function notes() {
    var h = head("Desk notes", "A one-page corridor note written only from a fact pack of allowed numbers, then fact-checked by a second model pass.", '<span class="cap">Sample AI responses · Cortex AI_COMPLETE in Live</span>');
    h += '<div class="grid13"><div class="card"><p class="ch">Write a note</p><p class="cs">First vs latest month-end, per corridor.</p><label class="f">Scope<select id="scope">' + Object.keys(SCOPES).map(function (k) { return '<option value="' + k + '">' + SCOPES[k] + "</option>"; }).join("") + '</select></label><div style="margin-top:.8rem"><button class="btn" id="run" type="button">Run cross-border analysis</button></div><div id="plan">' + stepsHtml(noteSteps("ALL"), -1) + '</div></div><div id="out">' +
      (state.note ? "" : '<div class="card empty"><b>No note open</b>Run an analysis, or open one from the library below.</div>') + "</div></div>";
    h += '<p class="ch" style="margin-top:.4rem">Note library</p><div class="libgrid">' + Object.keys(D.ai.notes).map(function (k) {
      var n = D.ai.notes[k], t = (n.markdown || "").split("\n")[0].replace(/^#+\s*/, "");
      return '<button class="lib" type="button" data-scope="' + k + '">' + verdict(n.status) + '<div class="t">' + esc(n.subject) + '</div><div class="s">' + esc(t.slice(0, 90)) + "</div></button>";
    }).join("") + "</div>";
    main.innerHTML = h;
    var sel = main.querySelector("#scope"), out = main.querySelector("#out");
    sel.addEventListener("change", function () { main.querySelector("#plan").innerHTML = stepsHtml(noteSteps(sel.value), -1); });
    function show(n, animate) { out.innerHTML = '<div class="card">' + noteHtml(n) + "</div>"; var b = out.querySelector("#notebody"); if (animate) streamInto(b, n.markdown); else b.innerHTML = md(n.markdown); }
    if (state.note) show(state.note, false);
    main.querySelector("#run").addEventListener("click", function () {
      var btn = this, n = D.ai.notes[sel.value]; btn.disabled = true;
      staged(out, noteSteps(sel.value), function () { btn.disabled = false; state.note = n; var steps = out.innerHTML; out.innerHTML = steps + '<div class="card">' + noteHtml(n) + "</div>"; streamInto(out.querySelector("#notebody"), n.markdown); });
    });
    main.querySelectorAll(".lib").forEach(function (b) { b.addEventListener("click", function () { state.note = D.ai.notes[b.getAttribute("data-scope")]; sel.value = b.getAttribute("data-scope"); show(state.note, false); out.scrollIntoView({ behavior: "smooth", block: "start" }); }); });
  }
  function answerHtml(a) {
    var t = a.table && a.table.rows && a.table.rows.length ? '<div class="scroll" style="margin-top:.6rem"><table class="t" style="min-width:0"><thead><tr>' + a.table.columns.map(function (c) { return "<th><button>" + esc(c) + "</button></th>"; }).join("") + "</tr></thead><tbody>" + a.table.rows.map(function (r) { return "<tr>" + r.map(function (c) { return "<td>" + esc(c) + "</td>"; }).join("") + "</tr>"; }).join("") + "</tbody></table></div>" : "";
    return '<div style="display:flex;gap:.5rem;flex-wrap:wrap;align-items:center"><b>' + esc(a.question) + "</b>" + SAMPLE_LBL + '</div><div class="note" id="ansbody"></div>' + t +
      (a.sql ? '<details><summary>SQL written by Cortex Analyst</summary><pre class="sql">' + esc(a.sql) + "</pre></details>" : "") +
      '<div class="src">Source: semantic view <code>CROSS_BORDER_SV</code> via agent <code>CROSS_BORDER_AGENT</code> · ' + (a.latency_ms / 1000).toFixed(1) + " s measured in Live</div>";
  }
  function ask() {
    var h = head("Ask the desk", "Plain-English questions about the book. The agent writes SQL over the semantic view and answers only from the result.", '<span class="cap">Sample AI responses · Cortex Agents in Live</span>');
    h += '<div class="card"><p class="cs">Try a question</p><div class="qs">' + Object.keys(D.ai.ask).map(function (q, i) { return '<button type="button" data-i="' + i + '">' + esc(q) + "</button>"; }).join("") + '</div><p class="cs" style="margin:.7rem 0 0">This hosted example replays these four questions. Run the app Live to ask your own.</p></div><div id="ans">' +
      (state.answer ? "" : '<div class="card empty"><b>No question yet</b>Pick a suggested question to see the agent at work.</div>') + "</div>";
    main.innerHTML = h;
    var out = main.querySelector("#ans"), qs = Object.keys(D.ai.ask);
    if (state.answer) { out.innerHTML = '<div class="card">' + answerHtml(state.answer) + "</div>"; out.querySelector("#ansbody").innerHTML = md(state.answer.text); }
    main.querySelectorAll(".qs button").forEach(function (b) {
      b.addEventListener("click", function () {
        if (state.busy) return; state.busy = true;
        main.querySelectorAll(".qs button").forEach(function (x) { x.classList.toggle("on", x === b); });
        var a = D.ai.ask[qs[+b.getAttribute("data-i")]];
        staged(out, ASK_STEPS, function () { state.busy = false; state.answer = a; out.innerHTML += '<div class="card">' + answerHtml(a) + "</div>"; streamInto(out.querySelector("#ansbody"), a.text); });
      });
    });
  }

  // ---------------------------------------------------------------- shell
  function livePanel() {
    main.innerHTML = head("Live mode runs on Snowflake", "This hosted example is always Sample mode and never asks for credentials.", '<span class="cap">Hosted example</span>') +
      '<div class="card live-panel"><p>To see the same app on live Snowflake data:</p><ol><li>Run <code>sql/setup.sql</code> in a Snowsight worksheet (about 15 seconds on an XSMALL warehouse).</li><li>Deploy the Streamlit app in Snowflake, or run it locally with key-pair auth: set <code>SNOWFLAKE_ACCOUNT</code>, <code>SNOWFLAKE_USER</code> and <code>SNOWFLAKE_PRIVATE_KEY_PATH</code>, then <code>streamlit run app/streamlit_app.py</code>.</li></ol><p><a href="https://github.com/sfc-gh-jsoliz/sfguide-cross-border-fx#live-mode">Live-mode guide in the repository</a></p><button class="btn ghost" type="button" id="back" style="width:auto">Back to Sample mode</button></div>';
    main.querySelector("#back").addEventListener("click", function () { setMode("Sample"); });
  }
  function setMode(m) {
    document.querySelectorAll(".seg button").forEach(function (b) { var on = b.getAttribute("data-mode") === m; b.classList.toggle("on", on); b.setAttribute("aria-pressed", String(on)); });
    if (m === "Live") livePanel(); else go(state.view);
  }
  document.querySelectorAll(".seg button").forEach(function (b) { b.addEventListener("click", function () { setMode(b.getAttribute("data-mode")); }); });
  var tabs = document.getElementById("tabs");
  tabs.setAttribute("role", "tablist");
  tabs.innerHTML = Object.keys(VIEWS).map(function (v) { return '<button type="button" role="tab" aria-selected="false">' + v + "</button>"; }).join("");
  function go(v) {
    state.view = v;
    tabs.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-selected", String(b.textContent === v)); });
    document.querySelectorAll(".seg button").forEach(function (b) { var on = b.getAttribute("data-mode") === "Sample"; b.classList.toggle("on", on); b.setAttribute("aria-pressed", String(on)); });
    hideTip(); VIEWS[v](); history.replaceState(null, "", "#" + encodeURIComponent(v));
  }
  tabs.addEventListener("click", function (e) { var b = e.target.closest("button"); if (b) go(b.textContent); });
  // first paint: a short skeleton, then the desk
  main.innerHTML = '<div class="kpis">' + [1, 2, 3, 4].map(function () { return '<div class="skel" style="height:96px"></div>'; }).join("") + '</div><div class="skel" style="height:300px"></div>';
  var start = decodeURIComponent((location.hash || "").slice(1));
  setTimeout(function () { go(VIEWS[start] ? start : "Desk"); }, 350);
})();
