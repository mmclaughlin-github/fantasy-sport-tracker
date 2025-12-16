# Available Environment Variables

These environment variables are loaded from `~/.config/secrets` on shell startup.


## Supabase

| Variable | Description | Usage |
|----------|-------------|-------|
| `SUPABASE_URL` | Project URL | Client initialization |
| `SUPABASE_ANON_KEY` | Public anon key | Client-side, safe to expose |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key | Server-side only, full admin access |
| `SUPABASE_DB_PASSWORD` | DB Password | Client-side, full admin access |
```javascript
// Example: Supabase client
import { createClient } from '@supabase/supabase-js'

// Client-side (browser)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

// Server-side (admin access)
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)
```

## Cloudflare

| Variable | Description | Usage |
|----------|-------------|-------|
| `CLOUDFLARE_API_TOKEN` | API Token | Wrangler CLI, API calls |
| `CLOUDFLARE_ACCOUNT_ID` | Account ID | API calls, wrangler.toml |
| `CLOUDFLARE_ZONE_ID` | Zone ID (domain-specific) | DNS management |

```javascript
// Example: Cloudflare API
fetch(`https://api.cloudflare.com/client/v4/zones/${process.env.CLOUDFLARE_ZONE_ID}/dns_records`, {
  headers: { Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}` }
})
```

```toml
# wrangler.toml - account_id is auto-detected from env
name = "my-worker"
compatibility_date = "2024-01-01"
```

## Render

| Variable | Description | Usage |
|----------|-------------|-------|
| `RENDER_API_KEY` | API Key | Render API, deploy hooks |

```javascript
// Example: Render API
fetch('https://api.render.com/v1/services', {
  headers: { Authorization: `Bearer ${process.env.RENDER_API_KEY}` }
})
```

---

## Checking Availability

```bash
# List all available secrets
secrets list

# Check specific variable
echo $SUPABASE_URL

# Check all project-related vars
env | grep -E "SUPABASE|CLOUDFLARE|RENDER|GITHUB"
```

## Adding New Secrets

```bash
# Add to keychain (secure)
secrets add NEW_API_KEY --keychain

# Add to file (less sensitive)
secrets add SOME_CONFIG_VALUE

# Then restart shell or run:
source ~/.config/secrets
```

## For .env Files

If your framework requires a `.env` file, create one that references the shell vars:

```bash
# .env.local (gitignored)
SUPABASE_URL=${SUPABASE_URL}
SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
```

Or for frameworks that don't expand shell vars, copy the values directly (but don't commit!).
