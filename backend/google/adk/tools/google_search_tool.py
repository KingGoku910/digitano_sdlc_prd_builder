"""
Google Search Tool for Google ADK Agents
"""

class GoogleSearchTool:
    def __init__(self, bypass_multi_tools_limit: bool = True):
        self.bypass_multi_tools_limit = bypass_multi_tools_limit
        self.name = "google_search"
        self.description = "Retrieves live market research, competitor metrics, and library documentation."

    def search(self, query: str) -> str:
        return f"Market search results for: {query}"
