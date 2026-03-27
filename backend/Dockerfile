# ========================================
# Build Stage
# ========================================
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# ========================================
# Runtime Stage
# ========================================
FROM node:18-alpine

WORKDIR /app

# Install PM2 globally
RUN npm install -g pm2

# Copy dependencies from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy application files
COPY . .

# Create uploads directory with correct permissions
RUN mkdir -p public/uploads && \
    chown -R node:node /app

# Switch to non-root user
USER node

# Environment variables
ARG PORT=3000
ENV NODE_ENV=production
ENV PORT=${PORT}

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:' + process.env.PORT, (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Expose port
EXPOSE ${PORT}

# Start application
CMD ["pm2-runtime", "process.yml"]
