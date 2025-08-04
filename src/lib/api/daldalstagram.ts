import { supabase } from "../supabase";
import type {
  CreateDaldalstagramPostData,
  UpdateDaldalstagramPostData,
} from "../types";

// 달달스타그램 API
const daldalstagramAPI = {
  // 모든 게시물 가져오기
  async getAll() {
    const { data, error } = await supabase
      .from("daldalstagram_posts")
      .select("*")
      .order("created_at", { ascending: false });
    return { data, error };
  },

  // 특정 게시물 가져오기
  async getById(id: string) {
    const { data, error } = await supabase
      .from("daldalstagram_posts")
      .select("*")
      .eq("id", id)
      .single();
    return { data, error };
  },

  // 게시물 생성
  async create(postData: CreateDaldalstagramPostData) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const insertData = {
      user_id: user.id,
      ...postData,
    };

    const { data, error } = await supabase
      .from("daldalstagram_posts")
      .insert([insertData])
      .select()
      .single();

    return { data, error };
  },

  // 게시물 수정 (비밀번호 확인)
  async update(
    id: string,
    updates: UpdateDaldalstagramPostData,
    password: string
  ) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    // 비밀번호 확인
    const { data: existingPost, error: fetchError } = await supabase
      .from("daldalstagram_posts")
      .select("password")
      .eq("id", id)
      .single();

    if (fetchError) {
      return { data: null, error: fetchError };
    }

    if (existingPost.password !== password) {
      return {
        data: null,
        error: { message: "비밀번호가 일치하지 않습니다." },
      };
    }

    const updateData = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("daldalstagram_posts")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    return { data, error };
  },

  // 게시물 수정 (upsert 방식, 비밀번호 확인)
  async upsert(
    id: string,
    updates: UpdateDaldalstagramPostData,
    password: string
  ) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    // 비밀번호 확인
    const { data: existingPost, error: fetchError } = await supabase
      .from("daldalstagram_posts")
      .select("password")
      .eq("id", id)
      .single();

    if (fetchError) {
      return { data: null, error: fetchError };
    }

    if (existingPost.password !== password) {
      return {
        data: null,
        error: { message: "비밀번호가 일치하지 않습니다." },
      };
    }

    const upsertData = {
      id,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("daldalstagram_posts")
      .upsert(upsertData, {
        onConflict: "id",
        ignoreDuplicates: false,
      })
      .select()
      .single();

    return { data, error };
  },

  // 게시물 삭제 (비밀번호 확인)
  async delete(id: string, password: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    // 비밀번호 확인
    const { data: existingPost, error: fetchError } = await supabase
      .from("daldalstagram_posts")
      .select("password")
      .eq("id", id)
      .single();

    if (fetchError) {
      return { error: fetchError };
    }

    if (existingPost.password !== password) {
      return {
        error: { message: "비밀번호가 일치하지 않습니다." },
      };
    }

    const { error } = await supabase
      .from("daldalstagram_posts")
      .delete()
      .eq("id", id);

    return { error };
  },

  // 조회수 증가
  async incrementViews(id: string) {
    const { data, error } = await supabase
      .from("daldalstagram_posts")
      .update({ views: supabase.rpc("increment_views") })
      .eq("id", id)
      .select()
      .single();
    return { data, error };
  },

  // 좋아요 토글
  async toggleLike(postId: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    // 기존 좋아요 확인
    const { data: existingLike, error: checkError } = await supabase
      .from("daldalstagram_likes")
      .select("id")
      .eq("post_id", postId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (checkError) {
      return { data: null, error: checkError };
    }

    if (existingLike) {
      // 좋아요 삭제
      const { error } = await supabase
        .from("daldalstagram_likes")
        .delete()
        .eq("id", existingLike.id);
      return { data: { liked: false }, error };
    } else {
      // 좋아요 추가
      const { data, error } = await supabase
        .from("daldalstagram_likes")
        .insert([
          {
            post_id: postId,
            user_id: user.id,
          },
        ])
        .select()
        .single();
      return { data: { liked: true }, error };
    }
  },

  // 사용자의 좋아요 상태 확인
  async checkLikeStatus(postId: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { data: { liked: false }, error: null };

    const { data, error } = await supabase
      .from("daldalstagram_likes")
      .select("id")
      .eq("post_id", postId)
      .eq("user_id", user.id)
      .maybeSingle();

    return { data: { liked: !!data }, error };
  },
};

export default daldalstagramAPI;
