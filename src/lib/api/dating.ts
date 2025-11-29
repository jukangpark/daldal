import { supabase } from "../supabase";
import type {
  CreateDatingCardData,
  CreateDatingApplicationData,
  DatingApplicationRow,
  DatingApplicationStatus,
  DatingCardRow,
} from "../types";

const datingAPI = {
  // 소개팅 카드 전체 조회 (공개용)
  async getAllCards() {
    const { data, error } = await supabase
      .from("dating_cards")
      .select("*")
      .order("created_at", { ascending: false });

    return { data: data as DatingCardRow[] | null, error };
  },

  // 단일 카드 조회
  async getCardById(id: string) {
    const { data, error } = await supabase
      .from("dating_cards")
      .select("*")
      .eq("id", id)
      .single();

    return { data: data as DatingCardRow | null, error };
  },

  // 내가 작성한 소개팅 카드들
  async getCardsByMatchmaker() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("dating_cards")
      .select("*")
      .eq("matchmaker_user_id", user.id)
      .order("created_at", { ascending: false });

    return { data: data as DatingCardRow[] | null, error };
  },

  // 소개팅 카드 생성
  async createCard(cardData: CreateDatingCardData) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const insertData = {
      ...cardData,
      matchmaker_user_id: user.id,
    };

    const { data, error } = await supabase
      .from("dating_cards")
      .insert([insertData])
      .select()
      .single();

    return { data: data as DatingCardRow | null, error };
  },

  // 소개팅 카드 + 신청 목록 조회 (주선자용)
  async getCardWithApplications(cardId: string) {
    const { data: card, error: cardError } = await supabase
      .from("dating_cards")
      .select("*")
      .eq("id", cardId)
      .single();

    if (cardError) return { card: null, applications: null, error: cardError };

    const { data: applications, error: appError } = await supabase
      .from("dating_applications")
      .select("*")
      .eq("dating_card_id", cardId)
      .order("created_at", { ascending: false });

    return {
      card: card as DatingCardRow,
      applications: applications as DatingApplicationRow[] | null,
      error: appError,
    };
  },

  // 신청 카드 생성
  async createApplication(data: CreateDatingApplicationData) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const insertData = {
      ...data,
      applicant_user_id: user.id,
    };

    const { data: inserted, error } = await supabase
      .from("dating_applications")
      .insert([insertData])
      .select()
      .single();

    return { data: inserted as DatingApplicationRow | null, error };
  },

  // 신청 ID로 신청 정보 + 관련 카드 정보 조회
  async getApplicationById(id: string) {
    const { data: application, error: appError } = await supabase
      .from("dating_applications")
      .select("*")
      .eq("id", id)
      .single();

    if (appError || !application) {
      return { application: null, card: null, error: appError };
    }

    const { data: card, error: cardError } = await supabase
      .from("dating_cards")
      .select("*")
      .eq("id", (application as DatingApplicationRow).dating_card_id)
      .single();

    return {
      application: application as DatingApplicationRow,
      card: card as DatingCardRow | null,
      error: cardError,
    };
  },

  // 신청 카드 상태 변경 (주선자용 승인/거절)
  async updateApplicationStatus(id: string, status: DatingApplicationStatus) {
    const { data, error } = await supabase
      .from("dating_applications")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    return { data: data as DatingApplicationRow | null, error };
  },

  // 소개팅 카드 수정
  async updateCard(
    id: string,
    updates: Partial<CreateDatingCardData> & { photos?: string[] }
  ) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("dating_cards")
      .update(updates)
      .eq("id", id)
      .eq("matchmaker_user_id", user.id)
      .select()
      .single();

    return { data: data as DatingCardRow | null, error };
  },

  // 소개팅 카드 삭제 (해당 카드의 신청 내역은 FK ON DELETE CASCADE 로 함께 삭제됨)
  async deleteCard(id: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { error } = await supabase
      .from("dating_cards")
      .delete()
      .eq("id", id)
      .eq("matchmaker_user_id", user.id);

    return { error };
  },
};

export default datingAPI;


