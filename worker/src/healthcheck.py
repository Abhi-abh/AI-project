import sys
import os

# Resolve python module path issues by adding the parent folder of 'src' to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.config.config import config
from src.database.mongo import mongo_manager
from src.queue.redis_client import redis_manager

def check_health():
    """Validates worker connectivity to external resource dependencies (MongoDB, Redis)"""
    try:
        # Check MongoDB connection health (forces a ping command)
        mongo_manager.connect()
        mongo_manager.close()
        
        # Check Redis connection health (forces a ping command)
        # Note: If is_redis_mock is active, we skip the Redis check
        if not getattr(config, 'is_redis_mock', False):
            redis_manager.connect()
            redis_manager.close()
            
        print("Worker health check passed.")
        sys.exit(0)
    except Exception as e:
        print(f"Worker health check failed: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    check_health()
