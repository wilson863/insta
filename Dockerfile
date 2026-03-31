FROM node:24-slim AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# Copy workspace files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY tsconfig.base.json tsconfig.json ./
COPY .npmrc ./

# Copy all packages
COPY lib/ ./lib/
COPY artifacts/api-server/ ./artifacts/api-server/
COPY artifacts/insta-app/ ./artifacts/insta-app/
COPY scripts/ ./scripts/

# Install all dependencies (including optional native binaries for current platform)
RUN pnpm install --no-frozen-lockfile

# Build API server
RUN pnpm --filter @workspace/api-server run build

# Build frontend
RUN BASE_PATH=/ PORT=3000 pnpm --filter @workspace/insta-app run build

# --- Production image ---
FROM node:24-slim AS production
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

COPY package.json pnpm-workspace.yaml ./
COPY .npmrc ./

# Copy built artifacts
COPY --from=base /app/artifacts/api-server/dist ./artifacts/api-server/dist
COPY --from=base /app/artifacts/insta-app/dist/public ./artifacts/insta-app/dist/public
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/lib ./lib

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["node", "--enable-source-maps", "./artifacts/api-server/dist/index.mjs"]
