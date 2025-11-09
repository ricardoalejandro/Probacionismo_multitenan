# Backend Dockerfile for Fastify API
# Multi-stage build for optimal image size

# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Copy package files
COPY backend/package.json backend/package-lock.json ./
RUN npm ci

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY backend/ ./

# Build TypeScript
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Install wget for health checks
RUN apk add --no-cache wget

# Install production dependencies only
COPY backend/package.json backend/package-lock.json ./
RUN npm ci --only=production

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/drizzle.config.ts ./

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 fastify

# Set correct permissions
RUN chown -R fastify:nodejs /app

USER fastify

EXPOSE 3000

ENV PORT=3000
ENV HOST="0.0.0.0"

CMD ["node", "dist/index.js"]
