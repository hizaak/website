# ========================================
# Build Stage
# ========================================
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

# ========================================
# Runtime Stage
# ========================================
FROM node:18-alpine

WORKDIR /app

RUN npm install -g pm2

COPY --from=builder /app/node_modules ./node_modules
COPY . .

RUN mkdir -p uploads/thumbnails uploads/documents && \
    chown -R node:node /app

USER node

ARG PORT=3000
ENV NODE_ENV=production
ENV PORT=${PORT}

EXPOSE ${PORT}

CMD ["pm2-runtime", "process.yml"]
