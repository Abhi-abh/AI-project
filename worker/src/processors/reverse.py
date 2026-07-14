def process_reverse(text: str) -> str:
    """Reverses the character order of the input text."""
    if not text:
        return ""
    return text[::-1]
