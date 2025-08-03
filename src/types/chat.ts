export interface ChatMessage {
  id: string;
  user_id: string;
  nickname: string;
  message: string;
  created_at: string;
}

export interface TypingUser {
  user_id: string;
  nickname: string;
  lastTyping: string;
}

export interface OnlineUser {
  user_id: string;
  nickname: string;
  last_seen: string;
}

export type NicknameModalMode = "create" | "edit";
