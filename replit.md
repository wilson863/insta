# InstaClone

## Overview

A full-stack Instagram-like social media app built with React + Vite (frontend) and Express + PostgreSQL (backend). Users can register, log in, create posts, follow each other, like/comment on posts, and browse a personalized feed.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite + TailwindCSS + shadcn/ui + wouter
- **Backend**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Auth**: Session-based (cookies + bcryptjs)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (server), Vite (client)

## Structure

```text
artifacts/
├── api-server/       # Express API server (auth, posts, feed, users)
├── insta-app/        # React + Vite frontend (login, signup, feed, profile, explore)
lib/
├── api-spec/         # OpenAPI spec + Orval codegen config
├── api-client-react/ # Generated React Query hooks
├── api-zod/          # Generated Zod schemas from OpenAPI
└── db/               # Drizzle ORM schema + DB connection
    └── src/schema/
        ├── users.ts
        ├── posts.ts
        ├── follows.ts
        ├── likes.ts
        ├── comments.ts
        └── sessions.ts
```

## Features

- User registration and login (email + password, session cookies)
- Post creation with image URL + caption
- Like and unlike posts
- Comment on posts
- Follow / unfollow users
- Personalized feed (posts from followed users)
- Explore page (all posts)
- User profile pages with follow/follower stats
- Suggested users to follow
- Feed stats dashboard

## API Routes

All routes served under `/api`:

- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Login
- `POST /api/auth/logout` — Logout
- `GET /api/auth/me` — Get current user
- `GET /api/users/:username` — Get user profile
- `POST /api/users/:username/follow` — Follow user
- `POST /api/users/:username/unfollow` — Unfollow user
- `GET /api/users/:username/posts` — Get user's posts
- `GET /api/posts` — List all posts (explore)
- `POST /api/posts` — Create a post
- `GET /api/posts/:id` — Get single post
- `DELETE /api/posts/:id` — Delete post
- `POST /api/posts/:id/like` — Like a post
- `POST /api/posts/:id/unlike` — Unlike a post
- `GET /api/posts/:id/comments` — Get post comments
- `POST /api/posts/:id/comments` — Add a comment
- `GET /api/feed` — Get personalized feed
- `GET /api/feed/suggested` — Get suggested users
- `GET /api/feed/stats` — Get feed statistics

## Environment Variables Required

```
DATABASE_URL     # PostgreSQL connection string
SESSION_SECRET   # Secret for signing cookies
PORT             # Server port (auto-assigned by Replit)
```

## Running Locally / GitHub Deployment

```bash
# Install dependencies
pnpm install

# Push database schema
pnpm --filter @workspace/db run push

# Start API server (dev)
pnpm --filter @workspace/api-server run dev

# Start frontend (dev)
pnpm --filter @workspace/insta-app run dev
```

## Codegen

After changing the OpenAPI spec:

```bash
pnpm --filter @workspace/api-spec run codegen
```
