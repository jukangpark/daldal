"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Trophy, Clock, Star, Flame } from "lucide-react";

interface Question {
  id: number;
  question: string;
  options: string[];
}

interface TestResult {
  id: string;
  user_id: string;
  user_name: string;
  answers: number[];
  personality_type: string;
  created_at: string;
}

interface MatchResult {
  user_name: string;
  match_score: number;
  common_answers: number;
}

const questions: Question[] = [
  {
    id: 1,
    question: "관계에서 가장 중요하게 생각하는 것은?",
    options: ["감정적 연결", "피지컬", "서로의 존중", "새로운 경험"],
  },
  {
    id: 2,
    question: "야한 대화에 대해 어떻게 생각하시나요?",
    options: [
      "야한 대화 전문가",
      "조금 부끄러움",
      "상대방이 먼저 시작하기를 기다림",
      "전혀 하지 않음",
    ],
  },
  {
    id: 3,
    question: "어떤 스타일을 선호하시나요?",
    options: [
      "부드럽고 로맨틱",
      "열정적이고 강렬",
      "서로의 페이스에 맞춤",
      "섹시 다이너마이트",
    ],
  },
  {
    id: 4,
    question: "욕구가 생겼을 때 어떻게 대처하시나요?",
    options: [
      "상대방과 솔직하게 이야기",
      "덮침",
      "그냥 넘어감",
      "상대방이 알아차리기를 기다림",
    ],
  },
  {
    id: 5,
    question: "성적 판타지에 대해 어떻게 생각하시나요?",
    options: ["상대방과 공유함", "내가 리드", "전혀 없음", "상대방에게 맞춤"],
  },
  {
    id: 6,
    question: "가장 스트레스 받는 상황은?",
    options: [
      "상대가 불만족할 때",
      "내가 불만족할 때",
      "상대 피지컬이 부족할 때",
      "내 피지컬이 부족할 때",
    ],
  },
  {
    id: 7,
    question: "관계에서 어떤 역할을 선호하시나요?",
    options: [
      "난 섹시 다이너마이트",
      "상대방이 주도하는 것을 선호",
      "서로 번갈아가며",
      "상황에 따라 다름",
    ],
  },
  {
    id: 8,
    question: "가장 행복한 순간은?",
    options: [
      "상대방이 만족할 때",
      "내가 만족할 때",
      "절정에 도달하는 순간",
      "아잉 몰라잉",
    ],
  },
  {
    id: 9,
    question: "상대가 관계를 거절하면 어떻게 행동하시나요?",
    options: [
      "상대방과 대화로 해결",
      "내가 잘못했나? 혼자 고민함",
      "감히 너가 날 거절?",
      "다음에 더 잘하려고 노력함",
    ],
  },
  {
    id: 10,
    question: "관계에서 가장 중요한 의사소통은?",
    options: ["타이밍 조절", "즉시 피드백", "정말 야한 대화", "감정적 교감"],
  },
  {
    id: 11,
    question: "관계에서 실수를 했을 때 어떻게 하시나요?",
    options: [
      "즉시 사과하고 대화",
      "난 실수 따위 없음",
      "주로 상대방이 실수함",
      "그냥 넘어감",
    ],
  },
  {
    id: 12,
    question: "관계에서 가장 두려운 것은?",
    options: [
      "상대방이 실망하는 것",
      "자신의 부족함",
      "성적인 욕구 차이",
      "상대의 부족함",
    ],
  },
  {
    id: 13,
    question: "성적인 관계를 계획할 때 어떤 스타일인가요?",
    options: [
      "미리 계획하고 준비",
      "즉흥적으로",
      "상대방이 계획하는 것을 선호",
      "므흣할 때 덮침",
    ],
  },
  {
    id: 14,
    question: "관계에서 가장 중요한 것은?",
    options: ["서로의 만족", "감정적 연결", "신뢰와 존중", "섹다른 경험"],
  },
  {
    id: 15,
    question: "관계 후 어떻게 하시나요?",
    options: ["상대방과 대화", "즉시 잠", "핸폰 보기", "바로 한번 더"],
  },
];

