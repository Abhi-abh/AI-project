# ==========================================
# STAGE 1: Build dependencies & Source Code
# ==========================================
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

# Copy package configurations first to leverage layer caching
COPY package*.json ./

# Install all dependencies (development and production)
RUN npm ci

# Copy application source code
COPY . .

# ==========================================
# STAGE 2: Fetch production dependencies only
# ==========================================
FROM node:18-alpine AS pruner

WORKDIR /usr/src/app

COPY package*.json ./

# Clean installation of only production dependencies
RUN npm ci --only=production

# ==========================================
# STAGE 3: Final lightweight runner image
# ==========================================
FROM node:18-alpine AS runner

WORKDIR /usr/src/app

# Set environments
ENV NODE_ENV=production
ENV PORT=5000

# Copy node_modules from pruner stage
COPY --chown=node:node --from=pruner /usr/src/app/node_modules ./node_modules

# Copy app code from builder stage
COPY --chown=node:node --from=builder /usr/src/app/src ./src

# Set owner permissions for the directory
RUN chown -R node:node /usr/src/app

# Run container as non-root user (alpine has standard 'node' user UID 1000)
USER node

# Expose internal API port
EXPOSE 5000

# Health check using a native inline Node HTTP request (avoids dependency on curl/wget)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "const http = require('http'); http.get('http://localhost:5000/health', (res) => { if (res.statusCode === 200) { process.exit(0); } else { process.exit(1); } }).on('error', (err) => { process.exit(1); });"

# Entry point for production start
CMD ["node", "src/app.js"]
