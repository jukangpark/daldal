-- 기존 RLS 정책 삭제
DROP POLICY IF EXISTS "balance_game_votes_insert_policy" ON balance_game_votes;
DROP POLICY IF EXISTS "balance_game_votes_select_policy" ON balance_game_votes;
DROP POLICY IF EXISTS "balance_game_comments_insert_policy" ON balance_game_comments;
DROP POLICY IF EXISTS "balance_game_comments_select_policy" ON balance_game_comments;
DROP POLICY IF EXISTS "balance_game_comments_update_policy" ON balance_game_comments;
DROP POLICY IF EXISTS "balance_game_comments_delete_policy" ON balance_game_comments;

-- 새로운 RLS 정책 생성
-- 밸런스 게임 투표 조회 (모든 사용자)
CREATE POLICY "balance_game_votes_select_policy" ON balance_game_votes
  FOR SELECT USING (true);

-- 밸런스 게임 투표 삽입/수정 (인증된 사용자만)
CREATE POLICY "balance_game_votes_insert_policy" ON balance_game_votes
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "balance_game_votes_update_policy" ON balance_game_votes
  FOR UPDATE USING (auth.uid()::text = user_id::text);

-- 밸런스 게임 댓글 조회 (모든 사용자)
CREATE POLICY "balance_game_comments_select_policy" ON balance_game_comments
  FOR SELECT USING (true);

-- 밸런스 게임 댓글 삽입 (인증된 사용자만)
CREATE POLICY "balance_game_comments_insert_policy" ON balance_game_comments
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- 밸런스 게임 댓글 수정 (작성자만)
CREATE POLICY "balance_game_comments_update_policy" ON balance_game_comments
  FOR UPDATE USING (auth.uid()::text = user_id::text);

-- 밸런스 게임 댓글 삭제 (작성자만)
CREATE POLICY "balance_game_comments_delete_policy" ON balance_game_comments
  FOR DELETE USING (auth.uid()::text = user_id::text);

-- 테스트용 데이터 확인 쿼리
SELECT 
  'balance_games' as table_name,
  COUNT(*) as count
FROM balance_games
UNION ALL
SELECT 
  'balance_game_votes' as table_name,
  COUNT(*) as count
FROM balance_game_votes
UNION ALL
SELECT 
  'balance_game_comments' as table_name,
  COUNT(*) as count
FROM balance_game_comments;