export default function SexyQuiz() {
  const { user } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isAnswered, setIsAnswered] = useState(false);
  const [personalityType, setPersonalityType] = useState("");
  const [personalityDescription, setPersonalityDescription] = useState("");
  const [matchResults, setMatchResults] = useState<MatchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingExistingResult, setIsCheckingExistingResult] =
    useState(true);

  useEffect(() => {
    if (timeLeft > 0 && !isAnswered) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isAnswered) {
      handleAnswer(0); // 시간 초과시 첫 번째 선택지로
    }
  }, [timeLeft, isAnswered]);

  // 페이지 로드시 현재 문제의 기존 답변이 있다면 선택
  useEffect(() => {
    if (answers[currentQuestion] !== undefined) {
      setSelectedAnswer(answers[currentQuestion]);
      setIsAnswered(true);
    } else {
      setSelectedAnswer(null);
      setIsAnswered(false);
    }
  }, [currentQuestion, answers]);

  // 기존 테스트 결과 확인
  useEffect(() => {
    if (user) {
      checkExistingResult();
    } else {
      setIsCheckingExistingResult(false);
    }
  }, [user]);

  const checkExistingResult = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("sexy_test_results")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) {
        console.error("Error checking existing result:", error);
        setIsCheckingExistingResult(false);
        return;
      }

      if (data && data.length > 0) {
        // 기존 결과가 있으면 바로 결과 화면으로
        const existingResult = data[0];
        setAnswers(existingResult.answers);
        setPersonalityType(existingResult.personality_type);
        setPersonalityDescription(
          getPersonalityDescription(existingResult.personality_type)
        );
        setShowResult(true);
        findMatches(existingResult.answers);
      }
    } catch (error) {
      console.error("Error checking existing result:", error);
    } finally {
      setIsCheckingExistingResult(false);
    }
  };

  const getPersonalityDescription = (type: string): string => {
    switch (type) {
      case "감정형 연인":
        return "당신은 성적인 관계에서 감정적 연결을 가장 중요하게 생각하는 타입입니다. 물리적 만족보다는 정서적 교감을 추구하며, 상대방의 마음을 이해하고 공감하는 능력이 뛰어납니다. 로맨틱하고 부드러운 성향을 가지고 있어, 깊은 정서적 연결을 통해 성적인 만족을 얻습니다.";
      case "열정형 연인":
        return "당신은 성적인 관계에서 열정과 강렬함을 추구하는 타입입니다. 새로운 경험과 도전을 즐기며, 적극적으로 주도하는 성향을 가지고 있습니다. 물리적 만족을 중요하게 생각하지만, 상대방의 욕구도 함께 고려하는 균형잡힌 성향입니다.";
      case "신중형 연인":
        return "당신은 성적인 관계에서 신뢰와 존중을 가장 중요하게 생각하는 타입입니다. 서로의 욕구를 이해하고 존중하며, 천천히 관계를 발전시키는 것을 선호합니다. 안정적이고 신뢰할 수 있는 파트너가 될 수 있으며, 상대방의 페이스에 맞춰 조화롭게 관계를 발전시킵니다.";
      case "자유형 연인":
        return "당신은 성적인 관계에서 자유로움과 즉흥성을 추구하는 타입입니다. 계획보다는 자연스러운 흐름을 선호하며, 새로운 경험과 창의적인 시도를 즐깁니다. 상대방을 구속하지 않고 함께 성장하는 관계를 원하며, 유연하고 적응력이 뛰어납니다.";
      case "균형형 연인":
        return "당신은 성적인 관계에서 다양한 가치관을 균형있게 가지고 있는 타입입니다. 상황과 상대방에 따라 유연하게 대처할 수 있으며, 감정적 연결과 물리적 만족을 모두 중요하게 생각합니다. 이해심이 많고 적응력이 뛰어나 다양한 파트너와 조화롭게 관계를 발전시킬 수 있습니다.";
      default:
        return "당신의 성적 성향을 분석한 결과입니다.";
    }
  };

  const handleAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    setIsAnswered(true);

    // 이미 답변한 문제라면 기존 답변을 업데이트
    if (answers.length > currentQuestion) {
      const newAnswers = [...answers];
      newAnswers[currentQuestion] = answerIndex;
      setAnswers(newAnswers);
    } else {
      // 새로운 답변 추가
      setAnswers([...answers, answerIndex]);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      // 다음 문제의 기존 답변이 있다면 선택, 없다면 null
      const nextAnswer =
        answers[currentQuestion + 1] !== undefined
          ? answers[currentQuestion + 1]
          : null;
      setSelectedAnswer(nextAnswer);
      setIsAnswered(nextAnswer !== null);
      setTimeLeft(30);
    } else {
      analyzePersonality();
    }
  };

  const analyzePersonality = () => {
    // 선택지별 성향 분석
    const emotionalCount = answers.filter((a) => a === 0).length;
    const passionateCount = answers.filter((a) => a === 1).length;
    const carefulCount = answers.filter((a) => a === 2).length;
    const freeCount = answers.filter((a) => a === 3).length;

    let type = "";
    let description = "";

    if (emotionalCount >= 6) {
      type = "감정형 연인";
      description =
        "당신은 성적인 관계에서 감정적 연결을 가장 중요하게 생각하는 타입입니다. 물리적 만족보다는 정서적 교감을 추구하며, 상대방의 마음을 이해하고 공감하는 능력이 뛰어납니다. 로맨틱하고 부드러운 성향을 가지고 있어, 깊은 정서적 연결을 통해 성적인 만족을 얻습니다.";
    } else if (passionateCount >= 6) {
      type = "열정형 연인";
      description =
        "당신은 성적인 관계에서 열정과 강렬함을 추구하는 타입입니다. 새로운 경험과 도전을 즐기며, 적극적으로 주도하는 성향을 가지고 있습니다. 물리적 만족을 중요하게 생각하지만, 상대방의 욕구도 함께 고려하는 균형잡힌 성향입니다.";
    } else if (carefulCount >= 6) {
      type = "신중형 연인";
      description =
        "당신은 성적인 관계에서 신뢰와 존중을 가장 중요하게 생각하는 타입입니다. 서로의 욕구를 이해하고 존중하며, 천천히 관계를 발전시키는 것을 선호합니다. 안정적이고 신뢰할 수 있는 파트너가 될 수 있으며, 상대방의 페이스에 맞춰 조화롭게 관계를 발전시킵니다.";
    } else if (freeCount >= 6) {
      type = "자유형 연인";
      description =
        "당신은 성적인 관계에서 자유로움과 즉흥성을 추구하는 타입입니다. 계획보다는 자연스러운 흐름을 선호하며, 새로운 경험과 창의적인 시도를 즐깁니다. 상대방을 구속하지 않고 함께 성장하는 관계를 원하며, 유연하고 적응력이 뛰어납니다.";
    } else {
      type = "균형형 연인";
      description =
        "당신은 성적인 관계에서 다양한 가치관을 균형있게 가지고 있는 타입입니다. 상황과 상대방에 따라 유연하게 대처할 수 있으며, 감정적 연결과 물리적 만족을 모두 중요하게 생각합니다. 이해심이 많고 적응력이 뛰어나 다양한 파트너와 조화롭게 관계를 발전시킬 수 있습니다.";
    }

    setPersonalityType(type);
    setPersonalityDescription(description);
    setShowResult(true);
    saveTestResult(type);
  };

  const saveTestResult = async (type: string) => {
    if (!user) return;

    try {
      setIsLoading(true);

      // 테스트 결과 저장
      const { error } = await supabase.from("sexy_test_results").insert({
        user_id: user.id,
        user_name: user.user_metadata?.name || user.email,
        answers: answers,
        personality_type: type,
      });

      if (error) {
        console.error("Error saving test result:", error);
      } else {
        // 매칭 결과 찾기
        findMatches(answers);
      }
    } catch (error) {
      console.error("Error saving test result:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const findMatches = async (userAnswers?: number[]) => {
    if (!user) return;

    const answersToUse = userAnswers || answers;

    try {
      // 다른 사용자들의 테스트 결과 가져오기
      const { data: otherResults, error } = await supabase
        .from("sexy_test_results")
        .select("*")
        .neq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error || !otherResults) return;

      // 매칭 점수 계산
      const matches: MatchResult[] = otherResults.map((result: TestResult) => {
        let commonAnswers = 0;
        for (
          let i = 0;
          i < Math.min(answersToUse.length, result.answers.length);
          i++
        ) {
          if (answersToUse[i] === result.answers[i]) {
            commonAnswers++;
          }
        }

        const matchScore = Math.round((commonAnswers / questions.length) * 100);

        return {
          user_name: result.user_name,
          match_score: matchScore,
          common_answers: commonAnswers,
        };
      });

      // 매칭 점수순으로 정렬
      matches.sort((a, b) => b.match_score - a.match_score);
      setMatchResults(matches.slice(0, 5)); // 상위 5명만 표시
    } catch (error) {
      console.error("Error finding matches:", error);
    }
  };

  const restartQuiz = async () => {
    if (!user) return;

    try {
      // 현재 사용자의 모든 테스트 결과 삭제
      const { error } = await supabase
        .from("sexy_test_results")
        .delete()
        .eq("user_id", user.id);

      if (error) {
        console.error("Error deleting test results:", error);
        alert("테스트 결과 삭제 중 오류가 발생했습니다.");
        return;
      }

      // 상태 초기화
      setCurrentQuestion(0);
      setSelectedAnswer(null);
      setAnswers([]);
      setShowResult(false);
      setIsAnswered(false);
      setTimeLeft(30);
      setPersonalityType("");
      setPersonalityDescription("");
      setMatchResults([]);
    } catch (error) {
      console.error("Error restarting quiz:", error);
      alert("테스트 재시작 중 오류가 발생했습니다.");
    }
  };

  // 로딩 중이거나 기존 결과 확인 중인 경우
  if (isCheckingExistingResult || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <Flame className="mx-auto mb-4 w-12 h-12 text-primary-600" />
            <div className="mx-auto w-12 h-12 rounded-full border-b-2 animate-spin border-primary-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              {isCheckingExistingResult
                ? "기존 결과를 확인하고 있습니다..."
                : "결과를 분석하고 있습니다..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (showResult) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="px-4 py-8 mx-auto max-w-4xl sm:px-6 lg:px-8">
          {/* 헤더 */}
          <div className="mb-8 text-center">
            <Link
              href="/dadalgame"
              className="inline-flex items-center mb-4 text-sm text-gray-600 transition-colors duration-200 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
            >
              <ArrowLeft className="mr-2 w-4 h-4" />
              게임 목록으로 돌아가기
            </Link>
            <div className="flex justify-center items-center mb-4">
              <Flame className="w-12 h-12 text-primary-600" />
            </div>
            <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
              성적 성향 테스트 결과
            </h1>
          </div>

          <div className="space-y-6">
            {/* 성격 유형 결과 */}
            <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
              <div className="mb-6 text-center">
                <div className="mb-4 text-4xl font-bold text-primary-600">
                  {personalityType}
                </div>
                <div className="text-lg text-gray-600 dark:text-gray-400">
                  당신의 성적 성향 유형
                </div>
              </div>
              <p className="leading-relaxed text-gray-700 dark:text-gray-300">
                {personalityDescription}
              </p>
            </div>

            {/* 성적 성향 랭킹 */}
            {matchResults.length > 0 && (
              <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
                <div className="flex items-center mb-6">
                  <Trophy className="mr-2 w-6 h-6 text-yellow-500" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    성적 성향이 잘 맞는 사람 랭킹
                  </h2>
                </div>

                <div className="space-y-3">
                  {matchResults.map((match, index) => (
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
                            {match.user_name}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          답변 일치:
                        </div>
                        <div className="text-lg font-bold text-primary-600">
                          {match.match_score}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {matchResults.length > 0 && (
                  <div className="p-4 mt-6 bg-blue-50 rounded-lg dark:bg-blue-900/20">
                    <div className="flex items-center">
                      <Star className="mr-2 w-5 h-5 text-blue-600" />
                      <span className="font-medium text-blue-900 dark:text-blue-300">
                        🎉 {matchResults[0].user_name}님과{" "}
                        {matchResults[0].match_score}% 일치합니다!
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 버튼 */}
            <div className="flex space-x-4">
              <button
                onClick={restartQuiz}
                className="flex-1 px-6 py-3 text-white rounded-md transition-colors duration-200 bg-primary-600 hover:bg-primary-700"
              >
                테스트 다시 하기
              </button>
              <Link
                href="/dadalgame"
                className="flex-1 px-6 py-3 text-center text-gray-700 bg-gray-100 rounded-md transition-colors duration-200 hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
              >
                다른 게임
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 기존 결과 확인이 완료되지 않았으면 아무것도 렌더링하지 않음
  if (isCheckingExistingResult) {
    return null;
  }

  const question = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="px-4 py-8 mx-auto max-w-2xl sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="mb-8">
          <Link
            href="/dadalgame"
            className="inline-flex items-center mb-4 text-sm text-gray-600 transition-colors duration-200 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            게임 목록으로 돌아가기
          </Link>

          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              <Flame className="w-6 h-6 text-primary-600" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                성적 성향 테스트
              </h1>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
              <span>
                문제 {currentQuestion + 1}/{questions.length}
              </span>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{timeLeft}초</span>
              </div>
            </div>
          </div>

          {/* 진행률 바 */}
          <div className="mb-6 w-full h-2 bg-gray-200 rounded-full dark:bg-gray-700">
            <div
              className="h-2 rounded-full transition-all duration-300 bg-primary-600"
              style={{
                width: `${((currentQuestion + 1) / questions.length) * 100}%`,
              }}
            ></div>
          </div>
        </div>

        {/* 문제 */}
        <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
          <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
            {question.question}
          </h2>

          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                className={`w-full p-4 text-left rounded-lg border transition-all duration-200 ${
                  selectedAnswer === index
                    ? "bg-primary-100 border-primary-500 text-primary-800 dark:bg-primary-900/20 dark:border-primary-400 dark:text-primary-300"
                    : "bg-gray-50 border-gray-200 text-gray-900 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                } cursor-pointer`}
              >
                <div className="flex justify-between items-center">
                  <span>{option}</span>
                  {selectedAnswer === index && (
                    <div className="flex justify-center items-center w-5 h-5 rounded-full bg-primary-600">
                      <span className="text-xs font-bold text-white">✓</span>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* 다음 버튼 */}
          {isAnswered && (
            <div className="mt-6 text-center">
              <button
                onClick={nextQuestion}
                className="px-6 py-2 text-white rounded-md transition-colors duration-200 bg-primary-600 hover:bg-primary-700"
              >
                {currentQuestion < questions.length - 1
                  ? "다음 문제"
                  : "결과 보기"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
