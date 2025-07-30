"use client";

import { useState, useEffect } from "react";
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

// 카테고리 정보
const categoryInfo = {
  hot_girl: {
    label: "핫 걸",
    icon: Flame,
    color: "text-pink-500",
    bgColor: "bg-pink-50 dark:bg-pink-900/20",
    gender: "female" as const,
  },
  hot_boy: {
    label: "핫 보이",
    icon: Flame,
    color: "text-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    gender: "male" as const,
  },
  manner: {
    label: "매너",
    icon: HeartHandshake,
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
    icon: Heart,
    color: "text-red-500",
    bgColor: "bg-red-50 dark:bg-red-900/20",
  },
  style: {
    label: "스타일",
    icon: Palette,
    color: "text-yellow-500",
    bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
  },
};

const rankIcons = [
  <Crown key="1" className="w-6 h-6 text-yellow-500" />,
  <Medal key="2" className="w-6 h-6 text-gray-400" />,
  <Award key="3" className="w-6 h-6 text-amber-600" />,
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
    };

    const userGender = userIntroduction?.user_gender || "male";
    const genderColor = genderColors[userGender];

    return (
      <div
        className="flex items-center p-4 bg-white rounded-lg shadow-md transition-all duration-300 cursor-pointer dark:bg-gray-800 hover:shadow-lg hover:scale-105"
        onClick={() => {
          if (userIntroduction) {
            router.push(`/introductions/${userIntroduction.id}`);
          }
        }}
      >
        <div className="flex items-center space-x-4">
          {/* 순위 아이콘 */}
          <div className="flex-shrink-0">
            {result.rank && result.rank <= 3 ? (
              rankIcons[result.rank - 1]
            ) : (
              <span className="flex justify-center items-center w-6 h-6 text-sm font-bold text-gray-500 bg-gray-100 rounded-full dark:bg-gray-700 dark:text-gray-400">
                {result.rank}
              </span>
            )}
          </div>

          {/* 프로필 아바타 */}
          <div className="flex-shrink-0">
            <div
              className={`flex overflow-hidden justify-center items-center w-16 h-16 rounded-full border-2 ${genderColor.bg} ${genderColor.border}`}
            >
              {profileImage ? (
                <img
                  src={profileImage}
                  alt={result.user_name}
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    target.nextElementSibling?.classList.remove("hidden");
                  }}
                />
              ) : null}
              <User
                className={`w-8 h-8 ${genderColor.icon} ${
                  profileImage ? "hidden" : ""
                }`}
              />
            </div>
          </div>

          {/* 사용자 정보 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center mb-1 space-x-2">
              <h3 className="text-lg font-semibold text-gray-900 truncate dark:text-white">
                {result.user_name}
              </h3>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {result.rank}위
              </span>

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
        <div className="flex items-center mb-6">
          <Icon className={`mr-3 w-6 h-6 ${categoryData.color}`} />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {title}
          </h2>
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
        className={`relative mb-12 overflow-hidden rounded-2xl bg-gradient-to-r from-pink-400 via-rose-500 to-fuchsia-600 p-8 text-white shadow-2xl transition-all duration-1000 ease-out ${
          animateIn ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="relative z-10 text-center">
          <div className="flex justify-center items-center mb-6">
            <Trophy className="mr-4 w-16 h-16 text-pink-200" />
            <h1 className="text-5xl font-bold text-white drop-shadow-lg">
              명예의 전당
            </h1>
          </div>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-white/90">
            🎉 가장 인기 있는 회원들을 소개합니다 🎉
          </p>
        </div>
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
          className="flex items-center px-8 py-4 mb-12 text-white bg-gradient-to-r from-pink-400 to-rose-500 rounded-full border-2 border-pink-300 shadow-xl backdrop-blur-sm transition-all duration-300 transform hover:from-pink-500 hover:to-rose-600 hover:border-pink-400 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-pink-300 focus:ring-offset-2"
        >
          <Heart className="mr-2 w-5 h-5" />
          익명으로 투표하기
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
              title="핫 걸 TOP3"
              category="hot_girl"
              icon={Flame}
              delay={200}
            />
            <HonorSection
              title="핫 보이 TOP3"
              category="hot_boy"
              icon={Flame}
              delay={400}
            />
          </div>

          {/* 기타 카테고리 섹션들 */}
          <div className="space-y-8">
            <HonorSection
              title="매너 TOP3"
              category="manner"
              icon={HeartHandshake}
              delay={600}
            />

            <HonorSection
              title="섹시 TOP3"
              category="sexy"
              icon={Sparkles}
              delay={800}
            />

            <HonorSection
              title="귀요미 TOP3"
              category="cute"
              icon={Heart}
              delay={1000}
            />

            <HonorSection
              title="스타일 TOP3"
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
            <Crown className="w-4 h-4 animate-bounce" />
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
