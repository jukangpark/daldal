"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  Heart,
  ArrowLeft,
  Loader2,
  Calendar,
  MapPin,
  Star,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import selfIntroductionAPI from "@/lib/api/self-introduction";
import { SelfIntroduction } from "@/lib/types";
import UserAvatar from "@/components/UserAvatar";
import MbtiBadge from "@/components/MbtiBadge";

interface AICompatibilityResult {
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

export default function AICompatibilityPage() {
  const { user, loading: authLoading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const [currentUserIntro, setCurrentUserIntro] =
    useState<SelfIntroduction | null>(null);
  const [targetUserIntro, setTargetUserIntro] =
    useState<SelfIntroduction | null>(null);
  const [compatibilityResult, setCompatibilityResult] =
    useState<AICompatibilityResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStage, setAnalysisStage] = useState("");
  const [error, setError] = useState<string | null>(null);

  // 로그인하지 않은 경우 홈으로 리다이렉트
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  // 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      if (!user || !params.id) return;

      try {
        setIsLoading(true);

        // 현재 사용자의 자소설과 대상 사용자의 자소설을 동시에 로드
        const [currentUserResponse, targetUserResponse] = await Promise.all([
          selfIntroductionAPI.getByUserId(user.id),
          selfIntroductionAPI.getById(params.id as string),
        ]);

        if (currentUserResponse.error || !currentUserResponse.data) {
          setError("AI 궁합 분석을 이용하려면 먼저 자소설을 작성해주세요.");
          return;
        }

        if (targetUserResponse.error || !targetUserResponse.data) {
          setError("대상 사용자의 자소설을 찾을 수 없습니다.");
          return;
        }

        setCurrentUserIntro(currentUserResponse.data);
        setTargetUserIntro(targetUserResponse.data);

        // 같은 사용자인 경우 에러
        if (
          currentUserResponse.data.user_id === targetUserResponse.data.user_id
        ) {
          setError("자신과의 궁합은 분석할 수 없습니다.");
          return;
        }
      } catch (err) {
        console.error("데이터 로드 오류:", err);
        setError("데이터를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user, params.id]);

  // AI 궁합 분석 실행
  const handleCompatibilityAnalysis = async () => {
    if (!currentUserIntro || !targetUserIntro || !user) return;

    setIsAnalyzing(true);
    setError(null);
    setAnalysisProgress(0);
    setAnalysisStage("");

    // 진행률 시뮬레이션
    const progressStages = [
      { progress: 15, stage: "프로필 비교 분석 중..." },
      { progress: 30, stage: "성격 유형 궁합도 계산 중..." },
      { progress: 45, stage: "관심사 호환성 분석 중..." },
      { progress: 60, stage: "라이프스타일 매칭 중..." },
      { progress: 75, stage: "궁합도 종합 평가 중..." },
      { progress: 90, stage: "데이트 코스 추천 생성 중..." },
      { progress: 95, stage: "연애 팁 정리 중..." },
    ];

    const progressInterval = setInterval(() => {
      const currentStage = progressStages.find(
        (stage) => stage.progress > analysisProgress
      );
      if (currentStage) {
        setAnalysisProgress(currentStage.progress);
        setAnalysisStage(currentStage.stage);
      }
    }, 600);

    try {
      // AI 궁합 분석 API 호출
      const response = await fetch("/api/ai-compatibility", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentUser: currentUserIntro,
          targetUser: targetUserIntro,
        }),
      });

      if (!response.ok) {
        throw new Error("AI 궁합 분석에 실패했습니다.");
      }

      const result = await response.json();

      // 완료 상태로 설정
      setAnalysisProgress(100);
      setAnalysisStage("분석 완료!");

      // 잠시 후 결과 표시
      setTimeout(() => {
        setCompatibilityResult(result);
      }, 500);
    } catch (err) {
      console.error("AI 궁합 분석 오류:", err);
      setError("AI 궁합 분석 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => {
        setIsAnalyzing(false);
        setAnalysisProgress(0);
        setAnalysisStage("");
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

      {/* 사용자 정보 스켈레톤 */}
      <div className="grid gap-6 mb-8 md:grid-cols-2">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="p-6 bg-gray-50 rounded-lg border dark:bg-gray-800 dark:border-gray-700"
          >
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
        ))}
      </div>

      {/* AI 분석 버튼 스켈레톤 */}
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

