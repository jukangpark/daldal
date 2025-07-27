"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
  Heart,
  Trophy,
  ArrowLeft,
  Construction,
  Clock,
  Users,
  Star,
} from "lucide-react";

export default function HonorVotePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // 로그인하지 않은 경우 홈으로 리다이렉트
  if (!loading && !user) {
    router.push("/");
    return null;
  }

  if (loading) {
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

  return (
    <div className="mx-auto max-w-4xl">
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
          <div className="flex justify-center items-center mb-4 animate-fade-in-up">
            <Heart className="mr-3 w-12 h-12 text-primary-600" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              익명 투표
            </h1>
          </div>
          <p className="text-xl text-gray-600 delay-200 dark:text-gray-300 animate-fade-in-up">
            이번 달 가장 인상 깊었던 회원에게 투표해주세요
          </p>
        </div>
      </div>

      {/* 개발중 알림 */}
      <div className="p-8 mb-8 bg-yellow-50 rounded-lg border border-yellow-200 delay-300 dark:bg-yellow-900/20 dark:border-yellow-700 animate-fade-in-up">
        <div className="text-center">
          <Construction className="mx-auto mb-4 w-16 h-16 text-yellow-600 dark:text-yellow-400" />
          <h2 className="mb-4 text-2xl font-bold text-yellow-800 dark:text-yellow-200">
            🚧 투표 시스템 개발중 🚧
          </h2>
          <p className="mb-6 text-lg text-yellow-700 dark:text-yellow-300">
            더 나은 투표 경험을 위해 열심히 개발하고 있습니다.
            <br />곧 만나뵙겠습니다!
          </p>

          {/* 개발 진행 상황 */}
          <div className="grid gap-6 mt-8 md:grid-cols-3 delay-400 animate-fade-in-up">
            <div className="p-4 bg-white rounded-lg border border-yellow-200 dark:bg-gray-800 dark:border-yellow-700">
              <div className="flex justify-center items-center mb-3">
                <Users className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                회원 목록
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                투표 대상 회원 목록 구성
              </p>
              <div className="mt-3 w-full h-2 bg-gray-200 rounded-full dark:bg-gray-700">
                <div
                  className="h-2 bg-green-500 rounded-full"
                  style={{ width: "90%" }}
                ></div>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                90% 완료
              </span>
            </div>

            <div className="p-4 bg-white rounded-lg border border-yellow-200 dark:bg-gray-800 dark:border-yellow-700">
              <div className="flex justify-center items-center mb-3">
                <Heart className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                투표 시스템
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                익명 투표 기능 구현
              </p>
              <div className="mt-3 w-full h-2 bg-gray-200 rounded-full dark:bg-gray-700">
                <div
                  className="h-2 bg-yellow-500 rounded-full"
                  style={{ width: "60%" }}
                ></div>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                60% 완료
              </span>
            </div>

            <div className="p-4 bg-white rounded-lg border border-yellow-200 dark:bg-gray-800 dark:border-yellow-700">
              <div className="flex justify-center items-center mb-3">
                <Trophy className="w-8 h-8 text-yellow-500" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                결과 집계
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                투표 결과 계산 및 표시
              </p>
              <div className="mt-3 w-full h-2 bg-gray-200 rounded-full dark:bg-gray-700">
                <div
                  className="h-2 bg-blue-500 rounded-full"
                  style={{ width: "40%" }}
                ></div>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                40% 완료
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 예상 기능 소개 */}
      <div className="p-6 rounded-lg delay-500 bg-primary-50 dark:bg-primary-900/20 animate-fade-in-up">
        <div className="text-center">
          <Star className="mx-auto mb-4 w-12 h-12 text-primary-600" />
          <h3 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
            🎯 투표 기능
          </h3>
          <div className="grid gap-4 text-left md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700 dark:text-gray-300">
                  완전 익명 투표
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700 dark:text-gray-300">
                  카테고리별 투표
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700 dark:text-gray-300">
                  실시간 결과 확인
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-gray-700 dark:text-gray-300">
                  월 1회 투표 기회
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-gray-700 dark:text-gray-300">
                  투표 이력 관리
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-gray-700 dark:text-gray-300">
                  공정한 집계 시스템
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 예상 출시일 */}
      <div className="p-6 mt-8 bg-gray-50 rounded-lg dark:bg-gray-800 delay-600 animate-fade-in-up">
        <div className="text-center">
          <Clock className="mx-auto mb-4 w-12 h-12 text-gray-600 dark:text-gray-400" />
          <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
            예상 출시일
          </h3>
          <p className="text-gray-600 dark:text-gray-300">2025년 8월 초 예정</p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            정확한 출시일은 추후 공지됩니다.
          </p>
        </div>
      </div>

      {/* 돌아가기 버튼 */}
      <div className="mt-8 text-center delay-700 animate-fade-in-up">
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
