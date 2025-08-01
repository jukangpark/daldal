"use client";

import { useState } from "react";
import {
  BookOpen,
  CheckCircle,
  AlertCircle,
  Users,
  Heart,
  Clock,
  DollarSign,
  Calendar,
  UserCheck,
  UserX,
  MessageCircle,
} from "lucide-react";

interface Rule {
  id: number;
  title: string;
  content: string;
  category:
    | "fee"
    | "member"
    | "meeting"
    | "drinking"
    | "relationship"
    | "join"
    | "age"
    | "chat"
    | "hobby"
    | "leave"
    | "guest";
  important: boolean;
  article: string;
}

const rules: Rule[] = [
  {
    id: 1,
    title: "회비",
    content:
      "회원은 매월 2,000원의 회비를 납부하여야 한다.(매달 20일 벙1회 이상 참석자) 회비는 소모임 정기 결제 및 무제한 모임시 사용된다.",
    category: "fee",
    important: true,
    article: "제1조",
  },
  {
    id: 2,
    title: "신입회원 의무",
    content:
      "신입회원은 가입 후 2주 이내에 오프라인 모임에 참석하여야 한다. 정당한 사유가 있는 경우 운영진에게 사전 통지하여야 한다. 신입회원의 첫 번째 모임(이하 '첫 벙')은 선불로 결제 한다.",
    category: "member",
    important: true,
    article: "제2조 제1항",
  },
  {
    id: 3,
    title: "신입단톡 운영",
    content:
      "달달 본 단체채팅방의 채팅량이 많아 신입회원의 초기 적응이 어려운 점을 고려하여, 신입회원 전용 단체채팅방(이하 '신입단톡')을 운영한다. 신입회원은 가입 시 신입단톡에 우선 입장하며, 오프라인 모임(벙)에 1회 이상 참석한 이후 달달 본 단톡방 입장이 가능하다.",
    category: "member",
    important: true,
    article: "제2조 제1항",
  },
  {
    id: 4,
    title: "기존회원 의무",
    content:
      "기존회원은 최소 한 달에 한 번 이상 모임에 참석하여야 한다. 부득이한 사정이 있는 경우 운영진에게 사전 통지하여야 한다. 정당한 사유 없이 한 달간 모임에 참석하지 않을 경우 모임에서 나가야 한다.",
    category: "member",
    important: true,
    article: "제2조 제2항",
  },
  {
    id: 5,
    title: "별도 모임 금지",
    content:
      "소모임에서 벙이 아닌 3인 이상의 별도 모임 및 단체 채팅방 개설을 금지한다. 이를 위반할 경우 강제 탈퇴 조치한다. (필요한 경우 운영진에게 사전 공지하면 가능)",
    category: "member",
    important: true,
    article: "제2조 제3항",
  },
  {
    id: 6,
    title: "뒷담화 금지",
    content:
      "회원 간 뒷담화를 금지하며, 허위사실 유포로 인해 피해가 발생할 경우 책임은 본인에게 있다.",
    category: "member",
    important: true,
    article: "제2조 제3항",
  },
  {
    id: 7,
    title: "사전 확정 금지",
    content:
      "모든 모임(벙개) 진행 시, 총 정원의 절반 이상을 사전에 특정 인원으로 확정(미리 짜고)하는 것을 금지한다. 단, 모임 정원이 6인 이하일 경우 예외로 한다.",
    category: "member",
    important: true,
    article: "제2조 제3항",
  },
  {
    id: 8,
    title: "강퇴자 및 블랙리스트",
    content:
      "강퇴자와 블랙리스트는 모임 게스트로 참여 할 수 없다. 블랙리스트 지정 사유는 운영진 판단에 따라 결정하며, 명단은 운영진 내부에서만 공유한다.",
    category: "member",
    important: true,
    article: "제2조 제3항",
  },
  {
    id: 9,
    title: "게스트 참여 제한",
    content:
      "게스트(비회원)는 동일인이 월 2회 이상 모임에 참여할 수 없다. (단, 운영진 판단으로 허용할 수 있다.)",
    category: "guest",
    important: true,
    article: "제2조 제3항",
  },
  {
    id: 10,
    title: "타모임 운영진 제한",
    content: "타모임 운영진, 모임장은 가입할 수 없다",
    category: "member",
    important: true,
    article: "제2조 제3항",
  },
  {
    id: 11,
    title: "인원 무제한 모임",
    content: "무제한 모임은 월 1회 개최한다. 월 회비는 무제한 모임에 사용한다.",
    category: "meeting",
    important: false,
    article: "제3조",
  },
  {
    id: 12,
    title: "오프라인 모임 개설",
    content:
      "오프라인 모임(이하 '벙')은 모임에 1회 이상 참석한 회원이 개설할 수 있다. 모임 비용은 1/N로 정산하며, 모든 내역을 투명하게 공개하여야 한다.",
    category: "meeting",
    important: false,
    article: "제4조",
  },
  {
    id: 13,
    title: "정산 규정",
    content:
      "벙 이후 하루 내 정산을 완료하여야 하며, 벙 개설자는 최소 2차까지 정산 책임을 진다.",
    category: "meeting",
    important: false,
    article: "제4조",
  },
  {
    id: 14,
    title: "참석 규정",
    content:
      "원칙적으로 정참(정시 참석)을 기준으로 하며, 지각할 경우 사전에 벙 개설자에게 통보하여야 한다. 늦게 참석하는 경우 다음 차수(2차)에 참여하는 것을 권장한다.",
    category: "meeting",
    important: false,
    article: "제4조",
  },
  {
    id: 15,
    title: "음주 규정",
    content:
      "회원은 자신의 주량을 초과하여 음주하지 않도록 주의하여야 한다. 술에 취한 경우 즉시 귀가하는 것을 원칙으로 한다. 술 강요, 욕설, 폭력, 시비 등의 행위를 금지하며, 이를 위반할 경우 즉시 제재한다.",
    category: "drinking",
    important: true,
    article: "제5조",
  },
  {
    id: 16,
    title: "신체 접촉 금지",
    content:
      "술자리에서 이성에게 과도한 신체 접촉을 하거나 불쾌감을 주는 행동을 금지한다. 본 조 위반 시 1회 구두경고 후 강제 탈퇴 조치한다.",
    category: "drinking",
    important: true,
    article: "제5조",
  },
  {
    id: 17,
    title: "이성 간 교류",
    content:
      "모임 내 연애는 자유이나, 과도한 플러팅 및 분위기 저해 행위를 금지한다. 이성 문제로 불편함을 느낀 회원은 언제든지 운영진에게 신고할 수 있다.",
    category: "relationship",
    important: false,
    article: "제6조",
  },
  {
    id: 18,
    title: "가입 제한",
    content:
      "회원은 동종 사교 소모임에 최대 2개까지만 가입할 수 있다. 기혼자는 가입할 수 없으나, 가입 후 결혼한 경우에는 모임 참여가 가능하다.",
    category: "join",
    important: true,
    article: "제7조",
  },
  {
    id: 19,
    title: "재가입 규정",
    content:
      "탈퇴 후 재가입은 운영진의 논의를 거쳐 결정한다. 탈퇴한 회원이 재가입할 경우, 타 소모임 가입은 불가하며 '달달' 단일 모임으로만 활동할 수 있다.",
    category: "join",
    important: true,
    article: "제7조",
  },
  {
    id: 20,
    title: "자소설 작성",
    content:
      "가입 후 1시간 이내 자소설을 작성하여야 하며, 이후에도 삭제해서는 안 된다.",
    category: "join",
    important: true,
    article: "제7조",
  },
  {
    id: 21,
    title: "연령 제한",
    content:
      "본 모임의 가입 연령 제한은 89년생(1989년 출생)까지로 한다. [회칙 개정 전 기존 가입자는 예외]",
    category: "age",
    important: true,
    article: "제8조",
  },
  {
    id: 22,
    title: "단체 채팅방 운영",
    content:
      "가입 후 자기소개 글을 작성한 회원에 한하여 단체 채팅방 초대 링크를 제공한다. 운영진을 제외한 모든 회원은 오픈 프로필을 설정하여야 한다.",
    category: "chat",
    important: false,
    article: "제9조",
  },
  {
    id: 23,
    title: "취미 모임 운영",
    content:
      "달달 모임 내에서 취미에 따라 다양한 소모임(이하 '취미모임')을 운영할 수 있다. 취미모임 가입은 자율이며, 복수 가입도 가능하다. 취미 모임과는 별개로, 회원은 달달 모임에 월 1회 이상 참석하여야 한다.",
    category: "hobby",
    important: false,
    article: "제11조",
  },
  {
    id: 24,
    title: "외출 규정",
    content:
      "회원은 최대 1년 중 1개월 이내 범위에서 외출(임시 활동 중단)을 신청할 수 있다. [소모임은 가입 유지, '단톡방 나가기'] 외출 신청 시 사전에 운영진에게 외출 사유 및 기간을 반드시 전달하여야 한다.",
    category: "leave",
    important: false,
    article: "제12조",
  },
  {
    id: 25,
    title: "게스트 참여",
    content:
      "게스트(비회원)의 참여는 벙 주최자(벙주)의 사전 허락을 받아야 한다. 성비가 심하게 불균형하지 않은 범위 내에서 자유롭게 게스트를 받을 수 있다. 강퇴된 회원은 어떤 방식으로도 참여할 수 없다.",
    category: "guest",
    important: false,
    article: "제13조",
  },
];

const categoryInfo = {
  fee: { label: "회비", icon: DollarSign, color: "text-green-600" },
  member: { label: "회원 의무", icon: Users, color: "text-blue-600" },
  meeting: { label: "모임 규정", icon: Calendar, color: "text-purple-600" },
  drinking: { label: "음주 규정", icon: AlertCircle, color: "text-red-600" },
  relationship: { label: "이성 교류", icon: Heart, color: "text-pink-600" },
  join: { label: "가입/탈퇴", icon: UserCheck, color: "text-indigo-600" },
  age: { label: "연령 제한", icon: UserX, color: "text-orange-600" },
  chat: { label: "채팅방", icon: MessageCircle, color: "text-teal-600" },
  hobby: { label: "취미 모임", icon: BookOpen, color: "text-cyan-600" },
  leave: { label: "외출", icon: Calendar, color: "text-yellow-600" },
  guest: { label: "게스트", icon: Users, color: "text-gray-600" },
};

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
            <span>최종 업데이트: 2025년 7월 8일</span>
          </div>
        </div>
      </div>
    </div>
  );
}
