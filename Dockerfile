# Use Debian-based Node (glibc) instead of Alpine (musl) to avoid rollup native binary issues
FROM node:24-slim

WORKDIR /app

# Install corepack for pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy workspace config files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./

# Copy all library packages
COPY lib/ ./lib/

# Copy ALL artifact packages
COPY artifacts/api-server/ ./artifacts/api-server/
COPY artifacts/insta-app/ ./artifacts/insta-app/

# Copy scripts and tsconfig files
COPY scripts/ ./scripts/
COPY tsconfig.json tsconfig.base.json ./

# Create attached_assets dir (referenced by vite alias)
RUN mkdir -p attached_assets

# Install all dependencies - no frozen-lockfile so native binaries install for current platform
RUN pnpm install --no-frozen-lockfile

# Build API server
RUN pnpm --filter @workspace/api-server run build

# Build frontend
RUN BASE_PATH=/ PORT=3000 pnpm --filter @workspace/insta-app run build

EXPOSE 8080

CMD ["sh", "-c", "(pnpm --filter @workspace/db run push || echo 'Warning: DB migration failed - set DATABASE_URL in Railway') && node artifacts/api-server/dist/index.mjs"]