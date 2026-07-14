# Deployment Guide — AI Task Processing Platform

This document describes how to deploy the platform to local clusters (Minikube) and configure the Argo CD GitOps synchronization loop.

---

## 💻 1. Local Kubernetes Deployment (Minikube)

Follow these steps to deploy all infrastructure manifests manually:

### Step 1: Start Minikube & Enable Ingress
Start the cluster and enable the Nginx Ingress Controller addon:
```bash
minikube start --cpus=4 --memory=8192
minikube addons enable ingress
```

### Step 2: Build Images Directly in Minikube (Bypassing Push)
Configure your terminal to point to Minikube's Docker daemon, and compile the images locally:
```bash
# Point shell to minikube docker registry
eval $(minikube docker-env)

# Compile backend, frontend, and worker images
docker build -t backend:latest ./backend
docker build -t frontend:latest ./frontend
docker build -t worker:latest ./worker
```

### Step 3: Apply Declarative Core Manifests
Create the namespace and apply configurations, credentials, and persistent volumes:
```bash
# Apply namespace
kubectl apply -f infrastructure/kubernetes/namespace/namespace.yaml

# Apply configurations, secrets, and volumes
kubectl apply -f infrastructure/kubernetes/configmaps/
kubectl apply -f infrastructure/kubernetes/secrets/
kubectl apply -f infrastructure/kubernetes/storage/
```

### Step 4: Apply Deployments & Networking Services
Deploy databases, caching layers, application replicas, and routing rules:
```bash
# Deploy service pods
kubectl apply -f infrastructure/kubernetes/deployments/

# Deploy internal connection services
kubectl apply -f infrastructure/kubernetes/services/

# Deploy Ingress rules
kubectl apply -f infrastructure/kubernetes/ingress/ingress.yaml
```

### Step 5: Configure Host Mappings
Retrieve your Minikube IP address:
```bash
minikube ip
```
Map this IP inside your hosts file (Windows: `C:\Windows\System32\drivers\etc\hosts` / Linux/macOS: `/etc/hosts`):
```text
<MINIKUBE_IP>   ai-task-platform.local
```
Navigate to `http://ai-task-platform.local/` in your browser.

---

## 🔄 2. GitOps Deployment (Argo CD Setup)

To deploy the platform via continuous GitOps synchronization:

### Step 1: Install Argo CD
Deploy Argo CD into the cluster:
```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

### Step 2: Port-forward the API Server
```bash
kubectl port-forward svc/argocd-server -n argocd 8080:443
```
Access the dashboard at `https://localhost:8080` (Username: `admin`). Refer to the root `README.md` for instructions on fetching the default password.

### Step 3: Deploy the Application Manifest
Apply the App configuration:
```bash
kubectl apply -f infrastructure/argocd/application.yaml
```
Argo CD will automatically pull manifests from the repository and deploy them inside the `ai-task-platform` namespace, maintaining continuous self-healing synchronization.

---

## 📈 3. KEDA Scaling Configuration

To deploy worker queue auto-scaling:

### Step 1: Install KEDA
Deploy KEDA using Helm:
```bash
# Add Helm chart
helm repo add kedacore https://kedacore.github.io/charts
helm repo update

# Install KEDA
helm install keda kedacore/keda --namespace keda --create-namespace
```

### Step 2: Apply the ScaledObject
Verify KEDA starts up, then deploy the ScaledObject:
```bash
kubectl apply -f infrastructure/kubernetes/hpa/worker-scaledobject.yaml
```
Verify the ScaledObject status:
```bash
kubectl get scaledobject -n ai-task-platform
```
To trigger scaling, submit multiple tasks to the queue. KEDA will automatically scale the Python worker deployment up to **10 replicas**.
