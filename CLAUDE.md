# Project: fantasy_sport_tracker

## Overview
Youth Fantasy Sports Tracker - A mobile-first Progressive Web App (PWA) for parents to draft youth sports players and track fantasy scores live during games.

## Tech Stack
- **Runtime:** Node.js 20+
- **Language:** TypeScript
- **Framework:** React 18 + Vite
- **Styling:** Tailwind CSS
- **State:** Zustand
- **Backend:** Supabase (PostgreSQL + Auth + Realtime)
- **Hosting:** Render (Static Site)
- **PWA:** vite-plugin-pwa

## Environment Setup
```bash
# Install dependencies
npm install

# If using nvm for Node version management
nvm use  # Uses version from .nvmrc

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials
```

## Project Structure
```
├── src/
│   ├── layouts/          # Layout components (AdminLayout)
│   ├── lib/              # External service clients (Supabase)
│   ├── pages/            # Route pages
│   │   ├── admin/        # Admin pages (RosterManagement, ScoringRules, GameSetup)
│   │   ├── Dashboard.tsx # Main dashboard
│   │   ├── Draft.tsx     # Snake draft interface
│   │   ├── Leaderboard.tsx # Live scoring leaderboard
│   │   ├── Login.tsx     # Auth page
│   │   └── StatPad.tsx   # Live stat recording
│   ├── store/            # Zustand state management (authStore)
│   ├── types/            # TypeScript types and database types
│   ├── App.tsx           # Router configuration
│   ├── index.css         # Tailwind + global styles
│   └── main.tsx          # Entry point
├── supabase/
│   └── schema.sql        # Database schema with RLS policies
├── public/               # Static assets
├── index.html            # HTML entry
├── vite.config.ts        # Vite + PWA configuration
├── tailwind.config.js    # Tailwind configuration
└── tsconfig.json         # TypeScript configuration
```

## Development Commands

```bash
# Install dependencies
npm install

# Run development server (hot reload)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Linting
npm run lint

# Format code
npm run format
```

## Key Files
- `package.json` - Dependencies and scripts
- `.nvmrc` - Node version (20.x)
- `vite.config.ts` - Vite + PWA configuration
- `src/lib/supabase.ts` - Supabase client initialization
- `src/App.tsx` - React Router setup with protected routes
- `supabase/schema.sql` - Complete database schema

## Application Modules

### Module A: Admin Configuration
**Routes:** `/admin/roster`, `/admin/rules`, `/admin/game-setup`
- Roster Management: CRUD for players, parent-player restrictions
- Scoring Rules: Configure points by action and position
- Game Setup: 3-step wizard (details, attendance, draft order)

### Module B: Draft Engine
**Route:** `/game/:gameId/draft`
- Snake draft with automatic turn detection
- Real-time pick updates via Supabase Realtime
- Parent restrictions (can't draft their own kids)
- Pool reset when players run out
- Auto-pick based on historical averages
- Commissioner force-pick for absent parents

### Module C: Stat Pad (Live Scoring)
**Route:** `/admin/stat-pad/:gameId`
- Mobile-optimized touch interface
- Select player → tap action → instant record
- Grouped by position context
- Recent activity log with delete
- Real-time sync to leaderboard

### Module D: Leaderboard
**Route:** `/game/:gameId/leaderboard`
- Live score updates via Supabase Realtime
- Expandable player breakdowns
- Medal indicators for top 3
- Sorted by total points

## Conventions
- **Naming:** camelCase for variables/functions, PascalCase for types/components
- **Exports:** Named exports preferred
- **Styling:** Tailwind utility classes, custom @layer components in index.css
- **State:** Zustand for global state (auth), React hooks for local
- **Error Handling:** Try/catch with user-friendly alerts

## Database Architecture
- **Supabase PostgreSQL** with Row Level Security (RLS)
- **Read:** All authenticated users
- **Write:** Commissioners only (except draft_picks during your turn)
- **Realtime:** Enabled on draft_picks and game_logs

## Important Notes
- All environment variables must be prefixed with `VITE_` for client access
- Supabase anon key is safe to expose in frontend
- Service role key should NEVER be in frontend code
- PWA manifest configured for mobile installation
- React Router uses client-side routing (needs /*→/index.html rewrite)

## Deployment
See `DEPLOYMENT.md` for complete deployment guide to Render + Supabase.

Quick deploy:
```bash
# Build
npm run build

# Deploy to Render (auto from GitHub)
git push origin main
```

## Testing Flow
1. Sign up new user
2. Make user commissioner in Supabase (set is_commissioner=true)
3. Add players via Roster Management
4. Create scoring rules
5. Create game with attendance and draft order
6. Join draft and make picks
7. Use Stat Pad to record actions
8. View live leaderboard updates

## Common Tasks

### Add New Scoring Rule
Admin → Scoring Rules → Add Rule

### Create New Game
Admin → Game Setup → Follow 3-step wizard

### Make Someone Commissioner
Supabase Dashboard → Table Editor → profiles → Edit row → is_commissioner = true

### Reset Draft (Delete All Picks)
Supabase Dashboard → Table Editor → draft_picks → Delete where game_id = 'xxx'

---
*Last updated: 2025-12-15*
