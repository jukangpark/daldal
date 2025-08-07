"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Scale, MessageCircle, Users, Filter, CheckCircle } from "lucide-react";
import Link from "next/link";
import balanceGameAPI from "@/lib/api/balance-game";
import { BalanceGameWithStats } from "@/lib/types/balance-game";
import LoginModal from "@/components/LoginModal";

const categories = [
  "전체",
  "연애",
  "데이트",
  "일반",
  "음식",
  "여행",
  "영화",
  "소통",
  "취미",
];

export default function BalanceGamePage() {
  const { user } = useAuth();
  const [games, setGames] = useState<BalanceGameWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [showLoginModal, setShowLoginModal] = useState(false);

  console.log("games", games);

  useEffect(() => {
    // user가 로드된 후에만 fetchGames 호출
    if (user !== undefined) {
      fetchGames();
    }
  }, [user]);

  // user가 변경될 때마다 게임 데이터 새로고침
  useEffect(() => {
    if (user) {
      fetchGames();
    }
  }, [user?.id]); // user.id가 변경될 때만

  const fetchGames = async () => {
    try {
      setLoading(true);
      const { data, error } = await balanceGameAPI.getAllWithStats(user?.id);

      if (error) {
        console.error("밸런스 게임 로드 오류:", error);
        setError("밸런스 게임을 불러오는 중 오류가 발생했습니다.");
        return;
      }

      setGames(data || []);
    } catch (error) {
      console.error("밸런스 게임 로드 오류:", error);
      setError("밸런스 게임을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const filteredGames = games.filter((game) => {
    if (selectedCategory === "전체") return true;
    return game.category === selectedCategory;
  });

  const handleCardClick = () => {
    if (!user) {
      setShowLoginModal(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="px-4 py-8 mx-auto max-w-4xl">
          <div className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full border-4 animate-spin border-primary-600 border-t-transparent"></div>
            <p className="text-gray-600 dark:text-gray-400">
              밸런스 게임을 불러오는 중...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="px-4 py-8 mx-auto max-w-4xl">
          <div className="text-center">
            <Scale className="mx-auto mb-4 w-16 h-16 text-gray-400" />
            <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
              오류가 발생했습니다
            </h1>
            <p className="mb-4 text-gray-600 dark:text-gray-400">{error}</p>
            <button
              onClick={fetchGames}
              className="px-6 py-2 text-white rounded-lg transition-colors duration-200 bg-primary-600 hover:bg-primary-700"
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center items-center mb-4">
              <Scale className="w-12 h-12 text-primary-600" />
            </div>
            <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
              밸런스 게임
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              두 가지 선택지 중 무엇을 더 선호하는지 투표하고 토론해보세요!
            </p>
          </div>
        </div>
      </div>

      {/* 카테고리 필터 */}
      <div className="bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <div className="px-4 py-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2 justify-center items-center">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              카테고리:
            </span>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors duration-200 ${
                  selectedCategory === category
                    ? "bg-primary-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 게임 목록 */}
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {filteredGames.length === 0 ? (
          <div className="py-12 text-center">
            <Scale className="mx-auto mb-4 w-16 h-16 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
              조건에 맞는 게임이 없습니다
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              다른 카테고리를 선택해보세요.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredGames.map((game, index) => {
              const hasVoted = game.user_vote !== undefined;
              const isOptionA = game.user_vote === "A";
              const isOptionB = game.user_vote === "B";

              return (
                <div
                  key={game.id}
                  style={{
                    animationDelay: `${index * 0.1}s`,
                    animationFillMode: "both",
                    animation: "fadeInUp 0.6s ease-out forwards",
                    opacity: 0,
                    transform: "translateY(30px)",
                  }}
                >
                  {user ? (
                    <Link
                      href={`/dadalgame/balance-game/${game.id}`}
                      className="block p-6 bg-white rounded-lg shadow-md transition-all duration-300 cursor-pointer group dark:bg-gray-800 hover:shadow-lg hover:scale-105"
                    >
                      {/* 게임 제목 */}
                      <div className="mb-4">
                        <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                          {game.title}
                        </h3>
                        <span className="inline-block px-2 py-1 text-xs font-medium rounded-full text-primary-600 bg-primary-100 dark:bg-primary-900/30 dark:text-primary-400">
                          {game.category}
                        </span>
                      </div>

                      {/* 선택지 */}
                      <div className="mb-4 space-y-3">
                        <div
                          className={`p-3 rounded-lg border-2 transition-colors ${
                            hasVoted && isOptionA
                              ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                              : "border-gray-200 dark:border-gray-600"
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              A. {game.option_a}
                            </span>
                            {hasVoted && isOptionA && (
                              <CheckCircle className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                            )}
                          </div>
                        </div>

                        <div
                          className={`p-3 rounded-lg border-2 transition-colors ${
                            hasVoted && isOptionB
                              ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                              : "border-gray-200 dark:border-gray-600"
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              B. {game.option_b}
                            </span>
                            {hasVoted && isOptionB && (
                              <CheckCircle className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* 통계 정보 */}
                      <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-4">
                          <span className="flex items-center">
                            <Users className="mr-1 w-3 h-3" />
                            {game.total_votes}명 참여
                          </span>
                          <span className="flex items-center">
                            <MessageCircle className="mr-1 w-3 h-3" />
                            {game.comments_count}개 댓글
                          </span>
                        </div>
                        {!hasVoted && (
                          <span className="font-medium text-primary-600 dark:text-primary-400">
                            투표하기 →
                          </span>
                        )}
                      </div>
                    </Link>
                  ) : (
                    <button
                      onClick={handleCardClick}
                      className="block p-6 w-full text-left bg-white rounded-lg shadow-md transition-all duration-300 cursor-pointer group dark:bg-gray-800 hover:shadow-lg hover:scale-105"
                    >
                      {/* 게임 제목 */}
                      <div className="mb-4">
                        <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                          {game.title}
                        </h3>
                        <span className="inline-block px-2 py-1 text-xs font-medium rounded-full text-primary-600 bg-primary-100 dark:bg-primary-900/30 dark:text-primary-400">
                          {game.category}
                        </span>
                      </div>

                      {/* 선택지 */}
                      <div className="mb-4 space-y-3">
                        <div className="p-3 rounded-lg border-2 border-gray-200 dark:border-gray-600">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            A. {game.option_a}
                          </span>
                        </div>

                        <div className="p-3 rounded-lg border-2 border-gray-200 dark:border-gray-600">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            B. {game.option_b}
                          </span>
                        </div>
                      </div>

                      {/* 통계 정보 */}
                      <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-4">
                          <span className="flex items-center">
                            <Users className="mr-1 w-3 h-3" />
                            {game.total_votes}명 참여
                          </span>
                          <span className="flex items-center">
                            <MessageCircle className="mr-1 w-3 h-3" />
                            {game.comments_count}개 댓글
                          </span>
                        </div>
                        <span className="font-medium text-primary-600 dark:text-primary-400">
                          로그인하여 투표하기 →
                        </span>
                      </div>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToSignup={() => {
          setShowLoginModal(false);
        }}
      />

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
