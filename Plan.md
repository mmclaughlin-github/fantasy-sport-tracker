# Project Specification: Youth Fantasy Sports PWA

## 1. Project Overview
**Goal:** Build a mobile-first web app (PWA) for parents to draft youth sports players (kids & coaches) and track fantasy scores live during games.
**Core Constraint:** "Toy Project" scope. Minimal cost, simple architecture, mobile-first usage.

## 2. Technology Stack
* **Frontend:** React (Vite), TypeScript.
* **UI Framework:** Tailwind CSS, shadcn/ui (Mobile-first components).
* **Backend/Database:** Supabase (PostgreSQL, Auth, Realtime).
* **Hosting:** Render (Static Web Service).
* **DNS:** Cloudflare.

---

## 3. Database Schema Specification (Supabase)

### Tables

1.  **`profiles`** (Extends Auth)
    * `id` (uuid, PK, references auth.users)
    * `username` (text)
    * `is_commissioner` (boolean, default false)
    * `avatar_url` (text)

2.  **`players`**
    * `id` (uuid, PK)
    * `name` (text)
    * `type` (text check: 'kid', 'coach')
    * `is_active` (boolean, default true)
    * *Note: Positions are NOT stored here. Positions are contextual during scoring.*

3.  **`parent_player_restrictions`**
    * `parent_id` (uuid, references profiles.id)
    * `player_id` (uuid, references players.id)
    * *Logic: A parent cannot draft a player listed here (their own kid).*

4.  **`scoring_rules`**
    * `id` (int, PK)
    * `action_name` (text) - e.g., "Goal", "Assist", "Head in Goal"
    * `position_context` (text) - e.g., "Forward", "Defense", "Goalie", "General"
    * `points` (int) - Can be negative.
    * `is_active` (boolean)

5.  **`games`**
    * `id` (uuid, PK)
    * `opponent_name` (text)
    * `date` (timestamp)
    * `status` (text check: 'scheduled', 'drafting', 'live', 'completed')

6.  **`game_attendance`** (Players available for draft)
    * `game_id` (uuid)
    * `player_id` (uuid)
    * *Logic: Only players in this table can be drafted for the specific game.*

7.  **`game_draft_order`** (Draft Sequence)
    * `game_id` (uuid)
    * `profile_id` (uuid) - The parent.
    * `pick_order` (int) - 1, 2, 3, etc.
    * *Logic: Determines who picks first in the Snake Draft.*

8.  **`draft_picks`**
    * `id` (uuid, PK)
    * `game_id` (uuid)
    * `picked_by_profile_id` (uuid)
    * `player_id` (uuid)
    * `round_number` (int)
    * `pick_number` (int)

9.  **`game_logs`** (The Scoring Events)
    * `id` (uuid, PK)
    * `game_id` (uuid)
    * `player_id` (uuid)
    * `rule_id` (int, references scoring_rules.id)
    * `timestamp` (timestamptz, default now)

### Security (RLS)
* **Read:** All authenticated users can read all tables.
* **Write:** Only users with `is_commissioner = true` can insert/update `players`, `scoring_rules`, `games`, `game_attendance`, `game_draft_order`, and `game_logs`.
* **Draft:** Users can insert into `draft_picks` only if it is their turn (enforced via app logic or DB function).

---

## 4. Module Specifications

### Module A: Admin Configuration (The Setup)
*Target User: Commissioner*

1.  **Roster Management:**
    * CRUD interface for `players`.
    * Ability to link a `profile` (Parent) to a `player` (Kid) in `parent_player_restrictions`.
2.  **Rule Builder:**
    * Interface to create/edit `scoring_rules`.
    * *Example:* Create Rule -> Name: "Goal", Context: "Defenseman", Points: 2.
