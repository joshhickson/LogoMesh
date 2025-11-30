
from playwright.sync_api import sync_playwright
import time

def verify_graph_screenshot():
    try:
        with sync_playwright() as p:
            print("Launching browser...")
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()

            # Capture console logs
            page.on("console", lambda msg: print(f"BROWSER CONSOLE: {msg.text}"))
            page.on("pageerror", lambda exc: print(f"BROWSER ERROR: {exc}"))
            page.on("requestfailed", lambda request: print(f"REQUEST FAILED: {request.url} - {request.failure}"))

            print("Navigating to onboarding site...")
            response = page.goto("http://localhost:3000")
            print(f"Navigation status: {response.status}")

            # Check if mermaid is loaded
            mermaid_type = page.evaluate("typeof window.mermaid")
            print(f"window.mermaid type: {mermaid_type}")

            print("Waiting for graph to render...")
            # Wait for Mermaid to inject SVG
            try:
                # Check if mermaid container exists
                page.wait_for_selector("#mermaid-container", timeout=10000)

                # Check if it has SVG content (successful render)
                page.wait_for_selector("#mermaid-container svg", timeout=10000)
                print("Mermaid SVG detected! Graph rendered successfully.")
            except Exception as e:
                print(f"Timeout waiting for Mermaid SVG: {e}")
                # Get the text content of the container to see the error or raw syntax
                content = page.inner_text("#mermaid-container")
                print(f"Container Content (first 500 chars): {content[:500]}...")

                # Check for mermaid specific error div
                if page.locator(".error-icon").count() > 0:
                    print("Mermaid Error Icon detected.")

                # Try to get innerHTML to see if there are error messages hidden
                inner_html = page.inner_html("#mermaid-container")
                print(f"Container innerHTML (first 500 chars): {inner_html[:500]}...")

            # Wait a bit
            time.sleep(2)

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
