import { User, Crown } from "lucide-react";

interface UserAvatarProps {
  imageUrl?: string | null;
  userName: string;
  gender: "male" | "female" | "annonymous";
  size?: "sm" | "md" | "lg";
  className?: string;
  isVVIP?: boolean;
}

// 성별에 따른 색상 설정
const genderColors = {
  male: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    icon: "text-blue-500 dark:text-blue-400",
    border: "border-blue-200 dark:border-blue-700",
  },
  female: {
    bg: "bg-pink-100 dark:bg-pink-900/30",
    icon: "text-pink-500 dark:text-pink-400",
    border: "border-pink-200 dark:border-pink-700",
  },
  annonymous: {
    bg: "bg-gray-100 dark:bg-gray-900/30",
    icon: "text-gray-500 dark:text-gray-400",
    border: "border-gray-200 dark:border-gray-700",
  },
};

// 크기별 설정
const sizeClasses = {
  sm: {
    container: "w-8 h-8",
    icon: "w-5 h-5",
    badge: "w-3 h-3",
    badgeIcon: "w-2 h-2",
  },
  md: {
    container: "w-10 h-10",
    icon: "w-6 h-6",
    badge: "w-4 h-4",
    badgeIcon: "w-2.5 h-2.5",
  },
  lg: {
    container: "w-16 h-16",
    icon: "w-8 h-8",
    badge: "w-6 h-6",
    badgeIcon: "w-3 h-3",
  },
};

export default function UserAvatar({
  imageUrl,
  userName,
  gender,
  size = "md",
  className = "",
  isVVIP = false,
}: UserAvatarProps) {
  const genderColor = genderColors[gender];
  const sizeClass = sizeClasses[size];

  return (
    <div className="relative">
      <div
        className={`flex overflow-hidden justify-center items-center rounded-full border-2 ${genderColor.bg} ${genderColor.border} ${sizeClass.container} ${className}`}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={userName}
            className="object-cover w-full h-full"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
              target.nextElementSibling?.classList.remove("hidden");
            }}
          />
        ) : null}
        <User
          className={`${sizeClass.icon} ${genderColor.icon} ${
            imageUrl ? "hidden" : ""
          }`}
        />
      </div>

      {/* VIP 뱃지 */}
      {isVVIP && (
        <div
          className={`absolute -top-1 -left-0 flex justify-center items-center ${sizeClass.badge} animate-pulse-slow`}
        >
          <span className="pr-0.5 pl-0.5 text-xs font-bold text-white bg-black rounded">
            VVIP
          </span>
        </div>
      )}
    </div>
  );
}
