import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    def __init__(self):
        self.REDIS_HOST = os.getenv("REDIS_HOST", "127.0.0.1")
        self.REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
        self.QUEUE_NAME = os.getenv("QUEUE_NAME", "ai-tasks-queue")
        self.LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
        
        # Flag to indicate Redis is offline and we are using MongoDB polling fallback
        self.is_redis_mock = False
        
        # MongoDB resolution: Check if the backend dumped the active connection URI to a shared file
        shared_uri_file = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))),
            ".mongodb_uri"
        )
        
        if os.path.exists(shared_uri_file):
            try:
                with open(shared_uri_file, "r", encoding="utf-8") as f:
                    uri = f.read().strip()
                if uri:
                    self.MONGODB_URI = uri
                    return
            except Exception:
                pass
                
        self.MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://127.0.0.1:27017/ai-task-platform")

config = Config()
