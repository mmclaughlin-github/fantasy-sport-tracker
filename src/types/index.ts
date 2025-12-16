export type PlayerType = 'kid' | 'coach';
export type GameStatus = 'scheduled' | 'drafting' | 'live' | 'completed';

export interface Profile {
  id: string;
  username: string;
  is_commissioner: boolean;
  avatar_url: string | null;
}

export interface Player {
  id: string;
  name: string;
  type: PlayerType;
  is_active: boolean;
}

export interface ScoringRule {
  id: number;
  action_name: string;
  position_context: string;
  points: number;
  is_active: boolean;
}

export interface Game {
  id: string;
  opponent_name: string;
  date: string;
  status: GameStatus;
}

export interface DraftPick {
  id: string;
  game_id: string;
  picked_by_profile_id: string;
  player_id: string;
  round_number: number;
  pick_number: number;
}

export interface GameLog {
  id: string;
  game_id: string;
  player_id: string;
  rule_id: number;
  timestamp: string;
}

export interface ParentScore {
  profile_id: string;
  username: string;
  total_points: number;
  players: PlayerScore[];
}

export interface PlayerScore {
  player_id: string;
  player_name: string;
  points: number;
}
