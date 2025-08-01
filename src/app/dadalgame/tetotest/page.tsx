"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Trophy, Clock, Star, Shield } from "lucide-react";

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
    question: "갈등 상황에서 어떻게 대처하시나요?",
    options: [
      "직접적으로 맞서서 해결",
      "대화로 원만히 해결",
      "시간을 두고 생각",
      "회피하고 넘어감",
    ],
  },
  {
    id: 2,
    question: "감정 표현에 대해 어떻게 생각하시나요?",
    options: [
      "솔직하게 표현하는 것이 좋음",
      "적절히 조절해서 표현",
      "차분하게 표현",
      "감정을 숨기는 것이 좋음",
    ],
  },
  {
    id: 3,
    question: "의사결정을 할 때 어떤 방식을 선호하시나요?",
    options: [
      "빠르고 확실하게 결정",
      "신중하게 분석 후 결정",
      "다른 사람과 상의 후 결정",
      "직감적으로 결정",
    ],
  },
  {
    id: 4,
    question: "스트레스 해소 방법은?",
    options: [
      "운동이나 활동적인 것",
      "음악이나 예술 활동",
      "친구와 대화",
      "혼자만의 시간",
    ],
  },
  {
    id: 5,
    question: "새로운 도전에 대해 어떻게 생각하시나요?",
    options: [
      "즉시 도전하는 것이 좋음",
      "준비를 철저히 한 후 도전",
      "조금씩 천천히 도전",
      "안전한 것부터 시작",
    ],
  },
  {
    id: 6,
    question: "관계에서 어떤 역할을 선호하시나요?",
    options: [
      "보호하고 이끄는 역할",
      "서로 돕고 협력하는 역할",
      "상대방을 배려하는 역할",
      "자유롭고 독립적인 역할",
    ],
  },
  {
    id: 7,
    question: "문제 해결 방식은?",
    options: [
      "논리적으로 분석해서 해결",
      "직관적으로 해결",
      "다른 사람과 협력해서 해결",
      "시간을 두고 천천히 해결",
    ],
  },
  {
    id: 8,
    question: "일상생활에서 가장 중요하게 생각하는 것은?",
    options: [
      "목표 달성과 성취",
      "조화와 균형",
      "안정과 평온",
      "자유와 창의성",
    ],
  },
  {
    id: 9,
    question: "의사소통 스타일은?",
    options: [
      "직설적이고 명확하게",
      "부드럽고 이해하기 쉽게",
      "차분하고 신중하게",
      "유연하고 적응적으로",
    ],
  },
  {
    id: 10,
    question: "리더십에 대해 어떻게 생각하시나요?",
    options: [
      "강력한 리더십이 필요",
      "협력적인 리더십이 좋음",
      "상대방을 배려하는 리더십",
      "자유롭게 하는 리더십",
    ],
  },
  {
    id: 11,
    question: "갈등 해결 방식은?",
    options: [
      "직접 대화로 해결",
      "중재자를 통한 해결",
      "시간을 두고 해결",
      "자연스럽게 해결되기를 기다림",
    ],
  },
  {
    id: 12,
    question: "감정적 위기 상황에서 어떻게 행동하시나요?",
    options: [
      "즉시 행동으로 해결",
      "차분하게 상황 파악",
      "다른 사람과 상의",
      "혼자 해결하려고 함",
    ],
  },
  {
    id: 13,
    question: "새로운 환경에 적응하는 방식은?",
    options: [
      "적극적으로 적응",
      "관찰하고 천천히 적응",
      "다른 사람의 도움을 받아 적응",
      "자연스럽게 적응",
    ],
  },
  {
    id: 14,
    question: "성공에 대한 정의는?",
    options: ["목표 달성과 성취", "행복과 만족", "안정과 평화", "자유와 성장"],
  },
  {
    id: 15,
    question: "미래에 대한 계획은?",
    options: [
      "구체적이고 명확한 계획",
      "유연하고 적응적인 계획",
      "안정적인 계획",
      "자유로운 계획",
    ],
  },
];

