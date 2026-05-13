# Ver & Val Fitness Tracker

A web app to track strength workouts, weekly check-ins, and view cardio/strength guides for two clients (Ver and Val).

Built with Next.js 15, TypeScript, Tailwind CSS, Drizzle ORM, and Neon Postgres. Deploys to Vercel in one click.

## Features

- **Weekly Check-in** — Log kJ burnt, calorie adherence score (0-10), and weight
- **Weight Tracker** — Per-exercise tracking for sets, PBs, and next-session targets, with auto-calculated progression suggestions
- **Cardio Guide** — Heart rate zones, weekly targets, and tips (read-only reference)
- **Strength Guide** — Exercise pool, preset workouts, and form notes (read-only reference)
- **Ver / Val toggle** — Both see all data, just switch between whose data you're viewing
- **Cloud-synced** — Access from phone, laptop, or tablet

## Setup

### 1. Get a free Neon Postgres database

1. Go to [neon.tech](https://neon.tech) and sign up (free, no credit card)
2. Create a new project — call it "fitness-tracker"
3. Copy the **connection string** (looks like `postgres://...`)

### 2. Install and run locally

```bash
npm install
```

Create `.env.local` and paste your Neon connection string:

```
DATABASE_URL="postgres://your-connection-string-here"
```

Push the schema to your database (creates all tables):

```bash
npm run db:push
```

Then start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 3. Deploy to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. In **Environment Variables**, add `DATABASE_URL` with your Neon connection string
4. Click Deploy

That's it. Vercel will build and deploy automatically. Every push to `main` triggers a redeploy.

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Main app with tabs
│   ├── layout.tsx            # Root layout
│   └── api/
│       ├── checkins/         # Weekly check-in CRUD
│       └── lifts/            # Lift logging CRUD
├── components/
│   ├── ui/                   # shadcn-style primitives
│   ├── weekly-checkin.tsx
│   ├── weight-tracker.tsx
│   ├── cardio-guide.tsx
│   └── strength-guide.tsx
├── lib/
│   └── utils.ts
└── db/
    ├── schema.ts             # Drizzle schema
    └── index.ts              # DB client
```

## Costs

- **Neon free tier**: 0.5 GB storage, 191 compute hours/month — way more than this app needs
- **Vercel Hobby tier**: Free for personal projects

Total: **$0/month**.
