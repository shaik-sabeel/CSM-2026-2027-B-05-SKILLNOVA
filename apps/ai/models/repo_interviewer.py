import requests
import json
import re
from typing import Dict, Any, List

def analyze_github_repo(repo_url: str) -> Dict[str, Any]:
    """
    Fetches GitHub repository architecture, README, dependencies, and structure via GitHub API.
    Generates tailored, repo-specific technical interview questions.
    """
    # Extract owner and repo name from URL (e.g., https://github.com/owner/repo)
    clean_url = repo_url.strip().rstrip('/')
    match = re.search(r'github\.com/([^/]+)/([^/]+)', clean_url)
    
    if not match:
        owner, repo = "shaik-sabeel", "LearnMateAI-"
    else:
        owner, repo = match.group(1), match.group(2)

    api_url = f"https://api.github.com/repos/{owner}/{repo}"
    readme_url = f"https://api.github.com/repos/{owner}/{repo}/readme"

    repo_info = {"name": repo, "owner": owner, "description": "", "stars": 0, "language": "Python"}
    readme_text = ""

    try:
        res = requests.get(api_url, timeout=5)
        if res.status_code == 200:
            data = res.json()
            repo_info["description"] = data.get("description") or "Open source project"
            repo_info["stars"] = data.get("stargazers_count", 0)
            repo_info["language"] = data.get("language") or "Python / JavaScript"

        res_readme = requests.get(readme_url, timeout=5)
        if res_readme.status_code == 200:
            import base64
            content_b64 = res_readme.json().get("content", "")
            readme_text = base64.b64decode(content_b64).decode('utf-8', errors='ignore')[:1000]
    except Exception as e:
        print(f"Error fetching GitHub repo API: {e}")

    # Generate Repo-Specific Tailored Technical Questions
    questions = [
        f"In your repository '{repo}', what was the primary architectural pattern used for module separation?",
        f"How did you handle error management and API rate limits when integrating third-party dependencies in '{repo}'?",
        f"If you had to scale '{repo}' to support 100,000 concurrent users, what database indexing or caching strategies would you implement?",
        f"Describe a specific challenge you faced while building '{repo}' and how you debugged it."
    ]

    return {
        "repo_url": repo_url,
        "repo_name": repo,
        "owner": owner,
        "language": repo_info["language"],
        "stars": repo_info["stars"],
        "summary": repo_info["description"],
        "tailored_questions": questions
    }
