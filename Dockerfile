FROM node:24-alpine

  WORKDIR /app

  # Enable corepack for pnpm
  RUN corepack enable && corepack prepare pnpm@latest --activate

  # Copy workspace config files first
  COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

  # Copy all library packages
  COPY lib/ ./lib/

  # Copy all artifact packages (BOTH api-server and insta-app)
  COPY artifacts/api-server/ ./artifacts/api-server/
  COPY artifacts/insta-app/ ./artifacts/insta-app/

  # Copy scripts
  COPY scripts/ ./scripts/

  # Copy tsconfig files
  COPY tsconfig.json tsconfig.base.json ./

  # Create attached_assets dir (referenced by vite alias)
  RUN mkdir -p attached_assets

  # Install all dependencies
  RUN pnpm install --frozen-lockfile

  # Build API server
  RUN pnpm --filter @workspace/api-server run build

  # Build frontend
  RUN BASE_PATH=/ PORT=3000 pnpm --filter @workspace/insta-app run build

  EXPOSE 8080

  CMD ["sh", "-c", "pnpm --filter @workspace/db run push && node artifacts/api-server/dist/index.mjs"]
  