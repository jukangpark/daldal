import { supabase } from "../supabase";

// 반응 속도 테스트 API
const reactionSpeedAPI = {
  // 게임 결과 저장 (upsert)
  async saveResult(resultData: {
    bestReactionTime: number;
    averageReactionTime: number;
    totalAttempts: number;
    successfulAttempts: number;
    gameDuration?: number;
  }) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      console.error("사용자 인증 실패");
      throw new Error("User not authenticated");
    }

    const insertData = {
      user_id: user.id,
      user_name: user.user_metadata?.name || user.email,
      best_reaction_time: resultData.bestReactionTime,
      average_reaction_time: resultData.averageReactionTime,
      total_attempts: resultData.totalAttempts,
      successful_attempts: resultData.successfulAttempts,
      game_duration: resultData.gameDuration,
    };

    const { data, error } = await supabase
      .from("reaction_speed_results")
      .upsert([insertData], {
        onConflict: "user_id",
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase 저장 오류:", error);
    } else {
    }

    return { data, error };
  },

  // 랭킹 가져오기 (최고 반응 속도 기준)
  async getRankings(limit: number = 10) {
    const { data, error } = await supabase
      .from("reaction_speed_results")
      .select(
        "user_id, user_name, best_reaction_time, average_reaction_time, created_at"
      )
      .order("best_reaction_time", { ascending: true }) // 빠를수록 좋음
      .limit(limit);

    if (error) {
      console.error("랭킹 가져오기 오류:", error);
    } else {
    }

    return { data, error };
  },

  // 사용자 최고 기록 가져오기
  async getUserBestResult() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("reaction_speed_results")
      .select("*")
      .eq("user_id", user.id)
      .single();

    return { data, error };
  },
};

export default reactionSpeedAPI;
