import { useState } from "react";
import { useRouter } from "next/navigation";
import { Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { SelfIntroduction } from "@/lib/types";
import UserAvatar from "@/components/UserAvatar";
import MbtiBadge from "@/components/MbtiBadge";

interface SelfIntroductionCardProps {
  introduction: SelfIntroduction;
  showEditButtons?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  index?: number;
}

export default function SelfIntroductionCard({
  introduction,
  showEditButtons = false,
  onEdit,
  onDelete,
  index = 0,
}: SelfIntroductionCardProps) {
  const router = useRouter();
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handlePreviousPhoto = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (introduction.photos && introduction.photos.length > 0) {
      setCurrentPhotoIndex((prev) =>
        prev === 0 ? introduction.photos.length - 1 : prev - 1
      );
    }
  };

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (introduction.photos && introduction.photos.length > 0) {
      setCurrentPhotoIndex((prev) =>
        prev === introduction.photos.length - 1 ? 0 : prev + 1
      );
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(introduction.id);
    } else {
      router.push(`/introductions/edit/${introduction.id}`);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (onDelete) {
      onDelete(introduction.id);
    }
    setShowDeleteModal(false);
  };

  return (
    <>
      <div
        className={`transition-shadow card hover:shadow-lg animate-fade-in-up`}
        style={{ animationDelay: `${index * 0.1}s` }}
      >
        {/* 제목 및 기본 정보 */}
        <div className="mb-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
                {introduction.title}
              </h1>

              <div className="text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center mb-2">
                  <UserAvatar
                    imageUrl={introduction.photos?.[0]}
                    userName={introduction.user_name}
                    gender={introduction.user_gender}
                    size="md"
                    isVVIP={introduction.isVVIP}
                  />
                  <span className="ml-3">
                    {introduction.user_name} ({introduction.user_age})
                  </span>
                </div>
                <div className="flex items-center mt-3 space-x-4">
                  <span
                    className={`px-3 py-1 text-xs rounded-full ${
                      introduction.user_gender === "male"
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                        : "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300"
                    }`}
                  >
                    {introduction.user_gender === "male" ? "남성" : "여성"}
                  </span>
                  {introduction.user_location && (
                    <span className="whitespace-nowrap">
                      {introduction.user_location}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* 액션 버튼들 */}
            {showEditButtons && (
              <div className="flex items-center ml-4 space-x-2">
                <button
                  onClick={handleEdit}
                  className="p-2 text-gray-600 bg-gray-100 rounded-lg transition-colors hover:bg-gray-200 hover:text-gray-900 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:hover:text-white"
                  title="편집하기"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-2 text-red-600 bg-red-100 rounded-lg transition-colors hover:bg-red-200 hover:text-red-700 dark:text-red-400 dark:bg-red-900/30 dark:hover:bg-red-900/50"
                  title="삭제하기"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 자기소개 내용 */}
        <div className="mb-8">
          <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
            자기소개
          </h2>
          <div className="p-4 bg-gray-50 rounded-lg dark:bg-gray-700">
            <p className="text-base leading-relaxed text-gray-700 whitespace-pre-wrap dark:text-gray-300">
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
            <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
              상세 정보
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {introduction.ideal_physical_type && (
                <div className="p-4 bg-gray-50 rounded-lg dark:bg-gray-700">
                  <h3 className="mb-3 text-base font-bold text-gray-800 dark:text-white">
                    외적 이상형
                  </h3>
                  <p className="text-base text-gray-700 dark:text-gray-300">
                    {introduction.ideal_physical_type}
                  </p>
                </div>
              )}

              {introduction.ideal_personality_type && (
                <div className="p-4 bg-gray-50 rounded-lg dark:bg-gray-700">
                  <h3 className="mb-3 text-base font-bold text-gray-800 dark:text-white">
                    내적 이상형
                  </h3>
                  <p className="text-base text-gray-700 dark:text-gray-300">
                    {introduction.ideal_personality_type}
                  </p>
                </div>
              )}

              {introduction.dating_style && (
                <div className="p-4 bg-gray-50 rounded-lg dark:bg-gray-700">
                  <h3 className="mb-3 text-base font-bold text-gray-800 dark:text-white">
                    연애 스타일
                  </h3>
                  <p className="text-base text-gray-700 dark:text-gray-300">
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
                <div className="p-4 bg-gray-50 rounded-lg dark:bg-gray-700">
                  <h3 className="mb-3 text-base font-bold text-gray-800 dark:text-white">
                    주량
                  </h3>
                  <p className="text-base text-gray-700 dark:text-gray-300">
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
                <div className="p-4 bg-gray-50 rounded-lg dark:bg-gray-700">
                  <h3 className="mb-3 text-base font-bold text-gray-800 dark:text-white">
                    흡연 여부
                  </h3>
                  <p className="text-base text-gray-700 dark:text-gray-300">
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
                <div className="p-4 bg-gray-50 rounded-lg dark:bg-gray-700">
                  <h3 className="mb-3 text-base font-bold text-gray-800 dark:text-white">
                    MBTI
                  </h3>
                  <MbtiBadge mbti={introduction.mbti} size="md" />
                </div>
              )}
            </div>

            {/* 텍스트 영역 정보들 */}
            <div className="mt-8 space-y-6">
              {introduction.charm_appeal && (
                <div className="p-4 bg-gray-50 rounded-lg dark:bg-gray-700">
                  <h3 className="mb-3 text-base font-bold text-gray-800 dark:text-white">
                    나의 매력 어필
                  </h3>
                  <p className="text-base leading-relaxed text-gray-700 whitespace-pre-wrap dark:text-gray-300">
                    {introduction.charm_appeal}
                  </p>
                </div>
              )}

              {introduction.hobbies && (
                <div className="p-4 bg-gray-50 rounded-lg dark:bg-gray-700">
                  <h3 className="mb-3 text-base font-bold text-gray-800 dark:text-white">
                    취미
                  </h3>
                  <p className="text-base leading-relaxed text-gray-700 whitespace-pre-wrap dark:text-gray-300">
                    {introduction.hobbies}
                  </p>
                </div>
              )}

              {introduction.special_skills && (
                <div className="p-4 bg-gray-50 rounded-lg dark:bg-gray-700">
                  <h3 className="mb-3 text-base font-bold text-gray-800 dark:text-white">
                    특기
                  </h3>
                  <p className="text-base leading-relaxed text-gray-700 whitespace-pre-wrap dark:text-gray-300">
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
            <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
              사진 ({currentPhotoIndex + 1} / {introduction.photos.length})
            </h2>

            {/* 슬라이더 컨테이너 */}
            <div className="relative">
              {/* 메인 이미지 */}
              <div className="overflow-hidden relative h-96 bg-gray-100 rounded-lg dark:bg-gray-700 animate-fade-in-up">
                <img
                  src={introduction.photos[currentPhotoIndex]}
                  alt={`Photo ${currentPhotoIndex + 1}`}
                  className="object-contain w-full h-full transition-all duration-300"
                  loading="lazy"
                />
              </div>

              {/* 네비게이션 버튼들 */}
              {introduction.photos.length > 1 && (
                <>
                  {/* 이전 버튼 */}
                  <button
                    onClick={handlePreviousPhoto}
                    type="button"
                    className="flex absolute left-4 top-1/2 justify-center items-center w-10 h-10 text-white rounded-full transition-all duration-200 transform -translate-y-1/2 bg-black/50 hover:bg-black/70"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>

                  {/* 다음 버튼 */}
                  <button
                    onClick={handleNextPhoto}
                    type="button"
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
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setCurrentPhotoIndex(index);
                      }}
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

      {/* 삭제 확인 모달 */}
      {showDeleteModal && (
        <div className="flex fixed inset-0 z-50 justify-center items-center bg-black bg-opacity-50">
          <div className="p-6 w-full max-w-md bg-white rounded-lg shadow-xl dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              자소설 삭제
            </h3>
            <p className="mb-6 text-gray-600 dark:text-gray-300">
              정말로 이 자소설을 삭제하시겠습니까?
              <br />이 작업은 되돌릴 수 없습니다.
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg transition-colors hover:bg-gray-300 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
              >
                취소
              </button>
              <button
                onClick={confirmDelete}
                className="flex items-center px-4 py-2 text-white bg-red-600 rounded-lg transition-colors hover:bg-red-700"
              >
                <Trash2 className="mr-2 w-4 h-4" />
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
