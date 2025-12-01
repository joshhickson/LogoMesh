from playwright.sync_api import sync_playwright
import time
import os

def take_screenshots():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        page = browser.new_page()
        page.set_viewport_size({"width": 1920, "height": 1080})

        # Listen for console logs
        page.on("console", lambda msg: print(f"Console: {msg.text}"))
        page.on("pageerror", lambda msg: print(f"PageError: {msg}"))

        page.goto("http://localhost:3000/graph_dashboard.html")

        # Wait for SVG to render
        try:
            page.wait_for_selector(".mermaid svg", timeout=20000)
            print("Mermaid SVG rendered.")
        except Exception as e:
            print(f"Timeout waiting for SVG: {e}")

        # Wait for Sidebar
        try:
            page.wait_for_selector("#sidebar", timeout=5000)
            print("Sidebar rendered.")
        except:
            print("Sidebar not found.")

        time.sleep(3) # Allow layout to settle

        # Ensure directory exists
        os.makedirs("/home/jules/verification", exist_ok=True)

        dashboard_screenshot = "/home/jules/verification/screenshot_dashboard_v3.png"
        page.screenshot(path=dashboard_screenshot, full_page=True)
        print(f"Dashboard screenshot saved to {dashboard_screenshot}")

        browser.close()

if __name__ == "__main__":
    take_screenshots()
