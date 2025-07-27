"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
  Trophy,
  Crown,
  Star,
  Heart,
  Users,
  Sparkles,
  Award,
  Medal,
  User,
  UserCheck,
  Eye,
  Camera,
} from "lucide-react";

interface HonorUser {
  id: string;
  name: string;
  gender: "male" | "female";
  rank: number;
  score: number;
  category: string;
  photo?: string;
  description?: string;
}

// Mock 데이터
const mockHonorData = {
  hotLady: [
    {
      id: "1",
      name: "김미영",
      gender: "female",
      rank: 1,
      score: 98,
      category: "hot",
      description: "매력적인 미소의 소유자",
    },
    {
      id: "2",
      name: "박지은",
      gender: "female",
      rank: 2,
      score: 95,
      category: "hot",
      description: "우아한 매너의 여신",
    },
    {
      id: "3",
      name: "이수진",
      gender: "female",
      rank: 3,
      score: 92,
      category: "hot",
      description: "자연스러운 아름다움",
    },
  ] as HonorUser[],
  hotGentleman: [
    {
      id: "4",
      name: "최준호",
      gender: "male",
      rank: 1,
      score: 97,
      category: "hot",
      description: "카리스마 넘치는 남성",
    },
    {
      id: "5",
      name: "정민수",
      gender: "male",
      rank: 2,
      score: 94,
      category: "hot",
      description: "세련된 스타일의 소유자",
    },
    {
      id: "6",
      name: "김태현",
      gender: "male",
      rank: 3,
      score: 91,
      category: "hot",
      description: "따뜻한 미소의 남성",
    },
  ] as HonorUser[],
  manner: [
    {
      id: "7",
      name: "이하나",
      gender: "female",
      rank: 1,
      score: 99,
      category: "manner",
      description: "항상 배려하는 마음",
    },
    {
      id: "8",
      name: "박준영",
      gender: "male",
      rank: 2,
      score: 96,
      category: "manner",
      description: "정중하고 예의 바른",
    },
    {
      id: "9",
      name: "김소영",
      gender: "female",
      rank: 3,
      score: 93,
      category: "manner",
      description: "상대방을 먼저 생각하는",
    },
  ] as HonorUser[],
  sexy: [
    {
      id: "10",
      name: "최유진",
      gender: "female",
      rank: 1,
      score: 98,
      category: "sexy",
      description: "매혹적인 매력의 소유자",
    },
    {
      id: "11",
      name: "정현우",
      gender: "male",
      rank: 2,
      score: 95,
      category: "sexy",
      description: "강렬한 카리스마",
    },
    {
      id: "12",
      name: "박미라",
      gender: "female",
      rank: 3,
      score: 92,
      category: "sexy",
      description: "우아한 섹시함",
    },
  ] as HonorUser[],
  cute: [
    {
      id: "13",
      name: "김민지",
      gender: "female",
      rank: 1,
      score: 97,
      category: "cute",
      description: "사랑스러운 귀여움",
    },
    {
      id: "14",
      name: "이동현",
      gender: "male",
      rank: 2,
      score: 94,
      category: "cute",
      description: "순수한 매력",
    },
    {
      id: "15",
      name: "정소연",
      gender: "female",
      rank: 3,
      score: 91,
      category: "cute",
      description: "자연스러운 귀여움",
    },
  ] as HonorUser[],
  fashion: [
    {
      id: "16",
      name: "박지훈",
      gender: "male",
      rank: 1,
      score: 98,
      category: "fashion",
      description: "완벽한 스타일링",
    },
    {
      id: "17",
      name: "김예은",
      gender: "female",
      rank: 2,
      score: 95,
      category: "fashion",
      description: "트렌디한 패션센스",
    },
    {
      id: "18",
      name: "최성민",
      gender: "male",
      rank: 3,
      score: 92,
      category: "fashion",
      description: "세련된 옷맵시",
    },
  ] as HonorUser[],
};

const categoryInfo = {
  hot: {
    label: "HOT",
    icon: Heart,
    color: "text-red-500",
    bgColor: "bg-red-50 dark:bg-red-900/20",
  },
  manner: {
    label: "매너",
    icon: UserCheck,
    color: "text-green-500",
    bgColor: "bg-green-50 dark:bg-green-900/20",
  },
  sexy: {
    label: "섹시",
    icon: Sparkles,
    color: "text-purple-500",
    bgColor: "bg-purple-50 dark:bg-purple-900/20",
  },
  cute: {
    label: "귀여운",
    icon: Star,
    color: "text-pink-500",
    bgColor: "bg-pink-50 dark:bg-pink-900/20",
  },
  fashion: {
    label: "옷핏",
    icon: Camera,
    color: "text-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
  },
};

const rankIcons = [
  <Crown key="1" className="w-6 h-6 text-yellow-500" />,
  <Medal key="2" className="w-6 h-6 text-gray-400" />,
  <Award key="3" className="w-6 h-6 text-amber-600" />,
];

