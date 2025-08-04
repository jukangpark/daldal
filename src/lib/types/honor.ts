// 명예의 전당 투표 관련 타입 정의
export interface HonorVote {
  id: string;
  voter_id: string;
  target_id: string;
  category: "hot_girl" | "hot_boy" | "manner" | "sexy" | "cute" | "style";
  month_year: string;
  created_at: string;
  updated_at: string;
}

export interface HonorResult {
  id: string;
  user_id: string;
  user_name: string;
  category: "hot_girl" | "hot_boy" | "manner" | "sexy" | "cute" | "style";
  month_year: string;
  vote_count: number;
  rank: number | null;
  created_at: string;
  updated_at: string;
}

export interface CreateHonorVoteData {
  target_id: string;
  category: "hot_girl" | "hot_boy" | "manner" | "sexy" | "cute" | "style";
  month_year: string;
}

export interface VoteCandidate {
  user_id: string;
  user_name: string;
  user_gender: "male" | "female";
  photos: string[];
  profile_image?: string;
}
