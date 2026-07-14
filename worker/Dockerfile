# ==========================================
# STAGE 1: Build Python packages & compiler dependencies
# ==========================================
FROM python:3.11-slim AS builder

WORKDIR /app

# Install compilation/build requirements (like build-essential)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies inside user space (.local) to facilitate clean copying
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# ==========================================
# STAGE 2: Minimal final runtime container
# ==========================================
FROM python:3.11-slim AS runner

WORKDIR /app

# Prevent Python from writing pyc files and buffering stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PATH=/home/worker/.local/bin:$PATH

# Create a non-root group and user for security isolation (UID/GID 10001)
RUN groupadd -g 10001 worker && \
    useradd -u 10001 -g worker -m -s /sbin/nologin worker

# Copy built user packages from builder stage
COPY --chown=worker:worker --from=builder /root/.local /home/worker/.local

# Copy application source code
COPY --chown=worker:worker . .

# Set correct ownership for application directory
RUN chown -R worker:worker /app

# Switch to the non-root user
USER worker

# Set up health check executing the healthcheck.py script
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD python src/healthcheck.py

# Entry command to boot the worker processor
CMD ["python", "src/main.py"]
