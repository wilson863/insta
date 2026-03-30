# InstaClone

A full-stack Instagram-like social media app with working login, signup, posts, likes, comments, follows, and a personalized feed.

## Features

- User registration and login (session-based auth)
- Create posts with images and captions
- Like and unlike posts
- Comment on posts
- Follow / unfollow users
- Personalized home feed
- Explore all posts
- User profiles with stats (posts, followers, following)
- Suggested users to follow

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite + TailwindCSS + shadcn/ui |
| Backend | Node.js + Express 5 |
| Database | PostgreSQL + Drizzle ORM |
| Auth | Session cookies + bcryptjs |
| Package manager | pnpm workspaces |
| Language | TypeScript |

## Getting Started (Local Development)

### Prerequisites

- Node.js 24+
- pnpm (`npm install -g pnpm`)
- PostgreSQL 14+

### 1. Clone the repository

```bash
git clone https://github.com/wilson863/insta.git
cd insta
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Set up environment variables

```bash
cp .env.example .env
# Edit .env and fill in your DATABASE_URL and SESSION_SECRET
```

### 4. Set up the database

```bash
pnpm --filter @workspace/db run push
```

### 5. Start the development servers

Open two terminals:

**Terminal 1 — API Server:**
```bash
pnpm --filter @workspace/api-server run dev
```

**Terminal 2 — Frontend:**
```bash
pnpm --filter @workspace/insta-app run dev
```

The app will be at `http://localhost:5173` (or whichever port Vite assigns).

## Deployment Options

### Option 1: Docker Compose (easiest)

```bash
# Set your secret key
export SESSION_SECRET=your-very-long-random-secret

docker-compose up --build -d
```

The app will be available at `http://localhost:8080`.

### Option 2: Railway

1. Push this repo to GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Add a PostgreSQL service
4. Set environment variables: `DATABASE_URL`, `SESSION_SECRET`, `PORT=8080`
5. Railway will auto-deploy on every push

### Option 3: Render

1. Push this repo to GitHub
2. Go to [render.com](https://render.com) → New Web Service → Connect GitHub repo
3. **Build command:** `pnpm install && pnpm --filter @workspace/api-server run build && pnpm --filter @workspace/insta-app run build`
4. **Start command:** `node artifacts/api-server/dist/index.mjs`
5. Add a PostgreSQL database from Render's dashboard
6. Set env vars: `DATABASE_URL`, `SESSION_SECRET`, `NODE_ENV=production`, `PORT=8080`

### Option 4: Self-hosted VPS (Ubuntu/Debian)

```bash
# Install Node.js 24, pnpm, PostgreSQL
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt-get install -y nodejs postgresql

# Clone and install
git clone https://github.com/wilson863/insta.git
cd insta
pnpm install

# Set up env vars
cp .env.example .env
nano .env  # fill in your values

# Push schema
pnpm --filter @workspace/db run push

# Build for production
pnpm --filter @workspace/api-server run build
pnpm --filter @workspace/insta-app run build

# Start with PM2
npm install -g pm2
PORT=8080 SESSION_SECRET=your-secret DATABASE_URL=postgresql://... pm2 start artifacts/api-server/dist/index.mjs --name instaclone
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `SESSION_SECRET` | Yes | Long random string to sign session cookies |
| `PORT` | Yes | Port the API server listens on (default: 8080) |
| `NODE_ENV` | No | `development` or `production` |

Generate a secure `SESSION_SECRET`:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## API Reference

All routes are prefixed with `/api`.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | No | Register a new user |
| POST | `/auth/login` | No | Log in |
| POST | `/auth/logout` | No | Log out |
| GET | `/auth/me` | Yes | Get current user |
| GET | `/users/:username` | No | Get user profile |
| POST | `/users/:username/follow` | Yes | Follow a user |
| POST | `/users/:username/unfollow` | Yes | Unfollow a user |
| GET | `/users/:username/posts` | No | Get user's posts |
| GET | `/posts` | No | All posts (explore) |
| POST | `/posts` | Yes | Create a post |
| GET | `/posts/:id` | No | Get a post |
| DELETE | `/posts/:id` | Yes | Delete own post |
| POST | `/posts/:id/like` | Yes | Like a post |
| POST | `/posts/:id/unlike` | Yes | Unlike a post |
| GET | `/posts/:id/comments` | No | Get comments |
| POST | `/posts/:id/comments` | Yes | Add a comment |
| GET | `/feed` | Yes | Personalized feed |
| GET | `/feed/suggested` | Yes | Suggested users |
| GET | `/feed/stats` | Yes | Your stats |

## Pushing to GitHub

```bash
# Set remote (replace with your repo URL)
git remote add origin https://github.com/wilson863/insta.git

# Push all code
git add .
git commit -m "Full-stack InstaClone with working auth, posts, feed"
git push -u origin main
```

> **Important:** Never commit your `.env` file. It is listed in `.gitignore`.
