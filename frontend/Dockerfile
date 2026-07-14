# ==========================================
# STAGE 1: Build React/Vite application
# ==========================================
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package configurations
COPY package*.json ./

# Install dependencies (clean install)
RUN npm ci

# Copy the frontend application files
COPY . .

# Declare Build-time Arguments (Vite config embeds these during npm run build)
ARG VITE_API_URL
ARG VITE_WS_URL

# Set environment variables for build
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_WS_URL=${VITE_WS_URL}

# Run the production build
RUN npm run build

# ==========================================
# STAGE 2: Serve compiled files using Nginx
# ==========================================
FROM nginx:1.25-alpine

# Set target directory
WORKDIR /usr/share/nginx/html

# Copy the built assets from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom optimized Nginx config file
COPY nginx.conf /etc/nginx/nginx.conf

# Reconfigure ownership & permissions to allow running as non-root user (nginx user)
RUN touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid /var/cache/nginx /var/log/nginx /etc/nginx /usr/share/nginx/html

# Switch to the non-root user
USER nginx

# Expose the non-privileged port configured in nginx.conf
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
