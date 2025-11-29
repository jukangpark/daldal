"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Calendar,
  Plus,
  Loader2,
  User,
  Trash2,
  HelpCircle,
} from "lucide-react";
import UserAvatar from "@/components/UserAvatar";
import SelfIntroductionCard from "@/components/SelfIntroductionCard";
import { useAuth } from "@/contexts/AuthContext";
import selfIntroductionAPI from "@/lib/api/self-introduction";
import superDateAPI from "@/lib/api/super-date";
import datingAPI from "@/lib/api/dating";
import type {
  SelfIntroduction,
  DatingCardRow,
  DatingApplicationRow,
} from "@/lib/types";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [selfIntro, setSelfIntro] = useState<SelfIntroduction | null>(null);
  const [loadingSelfIntro, setLoadingSelfIntro] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 나를 선택한 이성 정보
  const [peopleWhoSelectedMe, setPeopleWhoSelectedMe] = useState<
    Array<{
      id: string;
      name: string;
      age: number;
      location: string;
      photo: string;
      introduction: string;
      created_at: string;
      introduction_id: string;
    }>
  >([]);

  const [loadingPeopleWhoSelectedMe, setLoadingPeopleWhoSelectedMe] =
    useState(true);

  // 연결된 이성 정보
  const [connectedPeople, setConnectedPeople] = useState<
    Array<{
      id: string;
      name: string;
      age: number;
      location: string;
      photo: string;
      introduction: string;
      matched_at: string;
      introduction_id: string;
      user_gender: "male" | "female";
    }>
  >([]);

  const [loadingConnectedPeople, setLoadingConnectedPeople] = useState(true);

  // 슈퍼 데이트 신청 관련 상태 (introductions 페이지에서 가져온 것)
  const [remainingRequests, setRemainingRequests] = useState<number>(2);

  // 슈퍼 데이트 신청권 상태
  const [hasSuperDateTicket, setHasSuperDateTicket] = useState(false);

  // 삭제 관련 상태
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // 사진 슬라이더 상태
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  // 소개팅 카드 & 신청 관련 상태
  const [myDatingCards, setMyDatingCards] = useState<DatingCardRow[]>([]);
  const [myCardsApplications, setMyCardsApplications] = useState<
    Record<string, DatingApplicationRow[]>
  >({});
  const [loadingMyDatingCards, setLoadingMyDatingCards] = useState(true);

  const [myApplications, setMyApplications] = useState<DatingApplicationRow[]>(
    []
  );
  const [loadingMyApplications, setLoadingMyApplications] = useState(true);

  // 로그인 상태 확인 및 자소설 데이터 로드
  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
      return;
    }

    if (user) {
      loadSelfIntroduction();
      loadPeopleWhoSelectedMe();
      loadConnectedPeople();
      loadMyDatingData();
    }
  }, [user, loading, router]);

  // 자소설 데이터 로드
  const loadSelfIntroduction = async () => {
    try {
      setLoadingSelfIntro(true);

      // 디버깅: 모든 자소설 확인
      const { data: allIntros, error: allError } =
        await selfIntroductionAPI.getAllByUserId(user!.id);

      const { data, error } = await selfIntroductionAPI.getByUserId(user!.id);

      if (error) {
        console.error("자소설 로드 오류:", error);
        // 자소설이 없는 경우는 에러가 아님
        if (error.code === "PGRST116") {
          setSelfIntro(null);
          setError(null);
        } else {
          setError("자소설을 불러오는 중 오류가 발생했습니다.");
        }
      } else {
        setSelfIntro(data);
        setError(null);
      }
    } catch (err) {
      console.error("자소설 로드 오류:", err);
      setError("자소설을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoadingSelfIntro(false);
    }
  };

  // 내가 작성한 소개팅 카드 & 해당 카드의 신청 목록 + 내가 신청한 카드 목록 로드
  const loadMyDatingData = async () => {
    if (!user) return;

    // 내가 작성한 카드들
    try {
      setLoadingMyDatingCards(true);
      const { data: cards, error } = await datingAPI.getCardsByMatchmaker();
      if (error) {
        console.error("내 소개팅 카드 로드 오류:", error);
      }
      const safeCards = cards || [];
      setMyDatingCards(safeCards);

      // 해당 카드들에 대한 신청 목록 한 번에 가져오기
      if (safeCards.length > 0) {
        const cardIds = safeCards.map((c) => c.id);
        const { data: apps, error: appError } = await supabase
          .from("dating_applications")
          .select("*")
          .in("dating_card_id", cardIds)
          .order("created_at", { ascending: false });

        if (appError) {
          console.error("소개팅 신청 목록 로드 오류:", appError);
          setMyCardsApplications({});
        } else {
          const grouped: Record<string, DatingApplicationRow[]> = {};
          (apps as DatingApplicationRow[] | null)?.forEach((app) => {
            if (!grouped[app.dating_card_id]) {
              grouped[app.dating_card_id] = [];
            }
            grouped[app.dating_card_id].push(app);
          });
          setMyCardsApplications(grouped);
        }
      } else {
        setMyCardsApplications({});
      }
    } catch (err) {
      console.error("내 소개팅 카드 로드 중 예외:", err);
    } finally {
      setLoadingMyDatingCards(false);
    }

    // 내가 신청한 카드들
    try {
      setLoadingMyApplications(true);
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      if (!currentUser) {
        setMyApplications([]);
        return;
      }

      const { data, error } = await supabase
        .from("dating_applications")
        .select("*")
        .eq("applicant_user_id", currentUser.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("내 신청 카드 목록 로드 오류:", error);
        setMyApplications([]);
      } else {
        setMyApplications((data as DatingApplicationRow[]) || []);
      }
    } catch (err) {
      console.error("내 신청 카드 목록 로드 중 예외:", err);
      setMyApplications([]);
    } finally {
      setLoadingMyApplications(false);
    }
  };

  // 나를 선택한 이성 데이터 로드 (익명 처리)
  const loadPeopleWhoSelectedMe = async () => {
    try {
      setLoadingPeopleWhoSelectedMe(true);

      // 내가 받은 신청들 가져오기
      const { data: receivedRequests, error: receivedError } =
        await superDateAPI.getReceivedByUserId(user!.id);

      if (receivedError) {
        console.error("받은 신청 로드 오류:", receivedError);
        return;
      }

      // 내가 보낸 신청들 가져오기 (매칭 확인용)
      const { data: sentRequests, error: sentError } =
        await superDateAPI.getSentByUserId(user!.id);

      if (sentError) {
        console.error("보낸 신청 로드 오류:", sentError);
        return;
      }

      // 나를 선택했지만 내가 아직 선택하지 않은 사람들 찾기 (익명 처리)
      const peopleWhoSelectedMeData: Array<{
        id: string;
        name: string;
        age: number;
        location: string;
        photo: string;
        introduction: string;
        created_at: string;
        introduction_id: string;
      }> = [];

      for (const receivedRequest of receivedRequests || []) {
        // 내가 이 사람을 선택했는지 확인
        const didISelectThem = sentRequests?.some(
          (sent) => sent.target_id === receivedRequest.requester_id
        );

        // 내가 아직 선택하지 않은 경우만 포함
        if (!didISelectThem) {
          // 익명으로 처리 - 실제 정보는 가져오지 않음
          peopleWhoSelectedMeData.push({
            id: receivedRequest.requester_id,
            name: "익명", // 익명 처리
            age: 0, // 나이 숨김
            location: "비공개", // 지역 숨김
            photo: "/default-avatar.png", // 기본 아바타
            introduction:
              "이 사람이 나를 선택했습니다. 슈퍼 데이트 신청을 통해 서로를 알아갈 수 있습니다.", // 기본 메시지
            created_at: receivedRequest.created_at,
            introduction_id: "", // 자소설 ID 숨김
          });
        }
      }

      setPeopleWhoSelectedMe(peopleWhoSelectedMeData);
    } catch (err) {
      console.error("나를 선택한 이성 로드 오류:", err);
    } finally {
      setLoadingPeopleWhoSelectedMe(false);
    }
  };

  // 슈퍼 데이트 신청하기
  const handleSuperDateRequest = async (
    targetId: string,
    targetName: string
  ) => {
    if (!user) {
      alert("로그인이 필요합니다.");
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

    try {
      const { data, error } = await superDateAPI.create({
        target_id: targetId,
        target_name: targetName,
      });

      if (error) {
        console.error("슈퍼 데이트 신청 오류:", error);
        alert("슈퍼 데이트 신청에 실패했습니다.");
      } else {
        setRemainingRequests((prev) => Math.max(0, prev - 1));
        alert("슈퍼 데이트 신청이 완료되었습니다!");
        // 데이터 새로고침
        loadPeopleWhoSelectedMe();
        loadConnectedPeople();
      }
    } catch (err) {
      console.error("슈퍼 데이트 신청 오류:", err);
      alert("슈퍼 데이트 신청에 실패했습니다.");
    }
  };

  // 연결된 이성 데이터 로드
  const loadConnectedPeople = async () => {
    try {
      setLoadingConnectedPeople(true);

      // 내가 보낸 신청들 가져오기
      const { data: sentRequests, error: sentError } =
        await superDateAPI.getSentByUserId(user!.id);

      if (sentError) {
        console.error("보낸 신청 로드 오류:", sentError);
        return;
      }

      // 내가 받은 신청들 가져오기
      const { data: receivedRequests, error: receivedError } =
        await superDateAPI.getReceivedByUserId(user!.id);

      if (receivedError) {
        console.error("받은 신청 로드 오류:", receivedError);
        return;
      }

      // 서로 신청한 사람들 찾기 (매칭)
      const connectedPeopleData: Array<{
        id: string;
        name: string;
        age: number;
        location: string;
        photo: string;
        introduction: string;
        matched_at: string;
        introduction_id: string; // 자소설 ID 추가
        user_gender: "male" | "female";
      }> = [];

      for (const sentRequest of sentRequests || []) {
        const isMatched = receivedRequests?.some(
          (received) => received.requester_id === sentRequest.target_id
        );

        if (isMatched) {
          // 매칭된 사람의 자소설 정보 가져오기
          const { data: introData } = await selfIntroductionAPI.getByUserId(
            sentRequest.target_id
          );

          if (introData) {
            connectedPeopleData.push({
              id: sentRequest.target_id,
              name: sentRequest.target_name,
              age: introData.user_age,
              location: introData.user_location,
              photo: introData.photos?.[0] || "/default-avatar.png",
              introduction: introData.content,
              matched_at: sentRequest.created_at,
              introduction_id: introData.id, // 자소설 ID 저장
              user_gender: introData.user_gender || "male",
            });
          }
        }
      }

      setConnectedPeople(connectedPeopleData);
    } catch (err) {
      console.error("연결된 이성 로드 오류:", err);
    } finally {
      setLoadingConnectedPeople(false);
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
            나의 프로필과 자소설을 관리하세요
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
  const handleUseSuperDateTicket = (personName: string) => {
    if (
      confirm(
        `${personName}님과 슈퍼 데이트를 진행하시겠습니까?\n\n이 데이트는 필수로 진행되어야 합니다.`
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

  // 자소설 삭제 처리
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

        // 비밀번호가 맞으면 자소설 삭제
        const { error: deleteError } = await selfIntroductionAPI.delete(
          selfIntro!.id
        );

        if (deleteError) {
          setDeleteError("삭제 중 오류가 발생했습니다.");
          return;
        }

        alert("자소설이 삭제되었습니다.");
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
          나의 프로필과 자소설을 관리하세요
        </p>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          로그인된 사용자: {user.user_metadata?.name || user.email}
        </p>
      </div>

      {/* 자소설 내용 */}
      {selfIntro ? (
        <SelfIntroductionCard
          introduction={selfIntro}
          showEditButtons={true}
          onDelete={async (id) => {
            // 삭제 로직은 기존 모달에서 처리하므로 여기서는 모달만 열기
            setShowDeleteModal(true);
          }}
        />
      ) : (
        <div className="card">
          <div className="py-12 text-center">
            <p className="mb-4 text-lg text-gray-500 dark:text-gray-300">
              아직 자소설을 작성하지 않았습니다.
            </p>
            <Link
              href="/introductions/write"
              className="inline-flex items-center btn-primary"
            >
              <Plus className="mr-2 w-4 h-4" />
              자소설 작성하기
            </Link>
          </div>
        </div>
      )}

      {/* 나를 선택한 이성 정보 */}
      <div className="mt-8">
        <div className="card">
          <div className="mb-6">
            <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
              나를 선택한 이성 : {peopleWhoSelectedMe.length}명
            </h2>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <HelpCircle className="mr-1 w-4 h-4" />
              <span>나를 선택했지만 아직 내가 선택하지 않은 사람들</span>
            </div>
          </div>

          {loadingPeopleWhoSelectedMe ? (
            <div className="py-12 text-center">
              <div className="flex justify-center items-center mx-auto mb-4 w-16 h-16">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
              </div>
              <p className="text-lg text-gray-500 dark:text-gray-400">
                나를 선택한 이성을 불러오는 중...
              </p>
            </div>
          ) : peopleWhoSelectedMe.length > 0 ? (
            <div className="space-y-6">
              {peopleWhoSelectedMe.map((person, index) => (
                <div
                  key={person.id}
                  className="p-4 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* 익명 프로필 */}
                    <div className="flex items-start space-x-4">
                      <div className="flex justify-center items-center w-20 h-20 bg-gray-100 rounded-full dark:bg-gray-700">
                        <HelpCircle className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                          익명
                        </h3>
                        <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-300">
                          <div className="flex items-center">
                            <span className="text-gray-500 dark:text-gray-400">
                              나를 선택한 사람
                            </span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              선택한 날:{" "}
                              {new Date(person.created_at).toLocaleDateString(
                                "ko-KR"
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <div className="flex justify-center items-center mx-auto mb-4 w-16 h-16 bg-gray-100 rounded-full dark:bg-gray-700">
                <HelpCircle className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
              <p className="text-lg text-gray-500 dark:text-gray-400">
                아직 나를 선택한 이성이 없습니다
              </p>
              <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
                자소설을 작성하고 다른 사람들에게 어필해보세요
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 연결된 이성 정보 */}
      <div className="mt-8">
        <div className="card">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              🎉 연결된 이성 :{connectedPeople.length}명 🎉
            </h2>
          </div>

          <div className="flex items-center mb-6 text-sm text-gray-500 dark:text-gray-400">
            <HelpCircle className="mr-1 w-4 h-4" />
            <span>서로 선택하여 연결된 이성들</span>
          </div>

          {loadingConnectedPeople ? (
            <div className="py-12 text-center">
              <div className="flex justify-center items-center mx-auto mb-4 w-16 h-16">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
              </div>
              <p className="text-lg text-gray-500 dark:text-gray-400">
                연결된 이성을 불러오는 중...
              </p>
            </div>
          ) : connectedPeople.length > 0 ? (
            <div className="space-y-6">
              {connectedPeople.map((person, index) => (
                <div
                  key={person.id}
                  className="p-4 rounded-lg border border-gray-200 transition-all duration-200 cursor-pointer dark:border-gray-700"
                  onClick={() =>
                    router.push(`/introductions/${person.introduction_id}`)
                  }
                >
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* 상대방 프로필 */}
                    <div className="flex items-start space-x-4">
                      <UserAvatar
                        imageUrl={
                          person.photo !== "/default-avatar.png"
                            ? person.photo
                            : null
                        }
                        userName={person.name}
                        gender={person.user_gender}
                        size="lg"
                        isVVIP={false}
                      />
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                          {person.name}
                        </h3>
                        <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-300">
                          <div className="flex items-center">
                            <Calendar className="mr-2 w-4 h-4" />
                            {person.age}세
                          </div>
                          <div className="flex items-center">
                            <MapPin className="mr-2 w-4 h-4" />
                            {person.location}
                          </div>
                          <div className="flex items-center">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              매칭된 날:{" "}
                              {new Date(person.matched_at).toLocaleDateString(
                                "ko-KR"
                              )}
                            </span>
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
                        {person.introduction}
                      </p>
                      <div className="flex mt-4 space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // 카드 클릭 이벤트 방지
                            router.push(`/chat/${person.id}`);
                          }}
                          className="px-4 py-2 text-sm text-white bg-green-600 rounded-lg shadow-sm transition-colors hover:bg-green-700"
                        >
                          💬 1:1 대화하기
                        </button>
                        {hasSuperDateTicket && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // 카드 클릭 이벤트 방지
                              handleUseSuperDateTicket(person.name);
                            }}
                            className="px-4 py-2 text-sm text-white rounded-lg shadow-sm transition-colors bg-primary-600 hover:bg-primary-700"
                          >
                            슈퍼데이트 신청
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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
                자소설 목록에서 마음에 드는 상대에게 슈퍼 데이트를 신청해보세요
              </p>
              <div className="mt-4">
                <Link
                  href="/introductions"
                  className="inline-flex items-center px-4 py-2 text-white rounded-lg transition-colors bg-primary-600 hover:bg-primary-700"
                >
                  <User className="mr-2 w-4 h-4" />
                  자소설 목록 보기
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 내가 작성한 소개팅 카드 목록 */}
      <div className="mt-8">
        <div className="card">
          <div className="mb-4">
            <h2 className="mb-1 text-2xl font-bold text-gray-900 dark:text-white">
              내가 작성한 소개팅 카드
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              각 카드별 신청자 목록과 승인 상태를 확인할 수 있습니다.
            </p>
          </div>

          {loadingMyDatingCards ? (
            <div className="py-8 space-y-3">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="p-4 rounded-lg border border-gray-200 animate-pulse dark:border-gray-700"
                >
                  <div className="w-40 h-4 mb-2 bg-gray-200 rounded dark:bg-gray-700" />
                  <div className="w-64 h-3 bg-gray-200 rounded dark:bg-gray-700" />
                </div>
              ))}
            </div>
          ) : myDatingCards.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                아직 작성한 소개팅 카드가 없습니다.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {myDatingCards.map((card) => {
                const apps = myCardsApplications[card.id] || [];
                const pendingCount = apps.filter(
                  (a) => a.status === "pending"
                ).length;
                const approvedCount = apps.filter(
                  (a) => a.status === "approved"
                ).length;
                const rejectedCount = apps.filter(
                  (a) => a.status === "rejected"
                ).length;

                return (
                  <div
                    key={card.id}
                    className="p-4 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {card.user_name} ({card.user_age}세)
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {card.location}
                          {card.mbti && ` · ${card.mbti}`}
                        </p>
                      </div>
                      <button
                        onClick={() => router.push(`/dating/${card.id}`)}
                        className="px-3 py-1 text-xs font-medium text-primary-600 bg-primary-50 rounded-md hover:bg-primary-100 dark:bg-primary-900/20 dark:text-primary-300"
                      >
                        카드 보러가기
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-3 mb-3 text-xs text-gray-600 dark:text-gray-300">
                      <span>
                        전체 신청: <b>{apps.length}</b>개
                      </span>
                      <span>
                        승인: <b>{approvedCount}</b>개
                      </span>
                      <span>
                        대기: <b>{pendingCount}</b>개
                      </span>
                      <span>
                        거절: <b>{rejectedCount}</b>개
                      </span>
                    </div>

                    {apps.length > 0 ? (
                      <div className="space-y-2">
                        <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                          신청자 목록
                        </h3>
                        {apps.map((app) => (
                          <div
                            key={app.id}
                            className="flex flex-wrap gap-3 justify-between items-center px-3 py-2 text-xs rounded-md border border-gray-100 dark:border-gray-700"
                          >
                            <div className="space-y-1">
                              <div className="flex flex-wrap gap-2 items-center">
                                <span className="font-semibold text-gray-900 dark:text-white">
                                  {app.name} ({app.age}세,{" "}
                                  {app.gender === "male" ? "남성" : "여성"})
                                </span>
                                {app.location && (
                                  <span className="text-gray-500 dark:text-gray-400">
                                    · {app.location}
                                  </span>
                                )}
                                {app.mbti && (
                                  <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-200">
                                    {app.mbti}
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-wrap gap-2 text-gray-600 dark:text-gray-300">
                                {app.charm_appeal && (
                                  <span>매력: {app.charm_appeal}</span>
                                )}
                                {app.dating_style && (
                                  <span>연애 스타일: {app.dating_style}</span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] text-gray-500 dark:text-gray-400">
                                  상태:
                                </span>
                                <span
                                  className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                                    app.status === "approved"
                                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                                      : app.status === "rejected"
                                      ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                                      : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                                  }`}
                                >
                                  {app.status === "approved"
                                    ? "승인"
                                    : app.status === "rejected"
                                    ? "거절"
                                    : "대기"}
                                </span>
                              </div>
                              {app.status === "approved" && (
                                <div className="text-[11px] text-green-600 dark:text-green-400">
                                  연락처: {app.phone}
                                </div>
                              )}
                            </div>

                            <div className="flex flex-wrap gap-1">
                              <button
                                type="button"
                                onClick={() =>
                                  router.push(`/dating/applications/${app.id}`)
                                }
                                className="px-2 py-1 text-[11px] font-medium text-primary-600 bg-primary-50 rounded border border-primary-100 hover:bg-primary-100 dark:bg-primary-900/20 dark:text-primary-300"
                              >
                                신청자 자세히 보기
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        아직 이 카드에 신청한 사람이 없습니다.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 내가 신청한 소개팅 카드 목록 */}
      <div className="mt-8 mb-8">
        <div className="card">
          <div className="mb-4">
            <h2 className="mb-1 text-2xl font-bold text-gray-900 dark:text-white">
              소개팅 신청 내역
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              내가 신청한 카드의 승인/대기/거절 상태를 확인할 수 있습니다.
            </p>
          </div>

          {loadingMyApplications ? (
            <div className="py-8 text-center">
              <Loader2 className="w-6 h-6 mx-auto mb-2 animate-spin text-primary-600" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                신청 내역을 불러오는 중...
              </p>
            </div>
          ) : myApplications.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                아직 신청한 소개팅 카드가 없습니다.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {myApplications.map((app) => (
                <div
                  key={app.id}
                  className="flex flex-wrap gap-3 justify-between items-center px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="space-y-1 text-xs">
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {app.name} ({app.age}세,{" "}
                        {app.gender === "male" ? "남성" : "여성"})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-gray-500 dark:text-gray-400">
                        상태:
                      </span>
                      <span
                        className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                          app.status === "approved"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                            : app.status === "rejected"
                            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                        }`}
                      >
                        {app.status === "approved"
                          ? "승인"
                          : app.status === "rejected"
                          ? "거절"
                          : "대기"}
                      </span>
                    </div>
                    {app.status === "approved" && (
                      <div className="px-3 py-2 mt-2 text-xs font-medium text-green-700 bg-green-50 rounded-lg border border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800">
                        🎉 축하드립니다! 곧 주선자에게 연락이 올거예요!
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-1 text-[11px] text-gray-400 dark:text-gray-500">
                    <span>
                      신청일:{" "}
                      {new Date(app.created_at).toLocaleDateString("ko-KR")}
                    </span>
                    <button
                      type="button"
                      onClick={() => router.push(`/dating/${app.dating_card_id}`)}
                      className="px-3 py-1 text-[11px] font-medium text-primary-600 bg-primary-50 rounded-md hover:bg-primary-100 dark:bg-primary-900/30 dark:text-primary-300"
                    >
                      신청한 카드 자세히 보기
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 삭제 확인 모달 */}
      {showDeleteModal && (
        <div className="flex fixed inset-0 z-50 justify-center items-center bg-black bg-opacity-50">
          <div className="p-6 w-full max-w-md bg-white rounded-lg shadow-xl dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              자소설 삭제
            </h3>
            <p className="mb-4 text-gray-600 dark:text-gray-300">
              자소설을 삭제하려면 비밀번호를 입력해주세요.
            </p>

            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                비밀번호
              </label>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                className="px-3 py-2 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
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
