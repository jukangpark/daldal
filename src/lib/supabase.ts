import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
// const supabaseServiceRoleKey =
//   process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 사용자 타입 정의
export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  created_at: string;
}

// 인증 관련 타입 정의
export interface AuthUser {
  id: string;
  email: string;
  user_metadata: {
    name: string;
    phone: string;
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
  phone: string;
}

// 데이터베이스 타입 정의
export interface SelfIntroduction {
  id: string;
  user_id: string;
  user_name: string;
  user_age: number;
  user_gender: "male" | "female";
  user_location: string;
  title: string;
  content: string;
  photos: string[];
  likes: number;
  views: number;
  ideal_physical_type?: string;
  ideal_personality_type?: string;
  dating_style?: string;
  alcohol_tolerance?: string;
  smoking_status?: string;
  charm_appeal?: string;
  mbti?: string;
  hobbies?: string;
  special_skills?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateSelfIntroductionData {
  user_id: string;
  user_name: string;
  user_age: number;
  user_gender: "male" | "female";
  user_location: string;
  title: string;
  content: string;
  photos: string[];
  ideal_physical_type?: string;
  ideal_personality_type?: string;
  dating_style?: string;
  alcohol_tolerance?: string;
  smoking_status?: string;
  charm_appeal?: string;
  mbti?: string;
  hobbies?: string;
  special_skills?: string;
}

export interface SuperDateVote {
  id: string;
  voter_id: string;
  target_id: string;
  created_at: string;
}

export interface SuperDateMatch {
  id: string;
  user1_id: string;
  user2_id: string;
  matched_at: string;
}

export interface CreateSuperDateVoteData {
  target_id: string;
}

export interface CreateSuperDateRequestData {
  target_id: string;
  target_name: string;
}

// 댓글 타입
export interface SelfIntroductionComment {
  id: string;
  introduction_id: string;
  user_id: string | null;
  user_name: string;
  content: string;
  created_at: string;
}

// 인증 관련 유틸리티 함수들
export const auth = {
  // 로그인
  async signIn({ email, password }: LoginData) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  // 회원가입
  async signUp({ email, password, name, phone }: SignupData) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          phone,
        },
      },
    });
    return { data, error };
  },

  // 로그아웃
  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // 현재 사용자 가져오기
  async getCurrentUser() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    return { user, error };
  },

  // 인증 상태 변경 감지
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },
};

// 자기소개서 관련 API 함수들
export const selfIntroductionAPI = {
  // 모든 자기소개서 가져오기
  async getAll() {
    const { data, error } = await supabase
      .from("self_introductions")
      .select("*")
      .order("created_at", { ascending: false });
    return { data, error };
  },

  // 특정 자기소개서 가져오기
  async getById(id: string) {
    const { data, error } = await supabase
      .from("self_introductions")
      .select("*")
      .eq("id", id)
      .single();
    return { data, error };
  },

  // 사용자의 자기소개서 가져오기 (최신 것 하나만)
  async getByUserId(userId: string) {
    const { data, error } = await supabase
      .from("self_introductions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    return { data, error };
  },

  // 사용자의 모든 자기소개서 가져오기
  async getAllByUserId(userId: string) {
    const { data, error } = await supabase
      .from("self_introductions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    return { data, error };
  },

  // 자기소개서 생성
  async create(introductionData: CreateSelfIntroductionData) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    // 기존 자기소개서가 있는지 확인
    const { data: existingIntro, error: checkError } = await supabase
      .from("self_introductions")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (checkError) {
      console.error("기존 자기소개서 확인 오류:", checkError);
      return { data: null, error: checkError };
    }

    if (existingIntro) {
      // 기존 자기소개서가 있으면 에러 반환
      return {
        data: null,
        error: {
          message: "이미 작성된 자기소개서가 존재합니다.",
          code: "DUPLICATE_INTRO",
        },
      };
    }

    // 기존 자기소개서가 없으면 새로 생성
    const insertData = {
      ...introductionData,
      likes: 0,
      views: 0,
    };

    const { data, error } = await supabase
      .from("self_introductions")
      .insert([insertData])
      .select()
      .single();

    return { data, error };
  },

  // 자기소개서 업데이트
  async upsert(id: string, updates: Partial<CreateSelfIntroductionData>) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    // id를 포함한 upsert 데이터 생성
    const upsertData = {
      id: id,
      ...updates,
    };

    const { data, error } = await supabase
      .from("self_introductions")
      .upsert(upsertData)
      .eq("id", id)
      .select()
      .single();

    return { data, error };
  },

  // 자기소개서 삭제
  async delete(id: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { error } = await supabase
      .from("self_introductions")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id); // 본인의 자기소개서만 삭제 가능하도록 추가 조건
    return { error };
  },

  // 조회수 증가
  async incrementViews(id: string) {
    const { data, error } = await supabase
      .from("self_introductions")
      .update({ views: supabase.rpc("increment_views") })
      .eq("id", id)
      .select()
      .single();
    return { data, error };
  },

  // 좋아요 토글
  async toggleLike(id: string) {
    const { data, error } = await supabase
      .from("self_introductions")
      .update({ likes: supabase.rpc("increment_likes") })
      .eq("id", id)
      .select()
      .single();
    return { data, error };
  },
};

