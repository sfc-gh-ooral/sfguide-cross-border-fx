"""Shared view helpers: load data with a skeleton, show Live errors (never fall back)."""
import altair as alt
import streamlit as st

import brand
import data


def load(mode):
    ph = st.empty()
    if mode == "Live" and not st.session_state.get("_bench_loaded"):
        ph.markdown(brand.skeleton(), unsafe_allow_html=True)
    try:
        df = data.benchmark(mode)
    except Exception as e:  # Live failure: show it, do not substitute sample data
        ph.empty()
        st.error(f"Live query failed: {e}")
        st.caption("Check that sql/setup.sql ran and your role is CROSS_BORDER_FX_ROLE, or switch to Sample.")
        st.stop()
    st.session_state["_bench_loaded"] = True
    ph.empty()
    return df


def cap(mode, text):
    if mode == "Live":
        return f"Live · {text}"
    return f"Sample data · {text}"


def theme():
    def _t():
        return {"config": {
            "font": "Space Grotesk",
            "view": {"stroke": None},
            "axis": {"labelColor": brand.T["muted"], "titleColor": brand.T["ink2"], "gridColor": "#E1EAE6",
                     "domainColor": brand.T["line"], "tickColor": brand.T["line"], "labelFontSize": 11,
                     "titleFontSize": 11, "titleFontWeight": 500},
            "axisX": {"grid": False},
            "legend": {"labelColor": brand.T["ink2"], "titleColor": brand.T["muted"], "labelFontSize": 11,
                       "titleFontSize": 11, "orient": "bottom", "symbolType": "circle"},
            "background": "transparent",
        }}
    alt.themes.register("cross_border_fx", _t)
    alt.themes.enable("cross_border_fx")


def pair_scale():
    return alt.Scale(domain=list(brand.PAIR_COLORS), range=list(brand.PAIR_COLORS.values()))
