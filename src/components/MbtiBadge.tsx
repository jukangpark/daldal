interface MbtiBadgeProps {
  mbti: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

// MBTI별 색상 설정
const mbtiColors = {
  // 분석가형
  INTJ: {
    bg: "bg-purple-100 dark:bg-purple-900/30",
    text: "text-purple-700 dark:text-purple-300",
    border: "border-purple-200 dark:border-purple-700",
  },
  INTP: {
    bg: "bg-indigo-100 dark:bg-indigo-900/30",
    text: "text-indigo-700 dark:text-indigo-300",
    border: "border-indigo-200 dark:border-indigo-700",
  },
  ENTJ: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-700 dark:text-blue-300",
    border: "border-blue-200 dark:border-blue-700",
  },
  ENTP: {
    bg: "bg-cyan-100 dark:bg-cyan-900/30",
    text: "text-cyan-700 dark:text-cyan-300",
    border: "border-cyan-200 dark:border-cyan-700",
  },
  // 외교관형
  INFJ: {
    bg: "bg-pink-100 dark:bg-pink-900/30",
    text: "text-pink-700 dark:text-pink-300",
    border: "border-pink-200 dark:border-pink-700",
  },
  INFP: {
    bg: "bg-rose-100 dark:bg-rose-900/30",
    text: "text-rose-700 dark:text-rose-300",
    border: "border-rose-200 dark:border-rose-700",
  },
  ENFJ: {
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-200 dark:border-emerald-700",
  },
  ENFP: {
    bg: "bg-orange-100 dark:bg-orange-900/30",
    text: "text-orange-700 dark:text-orange-300",
    border: "border-orange-200 dark:border-orange-700",
  },
  // 관리자형
  ISTJ: {
    bg: "bg-gray-100 dark:bg-gray-900/30",
    text: "text-gray-700 dark:text-gray-300",
    border: "border-gray-200 dark:border-gray-700",
  },
  ISFJ: {
    bg: "bg-slate-100 dark:bg-slate-900/30",
    text: "text-slate-700 dark:text-slate-300",
    border: "border-slate-200 dark:border-slate-700",
  },
  ESTJ: {
    bg: "bg-stone-100 dark:bg-stone-900/30",
    text: "text-stone-700 dark:text-stone-300",
    border: "border-stone-200 dark:border-stone-700",
  },
  ESFJ: {
    bg: "bg-amber-100 dark:bg-amber-900/30",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-200 dark:border-amber-700",
  },
  // 탐험가형
  ISTP: {
    bg: "bg-lime-100 dark:bg-lime-900/30",
    text: "text-lime-700 dark:text-lime-300",
    border: "border-lime-200 dark:border-lime-700",
  },
  ISFP: {
    bg: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-700 dark:text-green-300",
    border: "border-green-200 dark:border-green-700",
  },
  ESTP: {
    bg: "bg-teal-100 dark:bg-teal-900/30",
    text: "text-teal-700 dark:text-teal-300",
    border: "border-teal-200 dark:border-teal-700",
  },
  ESFP: {
    bg: "bg-yellow-100 dark:bg-yellow-900/30",
    text: "text-yellow-700 dark:text-yellow-300",
    border: "border-yellow-200 dark:border-yellow-700",
  },
};

// 크기별 설정
const sizeClasses = {
  sm: {
    container: "px-2 py-1 text-xs",
  },
  md: {
    container: "px-3 py-1 text-sm",
  },
  lg: {
    container: "px-4 py-2 text-base",
  },
};

export default function MbtiBadge({
  mbti,
  size = "md",
  className = "",
}: MbtiBadgeProps) {
  const mbtiColor =
    mbtiColors[mbti as keyof typeof mbtiColors] || mbtiColors.ISTJ;
  const sizeClass = sizeClasses[size];

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${mbtiColor.bg} ${mbtiColor.text} ${mbtiColor.border} ${sizeClass.container} ${className}`}
    >
      {mbti}
    </span>
  );
}
