export interface SelfIntroduction {
  id: string;
  user_id: string;
  user_name: string;
  user_age: number;
  user_gender: "male" | "female";
  user_location: string;
  title: string;
  content: string;
  photos: string[];
  likes: number;
  views: number;
  ideal_physical_type?: string;
  ideal_personality_type?: string;
  dating_style?: string;
  alcohol_tolerance?: string;
  smoking_status?: string;
  charm_appeal?: string;
  mbti?: string;
  hobbies?: string;
  special_skills?: string;
  created_at: string;
  updated_at: string;
  isVVIP?: boolean;
}

export interface CreateSelfIntroductionData {
  user_id: string;
  user_name: string;
  user_age: number;
  user_gender: "male" | "female";
  user_location: string;
  title: string;
  content: string;
  photos: string[];
  ideal_physical_type?: string;
  ideal_personality_type?: string;
  dating_style?: string;
  alcohol_tolerance?: string;
  smoking_status?: string;
  charm_appeal?: string;
  mbti?: string;
  hobbies?: string;
  special_skills?: string;
  isVVIP?: boolean;
}

// 댓글 타입
export interface SelfIntroductionComment {
  id: string;
  introduction_id: string;
  user_id: string | null;
  user_name: string;
  content: string;
  created_at: string;
}
