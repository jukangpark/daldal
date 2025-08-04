"use client";

import { useState } from "react";
import { BookOpen, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { rules, categoryInfo } from "@/app/constants";

export default function RulesPage() {
  const [selectedCategory, setSelectedCategory] = useState<
    "all" | keyof typeof categoryInfo
  >("all");
  const [showImportantOnly, setShowImportantOnly] = useState(false);

  const filteredRules = rules.filter((rule) => {
    const matchesCategory =
      selectedCategory === "all" || rule.category === selectedCategory;
    const matchesImportance = !showImportantOnly || rule.important;
    return matchesCategory && matchesImportance;
  });

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">
          모임회칙
        </h1>
        <p className="mx-auto max-w-2xl text-xl text-gray-600 dark:text-gray-300">
          달달 모임의 모든 회원이 지켜야 할 규칙들입니다
        </p>
      </div>

      {/* 필터 섹션 */}
      <div className="mb-8 space-y-6">
        {/* 카테고리 필터 */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            카테고리별 보기
          </h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === "all"
                  ? "bg-primary-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>전체</span>
            </button>
            {Object.entries(categoryInfo).map(([key, info]) => {
              const Icon = info.icon;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key as any)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === key
                      ? "bg-primary-600 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{info.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 중요도 필터 */}
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showImportantOnly}
              onChange={(e) => setShowImportantOnly(e.target.checked)}
              className="bg-white rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500 dark:bg-gray-800"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              중요 규칙만 보기
            </span>
          </label>
        </div>
      </div>

      {/* 회칙 목록 */}
      <div className="space-y-6">
        {filteredRules.map((rule) => {
          const category = categoryInfo[rule.category];
          const Icon = category.icon;

          return (
            <div
              key={rule.id}
              className={`card ${
                rule.important
                  ? "border-l-4 border-l-red-500 delay-200 animate-fade-in-up"
                  : ""
              }`}
            >
              <div className="flex items-start space-x-4">
                <div className={`flex-shrink-0 ${category.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  {/* 제목과 조항 - 제목은 왼쪽, 조항은 오른쪽 */}
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {rule.title}
                    </h3>
                    <span className="text-sm font-bold text-primary-600">
                      {rule.article}
                    </span>
                  </div>

                  {/* 뱃지들 - 모바일에서 세로로 배치 */}
                  <div className="flex flex-wrap gap-2 items-center mb-3">
                    {rule.important && (
                      <span className="flex items-center px-2 py-1 space-x-1 text-xs text-red-700 bg-red-100 rounded-full dark:bg-red-900/30 dark:text-red-300">
                        <AlertCircle className="w-3 h-3" />
                        <span>중요</span>
                      </span>
                    )}
                    <span
                      className={`px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded-full dark:bg-gray-700 dark:text-gray-300`}
                    >
                      {category.label}
                    </span>
                  </div>

                  <p className="leading-relaxed text-gray-600 dark:text-gray-300">
                    {rule.content}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredRules.length === 0 && (
        <div className="py-12 text-center">
          <BookOpen className="mx-auto mb-4 w-12 h-12 text-gray-300 dark:text-gray-600" />
          <p className="text-lg text-gray-500 dark:text-gray-400">
            선택한 조건에 맞는 회칙이 없습니다.
          </p>
        </div>
      )}

      {/* 회칙 개정 이력 */}
      <div className="p-6 mt-12 bg-gray-50 rounded-lg dark:bg-gray-800">
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          회칙 개정 이력
        </h3>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
          <div>2025.1.28. (회칙 개설)</div>
          <div>2025.3.16. (정모 삭제 및 인원 무제한 모임 개설)</div>
          <div>2025.4.9. (취미 모임 운영, 외출 조항 신설)</div>
          <div>2025.4.16. (신입 단톡 운영 조항 추가)</div>
          <div>
            2025.5.7. (재가입 시 단일모임 규정, 취미모임 운영자 단일 모임 규정
            추가)
          </div>
          <div>2025.5.18. (가입 가능 연령 수정)</div>
          <div>2025.6.17. (모임 인원 사전 확보 제한 2-13, 2-14 추가)</div>
          <div>
            2025.7.8. (오프라인 모임 규칙 완화 및 게스트 관련 조항 수정)
          </div>
          <div>2025.7.23. (재가입시 회비 즉시 납부 규정 추가)</div>
        </div>
      </div>

      {/* 회칙 동의 섹션 */}
      <div className="p-6 mt-8 rounded-lg bg-primary-50 dark:bg-primary-900/20">
        <div className="text-center">
          <CheckCircle className="mx-auto mb-4 w-12 h-12 text-primary-600" />
          <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
            회칙 동의
          </h3>
          <p className="mb-4 text-gray-600 dark:text-gray-300">
            달달 모임에 가입하시면 위의 모든 회칙에 동의하는 것으로 간주됩니다.
          </p>
          <div className="flex justify-center items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            <Clock className="w-4 h-4" />
            <span>최종 업데이트: 2025년 7월 23일</span>
          </div>
        </div>
      </div>
    </div>
  );
}
