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
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
  selfIntroductionAPI,
  superDateAPI,
  SelfIntroduction,
} from "@/lib/supabase";
import LoginModal from "@/components/LoginModal";
import SignupModal from "@/components/SignupModal";
import UserAvatar from "@/components/UserAvatar";

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
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());
  const [loadingRequests, setLoadingRequests] = useState<Set<string>>(
    new Set()
  );
  const [remainingRequests, setRemainingRequests] = useState<number>(2);
  const [hasExistingIntroduction, setHasExistingIntroduction] =
    useState<boolean>(false);

  // 자소설 데이터 로드
  useEffect(() => {
    const loadIntroductions = async () => {
      try {
        setLoading(true);
        const { data, error } = await selfIntroductionAPI.getAll();
        if (error) {
          console.error("자소설 로드 오류:", error);
          setError("자소설을 불러오는 중 오류가 발생했습니다.");
        } else {
          setIntroductions(data || []);

          // 현재 사용자가 이미 자소설을 작성했는지 확인
          if (user && data) {
            const existingIntro = data.find(
              (intro) => intro.user_id === user.id
            );
            setHasExistingIntroduction(!!existingIntro);
          }
        }
      } catch (err) {
        console.error("자소설 로드 오류:", err);
        setError("자소설을 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    loadIntroductions();
  }, [user]);

  // 사용자가 보낸 슈퍼 데이트 신청 로드
  useEffect(() => {
    const loadSentRequests = async () => {
      if (!user) return;

      try {
        const { data, error } = await superDateAPI.getSentByUserId(user.id);
        if (error) {
          console.error("슈퍼 데이트 신청 로드 오류:", error);
        } else {
          const requestIds = new Set(data?.map((req) => req.target_id) || []);
          setSentRequests(requestIds);
          // 잔여 신청권 계산 (2개 제한)
          const usedRequests = data?.length || 0;
          setRemainingRequests(Math.max(0, 2 - usedRequests));
        }
      } catch (err) {
        console.error("슈퍼 데이트 신청 로드 오류:", err);
      }
    };

    loadSentRequests();
  }, [user]);

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

  // 슈퍼 데이트 신청하기
  const handleSuperDateRequest = async (
    targetId: string,
    targetName: string
  ) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    if (targetId === user.id) {
      alert("자신에게는 슈퍼 데이트를 신청할 수 없습니다.");
      return;
    }

    // 신청 개수 제한 확인 (2개)
    if (remainingRequests <= 0) {
      alert(
        "슈퍼 데이트 신청은 하루에 2개까지만 가능합니다. 기존 신청을 취소하고 다시 시도해주세요."
      );
      return;
    }

    setLoadingRequests((prev) => new Set(prev).add(targetId));

    try {
      const { data, error } = await superDateAPI.create({
        target_id: targetId,
        target_name: targetName,
      });

      if (error) {
        console.error("슈퍼 데이트 신청 오류:", error);
        alert("슈퍼 데이트 신청에 실패했습니다.");
      } else {
        setSentRequests((prev) => new Set(prev).add(targetId));
        setRemainingRequests((prev) => Math.max(0, prev - 1));
        alert("슈퍼 데이트 신청이 완료되었습니다!");
      }
    } catch (err) {
      console.error("슈퍼 데이트 신청 오류:", err);
      alert("슈퍼 데이트 신청에 실패했습니다.");
    } finally {
      setLoadingRequests((prev) => {
        const newSet = new Set(prev);
        newSet.delete(targetId);
        return newSet;
      });
    }
  };

  // 슈퍼 데이트 신청 취소하기
  const handleSuperDateCancel = async (targetId: string) => {
    if (!user) return;

    setLoadingRequests((prev) => new Set(prev).add(targetId));

    try {
      // 먼저 해당 신청을 찾기
      const { data: requests, error: fetchError } =
        await superDateAPI.getSentByUserId(user.id);

      if (fetchError) {
        console.error("신청 조회 오류:", fetchError);
        alert("신청 취소에 실패했습니다.");
        return;
      }

      const request = requests?.find((req) => req.target_id === targetId);
      if (!request) {
        alert("해당 신청을 찾을 수 없습니다.");
        return;
      }

      // delete 함수가 없으므로 updateStatus로 'cancelled' 상태로 변경
      const { error } = await superDateAPI.cancel(request.id);

      if (error) {
        console.error("슈퍼 데이트 신청 취소 오류:", error);
        alert("신청 취소에 실패했습니다.");
      } else {
        setSentRequests((prev) => {
          const newSet = new Set(prev);
          newSet.delete(targetId);
          return newSet;
        });
        setRemainingRequests((prev) => Math.min(2, prev + 1));
        alert("슈퍼 데이트 신청이 취소되었습니다.");
      }
    } catch (err) {
      console.error("슈퍼 데이트 신청 취소 오류:", err);
      alert("신청 취소에 실패했습니다.");
    } finally {
      setLoadingRequests((prev) => {
        const newSet = new Set(prev);
        newSet.delete(targetId);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">
            자소설 목록
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-gray-600 dark:text-gray-300">
            자소설을 읽고 슈데권을 신청하세요! 일단 질러 ⭐️
          </p>
        </div>

        <div className="flex justify-center items-center py-20">
          <div className="flex items-center space-x-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            <span className="text-lg text-gray-600 dark:text-gray-300">
              자소설을 불러오는 중...
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
            자소설 목록
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-gray-600 dark:text-gray-300">
            자소설을 읽고 슈데권을 신청하세요! 일단 질러 ⭐️
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
          자소설 목록
        </h1>
        <p className="mx-auto max-w-2xl text-xl text-gray-600 dark:text-gray-300">
          슈데권을 신청해! 일단 질러 ⭐️
        </p>

        {/* 자소설 작성하기 버튼 */}
        <div className="mt-8">
          {user ? (
            hasExistingIntroduction ? (
              <button
                disabled
                className="inline-flex items-center px-6 py-3 font-medium text-gray-400 bg-gray-200 rounded-lg shadow-lg cursor-not-allowed dark:bg-gray-700 dark:text-gray-500"
              >
                <Plus className="mr-2 w-5 h-5" />
                이미 작성된 자소설이 있습니다
              </button>
            ) : (
              <button
                onClick={() => router.push("/introductions/write")}
                className="inline-flex items-center px-6 py-3 font-medium text-white rounded-lg shadow-lg transition-colors duration-200 bg-primary-600 hover:bg-primary-700 hover:shadow-xl"
              >
                <Plus className="mr-2 w-5 h-5" />
                자소설 작성하기
              </button>
            )
          ) : (
            <button
              onClick={() => setShowLoginModal(true)}
              className="inline-flex items-center px-6 py-3 font-medium text-white rounded-lg shadow-lg transition-colors duration-200 bg-primary-600 hover:bg-primary-700 hover:shadow-xl"
            >
              <Plus className="mr-2 w-5 h-5" />
              로그인하고 자소설 작성하기
            </button>
          )}
        </div>

        {/* 슈퍼 데이트 신청권 표시 */}
        {user && (
          <div className="p-4 mt-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border border-pink-200 dark:from-pink-900/20 dark:to-purple-900/20 dark:border-pink-700">
            <div className="flex justify-center items-center space-x-2">
              <Calendar className="w-5 h-5 text-pink-600 dark:text-pink-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                슈퍼 데이트 신청권:
              </span>
              <span
                className={`text-lg font-bold ${
                  remainingRequests > 0
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {remainingRequests}개 남음
              </span>
              {remainingRequests === 0 && (
                <span className="ml-2 text-xs text-red-500 dark:text-red-400">
                  (기존 신청을 취소하면 다시 신청할 수 있습니다)
                </span>
              )}
            </div>
          </div>
        )}
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
          <span>총 {filteredIntroductions.length}개의 자소설을 찾았습니다</span>
          <span>
            {selectedGender === "all"
              ? `전체 ${genderStats.total}개`
              : selectedGender === "male"
              ? `남성 ${genderStats.male}개`
              : `여성 ${genderStats.female}개`}
          </span>
        </div>
      </div>

      {/* 자소설 목록 */}
      <div className="grid gap-6">
        {filteredIntroductions.map((intro, index) => {
          const userGender = intro?.user_gender || "male";
          const userThumbnail = intro.photos[0] || "";

          return (
            <div
              key={intro.id}
              className="transition-shadow cursor-pointer card hover:shadow-lg animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => router.push(`/introductions/${intro.id}`)}
            >
              <div className="flex items-start space-x-6">
                <div className="flex-1">
                  {/* 사용자 정보 및 뱃지들 */}
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2 items-center">
                      <UserAvatar
                        imageUrl={userThumbnail}
                        userName={intro.user_name}
                        gender={userGender}
                        size="md"
                        isVVIP={intro.isVVIP}
                      />
                      <span className="text-sm text-white-500 dark:text-white">
                        {intro.user_name}
                        <span className="hidden sm:inline">
                          {" "}
                          ({intro.user_age})
                        </span>
                      </span>
                    </div>

                    {/* 슈퍼 데이트 버튼 */}
                    {user && user.id !== intro.user_id && (
                      <div className="flex gap-2">
                        {sentRequests.has(intro.user_id) ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSuperDateCancel(intro.user_id);
                            }}
                            disabled={loadingRequests.has(intro.user_id)}
                            className="flex items-center px-3 py-1 text-xs font-medium text-red-600 bg-red-100 rounded-full transition-colors hover:bg-red-200 disabled:opacity-50 dark:bg-red-600 dark:text-white dark:hover:bg-red-700"
                          >
                            {loadingRequests.has(intro.user_id) ? (
                              <Loader2 className="mr-1 w-3 h-3 animate-spin" />
                            ) : (
                              <X className="mr-1 w-3 h-3" />
                            )}
                            신청 취소
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSuperDateRequest(
                                intro.user_id,
                                intro.user_name
                              );
                            }}
                            disabled={
                              loadingRequests.has(intro.user_id) ||
                              remainingRequests <= 0
                            }
                            className={`flex items-center px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                              remainingRequests > 0
                                ? "text-white bg-primary-600 hover:bg-primary-700"
                                : "text-gray-400 bg-gray-200 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500"
                            } disabled:opacity-50`}
                          >
                            {loadingRequests.has(intro.user_id) ? (
                              <Loader2 className="mr-1 w-3 h-3 animate-spin" />
                            ) : (
                              <Calendar className="mr-1 w-3 h-3" />
                            )}
                            {remainingRequests > 0
                              ? "슈퍼 데이트 신청"
                              : "신청권 소진"}
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="mt-3">
                    {intro.mbti && (
                      <span className="px-2 py-1 text-xs text-purple-700 bg-purple-100 rounded-full dark:bg-purple-600 dark:text-white">
                        {intro.mbti}
                      </span>
                    )}
                  </div>

                  {/* 제목 */}
                  <h3 className="mt-3 text-xl font-bold text-gray-900 dark:text-white">
                    {intro.title}
                  </h3>

                  {/* 자기소개 내용 */}
                  <p className="mt-2 text-gray-600 line-clamp-3 dark:text-gray-300">
                    {intro.content}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredIntroductions.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-lg text-gray-500">
            검색 조건에 맞는 자소설이 없습니다.
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
