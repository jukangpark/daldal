"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Play,
  Trophy,
  Target,
  Clock,
  Zap,
  Loader2,
} from "lucide-react";
import { reactionSpeedAPI } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

interface GameState {
  isPlaying: boolean;
  isWaiting: boolean;
  currentRound: number;
  totalRounds: number;
  reactionTimes: number[];
  startTime: number | null;
  showTarget: boolean;
  gameStartTime: number | null;
}

export default function ReactionSpeedPage() {
  const { user } = useAuth();
  const [gameState, setGameState] = useState<GameState>({
    isPlaying: false,
    isWaiting: false,
    currentRound: 0,
    totalRounds: 5,
    reactionTimes: [],
    startTime: null,
    showTarget: false,
    gameStartTime: null,
  });

  const [rankings, setRankings] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userBestResult, setUserBestResult] = useState<any>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 사용자 최고 기록과 랭킹 로드
  useEffect(() => {
    if (user) {
      loadUserBestResult();
      loadRankings();
    }
  }, [user]);

  const loadUserBestResult = async () => {
    try {
      const { data, error } = await reactionSpeedAPI.getUserBestResult();
      if (!error && data) {
        setUserBestResult(data);
      }
    } catch (err) {
      console.error("최고 기록 로드 오류:", err);
    }
  };

  // 게임 시작
  const startGame = () => {
    console.log("게임 시작");
    setGameState({
      isPlaying: true,
      isWaiting: false,
      currentRound: 0,
      totalRounds: 5,
      reactionTimes: [],
      startTime: null,
      showTarget: false,
      gameStartTime: Date.now(),
    });
    setShowResults(false);
    startNextRound();
  };

  // 다음 라운드 시작
  const startNextRound = () => {
    if (gameState.currentRound >= gameState.totalRounds) {
      endGame();
      return;
    }

    setGameState((prev) => ({
      ...prev,
      isWaiting: true,
      showTarget: false,
      currentRound: prev.currentRound + 1,
    }));

    // 1-3초 랜덤 대기 시간
    const waitTime = Math.random() * 2000 + 1000;
    timeoutRef.current = setTimeout(() => {
      setGameState((prev) => ({
        ...prev,
        isWaiting: false,
        showTarget: true,
        startTime: Date.now(),
      }));
    }, waitTime);
  };

  // 타겟 클릭 (반응 속도 측정)
  const handleTargetClick = () => {
    if (!gameState.startTime) return;

    const reactionTime = Date.now() - gameState.startTime;

    setGameState((prev) => ({
      ...prev,
      reactionTimes: [...prev.reactionTimes, reactionTime],
      showTarget: false,
    }));

    // 다음 라운드로
    setTimeout(() => {
      startNextRound();
    }, 1000);
  };

  // 게임 종료
  const endGame = async () => {
    console.log("게임 종료 - 현재 상태:", gameState);

    const gameDuration = gameState.gameStartTime
      ? Math.floor((Date.now() - gameState.gameStartTime) / 1000)
      : 0;

    const bestReactionTime = Math.min(...gameState.reactionTimes);
    const averageReactionTime = Math.floor(
      gameState.reactionTimes.reduce((sum, time) => sum + time, 0) /
        gameState.reactionTimes.length
    );

    console.log("계산된 결과:", {
      bestReactionTime,
      averageReactionTime,
      totalAttempts: gameState.totalRounds,
      successfulAttempts: gameState.reactionTimes.length,
      gameDuration,
    });

    setGameState((prev) => ({
      ...prev,
      isPlaying: false,
    }));

    // 결과 저장
    if (user) {
      try {
        setIsLoading(true);
        console.log("결과 저장 시작...");
        const result = await reactionSpeedAPI.saveResult({
          bestReactionTime,
          averageReactionTime,
          totalAttempts: gameState.totalRounds,
          successfulAttempts: gameState.reactionTimes.length,
          gameDuration,
        });
        console.log("결과 저장 완료:", result);
        await loadUserBestResult();
        await loadRankings();
      } catch (error) {
        console.error("결과 저장 오류:", error);
        alert("결과 저장에 실패했습니다: " + error);
      } finally {
        setIsLoading(false);
      }
    } else {
      console.log("사용자가 로그인되지 않음");
    }

    setShowResults(true);
  };

  // 랭킹 로드
  const loadRankings = async () => {
    try {
      console.log("랭킹 로드 시작...");
      const { data, error } = await reactionSpeedAPI.getRankings(10);
      if (error) {
        console.error("랭킹 로드 오류:", error);
      } else if (data) {
        console.log("랭킹 로드 성공:", data);
        setRankings(data);
      } else {
        console.log("랭킹 데이터 없음");
        setRankings([]);
      }
    } catch (err) {
      console.error("랭킹 로드 오류:", err);
    }
  };

  // 게임 재시작
  const restartGame = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    startGame();
  };

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (showResults) {
    const bestReactionTime = Math.min(...gameState.reactionTimes);
    const averageReactionTime = Math.floor(
      gameState.reactionTimes.reduce((sum, time) => sum + time, 0) /
        gameState.reactionTimes.length
    );

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="px-4 py-8 mx-auto max-w-4xl sm:px-6 lg:px-8">
          {/* 결과 화면 */}
          <div className="text-center">
            <div className="mb-8">
              <Trophy className="mx-auto w-16 h-16 text-yellow-500" />
            </div>
            <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
              게임 완료!
            </h1>
            <div className="p-6 mb-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {bestReactionTime}ms
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    최고 반응 속도
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {averageReactionTime}ms
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    평균 반응 속도
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {gameState.reactionTimes.length}/{gameState.totalRounds}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    성공률
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center mb-8 space-x-4">
              <button
                onClick={restartGame}
                disabled={isLoading}
                className="px-6 py-3 text-white rounded-lg transition-colors bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "다시하기"
                )}
              </button>
              <Link
                href="/dadalgame"
                className="px-6 py-3 text-white bg-gray-600 rounded-lg transition-colors hover:bg-gray-700"
              >
                메인으로
              </Link>
            </div>
          </div>

          {/* 랭킹 섹션 */}
          {rankings.length > 0 && (
            <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
              <div className="flex items-center mb-6">
                <Trophy className="mr-2 w-6 h-6 text-yellow-500" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  🏆 반응 속도 랭킹
                </h2>
              </div>

              <div className="space-y-3">
                {rankings.map((ranking, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-4 bg-gray-50 rounded-lg dark:bg-gray-700"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex justify-center items-center w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/20">
                        <span className="text-sm font-semibold text-primary-600">
                          {index + 1}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex justify-center items-center w-8 h-8 bg-gray-300 rounded-full dark:bg-gray-600">
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                            👤
                          </span>
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {ranking.user_name}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        {ranking.best_reaction_time}ms
                      </div>
                      <div className="text-sm text-gray-500">
                        평균: {ranking.average_reaction_time}ms
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {rankings.length > 0 && (
                <div className="p-4 mt-6 bg-green-50 rounded-lg dark:bg-green-900/20">
                  <div className="flex items-center">
                    <Zap className="mr-2 w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-900 dark:text-green-300">
                      🎉 {rankings[0].user_name}님이{" "}
                      {rankings[0].best_reaction_time}ms로 1위입니다!
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <div className="px-4 py-4 mx-auto max-w-4xl sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <Link
              href="/dadalgame"
              className="flex items-center text-gray-600 transition-colors dark:text-white hover:text-gray-900 dark:hover:text-gray-200"
            >
              <ArrowLeft className="mr-2 w-5 h-5" />
              뒤로가기
            </Link>
            <div className="text-center">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                반응 속도 테스트
              </h1>
              {gameState.isPlaying && (
                <div className="flex justify-center items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                  <span>
                    라운드 {gameState.currentRound}/{gameState.totalRounds}
                  </span>
                  {userBestResult && (
                    <span>
                      최고 기록: {userBestResult.user_name}님 (
                      {userBestResult.best_reaction_time}ms)
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      <div className="px-4 py-8 mx-auto max-w-4xl sm:px-6 lg:px-8">
        {!gameState.isPlaying ? (
          /* 게임 시작 화면 */
          <div className="text-center">
            <div className="mb-8">
              <Target className="mx-auto w-24 h-24 text-primary-600" />
            </div>
            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
              반응 속도를 테스트해보세요!
            </h2>
            <p className="mb-8 text-gray-600 dark:text-gray-400">
              화면이 빨간색으로 변하면 최대한 빨리 클릭하세요.
              <br />총 5라운드로 평균 반응 속도를 측정합니다.
            </p>

            {userBestResult && (
              <div className="p-4 mb-8 bg-blue-50 rounded-lg dark:bg-blue-900/20">
                <div className="flex justify-center items-center">
                  <Trophy className="mr-2 w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-900 dark:text-blue-300">
                    최고 기록: {userBestResult.user_name}님 (
                    {userBestResult.best_reaction_time}ms)
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={startGame}
              className="flex items-center px-8 py-4 mx-auto text-white rounded-lg transition-colors bg-primary-600 hover:bg-primary-700"
            >
              <Play className="mr-2 w-5 h-5" />
              게임 시작
            </button>
          </div>
        ) : (
          /* 게임 플레이 화면 */
          <div className="text-center">
            <div className="mb-8">
              <div className="flex justify-center items-center space-x-4 text-lg text-gray-600 dark:text-gray-400">
                <Clock className="w-6 h-6" />
                <span>
                  라운드 {gameState.currentRound}/{gameState.totalRounds}
                </span>
              </div>
            </div>

            <div className="flex justify-center mb-8">
              <div
                className={`w-64 h-64 rounded-lg cursor-pointer transition-all duration-200 ${
                  gameState.showTarget
                    ? "bg-red-500 hover:bg-red-600"
                    : gameState.isWaiting
                    ? "bg-gray-300 dark:bg-gray-600"
                    : "bg-green-500"
                }`}
                onClick={gameState.showTarget ? handleTargetClick : undefined}
              >
                <div className="flex justify-center items-center h-full">
                  {gameState.showTarget ? (
                    <span className="text-2xl font-bold text-white">클릭!</span>
                  ) : gameState.isWaiting ? (
                    <span className="text-xl text-gray-600 dark:text-gray-300">
                      대기 중...
                    </span>
                  ) : (
                    <span className="text-xl text-white">준비!</span>
                  )}
                </div>
              </div>
            </div>

            <div className="text-center text-gray-600 dark:text-gray-400">
              {gameState.showTarget ? (
                <p className="text-lg font-semibold text-red-600">
                  지금 클릭하세요! ⚡
                </p>
              ) : gameState.isWaiting ? (
                <p>화면이 빨간색으로 변할 때까지 기다리세요...</p>
              ) : (
                <p>게임이 시작됩니다...</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
