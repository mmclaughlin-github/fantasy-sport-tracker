-- =====================================================
-- SECURITY FIX: Draft Turn Validation
-- =====================================================
-- This file addresses the critical security issue where
-- users could bypass frontend turn validation and insert
-- draft picks when it's not their turn.
--
-- Apply this after running schema.sql
-- =====================================================

-- Function to validate if it's the user's turn to draft
CREATE OR REPLACE FUNCTION is_users_turn(
  p_game_id UUID,
  p_user_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_pick_count INTEGER;
  v_parent_count INTEGER;
  v_current_round INTEGER;
  v_position_in_round INTEGER;
  v_is_snake_back BOOLEAN;
  v_pick_order_index INTEGER;
  v_expected_picker UUID;
BEGIN
  -- Get total picks for this game
  SELECT COUNT(*) INTO v_pick_count
  FROM draft_picks
  WHERE game_id = p_game_id;

  -- Get number of parents drafting
  SELECT COUNT(*) INTO v_parent_count
  FROM game_draft_order
  WHERE game_id = p_game_id;

  -- If no parents, deny (game not set up properly)
  IF v_parent_count = 0 THEN
    RETURN FALSE;
  END IF;

  -- Calculate current round (1-indexed)
  v_current_round := FLOOR(v_pick_count / v_parent_count) + 1;

  -- Calculate position within current round
  v_position_in_round := v_pick_count % v_parent_count;

  -- Determine if this round goes backwards (snake draft)
  v_is_snake_back := (v_current_round % 2 = 0);

  -- Calculate pick order index
  IF v_is_snake_back THEN
    -- Even rounds go backwards: C->B->A
    v_pick_order_index := v_parent_count - 1 - v_position_in_round;
  ELSE
    -- Odd rounds go forwards: A->B->C
    v_pick_order_index := v_position_in_round;
  END IF;

  -- Get the expected picker for this position
  SELECT profile_id INTO v_expected_picker
  FROM game_draft_order
  WHERE game_id = p_game_id
  ORDER BY pick_order ASC
  LIMIT 1 OFFSET v_pick_order_index;

  -- Return true if it's this user's turn
  RETURN (v_expected_picker = p_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update RLS policy to enforce turn validation
DROP POLICY IF EXISTS "Users can insert own draft picks" ON draft_picks;

CREATE POLICY "Users can insert own draft picks" ON draft_picks
FOR INSERT TO authenticated
WITH CHECK (
  picked_by_profile_id = auth.uid()
  AND is_users_turn(game_id, auth.uid())
);

-- Commissioner can still insert any draft picks (for force-pick feature)
-- This policy already exists, no changes needed

-- =====================================================
-- Testing the Function
-- =====================================================
-- You can test the function with:
-- SELECT is_users_turn('game-uuid-here', 'user-uuid-here');
-- Should return true only when it's that user's turn

-- =====================================================
-- Notes
-- =====================================================
-- This function enforces the snake draft logic at the
-- database level, preventing any client-side bypass.
--
-- The SECURITY DEFINER ensures the function runs with
-- the privileges of the function owner, allowing it to
-- query all necessary tables even with RLS enabled.
