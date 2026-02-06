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

        # Check for Quick Start
        if "Quick Start" not in content:
            print("FAILURE: Missing 'Quick Start' section in index.html")
            sys.exit(1)
        if "git clone https://github.com/sszz01/LogoMesh.git" not in content:
            print("FAILURE: Missing git clone command in Quick Start")
            sys.exit(1)

        # Check for Footer Links
        links_to_check = [
            "https://github.com/joshhickson/LogoMesh/tree/master",
            "https://agentbeats.dev/joshhickson/logomesh-green"
        ]
        for link in links_to_check:
            if link not in content:
                print(f"FAILURE: Missing footer link: {link}")
                sys.exit(1)

        print("SUCCESS: Home page verified.")
        await page.screenshot(path="external/blog-logomesh/verification/index_v2.png", full_page=True)

        # 2. Verify Research Page (Tex Loading)
        print("Navigating to Research Page...")
        await page.click("text=Research")

        # Wait for the paper container to become visible (indicating loading success)
        # Note: In a real browser, this depends on Latex.js.
        # Since we are checking static file delivery, we verify the structure exists.
        try:
            await page.wait_for_selector("#paper-container", state="attached")
        except:
            print("FAILURE: Research page did not load paper container")
            sys.exit(1)

        content = await page.content()
        if "assets/tex/paper.tex" not in content:
            print("FAILURE: Research page does not seem to reference the tex file")
            sys.exit(1)

        print("SUCCESS: Research page structure verified.")
        await page.screenshot(path="external/blog-logomesh/verification/research_v2.png", full_page=True)

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
