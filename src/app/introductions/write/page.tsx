"use client";

import { useState } from "react";

// 이 페이지는 클라이언트에서만 렌더링 (SSR 비활성화)
export const dynamic = "force-dynamic";
export const runtime = "edge";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { selfIntroductionAPI, fileAPI } from "@/lib/supabase";
import {
  ArrowLeft,
  Save,
  Upload,
  X,
  User,
  MapPin,
  Heart,
  Camera,
} from "lucide-react";

export default function WriteIntroductionPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    age: "",
    gender: "",
    location: "",
    user_name: "",
    photos: [] as string[],
    ideal_physical_type: "",
    ideal_personality_type: "",
    dating_style: "",
    alcohol_tolerance: "",
    smoking_status: "",
    charm_appeal: "",
    mbti: "",
    hobbies: "",
    special_skills: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitAbortController, setSubmitAbortController] =
    useState<AbortController | null>(null);

  // 로그인하지 않은 경우 홈으로 리다이렉트
  if (!user) {
    router.push("/");
    return null;
  }

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // 미리보기용 blob URL 생성
      const newPhotos = Array.from(files).map((file) =>
        URL.createObjectURL(file)
      );

      // 실제 파일 객체 저장 (나중에 업로드용)
      const newFiles = Array.from(files);

      setFormData((prev) => ({
        ...prev,
        photos: [...prev.photos, ...newPhotos].slice(0, 6), // 최대 6장
      }));

      setSelectedFiles((prev) => [...prev, ...newFiles].slice(0, 6));
    }
  };

  const removePhoto = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 이미 제출 중이면 중단
    if (isSubmitting) {
      return;
    }

    // 이전 요청이 있다면 취소
    if (submitAbortController) {
      submitAbortController.abort();
    }

    // 새로운 AbortController 생성
    const abortController = new AbortController();
    setSubmitAbortController(abortController);

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      // 1. 새로 선택된 파일들을 Storage에 업로드
      let uploadedUrls: string[] = [];
      if (selectedFiles.length > 0) {
        const fileList = new DataTransfer();
        selectedFiles.forEach((file) => fileList.items.add(file));

        const { uploadedUrls: newUrls, errors } =
          await fileAPI.uploadFilesToStorage(fileList.files, user!.id);

        uploadedUrls = newUrls;

        if (errors.length > 0) {
          alert(`업로드 실패: ${errors.join("\n")}`);
        }
      }

      // 2. 기존 사진 URL과 새로 업로드된 URL 합치기
      const existingPhotos = formData.photos.filter(
        (photo) => !photo.startsWith("blob:")
      );
      const allPhotos = [...existingPhotos, ...uploadedUrls];

      // 새로 작성 모드: create API 호출
      const { data, error } = await selfIntroductionAPI.create({
        user_id: user!.id,
        user_name:
          formData.user_name || user?.user_metadata?.name || user?.email || "",
        user_age: parseInt(formData.age),
        user_gender: formData.gender as "male" | "female",
        user_location: formData.location,
        title: formData.title,
        content: formData.content,
        photos: allPhotos,
        ideal_physical_type: formData.ideal_physical_type,
        ideal_personality_type: formData.ideal_personality_type,
        dating_style: formData.dating_style,
        alcohol_tolerance: formData.alcohol_tolerance,
        smoking_status: formData.smoking_status,
        charm_appeal: formData.charm_appeal,
        mbti: formData.mbti,
        hobbies: formData.hobbies,
        special_skills: formData.special_skills,
      });

      if (error) {
        console.error("자소설 작성 오류:", error);

        // 중복 자소설 에러 처리
        if (error.code === "DUPLICATE_INTRO") {
          alert(error.message || "이미 작성된 자소설이 존재합니다.");
          router.push("/profile");
        } else {
          alert("자소설 작성 중 오류가 발생했습니다.");
        }
      } else {
        alert("자소설이 성공적으로 작성되었습니다!");
        router.push("/introductions");
      }
    } catch (error) {
      // AbortError는 무시 (사용자가 취소한 경우)
      if (error instanceof Error && error.name === "AbortError") {
        console.log("요청이 취소되었습니다.");
        return;
      }

      console.error("자소설 처리 오류:", error);
      alert("자소설 처리 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
      setSubmitAbortController(null);
    }
  };

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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          자소설 작성
        </h1>
        <div className="w-20"></div> {/* 균형을 위한 빈 공간 */}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 기본 정보 섹션 */}
        <div className="card">
          <h2 className="flex items-center mb-6 text-xl font-semibold text-gray-900 dark:text-white">
            <User className="mr-2 w-5 h-5" />
            기본 정보
          </h2>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-white">
                자소설 제목 *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="당신을 나타내는 제목을 작성해주세요"
                className="px-3 py-2 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-white">
                이름 *
              </label>
              <input
                type="text"
                name="user_name"
                value={formData.user_name}
                onChange={handleInputChange}
                placeholder="이름을 입력해주세요"
                className="px-3 py-2 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-white">
                나이 *
              </label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                placeholder="나이를 입력해주세요"
                min="18"
                max="100"
                className="px-3 py-2 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-white">
                성별 *
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="px-3 py-2 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              >
                <option value="">성별을 선택해주세요</option>
                <option value="male">남성</option>
                <option value="female">여성</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-white">
                거주지 (구 까지만) *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 w-4 h-4 text-gray-400 transform -translate-y-1/2 dark:text-gray-300" />
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="거주지를 입력해주세요"
                  className="py-2 pr-3 pl-10 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* 자기소개 내용 섹션 */}
        <div className="card">
          <h2 className="flex items-center mb-6 text-xl font-semibold text-gray-900 dark:text-white">
            <Heart className="mr-2 w-5 h-5" />
            자기소개 내용
          </h2>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-white">
              자기소개 내용 *
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              placeholder="자신에 대해 자유롭게 소개해주세요. 취미, 관심사, 가치관, 일상 등 어떤 내용이든 좋습니다."
              rows={8}
              className="px-3 py-2 w-full rounded-lg border border-gray-300 resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-300">
              작성된 글자 수: {formData.content.length}자
            </p>
          </div>
        </div>

        {/* 상세 정보 섹션 */}
        <div className="card">
          <h2 className="flex items-center mb-6 text-xl font-semibold text-gray-900 dark:text-white">
            <User className="mr-2 w-5 h-5" />
            상세 정보
          </h2>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-white">
                외적 이상형
              </label>
              <input
                type="text"
                name="ideal_physical_type"
                value={formData.ideal_physical_type}
                onChange={handleInputChange}
                placeholder="외적 이상형을 입력해주세요"
                className="px-3 py-2 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-white">
                내적 이상형
              </label>
              <input
                type="text"
                name="ideal_personality_type"
                value={formData.ideal_personality_type}
                onChange={handleInputChange}
                placeholder="내적 이상형을 입력해주세요"
                className="px-3 py-2 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-white">
                연애 스타일
              </label>
              <select
                name="dating_style"
                value={formData.dating_style}
                onChange={handleInputChange}
                className="px-3 py-2 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">연애 스타일을 선택해주세요</option>
                <option value="active">적극적</option>
                <option value="passive">소극적</option>
                <option value="balanced">균형잡힌</option>
                <option value="romantic">로맨틱</option>
                <option value="practical">실용적</option>
                <option value="idontknow">글쎄다</option>
                <option value="try">일단만나볼래?</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-white">
                주량
              </label>
              <select
                name="alcohol_tolerance"
                value={formData.alcohol_tolerance}
                onChange={handleInputChange}
                className="px-3 py-2 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">주량을 선택해주세요</option>
                <option value="none">술을 마시지 않음</option>
                <option value="light">가벼운 주량</option>
                <option value="moderate">난 평균이다!</option>
                <option value="heavy">상당한 애주가</option>
                <option value="try">한잔 할래?</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-white">
                흡연 여부
              </label>
              <select
                name="smoking_status"
                value={formData.smoking_status}
                onChange={handleInputChange}
                className="px-3 py-2 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">흡연 여부를 선택해주세요</option>
                <option value="non-smoker">비흡연자</option>
                <option value="ex-smoker">금연자</option>
                <option value="cigarette">연초</option>
                <option value="e-cigarette">전자담배</option>
                <option value="heated-tobacco">궐련형</option>
                <option value="trash">내가피는건 바람뿐</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-white">
                MBTI
              </label>
              <select
                name="mbti"
                value={formData.mbti}
                onChange={handleInputChange}
                className="px-3 py-2 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">MBTI를 선택해주세요</option>
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

          <div className="mt-6 space-y-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-white">
                나의 매력 어필
              </label>
              <textarea
                name="charm_appeal"
                value={formData.charm_appeal}
                onChange={handleInputChange}
                placeholder="자신의 매력을 어필해주세요"
                rows={3}
                className="px-3 py-2 w-full rounded-lg border border-gray-300 resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-white">
                취미
              </label>
              <textarea
                name="hobbies"
                value={formData.hobbies}
                onChange={handleInputChange}
                placeholder="취미를 입력해주세요"
                rows={3}
                className="px-3 py-2 w-full rounded-lg border border-gray-300 resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-white">
                특기
              </label>
              <textarea
                name="special_skills"
                value={formData.special_skills}
                onChange={handleInputChange}
                placeholder="특기를 입력해주세요"
                rows={3}
                className="px-3 py-2 w-full rounded-lg border border-gray-300 resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* 사진 업로드 섹션 */}
        <div className="card">
          <h2 className="flex items-center mb-6 text-xl font-semibold text-gray-900 dark:text-white">
            <Camera className="mr-2 w-5 h-5" />
            사진 업로드
          </h2>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                className="hidden"
                id="photo-upload"
              />
              <label
                htmlFor="photo-upload"
                className="flex items-center px-4 py-2 text-gray-700 bg-gray-100 rounded-lg transition-colors cursor-pointer dark:text-white dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                <Upload className="mr-2 w-4 h-4" />
                사진 선택
              </label>
              <span className="text-sm text-gray-500 dark:text-gray-300">
                최대 6장까지 업로드 가능합니다
              </span>
            </div>

            {formData.photos.length > 0 && (
              <div className="grid grid-cols-3 gap-4 md:grid-cols-6">
                {formData.photos.map((photo, index) => (
                  <div key={index} className="relative">
                    <img
                      src={photo}
                      alt={`Photo ${index + 1}`}
                      className="object-cover w-full h-24 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="flex absolute -top-2 -right-2 justify-center items-center w-6 h-6 text-white bg-red-500 rounded-full transition-colors hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 제출 버튼 */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg transition-colors dark:text-white dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center px-6 py-3 text-white rounded-lg transition-colors bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="mr-2 w-4 h-4 rounded-full border-2 border-white animate-spin border-t-transparent"></div>
                {selectedFiles.length > 0 ? "업로드 중..." : "작성 중..."}
              </>
            ) : (
              <>
                <Save className="mr-2 w-4 h-4" />
                자소설 작성 완료
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
