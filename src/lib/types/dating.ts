export type DatingGender = "male" | "female";

// 소개팅 카드 (주선자가 작성)
export interface DatingCardRow {
  id: string;
  matchmaker_user_id: string;

  user_name: string;
  user_age: number;
  user_gender: DatingGender;
  location: string;
  mbti: string | null;

  introduction: string;
  interests: string[];
  photos: string[];
  smoke: string | null;
  alcohol: string | null;
  charm_appeal: string | null;
  hobbies: string | null;
  special_skills: string | null;
  ideal_physical_type: string | null;
  ideal_personality_type: string | null;
  dating_style: string | null;

  created_at: string;
  updated_at: string;
}

export interface CreateDatingCardData {
  user_name: string;
  user_age: number;
  user_gender: DatingGender;
  location: string;
  mbti?: string;
  introduction: string;
  interests: string[];
  photos: string[];
  smoke?: string;
  alcohol?: string;
  charm_appeal?: string;
  hobbies?: string;
  special_skills?: string;
  ideal_physical_type?: string;
  ideal_personality_type?: string;
  dating_style?: string;
}

export type DatingApplicationStatus = "pending" | "approved" | "rejected";

// 신청 카드
export interface DatingApplicationRow {
  id: string;
  dating_card_id: string;
  applicant_user_id: string;

  name: string;
  age: number;
  phone: string;
  gender: DatingGender;
  location: string | null;
  mbti: string | null;
  smoke: string | null;
  alcohol: string | null;
  charm_appeal: string | null;
  dating_style: string | null;
  photos: string[];

  status: DatingApplicationStatus;
  created_at: string;
  updated_at: string;
}

export interface CreateDatingApplicationData {
  dating_card_id: string;
  name: string;
  age: number;
  phone: string;
  gender: DatingGender;
  location?: string;
  mbti?: string;
  smoke?: string;
  alcohol?: string;
  charm_appeal?: string;
  dating_style?: string;
  photos: string[];
}


