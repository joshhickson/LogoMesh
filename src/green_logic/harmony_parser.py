"""
Harmony Protocol Parser

Parses responses from gpt-oss-20b model which uses the Harmony Response Format.
Extracts structured reasoning traces and final outputs from XML-style channel tags.

Reference: https://openai.com/index/introducing-gpt-oss/
Format: https://cobusgreyling.medium.com/what-is-gpt-oss-harmony-response-format-a29f266d6672
"""

import re
from typing import Optional, Dict, Any


class HarmonyParser:
    """
    Parser for Harmony Response Format used by gpt-oss models.
    
    The Harmony protocol separates model outputs into channels:
    - <|channel|analysis>: Chain-of-Thought reasoning trace
    - <|channel|final>: Final answer/code output
    - <|channel|search>: Search queries (if applicable)
    - <|channel|reflection>: Self-reflection (if applicable)
    
    For CIS validation, we primarily care about:
    - analysis: For Requirements (R) scoring - measures intent understanding
    - final: For code evaluation - the actual implementation
    """
    
    # Regex patterns for extracting channel content
    CHANNEL_PATTERN = re.compile(
        r'<\|channel\|([a-z_]+)\|>(.*?)<\|channel\|end\|>',
        re.DOTALL | re.IGNORECASE
    )
    
    # Alternative pattern for responses without explicit end tags
    CHANNEL_START_PATTERN = re.compile(
        r'<\|channel\|([a-z_]+)\|>',
        re.IGNORECASE
    )
    
    @staticmethod
    def parse(response_text: str) -> Dict[str, Any]:
        """
        Parse Harmony-formatted response into structured channels.
        
        Args:
            response_text: Raw text response from gpt-oss model
            
        Returns:
            Dictionary with keys:
            - 'channels': Dict mapping channel names to content
            - 'analysis': Extracted reasoning trace (for R scoring)
            - 'final': Extracted final output/code
            - 'raw': Original response text
            - 'format_detected': Boolean indicating if Harmony format found
        """
        result = {
            'channels': {},
            'analysis': None,
            'final': None,
            'raw': response_text,
            'format_detected': False
        }
        
        # Extract all channels using primary pattern
        matches = HarmonyParser.CHANNEL_PATTERN.findall(response_text)
        
        if matches:
            result['format_detected'] = True
            for channel_name, content in matches:
                channel_name = channel_name.lower().strip()
                content = content.strip()
                result['channels'][channel_name] = content
                
                # Map common channels to top-level keys
                if channel_name == 'analysis':
                    result['analysis'] = content
                elif channel_name == 'final':
                    result['final'] = content
        
        else:
            # Fallback: Try to extract without end tags (split by next channel start)
            channel_starts = list(HarmonyParser.CHANNEL_START_PATTERN.finditer(response_text))
            
            if channel_starts:
                result['format_detected'] = True
                
                for i, match in enumerate(channel_starts):
                    channel_name = match.group(1).lower().strip()
                    start_pos = match.end()
                    
                    # Find end position (next channel or end of string)
                    if i + 1 < len(channel_starts):
                        end_pos = channel_starts[i + 1].start()
                    else:
                        end_pos = len(response_text)
                    
                    content = response_text[start_pos:end_pos].strip()
                    result['channels'][channel_name] = content
                    
                    if channel_name == 'analysis':
                        result['analysis'] = content
                    elif channel_name == 'final':
                        result['final'] = content
        
        # If no Harmony format detected, treat entire response as 'final'
        if not result['format_detected']:
            result['final'] = response_text.strip()
        
        return result
    
    @staticmethod
    def extract_code_from_final(final_content: Optional[str]) -> Optional[str]:
        """
        Extract code from the 'final' channel, handling various formats.
        
        Args:
            final_content: Content from <|channel|final>
            
        Returns:
            Extracted code or None if no code found
        """
        if not final_content:
            return None
        
        # Pattern 1: JSON with sourceCode field
        json_pattern = re.search(
            r'"sourceCode"\s*:\s*"((?:[^"\\]|\\.)*)"',
            final_content,
            re.DOTALL
        )
        if json_pattern:
            # Unescape JSON string
            code = json_pattern.group(1)
            code = code.replace('\\n', '\n').replace('\\t', '\t').replace('\\"', '"')
            return code
        
        # Pattern 2: Markdown code block
        code_block_pattern = re.search(
            r'```(?:python)?\n(.*?)```',
            final_content,
            re.DOTALL
        )
        if code_block_pattern:
            return code_block_pattern.group(1).strip()
        
        # Pattern 3: Return entire content if it looks like code
        # (contains 'def ' or 'class ' and doesn't start with prose)
        if re.search(r'\b(def|class)\s+\w+', final_content):
            return final_content.strip()
        
        return final_content.strip()
    
    @staticmethod
    def extract_rationale_from_analysis(analysis_content: Optional[str]) -> Optional[str]:
        """
        Extract design rationale from the 'analysis' channel.
        
        Args:
            analysis_content: Content from <|channel|analysis>
            
        Returns:
            Extracted rationale or the full analysis if no specific rationale found
        """
        if not analysis_content:
            return None
        
        # Look for explicit rationale sections
        rationale_patterns = [
            r'(?:design\s+)?rationale[:\s]+(.*?)(?:\n\n|$)',
            r'(?:my\s+)?approach[:\s]+(.*?)(?:\n\n|$)',
            r'reasoning[:\s]+(.*?)(?:\n\n|$)',
        ]
        
        for pattern in rationale_patterns:
            match = re.search(pattern, analysis_content, re.IGNORECASE | re.DOTALL)
            if match:
                return match.group(1).strip()
        
        # If no explicit rationale section, return the full analysis
        # (it represents the model's reasoning process)
        return analysis_content.strip()
    
    @staticmethod
    def format_for_display(parsed: Dict[str, Any], max_length: int = 500) -> str:
        """
        Format parsed Harmony response for human-readable display.
        
        Args:
            parsed: Result from parse()
            max_length: Maximum length for each channel display
            
        Returns:
            Formatted string for logging/debugging
        """
        lines = []
        lines.append("=== Harmony Response ===")
        lines.append(f"Format Detected: {parsed['format_detected']}")
        lines.append(f"Channels Found: {list(parsed['channels'].keys())}")
        lines.append("")
        
        if parsed['analysis']:
            preview = parsed['analysis'][:max_length]
            if len(parsed['analysis']) > max_length:
                preview += "..."
            lines.append(f"[Analysis Channel]:\n{preview}\n")
        
        if parsed['final']:
            preview = parsed['final'][:max_length]
            if len(parsed['final']) > max_length:
                preview += "..."
            lines.append(f"[Final Channel]:\n{preview}\n")
        
        return "\n".join(lines)


