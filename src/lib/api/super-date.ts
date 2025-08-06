import { supabase } from "../supabase";
import type { CreateSuperDateRequestData } from "../types";

// 슈퍼 데이트 신청 관련 API 함수들
const superDateAPI = {
  // 모든 슈퍼 데이트 신청 가져오기
  async getAll() {
    const { data, error } = await supabase
      .from("super_date_requests")
      .select("*")
      .order("created_at", { ascending: false });
    return { data, error };
  },

  // 사용자가 받은 슈퍼 데이트 신청 가져오기
  async getReceivedByUserId(userId: string) {
    const { data, error } = await supabase
      .from("super_date_requests")
      .select("*")
      .eq("target_id", userId)
      .order("created_at", { ascending: false });
    return { data, error };
  },

  // 사용자가 보낸 슈퍼 데이트 신청 가져오기
  async getSentByUserId(userId: string) {
    const { data, error } = await supabase
      .from("super_date_requests")
      .select("*")
      .eq("requester_id", userId)
      .order("created_at", { ascending: false });
    return { data, error };
  },

  // 슈퍼 데이트 신청 생성
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

  // 슈퍼 데이트 신청 상태 업데이트
  async updateStatus(id: string, status: "accepted" | "rejected") {
    const { data, error } = await supabase
      .from("super_date_requests")
      .update({ status })
      .eq("id", id)
      .select()
      .single();
    return { data, error };
  },

  // 슈퍼 데이트 신청 취소
  async cancel(id: string) {
    const { data, error } = await supabase
      .from("super_date_requests")
      .delete()
      .eq("id", id)
      .select()
      .single();
    return { data, error };
  },

  // 두 사용자가 서로 연결되어 있는지 확인
  async areUsersConnected(userId1: string, userId2: string) {
    // 양방향으로 슈퍼데이트 신청이 있는지 확인
    const { data, error } = await supabase
      .from("super_date_requests")
      .select("*")
      .or(
        `and(requester_id.eq.${userId1},target_id.eq.${userId2}),and(requester_id.eq.${userId2},target_id.eq.${userId1})`
      );

    if (error) {
      console.error("Error checking user connection:", error);
      return { connected: false, error };
    }

    // 양방향 신청이 모두 있는 경우에만 연결된 것으로 간주
    const user1ToUser2 = data?.some(
      (req) => req.requester_id === userId1 && req.target_id === userId2
    );
    const user2ToUser1 = data?.some(
      (req) => req.requester_id === userId2 && req.target_id === userId1
    );

    return {
      connected: user1ToUser2 && user2ToUser1,
      error: null,
      requests: data || [],
    };
  },
};

export default superDateAPI;