export default function HonorPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // 로그인하지 않은 경우 홈으로 리다이렉트
  if (!loading && !user) {
    router.push("/");
    return null;
  }

  const HonorCard = ({
    user,
    category,
  }: {
    user: HonorUser;
    category: string;
  }) => {
    const categoryData = categoryInfo[category as keyof typeof categoryInfo];
    const Icon = categoryData.icon;

    return (
      <div className="flex items-center p-4 bg-white rounded-lg shadow-md transition-shadow dark:bg-gray-800 hover:shadow-lg">
        <div className="flex items-center space-x-4">
          {/* 순위 아이콘 */}
          <div className="flex-shrink-0">{rankIcons[user.rank - 1]}</div>

          {/* 프로필 아바타 */}
          <div className="flex-shrink-0">
            <div
              className={`flex justify-center items-center w-16 h-16 rounded-full ${
                user.gender === "male"
                  ? "bg-blue-100 dark:bg-blue-900/30"
                  : "bg-pink-100 dark:bg-pink-900/30"
              }`}
            >
              <User
                className={`w-8 h-8 ${
                  user.gender === "male"
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-pink-600 dark:text-pink-400"
                }`}
              />
            </div>
          </div>

          {/* 사용자 정보 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center mb-1 space-x-2">
              <h3 className="text-lg font-semibold text-gray-900 truncate dark:text-white">
                {user.name}
              </h3>
              <span
                className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${categoryData.bgColor} ${categoryData.color}`}
              >
                <Icon className="mr-1 w-3 h-3" />
                {categoryData.label}
              </span>
            </div>
            <p className="mb-1 text-sm text-gray-600 dark:text-gray-300">
              {user.description}
            </p>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                점수: {user.score}점
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {user.gender === "male" ? "남성" : "여성"}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const HonorSection = ({
    title,
    users,
    category,
    icon: Icon,
  }: {
    title: string;
    users: HonorUser[];
    category: string;
    icon: any;
  }) => {
    return (
      <div className="card">
        <div className="flex items-center mb-6">
          <Icon className="mr-3 w-6 h-6 text-primary-600" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {title}
          </h2>
        </div>
        <div className="space-y-4">
          {users.map((user) => (
            <HonorCard key={user.id} user={user} category={category} />
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Trophy className="mx-auto mb-4 w-12 h-12 text-primary-600" />
          <div className="mx-auto w-12 h-12 rounded-full border-b-2 animate-spin border-primary-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            명예의 전당을 불러오는 중...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      {/* 헤더 */}
      <div className="mb-12 text-center">
        <div className="flex justify-center items-center mb-4 animate-fade-in-up">
          <Trophy className="mr-3 w-12 h-12 text-yellow-500" />
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            명예의 전당
          </h1>
        </div>
        <p className="mx-auto max-w-2xl text-xl text-gray-600 delay-200 dark:text-gray-300 animate-fade-in-up">
          이번 달 가장 인기 있는 회원들을 소개합니다
        </p>
        <div className="p-6 mt-4 mb-8 bg-yellow-50 rounded-lg border border-yellow-200 delay-300 dark:bg-yellow-900/20 dark:border-yellow-700 animate-fade-in-up">
          <div className="flex justify-center items-center space-x-3">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">
                현재 개발중입니다
              </h3>
              <p className="mt-1 text-yellow-700 dark:text-yellow-300">
                더 나은 서비스를 위해 열심히 개발하고 있습니다. 예시 UI 입니다.
              </p>
            </div>
          </div>
        </div>

        {/* 투표하기 버튼 */}
        <div className="flex justify-center mb-8 delay-400 animate-fade-in-up">
          <button
            onClick={() => router.push("/honor/vote")}
            className="flex items-center px-6 py-3 text-white rounded-lg transition-colors bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            <Heart className="mr-2 w-5 h-5" />
            익명으로 투표하기
          </button>
        </div>
        <div className="flex justify-center items-center mt-4 space-x-4 text-sm text-gray-500 delay-500 dark:text-gray-400 animate-fade-in-up">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-pink-100 rounded-full dark:bg-pink-900/30">
              <User className="mx-auto w-3 h-3 text-pink-600 dark:text-pink-400" />
            </div>
            <span>여성</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-100 rounded-full dark:bg-blue-900/30">
              <User className="mx-auto w-3 h-3 text-blue-600 dark:text-blue-400" />
            </div>
            <span>남성</span>
          </div>
        </div>
      </div>

      {/* HOT 섹션 */}
      <div className="grid gap-8 mb-12 lg:grid-cols-2 delay-600 animate-fade-in-up">
        <HonorSection
          title="핫 걸 TOP 3"
          users={mockHonorData.hotLady}
          category="hot"
          icon={Heart}
        />
        <HonorSection
          title="핫 보이 TOP 3"
          users={mockHonorData.hotGentleman}
          category="hot"
          icon={Heart}
        />
      </div>

      {/* 기타 카테고리 섹션들 */}
      <div className="space-y-8 delay-700 animate-fade-in-up">
        <HonorSection
          title="매너 TOP 3"
          users={mockHonorData.manner}
          category="manner"
          icon={UserCheck}
        />

        <HonorSection
          title="섹시 TOP 3"
          users={mockHonorData.sexy}
          category="sexy"
          icon={Sparkles}
        />

        <HonorSection
          title="귀요미 TOP 3"
          users={mockHonorData.cute}
          category="cute"
          icon={Star}
        />

        <HonorSection
          title="스타일 TOP 3"
          users={mockHonorData.fashion}
          category="fashion"
          icon={Camera}
        />
      </div>

      {/* 안내 문구 */}
      <div className="p-6 mt-12 rounded-lg bg-primary-50 dark:bg-primary-900/20 delay-800 animate-fade-in-up">
        <div className="text-center">
          <Trophy className="mx-auto mb-4 w-12 h-12 text-primary-600" />
          <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
            명예의 전당 안내
          </h3>
          <p className="mb-4 text-gray-600 dark:text-gray-300">
            매월 말일 기준으로 회원들의 투표와 활동을 종합하여 선정됩니다.
            <br />
            다음 달에도 좋은 모습 보여주세요! 🏆
          </p>
          <div className="flex justify-center items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            <Crown className="w-4 h-4" />
            <span>
              업데이트 일자 :{" "}
              {new Date().toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
