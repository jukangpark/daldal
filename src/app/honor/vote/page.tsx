"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
  Heart,
  Trophy,
  ArrowLeft,
  Users,
  Star,
  Crown,
  User,
  CheckCircle,
  XCircle,
  Loader2,
  Calendar,
  Award,
  Flame,
  Sparkles,
  HeartHandshake,
  Palette,
} from "lucide-react";
import {
  honorVoteAPI,
  VoteCandidate,
  HonorVote,
  HonorResult,
} from "@/lib/supabase";

type VoteCategory =
  | "hot_girl"
  | "hot_boy"
  | "manner"
  | "sexy"
  | "cute"
  | "style";

interface CategoryInfo {
  id: VoteCategory;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  gender?: "male" | "female";
}

const CATEGORIES: CategoryInfo[] = [
  {
    id: "hot_girl",
    title: "핫 걸",
    description: "너 내꺼 할래?",
    icon: <Flame className="w-6 h-6" />,
    color: "text-pink-500",
    bgColor: "bg-pink-400 dark:bg-pink-900/40",
    gender: "female",
  },
  {
    id: "hot_boy",
    title: "핫 보이",
    description: "너 내꺼 할래?",
    icon: <Flame className="w-6 h-6" />,
    color: "text-blue-500",
    bgColor: "bg-blue-400 dark:bg-blue-900/40",
    gender: "male",
  },
  {
    id: "manner",
    title: "매너",
    description: "가장 예의 바른 사람에게 투표하세요",
    icon: <HeartHandshake className="w-6 h-6" />,
    color: "text-green-500",
    bgColor: "bg-green-400 dark:bg-green-900/40",
  },
  {
    id: "sexy",
    title: "세쿠시",
    description: "가장 세쿠시한 사람에게 투표하세요",
    icon: <Sparkles className="w-6 h-6" />,
    color: "text-purple-500",
    bgColor: "bg-purple-400 dark:bg-purple-900/40",
  },
  {
    id: "cute",
    title: "귀여운",
    description: "가장 귀요미한 사람에게 투표하세요",
    icon: <Heart className="w-6 h-6" />,
    color: "text-red-500",
    bgColor: "bg-red-400 dark:bg-red-900/40",
  },
  {
    id: "style",
    title: "패피",
    description: "가장 스타일리시한 사람에게 투표하세요",
    icon: <Palette className="w-6 h-6" />,
    color: "text-yellow-500",
    bgColor: "bg-yellow-400 dark:bg-yellow-900/40",
  },
];

