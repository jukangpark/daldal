import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { ChatMessage, TypingUser, OnlineUser } from "@/types/chat";

export function useChat(user: any) {
  const [nickname, setNickname] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isJoined, setIsJoined] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isCheckingUser, setIsCheckingUser] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // 메시지 스크롤을 맨 아래로
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 기존 닉네임 불러오기 및 자동 입장
  useEffect(() => {
    if (user && !isJoined) {
      loadExistingNickname();
    } else if (user && isJoined) {
      setIsCheckingUser(false);
    }
  }, [user, isJoined]);

  // 기존 닉네임 불러오기
  const loadExistingNickname = async () => {
    if (!user) return;

    try {
      const { data: allData, error } = await supabase
        .from("online_users")
        .select("nickname, user_id");

      if (allData) {
        const matchingUser = allData.find(
          (item) => String(item.user_id).trim() === String(user.id).trim()
        );

        if (matchingUser?.nickname) {
          setNickname(matchingUser.nickname);
          await handleAutoJoin(matchingUser.nickname);
        }
      }
    } catch (error) {
      console.error("Error loading existing nickname:", error);
    } finally {
      setIsCheckingUser(false);
    }
  };

  // 자동 입장 처리
  const handleAutoJoin = async (existingNickname: string) => {
    if (!user) return;

    try {
      await supabase.from("online_users").upsert(
        {
          user_id: user.id,
          nickname: existingNickname,
          last_seen: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

      setIsJoined(true);
    } catch (error) {
      console.error("Error auto joining chat:", error);
    }
  };

  // 채팅방 입장
  const handleJoin = async (nicknameToJoin: string) => {
    if (!user || !nicknameToJoin.trim()) return;

    try {
      const { error } = await supabase.from("online_users").upsert(
        {
          user_id: user.id,
          nickname: nicknameToJoin.trim(),
          last_seen: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

      if (error) {
        console.error("Error joining chat:", error);
        alert("채팅방 입장 중 오류가 발생했습니다.");
        return;
      }

      setNickname(nicknameToJoin.trim());
      setIsJoined(true);
    } catch (error) {
      console.error("Error joining chat:", error);
      alert("채팅방 입장 중 오류가 발생했습니다.");
    }
  };

  // 채팅방 완전 나가기
  const handleLeaveChat = async () => {
    if (!user) return;

    try {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      await supabase.from("typing_status").delete().eq("user_id", user.id);
      await supabase.from("online_users").delete().eq("user_id", user.id);
      await supabase.from("chat_messages").delete().eq("user_id", user.id);

      setIsJoined(false);
      setNickname("");
      setMessages([]);
      setOnlineUsers([]);
      setTypingUsers([]);
      setIsTyping(false);
    } catch (error) {
      console.error("Error leaving chat:", error);
      alert("채팅방 나가기 중 오류가 발생했습니다.");
    }
  };

  // 타이핑 상태 관리
  const handleTyping = () => {
    if (!user) return;

    if (!isTyping) {
      setIsTyping(true);
      supabase.from("typing_status").upsert({
        user_id: user.id,
        nickname: nickname,
        lastTyping: new Date().toISOString(),
      });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      supabase.from("typing_status").delete().eq("user_id", user.id);
    }, 3000);
  };

  // 메시지 전송
  const handleSendMessage = async () => {
    if (!user || !message.trim() || !nickname) return;

    const newMessage = {
      id: crypto.randomUUID(),
      user_id: user.id,
      nickname: nickname,
      message: message.trim(),
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessage("");

    setIsTyping(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    supabase.from("typing_status").delete().eq("user_id", user.id);

    try {
      const { error } = await supabase.from("chat_messages").insert([
        {
          user_id: newMessage.user_id,
          nickname: newMessage.nickname,
          message: newMessage.message,
          created_at: newMessage.created_at,
        },
      ]);

      if (error) {
        console.error("Error sending message:", error);
        setMessages((prev) => prev.filter((msg) => msg.id !== newMessage.id));
        alert("메시지 전송에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => prev.filter((msg) => msg.id !== newMessage.id));
      alert("메시지 전송에 실패했습니다.");
    }
  };

  // Enter 키로 메시지 전송
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 메시지 입력 필드 변경 핸들러
  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    handleTyping();
  };

  // 닉네임 업데이트
  const updateNickname = async (newNickname: string) => {
    if (!user || !newNickname.trim() || newNickname.trim() === nickname) {
      return false;
    }

    try {
      const { error } = await supabase
        .from("online_users")
        .update({ nickname: newNickname.trim() })
        .eq("user_id", user.id);

      if (error) {
        console.error("Error updating nickname:", error);
        alert("닉네임 변경에 실패했습니다.");
        return false;
      }

      setNickname(newNickname.trim());
      return true;
    } catch (error) {
      console.error("Error updating nickname:", error);
      alert("닉네임 변경 중 오류가 발생했습니다.");
      return false;
    }
  };

  // 실시간 구독 설정
  useEffect(() => {
    if (!isJoined || !user) return;

    const loadMessages = async () => {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(50);

      if (data) {
        setMessages(data);
      }
    };

    const loadOnlineUsers = async () => {
      const { data, error } = await supabase
        .from("online_users")
        .select("*")
        .order("last_seen", { ascending: false });

      if (data) {
        setOnlineUsers(data);
      }
    };

    loadMessages();
    loadOnlineUsers();

    // 실시간 메시지 구독
    const messagesSubscription = supabase
      .channel("chat_messages")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "chat_messages" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newMessage = payload.new as ChatMessage;
            setMessages((prev) => {
              const exists = prev.some(
                (msg) =>
                  msg.user_id === newMessage.user_id &&
                  msg.message === newMessage.message &&
                  Math.abs(
                    new Date(msg.created_at).getTime() -
                      new Date(newMessage.created_at).getTime()
                  ) < 1000
              );
              return exists ? prev : [...prev, newMessage];
            });
          } else if (payload.eventType === "DELETE") {
            const deletedMessage = payload.old as ChatMessage;
            setMessages((prev) =>
              prev.filter((msg) => msg.id !== deletedMessage.id)
            );
          }
        }
      )
      .subscribe();

    // 타이핑 상태 구독
    const typingSubscription = supabase
      .channel("typing_status")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "typing_status" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const typingUser = payload.new as TypingUser;
            if (typingUser.user_id !== user.id) {
              setTypingUsers((prev) => {
                const filtered = prev.filter(
                  (user) => user.user_id !== typingUser.user_id
                );
                return [...filtered, typingUser];
              });
            }
          } else if (payload.eventType === "DELETE") {
            const deletedUser = payload.old as TypingUser;
            setTypingUsers((prev) =>
              prev.filter((user) => user.user_id !== deletedUser.user_id)
            );
          }
        }
      )
      .subscribe();

    // 온라인 사용자 구독
    const onlineUsersSubscription = supabase
      .channel("online_users")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "online_users" },
        async (payload) => {
          if (
            payload.eventType === "INSERT" ||
            payload.eventType === "UPDATE"
          ) {
            const { data } = await supabase
              .from("online_users")
              .select("*")
              .order("last_seen", { ascending: false });

            if (data) {
              setOnlineUsers(data);
            }
          } else if (payload.eventType === "DELETE") {
            const { data } = await supabase
              .from("online_users")
              .select("*")
              .order("last_seen", { ascending: false });

            if (data) {
              setOnlineUsers(data);
            }
          }
        }
      )
      .subscribe();

    return () => {
      messagesSubscription.unsubscribe();
      typingSubscription.unsubscribe();
      onlineUsersSubscription.unsubscribe();
    };
  }, [isJoined, user]);

  // 타이핑 사용자 정리
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setTypingUsers((prev) =>
        prev.filter((user) => {
          const lastTyping = new Date(user.lastTyping);
          return now.getTime() - lastTyping.getTime() < 3000;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // 페이지를 벗어날 때 정리
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isJoined && user) {
        supabase.from("typing_status").delete().eq("user_id", user.id);
        supabase.from("online_users").delete().eq("user_id", user.id);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (isJoined && user) {
        supabase.from("typing_status").delete().eq("user_id", user.id);
        supabase.from("online_users").delete().eq("user_id", user.id);
      }
    };
  }, [isJoined, user]);

  return {
    // State
    nickname,
    message,
    messages,
    isJoined,
    onlineUsers,
    typingUsers,
    isTyping,
    isCheckingUser,
    error,
    messagesEndRef,
    
    // Actions
    handleJoin,
    handleLeaveChat,
    handleSendMessage,
    handleKeyPress,
    handleMessageChange,
    updateNickname,
  };
} 