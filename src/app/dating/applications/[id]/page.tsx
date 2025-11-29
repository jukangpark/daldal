"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Phone, Calendar, MapPin } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import datingAPI from "@/lib/api/dating";
import type {
  DatingApplicationRow,
  DatingApplicationStatus,
  DatingCardRow,
} from "@/lib/types";

export default function DatingApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading } = useAuth();

  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id as string);

  const [application, setApplication] = useState<DatingApplicationRow | null>(
    null
  );
  const [card, setCard] = useState<DatingCardRow | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!id || !user || loading) return;

    const load = async () => {
      try {
        setLoadingDetail(true);
        const { application, card, error } = await datingAPI.getApplicationById(
          id
        );

        if (error || !application || !card) {
          console.error("신청 상세 로드 오류:", error);
          setError("신청 정보를 불러오는 중 오류가 발생했습니다.");
          return;
        }

        // 권한 확인: 주선자만 이 상세 화면을 볼 수 있게 제한
        if (card.matchmaker_user_id !== user.id) {
          setError("이 신청 정보를 볼 권한이 없습니다.");
          return;
        }

        setApplication(application);
        setCard(card);
        setError(null);
      } catch (err) {
        console.error("신청 상세 로드 중 예외:", err);
        setError("신청 정보를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoadingDetail(false);
      }
    };

    load();
  }, [id, user, loading]);

  const handleUpdateStatus = async (status: DatingApplicationStatus) => {
    if (!application) return;

    try {
      setUpdating(true);
      const { data, error } = await datingAPI.updateApplicationStatus(
        application.id,
        status
      );

      if (error || !data) {
        console.error("신청 상태 변경 오류:", error);
        alert("신청 상태 변경 중 오류가 발생했습니다.");
        return;
      }

      setApplication(data);
    } catch (err) {
      console.error("신청 상태 변경 중 예외:", err);
      alert("신청 상태 변경 중 오류가 발생했습니다.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading || loadingDetail) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="py-12 text-center">
          <div className="mx-auto w-12 h-12 rounded-full border-b-2 animate-spin border-primary-600" />
          <p className="mt-4 text-gray-600 dark:text-gray-300">
            신청 정보를 불러오는 중입니다...
          </p>
        </div>
      </div>
    );
  }

  if (error || !application || !card) {
    return (
      <div className="mx-auto max-w-3xl">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center mb-6 text-sm text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400"
        >
          <ArrowLeft className="mr-1 w-4 h-4" />
          뒤로가기
        </button>
        <div className="p-8 text-center bg-white rounded-xl border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700">
          <p className="mb-2 text-lg font-semibold text-red-600 dark:text-red-400">
            {error || "신청 정보를 찾을 수 없습니다."}
          </p>
        </div>
      </div>
    );
  }

  const statusLabel =
    application.status === "approved"
      ? "승인"
      : application.status === "rejected"
      ? "거절"
      : "대기";

  return (
    <div className="mx-auto max-w-3xl">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center mb-6 text-sm text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400"
      >
        <ArrowLeft className="mr-1 w-4 h-4" />
        뒤로가기
      </button>

      <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-md space-y-6 dark:bg-gray-800 dark:border-gray-700">
        <div>
          <h1 className="mb-1 text-2xl font-bold text-gray-900 dark:text-white">
            신청자 상세 정보
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {card.user_name} 소개팅 카드에 대한 신청자 정보를 확인하고 승인/거절을
            처리할 수 있습니다.
          </p>
        </div>

        {/* 신청한 카드 요약 */}
        <div className="p-4 rounded-lg bg-gray-50 text-sm space-y-1 dark:bg-gray-900/40">
          <p className="font-semibold text-gray-800 dark:text-gray-100">
            소개팅 카드: {card.user_name} ({card.user_age}세)
          </p>
          <p className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
            <MapPin className="w-4 h-4" />
            {card.location}
          </p>
          <p className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
            <Calendar className="w-4 h-4" />
            신청일{" "}
            {new Date(application.created_at).toLocaleDateString("ko-KR")}
          </p>
        </div>

        {/* 신청자 기본 정보 */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide dark:text-gray-400">
            신청자 기본 정보
          </h2>
          <div className="grid gap-4 text-sm md:grid-cols-2">
            <div>
              <p className="text-gray-500 dark:text-gray-400">이름</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {application.name}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">나이 / 성별</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {application.age}세 ·{" "}
                {application.gender === "male" ? "남성" : "여성"}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">사는 지역</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {application.location || "미입력"}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">MBTI</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {application.mbti || "미입력"}
              </p>
            </div>
          </div>
        </section>

        {/* 라이프스타일 & 자기 소개 */}
        <section className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 text-sm">
              <p className="text-gray-500 dark:text-gray-400">흡연</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {application.smoke || "미입력"}
              </p>
              <p className="mt-3 text-gray-500 dark:text-gray-400">음주</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {application.alcohol || "미입력"}
              </p>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-gray-500 dark:text-gray-400">연애 스타일</p>
              <p className="font-medium text-gray-900 whitespace-pre-line dark:text-gray-100">
                {application.dating_style || "미입력"}
              </p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <p className="text-gray-500 dark:text-gray-400">매력 어필</p>
            <p className="font-medium text-gray-900 whitespace-pre-line dark:text-gray-100">
              {application.charm_appeal || "미입력"}
            </p>
          </div>
        </section>

        {/* 신청자 사진 */}
        {application.photos && application.photos.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide dark:text-gray-400">
              신청자 사진
            </h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {application.photos.map((src, index) => (
                <div
                  key={`${src}-${index}`}
                  className="relative overflow-hidden rounded-lg bg-gray-50 dark:bg-gray-900/40"
                >
                  <img
                    src={src}
                    alt={`신청자 사진 ${index + 1}`}
                    className="w-full h-auto"
                  />
                  <div className="absolute top-1 left-1 px-2 py-0.5 text-[10px] font-medium text-white rounded bg-black/50">
                    {index === 0 ? "대표 이미지" : `사진 ${index + 1}`}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 상태 및 연락처 */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide dark:text-gray-400">
            신청 상태 & 연락처
          </h2>
          <div className="flex flex-wrap gap-3 items-center text-sm">
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200">
              현재 상태: {statusLabel}
            </span>

            {application.status === "approved" ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                <Phone className="w-4 h-4" />
                연락처: {application.phone}
              </span>
            ) : (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                승인을 누르면 상대방의 연락처가 여기에서 공개됩니다.
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleUpdateStatus("approved")}
              disabled={updating}
              className={`px-3 py-1 rounded text-xs border ${
                application.status === "approved"
                  ? "bg-green-600 text-white border-green-600"
                  : "bg-white text-green-600 border-green-400 dark:bg-gray-800"
              }`}
            >
              승인
            </button>
            <button
              type="button"
              onClick={() => handleUpdateStatus("pending")}
              disabled={updating}
              className={`px-3 py-1 rounded text-xs border ${
                application.status === "pending"
                  ? "bg-yellow-500 text-white border-yellow-500"
                  : "bg-white text-yellow-600 border-yellow-400 dark:bg-gray-800"
              }`}
            >
              대기
            </button>
            <button
              type="button"
              onClick={() => handleUpdateStatus("rejected")}
              disabled={updating}
              className={`px-3 py-1 rounded text-xs border ${
                application.status === "rejected"
                  ? "bg-red-600 text-white border-red-600"
                  : "bg-white text-red-600 border-red-400 dark:bg-gray-800"
              }`}
            >
              거절
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}


