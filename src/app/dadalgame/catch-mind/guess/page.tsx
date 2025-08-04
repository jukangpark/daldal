"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Check, X, Trophy, Star, Loader2 } from "lucide-react";
import catchMindAPI from "@/lib/api/catchMind";
import { useAuth } from "@/contexts/AuthContext";

interface GameState {
  currentQuestion: number;
  score: number;
  attempts: number;
  isGameOver: boolean;
  showResult: boolean;
  correctAnswers: number;
}

export default function GuessPage() {
  const { user } = useAuth();
  const [gameState, setGameState] = useState<GameState>({
    currentQuestion: 1,
    score: 0,
    attempts: 0,
    isGameOver: false,
    showResult: false,
    correctAnswers: 0,
  });

  const [currentDrawing, setCurrentDrawing] = useState<any>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rankings, setRankings] = useState<any[]>([]);
  const [solvedDrawingIds, setSolvedDrawingIds] = useState<number[]>([]);
  const [isGameCompleting, setIsGameCompleting] = useState(false);

  // 게임 시작
  useEffect(() => {
    let isMounted = true;

    const initGame = async () => {
      if (!isMounted) return;

      try {
        setIsLoading(true);
        const { data, error } = await catchMindAPI.getRandomDrawing(
          solvedDrawingIds
        );

        if (!isMounted) return;

        if (error) {
          console.error("그림 가져오기 오류:", error);
          // 폴백: 기본 그림 사용
          setCurrentDrawing({
            id: 1,
            word: "고양이",
            image_url: "/api/placeholder/400/400?text=고양이",
            user_name: "시스템",
          });
        } else if (data) {
          setCurrentDrawing(data);
        }

        setUserAnswer("");
        setFeedback("");
        setGameState((prev) => ({
          ...prev,
          attempts: 0,
        }));
      } catch (err) {
        if (!isMounted) return;

        console.error("그림 가져오기 오류:", err);
        // 폴백: 기본 그림 사용
        setCurrentDrawing({
          id: 1,
          word: "고양이",
          image_url: "/api/placeholder/400/400?text=고양이",
          user_name: "시스템",
        });
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initGame();

    return () => {
      isMounted = false;
    };
  }, []);

  // 새 문제 시작
  const startNewQuestion = async () => {
    // 이미 로딩 중이면 중복 호출 방지
    if (isLoading) return;

    try {
      setIsLoading(true);
      const { data, error } = await catchMindAPI.getRandomDrawing(
        solvedDrawingIds
      );

      if (error) {
        console.error("그림 가져오기 오류:", error);
        // 폴백: 기본 그림 사용
        setCurrentDrawing({
          id: 1,
          word: "고양이",
          image_url: "/api/placeholder/400/400?text=고양이",
          user_name: "시스템",
        });
      } else if (data) {
        setCurrentDrawing(data);
      }

      setUserAnswer("");
      setFeedback("");
      setGameState((prev) => ({
        ...prev,
        attempts: 0,
      }));
    } catch (err) {
      console.error("그림 가져오기 오류:", err);
      // 폴백: 기본 그림 사용
      setCurrentDrawing({
        id: 1,
        word: "고양이",
        image_url: "/api/placeholder/400/400?text=고양이",
        user_name: "시스템",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 답변 제출
  const submitAnswer = () => {
    if (!userAnswer.trim() || gameState.attempts >= 3) return;

    const isCorrect =
      userAnswer.trim().toLowerCase() === currentDrawing.word.toLowerCase();
    const newAttempts = gameState.attempts + 1;

    if (isCorrect) {
      // 정답
      const newCorrectAnswers = gameState.correctAnswers + 1;

      setFeedback("정답입니다! 🎉");
      setGameState((prev) => ({
        ...prev,
        score: newCorrectAnswers * 20, // 점수 = 정답 수 * 20
        attempts: 0, // 정답이면 시도 횟수 초기화
        correctAnswers: newCorrectAnswers,
      }));

      // 풀었던 그림 ID에 추가
      if (currentDrawing?.id) {
        setSolvedDrawingIds((prev) => {
          const newSolvedIds = [...prev, currentDrawing.id];
          return newSolvedIds;
        });
      }

      // 다음 문제로 이동 또는 게임 완료
      const nextQuestion = gameState.currentQuestion + 1;

      if (nextQuestion <= 5) {
        // 다음 문제가 있으면 바로 이동
        setGameState((prev) => ({
          ...prev,
          currentQuestion: nextQuestion,
        }));
        startNewQuestion();
      } else {
        // 마지막 문제 완료 - 게임 종료
        // newCorrectAnswers를 사용하되, 혹시 모르니 +1을 해서 확실하게
        handleGameCompleteWithScore(newCorrectAnswers);
      }
    } else {
      // 오답
      setFeedback(`틀렸습니다. (${newAttempts}/3)`);
      setGameState((prev) => ({
        ...prev,
        attempts: newAttempts,
      }));

      // 3번 시도 후 다음 문제로
      if (newAttempts >= 3) {
        const nextQuestion = gameState.currentQuestion + 1;

        if (nextQuestion <= 5) {
          // 다음 문제가 있으면 바로 이동
          setGameState((prev) => ({
            ...prev,
            currentQuestion: nextQuestion,
          }));
          startNewQuestion();
        } else {
          // 마지막 문제 완료 - 게임 종료
          handleGameCompleteWithScore(gameState.correctAnswers);
        }
      }
    }
  };

  // 게임 재시작
  const restartGame = () => {
    setGameState({
      currentQuestion: 1,
      score: 0,
      attempts: 0,
      isGameOver: false,
      showResult: false,
      correctAnswers: 0,
    });
    setSolvedDrawingIds([]); // 풀었던 그림 목록 초기화
    setIsGameCompleting(false); // 게임 완료 상태 초기화
    startNewQuestion();
  };

  // 랭킹 가져오기
  const loadRankings = async () => {
    try {
      const { data, error } = await catchMindAPI.getRankings(10);
      if (error) {
        console.error("랭킹 가져오기 오류:", error);
        setRankings([]);
      } else if (data) {
        setRankings(data);
      }
    } catch (err) {
      console.error("랭킹 가져오기 오류:", err);
      setRankings([]);
    }
  };

  // 게임 완료 처리 (점수 파라미터로 받음)
  const handleGameCompleteWithScore = async (correctAnswers: number) => {
    // 이미 게임 완료 처리 중이면 중복 호출 방지
    if (isGameCompleting) {
      return;
    }

    if (!user) {
      setGameState((prev) => ({
        ...prev,
        isGameOver: true,
        showResult: true,
      }));
      return;
    }

    try {
      setIsGameCompleting(true);

      // 점수 계산: correct_answers * 20
      const finalScore = correctAnswers * 20;

      // 점수 저장
      await catchMindAPI.saveGameResult(finalScore, correctAnswers);

      setGameState((prev) => ({
        ...prev,
        isGameOver: true,
        showResult: true,
      }));

      // 랭킹 로드
      loadRankings();
    } catch (error) {
      console.error("게임 결과 저장 오류:", error);
      setGameState((prev) => ({
        ...prev,
        isGameOver: true,
        showResult: true,
      }));
    } finally {
      setIsGameCompleting(false);
    }
  };

  // 게임 완료 처리 (기존 함수 - 호환성 유지)
  const handleGameComplete = async () => {
    await handleGameCompleteWithScore(gameState.correctAnswers);
  };

  // Enter 키 처리
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      submitAnswer();
    }
  };

  if (gameState.showResult) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="px-4 py-8 mx-auto max-w-4xl sm:px-6 lg:px-8">
          {/* 결과 화면 */}
          <div className="text-center">
            <div className="mb-8">
              <Trophy className="mx-auto w-16 h-16 text-yellow-500" />
            </div>
            <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
              게임 종료!
            </h1>
            <div className="p-6 mb-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                    {gameState.correctAnswers * 20}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    총 점수
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {gameState.correctAnswers}/5
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    정답 수
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {Math.round((gameState.correctAnswers / 5) * 100)}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    정답률
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center mb-8 space-x-4">
              <button
                onClick={restartGame}
                className="px-6 py-3 text-white rounded-lg transition-colors bg-primary-600 hover:bg-primary-700"
              >
                다시하기
              </button>

              <Link
                href="/dadalgame/catch-mind"
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
                  🏆 캐치마인드 랭킹
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
                      <div className="text-lg font-bold text-primary-600">
                        {ranking.total_score}점
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {rankings.length > 0 && (
                <div className="p-4 mt-6 bg-blue-50 rounded-lg dark:bg-blue-900/20">
                  <div className="flex items-center">
                    <Star className="mr-2 w-5 h-5 text-blue-600" />
                    <span className="font-medium text-blue-900 dark:text-blue-300">
                      🎉 {rankings[0].user_name}님이 {rankings[0].total_score}
                      점으로 1위입니다!
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
              href="/dadalgame/catch-mind"
              className="flex items-center text-gray-600 transition-colors dark:text-white hover:text-gray-900 dark:hover:text-gray-200"
            >
              <ArrowLeft className="mr-2 w-5 h-5" />
              뒤로가기
            </Link>
            <div className="text-center">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                그림 맞추기
              </h1>
              <div className="flex justify-center items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                <span>문제 {gameState.currentQuestion}/5</span>
                <span>점수: {gameState.correctAnswers * 20}</span>
              </div>
            </div>
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      <div className="px-4 py-8 mx-auto max-w-4xl sm:px-6 lg:px-8">
        {/* 그림 표시 */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            {isLoading ? (
              <div className="flex justify-center items-center w-96 h-96 bg-white rounded-lg border-2 border-gray-300 dark:border-gray-600">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
              </div>
            ) : (
              <div className="text-center">
                <img
                  src={currentDrawing?.image_url}
                  alt="그림"
                  className="object-contain w-96 h-96 bg-white rounded-lg border-2 border-gray-300 dark:border-gray-600"
                />
                {currentDrawing?.user_name && (
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    그린 사람:{" "}
                    <span className="font-medium text-gray-900 dark:text-white">
                      {currentDrawing.user_name}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 답변 입력 */}
        <div className="mx-auto mb-6 max-w-md">
          <div className="flex space-x-2">
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="정답을 입력하세요..."
              className="flex-1 px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              disabled={gameState.attempts >= 3}
            />
            <button
              onClick={submitAnswer}
              disabled={!userAnswer.trim() || gameState.attempts >= 3}
              className="px-6 py-3 text-white rounded-lg transition-colors bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 피드백 */}
        {feedback && (
          <div className="mb-6 text-center">
            <div
              className={`inline-block px-4 py-2 rounded-lg ${
                feedback.includes("정답")
                  ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                  : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
              }`}
            >
              {feedback}
            </div>
          </div>
        )}

        {/* 시도 횟수 */}
        <div className="mb-6 text-center">
          <div className="flex justify-center space-x-2">
            {[1, 2, 3].map((attempt) => (
              <div
                key={attempt}
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  attempt <= gameState.attempts
                    ? "bg-red-500 text-white"
                    : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                }`}
              >
                {attempt <= gameState.attempts ? (
                  <X className="w-4 h-4" />
                ) : (
                  attempt
                )}
              </div>
            ))}
          </div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            기회: {3 - gameState.attempts}번 남음
          </p>
        </div>

        {/* 안내 메시지 */}
        <div className="text-center text-gray-600 dark:text-gray-400">
          <p>그림을 보고 제시어를 맞춰보세요!</p>
          <p>한 문제당 3번의 기회가 있습니다.</p>
        </div>
      </div>
    </div>
  );
}
