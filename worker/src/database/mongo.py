from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
from ..config.config import config
from ..utils.logger import logger

class MongoManager:
    def __init__(self):
        self.client = None
        self.db = None

    def connect(self):
        try:
            logger.info(f"Connecting to MongoDB at {config.MONGODB_URI}...")
            self.client = MongoClient(config.MONGODB_URI, serverSelectionTimeoutMS=5000)
            # Force call to verify connection
            self.client.admin.command("ping")
            
            # Extract database name from connection string or default
            db_name = config.MONGODB_URI.split("/")[-1].split("?")[0]
            if not db_name:
                db_name = "ai-task-platform"
                
            self.db = self.client[db_name]
            logger.info(f"MongoDB Connected successfully. Database: '{db_name}'")
        except ConnectionFailure as e:
            logger.error(f"MongoDB connection failed: {e}")
            raise e

    def get_db(self):
        if self.db is None:
            self.connect()
        return self.db

    def close(self):
        if self.client:
            logger.info("Closing MongoDB connection client...")
            self.client.close()
            self.client = None
            self.db = None
            logger.info("MongoDB connection closed.")

    def reconnect_dynamic(self):
        """Checks for updated dynamic ports and reconnects the client on changes."""
        import os
        try:
            shared_uri_file = os.path.join(
                os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))),
                ".mongodb_uri"
            )
            if os.path.exists(shared_uri_file):
                with open(shared_uri_file, "r", encoding="utf-8") as f:
                    uri = f.read().strip()
                if uri and uri != config.MONGODB_URI:
                    logger.info(f"Dynamic database connection shift detected. Reconnecting to: {uri}")
                    config.MONGODB_URI = uri
                    self.close()
                    self.connect()
                    return True
        except Exception as e:
            logger.error(f"Dynamic reconnect lookup failed: {e}")
        return False

mongo_manager = MongoManager()
