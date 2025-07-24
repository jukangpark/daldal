"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Heart,
  Users,
  User,
  Plus,
  Loader2,
  Calendar,
  MapPin,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { selfIntroductionAPI, SelfIntroduction } from "@/lib/supabase";
import LoginModal from "@/components/LoginModal";
import SignupModal from "@/components/SignupModal";

export default function IntroductionsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedGender, setSelectedGender] = useState<
    "all" | "male" | "female"
  >("all");
  const [selectedAgeRange, setSelectedAgeRange] = useState<string>("all");
  const [selectedMbti, setSelectedMbti] = useState<string>("all");
  const [selectedDatingStyle, setSelectedDatingStyle] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(true);
  const [introductions, setIntroductions] = useState<SelfIntroduction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);

  // 자기소개서 데이터 로드
  useEffect(() => {
    const loadIntroductions = async () => {
      try {
        setLoading(true);
        const { data, error } = await selfIntroductionAPI.getAll();
        if (error) {
          console.error("자기소개서 로드 오류:", error);
          setError("자기소개서를 불러오는 중 오류가 발생했습니다.");
        } else {
          setIntroductions(data || []);
        }
      } catch (err) {
        console.error("자기소개서 로드 오류:", err);
        setError("자기소개서를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    loadIntroductions();
  }, []);

  const filteredIntroductions = introductions.filter((intro) => {
    const matchesSearch =
      intro.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      intro.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      intro.user_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesGender =
      selectedGender === "all" || intro.user_gender === selectedGender;

    const matchesAgeRange = (() => {
      if (selectedAgeRange === "all") return true;
      const age = intro.user_age;
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
      selectedMbti === "all" || (intro.mbti && intro.mbti === selectedMbti);

    const matchesDatingStyle =
      selectedDatingStyle === "all" ||
      (intro.dating_style && intro.dating_style === selectedDatingStyle);

    return (
      matchesSearch &&
      matchesGender &&
      matchesAgeRange &&
      matchesMbti &&
      matchesDatingStyle
    );
  });

  const genderStats = {
    male: introductions.filter((intro) => intro.user_gender === "male").length,
    female: introductions.filter((intro) => intro.user_gender === "female")
      .length,
    total: introductions.length,
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">
            자기소개서 목록
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-gray-600 dark:text-gray-300">
            다른 사람들의 자기소개서를 읽고 진정한 만남의 기회를 찾아보세요
          </p>
        </div>

        <div className="flex justify-center items-center py-20">
          <div className="flex items-center space-x-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            <span className="text-lg text-gray-600 dark:text-gray-300">
              자기소개서를 불러오는 중...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">
            자기소개서 목록
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-gray-600 dark:text-gray-300">
            다른 사람들의 자기소개서를 읽고 진정한 만남의 기회를 찾아보세요
          </p>
        </div>

        <div className="py-20 text-center">
          <p className="mb-4 text-lg text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 text-white rounded-lg transition-colors bg-primary-600 hover:bg-primary-700"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">
          자기소개서 목록
        </h1>
        <p className="mx-auto max-w-2xl text-xl text-gray-600 dark:text-gray-300">
          다른 사람들의 자기소개서를 읽고 진정한 만남의 기회를 찾아보세요
        </p>

        {/* 자기소개서 작성하기 버튼 */}
        <div className="mt-8">
          {user ? (
            <button
              onClick={() => router.push("/introductions/write")}
              className="inline-flex items-center px-6 py-3 font-medium text-white rounded-lg shadow-lg transition-colors duration-200 bg-primary-600 hover:bg-primary-700 hover:shadow-xl"
            >
              <Plus className="mr-2 w-5 h-5" />
              자기소개서 작성하기
            </button>
          ) : (
            <button
              onClick={() => setShowLoginModal(true)}
              className="inline-flex items-center px-6 py-3 font-medium text-white rounded-lg shadow-lg transition-colors duration-200 bg-primary-600 hover:bg-primary-700 hover:shadow-xl"
            >
              <Plus className="mr-2 w-5 h-5" />
              로그인하고 자기소개서 작성하기
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
            placeholder="제목, 내용, 이름으로 검색..."
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

              {/* 연애 스타일 필터 */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Heart className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    연애 스타일
                  </span>
                </div>
                <select
                  value={selectedDatingStyle}
                  onChange={(e) => setSelectedDatingStyle(e.target.value)}
                  className="px-3 py-2 w-full text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="all">전체</option>
                  <option value="active">적극적</option>
                  <option value="passive">소극적</option>
                  <option value="balanced">균형잡힌</option>
                  <option value="romantic">로맨틱</option>
                  <option value="practical">실용적</option>
                  <option value="idontknow">글쎄다</option>
                  <option value="try">일단만나볼래?</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* 선택된 필터 표시 */}
        {(selectedGender !== "all" ||
          selectedAgeRange !== "all" ||
          selectedMbti !== "all" ||
          selectedDatingStyle !== "all" ||
          selectedTags.length > 0) && (
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
            {selectedDatingStyle !== "all" && (
              <span className="px-2 py-1 bg-gray-200 rounded-full dark:bg-gray-700">
                {selectedDatingStyle === "active" && "적극적"}
                {selectedDatingStyle === "passive" && "소극적"}
                {selectedDatingStyle === "balanced" && "균형잡힌"}
                {selectedDatingStyle === "romantic" && "로맨틱"}
                {selectedDatingStyle === "practical" && "실용적"}
                {selectedDatingStyle === "idontknow" && "글쎄다"}
                {selectedDatingStyle === "try" && "일단만나볼래?"}
              </span>
            )}
            {selectedTags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-gray-200 rounded-full dark:bg-gray-700"
              >
                {tag}
              </span>
            ))}
            <button
              onClick={() => {
                setSelectedGender("all");
                setSelectedAgeRange("all");
                setSelectedMbti("all");
                setSelectedDatingStyle("all");
                setSelectedTags([]);
              }}
              className="underline text-primary-600 hover:text-primary-700"
            >
              필터 초기화
            </button>
          </div>
        )}
      </div>

      {/* 결과 통계 */}
      <div className="p-4 mb-6 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>
            총 {filteredIntroductions.length}개의 자기소개서를 찾았습니다
          </span>
          <span>
            {selectedGender === "all"
              ? `전체 ${genderStats.total}개`
              : selectedGender === "male"
              ? `남성 ${genderStats.male}개`
              : `여성 ${genderStats.female}개`}
          </span>
        </div>
      </div>

      {/* 자기소개서 목록 */}
      <div className="grid gap-6">
        {filteredIntroductions.map((intro, index) => (
          <div
            key={intro.id}
            className="transition-shadow cursor-pointer card hover:shadow-lg animate-fade-in-up"
            style={{ animationDelay: `${index * 0.1}s` }}
            onClick={() => router.push(`/introductions/${intro.id}`)}
          >
            <div className="flex items-start space-x-6">
              <div className="flex-1">
                <div className="flex items-center mb-3 space-x-3">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {intro.title}
                  </h3>
                  <span className="text-sm text-gray-500 dark:text-gray-300">
                    {intro.user_name} ({intro.user_age}세)
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      intro.user_gender === "male"
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-600 dark:text-white"
                        : "bg-pink-100 text-pink-700 dark:bg-pink-600 dark:text-white"
                    }`}
                  >
                    {intro.user_gender === "male" ? "남성" : "여성"}
                  </span>
                  {intro.mbti && (
                    <span className="px-2 py-1 text-xs text-purple-700 bg-purple-100 rounded-full dark:bg-purple-600 dark:text-white">
                      {intro.mbti}
                    </span>
                  )}
                </div>

                <p className="mb-4 text-gray-600 line-clamp-3 dark:text-gray-300">
                  {intro.content}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredIntroductions.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-lg text-gray-500">
            검색 조건에 맞는 자기소개서가 없습니다.
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
