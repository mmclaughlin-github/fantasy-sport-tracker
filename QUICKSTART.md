# Quick Start Guide

Get the Youth Fantasy Sports Tracker running in 10 minutes!

## Prerequisites

- Node.js 20+ installed
- Supabase account (free tier is fine)

## 1. Install Dependencies (1 minute)

```bash
npm install
```

## 2. Set Up Supabase (3 minutes)

### Create Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Name it (e.g., "fantasy-sports")
4. Choose a database password (save it!)
5. Select region (choose closest to you)
6. Wait ~2 minutes for setup

### Run Schema
1. In Supabase dashboard, click "SQL Editor" (left sidebar)
2. Click "New Query"
3. Copy **entire** contents of `supabase/schema.sql`
4. Paste and click "Run"
5. You should see "Success. No rows returned"

### Get API Keys
1. Click "Settings" (gear icon) → "API"
2. Copy:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

## 3. Configure Environment (1 minute)

```bash
# Copy example file
cp .env.example .env

# Edit .env file
# Replace with your actual values:
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...your_key_here
```

## 4. Start Development Server (1 minute)

```bash
npm run dev
```

Your app is now running at **http://localhost:5173**!

## 5. First Time Setup (4 minutes)

### Create Your Account
1. Open http://localhost:5173
2. Click "Don't have an account? Sign up"
3. Enter:
   - Username: `admin`
   - Email: `your@email.com`
   - Password: (at least 6 characters)
4. Click "Sign Up"

### Make Yourself Commissioner
1. Go to Supabase Dashboard
2. Click "Table Editor" → "profiles"
3. Find your row (your email)
4. Click the `is_commissioner` cell
5. Change from `false` to `true`
6. Click checkmark to save
7. Refresh your browser (the app, not Supabase)

You should now see "ADMIN" badge in the header!

### Add Some Players
1. Click "Manage Roster" on dashboard
2. Click "Add Player"
3. Add a few players:
   - Name: "Johnny Smith", Type: Kid
   - Name: "Sarah Jones", Type: Kid
   - Name: "Mike Brown", Type: Kid
   - Name: "Coach Davis", Type: Coach

### Create Scoring Rules
They're already created by the schema! But you can:
1. Click "Scoring Rules"
2. See default rules (Goal, Assist, Save, etc.)
3. Add more if you want

### Create a Game
1. Click "Game Setup" or "Create Game"
2. **Step 1: Game Details**
   - Opponent: "Blue Team"
   - Date: Pick today's date + time
   - Status: "Drafting"
   - Click "Next"

3. **Step 2: Attendance**
   - Select all the players you added
   - Click "Next"

4. **Step 3: Draft Order**
   - You should see yourself listed
   - Order is set to 1 (you're first!)
   - Click "Complete Setup"

### Try the Draft
1. Back on dashboard, you should see your game
2. Click "Join Draft"
3. It's your turn! Click any player to draft them
4. Try the "Auto-Pick Best Player" button

### Record Stats
1. Go back to dashboard
2. Click "Stat Pad" for your game
3. Select a player
4. Tap an action (e.g., "Goal +1 pts")
5. See the toast notification!

### View Leaderboard
1. Go back to dashboard
2. Click "View Leaderboard"
3. See your score update in real-time!
4. Click your name to expand player breakdown

## 🎉 You're Done!

You've successfully:
- ✅ Set up the database
- ✅ Created an admin account
- ✅ Added players
- ✅ Created a game
- ✅ Drafted players
- ✅ Recorded stats
- ✅ Viewed live leaderboard

## Next Steps

### Add More Parents
1. Sign up additional accounts (use different emails)
2. For each, make them commissioner temporarily
3. Go to Roster → Parent Restrictions
4. Link parents to their kids (they can't draft them)
5. Create a new game with multiple parents in draft order

### Multi-Player Draft
1. Create game with 3+ parents in draft order
2. Open draft in multiple browser tabs (or devices)
3. Watch as picks update in real-time!
4. See the snake draft alternate: A→B→C, then C→B→A

### Deploy to Production
See `DEPLOYMENT.md` for full guide to deploy on Render.

## Troubleshooting

**"Missing Supabase environment variables" error**
- Make sure .env file exists
- Check variable names start with `VITE_`
- Restart dev server after changing .env

**Can't see Admin features**
- Verify `is_commissioner = true` in Supabase profiles table
- Hard refresh browser (Cmd+Shift+R or Ctrl+Shift+R)

**Players not showing in draft**
- Make sure you selected them in Game Setup → Attendance
- Check game status is "Drafting" or "Live"

**Realtime not working**
- Check browser console for errors
- Verify Supabase Realtime is enabled (should be by default)
- Try hard refresh

## Support

- Check `README.md` for detailed documentation
- See `DEPLOYMENT.md` for production deployment
- Open issue on GitHub for bugs
