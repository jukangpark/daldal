"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Heart,
  MapPin,
  User,
  Cigarette,
  Wine,
  Sparkles,
  X,
} from "lucide-react";
import UserAvatar from "@/components/UserAvatar";
import MbtiBadge from "@/components/MbtiBadge";
import LoginModal from "@/components/LoginModal";
import SignupModal from "@/components/SignupModal";
import { useAuth } from "@/contexts/AuthContext";
import datingAPI from "@/lib/api/dating";
import fileAPI from "@/lib/api/file";
import type { CreateDatingApplicationData, DatingCardRow } from "@/lib/types";

export default function DatingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id as string);

  const [card, setCard] = useState<DatingCardRow | null>(null);
  const [cardLoading, setCardLoading] = useState(true);
  const [cardError, setCardError] = useState<string | null>(null);

  // 신청 카드 작성 모달 상태
  type ApplicantGender = "male" | "female";
  interface ApplicationForm {
    name: string;
    age: string;
    phone: string;
    gender: ApplicantGender;
    location: string;
    mbti: string;
    smoke: string;
    alcohol: string;
    charm_appeal: string;
    dating_style: string;
    photos: string[];
  }

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [applyForm, setApplyForm] = useState<ApplicationForm>({
    name: "",
    age: "",
    phone: "",
    gender: "male",
    location: "",
    mbti: "",
    smoke: "",
    alcohol: "",
    charm_appeal: "",
    dating_style: "",
    photos: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isOwner =
    !!user && !!card && user.id === (card as DatingCardRow | null)?.matchmaker_user_id;

  useEffect(() => {
    if (!id) return;

    const loadCard = async () => {
      try {
        setCardLoading(true);
        const { data, error } = await datingAPI.getCardById(id);
        if (error) {
          console.error("소개팅 카드 로드 오류:", error);
          setCardError("소개팅 카드를 불러오는 중 오류가 발생했습니다.");
        } else {
          setCard(data);
        }
      } finally {
        setCardLoading(false);
      }
    };

    loadCard();
  }, [id]);

  const handleApplyChange =
    (field: keyof ApplicationForm) =>
    (
      e:
        | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
        | { target: { value: string } }
    ) => {
      const value = e.target.value;
      if (field === "age") {
        // 숫자만 허용
        const onlyDigits = value.replace(/\D/g, "");
        // 최대 2자리까지만 (99세까지 가정)
        const trimmed = onlyDigits.slice(0, 2);
        setApplyForm((prev) => ({ ...prev, age: trimmed }));
      } else {
        setApplyForm((prev) => ({ ...prev, [field]: value as any }));
      }
    };

  const handleApplyPhotosChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (!user) {
      alert("로그인이 필요한 기능입니다.");
      e.target.value = "";
      return;
    }

    const availableSlots = 3 - applyForm.photos.length;
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
        card ? `applications/${card.id}` : "applications",
        "dating-cards"
      );

      if (errors.length > 0) {
        console.error("신청자 사진 업로드 오류:", errors);
        alert("신청자 사진 업로드 중 오류가 발생했습니다.");
      }

      if (uploadedUrls.length > 0) {
        setApplyForm((prev) => ({
          ...prev,
          photos: [...prev.photos, ...uploadedUrls],
        }));
      }
    } catch (err) {
      console.error("신청자 사진 업로드 중 예외:", err);
      alert("신청자 사진 업로드 중 오류가 발생했습니다.");
    } finally {
      e.target.value = "";
    }
  };

  const moveApplyPhoto = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= applyForm.photos.length) return;

    setApplyForm((prev) => {
      const updated = [...prev.photos];
      const temp = updated[index];
      updated[index] = updated[newIndex];
      updated[newIndex] = temp;
      return { ...prev, photos: updated };
    });
  };

  const removeApplyPhoto = (index: number) => {
    setApplyForm((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!card) return;

    const parsedAge = applyForm.age ? Number(applyForm.age) : undefined;
    if (!parsedAge) {
      alert("나이를 올바르게 입력해주세요.");
      return;
    }

    const payload: CreateDatingApplicationData = {
      dating_card_id: card.id,
      name: applyForm.name,
      age: parsedAge,
      phone: applyForm.phone,
      gender: applyForm.gender,
      location: applyForm.location || undefined,
      mbti: applyForm.mbti || undefined,
      smoke: applyForm.smoke || undefined,
      alcohol: applyForm.alcohol || undefined,
      charm_appeal: applyForm.charm_appeal || undefined,
      dating_style: applyForm.dating_style || undefined,
      photos: applyForm.photos,
    };

    try {
      setIsSubmitting(true);
      const { data, error } = await datingAPI.createApplication(payload);

      if (error || !data) {
        console.error("신청 카드 생성 오류:", error);
        alert("신청 카드 생성 중 오류가 발생했습니다.");
        return;
      }

      alert("신청이 완료되었습니다!");
      setShowApplyModal(false);
    } catch (err) {
      console.error("신청 카드 생성 중 예외:", err);
      alert("신청 카드 생성 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCard = async () => {
    if (!card) return;

    const confirmed = window.confirm(
      "정말 이 소개팅 카드를 삭제하시겠습니까?\n\n삭제 시 이 카드에 신청한 모든 신청 내역도 함께 삭제됩니다."
    );
    if (!confirmed) return;

    try {
      const { error } = await datingAPI.deleteCard(card.id);
      if (error) {
        console.error("소개팅 카드 삭제 오류:", error);
        alert("소개팅 카드 삭제 중 오류가 발생했습니다.");
        return;
      }

      alert("소개팅 카드가 삭제되었습니다.");
      router.push("/dating");
    } catch (err) {
      console.error("소개팅 카드 삭제 중 예외:", err);
      alert("소개팅 카드 삭제 중 오류가 발생했습니다.");
    }
  };

  if (cardLoading) {
    return (
      <div className="mx-auto max-w-3xl">
        <button
          onClick={() => router.push("/dating")}
          className="inline-flex items-center mb-6 text-sm text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400"
        >
          <ArrowLeft className="mr-1 w-4 h-4" />
          소개팅 목록으로 돌아가기
        </button>
        <div className="p-8 space-y-4 bg-white rounded-xl border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700">
          <div className="w-40 h-6 bg-gray-200 rounded animate-pulse dark:bg-gray-700" />
          <div className="w-full h-4 bg-gray-200 rounded animate-pulse dark:bg-gray-700" />
          <div className="w-5/6 h-4 bg-gray-200 rounded animate-pulse dark:bg-gray-700" />
        </div>
      </div>
    );
  }

  if (!card || cardError) {
    return (
      <div className="mx-auto max-w-3xl">
        <button
          onClick={() => router.push("/dating")}
          className="inline-flex items-center mb-6 text-sm text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400"
        >
          <ArrowLeft className="mr-1 w-4 h-4" />
          소개팅 목록으로 돌아가기
        </button>
        <div className="p-8 text-center bg-white rounded-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          <p className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
            {cardError || "해당 소개팅 카드를 찾을 수 없습니다."}
          </p>
          <p className="mb-4 text-gray-600 dark:text-gray-400">
            링크가 잘못되었거나 삭제된 카드일 수 있어요.
          </p>
          <button
            onClick={() => router.push("/dating")}
            className="px-5 py-2 text-sm font-medium text-white rounded-lg bg-primary-600 hover:bg-primary-700"
          >
            소개팅 목록 보기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* 상단 네비게이션 */}
      <button
        onClick={() => router.push("/dating")}
        className="inline-flex items-center mb-6 text-sm text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400"
      >
        <ArrowLeft className="mr-1 w-4 h-4" />
        소개팅 목록으로 돌아가기
      </button>

      {/* 메인 카드 */}
      <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700">
        {/* 기본 정보 */}
        <div className="flex gap-4 items-center mb-6">
          <UserAvatar
            imageUrl={card.photos[0] || ""}
            userName={card.user_name}
            gender={card.user_gender}
            size="lg"
          />
          <div className="flex-1">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {card.user_name}
              </span>
              <span className="text-lg text-gray-700 dark:text-gray-300">
                ({card.user_age}세)
              </span>
              {card.mbti && <MbtiBadge mbti={card.mbti} size="sm" />}
            </div>
            <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-600 dark:text-gray-400">
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {card.location}
              </span>
              <span className="inline-flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                등록일 {new Date(card.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* 사진 - 최대 3장 모두 표시 */}
        {card.photos && card.photos.length > 0 && (
          <section className="py-4 border-t border-gray-100 dark:border-gray-700">
            <h2 className="mb-2 text-sm font-semibold text-gray-500 uppercase tracking-wide dark:text-gray-400">
              사진
            </h2>
            <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
              첫 번째 사진은 대표 이미지로 사용되며, 최대 3장까지 등록할 수 있습니다.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {card.photos.map((src, index) => (
                <div
                  key={`${src}-${index}`}
                  className="relative overflow-hidden rounded-lg bg-gray-50 dark:bg-gray-800"
                >
                  <img
                    src={src}
                    alt={`소개팅 사진 ${index + 1}`}
                    className="w-full h-auto"
                    loading="lazy"
                  />
                  <div className="absolute top-1 left-1 px-2 py-0.5 text-[10px] font-medium text-white rounded bg-black/50">
                    {index === 0 ? "대표 이미지" : `사진 ${index + 1}`}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 자기소개 */}
        <section className="py-4 border-t border-gray-100 dark:border-gray-700">
          <h2 className="mb-2 text-sm font-semibold text-gray-500 uppercase tracking-wide dark:text-gray-400">
            자기소개
          </h2>
          <p className="text-base leading-relaxed text-gray-800 whitespace-pre-line dark:text-gray-200">
            {card.introduction}
          </p>
        </section>

        {/* 라이프스타일 */}
        <section className="py-4 border-t border-gray-100 dark:border-gray-700">
          <h2 className="mb-3 text-sm font-semibold text-gray-500 uppercase tracking-wide dark:text-gray-400">
            라이프스타일
          </h2>
          <div className="flex flex-wrap gap-3 text-sm">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 text-gray-700 dark:bg-gray-700 dark:text-gray-200">
              <Cigarette className="w-4 h-4" />
              <span>흡연: {card.smoke}</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 text-gray-700 dark:bg-gray-700 dark:text-gray-200">
              <Wine className="w-4 h-4" />
              <span>음주: {card.alcohol}</span>
            </div>
          </div>
        </section>

        {/* 관심사 */}
        <section className="py-4 border-t border-gray-100 dark:border-gray-700">
          <h2 className="mb-3 text-sm font-semibold text-gray-500 uppercase tracking-wide dark:text-gray-400">
            관심사
          </h2>
          <div className="flex flex-wrap gap-2">
            {card.interests.map((interest, idx) => (
              <span
                key={idx}
                className="px-3 py-1 text-xs font-medium text-primary-700 bg-primary-50 rounded-full dark:bg-primary-900/30 dark:text-primary-300"
              >
                {interest}
              </span>
            ))}
          </div>
        </section>

        {/* 매력 포인트 & 취미/특기 */}
        <section className="grid gap-4 py-4 border-t border-gray-100 md:grid-cols-2 dark:border-gray-700">
          <div>
            <h2 className="mb-2 text-sm font-semibold text-gray-500 uppercase tracking-wide dark:text-gray-400">
              본인이 생각하는 매력 포인트
            </h2>
            <p className="text-sm text-gray-800 whitespace-pre-line dark:text-gray-200">
              {card.charm_appeal}
            </p>
          </div>
          <div>
            <h2 className="mb-2 text-sm font-semibold text-gray-500 uppercase tracking-wide dark:text-gray-400">
              취미 & 특기
            </h2>
            <div className="space-y-1.5 text-sm text-gray-800 dark:text-gray-200">
              <p>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  취미:{" "}
                </span>
                {card.hobbies}
              </p>
              <p>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  특기:{" "}
                </span>
                {card.special_skills}
              </p>
            </div>
          </div>
        </section>

        {/* 이상형 & 연애 스타일 */}
        <section className="py-4 border-t border-gray-100 space-y-4 dark:border-gray-700">
          <div>
            <h2 className="mb-2 text-sm font-semibold text-gray-500 uppercase tracking-wide dark:text-gray-400">
              외적 이상형
            </h2>
            <p className="text-sm text-gray-800 whitespace-pre-line dark:text-gray-200">
              {card.ideal_physical_type}
            </p>
          </div>
          <div>
            <h2 className="mb-2 text-sm font-semibold text-gray-500 uppercase tracking-wide dark:text-gray-400">
              내적 이상형
            </h2>
            <p className="text-sm text-gray-800 whitespace-pre-line dark:text-gray-200">
              {card.ideal_personality_type}
            </p>
          </div>
          <div>
            <h2 className="mb-2 text-sm font-semibold text-gray-500 uppercase tracking-wide dark:text-gray-400">
              연애 스타일
            </h2>
            <p className="text-sm text-gray-800 whitespace-pre-line dark:text-gray-200">
              {card.dating_style}
            </p>
          </div>
        </section>

        {/* 하단 액션 영역 */}
        <div className="flex flex-wrap gap-3 justify-between items-center pt-4 mt-2 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
            <Sparkles className="w-4 h-4 text-primary-500" />
            <span>
              {isOwner
                ? "주선자 본인 화면입니다. 카드 관리 및 신청자 확인에 활용하세요."
                : "마음에 들면 신청하기 버튼을 눌러보세요"}
            </span>
          </div>
          <div className="flex flex-wrap gap-2 justify-end">
            {isOwner ? (
              <>
                <button
                  onClick={() => router.push(`/dating/${card.id}/edit`)}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                  카드 수정하기
                </button>
                <button
                  onClick={handleDeleteCard}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white rounded-lg bg-red-600 hover:bg-red-700"
                >
                  카드 삭제하기
                </button>
                <button
                  onClick={() => router.push("/dating")}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                  다른 카드 보러가기
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    if (!user) {
                      setShowLoginModal(true);
                    } else {
                      setShowApplyModal(true);
                    }
                  }}
                  className="inline-flex items-center px-5 py-2 text-sm font-medium text-white rounded-lg bg-primary-600 hover:bg-primary-700"
                >
                  <Heart className="mr-2 w-4 h-4" />
                  신청하기
                </button>
                <button
                  onClick={() => router.push("/dating")}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                  <User className="mr-2 w-4 h-4" />
                  다른 카드 보러가기
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 신청 카드 작성 모달 */}
      {showApplyModal && (
        <div className="flex fixed inset-0 z-50 justify-center items-center bg-black/50">
          <div className="relative p-6 mx-4 w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-xl dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  신청 카드 작성하기
                </h3>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  아래 정보를 바탕으로 주선자가 두 분을 연결해 줄 수 있어요.
                </p>
              </div>
              <button
                onClick={() => setShowApplyModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplySubmit} className="space-y-4 text-sm">
              {/* 기본 정보 */}
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">
                    이름
                  </label>
                  <input
                    type="text"
                    value={applyForm.name}
                    onChange={handleApplyChange("name")}
                    className="px-3 py-2 w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="예: 홍길동"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">
                    나이
                  </label>
                  <input
                    type="text"
                    value={applyForm.age}
                    onChange={handleApplyChange("age")}
                    className="px-3 py-2 w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="예: 29"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">
                    휴대전화번호
                  </label>
                  <input
                    type="tel"
                    value={applyForm.phone}
                    onChange={handleApplyChange("phone")}
                    className="px-3 py-2 w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="예: 010-1234-5678"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">
                    성별
                  </label>
                  <select
                    value={applyForm.gender}
                    onChange={handleApplyChange("gender")}
                    className="px-3 py-2 w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="male">남성</option>
                    <option value="female">여성</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">
                  사는 지역
                </label>
                <input
                  type="text"
                  value={applyForm.location}
                  onChange={handleApplyChange("location")}
                  className="px-3 py-2 w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="예: 서울 마포구"
                />
              </div>

              {/* MBTI / 라이프스타일 */}
              <div className="grid gap-3 md:grid-cols-3">
                <div>
                  <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">
                    MBTI
                  </label>
                  <select
                    value={applyForm.mbti}
                    onChange={handleApplyChange("mbti")}
                    className="px-3 py-2 w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                  <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">
                    흡연
                  </label>
                  <input
                    type="text"
                    value={applyForm.smoke}
                    onChange={handleApplyChange("smoke")}
                    className="px-3 py-2 w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="예: 비흡연 / 가끔 피움"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">
                    음주
                  </label>
                  <input
                    type="text"
                    value={applyForm.alcohol}
                    onChange={handleApplyChange("alcohol")}
                    className="px-3 py-2 w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="예: 가끔 마셔요 / 거의 안 마셔요"
                  />
                </div>
              </div>

              {/* 매력 어필 & 연애 스타일 */}
              <div>
                <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">
                  매력 어필
                </label>
                <textarea
                  value={applyForm.charm_appeal}
                  onChange={handleApplyChange("charm_appeal")}
                  className="px-3 py-2 w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={3}
                  placeholder="본인이 생각하는 매력 포인트를 적어주세요."
                />
              </div>

              <div>
                <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">
                  연애 스타일
                </label>
                <textarea
                  value={applyForm.dating_style}
                  onChange={handleApplyChange("dating_style")}
                  className="px-3 py-2 w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={2}
                  placeholder="예: 자주 연락하는 편, 천천히 깊게 알아가는 스타일 등"
                />
              </div>

              {/* 신청자 사진 */}
              <div>
                <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">
                  신청자 사진 (선택, 최대 3장)
                </label>
                <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                  첫 번째 사진이 대표 이미지로 사용됩니다.
                </p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleApplyPhotosChange}
                  className="block mb-3 text-xs text-gray-700 dark:text-gray-200"
                />

                {applyForm.photos.length > 0 && (
                  <div className="grid gap-3 sm:grid-cols-3">
                    {applyForm.photos.map((src, index) => (
                      <div
                        key={src}
                        className="relative overflow-hidden border rounded-lg border-gray-200 dark:border-gray-600"
                      >
                        <img
                          src={src}
                          alt={`신청자 사진 ${index + 1}`}
                          className="object-cover w-full h-24"
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
                              onClick={() => moveApplyPhoto(index, -1)}
                              className="px-1 text-[10px] text-white bg-black/40 rounded hover:bg-black/60"
                            >
                              ↑
                            </button>
                          )}
                          {index < applyForm.photos.length - 1 && (
                            <button
                              type="button"
                              onClick={() => moveApplyPhoto(index, 1)}
                              className="px-1 text-[10px] text-white bg-black/40 rounded hover:bg-black/60"
                            >
                              ↓
                            </button>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeApplyPhoto(index)}
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
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  닫기
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-medium text-white rounded-md bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
                >
                  {isSubmitting ? "신청 중..." : "신청 카드 작성하기"}
                </button>
              </div>
            </form>
          </div>
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


