import { supabase } from "../supabase";

// 1:1 채팅 API
const privateChatAPI = {
  // 채팅 메시지 가져오기
  async getMessages(chatId: string) {
    const { data, error } = await supabase
      .from("private_chat_messages")
      .select("*")
      .eq("chat_id", chatId)
      .order("created_at", { ascending: true })
      .limit(50);
    return { data, error };
  },

  // 메시지 전송
  async sendMessage(messageData: {
    chat_id: string;
    user_id: string;
    nickname: string;
    message: string;
  }) {
    const { data, error } = await supabase
      .from("private_chat_messages")
      .insert([messageData])
      .select()
      .single();
    return { data, error };
  },

  // 시스템 메시지 전송
  async sendSystemMessage(chatId: string, message: string) {
    const { data, error } = await supabase
      .from("private_chat_messages")
      .insert([
        {
          chat_id: chatId,
          user_id: "system",
          nickname: "시스템",
          message,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();
    return { data, error };
  },

  // 채팅 사용자 등록/업데이트
  async upsertChatUser(userData: {
    chat_id: string;
    user_id: string;
    nickname: string;
  }) {
    const { data, error } = await supabase
      .from("private_chat_users")
      .upsert(
        {
          ...userData,
          last_seen: new Date().toISOString(),
        },
        { onConflict: "chat_id,user_id" }
      )
      .select()
      .single();
    return { data, error };
  },

  // 채팅 사용자 제거
  async removeChatUser(chatId: string, userId: string) {
    const { error } = await supabase
      .from("private_chat_users")
      .delete()
      .eq("chat_id", chatId)
      .eq("user_id", userId);
    return { error };
  },

  // 기존 채팅 사용자 정보 가져오기
  async getChatUser(chatId: string, userId: string) {
    const { data, error } = await supabase
      .from("private_chat_users")
      .select("nickname, user_id")
      .eq("chat_id", chatId)
      .eq("user_id", userId)
      .maybeSingle();
    return { data, error };
  },

  // 타이핑 상태 설정
  async setTypingStatus(typingData: {
    chat_id: string;
    user_id: string;
    nickname: string;
  }) {
    const { data, error } = await supabase
      .from("private_typing_status")
      .upsert({
        ...typingData,
        lastTyping: new Date().toISOString(),
      })
      .select()
      .single();
    return { data, error };
  },

  // 타이핑 상태 제거
  async removeTypingStatus(chatId: string, userId: string) {
    const { error } = await supabase
      .from("private_typing_status")
      .delete()
      .eq("chat_id", chatId)
      .eq("user_id", userId);
    return { error };
  },

  // 채팅방의 모든 메시지 삭제 (사용자별)
  async deleteUserMessages(chatId: string, userId: string) {
    const { error } = await supabase
      .from("private_chat_messages")
      .delete()
      .eq("chat_id", chatId)
      .eq("user_id", userId);
    return { error };
  },

  // 채팅방 완전 삭제 (모든 데이터)
  async deleteChatRoom(chatId: string) {
    // 타이핑 상태 삭제
    await supabase.from("private_typing_status").delete().eq("chat_id", chatId);

    // 채팅 사용자 삭제
    await supabase.from("private_chat_users").delete().eq("chat_id", chatId);

    // 메시지 삭제
    const { error } = await supabase
      .from("private_chat_messages")
      .delete()
      .eq("chat_id", chatId);

    return { error };
  },

  // 사용자의 모든 채팅방 목록 가져오기
  async getUserChatRooms(userId: string) {
    const { data, error } = await supabase
      .from("private_chat_users")
      .select("chat_id, nickname, last_seen")
      .eq("user_id", userId)
      .order("last_seen", { ascending: false });
    return { data, error };
  },

  // 채팅방 참여자 목록 가져오기
  async getChatParticipants(chatId: string) {
    const { data, error } = await supabase
      .from("private_chat_users")
      .select("user_id, nickname, last_seen")
      .eq("chat_id", chatId)
      .order("last_seen", { ascending: false });
    return { data, error };
  },
};

export default privateChatAPI;
