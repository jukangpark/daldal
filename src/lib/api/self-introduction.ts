import { supabase } from "../supabase";
import type { CreateSelfIntroductionData } from "../types";

// 자소설 관련 API 함수들
const selfIntroductionAPI = {
  // 모든 자소설 가져오기
  async getAll() {
    const { data, error } = await supabase
      .from("self_introductions")
      .select("*")
      .order("created_at", { ascending: false });
    return { data, error };
  },

  // 특정 자소설 가져오기
  async getById(id: string) {
    const { data, error } = await supabase
      .from("self_introductions")
      .select("*")
      .eq("id", id)
      .single();
    return { data, error };
  },

  // 사용자의 자소설 가져오기 (최신 것 하나만)
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

  // 사용자의 모든 자소설 가져오기
  async getAllByUserId(userId: string) {
    const { data, error } = await supabase
      .from("self_introductions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    return { data, error };
  },

  // 자소설 생성
  async create(introductionData: CreateSelfIntroductionData) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    // 기존 자소설이 있는지 확인
    const { data: existingIntro, error: checkError } = await supabase
      .from("self_introductions")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (checkError) {
      console.error("기존 자소설 확인 오류:", checkError);
      return { data: null, error: checkError };
    }

    if (existingIntro) {
      // 기존 자소설이 있으면 에러 반환
      return {
        data: null,
        error: {
          message: "이미 작성된 자소설이 존재합니다.",
          code: "DUPLICATE_INTRO",
        },
      };
    }

    // 기존 자소설이 없으면 새로 생성
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

  // 자소설 업데이트
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

  // 자소설 삭제
  async delete(id: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { error } = await supabase
      .from("self_introductions")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id); // 본인의 자소설만 삭제 가능하도록 추가 조건
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

export default selfIntroductionAPI;
