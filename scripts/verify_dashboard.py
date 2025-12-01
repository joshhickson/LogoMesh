from playwright.sync_api import sync_playwright
import time
import os

def take_screenshots():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        # 1. Capture Index Page
        page = browser.new_page()
        page.goto("http://localhost:3000")
        time.sleep(1) # Let styles load
        index_screenshot = "onboarding/screenshot_index.png"
        page.screenshot(path=index_screenshot, full_page=True)
        print(f"Index screenshot saved to {index_screenshot}")

        # 2. Capture Dashboard Page
        page = browser.new_page()

        # Listen for console logs
        page.on("console", lambda msg: print(f"Console: {msg.text}"))
        page.on("pageerror", lambda msg: print(f"PageError: {msg}"))

        page.goto("http://localhost:3000/graph_dashboard.html")

        # Wait for SVG to render
        try:
            page.wait_for_selector(".mermaid svg", timeout=10000)
            print("Mermaid SVG rendered.")
        except Exception as e:
            print(f"Timeout waiting for SVG: {e}")

        time.sleep(2) # Allow pan-zoom to initialize and layout to settle

        dashboard_screenshot = "onboarding/screenshot_dashboard.png"
        page.screenshot(path=dashboard_screenshot, full_page=True)
        print(f"Dashboard screenshot saved to {dashboard_screenshot}")

        browser.close()

if __name__ == "__main__":
    take_screenshots()
