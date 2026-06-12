# syntax=docker/dockerfile:1

# ---- deps: установка зависимостей + prisma generate (через postinstall) ----
FROM node:22-slim AS deps
WORKDIR /app
# OpenSSL нужен движку Prisma
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
# Схема нужна для `prisma generate` в postinstall
COPY prisma ./prisma
RUN npm ci

# ---- builder: сборка Next в standalone ----
FROM node:22-slim AS builder
WORKDIR /app
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---- runner: минимальный production-образ ----
FROM node:22-slim AS runner
WORKDIR /app
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# standalone-вывод Next (server.js + минимальный node_modules)
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
# Сгенерированный клиент Prisma + движок — на случай, если трассировка standalone их не подхватит
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 3000
CMD ["node", "server.js"]
