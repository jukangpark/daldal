import { supabase } from "../supabase";

// 캐치마인드 게임 API
const catchMindAPI = {
  // 제시어 가져오기 (난이도 필터링만)
  async getRandomWord(filters?: { difficulty_level?: string }) {
    let query = supabase
      .from("catch_mind_words")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true);

    // 난이도 필터 적용
    if (filters?.difficulty_level && filters.difficulty_level !== "전체") {
      query = query.eq("difficulty_level", filters.difficulty_level);
    }

    const { count, error: countError } = await query;

    if (countError || !count || count === 0) {
      return { data: null, error: { message: "No words found" } };
    }

    // 랜덤 오프셋 계산
    const randomOffset = Math.floor(Math.random() * count);

    // 실제 데이터 가져오기
    let dataQuery = supabase
      .from("catch_mind_words")
      .select("word")
      .eq("is_active", true);

    // 난이도 필터 적용
    if (filters?.difficulty_level && filters.difficulty_level !== "전체") {
      dataQuery = dataQuery.eq("difficulty_level", filters.difficulty_level);
    }

    const { data, error } = await dataQuery.range(randomOffset, randomOffset);

    if (error) return { data: null, error };

    return { data: data[0], error: null };
  },

  // 카테고리 목록 가져오기
  async getCategories() {
    const { data, error } = await supabase
      .from("catch_mind_words")
      .select("category")
      .eq("is_active", true)
      .order("category");

    if (error) return { data: [], error };

    // 중복 제거
    const uniqueCategories = Array.from(
      new Set(data.map((item) => item.category))
    );
    return { data: uniqueCategories, error: null };
  },

  // 그림 저장
  async saveDrawing(word: string, imageBlob: Blob) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    try {
      // Storage에 이미지 업로드
      const fileName = `${user.id}/${Date.now()}.png`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("catch-mind-drawings")
        .upload(fileName, imageBlob, {
          contentType: "image/png",
          cacheControl: "3600",
        });

      if (uploadError) {
        console.error("Storage 업로드 오류:", uploadError);
        throw uploadError;
      }

      // 공개 URL 생성
      const {
        data: { publicUrl },
      } = supabase.storage.from("catch-mind-drawings").getPublicUrl(fileName);

      // 데이터베이스에 저장
      const { data, error } = await supabase
        .from("catch_mind_drawings")
        .insert([
          {
            user_id: user.id,
            user_name: user.user_metadata?.name || user.email,
            word: word,
            image_url: publicUrl,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("데이터베이스 저장 오류:", error);
        throw error;
      }

      return { data, error };
    } catch (error) {
      console.error("그림 저장 오류:", error);
      throw error;
    }
  },

  // 랜덤 그림 가져오기 (맞추기용)
  async getRandomDrawing(excludeIds: number[] = []) {
    // 먼저 전체 개수를 확인 (풀었던 그림 제외)
    let countQuery = supabase
      .from("catch_mind_drawings")
      .select("*", { count: "exact", head: true })
      .eq("is_approved", true);

    if (excludeIds.length > 0) {
      countQuery = countQuery.not("id", "in", `(${excludeIds.join(",")})`);
    }

    const { count, error: countError } = await countQuery;

    if (countError || !count || count === 0) {
      return { data: null, error: { message: "No drawings found" } };
    }

    // 랜덤 오프셋 계산
    const randomOffset = Math.floor(Math.random() * count);

    // 실제 데이터 가져오기
    let dataQuery = supabase
      .from("catch_mind_drawings")
      .select("id, word, image_url, user_name")
      .eq("is_approved", true);

    if (excludeIds.length > 0) {
      dataQuery = dataQuery.not("id", "in", `(${excludeIds.join(",")})`);
    }

    const { data, error } = await dataQuery.range(randomOffset, randomOffset);

    if (error) return { data: null, error };

    return { data: data[0], error: null };
  },

  // 게임 완료 및 점수 저장
  async saveGameResult(
    totalScore: number,
    correctAnswers: number,
    gameDuration?: number
  ) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    // 기존 게임 결과 삭제 (하나의 결과만 유지)
    await supabase.from("catch_mind_games").delete().eq("user_id", user.id);

    // 새로운 게임 결과 저장
    const { data, error } = await supabase
      .from("catch_mind_games")
      .upsert(
        [
          {
            user_id: user.id,
            user_name: user.user_metadata?.name || user.email,
            total_score: totalScore,
            correct_answers: correctAnswers,
            game_duration: gameDuration,
          },
        ],
        {
          onConflict: "user_id",
        }
      )
      .select()
      .single();

    return { data, error };
  },

  // 랭킹 가져오기
  async getRankings(limit: number = 10) {
    const { data, error } = await supabase
      .from("catch_mind_games")
      .select("user_id, user_name, total_score, created_at")
      .order("total_score", { ascending: false })
      .limit(limit);
    return { data, error };
  },

  // 사용자 최고 점수 가져오기
  async getUserBestScore() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("catch_mind_user_best_scores")
      .select("*")
      .eq("user_id", user.id)
      .single();

    return { data, error };
  },
};

export default catchMindAPI;
