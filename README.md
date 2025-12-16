# Youth Fantasy Sports Tracker

A mobile-first Progressive Web App (PWA) for parents to draft youth sports players and track fantasy scores live during games.

## Features

- **Snake Draft System**: Fair drafting with automatic turn management
- **Live Scoring**: Real-time stat tracking during games
- **Parent Restrictions**: Prevent parents from drafting their own children
- **Leaderboard**: Live updates with player breakdowns
- **Mobile-First**: Optimized for mobile devices with PWA support
- **Commissioner Tools**: Admin panel for roster, rules, and game management

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **Hosting**: Render (Static Site)
- **PWA**: vite-plugin-pwa

## Setup

### Prerequisites

- Node.js 20+
- Supabase account
- Render account (for deployment)

### Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up Supabase**:
   - Create a new Supabase project
   - Run the SQL schema from `supabase/schema.sql` in the SQL Editor
   - Copy your project URL and anon key

3. **Configure environment**:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

4. **Run development server**:
   ```bash
   npm run dev
   ```

5. **Create your first user**:
   - Sign up through the app
   - In Supabase, manually set `is_commissioner = true` in the profiles table for admin access

## Database Setup

Run the SQL schema in your Supabase project:

```sql
-- Copy contents from supabase/schema.sql
```

This creates:
- All required tables (profiles, players, games, etc.)
- Row Level Security (RLS) policies
- Indexes for performance
- Helper functions
- Seed data for scoring rules

## Deployment to Render

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin your-repo-url
   git push -u origin main
   ```

2. **Create Static Site on Render**:
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New" → "Static Site"
   - Connect your GitHub repository
   - Configure:
     - **Build Command**: `npm run build`
     - **Publish Directory**: `dist`

3. **Add Environment Variables**:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key

4. **Configure Rewrites**:
   Add a rewrite rule for React Router:
   - **Source**: `/*`
   - **Destination**: `/index.html`

5. **Deploy**:
   - Render will automatically build and deploy
   - Your app will be available at `https://your-app.onrender.com`

## Custom Domain (Cloudflare)

1. **Add Custom Domain in Render**:
   - Go to your site settings
   - Add custom domain (e.g., `fantasy.yourdomain.com`)

2. **Configure DNS in Cloudflare**:
   - Add CNAME record:
     - Name: `fantasy`
     - Target: `your-app.onrender.com`
   - Set SSL/TLS to "Full" or "Flexible"

## Usage

### For Commissioners

1. **Manage Roster**:
   - Add/edit players (kids and coaches)
   - Link parents to their children (restrictions)

2. **Configure Scoring Rules**:
   - Set points for different actions
   - Customize by position context

3. **Create Game**:
   - Set opponent and date
   - Select which players are attending
   - Set draft order for parents

4. **During Game**:
   - Use Stat Pad to record actions
   - Delete mistakes from history

### For Parents

1. **Join Draft**:
   - Wait for your turn
   - Pick from available players
   - Use Auto-Pick for best average

2. **Watch Leaderboard**:
   - See live score updates
   - Expand to view player breakdowns

## Project Structure

```
├── src/
│   ├── components/         # Reusable components
│   ├── layouts/           # Layout components
│   ├── lib/               # Supabase client
│   ├── pages/             # Route pages
│   │   ├── admin/         # Admin pages
│   │   ├── Dashboard.tsx
│   │   ├── Draft.tsx
│   │   ├── Leaderboard.tsx
│   │   ├── Login.tsx
│   │   └── StatPad.tsx
│   ├── store/             # Zustand stores
│   ├── types/             # TypeScript types
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── supabase/
│   └── schema.sql         # Database schema
├── public/                # Static assets
├── index.html
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── vite.config.ts
```

## Key Features Implementation

### Snake Draft Logic
- Alternating pick order each round
- Automatic turn detection
- Real-time updates via Supabase Realtime
- Auto-pick based on historical averages

### Realtime Updates
- Supabase Realtime subscriptions
- Live leaderboard updates
- Draft pick notifications
- Stat pad synchronization

### Row Level Security
- Read access for all authenticated users
- Write access only for commissioners
- Parents can only draft on their turn

## Contributing

This is a toy project for personal use, but suggestions are welcome!

## License

MIT
