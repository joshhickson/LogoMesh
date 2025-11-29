
from playwright.sync_api import sync_playwright

def verify_graph_screenshot():
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()

            # Capture console logs
            page.on("console", lambda msg: print(f"BROWSER CONSOLE: {msg.text}"))
            page.on("pageerror", lambda exc: print(f"BROWSER ERROR: {exc}"))

            print("Navigating to onboarding site...")
            page.goto("http://localhost:3000")

            print("Waiting for graph to render...")
            # Wait for at least one node circle to appear, indicating D3 has rendered
            try:
                page.wait_for_selector(".nodes circle", timeout=15000)
                print("Graph nodes detected!")
            except Exception as e:
                print(f"Timeout waiting for nodes: {e}")
                print("Taking screenshot anyway for debug.")

            # Wait a bit more for force simulation to settle
            page.wait_for_timeout(3000)

            print("Taking screenshot...")
            screenshot_path = "onboarding_graph.png"
            page.screenshot(path=screenshot_path, full_page=True)
            print(f"Screenshot saved to {screenshot_path}")

            browser.close()

    except Exception as e:
        print(f"Error during verification: {e}")
        raise e

if __name__ == "__main__":
    verify_graph_screenshot()
