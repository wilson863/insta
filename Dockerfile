FROM node:24-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# Copy workspace files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY tsconfig.base.json tsconfig.json ./

# Copy all packages
COPY lib/ ./lib/
COPY artifacts/api-server/ ./artifacts/api-server/
COPY artifacts/insta-app/ ./artifacts/insta-app/
COPY scripts/ ./scripts/

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Build frontend
RUN pnpm --filter @workspace/insta-app run build

# Build API server
RUN pnpm --filter @workspace/api-server run build

# Prune dev dependencies
RUN pnpm prune --prod

# --- Production image ---
FROM node:24-alpine AS production
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

COPY --from=base /app/artifacts/api-server/dist ./dist
COPY --from=base /app/artifacts/insta-app/dist/public ./public
COPY --from=base /app/node_modules ./node_modules

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["node", "--enable-source-maps", "./dist/index.mjs"]
