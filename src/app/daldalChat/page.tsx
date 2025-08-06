"use client";

import { useState, useEffect, useRef } from "react";
import {
  Send,
  Users,
  MessageCircle,
  User,
  ChevronDown,
  ChevronUp,
  Edit3,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { getUserColor } from "@/utils/chatUtils";
import { ChatMessage, TypingUser, OnlineUser } from "@/types/chat";
import NickNameModal from "@/components/NickNameModal";

export default function DaldalChat() {
  const { user, loading: authLoading } = useAuth();
  const [nickname, setNickname] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isJoined, setIsJoined] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isCheckingUser, setIsCheckingUser] = useState(true); // 사용자 확인 중 상태
  const [isNoticeExpanded, setIsNoticeExpanded] = useState(true); // 공지사항 펼침/접힘 상태
  const [isEditingNickname, setIsEditingNickname] = useState(false); // 닉네임 편집 모드
  const [editingNickname, setEditingNickname] = useState(""); // 편집 중인 닉네임
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  // 상태 추가
  const [nicknameModalOpen, setNicknameModalOpen] = useState(false);
  const [nicknameModalMode, setNicknameModalMode] = useState<"create" | "edit">(
    "create"
  );

  // 메시지 스크롤을 맨 아래로
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 로그인하지 않은 경우 처리
  useEffect(() => {
    if (!authLoading && !user) {
      alert("로그인이 필요한 서비스입니다.");
      window.location.href = "/";
    }
  }, [user, authLoading]);

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
      // 전체 데이터를 가져와서 클라이언트에서 필터링
      const { data: allData, error } = await supabase
        .from("online_users")
        .select("nickname, user_id");

      if (allData) {
        // 클라이언트에서 문자열로 변환해서 비교
        const matchingUser = allData.find(
          (item) => String(item.user_id).trim() === String(user.id).trim()
        );

        if (matchingUser?.nickname) {
          setNickname(matchingUser.nickname);
          // 기존 닉네임이 있으면 자동으로 채팅방 입장
          await handleAutoJoin(matchingUser.nickname);
        } else {
        }
      }
    } catch (error) {
    } finally {
      // 사용자 확인 완료
      setIsCheckingUser(false);
    }
  };

  // 자동 입장 처리
  const handleAutoJoin = async (existingNickname: string) => {
    if (!user) return;

    try {
      // 온라인 사용자로 등록 (last_seen 업데이트)
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
  const handleJoin = async () => {
    if (!user || !nickname.trim()) return;

    try {
      // 온라인 사용자로 등록
      const { data, error } = await supabase.from("online_users").upsert({
        user_id: user.id,
        nickname: nickname.trim(),
        last_seen: new Date().toISOString(),
      });

      if (error) {
        console.error("Error joining chat:", error);
        alert("채팅방 입장 중 오류가 발생했습니다.");
        return;
      }

      setIsJoined(true);
    } catch (error) {
      console.error("Error joining chat:", error);
      alert("채팅방 입장 중 오류가 발생했습니다.");
    }
  };

  // 온라인 사용자 제거
  const removeOnlineUser = async () => {
    if (!user) return;

    try {
      await supabase.from("online_users").delete().eq("user_id", user.id);
    } catch (error) {
      console.error("Error removing online user:", error);
    }
  };

  // 채팅방 완전 나가기 (모든 데이터 삭제)
  const handleLeaveChat = async () => {
    if (!user) return;

    try {
      // 타이핑 상태 제거
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      await supabase.from("typing_status").delete().eq("user_id", user.id);

      // 온라인 사용자에서 제거
      await supabase.from("online_users").delete().eq("user_id", user.id);

      // 해당 사용자의 모든 채팅 메시지 삭제
      await supabase.from("chat_messages").delete().eq("user_id", user.id);

      // 상태 초기화
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
      // 타이핑 시작을 다른 사용자에게 알림
      supabase.from("typing_status").upsert({
        user_id: user.id,
        nickname: nickname,
        lastTyping: new Date().toISOString(),
      });
    }

    // 타이핑 타임아웃 리셋
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      // 타이핑 종료를 다른 사용자에게 알림
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

    // 즉시 UI에 메시지 추가 (낙관적 업데이트)
    setMessages((prev) => [...prev, newMessage]);
    setMessage("");

    // 타이핑 상태 종료
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
        // 에러 발생 시 메시지 제거
        setMessages((prev) => prev.filter((msg) => msg.id !== newMessage.id));
        alert("메시지 전송에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // 에러 발생 시 메시지 제거
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

  // 닉네임 편집 시작
  const handleStartEditNickname = () => {
    setEditingNickname(nickname);
    setIsEditingNickname(true);
  };

  // 닉네임 편집 취소
  const handleCancelEditNickname = () => {
    setIsEditingNickname(false);
    setEditingNickname("");
  };

  // 닉네임 저장
  const handleSaveNickname = async () => {
    if (
      !user ||
      !editingNickname.trim() ||
      editingNickname.trim() === nickname
    ) {
      handleCancelEditNickname();
      return;
    }

    try {
      // 온라인 사용자 테이블에서 닉네임 업데이트
      const { error } = await supabase
        .from("online_users")
        .update({ nickname: editingNickname.trim() })
        .eq("user_id", user.id);

      if (error) {
        console.error("Error updating nickname:", error);
        alert("닉네임 변경에 실패했습니다.");
        return;
      }

      // 로컬 상태 업데이트
      setNickname(editingNickname.trim());
      setIsEditingNickname(false);
      setEditingNickname("");
    } catch (error) {
      console.error("Error updating nickname:", error);
      alert("닉네임 변경 중 오류가 발생했습니다.");
    }
  };

  // 닉네임 편집 중 Enter 키 처리
  const handleNicknameKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSaveNickname();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancelEditNickname();
    }
  };

  // 실시간 구독 설정
  useEffect(() => {
    if (!isJoined || !user) return;

    // 기존 메시지 로드
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

    // 온라인 사용자 로드
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
            // 중복 메시지 방지
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
            // 삭제된 메시지 제거
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
            // 새로운 사용자 추가 또는 업데이트
            const { data } = await supabase
              .from("online_users")
              .select("*")
              .order("last_seen", { ascending: false });

            if (data) {
              setOnlineUsers(data);
            }
          } else if (payload.eventType === "DELETE") {
            // 사용자 삭제 - 로컬에서 즉시 제거
            const deletedUser = payload.old as OnlineUser;

            // 전체 목록을 다시 가져와서 정확한 상태 유지
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

  // 타이핑 사용자 정리 (3초 이상 타이핑하지 않은 사용자 제거)
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

  // 페이지를 벗어날 때 완전 정리
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isJoined && user) {
        // 타이핑 상태 제거
        supabase.from("typing_status").delete().eq("user_id", user.id);
        // 온라인 사용자에서 제거
        supabase.from("online_users").delete().eq("user_id", user.id);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (isJoined && user) {
        // 타이핑 상태 제거
        supabase.from("typing_status").delete().eq("user_id", user.id);
        // 온라인 사용자에서 제거
        supabase.from("online_users").delete().eq("user_id", user.id);
      }
    };
  }, [isJoined, user]);

  // 로딩 중이거나 로그인하지 않은 경우
  if (authLoading || isCheckingUser) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <MessageCircle className="mx-auto mb-4 w-12 h-12 text-primary-600" />
          <div className="mx-auto w-12 h-12 rounded-full border-b-2 animate-spin border-primary-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            {authLoading ? "인증 확인 중..." : "사용자 정보 확인 중..."}
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <MessageCircle className="mx-auto mb-4 w-12 h-12 text-primary-600" />
          <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
            로그인이 필요합니다
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            달달톡을 이용하려면 로그인해주세요.
          </p>
        </div>
      </div>
    );
  }

  // handleJoin을 handleJoinWithNickname으로 대체
  const handleJoinWithNickname = async (nicknameToJoin: string) => {
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
      setIsJoined(true);
    } catch (error) {
      console.error("Error joining chat:", error);
      alert("채팅방 입장 중 오류가 발생했습니다.");
    }
  };

  // 기존 입장 전 UI에서 input/form 제거, 대신 모달로 대체
  if (!isJoined) {
    return (
      <>
        <NickNameModal
          open={true}
          mode="create"
          initialNickname={nickname}
          onSave={async (newNickname) => {
            setNickname(newNickname);
            setNicknameModalOpen(false);
            await handleJoinWithNickname(newNickname);
          }}
          onCancel={() => {}}
        />
        <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="p-6 w-full max-w-md bg-white rounded-lg shadow-lg dark:bg-gray-800">
            <div className="mb-6 text-center">
              <MessageCircle className="mx-auto mb-4 w-12 h-12 text-primary-600" />
              <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
                달달톡
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                익명으로 자유롭게 대화해보세요
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 고정 헤더 */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        {/* 헤더 */}
        <div className="px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div>
                <div className="flex items-center space-x-2">
                  <div className="flex-shrink-0">
                    <div
                      className={`flex justify-center items-center w-6 h-6 rounded-full ${getUserColor(
                        user.id
                      )}`}
                    >
                      <User className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    나:
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {nickname}
                  </span>
                  <button
                    onClick={() => {
                      setNicknameModalMode("edit");
                      setNicknameModalOpen(true);
                    }}
                    className="p-1 text-gray-400 transition-colors duration-200 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                    title="닉네임 편집"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Users className="w-4 h-4" />
                <span>{onlineUsers.length}명</span>
              </div>

              <button
                onClick={async () => {
                  const confirmed = window.confirm(
                    `채팅방을 나가면, 현재 사용하던 닉네임 "${nickname}"과 채팅 내역이 모두 삭제됩니다.\n\n정말 나가시겠습니까?`
                  );

                  if (confirmed) {
                    await handleLeaveChat();
                  }
                }}
                className="text-sm text-gray-600 transition-colors duration-200 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
              >
                나가기
              </button>
            </div>
          </div>
        </div>

        {/* 경고 문구 */}
        <div className="bg-yellow-50 border-b border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800">
          <button
            onClick={() => setIsNoticeExpanded(!isNoticeExpanded)}
            className="flex justify-between items-center px-4 py-2 w-full text-left transition-colors duration-200 hover:bg-yellow-100 dark:hover:bg-yellow-900/30"
          >
            <div className="flex items-center space-x-2">
              <div className="flex-shrink-0">
                <svg
                  className="w-4 h-4 text-yellow-600 dark:text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                [공지] 채팅방 이용 규칙
              </span>
            </div>
            {isNoticeExpanded ? (
              <ChevronUp className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
            )}
          </button>

          {isNoticeExpanded && (
            <div className="px-4 pb-2">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                악의적인 욕설이나 문제가 될만한 발언을 하신분은 추적하겠습니다.
                상대방에게 상처를 주는 말은 삼가해주세요.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 채팅 영역 */}
      <div className="flex flex-col flex-1 pb-20">
        {/* 메시지 목록 */}
        <div className="overflow-y-auto flex-1 p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.user_id === user.id ? "justify-end" : "justify-start"
              }`}
            >
              {msg.user_id === user.id ? (
                // 내 메시지
                <div className="px-4 py-2 max-w-xs text-white rounded-lg lg:max-w-md bg-primary-600">
                  <div className="text-sm">{msg.message}</div>
                  <div className="mt-1 text-xs opacity-75">
                    {new Date(msg.created_at).toLocaleTimeString("ko-KR", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })}
                  </div>
                </div>
              ) : (
                // 다른 사람 메시지
                <div className="flex items-start space-x-2 max-w-xs lg:max-w-md">
                  <div className="flex-shrink-0">
                    <div
                      className={`flex justify-center items-center w-8 h-8 rounded-full ${getUserColor(
                        msg.user_id
                      )}`}
                    >
                      <User className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <div className="mb-1 text-xs text-gray-600 dark:text-gray-400">
                      {msg.nickname}
                    </div>
                    <div className="px-4 py-2 text-gray-900 bg-white rounded-lg border border-gray-200 dark:bg-gray-700 dark:text-white dark:border-gray-600">
                      <div className="text-sm">{msg.message}</div>
                      <div className="mt-1 text-xs opacity-75">
                        {new Date(msg.created_at).toLocaleTimeString("ko-KR", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* 타이핑 표시 */}
          {typingUsers.length > 0 && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-2">
                <div className="flex-shrink-0">
                  <div
                    className={`flex justify-center items-center w-8 h-8 rounded-full ${getUserColor(
                      typingUsers[0].user_id
                    )}`}
                  >
                    <User className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="mb-1 text-xs text-gray-600 dark:text-gray-400">
                    {typingUsers.map((user) => user.nickname).join(", ")}
                  </div>
                  <div className="px-4 py-2 bg-gray-100 rounded-lg dark:bg-gray-700">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 메시지 입력 - 고정 */}
        <div className="fixed right-0 bottom-0 left-0 px-4 pt-4 pb-4 bg-white border-t border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex space-x-3">
            <div className="flex-1">
              <textarea
                value={message}
                onChange={handleMessageChange}
                onKeyPress={handleKeyPress}
                placeholder="메시지를 입력하세요..."
                className="px-3 py-2 w-full rounded-md border border-gray-300 shadow-sm resize-none focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                rows={1}
                maxLength={500}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!message.trim()}
              className="px-4 py-2 text-white rounded-md transition-colors duration-200 bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      <NickNameModal
        open={nicknameModalOpen}
        mode="edit"
        initialNickname={nickname}
        onSave={async (newNickname) => {
          if (!user || !newNickname.trim() || newNickname.trim() === nickname) {
            setNicknameModalOpen(false);
            return;
          }
          try {
            const { error } = await supabase.from("online_users").upsert(
              {
                user_id: user.id,
                nickname: newNickname.trim(),
                last_seen: new Date().toISOString(),
              },
              { onConflict: "user_id" }
            );
            if (error) {
              console.error("Error updating nickname:", error);
              alert("닉네임 변경에 실패했습니다.");
              return;
            }
            setNickname(newNickname.trim());
            setNicknameModalOpen(false);
          } catch (error) {
            console.error("Error updating nickname:", error);
            alert("닉네임 변경 중 오류가 발생했습니다.");
          }
        }}
        onCancel={() => setNicknameModalOpen(false)}
      />
    </div>
  );
}
