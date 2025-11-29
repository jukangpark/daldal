-- Supabase 데이터베이스 스키마

-- 자소설 테이블
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

-- 슈퍼데이트 투표 테이블 (익명 투표)
CREATE TABLE IF NOT EXISTS super_date_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  voter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  target_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(voter_id, target_id) -- 한 사용자가 같은 대상에게 중복 투표 불가
);

-- 슈퍼데이트 연결 테이블 (서로 투표한 경우)
CREATE TABLE IF NOT EXISTS super_date_matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user2_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  matched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user1_id, user2_id) -- 중복 매칭 방지
);


-- 기존 정책 삭제 (있다면)
DROP POLICY IF EXISTS "자소설 읽기 정책" ON self_introductions;
DROP POLICY IF EXISTS "자소설 작성 정책" ON self_introductions;
DROP POLICY IF EXISTS "자소설 수정 정책" ON self_introductions;
DROP POLICY IF EXISTS "자소설 삭제 정책" ON self_introductions;
DROP POLICY IF EXISTS "super_date_votes_select_policy" ON super_date_votes;
DROP POLICY IF EXISTS "super_date_votes_insert_policy" ON super_date_votes;
DROP POLICY IF EXISTS "super_date_votes_delete_policy" ON super_date_votes;
DROP POLICY IF EXISTS "super_date_matches_select_policy" ON super_date_matches;
DROP POLICY IF EXISTS "super_date_matches_insert_policy" ON super_date_matches;

-- 자소설 RLS 정책
-- 모든 사용자가 자소설을 읽을 수 있음
CREATE POLICY "self_introductions_select_policy" ON self_introductions
  FOR SELECT USING (true);

-- 로그인한 사용자만 자소설을 작성할 수 있음
CREATE POLICY "self_introductions_insert_policy" ON self_introductions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신의 자소설만 수정할 수 있음
CREATE POLICY "self_introductions_update_policy" ON self_introductions
  FOR UPDATE USING (auth.uid() = user_id);

-- 사용자는 자신의 자소설만 삭제할 수 있음
CREATE POLICY "self_introductions_delete_policy" ON self_introductions
  FOR DELETE USING (auth.uid() = user_id);

-- 슈퍼데이트 투표 RLS 정책
-- 사용자는 자신이 투표한 내역을 볼 수 있음
CREATE POLICY "super_date_votes_select_policy" ON super_date_votes
  FOR SELECT USING (auth.uid() = voter_id);

-- 로그인한 사용자만 투표할 수 있음
CREATE POLICY "super_date_votes_insert_policy" ON super_date_votes
  FOR INSERT WITH CHECK (auth.uid() = voter_id);

-- 사용자는 자신이 투표한 내역을 삭제할 수 있음
CREATE POLICY "super_date_votes_delete_policy" ON super_date_votes
  FOR DELETE USING (auth.uid() = voter_id);

-- 슈퍼데이트 매칭 RLS 정책
-- 사용자는 자신이 포함된 매칭을 볼 수 있음
CREATE POLICY "super_date_matches_select_policy" ON super_date_matches
  FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- 시스템에서만 매칭을 생성할 수 있음 (RLS 우회 필요)
CREATE POLICY "super_date_matches_insert_policy" ON super_date_matches
  FOR INSERT WITH CHECK (true);

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

-- 함수: 투표 받은 수 계산
CREATE OR REPLACE FUNCTION get_vote_count(target_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*) 
    FROM super_date_votes 
    WHERE target_id = target_user_id
  );
END;
$$ LANGUAGE plpgsql;

