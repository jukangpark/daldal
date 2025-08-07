import { supabase } from "../supabase";
import { ChatMessage, TypingUser, OnlineUser } from "@/types/chat";

// 달달톡 채팅 API
const daldalChatAPI = {
  // 기존 닉네임 불러오기
  async loadExistingNickname(userId: string) {
    try {
      const { data: allData, error } = await supabase
        .from("online_users")
        .select("nickname, user_id");

      if (allData) {
        const matchingUser = allData.find(
          (item) => String(item.user_id).trim() === String(userId).trim()
        );

        return { data: matchingUser?.nickname || null, error: null };
      }

      return { data: null, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // 온라인 사용자로 등록 (자동 입장)
  async autoJoin(userId: string, nickname: string) {
    try {
      const { data, error } = await supabase.from("online_users").upsert(
        {
          user_id: userId,
          nickname: nickname,
          last_seen: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // 채팅방 입장
  async joinChat(userId: string, nickname: string) {
    try {
      const { data, error } = await supabase.from("online_users").upsert({
        user_id: userId,
        nickname: nickname.trim(),
        last_seen: new Date().toISOString(),
      });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // 온라인 사용자 제거
  async removeOnlineUser(userId: string) {
    try {
      const { error } = await supabase
        .from("online_users")
        .delete()
        .eq("user_id", userId);

      return { error };
    } catch (error) {
      return { error };
    }
  },

  // 타이핑 상태 제거
  async removeTypingStatus(userId: string) {
    try {
      const { error } = await supabase
        .from("typing_status")
        .delete()
        .eq("user_id", userId);

      return { error };
    } catch (error) {
      return { error };
    }
  },

  // 사용자의 모든 채팅 메시지 삭제
  async deleteUserMessages(userId: string) {
    try {
      const { error } = await supabase
        .from("chat_messages")
        .delete()
        .eq("user_id", userId);

      return { error };
    } catch (error) {
      return { error };
    }
  },

  // 타이핑 상태 업데이트
  async updateTypingStatus(userId: string, nickname: string) {
    try {
      const { data, error } = await supabase.from("typing_status").upsert({
        user_id: userId,
        nickname: nickname,
        lastTyping: new Date().toISOString(),
      });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // 메시지 전송
  async sendMessage(messageData: {
    user_id: string;
    nickname: string;
    message: string;
    created_at: string;
  }) {
    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .insert([messageData]);

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // 기존 메시지 로드
  async loadMessages(limit: number = 50) {
    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(limit);

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // 온라인 사용자 로드
  async loadOnlineUsers() {
    try {
      const { data, error } = await supabase
        .from("online_users")
        .select("*")
        .order("last_seen", { ascending: false });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // 닉네임 업데이트
  async updateNickname(userId: string, newNickname: string) {
    try {
      const { data, error } = await supabase
        .from("online_users")
        .update({ nickname: newNickname.trim() })
        .eq("user_id", userId);

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // 실시간 구독 설정
  setupRealtimeSubscriptions(
    userId: string,
    callbacks: {
      onMessageInsert?: (message: ChatMessage) => void;
      onMessageDelete?: (message: ChatMessage) => void;
      onTypingInsert?: (typingUser: TypingUser) => void;
      onTypingDelete?: (typingUser: TypingUser) => void;
      onOnlineUserInsert?: () => void;
      onOnlineUserUpdate?: () => void;
      onOnlineUserDelete?: () => void;
    }
  ) {
    const subscriptions: any[] = [];

    // 실시간 메시지 구독
    const messagesSubscription = supabase
      .channel("chat_messages")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "chat_messages" },
        (payload) => {
          if (payload.eventType === "INSERT" && callbacks.onMessageInsert) {
            callbacks.onMessageInsert(payload.new as ChatMessage);
          } else if (
            payload.eventType === "DELETE" &&
            callbacks.onMessageDelete
          ) {
            callbacks.onMessageDelete(payload.old as ChatMessage);
          }
        }
      )
      .subscribe();

    subscriptions.push(messagesSubscription);

    // 타이핑 상태 구독
    const typingSubscription = supabase
      .channel("typing_status")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "typing_status" },
        (payload) => {
          if (payload.eventType === "INSERT" && callbacks.onTypingInsert) {
            const typingUser = payload.new as TypingUser;
            if (typingUser.user_id !== userId) {
              callbacks.onTypingInsert(typingUser);
            }
          } else if (
            payload.eventType === "DELETE" &&
            callbacks.onTypingDelete
          ) {
            callbacks.onTypingDelete(payload.old as TypingUser);
          }
        }
      )
      .subscribe();

    subscriptions.push(typingSubscription);

    // 온라인 사용자 구독
    const onlineUsersSubscription = supabase
      .channel("online_users")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "online_users" },
        (payload) => {
          if (payload.eventType === "INSERT" && callbacks.onOnlineUserInsert) {
            callbacks.onOnlineUserInsert();
          } else if (
            payload.eventType === "UPDATE" &&
            callbacks.onOnlineUserUpdate
          ) {
            callbacks.onOnlineUserUpdate();
          } else if (
            payload.eventType === "DELETE" &&
            callbacks.onOnlineUserDelete
          ) {
            callbacks.onOnlineUserDelete();
          }
        }
      )
      .subscribe();

    subscriptions.push(onlineUsersSubscription);

    // 구독 해제 함수 반환
    return () => {
      subscriptions.forEach((subscription) => subscription.unsubscribe());
    };
  },
};

export default daldalChatAPI;
