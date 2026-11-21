"""Cross-Border & FX on Snowflake.

Run locally (Sample mode, no account):   streamlit run app/streamlit_app.py
Live mode locally: set SNOWFLAKE_ACCOUNT, SNOWFLAKE_USER and SNOWFLAKE_PRIVATE_KEY_PATH
(key-pair auth) and restart. In Streamlit in Snowflake the app uses its own session.
"""
import os
import sys

import streamlit as st

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import brand  # noqa: E402
import data  # noqa: E402
from views import ask, corridors, desk, fx_margin, notes  # noqa: E402

st.set_page_config(page_title="Cross-Border & FX", page_icon="🧭", layout="wide",
                   initial_sidebar_state="collapsed")
st.markdown(brand.CSS, unsafe_allow_html=True)

LIVE_OK = data.live_configured()
if "mode" not in st.session_state:
    st.session_state.mode = "Live" if LIVE_OK else "Sample"

VIEWS = {
    "Desk": desk.render,
    "Corridors": corridors.render,
    "FX & Margin": fx_margin.render,
    "Desk Notes": notes.render,
    "Ask the Desk": ask.render,
}

with st.container(key="topbar"):
    c1, c2, c3 = st.columns([4.2, 2, 4], vertical_alignment="center")
    with c1:
        st.html(
        f'<div class="fv-brand">{brand.LOGO_IMG}<div><b>Cross-Border &amp; FX</b>'
        '<span>Cross-border volume, FX margin and FX P&amp;L · treasury &amp; FX desk</span></div></div>')
    with c2:
        st.segmented_control("Data mode", ["Sample", "Live"], key="mode", label_visibility="collapsed",
                             help="Sample: bundled synthetic data, no account. Live: the same app on Snowflake.")
    mode = st.session_state.mode or st.session_state.get("_last_mode", "Sample")
    st.session_state["_last_mode"] = mode
    env = ('<span class="fv-chip live"><span class="fv-dot"></span>Live · Snowflake</span>' if mode == "Live"
           else '<span class="fv-chip sample"><span class="fv-dot"></span>Sample data</span>')
    with c3:
        st.html(f'<div class="fv-chips">{env}<span class="fv-chip">FX desk analyst · {data.ROLE}</span></div>')

with st.container(key="nav"):
    view = st.radio("View", list(VIEWS), horizontal=True, label_visibility="collapsed", key="view")

if mode == "Live" and not LIVE_OK:
    st.markdown(brand.header("Connect Live mode", "Live mode runs this same app on Snowflake. No connection is configured, so nothing is shown instead of falling back to sample data.", "Setup needed"), unsafe_allow_html=True)
    st.markdown("1. Run `sql/setup.sql` in a Snowsight worksheet (about 15 s on an XSMALL warehouse).\n"
                "2. Register a key pair on your Snowflake user, then set these variables and restart:")
    st.code("export SNOWFLAKE_ACCOUNT=<org-account>\nexport SNOWFLAKE_USER=<YOUR_USER>\n"
            "export SNOWFLAKE_PRIVATE_KEY_PATH=~/.snowflake/keys/<your_key>.p8\n"
            "streamlit run app/streamlit_app.py", language="bash")
    st.markdown("Or deploy the app as Streamlit in Snowflake (README, *Deploy the app in Snowflake*). "
                "Switch back to **Sample** to keep exploring.")
    st.stop()

VIEWS[view](mode)
