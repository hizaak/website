# ========================================
# Build Stage
# ========================================
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

ARG ANGULAR_ENV=production
ENV ANGULAR_ENV=${ANGULAR_ENV}

RUN npm run build -- --configuration ${ANGULAR_ENV}

# ========================================
# Runtime Stage - Nginx
# ========================================
FROM nginx:alpine

RUN rm /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/nginx.conf

COPY --from=builder /app/dist/frontend/browser /usr/share/nginx/html

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
