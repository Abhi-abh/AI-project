# Backend API Service

This is the Express-based API gateway and task manager. It handles authentication, registers new tasks, uploads metadata, and communicates with MongoDB and Redis.

## Directory Structure

```
backend/
├── src/
│   ├── config/         # Connections setup (DB, Redis, S3)
│   ├── controllers/    # API controllers mapping to routes
│   ├── middleware/     # Auth, validation, error handler middlewares
│   ├── models/         # MongoDB schemas using Mongoose
│   ├── routes/         # Express endpoint routing
│   ├── services/       # Core business logic (queue producers, events)
│   └── app.js          # API main entrypoint
├── package.json        # Dependencies and scripts
└── .gitignore          # Backend specific files to ignore
```

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   Create a `.env` file inside the `backend` folder:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/ai-task-platform
   REDIS_URL=redis://localhost:6379
   JWT_SECRET=your_jwt_secret_key_here
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```
