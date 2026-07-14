# Testing Guide — AI Task Processing Platform

This document describes how to execute automated unit tests, test APIs, validate real-time WebSockets notifications, and test the dynamic mock fallback configurations.

---

## 🧪 1. Executing Automated Tests

### Express Backend API
The backend uses **Jest** and **supertest** for testing. In the absence of a live MongoDB database, it spins up an in-memory server via `mongodb-memory-server` to execute integration tests.
- **Run tests**:
  ```bash
  cd backend
  npm test
  ```

### React Frontend Client
The frontend relies on Vite and compiler syntax verification.
- **Run compiler checks**:
  ```bash
  cd frontend
  npm run build
  ```

### Python Worker Engine
The worker uses **pytest** to test processors and consumer states.
- **Run tests**:
  ```bash
  cd worker
  pytest
  ```

---

## 🚦 2. Manual API Gateway & WebSocket Testing

### Testing REST Endpoints with Curl
To test the API gateway locally:

1. **Register a User**:
   ```bash
   curl -X POST http://localhost:5000/api/v1/auth/register \
     -H "Content-Type: application/json" \
     -d '{"username":"tester","email":"test@testing.com","password":"secure_password"}'
   ```
2. **Retrieve Authentication Token**:
   ```bash
   curl -X POST http://localhost:5000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@testing.com","password":"secure_password"}'
   ```
   *Copy the returned token.*
3. **Submit a Task**:
   ```bash
   curl -X POST http://localhost:5000/api/v1/tasks \
     -H "Authorization: Bearer <COPIED_TOKEN>" \
     -H "Content-Type: application/json" \
     -d '{"type":"WORD_COUNT","payload":{"text":"Testing this platform backend system"}}'
   ```

### Testing WebSockets (Real-Time Notifications)
You can write a simple node script to test socket connection and triggers:
```javascript
const io = require("socket.io-client");

const socket = io("http://localhost:5000", {
  auth: { token: "Bearer <COPIED_TOKEN>" }
});

socket.on("connect", () => {
  console.log("Connected to API WebSockets Gateway!");
});

socket.on("task_update", (data) => {
  console.log("Real-time Task Update Received:", data);
});

socket.on("task_completed", (data) => {
  console.log("Task Completed Event:", data);
});
```

---

## 🔄 3. Testing Dynamic Fallback Modes

The backend and worker feature an **In-Memory Fallback Mode** to ensure uptime if dependencies crash:

### Testing Redis offline behavior
1. Stop Redis:
   ```bash
   docker stop platform-redis # or stop local system service
   ```
2. Query `/health` on the backend:
   - Confirm status reports `"healthy"` but lists redis as `"mocked (in-memory)"`.
3. Submit a task:
   - Check backend logs: `Switching to Mock In-Memory Queue Mode.`
   - Tasks will be written directly to MongoDB.
4. Verify Worker fallback:
   - Worker logs: `Redis queue connection failed. Switching to Mock MongoDB-polling mode.`
   - Worker will start polling MongoDB at regular intervals, processing jobs and writing results, maintaining overall system availability.
