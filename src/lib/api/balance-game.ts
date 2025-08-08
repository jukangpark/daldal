import { supabase } from "../supabase";
import {
  BalanceGame,
  BalanceGameWithStats,
  BalanceGameVote,
  BalanceGameComment,
  VoteResult,
} from "../types/balance-game";

const balanceGameAPI = {
  // 모든 밸런스 게임 조회
  getAll: async () => {
    const { data, error } = await supabase
      .from("balance_games")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    return { data: data as BalanceGame[], error };
  },

  // 특정 밸런스 게임 조회
  getById: async (id: string) => {
    const { data, error } = await supabase
      .from("balance_games")
      .select("*")
      .eq("id", id)
      .single();

    return { data: data as BalanceGame, error };
  },

  // 카테고리별 밸런스 게임 조회
  getByCategory: async (category: string) => {
    const { data, error } = await supabase
      .from("balance_games")
      .select("*")
      .eq("category", category)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    return { data: data as BalanceGame[], error };
  },

  // 투표 결과 조회
  getVoteResult: async (
    gameId: string
  ): Promise<{ data: VoteResult | null; error: any }> => {
    const { data: votes, error } = await supabase
      .from("balance_game_votes")
      .select("selected_option")
      .eq("game_id", gameId);

    if (error) {
      return { data: null, error };
    }

    const totalVotes = votes?.length || 0;
    const optionAVotes =
      votes?.filter((vote) => vote.selected_option === "A").length || 0;
    const optionBVotes =
      votes?.filter((vote) => vote.selected_option === "B").length || 0;

    const optionAPercentage =
      totalVotes > 0 ? Math.round((optionAVotes / totalVotes) * 100) : 0;
    const optionBPercentage =
      totalVotes > 0 ? Math.round((optionBVotes / totalVotes) * 100) : 0;

    return {
      data: {
        total_votes: totalVotes,
        option_a_votes: optionAVotes,
        option_b_votes: optionBVotes,
        option_a_percentage: optionAPercentage,
        option_b_percentage: optionBPercentage,
      },
      error: null,
    };
  },

  // 사용자의 투표 확인
  getUserVote: async (gameId: string, userId: string) => {
    const { data, error } = await supabase
      .from("balance_game_votes")
      .select("selected_option")
      .eq("game_id", gameId)
      .eq("user_id", userId)
      .maybeSingle();

    // 에러가 PGRST116인 경우는 투표하지 않은 것이므로 null 반환
    if (error && error.code === "PGRST116") {
      return { data: null, error: null };
    }

    return { data: data?.selected_option as "A" | "B" | null, error };
  },

  // 투표하기
  vote: async (gameId: string, userId: string, option: "A" | "B") => {
    const { data, error } = await supabase.from("balance_game_votes").upsert(
      {
        game_id: gameId,
        user_id: userId,
        selected_option: option,
      },
      {
        onConflict: "game_id,user_id",
      }
    );

    return { data, error };
  },

  // 댓글 조회
  getComments: async (gameId: string) => {
    const { data, error } = await supabase
      .from("balance_game_comments")
      .select("*")
      .eq("game_id", gameId)
      .order("created_at", { ascending: false });

    if (error) {
      return { data: null, error };
    }

    const comments = data?.map((comment) => ({
      ...comment,
      user_name: comment.profiles?.full_name || "익명",
      user_avatar: comment.profiles?.avatar_url,
    }));

    return { data: comments as BalanceGameComment[], error: null };
  },

  // 댓글 작성
  addComment: async (gameId: string, userId: string, content: string) => {
    const { data, error } = await supabase
      .from("balance_game_comments")
      .insert({
        game_id: gameId,
        user_id: userId,
        content,
      });

    return { data, error };
  },

  // 댓글 수정
  updateComment: async (commentId: string, content: string) => {
    const { data, error } = await supabase
      .from("balance_game_comments")
      .upsert({ id: commentId, content, updated_at: new Date().toISOString() })
      .eq("id", commentId);

    return { data, error };
  },

  // 댓글 삭제
  deleteComment: async (commentId: string) => {
    const { data, error } = await supabase
      .from("balance_game_comments")
      .delete()
      .eq("id", commentId);

    return { data, error };
  },

  // 통계가 포함된 밸런스 게임 목록 조회
  getAllWithStats: async (userId?: string) => {
    const { data: games, error: gamesError } = await supabase
      .from("balance_games")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (gamesError) {
      return { data: null, error: gamesError };
    }

    const gamesWithStats = await Promise.all(
      games.map(async (game) => {
        const [voteResult, userVote, commentsCount] = await Promise.all([
          balanceGameAPI.getVoteResult(game.id),
          userId
            ? balanceGameAPI.getUserVote(game.id, userId)
            : Promise.resolve({ data: null, error: null }),
          balanceGameAPI.getComments(game.id).then((result) => ({
            data: result.data?.length || 0,
            error: result.error,
          })),
        ]);

        return {
          ...game,
          total_votes: voteResult.data?.total_votes || 0,
          option_a_votes: voteResult.data?.option_a_votes || 0,
          option_b_votes: voteResult.data?.option_b_votes || 0,
          option_a_percentage: voteResult.data?.option_a_percentage || 0,
          option_b_percentage: voteResult.data?.option_b_percentage || 0,
          user_vote: userVote.data,
          comments_count: commentsCount.data || 0,
        };
      })
    );

    return { data: gamesWithStats as BalanceGameWithStats[], error: null };
  },
};

export default balanceGameAPI;
