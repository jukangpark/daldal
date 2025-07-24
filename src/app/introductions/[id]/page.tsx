"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { selfIntroductionAPI, SelfIntroduction } from "@/lib/supabase";
import {
  ArrowLeft,
  User,
  MapPin,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function IntroductionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [introduction, setIntroduction] = useState<SelfIntroduction | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  useEffect(() => {
    const loadIntroduction = async () => {
      if (!params.id) return;

      try {
        setLoading(true);
        const { data, error } = await selfIntroductionAPI.getById(
          params.id as string
        );

        if (error) {
          console.error("자기소개서 로드 오류:", error);
          setError("자기소개서를 불러오는 중 오류가 발생했습니다.");
        } else if (data) {
          setIntroduction(data);
          // 조회수 증가
          await selfIntroductionAPI.incrementViews(params.id as string);
        } else {
          setError("자기소개서를 찾을 수 없습니다.");
        }
      } catch (err) {
        console.error("자기소개서 로드 오류:", err);
        setError("자기소개서를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    loadIntroduction();
  }, [params.id]);

  const handlePreviousPhoto = () => {
    if (introduction?.photos && introduction.photos.length > 0) {
      setCurrentPhotoIndex((prev) =>
        prev === 0 ? introduction.photos.length - 1 : prev - 1
      );
    }
  };

  const handleNextPhoto = () => {
    if (introduction?.photos && introduction.photos.length > 0) {
      setCurrentPhotoIndex((prev) =>
        prev === introduction.photos.length - 1 ? 0 : prev + 1
      );
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl">
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

  if (error || !introduction) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="py-20 text-center">
          <p className="mb-4 text-lg text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 text-white rounded-lg transition-colors bg-primary-600 hover:bg-primary-700"
          >
            뒤로가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 transition-colors dark:text-white hover:text-gray-900 dark:hover:text-gray-200"
        >
          <ArrowLeft className="mr-2 w-5 h-5" />
          뒤로가기
        </button>
        <div className="w-20"></div> {/* 균형을 위한 빈 공간 */}
      </div>

      {/* 자기소개서 내용 */}
      <div className="card">
        {/* 제목 및 기본 정보 */}
        <div className="mb-8">
          <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
            {introduction.title}
          </h1>

          <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-300">
            <div className="flex items-center">
              <User className="mr-2 w-4 h-4" />
              {introduction.user_name} ({introduction.user_age}세)
            </div>
            <div className="flex items-center">
              <MapPin className="mr-2 w-4 h-4" />
              {introduction.user_location}
            </div>
            <span
              className={`px-3 py-1 text-xs rounded-full ${
                introduction.user_gender === "male"
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                  : "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300"
              }`}
            >
              {introduction.user_gender === "male" ? "남성" : "여성"}
            </span>
          </div>
        </div>

        {/* 자기소개 내용 */}
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
            자기소개
          </h2>
          <div className="p-4 bg-gray-50 rounded-lg dark:bg-gray-700">
            <p className="text-gray-700 whitespace-pre-wrap dark:text-gray-300">
              {introduction.content}
            </p>
          </div>
        </div>

        {/* 상세 정보 */}
        {(introduction.ideal_physical_type ||
          introduction.ideal_personality_type ||
          introduction.dating_style ||
          introduction.alcohol_tolerance ||
          introduction.smoking_status ||
          introduction.charm_appeal ||
          introduction.mbti ||
          introduction.hobbies ||
          introduction.special_skills) && (
          <div className="mb-8">
            <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
              상세 정보
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {introduction.ideal_physical_type && (
                <div>
                  <h3 className="mb-2 text-sm font-medium text-gray-700 dark:text-white">
                    외적 이상형
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {introduction.ideal_physical_type}
                  </p>
                </div>
              )}

              {introduction.ideal_personality_type && (
                <div>
                  <h3 className="mb-2 text-sm font-medium text-gray-700 dark:text-white">
                    내적 이상형
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {introduction.ideal_personality_type}
                  </p>
                </div>
              )}

              {introduction.dating_style && (
                <div>
                  <h3 className="mb-2 text-sm font-medium text-gray-700 dark:text-white">
                    연애 스타일
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {introduction.dating_style === "active" && "적극적"}
                    {introduction.dating_style === "passive" && "소극적"}
                    {introduction.dating_style === "balanced" && "균형잡힌"}
                    {introduction.dating_style === "romantic" && "로맨틱"}
                    {introduction.dating_style === "practical" && "실용적"}
                    {introduction.dating_style === "idontknow" && "글쎄다"}
                    {introduction.dating_style === "try" && "일단만나볼래?"}
                  </p>
                </div>
              )}

              {introduction.alcohol_tolerance && (
                <div>
                  <h3 className="mb-2 text-sm font-medium text-gray-700 dark:text-white">
                    주량
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {introduction.alcohol_tolerance === "none" &&
                      "술을 마시지 않음"}
                    {introduction.alcohol_tolerance === "light" &&
                      "가벼운 주량"}
                    {introduction.alcohol_tolerance === "moderate" &&
                      "난 평균이다!"}
                    {introduction.alcohol_tolerance === "heavy" &&
                      "상당한 애주가"}
                    {introduction.alcohol_tolerance === "try" && "한잔 할래?"}
                  </p>
                </div>
              )}

              {introduction.smoking_status && (
                <div>
                  <h3 className="mb-2 text-sm font-medium text-gray-700 dark:text-white">
                    흡연 여부
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {introduction.smoking_status === "non-smoker" && "비흡연자"}
                    {introduction.smoking_status === "ex-smoker" && "금연자"}
                    {introduction.smoking_status === "cigarette" && "연초"}
                    {introduction.smoking_status === "e-cigarette" &&
                      "전자담배"}
                    {introduction.smoking_status === "heated-tobacco" &&
                      "궐련형"}
                    {introduction.smoking_status === "trash" &&
                      "내가피는건 바람뿐"}
                  </p>
                </div>
              )}

              {introduction.mbti && (
                <div>
                  <h3 className="mb-2 text-sm font-medium text-gray-700 dark:text-white">
                    MBTI
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {introduction.mbti}
                  </p>
                </div>
              )}
            </div>

            {/* 텍스트 영역 정보들 */}
            <div className="mt-6 space-y-4">
              {introduction.charm_appeal && (
                <div>
                  <h3 className="mb-2 text-sm font-medium text-gray-700 dark:text-white">
                    나의 매력 어필
                  </h3>
                  <p className="text-gray-600 whitespace-pre-wrap dark:text-gray-300">
                    {introduction.charm_appeal}
                  </p>
                </div>
              )}

              {introduction.hobbies && (
                <div>
                  <h3 className="mb-2 text-sm font-medium text-gray-700 dark:text-white">
                    취미
                  </h3>
                  <p className="text-gray-600 whitespace-pre-wrap dark:text-gray-300">
                    {introduction.hobbies}
                  </p>
                </div>
              )}

              {introduction.special_skills && (
                <div>
                  <h3 className="mb-2 text-sm font-medium text-gray-700 dark:text-white">
                    특기
                  </h3>
                  <p className="text-gray-600 whitespace-pre-wrap dark:text-gray-300">
                    {introduction.special_skills}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 사진 갤러리 */}
        {introduction.photos && introduction.photos.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
              사진 ({currentPhotoIndex + 1} / {introduction.photos.length})
            </h2>

            {/* 슬라이더 컨테이너 */}
            <div className="relative">
              {/* 메인 이미지 */}
              <div className="overflow-hidden relative bg-gray-100 rounded-lg dark:bg-gray-700 animate-fade-in-up">
                <img
                  src={introduction.photos[currentPhotoIndex]}
                  alt={`Photo ${currentPhotoIndex + 1}`}
                  className="object-contain w-full h-96 transition-all duration-300"
                  loading="lazy"
                />
              </div>

              {/* 네비게이션 버튼들 */}
              {introduction.photos.length > 1 && (
                <>
                  {/* 이전 버튼 */}
                  <button
                    onClick={handlePreviousPhoto}
                    className="flex absolute left-4 top-1/2 justify-center items-center w-10 h-10 text-white rounded-full transition-all duration-200 transform -translate-y-1/2 bg-black/50 hover:bg-black/70"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>

                  {/* 다음 버튼 */}
                  <button
                    onClick={handleNextPhoto}
                    className="flex absolute right-4 top-1/2 justify-center items-center w-10 h-10 text-white rounded-full transition-all duration-200 transform -translate-y-1/2 bg-black/50 hover:bg-black/70"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {/* 썸네일 인디케이터 */}
              {introduction.photos.length > 1 && (
                <div className="flex justify-center mt-4 space-x-2">
                  {introduction.photos.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentPhotoIndex(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-200 ${
                        index === currentPhotoIndex
                          ? "bg-primary-600"
                          : "bg-gray-300 dark:bg-gray-600"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
