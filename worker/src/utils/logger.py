import os
import logging
from logging.handlers import RotatingFileHandler
from ..config.config import config

# Ensure logs directory exists
log_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "logs")
if not os.path.exists(log_dir):
    os.makedirs(log_dir)

# Initialize logger
logger = logging.getLogger("ai-task-worker")
logger.setLevel(getattr(logging, config.LOG_LEVEL.upper(), logging.INFO))

# Formatter
formatter = logging.Formatter(
    "[%(asctime)s] %(levelname)s [%(filename)s:%(lineno)d]: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)

# Console Handler
console_handler = logging.StreamHandler()
console_handler.setFormatter(formatter)
logger.addHandler(console_handler)

# File Handler
log_file_path = os.path.join(log_dir, "worker.log")
file_handler = RotatingFileHandler(
    log_file_path,
    maxBytes=5242880,  # 5MB
    backupCount=5
)
file_handler.setFormatter(formatter)
logger.addHandler(file_handler)

logger.info(f"Logger initialized. Writing logs to {log_file_path}")
