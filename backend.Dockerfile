# Backend Dockerfile for Fastify API
# Using full node image for easier builds

# Stage 1: Builder
FROM node:20 AS builder
WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . ./

# Build TypeScript
RUN npm run build

# Stage 2: Runner
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

# Install wget and netcat for health checks
RUN apt-get update && apt-get install -y \
    wget \
    netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

# Copy package file
COPY package.json ./

# Install production dependencies and tools
RUN npm install --omit=dev && \
    npm install -g drizzle-kit tsx

# Copy built application from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src ./src
COPY drizzle.config.ts ./

# Copy entrypoint script
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Create non-root user
RUN groupadd --system --gid 1001 nodejs
RUN useradd --system --uid 1001 -g nodejs fastify

# Set correct permissions
RUN chown -R fastify:nodejs /app

USER fastify

EXPOSE 3000

ENV PORT=3000
ENV HOST="0.0.0.0"

ENTRYPOINT ["./docker-entrypoint.sh"]
