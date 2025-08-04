import { supabase } from "../supabase";

// 자소설 댓글 관련 API
const selfIntroductionCommentAPI = {
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

export default selfIntroductionCommentAPI;