-- 함수: 서로 투표한 사용자 매칭 생성
CREATE OR REPLACE FUNCTION create_matches()
RETURNS void AS $$
BEGIN
  -- 서로 투표한 사용자들을 찾아서 매칭 생성
  INSERT INTO super_date_matches (user1_id, user2_id)
  SELECT DISTINCT 
    LEAST(v1.voter_id, v2.voter_id) as user1_id,
    GREATEST(v1.voter_id, v2.voter_id) as user2_id
  FROM super_date_votes v1
  INNER JOIN super_date_votes v2 ON v1.voter_id = v2.target_id AND v2.voter_id = v1.target_id
  WHERE v1.voter_id < v2.voter_id
  ON CONFLICT (user1_id, user2_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_self_introductions_user_id ON self_introductions(user_id);
CREATE INDEX IF NOT EXISTS idx_self_introductions_created_at ON self_introductions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_self_introductions_user_gender ON self_introductions(user_gender);
CREATE INDEX IF NOT EXISTS idx_super_date_votes_voter_id ON super_date_votes(voter_id);
CREATE INDEX IF NOT EXISTS idx_super_date_votes_target_id ON super_date_votes(target_id);
CREATE INDEX IF NOT EXISTS idx_super_date_votes_created_at ON super_date_votes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_super_date_matches_user1_id ON super_date_matches(user1_id);
CREATE INDEX IF NOT EXISTS idx_super_date_matches_user2_id ON super_date_matches(user2_id);

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

-- 달달톡 채팅 메시지 테이블
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 달달톡 타이핑 상태 테이블
CREATE TABLE IF NOT EXISTS typing_status (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL,
  lastTyping TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 달달톡 온라인 사용자 테이블
CREATE TABLE IF NOT EXISTS online_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 채팅 관련 테이블 RLS 비활성화 (익명 접근 허용)
ALTER TABLE chat_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE typing_status DISABLE ROW LEVEL SECURITY;
ALTER TABLE online_users DISABLE ROW LEVEL SECURITY;

-- 채팅 메시지 인덱스
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_typing_status_user_id ON typing_status(user_id);
CREATE INDEX IF NOT EXISTS idx_online_users_user_id ON online_users(user_id);

-- 오래된 메시지 자동 삭제 함수 (30일 이상 된 메시지)
CREATE OR REPLACE FUNCTION cleanup_old_messages()
RETURNS void AS $$
BEGIN
  DELETE FROM chat_messages 
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- 오래된 타이핑 상태 정리 함수
CREATE OR REPLACE FUNCTION cleanup_old_typing_status()
RETURNS void AS $$
BEGIN
  DELETE FROM typing_status 
  WHERE lastTyping < NOW() - INTERVAL '5 minutes';
END;
$$ LANGUAGE plpgsql;

-- 오래된 온라인 사용자 정리 함수
CREATE OR REPLACE FUNCTION cleanup_old_online_users()
RETURNS void AS $$
BEGIN
  DELETE FROM online_users 
  WHERE last_seen < NOW() - INTERVAL '10 minutes';
END;
$$ LANGUAGE plpgsql;

-- 연애 가치관 테스트 결과 테이블
CREATE TABLE IF NOT EXISTS love_test_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  answers INTEGER[] NOT NULL,
  personality_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 연애 가치관 테스트 결과 RLS 정책
ALTER TABLE love_test_results ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 테스트 결과를 읽을 수 있음 (매칭을 위해)
CREATE POLICY "love_test_results_select_policy" ON love_test_results
  FOR SELECT USING (true);

-- 로그인한 사용자만 자신의 테스트 결과를 저장할 수 있음
CREATE POLICY "love_test_results_insert_policy" ON love_test_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신의 테스트 결과만 삭제할 수 있음
CREATE POLICY "love_test_results_delete_policy" ON love_test_results
  FOR DELETE USING (auth.uid() = user_id);

-- 연애 가치관 테스트 결과 인덱스
CREATE INDEX IF NOT EXISTS idx_love_test_results_user_id ON love_test_results(user_id);
CREATE INDEX IF NOT EXISTS idx_love_test_results_created_at ON love_test_results(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_love_test_results_personality_type ON love_test_results(personality_type);

-- 성적 성향 테스트 결과 테이블
CREATE TABLE IF NOT EXISTS sexy_test_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  answers INTEGER[] NOT NULL,
  personality_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 성적 성향 테스트 결과 RLS 정책
ALTER TABLE sexy_test_results ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 테스트 결과를 읽을 수 있음 (매칭을 위해)
CREATE POLICY "sexy_test_results_select_policy" ON sexy_test_results
  FOR SELECT USING (true);

-- 로그인한 사용자만 자신의 테스트 결과를 저장할 수 있음
CREATE POLICY "sexy_test_results_insert_policy" ON sexy_test_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신의 테스트 결과만 삭제할 수 있음
CREATE POLICY "sexy_test_results_delete_policy" ON sexy_test_results
  FOR DELETE USING (auth.uid() = user_id);

-- 성적 성향 테스트 결과 인덱스
CREATE INDEX IF NOT EXISTS idx_sexy_test_results_user_id ON sexy_test_results(user_id);
CREATE INDEX IF NOT EXISTS idx_sexy_test_results_created_at ON sexy_test_results(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sexy_test_results_personality_type ON sexy_test_results(personality_type); 

-- =========================================
-- 소개팅 카드 & 신청 카드 테이블
-- =========================================

-- 소개팅 카드 (주선자가 작성하는 카드)
CREATE TABLE IF NOT EXISTS dating_cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  matchmaker_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 소개 대상자 기본 정보
  user_name TEXT NOT NULL,
  user_age INTEGER NOT NULL CHECK (user_age >= 18 AND user_age <= 100),
  user_gender TEXT NOT NULL CHECK (user_gender IN ('male', 'female')),
  location TEXT NOT NULL,
  mbti TEXT,

  -- 소개 대상자 상세 정보
  introduction TEXT NOT NULL,
  interests TEXT[] DEFAULT '{}',
  photos TEXT[] DEFAULT '{}',
  smoke TEXT,
  alcohol TEXT,
  charm_appeal TEXT,
  hobbies TEXT,
  special_skills TEXT,
  ideal_physical_type TEXT,
  ideal_personality_type TEXT,
  dating_style TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE dating_cards ENABLE ROW LEVEL SECURITY;

-- 누구나 소개팅 카드를 조회할 수 있음
CREATE POLICY "dating_cards_select_policy" ON dating_cards
  FOR SELECT USING (true);

-- 로그인한 사용자만 자신의 소개팅 카드를 작성할 수 있음
CREATE POLICY "dating_cards_insert_policy" ON dating_cards
  FOR INSERT WITH CHECK (auth.uid() = matchmaker_user_id);

-- 주선자만 자신의 소개팅 카드를 수정/삭제할 수 있음
CREATE POLICY "dating_cards_update_policy" ON dating_cards
  FOR UPDATE USING (auth.uid() = matchmaker_user_id);

CREATE POLICY "dating_cards_delete_policy" ON dating_cards
  FOR DELETE USING (auth.uid() = matchmaker_user_id);

CREATE INDEX IF NOT EXISTS idx_dating_cards_matchmaker_user_id ON dating_cards(matchmaker_user_id);
CREATE INDEX IF NOT EXISTS idx_dating_cards_created_at ON dating_cards(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dating_cards_user_gender ON dating_cards(user_gender);

-- 신청 카드 (소개팅 카드에 대한 신청 정보)
CREATE TABLE IF NOT EXISTS dating_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  dating_card_id UUID NOT NULL REFERENCES dating_cards(id) ON DELETE CASCADE,
  applicant_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 18 AND age <= 100),
  phone TEXT NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
  location TEXT,
  mbti TEXT,
  smoke TEXT,
  alcohol TEXT,
  charm_appeal TEXT,
  dating_style TEXT,
  photos TEXT[] DEFAULT '{}',

  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE dating_applications ENABLE ROW LEVEL SECURITY;

-- 신청 카드 조회 정책:
-- 1) 신청자 본인
-- 2) 해당 소개팅 카드의 주선자
CREATE POLICY "dating_applications_select_policy" ON dating_applications
  FOR SELECT USING (
    auth.uid() = applicant_user_id
    OR auth.uid() = (
      SELECT matchmaker_user_id
      FROM dating_cards dc
      WHERE dc.id = dating_card_id
    )
  );

-- 로그인한 사용자만 신청 카드를 작성할 수 있음
CREATE POLICY "dating_applications_insert_policy" ON dating_applications
  FOR INSERT WITH CHECK (auth.uid() = applicant_user_id);

-- 신청 카드 수정 정책:
-- 1) 신청자는 자신의 신청 내용을 수정할 수 있음
-- 2) 주선자는 status 를 포함해 신청 카드를 갱신할 수 있음
CREATE POLICY "dating_applications_update_policy" ON dating_applications
  FOR UPDATE USING (
    auth.uid() = applicant_user_id
    OR auth.uid() = (
      SELECT matchmaker_user_id
      FROM dating_cards dc
      WHERE dc.id = dating_card_id
    )
  );

-- 신청 카드 삭제 정책 (선택): 신청자 본인이 삭제 가능
CREATE POLICY "dating_applications_delete_policy" ON dating_applications
  FOR DELETE USING (auth.uid() = applicant_user_id);

CREATE INDEX IF NOT EXISTS idx_dating_applications_card_id ON dating_applications(dating_card_id);
CREATE INDEX IF NOT EXISTS idx_dating_applications_applicant_user_id ON dating_applications(applicant_user_id);
CREATE INDEX IF NOT EXISTS idx_dating_applications_status ON dating_applications(status);