// 수퍼데이트 신청 관련 API 함수들
export const superDateAPI = {
  // 모든 수퍼데이트 신청 가져오기
  async getAll() {
    const { data, error } = await supabase
      .from("super_date_requests")
      .select("*")
      .order("created_at", { ascending: false });
    return { data, error };
  },

  // 사용자가 받은 수퍼데이트 신청 가져오기
  async getReceivedByUserId(userId: string) {
    const { data, error } = await supabase
      .from("super_date_requests")
      .select("*")
      .eq("target_id", userId)
      .order("created_at", { ascending: false });
    return { data, error };
  },

  // 사용자가 보낸 수퍼데이트 신청 가져오기
  async getSentByUserId(userId: string) {
    const { data, error } = await supabase
      .from("super_date_requests")
      .select("*")
      .eq("requester_id", userId)
      .order("created_at", { ascending: false });
    return { data, error };
  },

  // 수퍼데이트 신청 생성
  async create(requestData: CreateSuperDateRequestData) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("super_date_requests")
      .insert([
        {
          requester_id: user.id,
          requester_name: user.user_metadata?.name || user.email,
          ...requestData,
        },
      ])
      .select()
      .single();
    return { data, error };
  },

  // 수퍼데이트 신청 상태 업데이트
  async updateStatus(id: string, status: "accepted" | "rejected") {
    const { data, error } = await supabase
      .from("super_date_requests")
      .update({ status })
      .eq("id", id)
      .select()
      .single();
    return { data, error };
  },

  // 수퍼데이트 신청 취소
  async cancel(id: string) {
    const { data, error } = await supabase
      .from("super_date_requests")
      .delete()
      .eq("id", id)
      .select()
      .single();
    return { data, error };
  },
};

// 파일 업로드 관련 함수들
export const fileAPI = {
  // 파일을 Supabase Storage에 업로드
  async uploadFilesToStorage(files: FileList, userId: string, postId?: string) {
    const uploadedUrls = [];
    const errors = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // 파일 검증
      if (!this.validateFile(file)) {
        errors.push(`파일 ${file.name}: 지원하지 않는 형식입니다.`);
        continue;
      }

      const fileExt = file.name.split(".").pop();
      const timestamp = Date.now() + i; // 중복 방지
      const fileName = postId
        ? `${userId}/${postId}/${timestamp}.${fileExt}`
        : `${userId}/${timestamp}.${fileExt}`;

      try {
        // Storage에 업로드
        const { data, error } = await supabase.storage
          .from("photos")
          .upload(fileName, file);

        if (error) {
          console.error("Upload error:", error);
          errors.push(`파일 ${file.name}: 업로드 실패`);
          continue;
        }

        // 공개 URL 생성
        const {
          data: { publicUrl },
        } = supabase.storage.from("photos").getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
      } catch (err) {
        console.error("Upload error:", err);
        errors.push(`파일 ${file.name}: 업로드 중 오류 발생`);
      }
    }

    return { uploadedUrls, errors };
  },

  // 파일 검증
  validateFile(file: File): boolean {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      return false;
    }

    if (file.size > maxSize) {
      return false;
    }

    return true;
  },

  // 파일 삭제
  async deleteFile(fileName: string) {
    const { error } = await supabase.storage.from("photos").remove([fileName]);

    if (error) {
      console.error("File delete error:", error);
      throw error;
    }
  },
};

// 댓글 API
export const selfIntroductionCommentAPI = {
  // 댓글 목록 조회
  async getAll(introductionId: string) {
    const { data, error } = await supabase
      .from("self_introduction_comments")
      .select("*")
      .eq("introduction_id", introductionId)
      .order("created_at", { ascending: true });
    return { data, error };
  },

  // 댓글 작성
  async create(introductionId: string, content: string, userName: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("self_introduction_comments")
      .insert([
        {
          introduction_id: introductionId,
          user_id: user.id,
          user_name: userName,
          content,
        },
      ])
      .select()
      .single();
    return { data, error };
  },

  // 댓글 삭제 (본인만)
  async delete(commentId: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { error } = await supabase
      .from("self_introduction_comments")
      .delete()
      .eq("id", commentId)
      .eq("user_id", user.id);
    return { error };
  },
};

// 캐치마인드 게임 API
export const catchMindAPI = {
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

// 반응 속도 테스트 API
export const reactionSpeedAPI = {
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
      console.log("저장 성공:", data);
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
      console.log("랭킹 데이터:", data);
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
