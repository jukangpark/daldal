"use client";

import { useState, useEffect } from "react";
import {
  Heart,
  Send,
  User,
  MapPin,
  Calendar,
  Filter,
  Users,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  selfIntroductionAPI,
  superDateAPI,
  SelfIntroduction,
} from "@/lib/supabase";

export default function SuperDatePage() {
  const { user } = useAuth();
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [selectedGender, setSelectedGender] = useState<
    "all" | "male" | "female"
  >("all");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [introductions, setIntroductions] = useState<SelfIntroduction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // 자기소개서 데이터 로드
  useEffect(() => {
    const loadIntroductions = async () => {
      try {
        setLoading(true);
        const { data, error } = await selfIntroductionAPI.getAll();
        if (error) {
          console.error("자기소개서 로드 오류:", error);
          setError("자기소개서를 불러오는 중 오류가 발생했습니다.");
        } else {
          setIntroductions(data || []);
        }
      } catch (err) {
        console.error("자기소개서 로드 오류:", err);
        setError("자기소개서를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    loadIntroductions();
  }, []);

  const filteredUsers = introductions.filter((intro) => {
    const matchesGender =
      selectedGender === "all" || intro.user_gender === selectedGender;
    return matchesGender;
  });

  const genderStats = {
    male: introductions.filter((intro) => intro.user_gender === "male").length,
    female: introductions.filter((intro) => intro.user_gender === "female")
      .length,
    total: introductions.length,
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }

    if (!selectedUser || !message.trim()) {
      alert("상대방을 선택하고 메시지를 입력해주세요.");
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await superDateAPI.create({
        target_id: selectedUser,
        message: message.trim(),
      });

      if (error) {
        console.error("수퍼데이트 신청 오류:", error);
        alert("수퍼데이트 신청 중 오류가 발생했습니다.");
      } else {
        alert("수퍼데이트 신청이 완료되었습니다!");
        setSelectedUser(null);
        setMessage("");
      }
    } catch (error) {
      console.error("수퍼데이트 신청 오류:", error);
      alert("수퍼데이트 신청 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">
            수퍼 데이트 신청권
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-gray-600 dark:text-gray-300">
            마음에 드는 상대방에게 진심 어린 메시지와 함께 특별한 데이트를
            제안해보세요
          </p>
        </div>

        {/* 개발중 메시지 */}
        <div className="p-6 mb-8 bg-yellow-50 rounded-lg border border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-700">
          <div className="flex justify-center items-center space-x-3">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">
                현재 개발중입니다
              </h3>
              <p className="mt-1 text-yellow-700 dark:text-yellow-300">
                더 나은 서비스를 위해 열심히 개발하고 있습니다. 조금만
                기다려주세요!
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-center items-center py-20">
          <div className="flex items-center space-x-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            <span className="text-lg text-gray-600 dark:text-gray-300">
              데이터를 불러오는 중...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">
            수퍼 데이트 신청권
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-gray-600 dark:text-gray-300">
            마음에 드는 상대방에게 진심 어린 메시지와 함께 특별한 데이트를
            제안해보세요
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

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">
          수퍼 데이트 신청권
        </h1>
        <p className="mx-auto max-w-2xl text-xl text-gray-600 dark:text-gray-300">
          마음에 드는 상대방에게 진심 어린 메시지와 함께 특별한 데이트를
          제안해보세요
        </p>
      </div>

      {/* 개발중 메시지 */}
      <div className="p-6 mb-8 bg-yellow-50 rounded-lg border border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-700">
        <div className="flex justify-center items-center space-x-3">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">
              현재 개발중입니다
            </h3>
            <p className="mt-1 text-yellow-700 dark:text-yellow-300">
              더 나은 서비스를 위해 열심히 개발하고 있습니다. 조금만
              기다려주세요!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
