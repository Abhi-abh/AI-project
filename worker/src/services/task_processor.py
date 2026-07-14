import datetime
from bson import ObjectId
from ..database.mongo import mongo_manager
from ..processors import get_processor
from ..utils.logger import logger

class TaskProcessorService:
    def __init__(self):
        # Collections will be initialized lazily to ensure database is connected
        self._tasks_collection = None

    @property
    def tasks_collection(self):
        if self._tasks_collection is None:
            db = mongo_manager.get_db()
            self._tasks_collection = db["tasks"]
        return self._tasks_collection

    def update_task_to_running(self, task_id_str: str) -> bool:
        """Updates task status to RUNNING in MongoDB and logs execution start."""
        try:
            task_id = ObjectId(task_id_str)
            now = datetime.datetime.utcnow()
            
            result = self.tasks_collection.update_one(
                {"_id": task_id},
                {
                    "$set": {
                        "status": "RUNNING",
                        "startedAt": now
                    },
                    "$push": {
                        "executionLogs": {
                            "$each": [
                                f"[{now.strftime('%Y-%m-%d %H:%M:%S')}] Task Picked by Python Worker",
                                f"[{now.strftime('%Y-%m-%d %H:%M:%S')}] Processing Started"
                            ]
                        }
                    }
                }
            )
            if result.matched_count > 0:
                logger.info(f"Task {task_id_str} status updated to RUNNING in MongoDB.")
                return True
            else:
                logger.error(f"Task {task_id_str} not found in MongoDB during RUNNING update.")
                return False
        except Exception as e:
            logger.error(f"Failed to update task {task_id_str} to RUNNING in MongoDB: {e}")
            return False

    def update_task_to_success(self, task_id_str: str, output_result: str) -> bool:
        """Updates task status to SUCCESS, saves result, and appends completed log."""
        try:
            task_id = ObjectId(task_id_str)
            now = datetime.datetime.utcnow()
            
            result = self.tasks_collection.update_one(
                {"_id": task_id},
                {
                    "$set": {
                        "status": "SUCCESS",
                        "result": output_result,
                        "completedAt": now
                    },
                    "$push": {
                        "executionLogs": f"[{now.strftime('%Y-%m-%d %H:%M:%S')}] Processing Completed. Output size: {len(output_result)} chars."
                    }
                }
            )
            if result.matched_count > 0:
                logger.info(f"Task {task_id_str} status updated to SUCCESS in MongoDB.")
                return True
            return False
        except Exception as e:
            logger.error(f"Failed to update task {task_id_str} to SUCCESS in MongoDB: {e}")
            return False

    def update_task_to_failed(self, task_id_str: str, error_msg: str) -> bool:
        """Updates task status to FAILED, saves error message, and logs error details."""
        try:
            task_id = ObjectId(task_id_str)
            now = datetime.datetime.utcnow()
            
            result = self.tasks_collection.update_one(
                {"_id": task_id},
                {
                    "$set": {
                        "status": "FAILED",
                        "errorMessage": error_msg,
                        "completedAt": now
                    },
                    "$push": {
                        "executionLogs": f"[{now.strftime('%Y-%m-%d %H:%M:%S')}] Error: {error_msg}"
                    }
                }
            )
            if result.matched_count > 0:
                logger.info(f"Task {task_id_str} status updated to FAILED in MongoDB.")
                return True
            return False
        except Exception as e:
            logger.error(f"Failed to update task {task_id_str} to FAILED in MongoDB: {e}")
            return False

    def process_task_job(self, job_data: dict) -> bool:
        """Orchestrates validation, processor execution, and state modifications."""
        task_id_str = job_data.get("taskId")
        operation_type = job_data.get("operationType")
        input_text = job_data.get("inputText")

        if not task_id_str:
            logger.error("Job payload missing taskId. Skipping job.")
            return False

        logger.info(f"Processing Task ID: {task_id_str} | Operation: {operation_type}")

        # 1. Update status to RUNNING
        if not self.update_task_to_running(task_id_str):
            return False

        # 2. Get matched processor
        processor = get_processor(operation_type)
        if not processor:
            err_msg = f"Unknown or unsupported operationType: '{operation_type}'"
            logger.error(err_msg)
            self.update_task_to_failed(task_id_str, err_msg)
            return False

        # 3. Execute processing
        try:
            logger.info(f"Executing processor '{operation_type}' for Task {task_id_str}...")
            result = processor(input_text)
            
            # 4. Save result on SUCCESS
            self.update_task_to_success(task_id_str, result)
            return True
        except Exception as e:
            err_msg = f"Exception occurred during processing execution: {str(e)}"
            logger.error(err_msg, exc_info=True)
            
            # 5. Save error on FAILURE
            self.update_task_to_failed(task_id_str, err_msg)
            return False

task_processor_service = TaskProcessorService()
