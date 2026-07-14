# API Reference Specification — AI Task Processing Platform

This document describes the HTTP REST API endpoints, parameters, request/response bodies, Zod validation constraints, WebSockets channels, and health check interfaces.

---

## 🔑 Authentication Headers

For all protected routes, clients must supply the JWT bearer token in the `Authorization` header:

```http
Authorization: Bearer <JWT_ACCESS_TOKEN>
```

---

## 🚦 REST API Endpoints

### 1. Authentication Endpoints

#### Register User
- **Route**: `POST /api/v1/auth/register`
- **Description**: Registers a new user.
- **Request Body (Zod Validation)**:
  - `username`: String (Min 3 characters, max 30)
  - `email`: String (Valid email address format)
  - `password`: String (Min 8 characters)
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "data": {
      "user": {
        "id": "64fb56a1e36c2a129d5b7801",
        "username": "developer1",
        "email": "dev1@platform.com"
      }
    }
  }
  ```
- **Errors**:
  - `400 Bad Request`: Validation failure or email/username already exists.

#### Login User
- **Route**: `POST /api/v1/auth/login`
- **Description**: Validates credentials and returns an access token.
- **Request Body (Zod Validation)**:
  - `email`: String (Valid email format)
  - `password`: String (Required)
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": "64fb56a1e36c2a129d5b7801",
        "username": "developer1",
        "email": "dev1@platform.com"
      }
    }
  }
  ```
- **Errors**:
  - `401 Unauthorized`: Invalid credentials.

---

### 2. User Profile Endpoints

#### Get Current Profile
- **Route**: `GET /api/v1/users/me`
- **Description**: Returns user profile metadata.
- **Headers**: Requires Bearer JWT.
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "64fb56a1e36c2a129d5b7801",
      "username": "developer1",
      "email": "dev1@platform.com",
      "createdAt": "2026-07-14T17:20:00.000Z"
    }
  }
  ```

---

### 3. Task Management Endpoints

#### Submit Task
- **Route**: `POST /api/v1/tasks`
- **Description**: Submits a new asynchronous background processing task.
- **Headers**: Requires Bearer JWT.
- **Request Body (Zod Validation)**:
  - `type`: String (Enum: `WORD_COUNT`, `IMAGE_RESIZE`)
  - `payload`: Object (Input parameters based on type)
    - *For WORD_COUNT*:
      - `text`: String (Required)
    - *For IMAGE_RESIZE*:
      - `image_url`: String (Valid URL)
      - `width`: Integer (Optional, default `100`)
      - `height`: Integer (Optional, default `100`)
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Task queued successfully",
    "data": {
      "task": {
        "id": "64fb56b8e36c2a129d5b7805",
        "type": "WORD_COUNT",
        "status": "PENDING",
        "payload": {
          "text": "This is a sample text for analysis."
        },
        "createdAt": "2026-07-14T17:20:45.000Z"
      }
    }
  }
  ```

#### List User Tasks
- **Route**: `GET /api/v1/tasks`
- **Description**: Lists all tasks submitted by the authenticated user.
- **Headers**: Requires Bearer JWT.
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "64fb56b8e36c2a129d5b7805",
        "type": "WORD_COUNT",
        "status": "COMPLETED",
        "payload": {
          "text": "This is a sample text for analysis."
        },
        "result": {
          "word_count": 7
        },
        "createdAt": "2026-07-14T17:20:45.000Z"
      }
    ]
  }
  ```

#### Get Task Details
- **Route**: `GET /api/v1/tasks/:id`
- **Description**: Retrieves state, parameters, and output logs for a specific task.
- **Headers**: Requires Bearer JWT.
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "64fb56b8e36c2a129d5b7805",
      "type": "WORD_COUNT",
      "status": "COMPLETED",
      "payload": {
        "text": "This is a sample text for analysis."
      },
      "result": {
        "word_count": 7,
        "execution_time_ms": 12
      },
      "createdAt": "2026-07-14T17:20:45.000Z",
      "updatedAt": "2026-07-14T17:20:46.000Z"
    }
  }
  ```
- **Errors**:
  - `404 Not Found`: Task does not exist or belongs to another user.

---

### 4. Health Probe API

#### Get Service Health
- **Route**: `GET /health`
- **Description**: Evaluates connectivity status for all databases and brokers.
- **Response (200 OK - Healthy)**:
  ```json
  {
    "status": "healthy",
    "timestamp": "2026-07-14T17:20:55.000Z",
    "services": {
      "mongodb": "connected",
      "redis": "ready",
      "queue": "online"
    }
  }
  ```
- **Response (503 Service Unavailable - Unhealthy)**:
  ```json
  {
    "status": "unhealthy",
    "timestamp": "2026-07-14T17:20:55.000Z",
    "services": {
      "mongodb": "disconnected",
      "redis": "error: Connection refused",
      "queue": "offline"
    }
  }
  ```

---

## 📡 WebSockets Real-Time Notifications

We use **Socket.io** to establish persistent server-push channels for real-time task update notifications.

### Connection Workflow
1. The client opens a WebSocket socket connection:
   ```javascript
   const socket = io("http://localhost:5000", {
     auth: { token: "Bearer eyJhbGciOiJIUzI1..." }
   });
   ```
2. The server decodes the token, authenticates the handshake, and automatically joins the socket to a private room mapped to the user ID: `user_<userId>`.

### Inbound Events (Server-to-Client)
The server pushes events to the user room whenever tasks change status in the database:

#### Event: `task_update`
- **Trigger**: Occurs when a task moves to `PROCESSING`, `COMPLETED`, or `FAILED`.
- **Payload**:
  ```json
  {
    "taskId": "64fb56b8e36c2a129d5b7805",
    "status": "PROCESSING",
    "type": "WORD_COUNT",
    "updatedAt": "2026-07-14T17:20:45.500Z"
  }
  ```

#### Event: `task_completed`
- **Trigger**: Occurs when worker completes task execution.
- **Payload**:
  ```json
  {
    "taskId": "64fb56b8e36c2a129d5b7805",
    "status": "COMPLETED",
    "type": "WORD_COUNT",
    "result": {
      "word_count": 7
    },
    "updatedAt": "2026-07-14T17:20:46.000Z"
  }
  ```
