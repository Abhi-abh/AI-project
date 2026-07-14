import json
import time
from .redis_client import redis_manager
from ..services.task_processor import task_processor_service
from ..utils.logger import logger
from ..config.config import config
from ..database.mongo import mongo_manager

class QueueConsumer:
    def __init__(self):
        self.running = False

    def start(self):
        self.running = True
        
        if config.is_redis_mock:
            logger.info("Worker mock polling started. Polling MongoDB for 'PENDING' jobs...")
            db = mongo_manager.get_db()
            tasks_collection = db["tasks"]
            
            while self.running:
                try:
                    task = tasks_collection.find_one({"status": "PENDING"})
                    if task:
                        task_id_str = str(task["_id"])
                        logger.info(f"Mock-polling found PENDING Task ID: {task_id_str}")
                        
                        job_data = {
                            "taskId": task_id_str,
                            "operationType": task.get("operationType", "UPPERCASE"),
                            "inputText": task.get("inputText", "")
                        }
                        
                        task_processor_service.process_task_job(job_data)
                    else:
                        time.sleep(1.5)
                except Exception as e:
                    logger.error(f"Error in mock polling loop: {e}")
                    # Attempt dynamic database port reconnection on connection drops
                    try:
                        mongo_manager.reconnect_dynamic()
                    except Exception as rec_err:
                        logger.error(f"Reconnection logic check failed: {rec_err}")
                    time.sleep(2)
            return

        client = redis_manager.get_client()
        queue_wait_list = f"bull:{config.QUEUE_NAME}:wait"
        
        logger.info(f"Worker queue consumer started. Polling list: '{queue_wait_list}'...")
        
        while self.running:
            try:
                # BRPOP blocks until a job ID is pushed to the list
                result = client.brpop(queue_wait_list, timeout=2)
                if not result:
                    continue
                
                _, job_id = result
                logger.info(f"Worker picked up Job ID: {job_id}")
                
                # Fetch job details from the BullMQ job key
                job_hash_key = f"bull:{config.QUEUE_NAME}:{job_id}"
                job_data_raw = client.hget(job_hash_key, "data")
                
                if not job_data_raw:
                    logger.error(f"Job data payload missing for key: '{job_hash_key}'")
                    continue
                
                # Parse BullMQ payload
                job_data = json.loads(job_data_raw)
                
                # Process task logic & update MongoDB
                success = task_processor_service.process_task_job(job_data)
                
                if success:
                    logger.info(f"Job ID {job_id} processing completed successfully.")
                else:
                    logger.error(f"Job ID {job_id} processing failed.")
                    
            except redis.ConnectionError:
                logger.error("Lost connection to Redis. Retrying in 5 seconds...")
                time.sleep(5)
                try:
                    redis_manager.connect()
                    client = redis_manager.get_client()
                except Exception as reconnect_err:
                    logger.error(f"Reconnection attempt failed: {reconnect_err}")
            except Exception as e:
                logger.error(f"Error in queue consumer execution loop: {e}", exc_info=True)
                time.sleep(2)

    def stop(self):
        logger.info("Signaling queue consumer loop to stop...")
        self.running = False

queue_consumer = QueueConsumer()