export default function TetoTest() {
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
        .from("teto_test_results")
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
      case "강한 테토":
        return "당신은 전형적인 남성다운 성향을 가진 테토입니다. 강인하고 의지가 강하며, 도전을 즐기고 리더십을 발휘하는 것을 좋아합니다. 직설적이고 논리적인 사고를 하며, 목표 지향적이고 성취욕이 강합니다. 보호 본능이 강하고 책임감이 많아 주변 사람들을 이끄는 역할을 잘 수행합니다.";
      case "부드러운 테토":
        return "당신은 부드러운 남성다운 성향을 가진 테토입니다. 강인함과 부드러움이 조화를 이루며, 논리적이면서도 감정적 이해력이 뛰어납니다. 협력적이고 배려심이 많아 다른 사람들과 조화롭게 일하는 것을 선호합니다. 안정적이고 신뢰할 수 있는 파트너가 될 수 있으며, 균형잡힌 시각으로 문제를 해결합니다.";
      case "강한 에겐":
        return "당신은 강한 여성다운 성향을 가진 에겐입니다. 직감적이고 감정적이며, 창의적이고 예술적인 감각이 뛰어납니다. 다른 사람의 감정을 잘 이해하고 공감하는 능력이 있으며, 따뜻하고 배려심이 많습니다. 독립적이고 자유로운 성향을 가지고 있어 자신만의 방식으로 문제를 해결하는 것을 선호합니다.";
      case "부드러운 에겐":
        return "당신은 부드러운 여성다운 성향을 가진 에겐입니다. 평화롭고 조화를 추구하며, 다른 사람들과의 관계를 중요하게 생각합니다. 인내심이 많고 이해심이 깊어 갈등 상황에서 중재자 역할을 잘 수행합니다. 안정적이고 예측 가능한 환경을 선호하며, 주변 사람들에게 안정감을 제공합니다.";
      case "균형형":
        return "당신은 남성다운 성향과 여성다운 성향이 균형있게 조화를 이루는 타입입니다. 상황에 따라 유연하게 대처할 수 있으며, 논리적 사고와 직감적 판단을 모두 활용합니다. 다양한 관점에서 문제를 바라볼 수 있어 창의적인 해결책을 제시할 수 있으며, 다양한 성향의 사람들과 잘 어울립니다.";
      default:
        return "당신의 성향을 분석한 결과입니다.";
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
    // 선택지별 성향 분석 (0: 강한 테토, 1: 부드러운 테토, 2: 강한 에겐, 3: 부드러운 에겐)
    const strongTetoCount = answers.filter((a) => a === 0).length;
    const softTetoCount = answers.filter((a) => a === 1).length;
    const strongEgenCount = answers.filter((a) => a === 2).length;
    const softEgenCount = answers.filter((a) => a === 3).length;

    let type = "";
    let description = "";

    if (strongTetoCount >= 6) {
      type = "강한 테토";
      description =
        "당신은 전형적인 남성다운 성향을 가진 테토입니다. 강인하고 의지가 강하며, 도전을 즐기고 리더십을 발휘하는 것을 좋아합니다. 직설적이고 논리적인 사고를 하며, 목표 지향적이고 성취욕이 강합니다. 보호 본능이 강하고 책임감이 많아 주변 사람들을 이끄는 역할을 잘 수행합니다.";
    } else if (softTetoCount >= 6) {
      type = "부드러운 테토";
      description =
        "당신은 부드러운 남성다운 성향을 가진 테토입니다. 강인함과 부드러움이 조화를 이루며, 논리적이면서도 감정적 이해력이 뛰어납니다. 협력적이고 배려심이 많아 다른 사람들과 조화롭게 일하는 것을 선호합니다. 안정적이고 신뢰할 수 있는 파트너가 될 수 있으며, 균형잡힌 시각으로 문제를 해결합니다.";
    } else if (strongEgenCount >= 6) {
      type = "강한 에겐";
      description =
        "당신은 강한 여성다운 성향을 가진 에겐입니다. 직감적이고 감정적이며, 창의적이고 예술적인 감각이 뛰어납니다. 다른 사람의 감정을 잘 이해하고 공감하는 능력이 있으며, 따뜻하고 배려심이 많습니다. 독립적이고 자유로운 성향을 가지고 있어 자신만의 방식으로 문제를 해결하는 것을 선호합니다.";
    } else if (softEgenCount >= 6) {
      type = "부드러운 에겐";
      description =
        "당신은 부드러운 여성다운 성향을 가진 에겐입니다. 평화롭고 조화를 추구하며, 다른 사람들과의 관계를 중요하게 생각합니다. 인내심이 많고 이해심이 깊어 갈등 상황에서 중재자 역할을 잘 수행합니다. 안정적이고 예측 가능한 환경을 선호하며, 주변 사람들에게 안정감을 제공합니다.";
    } else {
      type = "균형형";
      description =
        "당신은 남성다운 성향과 여성다운 성향이 균형있게 조화를 이루는 타입입니다. 상황에 따라 유연하게 대처할 수 있으며, 논리적 사고와 직감적 판단을 모두 활용합니다. 다양한 관점에서 문제를 바라볼 수 있어 창의적인 해결책을 제시할 수 있으며, 다양한 성향의 사람들과 잘 어울립니다.";
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
      const { error } = await supabase.from("teto_test_results").insert({
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
        .from("teto_test_results")
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
        .from("teto_test_results")
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
            <Shield className="mx-auto mb-4 w-12 h-12 text-primary-600" />
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
              <Shield className="w-12 h-12 text-primary-600" />
            </div>
            <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
              테토 에겐 테스트 결과
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
                  당신의 성향 유형
                </div>
              </div>
              <p className="leading-relaxed text-gray-700 dark:text-gray-300">
                {personalityDescription}
              </p>
            </div>

            {/* 성향 랭킹 */}
            {matchResults.length > 0 && (
              <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
                <div className="flex items-center mb-6">
                  <Trophy className="mr-2 w-6 h-6 text-yellow-500" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    성향이 잘 맞는 사람 랭킹
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
              <Shield className="w-6 h-6 text-primary-600" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                테토 에겐 테스트
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
