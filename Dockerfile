# ============================================================
# LaunchTerminal — Multi-Stage Production Build
# ============================================================

# Stage 1: Install dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@8.15.1 --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod=false

# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@8.15.1 --activate

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN pnpm build

# Prune dev dependencies
RUN pnpm prune --prod

# Stage 3: Production runtime
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 launchterminal

COPY --from=builder --chown=launchterminal:nodejs /app/dist ./dist
COPY --from=builder --chown=launchterminal:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=launchterminal:nodejs /app/package.json ./
COPY --from=builder --chown=launchterminal:nodejs /app/claw.config.yml ./

USER launchterminal

EXPOSE 3000 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["node", "dist/index.js"]
