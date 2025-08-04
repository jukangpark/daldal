export interface SuperDateVote {
  id: string;
  voter_id: string;
  target_id: string;
  created_at: string;
}

export interface SuperDateMatch {
  id: string;
  user1_id: string;
  user2_id: string;
  matched_at: string;
}

export interface CreateSuperDateVoteData {
  target_id: string;
}

export interface CreateSuperDateRequestData {
  target_id: string;
  target_name: string;
}
