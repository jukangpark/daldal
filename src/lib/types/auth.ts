// 사용자 타입 정의
export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

// 인증 관련 타입 정의
export interface AuthUser {
  id: string;
  email: string;
  user_metadata: {
    name: string;
  };
}

// 로그인 데이터 타입
export interface LoginData {
  email: string;
  password: string;
}

// 회원가입 데이터 타입
export interface SignupData {
  email: string;
  password: string;
  name: string;
}