export default function HonorVotePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // 상태 관리
  const [candidates, setCandidates] = useState<VoteCandidate[]>([]);
  const [userVotes, setUserVotes] = useState<HonorVote[]>([]);
  const [results, setResults] = useState<HonorResult[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(true);
  const [loadingVotes, setLoadingVotes] = useState(true);
  const [loadingResults, setLoadingResults] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<VoteCategory | null>(
    null
  );
  const [voting, setVoting] = useState(false);

  // 현재 월-년 계산
  const currentMonthYear = new Date().toISOString().slice(0, 7); // '2024-12' 형식

  // 로그인하지 않은 경우 홈으로 리다이렉트
  if (!loading && !user) {
    router.push("/");
    return null;
  }

  // 데이터 로드
  useEffect(() => {
    if (user) {
      loadCandidates();
      loadUserVotes();
      loadResults();
    }
  }, [user]);

  const loadCandidates = async () => {
    try {
      setLoadingCandidates(true);
      const { data, error } = await honorVoteAPI.getCandidates();
      if (error) {
        console.error("후보자 로드 오류:", error);
        setError("투표 후보자를 불러오는 중 오류가 발생했습니다.");
      } else {
        setCandidates(data || []);
      }
    } catch (err) {
      console.error("후보자 로드 오류:", err);
      setError("투표 후보자를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoadingCandidates(false);
    }
  };

  const loadUserVotes = async () => {
    try {
      setLoadingVotes(true);
      const { data, error } = await honorVoteAPI.getUserVotes(currentMonthYear);
      if (error) {
        console.error("투표 내역 로드 오류:", error);
      } else {
        setUserVotes(data || []);
      }
    } catch (err) {
      console.error("투표 내역 로드 오류:", err);
    } finally {
      setLoadingVotes(false);
    }
  };

  const loadResults = async () => {
    try {
      setLoadingResults(true);
      const { data, error } = await honorVoteAPI.getLiveResults();
      if (error) {
        console.error("결과 로드 오류:", error);
      } else {
        setResults(data || []);
      }
    } catch (err) {
      console.error("결과 로드 오류:", err);
    } finally {
      setLoadingResults(false);
    }
  };

  const handleVote = async (targetId: string, category: VoteCategory) => {
    try {
      setVoting(true);
      const { data, error } = await honorVoteAPI.vote({
        target_id: targetId,
        category,
        month_year: currentMonthYear,
      });

      if (error) {
        console.error("투표 오류:", error);
        alert(error.message || "투표 중 오류가 발생했습니다.");
      } else {
        alert("투표가 완료되었습니다!");
        loadUserVotes(); // 투표 내역 새로고침
        loadResults(); // 결과 새로고침
      }
    } catch (err: any) {
      console.error("투표 오류:", err);
      alert(err.message || "투표 중 오류가 발생했습니다.");
    } finally {
      setVoting(false);
    }
  };

  const handleCancelVote = async (category: VoteCategory) => {
    try {
      const { error } = await honorVoteAPI.cancelVote(
        category,
        currentMonthYear
      );
      if (error) {
        console.error("투표 취소 오류:", error);
        alert("투표 취소 중 오류가 발생했습니다.");
      } else {
        alert("투표가 취소되었습니다.");
        loadUserVotes();
        loadResults();
      }
    } catch (err) {
      console.error("투표 취소 오류:", err);
      alert("투표 취소 중 오류가 발생했습니다.");
    }
  };

  const getFilteredCandidates = (category: VoteCategory) => {
    const categoryInfo = CATEGORIES.find((c) => c.id === category);

    if (categoryInfo?.gender) {
      return candidates.filter((c) => c.user_gender === categoryInfo.gender);
    }
    return candidates;
  };

  const getUserVoteForCategory = (category: VoteCategory) => {
    return userVotes.find((vote) => vote.category === category);
  };

  const getResultsForCategory = (category: VoteCategory) => {
    return results.filter((result) => result.category === category);
  };

  const getVotedCandidate = (targetId: string) => {
    return candidates.find((c) => c.user_id === targetId);
  };

  if (loading || loadingCandidates || loadingVotes || loadingResults) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Trophy className="mx-auto mb-4 w-12 h-12 text-primary-600" />
          <div className="mx-auto w-12 h-12 rounded-full border-b-2 animate-spin border-primary-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            투표 페이지를 불러오는 중...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 mx-auto max-w-4xl">
        <div className="text-center">
          <XCircle className="mx-auto mb-4 w-16 h-16 text-red-500" />
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
    <div className="p-6 mx-auto max-w-6xl">
      {/* 헤더 */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center mb-4 text-gray-600 transition-colors dark:text-white hover:text-gray-900 dark:hover:text-gray-200"
        >
          <ArrowLeft className="mr-2 w-5 h-5" />
          명예의 전당으로 돌아가기
        </button>

        <div className="text-center">
          <div className="flex justify-center items-center mb-4">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              🏆 익명 투표 🏆
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            이번 달 가장 인상 깊었던 회원에게 투표해주세요
          </p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            각 카테고리당 1명에게만 투표할 수 있습니다
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {loadingCandidates ? (
          <div className="py-12 text-center">
            <Loader2 className="mx-auto mb-4 w-8 h-8 animate-spin text-primary-600" />
            <p className="text-gray-600 dark:text-gray-400">
              투표 후보자를 불러오는 중...
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map((category) => {
              const filteredCandidates = getFilteredCandidates(category.id);
              const userVote = getUserVoteForCategory(category.id);
              const votedCandidate = userVote
                ? getVotedCandidate(userVote.target_id)
                : null;

              return (
                <div key={category.id} className="card">
                  <div
                    className={`flex items-center mb-4 p-4 rounded-lg ${category.bgColor}`}
                  >
                    <div className="mr-3 text-white">{category.icon}</div>
                    <h3 className="text-lg font-semibold text-white">
                      {category.title}
                    </h3>
                  </div>

                  <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                    {category.description}
                  </p>

                  {userVote ? (
                    /* 이미 투표한 경우 */
                    <div className="space-y-4">
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200 dark:bg-green-900/20 dark:border-green-700">
                        <div className="flex items-center mb-2">
                          <CheckCircle className="mr-2 w-5 h-5 text-green-600" />
                          <span className="font-medium text-green-800 dark:text-green-200">
                            투표 완료
                          </span>
                        </div>
                        {votedCandidate && (
                          <div className="flex items-center">
                            <div className="overflow-hidden mr-3 w-12 h-12 bg-gray-200 rounded-full dark:bg-gray-700">
                              {votedCandidate.profile_image ? (
                                <img
                                  src={votedCandidate.profile_image}
                                  alt={votedCandidate.user_name}
                                  className="object-cover w-full h-full"
                                />
                              ) : (
                                <User className="p-2 w-full h-full text-gray-400" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {votedCandidate.user_name}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {votedCandidate.user_gender === "male"
                                  ? "남성"
                                  : "여성"}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleCancelVote(category.id)}
                        disabled={voting}
                        className="px-4 py-2 w-full text-sm text-red-600 rounded-lg border border-red-300 transition-colors hover:bg-red-50 dark:text-red-400 dark:border-red-600 dark:hover:bg-red-900/20 disabled:opacity-50"
                      >
                        {voting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "투표 취소"
                        )}
                      </button>
                    </div>
                  ) : (
                    /* 투표하지 않은 경우 */
                    <div className="space-y-3">
                      {filteredCandidates.length > 0 ? (
                        filteredCandidates.map((candidate) => (
                          <button
                            key={candidate.user_id}
                            onClick={() =>
                              handleVote(candidate.user_id, category.id)
                            }
                            disabled={voting || candidate.user_id === user?.id}
                            className="p-3 w-full text-left rounded-lg border border-gray-200 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <div className="flex items-center">
                              <div className="overflow-hidden mr-3 w-10 h-10 bg-gray-200 rounded-full dark:bg-gray-700">
                                {candidate.profile_image ? (
                                  <img
                                    src={candidate.profile_image}
                                    alt={candidate.user_name}
                                    className="object-cover w-full h-full"
                                  />
                                ) : (
                                  <User className="p-2 w-full h-full text-gray-400" />
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {candidate.user_name}
                                  {candidate.user_id === user?.id && (
                                    <span className="ml-2 text-xs text-gray-500">
                                      (나)
                                    </span>
                                  )}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {candidate.user_gender === "male"
                                    ? "남성"
                                    : "여성"}
                                </p>
                              </div>
                              {candidate.user_id === user?.id && (
                                <XCircle className="w-5 h-5 text-gray-400" />
                              )}
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="py-6 text-center">
                          <Users className="mx-auto mb-2 w-8 h-8 text-gray-400" />
                          <p className="text-gray-500 dark:text-gray-400">
                            해당 카테고리의 후보자가 없습니다
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 돌아가기 버튼 */}
      <div className="mt-12 text-center">
        <button
          onClick={() => router.push("/honor")}
          className="flex items-center px-6 py-3 mx-auto text-gray-700 bg-gray-100 rounded-lg transition-colors dark:text-white dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
        >
          <ArrowLeft className="mr-2 w-5 h-5" />
          명예의 전당으로 돌아가기
        </button>
      </div>
    </div>
  );
}
