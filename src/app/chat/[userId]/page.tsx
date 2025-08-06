"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Send, User, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { PrivateChatMessage } from "@/types/chat";
import selfIntroductionAPI from "@/lib/api/self-introduction";
import privateChatAPI from "@/lib/api/private-chat";
import UserAvatar from "@/components/UserAvatar";

interface ChatUser {
  id: string;
  name: string;
  photo: string;
  gender: "male" | "female";
}

export default function PrivateChat() {
  const { user, loading: authLoading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const targetUserId = params.userId as string;

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<PrivateChatMessage[]>([]);
  const [isJoined, setIsJoined] = useState(false);
  const [isCheckingUser, setIsCheckingUser] = useState(true);
  const [targetUser, setTargetUser] = useState<ChatUser | null>(null);
  const [loadingTargetUser, setLoadingTargetUser] = useState(true);
  const [currentUser, setCurrentUser] = useState<ChatUser | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      router.push("/");
    }
  }, [user, authLoading, router]);

  // 상대방 정보 로드
  useEffect(() => {
    if (user && targetUserId) {
      loadTargetUser();
      loadCurrentUser();
    }
  }, [user, targetUserId]);

  // 상대방 정보 로드
  const loadTargetUser = async () => {
    if (!targetUserId) return;

    try {
      setLoadingTargetUser(true);
      const { data: introData } = await selfIntroductionAPI.getByUserId(
        targetUserId
      );

      if (introData) {
        setTargetUser({
          id: targetUserId,
          name: introData.user_name,
          photo:
            introData.photos && introData.photos.length > 0
              ? introData.photos[0]
              : "/default-avatar.png",
          gender: introData.gender || "male",
        });
      } else {
        // 자소설이 없는 경우 기본 정보로 설정
        setTargetUser({
          id: targetUserId,
          name: "알 수 없는 사용자",
          photo: "/default-avatar.png",
          gender: "male",
        });
      }
    } catch (error) {
      console.error("상대방 정보 로드 오류:", error);
      // 에러 발생 시 기본 정보로 설정
      setTargetUser({
        id: targetUserId,
        name: "알 수 없는 사용자",
        photo: "/default-avatar.png",
        gender: "male",
      });
    } finally {
      setLoadingTargetUser(false);
    }
  };

  // 현재 사용자 정보 로드
  const loadCurrentUser = async () => {
    if (!user) return;

    try {
      const { data: introData } = await selfIntroductionAPI.getByUserId(
        user.id
      );

      if (introData) {
        setCurrentUser({
          id: user.id,
          name: introData.user_name,
          photo:
            introData.photos && introData.photos.length > 0
              ? introData.photos[0]
              : "/default-avatar.png",
          gender: introData.gender || "male",
        });
      } else {
        // 자소설이 없는 경우 기본 정보로 설정
        setCurrentUser({
          id: user.id,
          name:
            user.user_metadata?.name || user.email?.split("@")[0] || "사용자",
          photo: "/default-avatar.png",
          gender: "male",
        });
      }
    } catch (error) {
      console.error("현재 사용자 정보 로드 오류:", error);
      // 에러 발생 시 기본 정보로 설정
      setCurrentUser({
        id: user.id,
        name: user.user_metadata?.name || user.email?.split("@")[0] || "사용자",
        photo: "/default-avatar.png",
        gender: "male",
      });
    }
  };

  // 자동 입장 처리
  useEffect(() => {
    if (user && !isJoined && targetUser && currentUser) {
      handleAutoJoin();
    } else if (user && isJoined) {
      setIsCheckingUser(false);
    }
  }, [user, isJoined, targetUser, currentUser]);

  // 자동 입장 처리
  const handleAutoJoin = async () => {
    if (!user || !targetUser || !currentUser) return;

    try {
      const chatId = [user.id, targetUserId].sort().join("_");

      // 채팅 사용자 등록
      await privateChatAPI.upsertChatUser({
        chat_id: chatId,
        user_id: user.id,
        nickname: currentUser.name,
      });

      setIsJoined(true);
      setIsCheckingUser(false);
    } catch (error) {
      console.error("Error auto joining chat:", error);
      setIsCheckingUser(false);
    }
  };

  // 메시지 전송
  const handleSendMessage = async () => {
    if (!user || !message.trim() || !targetUser || !currentUser) return;

    const chatId = [user.id, targetUserId].sort().join("_");
    const newMessage: PrivateChatMessage = {
      id: crypto.randomUUID(),
      chat_id: chatId,
      user_id: user.id,
      nickname: currentUser.name,
      message: message.trim(),
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessage("");

    try {
      const { error } = await privateChatAPI.sendMessage({
        chat_id: chatId,
        user_id: newMessage.user_id,
        nickname: newMessage.nickname,
        message: newMessage.message,
      });

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
  };

  // 채팅방 나가기
  const handleLeaveChat = async () => {
    if (!user || !targetUser || !currentUser) return;

    try {
      const chatId = [user.id, targetUserId].sort().join("_");

      // 채팅 사용자에서 제거
      await privateChatAPI.removeChatUser(chatId, user.id);

      // 상대방에게 나가기 메시지 전송
      await privateChatAPI.sendSystemMessage(
        chatId,
        `${currentUser.name}님이 대화방을 나갔습니다.`
      );

      // 상태 초기화
      setIsJoined(false);
      setMessages([]);

      // 프로필 페이지로 돌아가기
      router.push("/profile");
    } catch (error) {
      console.error("Error leaving chat:", error);
      alert("채팅방 나가기 중 오류가 발생했습니다.");
    }
  };

  // 실시간 구독 설정
  useEffect(() => {
    if (!isJoined || !user || !targetUser) return;

    // 두 사용자 간의 채팅 ID를 정렬하여 일관성 있게 만듦
    const chatId = [user.id, targetUserId].sort().join("_");

    // 기존 메시지 로드
    const loadMessages = async () => {
      const { data, error } = await privateChatAPI.getMessages(chatId);

      if (data) {
        setMessages(data);
      }
    };

    loadMessages();

    // 실시간 메시지 구독
    const messagesSubscription = supabase
      .channel(`private_chat_${chatId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "private_chat_messages",
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newMessage = payload.new as PrivateChatMessage;
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
          }
        }
      )
      .subscribe();

    return () => {
      messagesSubscription.unsubscribe();
    };
  }, [isJoined, user, targetUser, targetUserId]);

  // 페이지를 벗어날 때 정리
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isJoined && user && targetUser) {
        const chatId = [user.id, targetUserId].sort().join("_");
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (isJoined && user && targetUser) {
        const chatId = [user.id, targetUserId].sort().join("_");
      }
    };
  }, [isJoined, user, targetUser, targetUserId]);

  // 로딩 중이거나 로그인하지 않은 경우
  if (authLoading || isCheckingUser || loadingTargetUser) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <User className="mx-auto mb-4 w-12 h-12 text-primary-600" />
          <div className="mx-auto w-12 h-12 rounded-full border-b-2 animate-spin border-primary-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            {authLoading ? "인증 확인 중..." : "채팅방 준비 중..."}
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <User className="mx-auto mb-4 w-12 h-12 text-primary-600" />
          <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
            로그인이 필요합니다
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            1:1 채팅을 이용하려면 로그인해주세요.
          </p>
        </div>
      </div>
    );
  }

  if (!targetUser) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <User className="mx-auto mb-4 w-12 h-12 text-primary-600" />
          <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
            사용자를 찾을 수 없습니다
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            상대방 정보를 불러올 수 없습니다.
          </p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 mt-4 text-white rounded-lg transition-colors bg-primary-600 hover:bg-primary-700"
          >
            뒤로 가기
          </button>
        </div>
      </div>
    );
  }

  // 입장 전 UI (로딩 중)
  if (!isJoined) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <User className="mx-auto mb-4 w-12 h-12 text-primary-600" />
          <div className="mx-auto w-12 h-12 rounded-full border-b-2 animate-spin border-primary-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            채팅방에 입장하는 중...
          </p>
        </div>
      </div>
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
              <button
                onClick={() => router.back()}
                className="p-2 text-gray-600 rounded-md transition-colors duration-200 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <UserAvatar
                    imageUrl={targetUser.photo}
                    userName={targetUser.name}
                    gender={targetUser.gender}
                    size="md"
                  />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {targetUser.name}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    1:1 채팅
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2">
                  <UserAvatar
                    imageUrl={currentUser?.photo}
                    userName={currentUser?.name || "나"}
                    gender={currentUser?.gender || "male"}
                    size="sm"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    나:
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {currentUser?.name || "사용자"}
                  </span>
                </div>
              </div>

              <button
                onClick={async () => {
                  const confirmed = window.confirm(
                    `채팅방을 나가시겠습니까?\n\n상대방에게 나가기 메시지가 전송됩니다.`
                  );

                  if (confirmed) {
                    await handleLeaveChat();
                  }
                }}
                className="text-sm text-gray-600 transition-colors duration-200 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
              >
                나가기
              </button>
            </div>
          </div>
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
                msg.nickname === "시스템"
                  ? "justify-center"
                  : msg.user_id === user.id
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              {msg.nickname === "시스템" ? (
                // 시스템 메시지
                <div className="px-4 py-2 text-xs text-gray-500 bg-gray-100 rounded-full dark:bg-gray-700 dark:text-gray-400">
                  {msg.message}
                </div>
              ) : msg.user_id === user.id ? (
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
                // 상대방 메시지
                <div className="flex items-start space-x-2 max-w-xs lg:max-w-md">
                  <div className="flex-shrink-0">
                    <UserAvatar
                      imageUrl={targetUser.photo}
                      userName={targetUser.name}
                      gender={targetUser.gender}
                      size="sm"
                    />
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
    </div>
  );
}
