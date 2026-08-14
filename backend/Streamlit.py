import streamlit as st
from pipeline import run_research_pipeline

st.set_page_config(
    page_title="Multi-Agent AI Research",
    page_icon="🔎",
    layout="wide",
)

st.title("🔎 Multi-Agent AI Research")
st.caption("Search → Read → Write → Critique, powered by your multi-agent pipeline.")

# Keep results across reruns (e.g. when switching tabs)
if "state" not in st.session_state:
    st.session_state.state = None

with st.sidebar:
    st.header("New Research")
    topic = st.text_input("Research topic", placeholder="e.g. Latest advances in solid-state batteries")
    run_clicked = st.button("Run pipeline", type="primary", use_container_width=True)
    st.divider()
    st.caption("This runs `run_research_pipeline()` from `pipeline.py`. Each step (search, read, write, critique) will run in sequence — larger topics may take a minute or two.")

if run_clicked:
    if not topic.strip():
        st.sidebar.error("Please enter a topic first.")
    else:
        status_box = st.status("Running research pipeline...", expanded=True)
        try:
            status_box.write("🔍 Searching for information...")
            status_box.write("📄 Extracting content from URLs...")
            status_box.write("✍️ Writing research report...")
            status_box.write("🧐 Critiquing the report...")

            # run_research_pipeline runs all steps internally; the messages
            # above just set expectations while we wait for it to finish.
            result = run_research_pipeline(topic)

            st.session_state.state = result
            st.session_state.topic = topic
            status_box.update(label="Pipeline complete ✅", state="complete", expanded=False)
        except Exception as e:
            status_box.update(label="Pipeline failed ❌", state="error", expanded=True)
            st.error(f"Something went wrong: {e}")

state = st.session_state.state

if state:
    st.subheader(f"Results for: {st.session_state.get('topic', '')}")

    tab_report, tab_feedback, tab_search, tab_scraped = st.tabs(
        ["📝 Report", "🧐 Feedback", "🔍 Search Results", "📄 Scraped Content"]
    )

    with tab_report:
        st.markdown(state.get("report", "_No report generated._"))
        st.download_button(
            "Download report (.md)",
            data=str(state.get("report", "")),
            file_name=f"{st.session_state.get('topic', 'report').replace(' ', '_')}_report.md",
            mime="text/markdown",
        )

    with tab_feedback:
        st.markdown(state.get("feedback", "_No feedback generated._"))

    with tab_search:
        st.text(state.get("search_result", "_No search results._"))

    with tab_scraped:
        st.text(state.get("scraped_content", "_No scraped content._"))
else:
    st.info("Enter a topic in the sidebar and click **Run pipeline** to get started.")