3.  **Game Setup:**
    * Create a new game.
    * **Attendance Check:** List all active players with checkboxes. Selected players are inserted into `game_attendance` for that game.
    * **Set Draft Order:** * List all participating parents (`profiles`).
        * Drag-and-drop or Number Input to set the sequence (1st, 2nd, 3rd...).
        * Save to `game_draft_order`.

### Module B: The Draft Engine
*Target User: All Parents*

1.  **Draft State:**
    * Snake draft format.
    * Logic uses `game_draft_order` to determine current picker.
    * *Example:* If 3 parents (A, B, C): Round 1 is A->B->C. Round 2 is C->B->A.
2.  **Availability Logic (Critical):**
    * Display list of players from `game_attendance`.
    * **Filter 1 (Conflict):** Disable button if `player_id` is in `parent_player_restrictions` for the current user.
    * **Filter 2 (Taken):** Disable button if `player_id` exists in `draft_picks` for the current *game*...
    * **...Unless (Pool Reset):** If `count(available_players)` < `count(parents_drafting)`, the pool resets. Allow players to be picked a second time.
3.  **Auto-Draft Logic:**
    * Calculate `Average Points`: Query historical `game_logs` joined with `scoring_rules`. Sum points per player / count of completed games.
    * **"Auto-Pick" Button:** Selects the highest average point player available who is NOT restricted for the current user.
4.  **Commissioner Override:**
    * Commissioner can click "Force Pick" on any player to assign them to the *current* active drafter (handling absent parents).

### Module C: The "Stat Pad" (Live Scoring)
*Target User: Commissioner (Mobile View)*

1.  **Interface:**
    * Screen lists all players present at the game.
    * Tapping a player opens a "Action Sheet" (Bottom Drawer).
2.  **Action Buttons:**
    * Dynamically render buttons based on `scoring_rules`.
    * Group buttons by `position_context` (e.g., Header: "As Forward", Buttons: "Goal (1pt)", "Assist (1pt)").
3.  **Execution:**
    * Tapping an action inserts a row into `game_logs`.
    * Toast notification: "Goal recorded for [Player Name]."
4.  **Correction:**
    * "History" tab showing recent logs with a "Delete" (trash can) icon to remove erroneous entries.

### Module D: Leaderboard & Dashboard
*Target User: Parents (Mobile View)*

1.  **Live Updates:**
    * Subscribe to Supabase Realtime changes on `game_logs`.
2.  **View:**
    * Card for each Parent showing "Total Score."
    * Accordion expander: Shows the players they drafted and the breakdown of points per player.
3.  **Calculation:**
    * Sum of `scoring_rules.points` for all `game_logs` where `game_logs.player_id` matches the parent's `draft_picks`.

---

## 5. Deployment & Automation

### Git & CI/CD
* **Repo:** GitHub.
* **Build Command:** `npm run build`.
* **Publish Directory:** `dist`.

### Render Configuration
1.  Create "Static Site" on Render.
2.  Connect GitHub repo.
3.  Add Rewrite Rule: Source `/*`, Destination `/index.html` (for React Router).

### Custom Domain
1.  **Render:** Add custom domain (e.g., `fantasy.wildwestideas.com`).
2.  **Cloudflare:** Create `CNAME` record for `fantasy` pointing to the Render URL (e.g., `project-name.onrender.com`).
3.  **SSL:** Ensure Cloudflare SSL/TLS is set to "Full" or "Flexible".

## 6. Implementation Steps for AI Agent
1.  **Setup:** Initialize Vite/React/TS app + Supabase client.
2.  **Backend:** Run SQL Schema creation script.
3.  **Auth:** Build Login page + Protect Admin Routes.
4.  **Admin UI:** Build Player/Rule creation forms and "Game Setup" (Attendance + Draft Order).
5.  **Draft UI:** Implement Snake Draft logic, availability filters and "Pick" logic.
6.  **Scoring UI:** Build the mobile "Stat Pad" matrix.
7.  **Dashboard:** Build the realtime leaderboard.
8.  **Deploy:** Push to Render.

