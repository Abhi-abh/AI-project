import redis
from ..config.config import config
from ..utils.logger import logger

class RedisManager:
    def __init__(self):
        self.client = None

    def connect(self):
        try:
            logger.info(f"Connecting to Redis at {config.REDIS_HOST}:{config.REDIS_PORT}...")
            self.client = redis.Redis(
                host=config.REDIS_HOST,
                port=config.REDIS_PORT,
                password=getattr(config, 'REDIS_PASSWORD', None) or None,
                decode_responses=True, # Critical to get string outputs directly
                socket_timeout=5.0
            )
            # Perform ping to verify connection
            self.client.ping()
            logger.info("Redis Connected successfully.")
        except redis.ConnectionError as e:
            logger.error(f"Redis connection failed: {e}")
            raise e

    def get_client(self):
        if self.client is None:
            self.connect()
        return self.client

    def close(self):
        if self.client:
            logger.info("Closing Redis connection client...")
            self.client.close()
            self.client = None
            logger.info("Redis connection closed.")

redis_manager = RedisManager()
