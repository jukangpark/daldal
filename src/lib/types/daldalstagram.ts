// 달달스타그램 관련 타입 정의
export interface DaldalstagramPost {
  id: string;
  user_id: string;
  anonymous_name: string;
  content: string;
  images: string[];
  password: string;
  likes: number;
  views: number;
  created_at: string;
  updated_at: string;
  is_liked?: boolean;
}

export interface DaldalstagramComment {
  id: string;
  post_id: string;
  user_id: string;
  anonymous_name: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface CreateDaldalstagramPostData {
  anonymous_name: string;
  content: string;
  images: string[];
  password: string;
}

export interface UpdateDaldalstagramPostData {
  anonymous_name?: string;
  content?: string;
  images?: string[];
  password?: string;
}
