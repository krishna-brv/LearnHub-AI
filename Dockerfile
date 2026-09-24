# Multi-stage production Dockerfile for LearnHub AI Server
FROM node:20-alpine AS builder

WORKDIR /app

COPY server/package*.json ./
RUN npm ci --only=production

COPY server/ ./

EXPOSE 5000

ENV NODE_ENV=production
ENV PORT=5000

CMD ["node", "server.js"]