# Example usage and test cases
if __name__ == "__main__":
    # Test Case 1: Full Harmony format with both channels
    test_response_1 = """
<|channel|analysis|>
To solve this email validation task, I'll use Python's built-in `re` module for regex pattern matching.
The key requirements are:
1. Exactly one @ symbol
2. Non-empty local part before @
3. Domain with at least one dot after @
4. No spaces allowed

My approach will be to compile a regex pattern that enforces these constraints strictly.
<|channel|end|>

<|channel|final|>
```python
import re

def validate_email(email: str) -> dict:
    pattern = r'^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$'
    valid = bool(re.match(pattern, email))
    return {
        "valid": valid,
        "reason": "Valid format" if valid else "Invalid email format"
    }
```
<|channel|end|>
"""
    
    parser = HarmonyParser()
    result = parser.parse(test_response_1)
    print(parser.format_for_display(result))
    print(f"\nExtracted Code:\n{parser.extract_code_from_final(result['final'])}")
    print(f"\nExtracted Rationale:\n{parser.extract_rationale_from_analysis(result['analysis'])}")
    
    # Test Case 2: Response without explicit end tags
    test_response_2 = """
<|channel|analysis|>
This is my reasoning for the rate limiter implementation.

<|channel|final|>
def rate_limiter():
    pass
"""
    
    result2 = parser.parse(test_response_2)
    print("\n\n=== Test Case 2 ===")
    print(parser.format_for_display(result2))
    
    # Test Case 3: Non-Harmony format (fallback behavior)
    test_response_3 = """
Here's my code:
```python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)
```
"""
    
    result3 = parser.parse(test_response_3)
    print("\n\n=== Test Case 3 (Fallback) ===")
    print(parser.format_for_display(result3))
    print(f"Format Detected: {result3['format_detected']}")
