import os
import sys
import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        # 1. Verify Home Page
        print("Navigating to Home Page...")
        response = await page.goto("http://localhost:8000/index.html")
        if response.status != 200:
            print(f"Error: Failed to load index.html (Status {response.status})")
            sys.exit(1)

        content = await page.content()

        # Check for banned terms
        if "CIS Score" in content:
            print("FAILURE: Found redundant term 'CIS Score' in index.html")
            sys.exit(1)
        if "Cyber-Sentinel" in content:
            print("FAILURE: Found legacy term 'Cyber-Sentinel' in index.html")
            sys.exit(1)

        # Check for required terms
        required_terms = [
            "Multi-Agent Evaluation Arena",
            "Contextual Integrity Score",
            "Rationale Integrity",
            "MCTS",
            "Docker Sandbox"
        ]

        for term in required_terms:
            if term not in content:
                print(f"FAILURE: Missing term '{term}' in index.html")
                sys.exit(1)

        print("SUCCESS: Home page content verified.")
        await page.screenshot(path="verification/index.png", full_page=True)
        print("Screenshot saved to verification/index.png")

        # 2. Verify Tasks Page
        print("Navigating to Task Library...")
        await page.click("text=Task Library")
        await page.wait_for_selector(".task-card")

        content = await page.content()

        # Check for task content
        if "Recursive Fibonacci" not in content:
            print("FAILURE: Missing 'Recursive Fibonacci' task")
            sys.exit(1)
        if "task-020" not in content:
            print("FAILURE: Missing task-020")
            sys.exit(1)

        print("SUCCESS: Task Library verified.")
        await page.screenshot(path="verification/tasks.png", full_page=True)
        print("Screenshot saved to verification/tasks.png")

        await browser.close()

if __name__ == "__main__":
    if not os.path.exists("verification"):
        os.makedirs("verification")
    asyncio.run(run())
