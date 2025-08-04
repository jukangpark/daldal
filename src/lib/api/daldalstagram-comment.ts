import { supabase } from "../supabase";

// 달달스타그램 댓글 API
const daldalstagramCommentAPI = {
  // 댓글 목록 조회
  async getAll(postId: string) {
    const { data, error } = await supabase
      .from("daldalstagram_comments")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });
    return { data, error };
  },

  // 댓글 작성
  async create(postId: string, anonymousName: string, content: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("daldalstagram_comments")
      .insert([
        {
          post_id: postId,
          user_id: user.id,
          anonymous_name: anonymousName,
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
      .from("daldalstagram_comments")
      .delete()
      .eq("id", commentId)
      .eq("user_id", user.id);
    return { error };
  },
};

export default daldalstagramCommentAPI;
