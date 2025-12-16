-- =============================================
-- Youth Fantasy Sports Database Schema
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. PROFILES TABLE (Extends Auth)
-- =============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  is_commissioner BOOLEAN DEFAULT FALSE,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 2. PLAYERS TABLE
-- =============================================
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('kid', 'coach')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 3. PARENT-PLAYER RESTRICTIONS
-- =============================================
CREATE TABLE parent_player_restrictions (
  parent_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  PRIMARY KEY (parent_id, player_id)
);

-- =============================================
-- 4. SCORING RULES
-- =============================================
CREATE TABLE scoring_rules (
  id SERIAL PRIMARY KEY,
  action_name TEXT NOT NULL,
  position_context TEXT NOT NULL,
  points INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 5. GAMES
-- =============================================
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  opponent_name TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'drafting', 'live', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 6. GAME ATTENDANCE
-- =============================================
CREATE TABLE game_attendance (
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  PRIMARY KEY (game_id, player_id)
);

-- =============================================
-- 7. GAME DRAFT ORDER
-- =============================================
CREATE TABLE game_draft_order (
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  pick_order INTEGER NOT NULL,
  PRIMARY KEY (game_id, profile_id)
);

-- =============================================
-- 8. DRAFT PICKS
-- =============================================
CREATE TABLE draft_picks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  picked_by_profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL,
  pick_number INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 9. GAME LOGS (Scoring Events)
-- =============================================
CREATE TABLE game_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  rule_id INTEGER REFERENCES scoring_rules(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_player_restrictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE scoring_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_draft_order ENABLE ROW LEVEL SECURITY;
ALTER TABLE draft_picks ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_logs ENABLE ROW LEVEL SECURITY;

-- Read access for all authenticated users
CREATE POLICY "Public read access" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public read access" ON players FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public read access" ON parent_player_restrictions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public read access" ON scoring_rules FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public read access" ON games FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public read access" ON game_attendance FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public read access" ON game_draft_order FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public read access" ON draft_picks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public read access" ON game_logs FOR SELECT TO authenticated USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id);

-- Commissioner write access for admin tables
CREATE POLICY "Commissioner write access" ON players FOR ALL TO authenticated
  USING ((SELECT is_commissioner FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Commissioner write access" ON parent_player_restrictions FOR ALL TO authenticated
  USING ((SELECT is_commissioner FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Commissioner write access" ON scoring_rules FOR ALL TO authenticated
  USING ((SELECT is_commissioner FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Commissioner write access" ON games FOR ALL TO authenticated
  USING ((SELECT is_commissioner FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Commissioner write access" ON game_attendance FOR ALL TO authenticated
  USING ((SELECT is_commissioner FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Commissioner write access" ON game_draft_order FOR ALL TO authenticated
  USING ((SELECT is_commissioner FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Commissioner write access" ON game_logs FOR ALL TO authenticated
  USING ((SELECT is_commissioner FROM profiles WHERE id = auth.uid()));

-- Draft picks: Users can insert their own picks
CREATE POLICY "Users can insert own draft picks" ON draft_picks FOR INSERT TO authenticated
  WITH CHECK (picked_by_profile_id = auth.uid());

-- Commissioner can insert any draft picks
CREATE POLICY "Commissioner can insert any draft picks" ON draft_picks FOR INSERT TO authenticated
  WITH CHECK ((SELECT is_commissioner FROM profiles WHERE id = auth.uid()));

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX idx_draft_picks_game_id ON draft_picks(game_id);
CREATE INDEX idx_draft_picks_profile_id ON draft_picks(picked_by_profile_id);
CREATE INDEX idx_game_logs_game_id ON game_logs(game_id);
CREATE INDEX idx_game_logs_player_id ON game_logs(player_id);
CREATE INDEX idx_game_attendance_game_id ON game_attendance(game_id);
CREATE INDEX idx_game_draft_order_game_id ON game_draft_order(game_id);

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to calculate average points for a player
CREATE OR REPLACE FUNCTION get_player_average_points(player_uuid UUID)
RETURNS NUMERIC AS $$
DECLARE
  avg_points NUMERIC;
BEGIN
  SELECT COALESCE(AVG(total_points), 0)
  INTO avg_points
  FROM (
    SELECT g.id as game_id, SUM(sr.points) as total_points
    FROM game_logs gl
    JOIN scoring_rules sr ON gl.rule_id = sr.id
    JOIN games g ON gl.game_id = g.id
    WHERE gl.player_id = player_uuid
      AND g.status = 'completed'
    GROUP BY g.id
  ) game_totals;

  RETURN avg_points;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- SEED DATA (Optional - for testing)
-- =============================================

-- Insert some default scoring rules
INSERT INTO scoring_rules (action_name, position_context, points, is_active) VALUES
  ('Goal', 'Forward', 1, true),
  ('Goal', 'Defense', 2, true),
  ('Assist', 'Forward', 1, true),
  ('Assist', 'Defense', 1, true),
  ('Save', 'Goalie', 1, true),
  ('Goal Allowed', 'Goalie', -1, true),
  ('Head in Goal', 'General', 1, true),
  ('Penalty', 'General', -1, true);
