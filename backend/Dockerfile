FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

RUN mkdir -p uploads/thumbnails uploads/documents && \
    chown -R node:node /app

USER node

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# index.js handles SIGTERM itself: docker stop lets requests in progress end.
CMD ["node", "index.js"]
