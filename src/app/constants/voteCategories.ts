import { Heart, Flame, Sparkles, HeartHandshake, Palette } from "lucide-react";

export type VoteCategory =
  | "hot_girl"
  | "hot_boy"
  | "manner"
  | "sexy"
  | "cute"
  | "style";

export interface CategoryInfo {
  id: VoteCategory;
  title: string;
  description: string;
  iconName: string;
  color: string;
  bgColor: string;
  gender?: "male" | "female";
}

export const voteCategories: CategoryInfo[] = [
  {
    id: "hot_girl",
    title: "핫 걸",
    description: "너 내꺼 할래?",
    iconName: "Flame",
    color: "text-pink-500",
    bgColor: "bg-pink-400 dark:bg-pink-900/40",
    gender: "female",
  },
  {
    id: "hot_boy",
    title: "핫 보이",
    description: "너 내꺼 할래?",
    iconName: "Flame",
    color: "text-blue-500",
    bgColor: "bg-blue-400 dark:bg-blue-900/40",
    gender: "male",
  },
  {
    id: "manner",
    title: "매너",
    description: "가장 예의 바른 사람에게 투표하세요",
    iconName: "HeartHandshake",
    color: "text-green-500",
    bgColor: "bg-green-400 dark:bg-green-900/40",
  },
  {
    id: "sexy",
    title: "세쿠시",
    description: "가장 세쿠시한 사람에게 투표하세요",
    iconName: "Sparkles",
    color: "text-purple-500",
    bgColor: "bg-purple-400 dark:bg-purple-900/40",
  },
  {
    id: "cute",
    title: "귀여운",
    description: "가장 귀요미한 사람에게 투표하세요",
    iconName: "Heart",
    color: "text-red-500",
    bgColor: "bg-red-400 dark:bg-red-900/40",
  },
  {
    id: "style",
    title: "패피",
    description: "가장 스타일리시한 사람에게 투표하세요",
    iconName: "Palette",
    color: "text-yellow-500",
    bgColor: "bg-yellow-400 dark:bg-yellow-900/40",
  },
];

// 아이콘 매핑 함수
export const getIconComponent = (iconName: string) => {
  const iconMap = {
    Heart: Heart,
    Flame: Flame,
    Sparkles: Sparkles,
    HeartHandshake: HeartHandshake,
    Palette: Palette,
  };

  return iconMap[iconName as keyof typeof iconMap] || Flame;
};
