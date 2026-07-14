<<<<<<< HEAD
# AI Task Processing Platform

A production-ready, highly scalable asynchronous task processing platform built with the MERN stack (MongoDB, Express, React, Node.js), Redis, and Python workers.

## Project Structure

```
ai-task-platform/
├── .github/                # GitHub workflows for CI/CD
├── backend/                # Node.js + Express API Gateway / Backend Service
├── frontend/               # React + Vite Single Page Application
├── worker/                 # Python AI task processing worker
├── infrastructure/         # K8s, Docker, Helm and GitOps manifests
└── docker-compose.yml      # Local orchestration environment
```

## Getting Started

### Prerequisites

Make sure you have the following installed:
* Node.js (v18+) & npm (v9+)
* Python (v3.10+) & virtualenv
* Docker & Docker Compose
* Redis (if running locally without Docker)
* MongoDB (if running locally without Docker)

### Local Development Setup

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd ai-task-platform
   ```

2. **Initialize Subprojects**
   * **Backend**: Refer to `backend/README.md` for specific instructions.
   * **Frontend**: Refer to `frontend/README.md` for specific instructions.
   * **Worker**: Refer to `worker/README.md` for specific instructions.

3. **Running via Docker Compose**
   ```bash
   docker-compose up --build
   ```

## Development Phasing & Roadmap

Refer to the project design documents in the infrastructure directory or artifact links for the full architecture.
=======
# AI-project
>>>>>>> a3ae9ae1aa4588026f7f0f005e750d3bcc3359eb
