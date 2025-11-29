"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Filter,
  Heart,
  Users,
  User,
  Calendar,
  MapPin,
} from "lucide-react";
import { useRouter } from "next/navigation";
import UserAvatar from "@/components/UserAvatar";
import MbtiBadge from "@/components/MbtiBadge";
import { useAuth } from "@/contexts/AuthContext";
import LoginModal from "@/components/LoginModal";
import SignupModal from "@/components/SignupModal";
import datingAPI from "@/lib/api/dating";
import type { DatingCardRow } from "@/lib/types";

export default function DatingPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGender, setSelectedGender] = useState<
    "all" | "male" | "female"
  >("all");
  const [selectedAgeRange, setSelectedAgeRange] = useState<string>("all");
  const [selectedMbti, setSelectedMbti] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [cards, setCards] = useState<DatingCardRow[]>([]);
  const [cardsLoading, setCardsLoading] = useState(true);
  const [cardsError, setCardsError] = useState<string | null>(null);

  useEffect(() => {
    const loadCards = async () => {
      try {
        setCardsLoading(true);
        const { data, error } = await datingAPI.getAllCards();
        if (error) {
          console.error("소개팅 카드 로드 오류:", error);
          setCardsError("소개팅 카드를 불러오는 중 오류가 발생했습니다.");
        } else {
          setCards(data || []);
        }
      } finally {
        setCardsLoading(false);
      }
    };

    loadCards();
  }, []);

  const filteredCards = cards.filter((card) => {
    const matchesSearch =
      card.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.introduction.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesGender =
      selectedGender === "all" || card.user_gender === selectedGender;

    const matchesAgeRange = (() => {
      if (selectedAgeRange === "all") return true;
      const age = card.user_age;
      switch (selectedAgeRange) {
        case "20s":
          return age >= 20 && age < 30;
        case "30s":
          return age >= 30 && age < 40;
        default:
          return true;
      }
    })();

    const matchesMbti =
      selectedMbti === "all" || (card.mbti && card.mbti === selectedMbti);

    return matchesSearch && matchesGender && matchesAgeRange && matchesMbti;
  });

  const genderStats = {
    male: cards.filter((card) => card.user_gender === "male").length,
    female: cards.filter((card) => card.user_gender === "female").length,
    total: cards.length,
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">
          소개팅
        </h1>
        <p className="mx-auto max-w-2xl text-xl text-gray-600 dark:text-gray-300">
          내 지인을 소개합니다!
        </p>

        {/* 소개팅 카드 작성하기 버튼 */}
        <div className="mt-4">
          {loading ? (
            <div className="mx-auto w-64 h-12 bg-gray-200 rounded-lg animate-pulse dark:bg-gray-700" />
          ) : user ? (
            <button
              onClick={() => router.push("/dating/write")}
              className="inline-flex items-center px-6 py-3 font-medium text-white rounded-lg shadow-lg transition-colors duration-200 bg-primary-600 hover:bg-primary-700 hover:shadow-xl"
            >
              <Heart className="mr-2 w-5 h-5" />
              소개팅 카드 작성하기
            </button>
          ) : (
            <button
              onClick={() => setShowLoginModal(true)}
              className="inline-flex items-center px-6 py-3 font-medium text-white rounded-lg shadow-lg transition-colors duration-200 bg-primary-600 hover:bg-primary-700 hover:shadow-xl"
            >
              <Heart className="mr-2 w-5 h-5" />
              로그인하고 소개팅 카드 작성하기
            </button>
          )}
        </div>
      </div>

      {/* 검색 및 필터 */}
      <div className="mb-8 space-y-6">
        {/* 검색바 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 w-5 h-5 text-gray-400 transform -translate-y-1/2 dark:text-gray-500" />
          <input
            type="text"
            placeholder="이름, 소개, 지역으로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="py-3 pr-4 pl-10 w-full text-gray-900 bg-white rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* 필터 섹션 */}
        <div className="space-y-6">
          {/* 필터 토글 버튼 */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                필터
              </span>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg transition-colors dark:text-white dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              {showFilters ? "필터 숨기기" : "필터 보기"}
            </button>
          </div>

          {/* 필터 옵션들 */}
          {showFilters && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* 성별 필터 */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    성별
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedGender("all")}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      selectedGender === "all"
                        ? "bg-primary-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300"
                    }`}
                  >
                    전체
                  </button>
                  <button
                    onClick={() => setSelectedGender("male")}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      selectedGender === "male"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300"
                    }`}
                  >
                    남성
                  </button>
                  <button
                    onClick={() => setSelectedGender("female")}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      selectedGender === "female"
                        ? "bg-pink-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300"
                    }`}
                  >
                    여성
                  </button>
                </div>
              </div>

              {/* 연령대 필터 */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    연령대
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedAgeRange("all")}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      selectedAgeRange === "all"
                        ? "bg-primary-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300"
                    }`}
                  >
                    전체
                  </button>
                  <button
                    onClick={() => setSelectedAgeRange("20s")}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      selectedAgeRange === "20s"
                        ? "bg-primary-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300"
                    }`}
                  >
                    20대
                  </button>
                  <button
                    onClick={() => setSelectedAgeRange("30s")}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      selectedAgeRange === "30s"
                        ? "bg-primary-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300"
                    }`}
                  >
                    30대
                  </button>
                </div>
              </div>

              {/* MBTI 필터 */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    MBTI
                  </span>
                </div>
                <select
                  value={selectedMbti}
                  onChange={(e) => setSelectedMbti(e.target.value)}
                  className="px-3 py-2 w-full text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="all">전체</option>
                  <option value="INTJ">INTJ</option>
                  <option value="INTP">INTP</option>
                  <option value="ENTJ">ENTJ</option>
                  <option value="ENTP">ENTP</option>
                  <option value="INFJ">INFJ</option>
                  <option value="INFP">INFP</option>
                  <option value="ENFJ">ENFJ</option>
                  <option value="ENFP">ENFP</option>
                  <option value="ISTJ">ISTJ</option>
                  <option value="ISFJ">ISFJ</option>
                  <option value="ESTJ">ESTJ</option>
                  <option value="ESFJ">ESFJ</option>
                  <option value="ISTP">ISTP</option>
                  <option value="ISFP">ISFP</option>
                  <option value="ESTP">ESTP</option>
                  <option value="ESFP">ESFP</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* 선택된 필터 표시 */}
        {(selectedGender !== "all" ||
          selectedAgeRange !== "all" ||
          selectedMbti !== "all") && (
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
            <span>선택된 필터:</span>
            {selectedGender !== "all" && (
              <span className="px-2 py-1 bg-gray-200 rounded-full dark:bg-gray-700">
                {selectedGender === "male" ? "남성" : "여성"}
              </span>
            )}
            {selectedAgeRange !== "all" && (
              <span className="px-2 py-1 bg-gray-200 rounded-full dark:bg-gray-700">
                {selectedAgeRange === "20s" && "20대"}
                {selectedAgeRange === "30s" && "30대"}
              </span>
            )}
            {selectedMbti !== "all" && (
              <span className="px-2 py-1 bg-gray-200 rounded-full dark:bg-gray-700">
                {selectedMbti}
              </span>
            )}
            <button
              onClick={() => {
                setSelectedGender("all");
                setSelectedAgeRange("all");
                setSelectedMbti("all");
              }}
              className="underline text-primary-600 hover:text-primary-700"
            >
              필터 초기화
            </button>
          </div>
        )}
      </div>

      {/* 결과 통계 */}
      <div className="p-4 mb-6 bg-gray-50 rounded-lg dark:bg-gray-800">
        {cardsLoading ? (
          <div className="flex justify-between items-center text-sm text-gray-400 dark:text-gray-500">
            <span>소개팅 카드를 불러오는 중...</span>
            <span className="w-24 h-3 bg-gray-200 rounded animate-pulse dark:bg-gray-700" />
          </div>
        ) : (
          <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-300">
            <span>총 {filteredCards.length}개의 소개팅 카드를 찾았습니다</span>
            <span>
              {selectedGender === "all"
                ? `전체 ${genderStats.total}개`
                : selectedGender === "male"
                ? `남성 ${genderStats.male}개`
                : `여성 ${genderStats.female}개`}
            </span>
          </div>
        )}
      </div>

      {/* 소개팅 카드 목록 */}
      <div className="grid gap-6">
        {cardsLoading && filteredCards.length === 0 && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm animate-pulse dark:bg-gray-800 dark:border-gray-700"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full dark:bg-gray-700" />
                  <div className="flex-1 space-y-2">
                    <div className="w-32 h-4 bg-gray-200 rounded dark:bg-gray-700" />
                    <div className="w-24 h-3 bg-gray-200 rounded dark:bg-gray-700" />
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="w-full h-3 bg-gray-200 rounded dark:bg-gray-700" />
                  <div className="w-5/6 h-3 bg-gray-200 rounded dark:bg-gray-700" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!cardsLoading &&
          filteredCards.map((card, index) => {
          return (
            <div
              key={card.id}
              className="p-6 bg-white rounded-lg border border-gray-200 shadow-md transition-shadow cursor-pointer hover:shadow-lg dark:bg-gray-800 dark:border-gray-700"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => router.push(`/dating/${card.id}`)}
            >
              <div className="flex items-start space-x-6">
                <div className="flex-1">
                  {/* 사용자 정보 */}
                  <div className="flex gap-2 items-center mb-3">
                    <UserAvatar
                      imageUrl={card.photos[0] || ""}
                      userName={card.user_name}
                      gender={card.user_gender}
                      size="md"
                    />
                    <div className="flex flex-col">
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">
                        {card.user_name}
                        <span className="ml-2 text-base font-normal text-gray-600 dark:text-gray-400">
                          ({card.user_age}세)
                        </span>
                      </span>
                      <div className="flex gap-2 items-center mt-1">
                        <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {card.location}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* MBTI 뱃지 */}
                  {card.mbti && (
                    <div className="mb-3">
                      <MbtiBadge mbti={card.mbti} size="sm" />
                    </div>
                  )}

                  {/* 자기소개 */}
                  <p className="mb-4 text-gray-700 dark:text-gray-300">
                    <div className="text-xs font-medium text-gray-700 dark:text-gray-300">매력 어필:</div>
                    <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                      {card.charm_appeal}
                    </div>
                  </p>

                  {/* 관심사 */}
                  <div className="mb-4">
                    
                    <div className="flex flex-wrap gap-2 mb-2 items-center">
                    <div className="text-xs font-medium text-gray-700 dark:text-gray-300">관심사:</div>
                      {card.interests.map((interest, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 text-xs font-medium text-primary-700 bg-primary-100 rounded-full dark:bg-primary-900/30 dark:text-primary-300"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>


                </div>
              </div>
            </div>
          );
          })}
      </div>

      {!cardsLoading && filteredCards.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-lg text-gray-500 dark:text-gray-400">
            검색 조건에 맞는 소개팅 카드가 없습니다.
          </p>
        </div>
      )}
      
      {/* 로그인/회원가입 모달 */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToSignup={() => {
          setShowLoginModal(false);
          setShowSignupModal(true);
        }}
      />

      <SignupModal
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        onSwitchToLogin={() => {
          setShowSignupModal(false);
          setShowLoginModal(true);
        }}
      />
    </div>
  );
}

