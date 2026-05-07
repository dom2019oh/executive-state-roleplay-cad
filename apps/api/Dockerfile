FROM oven/bun:1.3-alpine AS base
WORKDIR /app

# Copy workspace root
COPY package.json bun.lock ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/shared/src ./packages/shared/src/

# Copy API
COPY apps/api/package.json ./apps/api/
RUN bun install

COPY apps/api/src ./apps/api/src/

WORKDIR /app/apps/api

ENV NODE_ENV=production
EXPOSE 3001

CMD ["bun", "src/index.ts"]
