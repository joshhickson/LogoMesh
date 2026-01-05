import json
import base64
import os

# Configuration
INPUT_FILE = 'docs/04-Operations/Intent-Log/Josh/20260104-Agent-Battle-Chat.json'
OUTPUT_FILE = 'docs/04-Operations/Intent-Log/Josh/20260104-Agent-Battle-Thinking-Decoded.md'

def decode_thinking(value):
    """
    Attempts to decode a thinking value.
    If it looks like base64, decodes it.
    Otherwise, returns it as is.
    """
    # Heuristic for Base64: no spaces, reasonably long (though shorter ones exist)
    if ' ' not in value and len(value) > 20:
        try:
            decoded_bytes = base64.b64decode(value)
            # Try to decode as utf-8, ignore errors if it's binary data
            decoded_text = decoded_bytes.decode('utf-8', errors='ignore')
            return f"**[Decoded Base64]**\n\n{decoded_text}"
        except Exception:
            # If decoding fails, return original
            return value
    return value

def extract_thinking():
    if not os.path.exists(INPUT_FILE):
        print(f"Error: Input file not found: {INPUT_FILE}")
        return

    try:
        with open(INPUT_FILE, 'r') as f:
            data = json.load(f)
    except json.JSONDecodeError as e:
        print(f"Error decoding JSON: {e}")
        return

    output_content = ["# Agent Battle Thinking Log (Decoded)\n\n"]

    requests = data.get('requests', [])
    for req_idx, req in enumerate(requests):
        message_text = req.get('message', {}).get('text', 'No message text')
        output_content.append(f"## Request {req_idx + 1}\n\n**User Message:** {message_text}\n\n")

        responses = req.get('response', [])
        for resp in responses:
            if resp.get('kind') == 'thinking':
                raw_value = resp.get('value', '')
                generated_title = resp.get('generatedTitle', 'No Title')

                output_content.append(f"### Thinking Block ({generated_title})\n")

                decoded_value = decode_thinking(raw_value)

                # Format code blocks for better readability in markdown
                output_content.append(f"{decoded_value}\n\n")
                output_content.append("---\n")

    with open(OUTPUT_FILE, 'w') as f:
        f.writelines(output_content)

    print(f"Successfully extracted and decoded thinking blocks to {OUTPUT_FILE}")

if __name__ == "__main__":
    extract_thinking()
