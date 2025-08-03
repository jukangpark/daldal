import { Heart, Sparkles, Flame, HeartHandshake, Palette } from "lucide-react";

const honorCategoryInfo = {
  hot_girl: {
    label: "핫 걸",
    icon: Flame,
    color: "text-pink-500",
    bgColor: "bg-pink-400 dark:bg-pink-900/40",
    gender: "female" as const,
  },
  hot_boy: {
    label: "핫 보이",
    icon: Flame,
    color: "text-blue-500",
    bgColor: "bg-blue-400 dark:bg-blue-900/40",
    gender: "male" as const,
  },
  manner: {
    label: "매너",
    icon: HeartHandshake,
    color: "text-green-500",
    bgColor: "bg-green-400 dark:bg-green-900/40",
  },
  sexy: {
    label: "세쿠시",
    icon: Sparkles,
    color: "text-purple-500",
    bgColor: "bg-purple-400 dark:bg-purple-900/40",
  },
  cute: {
    label: "귀여운",
    icon: Heart,
    color: "text-red-500",
    bgColor: "bg-red-400 dark:bg-red-900/40",
  },
  style: {
    label: "패피",
    icon: Palette,
    color: "text-yellow-500",
    bgColor: "bg-yellow-400 dark:bg-yellow-900/40",
  },
};

export default honorCategoryInfo;
