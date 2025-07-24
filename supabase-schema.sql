-- Supabase 데이터베이스 스키마

-- 자기소개서 테이블
CREATE TABLE IF NOT EXISTS self_introductions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_age INTEGER NOT NULL CHECK (user_age >= 18 AND user_age <= 100),
  user_gender TEXT NOT NULL CHECK (user_gender IN ('male', 'female')),
  user_location TEXT NOT NULL,
  user_photo TEXT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  photos TEXT[] DEFAULT '{}',
  likes INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 수퍼데이트 신청 테이블
CREATE TABLE IF NOT EXISTS super_date_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  requester_name TEXT NOT NULL,
  target_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  target_name TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) 활성화
ALTER TABLE self_introductions ENABLE ROW LEVEL SECURITY;
ALTER TABLE super_date_requests ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제 (있다면)
DROP POLICY IF EXISTS "자기소개서 읽기 정책" ON self_introductions;
DROP POLICY IF EXISTS "자기소개서 작성 정책" ON self_introductions;
DROP POLICY IF EXISTS "자기소개서 수정 정책" ON self_introductions;
DROP POLICY IF EXISTS "자기소개서 삭제 정책" ON self_introductions;
DROP POLICY IF EXISTS "수퍼데이트 신청 읽기 정책" ON super_date_requests;
DROP POLICY IF EXISTS "수퍼데이트 신청 작성 정책" ON super_date_requests;
DROP POLICY IF EXISTS "수퍼데이트 신청 수정 정책" ON super_date_requests;

-- 자기소개서 RLS 정책 (새로 생성)
-- 모든 사용자가 자기소개서를 읽을 수 있음
CREATE POLICY "self_introductions_select_policy" ON self_introductions
  FOR SELECT USING (true);

-- 로그인한 사용자만 자기소개서를 작성할 수 있음
CREATE POLICY "self_introductions_insert_policy" ON self_introductions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신의 자기소개서만 수정할 수 있음
CREATE POLICY "self_introductions_update_policy" ON self_introductions
  FOR UPDATE USING (auth.uid() = user_id);

-- 사용자는 자신의 자기소개서만 삭제할 수 있음
CREATE POLICY "self_introductions_delete_policy" ON self_introductions
  FOR DELETE USING (auth.uid() = user_id);

-- 수퍼데이트 신청 RLS 정책 (새로 생성)
-- 사용자는 자신이 보낸 신청을 읽을 수 있음
CREATE POLICY "super_date_requests_select_policy" ON super_date_requests
  FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = target_id);

-- 로그인한 사용자만 수퍼데이트 신청을 보낼 수 있음
CREATE POLICY "super_date_requests_insert_policy" ON super_date_requests
  FOR INSERT WITH CHECK (auth.uid() = requester_id);

-- 사용자는 자신이 받은 신청의 상태를 수정할 수 있음
CREATE POLICY "super_date_requests_update_policy" ON super_date_requests
  FOR UPDATE USING (auth.uid() = target_id);

-- 함수: 조회수 증가
CREATE OR REPLACE FUNCTION increment_views()
RETURNS INTEGER AS $$
BEGIN
  RETURN views + 1;
END;
$$ LANGUAGE plpgsql;

-- 함수: 좋아요 증가
CREATE OR REPLACE FUNCTION increment_likes()
RETURNS INTEGER AS $$
BEGIN
  RETURN likes + 1;
END;
$$ LANGUAGE plpgsql;

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_self_introductions_user_id ON self_introductions(user_id);
CREATE INDEX IF NOT EXISTS idx_self_introductions_created_at ON self_introductions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_self_introductions_user_gender ON self_introductions(user_gender);
CREATE INDEX IF NOT EXISTS idx_super_date_requests_requester_id ON super_date_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_super_date_requests_target_id ON super_date_requests(target_id);
CREATE INDEX IF NOT EXISTS idx_super_date_requests_created_at ON super_date_requests(created_at DESC);

-- 트리거: updated_at 자동 업데이트
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_self_introductions_updated_at
  BEFORE UPDATE ON self_introductions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 새로운 필드 추가 (기존 테이블에 컬럼 추가)
ALTER TABLE self_introductions 
ADD COLUMN IF NOT EXISTS ideal_physical_type TEXT,
ADD COLUMN IF NOT EXISTS ideal_personality_type TEXT,
ADD COLUMN IF NOT EXISTS dating_style TEXT,
ADD COLUMN IF NOT EXISTS alcohol_tolerance TEXT,
ADD COLUMN IF NOT EXISTS smoking_status TEXT,
ADD COLUMN IF NOT EXISTS charm_appeal TEXT,
ADD COLUMN IF NOT EXISTS mbti TEXT,
ADD COLUMN IF NOT EXISTS hobbies TEXT,
ADD COLUMN IF NOT EXISTS special_skills TEXT; 