"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Heart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import datingAPI from "@/lib/api/dating";
import fileAPI from "@/lib/api/file";
import type { CreateDatingCardData, DatingCardRow } from "@/lib/types";

type DatingFormState = Omit<CreateDatingCardData, "photos">;

export default function DatingEditPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading } = useAuth();

  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id as string);

  const [form, setForm] = useState<DatingFormState>({
    user_name: "",
    user_age: 0,
    user_gender: "male",
    location: "",
    mbti: "",
    introduction: "",
    interests: [],
    smoke: "",
    alcohol: "",
    charm_appeal: "",
    hobbies: "",
    special_skills: "",
    ideal_physical_type: "",
    ideal_personality_type: "",
    dating_style: "",
  });
  const [interestsInput, setInterestsInput] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [newPhotoFiles, setNewPhotoFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingCard, setLoadingCard] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const loadCard = async () => {
      try {
        setLoadingCard(true);
        const { data, error } = await datingAPI.getCardById(id);
        if (error || !data) {
          console.error("소개팅 카드 로드 오류:", error);
          setError("소개팅 카드를 불러오는 중 오류가 발생했습니다.");
          return;
        }

        // 주선자 본인인지 확인
        if (user && data.matchmaker_user_id !== user.id) {
          alert("이 소개팅 카드를 수정할 권한이 없습니다.");
          router.push(`/dating/${id}`);
          return;
        }

        const card = data as DatingCardRow;
        setForm({
          user_name: card.user_name,
          user_age: card.user_age,
          user_gender: card.user_gender,
          location: card.location,
          mbti: card.mbti ?? "",
          introduction: card.introduction,
          interests: card.interests ?? [],
          smoke: card.smoke ?? "",
          alcohol: card.alcohol ?? "",
          charm_appeal: card.charm_appeal ?? "",
          hobbies: card.hobbies ?? "",
          special_skills: card.special_skills ?? "",
          ideal_physical_type: card.ideal_physical_type ?? "",
          ideal_personality_type: card.ideal_personality_type ?? "",
          dating_style: card.dating_style ?? "",
        });
        setPhotos(card.photos ?? []);
        setError(null);
      } catch (err) {
        console.error("소개팅 카드 로드 중 예외:", err);
        setError("소개팅 카드를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoadingCard(false);
      }
    };

    loadCard();
  }, [id, user, router]);

  const handleChange =
    (field: keyof DatingFormState) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      const value = e.target.value;
      if (field === "user_age") {
        setForm((prev) => ({ ...prev, user_age: Number(value) || 0 }));
      } else {
        setForm((prev) => ({ ...prev, [field]: value as any }));
      }
    };

  const handleInterestsInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setInterestsInput(e.target.value);
  };

  const addInterest = () => {
    const value = interestsInput.trim();
    if (!value) return;

    setForm((prev) => {
      if (prev.interests.includes(value)) return prev;
      return {
        ...prev,
        interests: [...prev.interests, value],
      };
    });
    setInterestsInput("");
  };

  const handleInterestsKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    const anyEvent = e.nativeEvent as any;
    if (anyEvent.isComposing || anyEvent.keyCode === 229) {
      return;
    }

    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addInterest();
    }
  };

  const removeInterest = (value: string) => {
    setForm((prev) => ({
      ...prev,
      interests: prev.interests.filter((item) => item !== value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      setIsSubmitting(true);

      if (!user) {
        alert("로그인이 필요한 기능입니다.");
        return;
      }

      // 새로 추가된 사진이 있다면 Storage에 업로드
      let uploadedUrls: string[] = [];
      if (newPhotoFiles.length > 0) {
        const dataTransfer = new DataTransfer();
        newPhotoFiles.forEach((file) => dataTransfer.items.add(file));

        const { uploadedUrls: newUploadedUrls, errors } =
          await fileAPI.uploadFilesToStorage(
            dataTransfer.files,
            user.id,
            `cards/${id}`,
            "dating-cards"
          );

        if (errors.length > 0) {
          console.error("소개팅 카드 사진 업로드 오류:", errors);
          alert("일부 사진 업로드 중 오류가 발생했습니다.");
        }

        uploadedUrls = newUploadedUrls || [];
      }

      // 기존 사진(실제 URL) + 새로 업로드된 사진 URL 합치기
      const existingPhotos = photos.filter((src) => !src.startsWith("blob:"));
      const allPhotos = [...existingPhotos, ...uploadedUrls];

      const payload: Partial<CreateDatingCardData> & { photos?: string[] } = {
        ...form,
        photos: allPhotos,
      };

      const { data, error } = await datingAPI.updateCard(id, payload);

      if (error || !data) {
        console.error("소개팅 카드 수정 오류:", error);
        alert("소개팅 카드 수정 중 오류가 발생했습니다.");
        return;
      }

      alert("소개팅 카드가 수정되었습니다!");
      router.push(`/dating/${id}`);
    } catch (err) {
      console.error("소개팅 카드 수정 중 예외:", err);
      alert("소개팅 카드 수정 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const availableSlots = 3 - photos.length;
    if (availableSlots <= 0) {
      alert("사진은 최대 3장까지 등록할 수 있습니다.");
      return;
    }

    const toAdd = fileArray.slice(0, availableSlots);
    const newPreviews = toAdd.map((file) => URL.createObjectURL(file));

    setPhotos((prev) => [...prev, ...newPreviews]);
    setNewPhotoFiles((prev) => [...prev, ...toAdd]);

    e.target.value = "";
  };

  const movePhoto = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= photos.length) return;

    setPhotos((prev) => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[newIndex];
      updated[newIndex] = temp;
      return updated;
    });
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  if (loading || loadingCard) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="py-12 text-center">
          <div className="mx-auto w-12 h-12 rounded-full border-b-2 animate-spin border-primary-600" />
          <p className="mt-4 text-gray-600 dark:text-gray-300">
            소개팅 카드 정보를 불러오는 중입니다...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl">
        <button
          onClick={() => router.push(`/dating/${id}`)}
          className="inline-flex items-center mb-6 text-sm text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400"
        >
          <ArrowLeft className="mr-1 w-4 h-4" />
          소개팅 카드로 돌아가기
        </button>
        <div className="p-8 text-center bg-white rounded-xl border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700">
          <p className="mb-2 text-lg font-semibold text-red-600 dark:text-red-400">
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <button
        onClick={() => router.push(`/dating/${id}`)}
        className="inline-flex items-center mb-6 text-sm text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400"
      >
        <ArrowLeft className="mr-1 w-4 h-4" />
        소개팅 카드로 돌아가기
      </button>

      <div className="p-8 bg-white rounded-xl border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700">
        <div className="flex items-center mb-4 gap-2">
          <Heart className="w-6 h-6 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            소개팅 카드 수정하기
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="pt-6 mt-2 space-y-6 border-t border-dashed border-gray-200 dark:border-gray-700"
        >
          {/* 기본 정보 */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
                이름
              </label>
              <input
                type="text"
                value={form.user_name}
                onChange={handleChange("user_name")}
                className="px-3 py-2 w-full text-sm rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
                나이
              </label>
              <input
                type="number"
                min={18}
                max={99}
                value={form.user_age || ""}
                onChange={handleChange("user_age")}
                className="px-3 py-2 w-full text-sm rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
                성별
              </label>
              <select
                value={form.user_gender}
                onChange={handleChange("user_gender")}
                className="px-3 py-2 w-full text-sm rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="male">남성</option>
                <option value="female">여성</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
                사는 지역
              </label>
              <input
                type="text"
                value={form.location}
                onChange={handleChange("location")}
                className="px-3 py-2 w-full text-sm rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* MBTI */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
                MBTI
              </label>
              <select
                value={form.mbti}
                onChange={handleChange("mbti")}
                className="px-3 py-2 w-full text-sm rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">선택 안 함</option>
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

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
                흡연
              </label>
              <input
                type="text"
                value={form.smoke}
                onChange={handleChange("smoke")}
                className="px-3 py-2 w-full text-sm rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="예: 비흡연 / 가끔 피움"
              />
            </div>
          </div>

          {/* 음주 */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
              음주
            </label>
            <input
              type="text"
              value={form.alcohol}
              onChange={handleChange("alcohol")}
              className="px-3 py-2 w-full text-sm rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="예: 가끔 마셔요 / 거의 안 마셔요"
            />
          </div>

          {/* 자기소개 */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
              자기소개
            </label>
            <textarea
              value={form.introduction}
              onChange={handleChange("introduction")}
              rows={4}
              className="px-3 py-2 w-full text-sm rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* 관심사 */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
              관심사
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={interestsInput}
                onChange={handleInterestsInputChange}
                onKeyDown={handleInterestsKeyDown}
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="관심사를 입력하고 Enter를 눌러 추가"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {form.interests.map((interest) => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => removeInterest(interest)}
                  className="inline-flex items-center px-3 py-1 text-xs text-primary-700 bg-primary-50 rounded-full hover:bg-primary-100 dark:bg-primary-900/30 dark:text-primary-200"
                >
                  <span>{interest}</span>
                  <span className="ml-1 text-[10px]">×</span>
                </button>
              ))}
            </div>
          </div>

          {/* 매력 포인트 / 취미 & 특기 */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
                본인이 생각하는 매력 포인트
              </label>
              <textarea
                value={form.charm_appeal}
                onChange={handleChange("charm_appeal")}
                rows={3}
                className="px-3 py-2 w-full text-sm rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div className="space-y-3">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
                  취미
                </label>
                <input
                  type="text"
                  value={form.hobbies}
                  onChange={handleChange("hobbies")}
                  className="px-3 py-2 w-full text-sm rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
                  특기
                </label>
                <input
                  type="text"
                  value={form.special_skills}
                  onChange={handleChange("special_skills")}
                  className="px-3 py-2 w-full text-sm rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* 이상형 & 연애 스타일 */}
          <div className="space-y-4">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
                이상형 (외적인 부분)
              </label>
              <textarea
                value={form.ideal_physical_type}
                onChange={handleChange("ideal_physical_type")}
                rows={2}
                className="px-3 py-2 w-full text-sm rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
                이상형 (성격 / 가치관)
              </label>
              <textarea
                value={form.ideal_personality_type}
                onChange={handleChange("ideal_personality_type")}
                rows={2}
                className="px-3 py-2 w-full text-sm rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
                연애 스타일
              </label>
              <textarea
                value={form.dating_style}
                onChange={handleChange("dating_style")}
                rows={2}
                className="px-3 py-2 w-full text-sm rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* 사진 업로드 */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
              소개팅 카드 사진 (최대 3장)
            </label>
            <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
              첫 번째 사진이 대표 이미지로 사용됩니다. 사진을 등록하면 소개팅 매칭률이
              올라갑니다.
            </p>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoChange}
              className="block mb-3 text-xs text-gray-700 dark:text-gray-200"
            />

            {photos.length > 0 && (
              <div className="grid gap-3 sm:grid-cols-3">
                {photos.map((src, index) => (
                  <div
                    key={`${src}-${index}`}
                    className="relative overflow-hidden border rounded-lg border-gray-200 dark:border-gray-600"
                  >
                    <img
                      src={src}
                      alt={`소개팅 카드 사진 ${index + 1}`}
                      className="object-cover w-full h-28"
                    />
                    {index === 0 ? (
                      <div className="absolute top-1 left-1 px-2 py-0.5 text-[10px] font-semibold text-white rounded bg-primary-600 shadow-sm">
                        대표 이미지
                      </div>
                    ) : (
                      <div className="absolute top-1 left-1 px-2 py-0.5 text-[10px] font-medium text-white rounded bg-black/50">
                        사진 {index + 1}
                      </div>
                    )}
                    <div className="absolute top-1 right-1 flex gap-1">
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => movePhoto(index, -1)}
                          className="px-1 text-[10px] text-white bg-black/40 rounded hover:bg-black/60"
                        >
                          ↑
                        </button>
                      )}
                      {index < photos.length - 1 && (
                        <button
                          type="button"
                          onClick={() => movePhoto(index, 1)}
                          className="px-1 text-[10px] text-white bg-black/40 rounded hover:bg-black/60"
                        >
                          ↓
                        </button>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute bottom-1 right-1 inline-flex items-center px-2 py-0.5 text-[10px] text-white bg-red-500 rounded hover:bg-red-600"
                    >
                      삭제
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => router.push(`/dating/${id}`)}
              className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-medium text-white rounded-md bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
            >
              {isSubmitting ? "수정 중..." : "소개팅 카드 수정 완료"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


