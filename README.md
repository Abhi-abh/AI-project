# AI Task Processing Platform

A production-ready, highly scalable, asynchronous task processing platform built with the MERN stack (MongoDB, Express, React, Node.js), Redis, and Python background workers. It leverages containerization (Docker & Docker Compose), Kubernetes orchestrations, automated scaling (HPA & KEDA), GitOps continuous deployment (Argo CD), and automation workflows (GitHub Actions).

---

## 🚀 Key Features

- **Asynchronous Task Processing**: Express API acts as a gateway, putting jobs onto Redis queues while Python workers consume and process tasks out-of-band.
- **Dynamic Task Routing**: Native fallback to database polling if the Redis queue server goes offline, maintaining zero-downtime execution.
- **Real-Time Notifications**: Integrated WebSockets server pushes updates to the React client upon job completion.
- **Enterprise-Grade Scaling**: Automatic horizontal scaling of API nodes using HPA, and event-driven database/worker scaling based on Redis backlog sizes using KEDA.
- **GitOps Continuous Deployment**: Argo CD synchronizes resource states automatically from a separate infrastructure configuration repository.
- **Automated CI/CD**: GitHub Actions workflows compile containers, execute test suites, and replace image tags dynamically in infrastructure files.

---

## 🛠️ Tech Stack

- **Frontend**: React.js, Vite, TailwindCSS (for UI structures).
- **Backend API Gateway**: Node.js, Express, Socket.io, BullMQ (producer client).
- **Worker Node**: Python 3.11, PyMongo, Redis-py, Pillow (image manipulation).
- **Databases & Stores**: MongoDB (persistent store), Redis (in-memory task broker).
- **Infrastructure & GitOps**: Docker, Kubernetes, Nginx Ingress Controller, KEDA, Argo CD, GitHub Actions.

---

## 🌐 Architecture Overview

```text
    +------------------ Host / Browser ------------------+
    |                                                    |
    |               React Single Page App                |
    +----------------------------------------------------+
                              | (HTTP / WebSockets)
                              v
    +---------------- Kubernetes Cluster ---------------+
    |                                                    |
    |      [ Nginx Ingress Controller (Host Routing) ]    |
    |             /                          \           |
    |     (Port 80) /                            \ (Port 5000)
    |             v                              v       |
    |  +--------------------+          +--------------+  |
    |  |  frontend-service  |          |  backend-svc |  |
    |  +--------------------+          +--------------+  |
    |             |                           |          |
    |             v                           v          |
    |       frontend-pods               backend-pods     |
    |                                    /          \    |
    |                      (BullMQ Queue)            \   |
    |                            v                    \  |
    |    +-------------------------------+             \ |
    |    |  redis-service (Port 6379)    |              \|
    |    +-------------------------------+               v
    |                    ^             +---------------------+
    |                    |             | mongodb-svc (27017) |
    |             (Queue Polling)      +---------------------+
    |                    |                       ^
    |                    |                       | (Status Updates)
    |             +-------------+                |
    |             | worker-pod  |----------------+
    |             +-------------+
    |                    ^
    |                    | (Triggers Scaling)
    |             [ KEDA Scaler ]
    +----------------------------------------------------+
```

---

## 📁 Repository Directory Structure

```text
ai-task-platform/
├── .github/
│   └── workflows/
│       ├── backend.yml         # Backend API build and deployment pipeline
│       ├── frontend.yml        # Frontend assets compile and deployment pipeline
│       └── worker.yml          # Python worker build and deployment pipeline
├── backend/                    # Node.js + Express API Gateway
│   ├── src/                    # API controllers, models, and routes
│   ├── Dockerfile              # Multi-stage production container definition
│   └── package.json            # Node scripts and dependencies
├── frontend/                   # React + Vite Client
│   ├── src/                    # Components, routing layout, and hooks
│   ├── nginx.conf              # Production Nginx SPA configuration
│   ├── Dockerfile              # Multi-stage frontend compilation & server
│   └── package.json            # React build dependencies
├── worker/                     # Python Background Task Processor
│   ├── src/                    # Task handlers, processors, and configurations
│   ├── requirements.txt        # Python package dependencies
│   └── Dockerfile              # Multi-stage Python runner container
├── infrastructure/             # Kubernetes foundation manifests (Argocd, K8s, Storage, etc.)
├── docker-compose.yml          # Unified orchestrator configuration for local development
└── README.md                   # Core project documentation
```

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
- `PORT`: API server port (default `5000`).
- `NODE_ENV`: Runtime environment (`development` or `production`).
- `MONGO_URI`: MongoDB connection string.
- `REDIS_HOST`: Redis service hostname.
- `REDIS_PORT`: Redis service port (`6379`).
- `JWT_SECRET`: JWT encryption signing key.
- `JWT_EXPIRES_IN`: JWT expiration length (e.g. `7d`).
- `RATE_LIMIT_WINDOW_MS`: Rate limiter window duration.
- `RATE_LIMIT_MAX`: Max requests allowed per window.

### Frontend (`frontend/.env`)
- `VITE_API_URL`: Backend API HTTP path target.
- `VITE_WS_URL`: Backend WebSocket path target.

