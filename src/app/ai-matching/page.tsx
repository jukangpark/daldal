"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Heart,
  ArrowLeft,
  Loader2,
  Calendar,
  MapPin,
  Star,
  ExternalLink,
} from "lucide-react";
import selfIntroductionAPI from "@/lib/api/self-introduction";
import { SelfIntroduction } from "@/lib/types";
import UserAvatar from "@/components/UserAvatar";
import MbtiBadge from "@/components/MbtiBadge";

interface AIMatchingResult {
  matchedUser: SelfIntroduction;
  compatibilityScore: number;
  explanation: string;
  reasons: {
    title: string;
    description: string;
  }[];
  recommendedDateCourses: {
    title: string;
    description: string;
    duration: string;
    budget: string;
  }[];
  relationshipTips: {
    category: string;
    title: string;
    description: string;
  }[];
}

export default function AIMatchingPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [introductions, setIntroductions] = useState<SelfIntroduction[]>([]);
  const [currentUserIntro, setCurrentUserIntro] =
    useState<SelfIntroduction | null>(null);
  const [matchingResult, setMatchingResult] = useState<AIMatchingResult | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isMatching, setIsMatching] = useState(false);
  const [matchingProgress, setMatchingProgress] = useState(0);
  const [matchingStage, setMatchingStage] = useState("");
  const [error, setError] = useState<string | null>(null);

  // 로그인하지 않은 경우 홈으로 리다이렉트
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  // 자소설 데이터 로드
  useEffect(() => {
    const loadIntroductions = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        const { data, error } = await selfIntroductionAPI.getAll();

        if (error) {
          console.error("자소설 로드 오류:", error);
          setError("자소설을 불러오는 중 오류가 발생했습니다.");
          return;
        }

        const allIntroductions = data || [];
        setIntroductions(allIntroductions);

        // 현재 사용자의 자소설 찾기
        const userIntro = allIntroductions.find(
          (intro) => intro.user_id === user.id
        );

        if (!userIntro) {
          setError("AI 매칭을 이용하려면 먼저 자소설을 작성해주세요.");
          return;
        }

        setCurrentUserIntro(userIntro);
      } catch (err) {
        console.error("자소설 로드 오류:", err);
        setError("자소설을 불러오는 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    loadIntroductions();
  }, [user]);

  // AI 매칭 실행
  const handleAIMatching = async () => {
    if (!currentUserIntro || !user) return;

    setIsMatching(true);
    setError(null);
    setMatchingProgress(0);
    setMatchingStage("");

    // 진행률 시뮬레이션
    const progressStages = [
      { progress: 10, stage: "프로필 분석 중..." },
      { progress: 25, stage: "성격 유형 매칭 중..." },
      { progress: 40, stage: "관심사 분석 중..." },
      { progress: 55, stage: "궁합도 계산 중..." },
      { progress: 70, stage: "최적 상대 선별 중..." },
      { progress: 85, stage: "데이트 코스 추천 중..." },
      { progress: 95, stage: "연애 팁 생성 중..." },
    ];

    const progressInterval = setInterval(() => {
      const currentStage = progressStages.find(
        (stage) => stage.progress > matchingProgress
      );
      if (currentStage) {
        setMatchingProgress(currentStage.progress);
        setMatchingStage(currentStage.stage);
      }
    }, 800);

    try {
      // 현재 사용자와 반대 성별의 자소설들 필터링
      const oppositeGender =
        currentUserIntro.user_gender === "male" ? "female" : "male";
      const candidates = introductions.filter(
        (intro) =>
          intro.user_gender === oppositeGender && intro.user_id !== user.id
      );

      if (candidates.length === 0) {
        setError("매칭 가능한 상대가 없습니다.");
        return;
      }

      // AI 매칭 API 호출
      const response = await fetch("/api/ai-matching", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentUser: currentUserIntro,
          candidates: candidates,
        }),
      });

      if (!response.ok) {
        throw new Error("AI 매칭에 실패했습니다.");
      }

      const result = await response.json();

      // 완료 상태로 설정
      setMatchingProgress(100);
      setMatchingStage("매칭 완료!");

      // 잠시 후 결과 표시
      setTimeout(() => {
        setMatchingResult(result);
      }, 500);
    } catch (err) {
      console.error("AI 매칭 오류:", err);
      setError("AI 매칭 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => {
        setIsMatching(false);
        setMatchingProgress(0);
        setMatchingStage("");
      }, 1000);
    }
  };

  // 스켈레톤 로딩 컴포넌트
  const SkeletonLoader = () => (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <div className="w-24 h-6 bg-gray-200 rounded animate-pulse dark:bg-gray-700"></div>
      </div>

      <div className="mb-12 text-center">
        <div className="flex justify-center items-center mb-4">
          <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse dark:bg-gray-700"></div>
        </div>
        <div className="mx-auto mb-4 w-80 h-10 bg-gray-200 rounded animate-pulse dark:bg-gray-700"></div>
        <div className="mx-auto w-96 h-6 bg-gray-200 rounded animate-pulse dark:bg-gray-700"></div>
      </div>

      {/* 현재 사용자 정보 스켈레톤 */}
      <div className="p-6 mb-8 bg-gray-50 rounded-lg border dark:bg-gray-800 dark:border-gray-700">
        <div className="mb-4 w-32 h-6 bg-gray-200 rounded animate-pulse dark:bg-gray-700"></div>
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse dark:bg-gray-700"></div>
          <div className="flex-1">
            <div className="flex items-center mb-2 space-x-2">
              <div className="w-24 h-6 bg-gray-200 rounded animate-pulse dark:bg-gray-700"></div>
              <div className="w-16 h-5 bg-gray-200 rounded animate-pulse dark:bg-gray-700"></div>
            </div>
            <div className="w-48 h-4 bg-gray-200 rounded animate-pulse dark:bg-gray-700"></div>
          </div>
        </div>
      </div>

      {/* AI 매칭 버튼 스켈레톤 */}
      <div className="mb-8 text-center">
        <div className="mx-auto w-48 h-12 bg-gray-200 rounded-lg animate-pulse dark:bg-gray-700"></div>
      </div>
    </div>
  );

  if (authLoading || isLoading) {
    return <SkeletonLoader />;
  }

  if (!user) {
    return null;
  }

  if (error && !currentUserIntro) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>뒤로 가기</span>
          </button>
        </div>

        <div className="py-20 text-center">
          <Sparkles className="mx-auto mb-4 w-16 h-16 text-gray-300 dark:text-gray-600" />
          <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
            AI 매칭 서비스
          </h2>
          <p className="mb-6 text-lg text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={() => router.push("/introductions/write")}
            className="px-6 py-3 text-white rounded-lg transition-colors bg-primary-600 hover:bg-primary-700"
          >
            자소설 작성하러 가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      {/* 헤더 */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>뒤로 가기</span>
        </button>
      </div>

      <div className="mb-12 text-center">
        <div className="flex justify-center items-center mb-4">
          <Sparkles className="w-12 h-12 text-purple-600" />
        </div>
        <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">
          AI 매칭 서비스
        </h1>
        <p className="mx-auto max-w-2xl text-xl text-gray-600 dark:text-gray-300">
          AI가 당신의 자소설을 분석하여 최고의 궁합을 찾아드립니다
        </p>
      </div>

      {/* 현재 사용자 정보 */}
      {currentUserIntro && (
        <div className="p-6 mb-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200 dark:from-purple-900/20 dark:to-pink-900/20 dark:border-purple-700">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            나의 프로필
          </h3>
          <div className="flex items-center space-x-4">
            <UserAvatar
              imageUrl={currentUserIntro.photos?.[0]}
              userName={currentUserIntro.user_name}
              gender={currentUserIntro.user_gender}
              size="lg"
              isVVIP={currentUserIntro.isVVIP}
            />
            <div className="flex-1">
              <div className="flex items-center mb-2 space-x-2">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {currentUserIntro.user_name}
                </h4>
                <MbtiBadge mbti={currentUserIntro.mbti || ""} />
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                {currentUserIntro.title}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* AI 매칭 버튼 또는 진행률 표시 */}
      {!matchingResult && (
        <div className="mb-8 text-center">
          {isMatching ? (
            <div className="mx-auto max-w-md">
              <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200 dark:from-purple-900/20 dark:to-pink-900/20 dark:border-purple-700">
                <div className="flex justify-center items-center mb-4">
                  <Sparkles className="w-8 h-8 text-purple-600 animate-pulse" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                  AI 매칭 분석 중
                </h3>
                <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
                  {matchingStage}
                </p>

                {/* 진행률 바 */}
                <div className="mb-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      진행률
                    </span>
                    <span className="text-sm font-bold text-purple-600">
                      {matchingProgress}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full dark:bg-gray-700">
                    <div
                      className="h-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${matchingProgress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex justify-center items-center mt-4">
                  <Loader2 className="mr-2 w-5 h-5 text-purple-600 animate-spin" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    잠시만 기다려주세요...
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={handleAIMatching}
              className="inline-flex items-center px-6 py-3 font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg shadow-lg transition-colors duration-200 hover:from-purple-700 hover:to-pink-700 hover:shadow-xl"
            >
              <Sparkles className="mr-2 w-5 h-5" />
              AI 매칭 시작하기
            </button>
          )}
        </div>
      )}

      {/* 에러 메시지 */}
      {error && (
        <div className="p-4 mb-8 bg-red-50 rounded-lg border border-red-200 dark:bg-red-900/20 dark:border-red-700">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* 매칭 완료 후 결과 로딩 스켈레톤 */}
      {isMatching && matchingProgress === 100 && (
        <div className="space-y-6">
          {/* 매칭 결과 헤더 스켈레톤 */}
          <div className="p-6 text-center bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200 dark:from-green-900/20 dark:to-blue-900/20 dark:border-green-700">
            <div className="flex justify-center items-center mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse dark:bg-gray-700"></div>
            </div>
            <div className="mx-auto mb-2 w-64 h-8 bg-gray-200 rounded animate-pulse dark:bg-gray-700"></div>
            <div className="mx-auto w-32 h-6 bg-gray-200 rounded animate-pulse dark:bg-gray-700"></div>
          </div>

          {/* 매칭된 상대 정보 스켈레톤 */}
          <div className="card">
            <div className="flex items-start space-x-6">
              <div className="w-20 h-20 bg-gray-200 rounded-full animate-pulse dark:bg-gray-700"></div>
              <div className="flex-1">
                <div className="flex items-center mb-3 space-x-3">
                  <div className="w-32 h-8 bg-gray-200 rounded animate-pulse dark:bg-gray-700"></div>
                  <div className="w-16 h-6 bg-gray-200 rounded animate-pulse dark:bg-gray-700"></div>
                </div>
                <div className="mb-2 w-48 h-6 bg-gray-200 rounded animate-pulse dark:bg-gray-700"></div>
                <div className="mb-4 w-full h-4 bg-gray-200 rounded animate-pulse dark:bg-gray-700"></div>
                <div className="mb-4 w-3/4 h-4 bg-gray-200 rounded animate-pulse dark:bg-gray-700"></div>
                <div className="w-32 h-10 bg-gray-200 rounded animate-pulse dark:bg-gray-700"></div>
              </div>
            </div>
          </div>

          {/* AI 분석 결과 스켈레톤 */}
          <div className="card">
            <div className="mb-4 w-40 h-6 bg-gray-200 rounded animate-pulse dark:bg-gray-700"></div>
            <div className="mb-4 w-full h-4 bg-gray-200 rounded animate-pulse dark:bg-gray-700"></div>
            <div className="mb-4 w-5/6 h-4 bg-gray-200 rounded animate-pulse dark:bg-gray-700"></div>
            <div className="space-y-4">
              <div className="w-32 h-6 bg-gray-200 rounded animate-pulse dark:bg-gray-700"></div>
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="p-4 bg-gray-50 rounded-lg dark:bg-gray-700"
                >
                  <div className="mb-2 w-48 h-5 bg-gray-200 rounded animate-pulse dark:bg-gray-600"></div>
                  <div className="mb-1 w-full h-4 bg-gray-200 rounded animate-pulse dark:bg-gray-600"></div>
                  <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse dark:bg-gray-600"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AI 매칭 결과 */}
      {matchingResult && !isMatching && (
        <div className="space-y-6">
          {/* 매칭 결과 헤더 */}
          <div className="p-6 text-center bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200 dark:from-green-900/20 dark:to-blue-900/20 dark:border-green-700">
            <div className="flex justify-center items-center mb-4">
              <Heart className="w-12 h-12 text-red-500" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
              🎉 최고의 궁합을 찾았습니다!
            </h2>
            <div className="flex justify-center items-center space-x-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                궁합도: {matchingResult.compatibilityScore}%
              </span>
            </div>
          </div>

          {/* 매칭된 상대 정보 */}
          <div className="card">
            <div className="flex items-start space-x-6">
              <UserAvatar
                imageUrl={matchingResult.matchedUser.photos?.[0]}
                userName={matchingResult.matchedUser.user_name}
                gender={matchingResult.matchedUser.user_gender}
                size="lg"
                isVVIP={matchingResult.matchedUser.isVVIP}
              />
              <div className="flex-1">
                <div className="flex items-center mb-3 space-x-3">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {matchingResult.matchedUser.user_name}
                  </h3>
                  <MbtiBadge mbti={matchingResult.matchedUser.mbti || ""} />
                </div>

                <h4 className="mb-2 text-lg font-semibold text-gray-800 dark:text-gray-200">
                  {matchingResult.matchedUser.title}
                </h4>

                <p className="mb-4 text-gray-600 dark:text-gray-300">
                  {matchingResult.matchedUser.content}
                </p>

                <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{matchingResult.matchedUser.user_age}세</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{matchingResult.matchedUser.user_location}</span>
                  </div>
                </div>

                <button
                  onClick={() =>
                    router.push(
                      `/introductions/${matchingResult.matchedUser.id}`
                    )
                  }
                  className="inline-flex items-center px-4 py-2 text-white rounded-lg transition-colors bg-primary-600 hover:bg-primary-700"
                >
                  <ExternalLink className="mr-2 w-4 h-4" />
                  자소설 자세히 보기
                </button>
              </div>
            </div>
          </div>

          {/* AI 분석 결과 */}
          <div className="card">
            <h3 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
              🤖 AI 분석 결과
            </h3>
            <p className="mb-4 text-gray-600 dark:text-gray-300">
              {matchingResult.explanation}
            </p>

            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                매칭 이유:
              </h4>
              <div className="space-y-4">
                {matchingResult.reasons.map((reason, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gray-50 rounded-lg dark:bg-gray-700"
                  >
                    <div className="flex items-start space-x-3">
                      <span className="flex flex-shrink-0 justify-center items-center w-6 h-6 text-xs font-bold text-white rounded-full bg-primary-600">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <h5 className="mb-2 font-semibold text-gray-900 dark:text-white">
                          {reason.title}
                        </h5>
                        <p className="leading-relaxed text-gray-600 dark:text-gray-300">
                          {reason.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 추천 데이트 코스 */}
          <div className="card">
            <h3 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
              💕 추천 데이트 코스
            </h3>
            <div className="space-y-4">
              {matchingResult.recommendedDateCourses?.map((course, index) => (
                <div
                  key={index}
                  className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200 dark:from-purple-900/20 dark:to-pink-900/20 dark:border-purple-700"
                >
                  <h4 className="mb-2 font-semibold text-gray-900 dark:text-white">
                    {course.title}
                  </h4>
                  <p className="mb-3 leading-relaxed text-gray-600 dark:text-gray-300">
                    {course.description}
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>💰</span>
                      <span>{course.budget}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 연애 팁 및 주의사항 */}
          <div className="card">
            <h3 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
              💡 연애 팁 & 주의사항
            </h3>
            <div className="space-y-4">
              {matchingResult.relationshipTips?.map((tip, index) => (
                <div
                  key={index}
                  className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200 dark:from-blue-900/20 dark:to-cyan-900/20 dark:border-blue-700"
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {tip.category === "주의사항" && (
                        <span className="flex justify-center items-center w-8 h-8 text-sm font-bold text-white bg-red-500 rounded-full">
                          ⚠️
                        </span>
                      )}
                      {tip.category === "소통 팁" && (
                        <span className="flex justify-center items-center w-8 h-8 text-sm font-bold text-white bg-blue-500 rounded-full">
                          💬
                        </span>
                      )}
                      {tip.category === "관계 발전" && (
                        <span className="flex justify-center items-center w-8 h-8 text-sm font-bold text-white bg-green-500 rounded-full">
                          🌱
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center mb-2 space-x-2">
                        <span className="px-2 py-1 text-xs font-medium text-white bg-gray-600 rounded-full">
                          {tip.category}
                        </span>
                        <h5 className="font-semibold text-gray-900 dark:text-white">
                          {tip.title}
                        </h5>
                      </div>
                      <p className="leading-relaxed text-gray-600 dark:text-gray-300">
                        {tip.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 다시 매칭하기 버튼 */}
          <div className="text-center">
            <button
              onClick={() => {
                setMatchingResult(null);
                setError(null);
              }}
              className="px-6 py-3 text-gray-600 bg-gray-100 rounded-lg transition-colors hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
            >
              다시 매칭하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
