-- 달달스타그램 게시물 테이블 생성
CREATE TABLE IF NOT EXISTS daldalstagram_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  anonymous_name VARCHAR(50) NOT NULL, -- 익명 닉네임
  content TEXT NOT NULL, -- 게시물 내용
  images TEXT[] NOT NULL, -- 이미지 URL 배열 (최대 6개)
  password VARCHAR(255) NOT NULL, -- 게시물 수정/삭제용 비밀번호
  likes INTEGER DEFAULT 0, -- 좋아요 수
  views INTEGER DEFAULT 0, -- 조회수
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_daldalstagram_posts_user_id ON daldalstagram_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_daldalstagram_posts_created_at ON daldalstagram_posts(created_at DESC);

-- 좋아요 테이블 생성
CREATE TABLE IF NOT EXISTS daldalstagram_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES daldalstagram_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id) -- 한 사용자가 한 게시물에 한 번만 좋아요 가능
);

-- 댓글 테이블 생성
CREATE TABLE IF NOT EXISTS daldalstagram_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES daldalstagram_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  anonymous_name VARCHAR(50) NOT NULL, -- 익명 닉네임
  content TEXT NOT NULL, -- 댓글 내용
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_daldalstagram_comments_post_id ON daldalstagram_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_daldalstagram_comments_created_at ON daldalstagram_comments(created_at);

-- RLS (Row Level Security) 활성화
ALTER TABLE daldalstagram_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE daldalstagram_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE daldalstagram_comments ENABLE ROW LEVEL SECURITY;

-- 게시물 정책
CREATE POLICY "게시물은 모든 인증된 사용자가 읽을 수 있음" ON daldalstagram_posts
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "인증된 사용자만 게시물 작성 가능" ON daldalstagram_posts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "본인이 작성한 게시물만 수정/삭제 가능" ON daldalstagram_posts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "본인이 작성한 게시물만 삭제 가능" ON daldalstagram_posts
  FOR DELETE USING (auth.uid() = user_id);

-- 좋아요 정책
CREATE POLICY "좋아요는 모든 인증된 사용자가 읽을 수 있음" ON daldalstagram_likes
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "인증된 사용자만 좋아요 가능" ON daldalstagram_likes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "본인이 누른 좋아요만 삭제 가능" ON daldalstagram_likes
  FOR DELETE USING (auth.uid() = user_id);

-- 댓글 정책
CREATE POLICY "댓글은 모든 인증된 사용자가 읽을 수 있음" ON daldalstagram_comments
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "인증된 사용자만 댓글 작성 가능" ON daldalstagram_comments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "본인이 작성한 댓글만 수정/삭제 가능" ON daldalstagram_comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "본인이 작성한 댓글만 삭제 가능" ON daldalstagram_comments
  FOR DELETE USING (auth.uid() = user_id);

-- 함수 생성: 조회수 증가
CREATE OR REPLACE FUNCTION increment_daldalstagram_views()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE daldalstagram_posts 
  SET views = views + 1 
  WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성: 댓글 작성 시 조회수 증가
CREATE TRIGGER increment_daldalstagram_views_trigger
  AFTER INSERT ON daldalstagram_comments
  FOR EACH ROW
  EXECUTE FUNCTION increment_daldalstagram_views();

-- 함수 생성: 좋아요 수 업데이트
CREATE OR REPLACE FUNCTION update_daldalstagram_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE daldalstagram_posts 
    SET likes = likes + 1 
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE daldalstagram_posts 
    SET likes = likes - 1 
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성: 좋아요 추가/삭제 시 좋아요 수 업데이트
CREATE TRIGGER update_daldalstagram_likes_count_trigger
  AFTER INSERT OR DELETE ON daldalstagram_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_daldalstagram_likes_count(); 