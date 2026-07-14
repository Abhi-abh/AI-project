import sys
import os
import signal
import time

# Resolve python module path issues by adding the parent folder of 'src' to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.config.config import config
from src.utils.logger import logger
from src.database.mongo import mongo_manager
from src.queue.redis_client import redis_manager
from src.queue.consumer import queue_consumer

def shutdown_handler(signum, frame):
    """Handles SIGINT and SIGTERM gracefully closing database and queue sockets."""
    signame = signal.Signals(signum).name
    logger.info(f"Received signal {signame} ({signum}). Initiating graceful shutdown...")
    
    # 1. Stop consumer loop first to prevent picking new jobs
    queue_consumer.stop()
    
    # 2. Close connections
    redis_manager.close()
    mongo_manager.close()
    
    logger.info("Graceful shutdown completed. Exiting worker process.")
    sys.exit(0)

def main():
    logger.info("=========================================")
    logger.info("Starting AI Task Processing Worker")
    logger.info("=========================================")
    
    # Register signal handlers for graceful exit
    signal.signal(signal.SIGINT, shutdown_handler)
    signal.signal(signal.SIGTERM, shutdown_handler)
    
    # 1. Initialize MongoDB connection client
    try:
        mongo_manager.connect()
    except Exception as e:
        logger.critical(f"Database startup failed, worker shutting down: {e}")
        sys.exit(1)
        
    # 2. Initialize Redis connection client
    try:
        redis_manager.connect()
    except Exception as e:
        logger.warning("Redis queue connection failed. Switching to Mock MongoDB-polling mode.")
        config.is_redis_mock = True
        
    # 3. Start polling the taskQueue
    try:
        queue_consumer.start()
    except Exception as e:
        logger.critical(f"Uncaught critical error inside consumer loop: {e}")
        redis_manager.close()
        mongo_manager.close()
        sys.exit(1)

if __name__ == "__main__":
    main()
