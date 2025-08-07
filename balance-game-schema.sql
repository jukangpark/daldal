-- 밸런스 게임 테이블
CREATE TABLE balance_games (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT '일반',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 밸런스 게임 투표 테이블
CREATE TABLE balance_game_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID REFERENCES balance_games(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  selected_option TEXT NOT NULL CHECK (selected_option IN ('A', 'B')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(game_id, user_id) -- 한 사용자가 한 게임에 한 번만 투표 가능
);

-- 밸런스 게임 댓글 테이블
CREATE TABLE balance_game_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID REFERENCES balance_games(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) 활성화
ALTER TABLE balance_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE balance_game_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE balance_game_comments ENABLE ROW LEVEL SECURITY;

-- RLS 정책 설정
-- 밸런스 게임 조회 (모든 사용자)
CREATE POLICY "balance_games_select_policy" ON balance_games
  FOR SELECT USING (true);

-- 밸런스 게임 투표 조회 (모든 사용자)
CREATE POLICY "balance_game_votes_select_policy" ON balance_game_votes
  FOR SELECT USING (true);

-- 밸런스 게임 투표 삽입 (인증된 사용자만)
CREATE POLICY "balance_game_votes_insert_policy" ON balance_game_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 밸런스 게임 댓글 조회 (모든 사용자)
CREATE POLICY "balance_game_comments_select_policy" ON balance_game_comments
  FOR SELECT USING (true);

-- 밸런스 게임 댓글 삽입 (인증된 사용자만)
CREATE POLICY "balance_game_comments_insert_policy" ON balance_game_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 밸런스 게임 댓글 수정 (작성자만)
CREATE POLICY "balance_game_comments_update_policy" ON balance_game_comments
  FOR UPDATE USING (auth.uid() = user_id);

-- 밸런스 게임 댓글 삭제 (작성자만)
CREATE POLICY "balance_game_comments_delete_policy" ON balance_game_comments
  FOR DELETE USING (auth.uid() = user_id);

-- 샘플 데이터 삽입
INSERT INTO balance_games (title, option_a, option_b, description, category) VALUES
('연애할 때 더 중요한 것은?', '마음이 맞는 사람', '외모가 좋은 사람', '연애에서 가장 중요한 요소는 무엇일까요?', '연애'),
('데이트 장소로 더 좋은 곳은?', '조용한 카페', '시끄러운 노래방', '데이트할 때 어떤 분위기를 선호하시나요?', '데이트'),
('주말에 더 하고 싶은 것은?', '집에서 휴식', '밖에 나가서 놀기', '주말을 어떻게 보내고 싶으신가요?', '일반'),
('음식 취향으로 더 좋아하는 것은?', '매운 음식', '달콤한 음식', '어떤 맛을 더 선호하시나요?', '음식'),
('여행 스타일로 더 좋아하는 것은?', '계획적인 여행', '즉흥적인 여행', '어떤 여행 스타일을 선호하시나요?', '여행'),
('영화 장르로 더 좋아하는 것은?', '액션/스릴러', '로맨스/코미디', '어떤 영화를 더 즐겨보시나요?', '영화'),
('커뮤니케이션 스타일로 더 선호하는 것은?', '직접 대화', '메시지나 전화', '어떤 방식으로 소통하는 것을 선호하시나요?', '소통'),
('취미 활동으로 더 좋아하는 것은?', '독서나 영화 감상', '운동이나 액티비티', '어떤 활동을 더 즐기시나요?', '취미');

-- 인덱스 생성 (성능 최적화)
CREATE INDEX idx_balance_game_votes_game_id ON balance_game_votes(game_id);
CREATE INDEX idx_balance_game_votes_user_id ON balance_game_votes(user_id);
CREATE INDEX idx_balance_game_comments_game_id ON balance_game_comments(game_id);
CREATE INDEX idx_balance_game_comments_user_id ON balance_game_comments(user_id);
CREATE INDEX idx_balance_games_category ON balance_games(category);
CREATE INDEX idx_balance_games_created_at ON balance_games(created_at DESC);
