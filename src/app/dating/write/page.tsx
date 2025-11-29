"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Heart, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import datingAPI from "@/lib/api/dating";
import fileAPI from "@/lib/api/file";
import type { CreateDatingCardData } from "@/lib/types";

type DatingFormState = Omit<CreateDatingCardData, "photos">;

export default function DatingWritePage() {
  const router = useRouter();
  const { user } = useAuth();

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
  // 실제로 저장될 이미지 URL (Supabase Storage public URL)
  const [photos, setPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange =
    (field: keyof DatingFormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
    // 한글 IME 조합 중에는 Enter가 여러 번 들어올 수 있으므로 무시
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

    if (!user) {
      alert("로그인이 필요한 기능입니다.");
      return;
    }

    try {
      setIsSubmitting(true);

      const payload: CreateDatingCardData = {
        ...form,
        photos,
      };

      const { data, error } = await datingAPI.createCard(payload);

      if (error || !data) {
        console.error("소개팅 카드 생성 오류:", error);
        alert("소개팅 카드 생성 중 오류가 발생했습니다.");
        return;
      }

      alert("소개팅 카드가 등록되었습니다!");
      // 생성된 카드 상세 페이지로 이동
      router.push(`/dating/${data.id}`);
    } catch (err) {
      console.error("소개팅 카드 생성 중 예외:", err);
      alert("소개팅 카드 생성 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (!user) {
      alert("로그인이 필요한 기능입니다.");
      e.target.value = "";
      return;
    }

    const availableSlots = 3 - photos.length;
    if (availableSlots <= 0) {
      alert("사진은 최대 3장까지 등록할 수 있습니다.");
      e.target.value = "";
      return;
    }

    const toUpload = Array.from(files).slice(0, availableSlots);

    try {
      const { uploadedUrls, errors } = await fileAPI.uploadFilesToStorage(
        toUpload,
        user.id,
        "cards",
        "dating-cards"
      );

      if (errors.length > 0) {
        console.error("소개팅 카드 사진 업로드 오류:", errors);
        alert("사진 업로드 중 오류가 발생했습니다.");
      }

      if (uploadedUrls.length > 0) {
        setPhotos((prev) => [...prev, ...uploadedUrls]);
      }
    } catch (err) {
      console.error("소개팅 카드 사진 업로드 중 예외:", err);
      alert("사진 업로드 중 오류가 발생했습니다.");
    } finally {
      // 입력값 초기화 (같은 파일 다시 선택 가능하도록)
      e.target.value = "";
    }
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

  return (
    <div className="mx-auto max-w-3xl">
      <button
        onClick={() => router.push("/dating")}
        className="inline-flex items-center mb-6 text-sm text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400"
      >
        <ArrowLeft className="mr-1 w-4 h-4" />
        소개팅 목록으로 돌아가기
      </button>

      <div className="p-8 bg-white rounded-xl border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700">
        <div className="flex items-center mb-4 gap-2">
          <Heart className="w-6 h-6 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            소개팅 카드 작성하기
          </h1>
        </div>

        {/* 이용 안내 영역 */}
        <div className="mb-8 p-4 text-sm text-left text-gray-700 rounded-lg bg-gray-50 border border-gray-200 dark:text-gray-200 dark:bg-gray-800/60 dark:border-gray-700">
          <h2 className="mb-2 text-base font-semibold text-gray-900 dark:text-white">
            소개팅 카드 작성 안내
          </h2>
          <ol className="pl-4 space-y-1 list-decimal">
            <li>
              소개해주고 싶은 사람에 대해 아래 폼을 참고해서{" "}
              <span className="font-semibold">솔직하고 구체적으로</span> 작성해주세요.
            </li>
            <li>
              다른 회원이 소개팅 카드 상세 페이지에서{" "}
              <span className="font-semibold">[신청하기]</span> 버튼을 누르면,
              <span className="block">
                프로필 &gt; 내가 작성한 소개팅 카드 목록에서 카드별 신청자 목록을 확인할 수
                있습니다.
              </span>
            </li>
            <li>
              신청이 들어오면 해당 카드 하단에{" "}
              <span className="font-semibold">신청한 사람들의 목록</span>이 나타나며,
              수락을 누르면 <span className="font-semibold">신청자의 연락처</span>가
              공개됩니다.
            </li>
            <li>
              사진은 <span className="font-semibold">최대 3장</span>까지 등록할 수 있으며,
              <span className="font-semibold">첫 번째 사진</span>이 소개팅 카드의{" "}
              <span className="font-semibold">대표 이미지(프로필 사진)</span>로 사용됩니다.
              사진을 등록하면 소개팅 <span className="font-semibold">매칭률이 올라가니</span>{" "}
              가능한 한 등록해 주세요!
            </li>
            <li>
              이후에는 <span className="font-semibold">주선자</span>인 여러분이 두 분이 잘
              연결될 수 있도록 자연스럽게 이어주시면 됩니다. 😊
            </li>
          </ol>
        </div>

        {/* 작성 폼 영역 */}
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
                placeholder="예: 민수"
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
                placeholder="예: 28"
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
                지역
              </label>
              <input
                type="text"
                value={form.location}
                onChange={handleChange("location")}
                className="px-3 py-2 w-full text-sm rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="예: 서울 강남구"
                required
              />
            </div>
          </div>

          {/* MBTI / 흡연 / 음주 */}
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
                MBTI (선택)
              </label>
              <select
                value={form.mbti || ""}
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
                흡연 여부
              </label>
              <input
                type="text"
                value={form.smoke}
                onChange={handleChange("smoke")}
                className="px-3 py-2 w-full text-sm rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="예: 비흡연 / 가끔 피움"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
                음주 스타일
              </label>
              <input
                type="text"
                value={form.alcohol}
                onChange={handleChange("alcohol")}
                className="px-3 py-2 w-full text-sm rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="예: 가끔 마셔요 / 거의 안 마셔요"
              />
            </div>
          </div>

          {/* 자기소개 */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
              자기소개
            </label>
            <textarea
              value={form.introduction}
              onChange={handleChange("introduction")}
              className="px-3 py-2 w-full text-sm rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows={4}
              placeholder="소개해주고 싶은 분의 성격, 라이프스타일 등을 자유롭게 적어주세요."
              required
            />
          </div>

          {/* 사진 업로드 */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
              사진 등록 (선택, 최대 3장)
            </label>
            <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
              첫 번째 사진이 대표 이미지로 사용되며, 소개팅 카드의 프로필 사진으로 노출됩니다.
              사진을 등록하면 상대가 더 쉽게 이 분을 이해할 수 있어 매칭률이 올라갑니다.
            </p>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoChange}
              className="block mb-3 text-sm text-gray-700 dark:text-gray-200"
            />

            {photos.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-3">
                {photos.map((src, index) => (
                  <div
                    key={src}
                    className="relative overflow-hidden border rounded-lg border-gray-200 dark:border-gray-600"
                  >
                    <img
                      src={src}
                      alt={`소개팅 사진 ${index + 1}`}
                      className="object-cover w-full h-32"
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
                          className="px-1 text-xs text-white bg-black/40 rounded hover:bg-black/60"
                        >
                          ↑
                        </button>
                      )}
                      {index < photos.length - 1 && (
                        <button
                          type="button"
                          onClick={() => movePhoto(index, 1)}
                          className="px-1 text-xs text-white bg-black/40 rounded hover:bg-black/60"
                        >
                          ↓
                        </button>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute bottom-1 right-1 inline-flex items-center px-2 py-0.5 text-xs text-white bg-red-500 rounded hover:bg-red-600"
                    >
                      삭제
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 관심사 */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
              관심사
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={interestsInput}
                onChange={handleInterestsInputChange}
                onKeyDown={handleInterestsKeyDown}
                className="px-3 py-2 flex-1 text-sm rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="예: 여행, 음악, 독서, 영화"
              />
              <button
                type="button"
                onClick={addInterest}
                disabled={!interestsInput.trim()}
                className="px-4 py-2 text-sm font-medium text-white rounded-lg bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
              >
                추가
              </button>
            </div>

            {form.interests.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {form.interests.map((interest) => (
                  <span
                    key={interest}
                    className="inline-flex items-center px-3 py-1 text-xs font-medium text-primary-700 bg-primary-50 rounded-full dark:bg-primary-900/30 dark:text-primary-200"
                  >
                    {interest}
                    <button
                      type="button"
                      onClick={() => removeInterest(interest)}
                      className="ml-1 text-primary-500 hover:text-primary-700 dark:text-primary-300"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 매력 어필 */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
              매력 어필
            </label>
            <textarea
              value={form.charm_appeal}
              onChange={handleChange("charm_appeal")}
              className="px-3 py-2 w-full text-sm rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows={3}
              placeholder="예: 밝은 에너지, 잘 들어주는 스타일 등"
            />
          </div>

          {/* 취미 / 특기 */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
                취미
              </label>
              <input
                type="text"
                value={form.hobbies}
                onChange={handleChange("hobbies")}
                className="px-3 py-2 w-full text-sm rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="예: 카페 탐방, 전시회, 요리"
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
                placeholder="예: 사람 챙기기, 요리, 사진 찍기 등"
              />
            </div>
          </div>

          {/* 이상형 & 연애 스타일 */}
          <div className="space-y-4">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
                외적 이상형
              </label>
              <textarea
                value={form.ideal_physical_type}
                onChange={handleChange("ideal_physical_type")}
                className="px-3 py-2 w-full text-sm rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={2}
                placeholder="예: 웃는 모습이 예쁘고 캐주얼한 스타일"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
                내적 이상형
              </label>
              <textarea
                value={form.ideal_personality_type}
                onChange={handleChange("ideal_personality_type")}
                className="px-3 py-2 w-full text-sm rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={2}
                placeholder="예: 대화가 잘 통하고 배려심 있는 사람"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
                연애 스타일
              </label>
              <textarea
                value={form.dating_style}
                onChange={handleChange("dating_style")}
                className="px-3 py-2 w-full text-sm rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={2}
                placeholder="예: 자주 연락하는 편, 천천히 깊게 알아가는 스타일 등"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 text-sm font-medium text-white rounded-lg bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
            >
              {isSubmitting ? "저장 중..." : "소개팅 카드 등록하기"}
            </button>
          </div>
        </form>

        <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
          * 현재는 예시 폼으로, 실제 저장/신청 기능은 추후 연동될 예정입니다.
        </p>
      </div>
    </div>
  );
}

