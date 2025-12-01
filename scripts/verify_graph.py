
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

            print("Navigating to onboarding site...")
            page.goto("http://localhost:3000")

            print("Waiting for graph to render...")
            try:
                page.wait_for_selector("#mermaid-container svg", timeout=10000)
                print("Mermaid SVG detected.")

                # Get dimensions
                dimensions = page.evaluate("""() => {
                    const container = document.getElementById('mermaid-container');
                    const svg = container.querySelector('svg');
                    const rect = svg.getBoundingClientRect();
                    return {
                        containerHeight: container.offsetHeight,
                        containerScrollHeight: container.scrollHeight,
                        svgHeightAttr: svg.getAttribute('height'),
                        svgViewBox: svg.getAttribute('viewBox'),
                        svgRectHeight: rect.height,
                        svgStyleHeight: svg.style.height,
                        svgStyleMaxWidth: svg.style.maxWidth
                    };
                }""")
                print(f"Dimensions: {dimensions}")

            except Exception as e:
                print(f"Error checking dimensions: {e}")

            # Wait a bit
            time.sleep(1)

            print("Taking screenshot...")
            screenshot_path = "onboarding_graph.png"
            page.screenshot(path=screenshot_path, full_page=True)
            print(f"Screenshot saved to {screenshot_path}")

            browser.close()

    except Exception as e:
        print(f"Error during verification: {e}")
        # raise e # Don't raise, just finish so I can see logs

if __name__ == "__main__":
    verify_graph_screenshot()
