"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Gamepad2,
  Heart,
  Users,
  Clock,
  Brain,
  Image,
  Zap,
  Magnet,
} from "lucide-react";

interface GameItem {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  href: string;
  difficulty: "쉬움" | "보통" | "어려움";
  players: string;
  duration: string;
  isNew?: boolean;
  isPopular?: boolean;
}

const games: GameItem[] = [
  {
    id: "love-quiz",
    title: "연애 가치관 테스트",
    description: "연애 가치관을 테스트 하고 나와 잘 맞는 사람을 찾아보아요!",
    icon: Brain,
    href: "/dadalgame/love-quiz",
    difficulty: "쉬움",
    players: "1명",
    duration: "3분 이내",
    isPopular: true,
  },
  {
    id: "sexy-quiz",
    title: "19금 성향 테스트",
    description: "19금 성향을 테스트 하고 나와 잘 맞는 사람을 찾아보아요!",
    icon: Heart,
    href: "/dadalgame/sexy-quiz",
    difficulty: "어려움",
    players: "1명",
    duration: "3분 이내",
    isPopular: true,
  },
  {
    id: "catch-mind",
    title: "캐치마인드",
    description: "내 그림을 맞춰봐!",
    icon: Image,
    href: "/dadalgame/catch-mind",
    difficulty: "보통",
    players: "1명",
    duration: "5분 이내",
    isPopular: true,
  },
  {
    id: "reaction-speed",
    title: "반응 속도 테스트",
    description: "당신의 반응 속도를 측정해보세요!",
    icon: Zap,
    href: "/dadalgame/reaction-speed",
    difficulty: "쉬움",
    players: "1명",
    duration: "2분 이내",
    isNew: true,
  },
  {
    id: "tetotest",
    title: "테토 vs 에겐 테스트",
    description: "테토인가 에겐인가 그것이 문제로다",
    icon: Magnet,
    href: "/dadalgame/tetotest",
    difficulty: "쉬움",
    players: "1명",
    duration: "2분 이내",
    isNew: true,
  },
];

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "쉬움":
      return "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20";
    case "보통":
      return "text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20";
    case "어려움":
      return "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20";
    default:
      return "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700";
  }
};

export default function DaldalGame() {
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("전체");
  const [selectedPlayers, setSelectedPlayers] = useState<string>("전체");

  const filteredGames = games.filter((game) => {
    const difficultyMatch =
      selectedDifficulty === "전체" || game.difficulty === selectedDifficulty;
    const playersMatch =
      selectedPlayers === "전체" || game.players.includes(selectedPlayers);
    return difficultyMatch && playersMatch;
  });

  const difficulties = ["전체", "쉬움", "보통", "어려움"];
  const playerOptions = [
    "전체",
    "1명",
    "2명",
    "3명",
    "4명",
    "6명",
    "8명",
    "10명",
    "12명",
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center items-center mb-4">
              <Gamepad2 className="w-12 h-12 text-primary-600" />
            </div>
            <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
              달달 게임
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              재미있는 게임으로 서로를 더 알아보세요!
            </p>
          </div>
        </div>
      </div>

      {/* 필터 섹션 */}
      <div className="bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <div className="px-4 py-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-4 justify-center items-center">
            {/* 난이도 필터 */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                난이도:
              </span>
              <div className="flex space-x-1">
                {difficulties.map((difficulty) => (
                  <button
                    key={difficulty}
                    onClick={() => setSelectedDifficulty(difficulty)}
                    className={`px-3 py-1 text-xs font-medium rounded-full transition-colors duration-200 ${
                      selectedDifficulty === difficulty
                        ? "bg-primary-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    }`}
                  >
                    {difficulty}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 게임 목록 */}
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {filteredGames.length === 0 ? (
          <div className="py-12 text-center">
            <Gamepad2 className="mx-auto mb-4 w-16 h-16 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
              조건에 맞는 게임이 없습니다
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              다른 필터를 선택해보세요.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredGames.map((game) => {
              const Icon = game.icon;
              return (
                <Link
                  key={game.id}
                  href={game.href}
                  className="block p-6 bg-white rounded-lg shadow-md transition-all duration-200 delay-200 group hover:shadow-lg dark:bg-gray-800 hover:scale-105 animate-fade-in-up"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex justify-center items-center w-12 h-12 rounded-lg bg-primary-100 group-hover:bg-primary-200 dark:bg-primary-900/20 dark:group-hover:bg-primary-900/40">
                        <Icon className="w-6 h-6 text-primary-600" />
                      </div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {game.title}
                        </h3>
                        {game.isNew && (
                          <span className="px-2 py-1 text-xs font-medium text-white bg-green-500 rounded-full">
                            NEW
                          </span>
                        )}
                        {game.isPopular && (
                          <span className="px-2 py-1 text-xs font-medium text-white bg-yellow-500 rounded-full">
                            인기
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="mb-4 text-gray-600 dark:text-gray-400">
                    {game.description}
                  </p>

                  <div className="flex flex-wrap gap-2 items-center">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(
                        game.difficulty
                      )}`}
                    >
                      {game.difficulty}
                    </span>
                    <span className="flex items-center px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full dark:text-gray-400 dark:bg-gray-700">
                      <Users className="mr-1 w-3 h-3" />
                      {game.players}
                    </span>
                    <span className="flex items-center px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full dark:text-gray-400 dark:bg-gray-700">
                      <Clock className="mr-1 w-3 h-3" />
                      {game.duration}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
