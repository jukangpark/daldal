"use client";

import Link from "next/link";
import { ArrowLeft, Palette, Search, Trophy, Users, Clock } from "lucide-react";

export default function CatchMindPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <div className="px-4 py-6 mx-auto max-w-4xl sm:px-6 lg:px-8">
          <div className="flex items-center mb-4">
            <Link
              href="/dadalgame"
              className="flex items-center text-gray-600 transition-colors dark:text-white hover:text-gray-900 dark:hover:text-gray-200"
            >
              <ArrowLeft className="mr-2 w-5 h-5" />
              뒤로가기
            </Link>
          </div>
          <div className="text-center">
            <div className="flex justify-center items-center mb-4">
              <Palette className="w-12 h-12 text-primary-600" />
            </div>
            <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
              내 그림을 맞춰라!
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              그림을 그리고 맞춰보세요!
            </p>
          </div>
        </div>
      </div>

      {/* 게임 모드 선택 */}
      <div className="px-4 py-8 mx-auto max-w-4xl sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2">
          {/* 그림 그리기 모드 */}
          <Link
            href="/dadalgame/catch-mind/draw"
            className="block p-8 bg-white rounded-lg shadow-md transition-all duration-200 hover:shadow-lg dark:bg-gray-800 hover:scale-105"
          >
            <div className="text-center">
              <div className="flex justify-center items-center mb-4">
                <div className="flex justify-center items-center w-16 h-16 bg-blue-100 rounded-full dark:bg-blue-900/20">
                  <Palette className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <h3 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                그림 그리기
              </h3>
              <p className="mb-6 text-gray-600 dark:text-gray-400">
                제시어를 받고 그림을 그려서 다른 사람들이 맞출 수 있도록
                해보세요!
              </p>
              <div className="flex justify-center items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center">
                  <Users className="mr-1 w-4 h-4" />
                  1명
                </div>
                <div className="flex items-center">
                  <Clock className="mr-1 w-4 h-4" />
                  자유 시간
                </div>
              </div>
            </div>
          </Link>

          {/* 그림 맞추기 모드 */}
          <Link
            href="/dadalgame/catch-mind/guess"
            className="block p-8 bg-white rounded-lg shadow-md transition-all duration-200 hover:shadow-lg dark:bg-gray-800 hover:scale-105"
          >
            <div className="text-center">
              <div className="flex justify-center items-center mb-4">
                <div className="flex justify-center items-center w-16 h-16 bg-green-100 rounded-full dark:bg-green-900/20">
                  <Search className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <h3 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                그림 맞추기
              </h3>
              <p className="mb-6 text-gray-600 dark:text-gray-400">
                다른 사람들이 그린 그림을 보고 제시어를 맞춰보세요!
              </p>
              <div className="flex justify-center items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center">
                  <Trophy className="mr-1 w-4 h-4" />
                  여러명
                </div>
                <div className="flex items-center">
                  <Clock className="mr-1 w-4 h-4" />
                  5문제
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* 게임 규칙 */}
        <div className="p-6 mt-12 bg-white rounded-lg shadow-md dark:bg-gray-800">
          <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
            게임 규칙
          </h3>
          <div className="space-y-3 text-gray-600 dark:text-gray-400">
            <div className="flex items-start">
              <span className="flex flex-shrink-0 justify-center items-center mr-3 w-6 h-6 text-sm font-medium text-white rounded-full bg-primary-600">
                1
              </span>
              <p>그림 그리기: 제시어를 받고 그림을 그려서 저장합니다.</p>
            </div>
            <div className="flex items-start">
              <span className="flex flex-shrink-0 justify-center items-center mr-3 w-6 h-6 text-sm font-medium text-white rounded-full bg-primary-600">
                2
              </span>
              <p>
                그림 맞추기: 다른 사람들이 그린 그림을 보고 제시어를 맞춥니다.
              </p>
            </div>
            <div className="flex items-start">
              <span className="flex flex-shrink-0 justify-center items-center mr-3 w-6 h-6 text-sm font-medium text-white rounded-full bg-primary-600">
                3
              </span>
              <p>한 문제당 3번의 기회가 있으며, 맞추면 20점을 획득합니다.</p>
            </div>
            <div className="flex items-start">
              <span className="flex flex-shrink-0 justify-center items-center mr-3 w-6 h-6 text-sm font-medium text-white rounded-full bg-primary-600">
                4
              </span>
              <p>총 5문제를 풀어 최종 점수를 확인하고 랭킹을 비교해보세요!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
