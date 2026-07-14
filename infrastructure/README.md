# Infrastructure and Deployments

This directory houses all templates, Kubernetes manifests, Helm charts, GitOps files, and scaling rules for deploying the platform.

## Directory Structure

```
infrastructure/
├── k8s/                # Kubernetes base manifests (Namespaces, ingress, configmaps)
├── keda/               # Event-driven autoscaling objects for workers
├── helm/               # Chart packages for backend, frontend, worker
└── README.md           # Documentation for infrastructure setup
```

## Local Kubernetes Testing (Kind/Minikube)

To deploy services locally:

1. **Install Helm Charts**
   ```bash
   helm install platform-backend ./helm/backend
   helm install platform-frontend ./helm/frontend
   ```

2. **Configure KEDA Autoscaling**
   ```bash
   kubectl apply -f ./keda/worker-scaledobject.yaml
   ```
