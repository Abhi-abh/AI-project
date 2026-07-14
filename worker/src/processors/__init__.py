from .uppercase import process_uppercase
from .lowercase import process_lowercase
from .reverse import process_reverse
from .word_count import process_word_count

# Register processor mapping
PROCESSOR_REGISTRY = {
    "UPPERCASE": process_uppercase,
    "LOWERCASE": process_lowercase,
    "REVERSE": process_reverse,
    "WORD_COUNT": process_word_count
}

def get_processor(operation_type: str):
    """Retrieves the processor matching the target operation type."""
    return PROCESSOR_REGISTRY.get(operation_type.upper())