### Worker (`worker/src/config/config.py`)
- `MONGODB_URI`: MongoDB connection string.
- `REDIS_HOST`: Redis host name.
- `REDIS_PORT`: Redis port.
- `QUEUE_NAME`: BullMQ queue list name mapping.
- `LOG_LEVEL`: Logger verbosity level (`INFO`, `DEBUG`).

---

## 🚦 API Endpoints (Gateway Route Summary)

| Method | Endpoint | Description | Authentication |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/v1/auth/register` | Registers a new user account | Public |
| **POST** | `/api/v1/auth/login` | Authenticates user credentials and returns JWT | Public |
| **GET** | `/api/v1/users/me` | Retrieves user profile metadata | Bearer JWT Token |
| **POST** | `/api/v1/tasks` | Submits a new processing task to queue | Bearer JWT Token |
| **GET** | `/api/v1/tasks` | Lists all tasks created by the user | Bearer JWT Token |
| **GET** | `/api/v1/tasks/:id` | Returns specific task details and state | Bearer JWT Token |
| **GET** | `/health` | Queries cluster database and queue connection health | Public |

---

## 🛠️ Installation and Local Setup

### 1. Prerequisites
Ensure you have the following installed on your machine:
- Node.js (v18+)
- Python (v3.11+)
- Docker & Docker Compose
- Minikube or Docker Desktop (for local Kubernetes testing)

### 2. Run Local Development (No Containers)
If you wish to run the subprojects natively:
- **MongoDB & Redis**: Start your local services.
- **Backend API**:
  ```bash
  cd backend
  npm install
  npm run dev
  ```
- **Frontend App**:
  ```bash
  cd frontend
  npm install
  npm run dev
  ```
- **Worker Engine**:
  ```bash
  cd worker
  python -m venv venv
  source venv/bin/activate # or venv\Scripts\activate on Windows
  pip install -r requirements.txt
  python src/main.py
  ```

---

## 🐋 Local Orchestration using Docker Compose

To compile all microservices and database engines automatically:
```bash
docker compose up --build
```
Access endpoints at:
- Frontend Client: `http://localhost:3000`
- Backend gateway: `http://localhost:5000`
- MongoDB: `http://localhost:27017`
- Redis: `http://localhost:6379`

---

## ☸️ Kubernetes Cluster Deployment

Foundational manifests reside inside the `infrastructure/` folder:

### 1. Setup Namespace & Configs
```bash
kubectl apply -f infrastructure/kubernetes/namespace/namespace.yaml
kubectl apply -f infrastructure/kubernetes/configmaps/
kubectl apply -f infrastructure/kubernetes/secrets/
kubectl apply -f infrastructure/kubernetes/storage/
```

### 2. Apply Deployments & Services
```bash
kubectl apply -f infrastructure/kubernetes/deployments/
kubectl apply -f infrastructure/kubernetes/services/
```

### 3. Deploy Ingress Routing
```bash
kubectl apply -f infrastructure/kubernetes/ingress/ingress.yaml
```

---

## 📈 Autoscaling & GitOps Workflows

### KEDA Worker Scaling
The worker uses **KEDA** ScaledObject config (`infrastructure/kubernetes/hpa/worker-scaledobject.yaml`). KEDA polls the Redis list length `bull:ai-tasks-queue:wait` and dynamically spins up worker replicas from **1 to 10** based on the number of waiting jobs.

### Argo CD GitOps Sync
The cluster configuration state is linked to a separate infrastructure git repository via Argo CD Application manifest (`infrastructure/argocd/application.yaml`). Argo CD automatically reconciliation changes from the `kubernetes/` folder in Git to the live cluster.

### GitHub Actions CI/CD
Whenever code is committed inside the subfolders:
- Workflows compile the Docker image, run linters/tests, and push tags (`sha-<commit-hash>`) to Docker Hub.
- The workflow automatically clones the infrastructure repository, updates the deployment container image tags, and commits back. Argo CD detects the change and triggers a rolling update.

---

## 🧪 Testing

- **Backend Tests**: Run `npm test` inside `backend/`.
- **Frontend Tests**: Run build verification using `npm run build` in `frontend/`.
- **Worker Tests**: Run `pytest` inside `worker/`.

---

## 🛠️ Troubleshooting

- **Redis Connection Failures**: If Redis is offline, the backend gateway logs a warning and dynamically activates **Mock In-Memory Queue Mode**. Ensure `REDIS_HOST` matches your container alias inside Docker Compose networks.
- **Stateful Volume Mounting Errors**: If MongoDB fails to attach persistent volumes, delete the old pods to release lock conflicts (`kubectl delete pods -n ai-task-platform -l app=mongodb`).

---

## 🔮 Future Improvements

1. **Kubernetes Network Policies**: Secure pod communication namespaces using network rules.
2. **Dynamic Secrets**: Retrieve secrets dynamically from Vault or AWS Secrets Manager.
3. **Structured logs aggregation**: Deploy FluentBit/ElasticSearch/Kibana dashboards.
