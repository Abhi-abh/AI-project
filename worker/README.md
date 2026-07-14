# Python AI Task Worker

This is the Python-based worker service that polls tasks from Redis, downloads assets, runs ML inference, uploads results, and updates the task status.

## Directory Structure

```
worker/
├── src/
│   ├── models/         # AI Model wrapper configurations
│   ├── services/       # Storage integrations, queue consumers, model handlers
│   ├── config.py       # Configuration and Environment variable loader
│   └── main.py         # Entrypoint consumer loop
├── requirements.txt    # Python dependencies
├── pytest.ini          # Pytest configuration
└── .gitignore          # Git exclusion rules
```

## Setup Instructions

1. **Create and Activate Virtual Environment**
   ```bash
   python -m venv venv
   # On Windows (PowerShell):
   .\venv\Scripts\Activate.ps1
   # On macOS/Linux:
   source venv/bin/activate
   ```

2. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure Environment**
   Create a `.env` file in the `worker` folder:
   ```env
   REDIS_URL=redis://localhost:6379/0
   MONGO_URI=mongodb://localhost:27017/ai-task-platform
   S3_BUCKET_NAME=ai-task-assets
   ```

4. **Run Worker**
   ```bash
   python src/main.py
   ```
