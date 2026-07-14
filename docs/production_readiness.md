# Production Readiness Checklist — AI Task Processing Platform

This document describes the validation checklist that must be passed before deploying the task processing platform to a production environment.

---

## 🔒 1. Security Checklist

- [ ] **No Default Credentials**: Ensure JWT keys, MongoDB connection passwords, and Redis password tokens are rotated out of standard default placeholders.
- [ ] **Secret Injection**: Ensure secrets are injected via GitOps secrets tools (e.g. SealedSecrets, Vault) instead of committing base64 values in Git.
- [ ] **Ingress SSL/TLS**: Ensure HTTP Strict Transport Security (HSTS) and cert-manager auto-issuing annotations are enabled on Ingress rules.
- [ ] **Non-Root Execution**: Verify every container runs as non-root (Backend: `node` UID 1000, Frontend: `nginx` UID 101, Worker: `worker` UID 10001).
- [ ] **Read-Only Root Filesystem**: Configure containers to run with read-only root filesystems where possible, mounting writable folders to `/tmp` in ramdisks.
- [ ] **Network Policies**: Implement Kubernetes NetworkPolicies to block incoming traffic to MongoDB and Redis ports from anything outside the backend and worker pods.

---

## ⚙️ 2. Configuration & Resource Checklist

- [ ] **Specific Image Tags**: Verify image pull policies avoid `latest` tags, and target specific Git commit SHAs (e.g. `sha-8f9c1a`).
- [ ] **Resource Requests and Limits**: Ensure requests and limits are defined for all containers (e.g. limits: CPU 500m, Memory 512Mi on API pods) to prevent resource starvation.
- [ ] **Connection Limits**: Tune Express database pool size limits and rate limit max bounds (`RATE_LIMIT_MAX=100`) based on expected loads.
- [ ] **Log Rotation**: Configure winston loggers and Python handlers to stream logs directly to stdout/stderr, letting Kubernetes log rotators collect them.

---

## 📈 3. Scaling & High Availability Checklist

- [ ] **Metrics Server Active**: Ensure the K8s Metrics Server is running in the target cluster, and that HPAs are collecting CPU/Memory utilization.
- [ ] **KEDA Operator Installed**: Confirm KEDA operator resides in the cluster and `worker-scaler` successfully connects to Redis.
- [ ] **Replication Limits**: Verify backend has at least 2 active replicas to handle software updates without downtime.
- [ ] **Stateful Updates**: Verify MongoDB updates use `Recreate` deployment strategy to release storage volume locks cleanly.

---

## 🛡️ 4. Disaster Recovery & Reliability Checklist

- [ ] **Persistent Volume Reclaim**: Confirm the PersistentVolume reclaim policy for MongoDB is set to `Retain` to prevent accidental deletion of database directories.
- [ ] **Backup Automation**: Configure cronjobs to run hourly database dumps (`mongodump`) and sync them to offsite cloud stores (e.g. AWS S3).
- [ ] **Graceful Shutdown**: Verify worker terminates processing loops gracefully upon receiving `SIGTERM` signals from K8s.
- [ ] **Fallback Validation**: Test mock fallback loops to verify that API and Worker can fall back to database polling if Redis crashes.
