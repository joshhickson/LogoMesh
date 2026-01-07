import json
import base64
import os

# Configuration
INPUT_FILE = 'docs/04-Operations/Intent-Log/Josh/20260104-Agent-Battle-Chat.json'
OUTPUT_FILE = 'docs/04-Operations/Intent-Log/Josh/20260104-Agent-Battle-Thinking-Decoded.md'

def decode_string(value):
    """
    Attempts to decode a string as base64.
    Returns the decoded text if successful and looks like text,
    otherwise returns None.
    """
    # Heuristic for Base64: no spaces, reasonably long
    if ' ' not in value and len(value) > 20:
        try:
            decoded_bytes = base64.b64decode(value)
            # Try to decode as utf-8, ignore errors
            decoded_text = decoded_bytes.decode('utf-8', errors='ignore')
            # Heuristic to check if it looks like useful text (not just random binary garbage)
            # If it's mostly printable characters, we assume it's good.
            # But since the prompt said it might be binary serialization, we will just output it
            # and let the markdown viewer handle it (maybe escaping control chars if needed, but simple decode is fine)
            return decoded_text
        except Exception:
            return None
    return None

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
                block_id = resp.get('id', '')
                generated_title = resp.get('generatedTitle', 'No Title')

                output_content.append(f"### Thinking Block ({generated_title})\n")

                content_to_show = ""

                # Case 1: Value is present (Human Readable CoT)
                if raw_value:
                    # Check if value itself is base64 (unlikely for "value" field based on observations, but possible)
                    decoded = decode_string(raw_value)
                    if decoded:
                         content_to_show = f"**[Decoded Value]**\n\n{decoded}"
                    else:
                         content_to_show = raw_value

                # Case 2: Value is empty, check ID (Hidden Reasoning / State)
                elif block_id:
                    decoded = decode_string(block_id)
                    if decoded:
                        content_to_show = f"**[Decoded ID]**\n\n{decoded}"
                    else:
                        # If ID is not base64 or decode fails, just show it (it might be a timestamp ID)
                        # But for empty value blocks, it's likely the gibberish ID
                        content_to_show = f"**[Raw ID (Could not decode as text)]**\n\n`{block_id}`"

                else:
                    content_to_show = "*Empty Thinking Block*"

                output_content.append(f"{content_to_show}\n\n")
                output_content.append("---\n")

    with open(OUTPUT_FILE, 'w') as f:
        f.writelines(output_content)

    print(f"Successfully extracted and decoded thinking blocks to {OUTPUT_FILE}")

if __name__ == "__main__":
    extract_thinking()
