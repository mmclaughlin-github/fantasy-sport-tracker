# Deployment Guide

## Step-by-Step Deployment to Production

### 1. Supabase Setup

1. **Create Supabase Project**:
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Set project name, database password, region
   - Wait for project to initialize

2. **Run Database Schema**:
   - Navigate to SQL Editor in Supabase Dashboard
   - Copy entire contents of `supabase/schema.sql`
   - Paste and run in SQL Editor
   - Verify all tables are created in Table Editor

3. **Get API Credentials**:
   - Go to Settings → API
   - Copy:
     - Project URL (e.g., `https://xxxxx.supabase.co`)
     - Anon/Public key (safe to expose in frontend)
   - Keep service role key secret (don't use in frontend)

4. **Configure Authentication**:
   - Go to Authentication → Providers
   - Enable Email provider
   - (Optional) Configure email templates
   - (Optional) Enable additional providers (Google, GitHub, etc.)

5. **Enable Realtime** (if not already enabled):
   - Go to Database → Replication
   - Enable replication for:
     - `draft_picks`
     - `game_logs`

### 2. Local Testing

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Create .env file**:
   ```bash
   cp .env.example .env
   ```

3. **Add Supabase Credentials to .env**:
   ```
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```

4. **Test Locally**:
   ```bash
   npm run dev
   ```
   - Open http://localhost:5173
   - Sign up for an account
   - Test basic functionality

5. **Make First User Commissioner**:
   - In Supabase Dashboard → Table Editor
   - Open `profiles` table
   - Find your user
   - Set `is_commissioner` to `true`
   - Refresh app and verify admin access

6. **Test Build**:
   ```bash
   npm run build
   npm run preview
   ```

### 3. GitHub Setup

1. **Initialize Git**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Youth Fantasy Sports Tracker"
   ```

2. **Create GitHub Repository**:
   - Go to github.com
   - Create new repository (private or public)
   - Don't initialize with README (already have one)

3. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/yourusername/fantasy-sport-tracker.git
   git branch -M main
   git push -u origin main
   ```

### 4. Render Deployment

1. **Create Account**:
   - Go to [render.com](https://render.com)
   - Sign up/login (can use GitHub)

2. **Create New Static Site**:
   - Click "New +" → "Static Site"
   - Connect your GitHub account
   - Select your repository
   - Configure:
     - **Name**: `fantasy-sports-tracker` (or your choice)
     - **Branch**: `main`
     - **Build Command**: `npm run build`
     - **Publish Directory**: `dist`

3. **Add Environment Variables**:
   - In the Environment section, add:
     - `VITE_SUPABASE_URL` = your Supabase URL
     - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key

4. **Configure Rewrite Rules**:
   - Scroll to "Redirects/Rewrites"
   - Add rule:
     - **Source**: `/*`
     - **Destination**: `/index.html`
     - **Action**: Rewrite

5. **Deploy**:
   - Click "Create Static Site"
   - Wait for build to complete
   - Your app will be live at `https://fantasy-sports-tracker.onrender.com`

### 5. Custom Domain (Optional - Cloudflare)

1. **Add Domain in Render**:
   - Go to Settings → Custom Domain
   - Click "Add Custom Domain"
   - Enter: `fantasy.yourdomain.com`
   - Copy the CNAME target provided

2. **Configure DNS in Cloudflare**:
   - Login to Cloudflare
   - Select your domain
   - Go to DNS → Records
   - Add CNAME record:
     - **Type**: CNAME
     - **Name**: `fantasy`
     - **Target**: `fantasy-sports-tracker.onrender.com` (or provided target)
     - **Proxy status**: Proxied (orange cloud)

3. **SSL/TLS Settings**:
   - In Cloudflare, go to SSL/TLS
   - Set encryption mode to "Full" or "Full (strict)"

4. **Wait for Propagation**:
   - DNS changes can take 5-60 minutes
   - Check status in Render dashboard
   - Once verified, your app is live at `https://fantasy.yourdomain.com`

### 6. Post-Deployment Checklist

- [ ] App loads correctly
- [ ] Sign up creates new user
- [ ] Login works
- [ ] Commissioner can access admin panel
- [ ] Can create players
- [ ] Can create scoring rules
- [ ] Can create game
- [ ] Can set attendance
- [ ] Can set draft order
- [ ] Draft page loads
- [ ] Can make picks
- [ ] Realtime updates work
- [ ] Stat pad records actions
- [ ] Leaderboard updates in realtime
- [ ] Mobile view looks good
- [ ] PWA installs on mobile

### 7. Troubleshooting

**Build fails on Render**:
- Check build logs for specific error
- Verify all dependencies in package.json
- Test `npm run build` locally first

**Environment variables not working**:
- Ensure variables start with `VITE_`
- Restart deployment after adding env vars
- Check browser console for connection errors

**Supabase connection fails**:
- Verify URL and keys are correct
- Check if Supabase project is active
- Look for CORS errors in browser console

**Realtime not working**:
- Enable replication in Supabase for required tables
- Check browser console for subscription errors
- Verify RLS policies allow reads

**Draft/Leaderboard not updating**:
- Check browser console for errors
- Verify Supabase Realtime is enabled
- Test with multiple browser tabs

### 8. Monitoring & Maintenance

**Supabase**:
- Monitor database size (free tier: 500MB)
- Check API usage (free tier: 50,000 monthly active users)
- Review logs for errors

**Render**:
- Free tier includes:
  - 100GB bandwidth/month
  - Automatic deploys from Git
  - Free SSL
- Monitor build minutes (400/month on free tier)

### 9. Future Enhancements

- [ ] Email notifications for draft turns
- [ ] Push notifications for game start
- [ ] Photo uploads for players
- [ ] Season standings
- [ ] Historical statistics
- [ ] Export game reports
- [ ] Multi-sport support
- [ ] Team chat/comments

## Support

For issues:
1. Check browser console for errors
2. Review Supabase logs
3. Check Render deployment logs
4. Open issue on GitHub repository
