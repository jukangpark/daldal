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
};

export default superDateAPI;
