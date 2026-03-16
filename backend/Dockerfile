# ============================================
# Stage 1: Builder — install all dependencies
# ============================================
FROM node:18 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# ============================================
# Stage 2: Production — slim alpine image
# ============================================
FROM node:18-alpine

WORKDIR /app

# Copy only production files from builder
COPY --from=builder /app/package*.json ./
RUN npm ci --only=production && npm cache clean --force

COPY --from=builder /app/server.js ./

# Run as non-root user for security
USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "server.js"]
