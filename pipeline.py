from agents import build_search_agent, build_reader_agent, writer_chain, critic_chain

def run_research_pipeline(topic:str)->dict:
    state={}
 
    # Step 1: Search for relevant information
    print("\n"+"="*50)
    print(f"\nSearching for information on: {topic}")    

    search_agent = build_search_agent()
    search_result = search_agent.invoke({
        "messages": [("user", f"Find recent, reliable and detailed information about: {topic}")]
    })

    state['search_result'] = search_result['messages'][-1].content

    print("\n"+"="*50)
    print("\n Search Results:", state['search_result'])



    # Step 2: Read and extract information from URLs
    print("\n"+"="*50)
    print(f"\nExtracting information from URLs found in search results...")

    reader_agent = build_reader_agent()
    reader_result = reader_agent.invoke({
        "messages": [("user", f"Extract detailed information from the following URLs:\n{state['search_result'][:800]}")]
    })

    state['scraped_content'] = reader_result['messages'][-1].content

    print("\n"+"="*50)
    print("\n Reader Results:", state['scraped_content'])        



    # Step 3: Write a research report
    print("\n"+"="*50)
    print(f"\nWriting a research report based on the gathered information...")

    research_combined = (
        f"Search Results:\n{state['search_result']}\n\n"
        f"Scraped Content:\n{state['scraped_content']}"
    )

    state['report'] = writer_chain.invoke({
        "topic": topic, 
        "research": research_combined
    })

    print("\n"+"="*50)
    print("\n Research Report:", state['report'])

    # Step 4: Critique the research report
    print("\n"+"="*50)
    print(f"\nCritiquing the research report...")

    state['feedback'] = critic_chain.invoke({
        "report": state['report']
    })

    print("\n"+"="*50)
    print("\n Feedback:", state['feedback'])

    return state


if __name__ == "__main__":
    topic =input("Enter a research topic: ")
    run_research_pipeline(topic)