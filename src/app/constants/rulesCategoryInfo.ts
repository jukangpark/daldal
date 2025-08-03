import {
  BookOpen,
  AlertCircle,
  Users,
  Heart,
  DollarSign,
  Calendar,
  UserCheck,
  UserX,
  MessageCircle,
} from "lucide-react";

const categoryInfo = {
  fee: { label: "회비", icon: DollarSign, color: "text-green-600" },
  member: { label: "회원 의무", icon: Users, color: "text-blue-600" },
  meeting: { label: "모임 규정", icon: Calendar, color: "text-purple-600" },
  drinking: { label: "음주 규정", icon: AlertCircle, color: "text-red-600" },
  relationship: { label: "이성 교류", icon: Heart, color: "text-pink-600" },
  join: { label: "가입/탈퇴", icon: UserCheck, color: "text-indigo-600" },
  age: { label: "연령 제한", icon: UserX, color: "text-orange-600" },
  chat: { label: "채팅방", icon: MessageCircle, color: "text-teal-600" },
  hobby: { label: "취미 모임", icon: BookOpen, color: "text-cyan-600" },
  leave: { label: "외출", icon: Calendar, color: "text-yellow-600" },
  guest: { label: "게스트", icon: Users, color: "text-gray-600" },
};

export default categoryInfo;
