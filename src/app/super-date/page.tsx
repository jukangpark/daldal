"use client";

import { useState, useEffect } from "react";
import {
  Loader2,
  Gift,
  Heart,
  Star,
  Calendar,
  Users,
  ArrowRight,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function SuperDatePage() {
  const router = useRouter();
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    // 페이지 로드 후 애니메이션 시작
    const timer = setTimeout(() => {
      setAnimateIn(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="mx-auto max-w-6xl">
      {/* 헤더 섹션 */}
      <div
        className={`mb-12 text-center transition-all duration-1000 ease-out ${
          animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <div className="flex justify-center items-center mb-4">
          <Gift
            className={`mr-3 w-12 h-12 text-pink-500 transition-all duration-1000 delay-300`}
          />
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            슈퍼 데이트 이벤트
          </h1>
        </div>
        <p className="mx-auto max-w-2xl text-xl text-gray-600 dark:text-gray-300">
          첫 번째로 연결된 커플에게 특별한 선물을 드립니다!
        </p>
      </div>

      {/* 메인 이벤트 카드 */}
      <div
        className={`p-8 mb-12 bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl border border-pink-200 dark:from-pink-900/20 dark:to-purple-900/20 dark:border-pink-700 transition-all duration-1000 delay-200 ease-out ${
          animateIn
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-12"
        }`}
      >
        <div className="mb-8 text-center">
          <div className="flex justify-center items-center mb-4">
            <Heart
              className={`w-16 h-16 text-pink-500 transition-all duration-1000 delay-500 ${
                animateIn ? "animate-pulse scale-110" : "scale-100"
              }`}
            />
          </div>
          <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
            매칭자 이벤트
          </h2>
          <div className="mb-6 text-lg text-gray-700 dark:text-gray-300">
            서로를 선택한 첫 번째 커플에게
            <br />
            <div className="font-bold text-pink-600 dark:text-pink-400">
              🎬 CGV 커플 콤보 기프티콘 🍿
            </div>
            을 선물로 드립니다!
          </div>
        </div>

        {/* 이벤트 상세 정보 */}
        <div className="grid gap-6 mb-8 md:grid-cols-3">
          <div
            className={`p-4 text-center bg-white rounded-lg shadow-sm dark:bg-gray-800 transition-all duration-700 delay-400 ease-out ${
              animateIn
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <Calendar className="mx-auto mb-2 w-8 h-8 text-blue-500" />
            <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">
              이벤트 기간
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              2025년 8월 30일까지
            </p>
          </div>
          <div
            className={`p-4 text-center bg-white rounded-lg shadow-sm dark:bg-gray-800 transition-all duration-700 delay-500 ease-out ${
              animateIn
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <Users className="mx-auto mb-2 w-8 h-8 text-green-500" />
            <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">
              참여 방법
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              서로 슈퍼 데이트 신청
            </p>
          </div>
          <div
            className={`p-4 text-center bg-white rounded-lg shadow-sm dark:bg-gray-800 transition-all duration-700 delay-600 ease-out ${
              animateIn
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <Star className="mx-auto mb-2 w-8 h-8 text-yellow-500" />
            <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">
              당첨자
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              첫 번째 매칭 커플
            </p>
          </div>
        </div>

        {/* 기프티콘 상세 정보 */}
        <div
          className={`p-6 bg-white rounded-lg shadow-sm dark:bg-gray-800 transition-all duration-800 delay-700 ease-out ${
            animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <h3 className="mb-4 text-xl font-bold text-center text-gray-900 dark:text-white">
            🎬 CGV 커플 콤보 구성 🍿
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center">
                <span className="mr-3 w-2 h-2 bg-pink-500 rounded-full"></span>
                <span className="text-gray-700 dark:text-gray-300">
                  영화 티켓 2매
                </span>
              </div>
              <div className="flex items-center">
                <span className="mr-3 w-2 h-2 bg-pink-500 rounded-full"></span>
                <span className="text-gray-700 dark:text-gray-300">
                  팝콘 + 음료 세트
                </span>
              </div>
              <div className="flex items-center">
                <span className="mr-3 w-2 h-2 bg-pink-500 rounded-full"></span>
                <span className="text-gray-700 dark:text-gray-300">
                  스낵 메뉴 추가
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center">
                <span className="mr-3 w-2 h-2 bg-purple-500 rounded-full"></span>
                <span className="text-gray-700 dark:text-gray-300">
                  전국 CGV 사용 가능
                </span>
              </div>
              <div className="flex items-center">
                <span className="mr-3 w-2 h-2 bg-purple-500 rounded-full"></span>
                <span className="text-gray-700 dark:text-gray-300">
                  팝콘 먹으면 오늘 부터 1일 ♥️
                </span>
              </div>
              <div className="flex items-center">
                <span className="mr-3 w-2 h-2 bg-purple-500 rounded-full"></span>
                <span className="text-gray-700 dark:text-gray-300">
                  온라인 예매 가능
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 슈퍼 데이트 신청 섹션 */}
      <div
        className={`p-8 mb-12 bg-white rounded-2xl shadow-lg dark:bg-gray-800 transition-all duration-1000 delay-800 ease-out ${
          animateIn
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-12"
        }`}
      >
        <div className="mb-8 text-center">
          <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
            슈퍼 데이트 신청하기
          </h2>
          <p className="mb-4 text-gray-600 dark:text-gray-300">
            마음에 드는 상대방에게 진심 어린 메시지와 함께 특별한 데이트를
            제안해보세요
          </p>
          <div className="inline-flex items-center px-4 py-2 text-sm font-medium text-pink-700 bg-pink-100 rounded-full dark:bg-pink-900/30 dark:text-pink-300">
            <Gift className="mr-2 w-4 h-4" />
            슈퍼 데이트 신청권: 2개
          </div>
        </div>

        {/* 자소설 목록으로 이동 버튼 */}
        <div className="mx-auto max-w-2xl text-center">
          <button
            onClick={() => router.push("/introductions")}
            className="flex justify-center items-center px-8 py-4 mx-auto font-medium text-white bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg transition-colors hover:from-pink-600 hover:to-purple-600"
          >
            <Heart className="mr-2 w-6 h-6" />
            슈퍼 데이트 신청하기
            <ArrowRight className="ml-2 w-6 h-6" />
          </button>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            자소설 목록에서 마음에 드는 상대방을 찾아 슈퍼 데이트를 신청하세요!
          </p>
        </div>
      </div>

      {/* 참여 방법 안내 */}
      <div
        className={`p-8 mb-12 bg-gray-50 rounded-2xl dark:bg-gray-900 transition-all duration-1000 delay-900 ease-out ${
          animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <h2 className="mb-6 text-2xl font-bold text-center text-gray-900 dark:text-white">
          참여 방법
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          <div
            className={`text-center transition-all duration-700 delay-1100 ease-out ${
              animateIn
                ? "opacity-100 scale-100 translate-y-0"
                : "opacity-0 scale-95 translate-y-8"
            }`}
          >
            <div className="flex justify-center items-center mx-auto mb-4 w-16 h-16 bg-pink-100 rounded-full dark:bg-pink-900/30">
              <span className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                1
              </span>
            </div>
            <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
              슈퍼 데이트 신청
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              마음에 드는 상대방에게 슈퍼 데이트를 신청하세요
            </p>
          </div>
          <div
            className={`text-center transition-all duration-700 delay-1100 ease-out ${
              animateIn
                ? "opacity-100 scale-100 translate-y-0"
                : "opacity-0 scale-95 translate-y-8"
            }`}
          >
            <div className="flex justify-center items-center mx-auto mb-4 w-16 h-16 bg-purple-100 rounded-full dark:bg-purple-900/30">
              <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                2
              </span>
            </div>
            <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
              서로 매칭
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              상대방도 당신을 선택하면 매칭이 완료됩니다
            </p>
          </div>
          <div
            className={`text-center transition-all duration-700 delay-1100 ease-out ${
              animateIn
                ? "opacity-100 scale-100 translate-y-0"
                : "opacity-0 scale-95 translate-y-8"
            }`}
          >
            <div className="flex justify-center items-center mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full dark:bg-green-900/30">
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                3
              </span>
            </div>
            <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
              기프티콘 수령
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              첫 번째 매칭 커플에게 CGV 기프티콘을 드립니다
            </p>
          </div>
        </div>
      </div>

      {/* 주의사항 */}
      <div
        className={`p-6 bg-yellow-50 rounded-lg border border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-700 transition-all duration-1000 delay-1300 ease-out ${
          animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <h3 className="mb-2 font-semibold text-yellow-800 dark:text-yellow-200">
          ⚠️ 주의사항
        </h3>
        <ul className="space-y-1 text-sm text-yellow-700 dark:text-yellow-300">
          <li>• 슈퍼 데이트 신청은 1명당 2명에게만 사용가능합니다</li>
          <li>• 자신에게는 신청할 수 없습니다</li>
          <li>• 기프티콘은 첫 번째 매칭 커플에게만 제공됩니다</li>
          <li>• 매칭 후 개인정보를 통해 기프티콘을 전달합니다</li>
          <li>• 로그인하고 자소설 작성한 유저만 슈퍼 데이트 신청 가능합니다</li>
        </ul>
      </div>
    </div>
  );
}
