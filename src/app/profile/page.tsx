"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Calendar,
  Heart,
  MessageCircle,
  Plus,
  Loader2,
  User,
  Gift,
  Eye,
  ArrowLeft,
  Star,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  selfIntroductionAPI,
  SelfIntroduction,
  supabase,
} from "@/lib/supabase";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [selfIntro, setSelfIntro] = useState<SelfIntroduction | null>(null);
  const [loadingSelfIntro, setLoadingSelfIntro] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 연결된 이성 정보 (임시 데이터 - 실제로는 API에서 가져와야 함)
  const [connectedPerson, setConnectedPerson] = useState<{
    id: string;
    name: string;
    age: number;
    location: string;
    photo: string;
    introduction: string;
  } | null>(null);

  // 슈퍼 데이트 신청권 상태
  const [hasSuperDateTicket, setHasSuperDateTicket] = useState(false);

  // 삭제 관련 상태
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // 사진 슬라이더 상태
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  // 로그인 상태 확인 및 자기소개서 데이터 로드
  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
      return;
    }

    if (user) {
      loadSelfIntroduction();
    }
  }, [user, loading, router]);

  // 자기소개서 데이터 로드
  const loadSelfIntroduction = async () => {
    try {
      setLoadingSelfIntro(true);

      // 디버깅: 모든 자기소개서 확인
      const { data: allIntros, error: allError } =
        await selfIntroductionAPI.getAllByUserId(user!.id);

      const { data, error } = await selfIntroductionAPI.getByUserId(user!.id);

      if (error) {
        console.error("자기소개서 로드 오류:", error);
        // 자기소개서가 없는 경우는 에러가 아님
        if (error.code === "PGRST116") {
          setSelfIntro(null);
          setError(null);
        } else {
          setError("자기소개서를 불러오는 중 오류가 발생했습니다.");
        }
      } else {
        setSelfIntro(data);
        setError(null);
      }
    } catch (err) {
      console.error("자기소개서 로드 오류:", err);
      setError("자기소개서를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoadingSelfIntro(false);
    }
  };

  // 로딩 중이거나 사용자가 없으면 로딩 표시
  if (loading || loadingSelfIntro) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="py-12 text-center">
          <div className="mx-auto w-12 h-12 rounded-full border-b-2 animate-spin border-primary-600"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 로그인되지 않은 경우
  if (!user) {
    return null;
  }

  // 에러가 있는 경우
  if (error) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900">내 정보</h1>
          <p className="text-xl text-gray-600">
            나의 프로필과 자기소개서를 관리하세요
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

  // 슈퍼 데이트 신청권 사용
  const handleUseSuperDateTicket = () => {
    if (!connectedPerson) {
      alert("연결된 이성이 없습니다.");
      return;
    }

    if (
      confirm(
        `${connectedPerson.name}님과 슈퍼 데이트를 진행하시겠습니까?\n\n이 데이트는 필수로 진행되어야 합니다.`
      )
    ) {
      // 실제로는 API 호출로 데이트 상태 업데이트
      alert(
        "슈퍼 데이트가 예약되었습니다! 상대방과 연락하여 데이트 일정을 조율해주세요."
      );
      setHasSuperDateTicket(false);
    }
  };

  // 사진 슬라이더 네비게이션
  const handlePreviousPhoto = () => {
    if (selfIntro?.photos && selfIntro.photos.length > 0) {
      setCurrentPhotoIndex((prev) =>
        prev === 0 ? selfIntro.photos.length - 1 : prev - 1
      );
    }
  };

  const handleNextPhoto = () => {
    if (selfIntro?.photos && selfIntro.photos.length > 0) {
      setCurrentPhotoIndex((prev) =>
        prev === selfIntro.photos.length - 1 ? 0 : prev + 1
      );
    }
  };

  // 자기소개서 삭제 처리
  const handleDelete = async () => {
    if (!deletePassword.trim()) {
      setDeleteError("비밀번호를 입력해주세요.");
      return;
    }

    setDeleting(true);
    setDeleteError(null);

    try {
      // 실제로는 Supabase Auth API를 사용하여 비밀번호 확인
      // 여기서는 간단한 예시로 처리
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (currentUser?.email) {
        // 비밀번호 확인을 위해 재인증 시도
        const { error } = await supabase.auth.signInWithPassword({
          email: currentUser.email,
          password: deletePassword,
        });

        if (error) {
          setDeleteError("비밀번호가 올바르지 않습니다.");
          return;
        }

        // 비밀번호가 맞으면 자기소개서 삭제
        const { error: deleteError } = await selfIntroductionAPI.delete(
          selfIntro!.id
        );

        if (deleteError) {
          setDeleteError("삭제 중 오류가 발생했습니다.");
          return;
        }

        alert("자기소개서가 삭제되었습니다.");
        setSelfIntro(null);
        setShowDeleteModal(false);
        setDeletePassword("");
      }
    } catch (error) {
      console.error("삭제 오류:", error);
      setDeleteError("삭제 중 오류가 발생했습니다.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">
          내 정보
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          나의 프로필과 자기소개서를 관리하세요
        </p>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          로그인된 사용자: {user.user_metadata?.name || user.email}
        </p>
      </div>

      {/* 자기소개서 내용 */}
      {selfIntro ? (
        <div className="card">
          {/* 제목 및 기본 정보 */}
          <div className="mb-8">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
                  {selfIntro.title}
                </h1>

                <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex items-center">
                    <User className="mr-2 w-4 h-4" />
                    {selfIntro.user_name} ({selfIntro.user_age}세)
                  </div>
                  <div className="flex items-center">
                    <MapPin className="mr-2 w-4 h-4" />
                    {selfIntro.user_location}
                  </div>
                  <span
                    className={`px-3 py-1 text-xs rounded-full ${
                      selfIntro.user_gender === "male"
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                        : "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300"
                    }`}
                  >
                    {selfIntro.user_gender === "male" ? "남성" : "여성"}
                  </span>
                </div>
              </div>

              {/* 액션 버튼들 */}
              <div className="flex items-center ml-4 space-x-2">
                <button
                  onClick={() =>
                    router.push(`/introductions/edit/${selfIntro.id}`)
                  }
                  className="p-2 text-gray-600 bg-gray-100 rounded-lg transition-colors hover:bg-gray-200 hover:text-gray-900 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:hover:text-white"
                  title="편집하기"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="p-2 text-red-600 bg-red-100 rounded-lg transition-colors hover:bg-red-200 hover:text-red-700 dark:text-red-400 dark:bg-red-900/30 dark:hover:bg-red-900/50"
                  title="삭제하기"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* 자기소개 내용 */}
          <div className="mb-8">
            <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
              자기소개
            </h2>
            <div className="p-4 bg-gray-50 rounded-lg dark:bg-gray-700">
              <p className="text-gray-700 whitespace-pre-wrap dark:text-gray-300">
                {selfIntro.content}
              </p>
            </div>
          </div>

          {/* 상세 정보 */}
          {(selfIntro.ideal_physical_type ||
            selfIntro.ideal_personality_type ||
            selfIntro.dating_style ||
            selfIntro.alcohol_tolerance ||
            selfIntro.smoking_status ||
            selfIntro.charm_appeal ||
            selfIntro.mbti ||
            selfIntro.hobbies ||
            selfIntro.special_skills) && (
            <div className="mb-8">
              <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                상세 정보
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {selfIntro.ideal_physical_type && (
                  <div>
                    <h3 className="mb-2 text-sm font-medium text-gray-700 dark:text-white">
                      외적 이상형
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {selfIntro.ideal_physical_type}
                    </p>
                  </div>
                )}

                {selfIntro.ideal_personality_type && (
                  <div>
                    <h3 className="mb-2 text-sm font-medium text-gray-700 dark:text-white">
                      내적 이상형
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {selfIntro.ideal_personality_type}
                    </p>
                  </div>
                )}

                {selfIntro.dating_style && (
                  <div>
                    <h3 className="mb-2 text-sm font-medium text-gray-700 dark:text-white">
                      연애 스타일
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {selfIntro.dating_style === "active" && "적극적"}
                      {selfIntro.dating_style === "passive" && "소극적"}
                      {selfIntro.dating_style === "balanced" && "균형잡힌"}
                      {selfIntro.dating_style === "romantic" && "로맨틱"}
                      {selfIntro.dating_style === "practical" && "실용적"}
                      {selfIntro.dating_style === "idontknow" && "글쎄다"}
                      {selfIntro.dating_style === "try" && "일단만나볼래?"}
                    </p>
                  </div>
                )}

                {selfIntro.alcohol_tolerance && (
                  <div>
                    <h3 className="mb-2 text-sm font-medium text-gray-700 dark:text-white">
                      주량
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {selfIntro.alcohol_tolerance === "none" &&
                        "술을 마시지 않음"}
                      {selfIntro.alcohol_tolerance === "light" && "가벼운 주량"}
                      {selfIntro.alcohol_tolerance === "moderate" &&
                        "난 평균이다!"}
                      {selfIntro.alcohol_tolerance === "heavy" &&
                        "상당한 애주가"}
                      {selfIntro.alcohol_tolerance === "try" && "한잔 할래?"}
                    </p>
                  </div>
                )}

                {selfIntro.smoking_status && (
                  <div>
                    <h3 className="mb-2 text-sm font-medium text-gray-700 dark:text-white">
                      흡연 여부
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {selfIntro.smoking_status === "non-smoker" && "비흡연자"}
                      {selfIntro.smoking_status === "ex-smoker" && "금연자"}
                      {selfIntro.smoking_status === "cigarette" && "연초"}
                      {selfIntro.smoking_status === "e-cigarette" && "전자담배"}
                      {selfIntro.smoking_status === "heated-tobacco" &&
                        "궐련형"}
                      {selfIntro.smoking_status === "trash" &&
                        "내가피는건 바람뿐"}
                    </p>
                  </div>
                )}

                {selfIntro.mbti && (
                  <div>
                    <h3 className="mb-2 text-sm font-medium text-gray-700 dark:text-white">
                      MBTI
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {selfIntro.mbti}
                    </p>
                  </div>
                )}
              </div>

              {/* 텍스트 영역 정보들 */}
              <div className="mt-6 space-y-4">
                {selfIntro.charm_appeal && (
                  <div>
                    <h3 className="mb-2 text-sm font-medium text-gray-700 dark:text-white">
                      나의 매력 어필
                    </h3>
                    <p className="text-gray-600 whitespace-pre-wrap dark:text-gray-300">
                      {selfIntro.charm_appeal}
                    </p>
                  </div>
                )}

                {selfIntro.hobbies && (
                  <div>
                    <h3 className="mb-2 text-sm font-medium text-gray-700 dark:text-white">
                      취미
                    </h3>
                    <p className="text-gray-600 whitespace-pre-wrap dark:text-gray-300">
                      {selfIntro.hobbies}
                    </p>
                  </div>
                )}

                {selfIntro.special_skills && (
                  <div>
                    <h3 className="mb-2 text-sm font-medium text-gray-700 dark:text-white">
                      특기
                    </h3>
                    <p className="text-gray-600 whitespace-pre-wrap dark:text-gray-300">
                      {selfIntro.special_skills}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 사진 갤러리 */}
          {selfIntro.photos && selfIntro.photos.length > 0 && (
            <div className="mb-8">
              <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                사진 ({currentPhotoIndex + 1} / {selfIntro.photos.length})
              </h2>

              {/* 슬라이더 컨테이너 */}
              <div className="relative">
                {/* 메인 이미지 */}
                <div className="overflow-hidden relative bg-gray-100 rounded-lg dark:bg-gray-700 animate-fade-in-up">
                  <img
                    src={selfIntro.photos[currentPhotoIndex]}
                    alt={`Photo ${currentPhotoIndex + 1}`}
                    className="object-contain w-full h-96 transition-all duration-300"
                    loading="lazy"
                  />
                </div>

                {/* 네비게이션 버튼들 */}
                {selfIntro.photos.length > 1 && (
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
                {selfIntro.photos.length > 1 && (
                  <div className="flex justify-center mt-4 space-x-2">
                    {selfIntro.photos.map((_, index) => (
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
      ) : (
        <div className="card">
          <div className="py-12 text-center">
            <p className="mb-4 text-lg text-gray-500 dark:text-gray-300">
              아직 자기소개서를 작성하지 않았습니다.
            </p>
            <Link
              href="/introductions/write"
              className="inline-flex items-center btn-primary"
            >
              <Plus className="mr-2 w-4 h-4" />
              자기소개서 작성하기
            </Link>
          </div>
        </div>
      )}

      {/* 연결된 이성 정보 */}
      <div className="mt-8">
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              연결된 이성
            </h2>
            {hasSuperDateTicket && connectedPerson && (
              <button
                onClick={handleUseSuperDateTicket}
                className="flex items-center px-4 py-2 text-white rounded-lg transition-colors bg-primary-600 hover:bg-primary-700"
              >
                <Gift className="mr-2 w-4 h-4" />
                슈퍼 데이트 신청권 사용하기
              </button>
            )}
          </div>

          {connectedPerson ? (
            <div className="grid gap-6 md:grid-cols-2">
              {/* 상대방 프로필 */}
              <div className="flex items-start space-x-4">
                <img
                  src={connectedPerson.photo}
                  alt={connectedPerson.name}
                  className="object-cover w-20 h-20 rounded-full"
                />
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {connectedPerson.name}
                  </h3>
                  <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex items-center">
                      <Calendar className="mr-2 w-4 h-4" />
                      {connectedPerson.age}세
                    </div>
                    <div className="flex items-center">
                      <MapPin className="mr-2 w-4 h-4" />
                      {connectedPerson.location}
                    </div>
                  </div>
                </div>
              </div>

              {/* 상대방 자기소개 미리보기 */}
              <div>
                <h4 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
                  자기소개
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                  {connectedPerson.introduction}
                </p>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center">
              <div className="flex justify-center items-center mx-auto mb-4 w-16 h-16 bg-gray-100 rounded-full dark:bg-gray-700">
                <User className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
              <p className="text-lg text-gray-500 dark:text-gray-400">
                현재 나와 연결된 이성이 없습니다
              </p>
              <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
                슈퍼 데이트 신청권 페이지에서 마음에 드는 상대에게 투표해보세요
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 삭제 확인 모달 */}
      {showDeleteModal && (
        <div className="flex fixed inset-0 z-50 justify-center items-center bg-black bg-opacity-50">
          <div className="p-6 w-full max-w-md bg-white rounded-lg shadow-xl dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              자기소개서 삭제
            </h3>
            <p className="mb-4 text-gray-600 dark:text-gray-300">
              자기소개서를 삭제하려면 비밀번호를 입력해주세요.
            </p>

            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                비밀번호
              </label>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                className="px-3 py-2 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="비밀번호를 입력하세요"
              />
              {deleteError && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                  {deleteError}
                </p>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletePassword("");
                  setDeleteError(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg transition-colors hover:bg-gray-300 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center px-4 py-2 text-white bg-red-600 rounded-lg transition-colors hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? (
                  <>
                    <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                    삭제 중...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 w-4 h-4" />
                    삭제
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
