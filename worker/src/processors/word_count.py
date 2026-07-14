def process_word_count(text: str) -> str:
    """Counts the number of words in the input text and returns the count as a string."""
    if not text or not text.strip():
        return "0"
    words = text.strip().split()
    return str(len(words))
