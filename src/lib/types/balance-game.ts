export interface BalanceGame {
  id: string;
  title: string;
  option_a: string;
  option_b: string;
  description?: string;
  category: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BalanceGameVote {
  id: string;
  game_id: string;
  user_id: string;
  selected_option: "A" | "B";
  created_at: string;
}

export interface BalanceGameComment {
  id: string;
  game_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_name?: string;
  user_avatar?: string;
}

export interface BalanceGameWithStats extends BalanceGame {
  total_votes: number;
  option_a_votes: number;
  option_b_votes: number;
  option_a_percentage: number;
  option_b_percentage: number;
  user_vote?: "A" | "B";
  comments_count: number;
}

export interface VoteResult {
  option_a_percentage: number;
  option_b_percentage: number;
  total_votes: number;
  option_a_votes: number;
  option_b_votes: number;
}
