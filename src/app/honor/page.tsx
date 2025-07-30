"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
  Trophy,
  Crown,
  Heart,
  Users,
  Sparkles,
  User,
  Loader2,
  Flame,
  HeartHandshake,
  Palette,
} from "lucide-react";
import {
  honorVoteAPI,
  HonorResult,
  selfIntroductionAPI,
  SelfIntroduction,
} from "@/lib/supabase";
import LoginModal from "@/components/LoginModal";
import SignupModal from "@/components/SignupModal";
import UserAvatar from "@/components/UserAvatar";

// 카테고리 정보
const categoryInfo = {
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

const rankIcons = [
  <span key="1">🥇</span>,
  <span key="2">🥈</span>,
  <span key="3">🥉</span>,
];

export default function HonorPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [results, setResults] = useState<HonorResult[]>([]);
  const [loadingResults, setLoadingResults] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [introductions, setIntroductions] = useState<SelfIntroduction[]>([]);
  const [animateIn, setAnimateIn] = useState(false);

  // 현재 월-년 계산
  const currentMonthYear = new Date().toISOString().slice(0, 7); // '2024-12' 형식

  // 결과 데이터 로드
  useEffect(() => {
    loadResults();
    loadIntroductions();
  }, []);

  // 자소설 데이터 로드
  const loadIntroductions = async () => {
    try {
      const { data, error } = await selfIntroductionAPI.getAll();
      if (error) {
        console.error("자소설 로드 오류:", error);
      } else {
        setIntroductions(data || []);
      }
    } catch (err) {
      console.error("자소설 로드 오류:", err);
    }
  };

  const loadResults = async () => {
    try {
      setLoadingResults(true);
      const { data, error } = await honorVoteAPI.getLiveResults();

      if (error) {
        console.error("결과 로드 오류:", error);
        setError("투표 결과를 불러오는 중 오류가 발생했습니다.");
      } else {
        setResults(data || []);
      }
    } catch (err) {
      console.error("결과 로드 오류:", err);
      setError("투표 결과를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoadingResults(false);
      // 로딩 완료 후 애니메이션 시작
      setTimeout(() => setAnimateIn(true), 100);
    }
  };

  const HonorCard = ({
    result,
    category,
  }: {
    result: HonorResult;
    category: string;
  }) => {
    const categoryData = categoryInfo[category as keyof typeof categoryInfo];
    const Icon = categoryData.icon;

    // 해당 사용자의 자소설 찾기
    const userIntroduction = introductions.find(
      (intro) => intro.user_id === result.user_id
    );
    const profileImage = userIntroduction?.photos?.[0];

    const userGender = userIntroduction?.user_gender || "male";

    return (
      <div
        className="transition-shadow cursor-pointer card hover:shadow-lg animate-fade-in-up"
        onClick={() => {
          if (userIntroduction) {
            router.push(`/introductions/${userIntroduction.id}`);
          }
        }}
      >
        <div className="flex items-center space-x-4">
          {/* 순위 표시 */}
          <div className="flex-shrink-0">
            {/* 메달 아이콘 */}
            {result.rank && result.rank <= 3 && (
              <div className="flex-shrink-0 text-4xl">
                {rankIcons[result.rank - 1]}
              </div>
            )}
          </div>

          {/* 프로필 아바타 */}
          <div className="flex-shrink-0">
            <UserAvatar
              imageUrl={profileImage}
              userName={result.user_name}
              gender={userGender}
              size="lg"
            />
          </div>

          {/* 사용자 정보 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center mb-1 space-x-2">
              <h3 className="text-lg font-semibold text-gray-900 truncate dark:text-white">
                {result.user_name}
              </h3>
            </div>
            <div className="flex items-center space-x-2">
              {userIntroduction && (
                <span className="text-xs text-primary-600 dark:text-primary-400">
                  자소설 보기 →
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const HonorSection = ({
    title,
    category,
    icon: Icon,
    delay = 0,
  }: {
    title: string;
    category: string;
    icon: any;
    delay?: number;
  }) => {
    const categoryResults = results
      .filter((result) => result.category === category)
      .sort((a, b) => (a.rank || 0) - (b.rank || 0))
      .slice(0, 3);

    const categoryData = categoryInfo[category as keyof typeof categoryInfo];

    return (
      <div
        className={`card transition-all duration-700 ease-out ${
          animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
        style={{ transitionDelay: `${delay}ms` }}
      >
        <div
          className={`flex items-center mb-6 p-4 rounded-lg ${categoryData.bgColor}`}
        >
          <Icon className="mr-3 w-6 h-6 text-white" />
          <h2 className="text-2xl font-bold text-white">{title}</h2>
        </div>
        {categoryResults.length > 0 ? (
          <div className="space-y-4">
            {categoryResults.map((result, index) => (
              <div
                key={result.id}
                className={`transition-all duration-500 ease-out ${
                  animateIn
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 translate-x-4"
                }`}
                style={{ transitionDelay: `${delay + (index + 1) * 100}ms` }}
              >
                <HonorCard result={result} category={category} />
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center">
            <Users className="mx-auto mb-2 w-8 h-8 text-gray-400" />
            <p className="text-gray-500 dark:text-gray-400">
              아직 투표가 없습니다
            </p>
          </div>
        )}
      </div>
    );
  };

  if (loadingResults) {
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

  if (error) {
    return (
      <div className="p-6 mx-auto max-w-6xl">
        <div className="text-center">
          <Trophy className="mx-auto mb-4 w-16 h-16 text-red-500" />
          <h2 className="mb-4 text-2xl font-bold text-red-600">오류 발생</h2>
          <p className="mb-6 text-gray-600 dark:text-gray-300">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 text-white rounded-lg transition-colors bg-primary-600 hover:bg-primary-700"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      {/* 배너 */}
      <div
        className={`relative mb-12 overflow-hidden bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-600 p-12 text-white shadow-2xl transition-all duration-1000 ease-out ${
          animateIn ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        {/* 고급스러운 배경 패턴 */}
        <div className="absolute inset-0 bg-gradient-to-r to-transparent from-black/10"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-transparent via-white/5"></div>

        <div className="relative z-10 text-center">
          <div className="flex relative justify-center items-center mb-4">
            {/* 텍스트 오버레이 */}
            <div className="relative z-10 text-center">
              <h1 className="text-3xl font-bold text-white drop-shadow-lg sm:text-3xl md:text-4xl lg:text-5xl">
                🏆 명예의 전당 🏆
              </h1>
            </div>
          </div>
        </div>

        {/* 반짝이는 효과 */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-yellow-300 rounded-full animate-ping"></div>
        <div
          className="absolute top-3/4 right-1/4 w-1 h-1 bg-yellow-300 rounded-full animate-ping"
          style={{ animationDelay: "0.5s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-yellow-300 rounded-full animate-ping"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      {/* 투표하기 버튼 */}
      <div className="flex justify-center mt-8">
        <button
          onClick={() => {
            if (user) {
              router.push("/honor/vote");
            } else {
              setShowLoginModal(true);
            }
          }}
          className="flex items-center px-8 py-4 mb-12 text-black rounded-xl border-2 shadow-lg transition-all duration-300 transform dark:text-white bg:text-white hover:from-yellow-700 hover:to-purple-700 hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-offset-2"
        >
          🗳️ 익명으로 투표하기
        </button>
      </div>

      {loadingResults ? (
        <div className="py-12 text-center">
          <Loader2 className="mx-auto mb-4 w-8 h-8 animate-spin text-primary-600" />
          <p className="text-gray-600 dark:text-gray-400">
            투표 결과를 불러오는 중...
          </p>
        </div>
      ) : (
        <>
          {/* HOT 섹션 */}
          <div className="grid gap-8 mb-12 lg:grid-cols-2">
            <HonorSection
              title="핫 걸"
              category="hot_girl"
              icon={Flame}
              delay={200}
            />
            <HonorSection
              title="핫 보이"
              category="hot_boy"
              icon={Flame}
              delay={400}
            />
          </div>

          {/* 기타 카테고리 섹션들 */}
          <div className="space-y-8">
            <HonorSection
              title="매너"
              category="manner"
              icon={HeartHandshake}
              delay={600}
            />

            <HonorSection
              title="세쿠시"
              category="sexy"
              icon={Sparkles}
              delay={800}
            />

            <HonorSection
              title="귀요미"
              category="cute"
              icon={Heart}
              delay={1000}
            />

            <HonorSection
              title="패피"
              category="style"
              icon={Palette}
              delay={1200}
            />
          </div>
        </>
      )}

      {/* 안내 문구 */}
      <div
        className={`p-6 mt-12 rounded-lg bg-primary-50 dark:bg-primary-900/20 transition-all duration-1000 ease-out ${
          animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
        style={{ transitionDelay: "1400ms" }}
      >
        <div className="text-center">
          <Trophy className="mx-auto mb-4 w-12 h-12 animate-pulse text-primary-600" />
          <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
            명예의 전당 안내
          </h3>
          <p className="mb-4 text-gray-600 dark:text-gray-300">
            회원들의 익명 투표를 종합하여 선정됩니다.
            <br />
            다음 달에도 좋은 모습 보여주세요! 🏆
          </p>
          <div className="flex justify-center items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            <Crown className="mr-2 w-4 h-4 animate-bounce" /> 실시간 집계중...
          </div>
        </div>
      </div>

      {/* 로그인 모달 */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToSignup={() => {
          setShowLoginModal(false);
          setShowSignupModal(true);
        }}
      />

      {/* 회원가입 모달 */}
      <SignupModal
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        onSwitchToLogin={() => {
          setShowSignupModal(false);
          setShowLoginModal(true);
        }}
      />
    </div>
  );
}
