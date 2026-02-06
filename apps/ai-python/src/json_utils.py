"""Utility functions for robust JSON extraction from LLM responses."""

import json
import re
import logging
from typing import Any, Dict, Optional

logger = logging.getLogger(__name__)


def extract_json(text: str) -> Optional[Dict[str, Any]]:
    """
    Extract JSON from LLM response, handling code fences and extra text.
    
    Args:
        text: Raw LLM response text
        
    Returns:
        Parsed JSON dict or None if extraction fails
    """
    # Remove markdown code fences
    text = re.sub(r'```json\s*', '', text)
    text = re.sub(r'```\s*', '', text)
    
    # Try direct parse first
    try:
        return json.loads(text.strip())
    except json.JSONDecodeError:
        pass
    
    # Try to find JSON object boundaries with better handling
    try:
        # Find first { and last }
        start = text.find('{')
        end = text.rfind('}')
        
        if start != -1 and end != -1 and end > start:
            json_str = text[start:end + 1]
            
            # Try to parse
            try:
                return json.loads(json_str)
            except json.JSONDecodeError:
                # If failed, try to find complete JSON by counting braces
                brace_count = 0
                for i in range(start, len(text)):
                    if text[i] == '{':
                        brace_count += 1
                    elif text[i] == '}':
                        brace_count -= 1
                        if brace_count == 0:
                            json_str = text[start:i + 1]
                            try:
                                return json.loads(json_str)
                            except json.JSONDecodeError:
                                continue
    except Exception as e:
        logger.debug(f"Error during JSON extraction: {e}")
    
    # Try to find JSON array boundaries
    try:
        start = text.find('[')
        end = text.rfind(']')
        
        if start != -1 and end != -1 and end > start:
            json_str = text[start:end + 1]
            return json.loads(json_str)
    except json.JSONDecodeError:
        pass
    
    logger.error(f"Failed to extract JSON from text: {text[:200]}...")
    return None