  if (error && (!currentUserIntro || !targetUserIntro)) {
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
          <Heart className="mx-auto mb-4 w-16 h-16 text-gray-300 dark:text-gray-600" />
          <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
            AI 궁합 분석
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
          <Heart className="w-12 h-12 text-pink-600" />
        </div>
        <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">
          AI 궁합 분석
        </h1>
        <p className="mx-auto max-w-2xl text-xl text-gray-600 dark:text-gray-300">
          AI가 분석한 두 사람의 궁합을 확인해보세요
        </p>
      </div>

      {/* 사용자 정보 비교 */}
      {currentUserIntro && targetUserIntro && (
        <div className="grid gap-6 mb-8 md:grid-cols-2">
          {/* 현재 사용자 */}
          <div className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200 dark:from-blue-900/20 dark:to-cyan-900/20 dark:border-blue-700">
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

          {/* 대상 사용자 */}
          <div className="p-6 bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg border border-pink-200 dark:from-pink-900/20 dark:to-rose-900/20 dark:border-pink-700">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              상대방 프로필
            </h3>
            <div className="flex items-center space-x-4">
              <UserAvatar
                imageUrl={targetUserIntro.photos?.[0]}
                userName={targetUserIntro.user_name}
                gender={targetUserIntro.user_gender}
                size="lg"
                isVVIP={targetUserIntro.isVVIP}
              />
              <div className="flex-1">
                <div className="flex items-center mb-2 space-x-2">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {targetUserIntro.user_name}
                  </h4>
                  <MbtiBadge mbti={targetUserIntro.mbti || ""} />
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  {targetUserIntro.title}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI 분석 버튼 또는 진행률 표시 */}
      {!compatibilityResult && (
        <div className="mb-8 text-center">
          {isAnalyzing ? (
            <div className="mx-auto max-w-md">
              <div className="p-6 bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg border border-pink-200 dark:from-pink-900/20 dark:to-rose-900/20 dark:border-pink-700">
                <div className="flex justify-center items-center mb-4">
                  <Heart className="w-8 h-8 text-pink-600 animate-pulse" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                  AI 궁합 분석 중
                </h3>
                <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
                  {analysisStage}
                </p>

                {/* 진행률 바 */}
                <div className="mb-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      진행률
                    </span>
                    <span className="text-sm font-bold text-pink-600">
                      {analysisProgress}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full dark:bg-gray-700">
                    <div
                      className="h-2 bg-gradient-to-r from-pink-600 to-rose-600 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${analysisProgress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex justify-center items-center mt-4">
                  <Loader2 className="mr-2 w-5 h-5 text-pink-600 animate-spin" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    잠시만 기다려주세요...
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={handleCompatibilityAnalysis}
              className="inline-flex items-center px-6 py-3 font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg shadow-lg transition-colors duration-200 hover:from-purple-700 hover:to-pink-700 hover:shadow-xl"
            >
              <Sparkles className="mr-2 w-5 h-5" />
              AI 궁합 분석 시작하기
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

      {/* AI 궁합 분석 결과 */}
      {compatibilityResult && !isAnalyzing && (
        <div className="space-y-6">
          {/* 궁합 결과 헤더 */}
          <div className="p-6 text-center bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg border border-pink-200 dark:from-pink-900/20 dark:to-rose-900/20 dark:border-pink-700">
            <div className="flex justify-center items-center mb-4">
              <Heart className="w-12 h-12 text-pink-500" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
              🎉 궁합 분석 완료!
            </h2>
            <div className="flex justify-center items-center space-x-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                궁합도: {compatibilityResult.compatibilityScore}%
              </span>
            </div>
          </div>

          {/* AI 분석 결과 */}
          <div className="card">
            <h3 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
              🤖 AI 분석 결과
            </h3>
            <p className="mb-4 text-gray-600 dark:text-gray-300">
              {compatibilityResult.explanation}
            </p>

            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                궁합 이유:
              </h4>
              <div className="space-y-4">
                {compatibilityResult.reasons.map((reason, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gray-50 rounded-lg dark:bg-gray-700"
                  >
                    <div className="flex items-start space-x-3">
                      <span className="flex flex-shrink-0 justify-center items-center w-6 h-6 text-xs font-bold text-white bg-pink-600 rounded-full">
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
              {compatibilityResult.recommendedDateCourses?.map(
                (course, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg border border-pink-200 dark:from-pink-900/20 dark:to-rose-900/20 dark:border-pink-700"
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
                )
              )}
            </div>
          </div>

          {/* 연애 팁 및 주의사항 */}
          <div className="card">
            <h3 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
              💡 연애 팁 & 주의사항
            </h3>
            <div className="space-y-4">
              {compatibilityResult.relationshipTips?.map((tip, index) => (
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

          {/* 다시 분석하기 버튼 */}
          <div className="text-center">
            <button
              onClick={() => {
                setCompatibilityResult(null);
                setError(null);
              }}
              className="px-6 py-3 text-gray-600 bg-gray-100 rounded-lg transition-colors hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
            >
              다시 분석하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
