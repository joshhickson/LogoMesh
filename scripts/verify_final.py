from playwright.sync_api import sync_playwright
import time
import os

def take_screenshots():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        # Setup
        os.makedirs("/home/jules/verification", exist_ok=True)

        # 1. Index Page
        page = browser.new_page()
        page.set_viewport_size({"width": 1280, "height": 720})
        page.goto("http://localhost:3000")
        time.sleep(1)
        index_path = "/home/jules/verification/final_index.png"
        page.screenshot(path=index_path, full_page=True)
        print(f"Index screenshot saved to {index_path}")

        # 2. Dashboard Page
        page = browser.new_page()
        page.set_viewport_size({"width": 1920, "height": 1080})
        page.goto("http://localhost:3000/graph_dashboard.html")

        try:
            page.wait_for_selector(".mermaid svg", timeout=20000)
            page.wait_for_selector("#sidebar", timeout=5000)
            print("Dashboard elements rendered.")
        except Exception as e:
            print(f"Error waiting for dashboard: {e}")

        time.sleep(3) # Settle layout

        dash_path = "/home/jules/verification/final_dashboard.png"
        page.screenshot(path=dash_path, full_page=True)
        print(f"Dashboard screenshot saved to {dash_path}")

        browser.close()

if __name__ == "__main__":
    take_screenshots()
