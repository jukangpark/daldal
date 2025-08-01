"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { selfIntroductionAPI, fileAPI } from "@/lib/supabase";
import {
  ArrowLeft,
  Save,
  Upload,
  X,
  User,
  Heart,
  Camera,
  Loader2,
} from "lucide-react";

export default function EditIntroductionPage() {
  const router = useRouter();
  const params = useParams();
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitAbortController, setSubmitAbortController] =
    useState<AbortController | null>(null);

  // 기존 자소설 데이터 로드
  useEffect(() => {
    const loadExistingData = async () => {
      if (!params.id || !user) {
        setError("잘못된 접근입니다.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const { data, error } = await selfIntroductionAPI.getById(
          params.id as string
        );

        if (error) {
          console.error("자소설 로드 오류:", error);
          setError("자소설을 불러오는 중 오류가 발생했습니다.");
          return;
        }

        if (!data) {
          setError("자소설을 찾을 수 없습니다.");
          return;
        }

        // 본인의 자소설인지 확인
        if (data.user_id !== user.id) {
          setError("본인의 자소설만 수정할 수 있습니다.");
          return;
        }

        // 폼 데이터 설정
        setFormData({
          title: data.title || "",
          content: data.content || "",
          age: data.user_age?.toString() || "",
          gender: data.user_gender || "",
          location: data.user_location || "",
          user_name: data.user_name || "",
          photos: data.photos || [],
          ideal_physical_type: data.ideal_physical_type || "",
          ideal_personality_type: data.ideal_personality_type || "",
          dating_style: data.dating_style || "",
          alcohol_tolerance: data.alcohol_tolerance || "",
          smoking_status: data.smoking_status || "",
          charm_appeal: data.charm_appeal || "",
          mbti: data.mbti || "",
          hobbies: data.hobbies || "",
          special_skills: data.special_skills || "",
        });
      } catch (err) {
        console.error("자소설 로드 오류:", err);
        setError("자소설을 불러오는 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    loadExistingData();
  }, [params.id, user]);

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

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

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

      const updateData = {
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
      };

      const { data, error } = await selfIntroductionAPI.upsert(
        params.id as string,
        updateData
      );

      if (error) {
        console.error("자소설 수정 오류:", error);
        alert("자소설 수정 중 오류가 발생했습니다.");
      } else {
        alert("자소설이 성공적으로 수정되었습니다!");
        router.push("/profile");
      }
    } catch (error) {
      // AbortError는 무시 (사용자가 취소한 경우)
      if (error instanceof Error && error.name === "AbortError") {
        console.log("요청이 취소되었습니다.");
        return;
      }

      console.error("자소설 수정 오류:", error);
      alert("자소설 수정 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
      setSubmitAbortController(null);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl">
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
      <div className="mx-auto max-w-4xl">
        <div className="py-20 text-center">
          <p className="mb-4 text-lg text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={() => router.push("/profile")}
            className="px-6 py-3 text-white rounded-lg transition-colors bg-primary-600 hover:bg-primary-700"
          >
            프로필로 돌아가기
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          자소설 수정
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
                className="px-3 py-2 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                className="px-3 py-2 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                className="px-3 py-2 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                className="px-3 py-2 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              >
                <option value="">성별을 선택해주세요</option>
                <option value="male">남성</option>
                <option value="female">여성</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-white">
                거주지 *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="거주지를 입력해주세요"
                className="px-3 py-2 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
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
              자기소개 내용 * (최소 30자)
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              placeholder="자신에 대해 자유롭게 소개해주세요..."
              rows={8}
              className="px-3 py-2 w-full rounded-lg border border-gray-300 resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
              minLength={30}
            />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {formData.content.length}/1000자 (최소 30자)
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
                className="px-3 py-2 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                className="px-3 py-2 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                className="px-3 py-2 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                className="px-3 py-2 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                className="px-3 py-2 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                className="px-3 py-2 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                placeholder="나의 매력을 어필해주세요..."
                rows={3}
                className="px-3 py-2 w-full rounded-lg border border-gray-300 resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                placeholder="취미를 입력해주세요..."
                rows={3}
                className="px-3 py-2 w-full rounded-lg border border-gray-300 resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                placeholder="특기를 입력해주세요..."
                rows={3}
                className="px-3 py-2 w-full rounded-lg border border-gray-300 resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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

          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            {formData.photos.map((photo, index) => (
              <div key={index} className="relative">
                <img
                  src={photo}
                  alt={`Photo ${index + 1}`}
                  className="object-cover w-full h-32 rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute top-2 right-2 p-1 text-white bg-red-500 rounded-full transition-colors hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}

            {formData.photos.length < 6 && (
              <label className="flex flex-col justify-center items-center w-full h-32 rounded-lg border-2 border-gray-300 border-dashed transition-colors cursor-pointer hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500">
                <Upload className="w-8 h-8 text-gray-400" />
                <span className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  사진 추가
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            최대 6장까지 업로드 가능합니다.
          </p>
        </div>

        {/* 제출 버튼 */}
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center px-8 py-3 text-white rounded-lg transition-colors bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                수정 중...
              </>
            ) : (
              <>
                <Save className="mr-2 w-5 h-5" />
                수정 완료
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
