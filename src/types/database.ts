export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          is_commissioner: boolean;
          avatar_url: string | null;
        };
        Insert: {
          id: string;
          username: string;
          is_commissioner?: boolean;
          avatar_url?: string | null;
        };
        Update: {
          id?: string;
          username?: string;
          is_commissioner?: boolean;
          avatar_url?: string | null;
        };
        Relationships: [];
      };
      players: {
        Row: {
          id: string;
          name: string;
          type: 'kid' | 'coach';
          is_active: boolean;
        };
        Insert: {
          id?: string;
          name: string;
          type: 'kid' | 'coach';
          is_active?: boolean;
        };
        Update: {
          id?: string;
          name?: string;
          type?: 'kid' | 'coach';
          is_active?: boolean;
        };
        Relationships: [];
      };
      parent_player_restrictions: {
        Row: {
          parent_id: string;
          player_id: string;
        };
        Insert: {
          parent_id: string;
          player_id: string;
        };
        Update: {
          parent_id?: string;
          player_id?: string;
        };
        Relationships: [];
      };
      scoring_rules: {
        Row: {
          id: number;
          action_name: string;
          position_context: string;
          points: number;
          is_active: boolean;
        };
        Insert: {
          id?: number;
          action_name: string;
          position_context: string;
          points: number;
          is_active?: boolean;
        };
        Update: {
          id?: number;
          action_name?: string;
          position_context?: string;
          points?: number;
          is_active?: boolean;
        };
        Relationships: [];
      };
      games: {
        Row: {
          id: string;
          opponent_name: string;
          date: string;
          status: 'scheduled' | 'drafting' | 'live' | 'completed';
        };
        Insert: {
          id?: string;
          opponent_name: string;
          date: string;
          status?: 'scheduled' | 'drafting' | 'live' | 'completed';
        };
        Update: {
          id?: string;
          opponent_name?: string;
          date?: string;
          status?: 'scheduled' | 'drafting' | 'live' | 'completed';
        };
        Relationships: [];
      };
      game_attendance: {
        Row: {
          game_id: string;
          player_id: string;
        };
        Insert: {
          game_id: string;
          player_id: string;
        };
        Update: {
          game_id?: string;
          player_id?: string;
        };
        Relationships: [];
      };
      game_draft_order: {
        Row: {
          game_id: string;
          profile_id: string;
          pick_order: number;
        };
        Insert: {
          game_id: string;
          profile_id: string;
          pick_order: number;
        };
        Update: {
          game_id?: string;
          profile_id?: string;
          pick_order?: number;
        };
        Relationships: [];
      };
      draft_picks: {
        Row: {
          id: string;
          game_id: string;
          picked_by_profile_id: string;
          player_id: string;
          round_number: number;
          pick_number: number;
        };
        Insert: {
          id?: string;
          game_id: string;
          picked_by_profile_id: string;
          player_id: string;
          round_number: number;
          pick_number: number;
        };
        Update: {
          id?: string;
          game_id?: string;
          picked_by_profile_id?: string;
          player_id?: string;
          round_number?: number;
          pick_number?: number;
        };
        Relationships: [];
      };
      game_logs: {
        Row: {
          id: string;
          game_id: string;
          player_id: string;
          rule_id: number;
          timestamp: string;
        };
        Insert: {
          id?: string;
          game_id: string;
          player_id: string;
          rule_id: number;
          timestamp?: string;
        };
        Update: {
          id?: string;
          game_id?: string;
          player_id?: string;
          rule_id?: number;
          timestamp?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
