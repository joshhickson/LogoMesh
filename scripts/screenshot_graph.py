from playwright.sync_api import sync_playwright
import time

def take_screenshot():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the onboarding server
        page.goto("http://localhost:3000")

        # Wait for the graph container to be present
        page.wait_for_selector(".nodes", timeout=10000)

        # Wait a bit for the force simulation to settle (animation)
        time.sleep(3)

        # Take the screenshot
        screenshot_path = "onboarding/high-fidelity-map.png"
        page.screenshot(path=screenshot_path, full_page=True)
        print(f"Screenshot saved to {screenshot_path}")

        browser.close()

if __name__ == "__main__":
    take_screenshot()
