"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  selfIntroductionAPI,
  SelfIntroduction,
  selfIntroductionCommentAPI,
  SelfIntroductionComment,
} from "@/lib/supabase";
import { ArrowLeft, Loader2, X, Send } from "lucide-react";
import SelfIntroductionCard from "@/components/SelfIntroductionCard";

export default function IntroductionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [introduction, setIntroduction] = useState<SelfIntroduction | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  // 댓글 관련 상태
  const [comments, setComments] = useState<SelfIntroductionComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState<"latest" | "oldest">("latest");

  useEffect(() => {
    const loadIntroduction = async () => {
      if (!params.id) return;

      try {
        setLoading(true);
        const { data, error } = await selfIntroductionAPI.getById(
          params.id as string
        );

        if (error) {
          console.error("자소설 로드 오류:", error);
          setError("자소설을 불러오는 중 오류가 발생했습니다.");
        } else if (data) {
          setIntroduction(data);
          // 조회수 증가
          await selfIntroductionAPI.incrementViews(params.id as string);
        } else {
          setError("자소설을 찾을 수 없습니다.");
        }
      } catch (err) {
        console.error("자소설 로드 오류:", err);
        setError("자소설을 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    loadIntroduction();
  }, [params.id]);

  // 댓글 로드
  useEffect(() => {
    const loadComments = async () => {
      if (!params.id) return;

      try {
        setCommentsLoading(true);
        const { data, error } = await selfIntroductionCommentAPI.getAll(
          params.id as string
        );

        if (error) {
          console.error("댓글 로드 오류:", error);
        } else if (data) {
          // 정렬 적용
          const sortedComments = [...data].sort((a, b) => {
            const dateA = new Date(a.created_at).getTime();
            const dateB = new Date(b.created_at).getTime();
            return sortOrder === "latest" ? dateB - dateA : dateA - dateB;
          });
          setComments(sortedComments);
        }
      } catch (err) {
        console.error("댓글 로드 오류:", err);
      } finally {
        setCommentsLoading(false);
      }
    };

    loadComments();
  }, [params.id, sortOrder]);

  // 댓글 작성
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim() || !params.id) return;

    try {
      setCommentLoading(true);
      const { data, error } = await selfIntroductionCommentAPI.create(
        params.id as string,
        newComment.trim(),
        user.user_metadata?.name || user.email
      );

      if (error) {
        console.error("댓글 작성 오류:", error);
        alert("댓글 작성에 실패했습니다.");
      } else if (data) {
        // 새 댓글을 정렬된 위치에 추가
        const newComments = [...comments, data].sort((a, b) => {
          const dateA = new Date(a.created_at).getTime();
          const dateB = new Date(b.created_at).getTime();
          return sortOrder === "latest" ? dateB - dateA : dateA - dateB;
        });
        setComments(newComments);
        setNewComment("");
      }
    } catch (err) {
      console.error("댓글 작성 오류:", err);
      alert("댓글 작성에 실패했습니다.");
    } finally {
      setCommentLoading(false);
    }
  };

  // 키보드 이벤트 처리
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (newComment.trim() && !commentLoading) {
        handleSubmitComment(e as any);
      }
    }
  };

  // 댓글 삭제
  const handleDeleteComment = async (commentId: string) => {
    if (!user) return;

    if (!confirm("댓글을 삭제하시겠습니까?")) return;

    try {
      const { error } = await selfIntroductionCommentAPI.delete(commentId);

      if (error) {
        console.error("댓글 삭제 오류:", error);
        alert("댓글 삭제에 실패했습니다.");
      } else {
        setComments((prev) =>
          prev.filter((comment) => comment.id !== commentId)
        );
      }
    } catch (err) {
      console.error("댓글 삭제 오류:", err);
      alert("댓글 삭제에 실패했습니다.");
    }
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      console.error("Invalid date:", dateString);
      return "날짜 오류";
    }

    // UTC 기준으로 날짜와 시간 표시 (오전/오후 구분)
    const formatted = date.toLocaleString("ko-KR", {
      timeZone: "UTC",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    // 0을 제거하여 "오후 9시 30분" 형태로 변환
    return formatted
      .replace(/오전 0(\d):/, "오전 $1:")
      .replace(/오후 0(\d):/, "오후 $1:")
      .replace(/오전 (\d+):/, "오전 $1시 ")
      .replace(/오후 (\d+):/, "오후 $1시 ")
      .replace(/:(\d+)/, "$1분");
  };

  if (loading) {
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

  if (error || !introduction) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="py-20 text-center">
          <p className="mb-4 text-lg text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 text-white rounded-lg transition-colors bg-primary-600 hover:bg-primary-700"
          >
            뒤로가기
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
        <div className="w-20"></div> {/* 균형을 위한 빈 공간 */}
      </div>

      {/* 자소설 내용 */}
      <SelfIntroductionCard
        introduction={introduction}
        showEditButtons={false}
      />

      {/* 댓글 섹션 */}
      <div className="mt-8 card">
        <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
          댓글 ({comments.length})
        </h2>

        {/* 댓글 작성 폼 */}
        {user && (
          <form onSubmit={handleSubmitComment} className="mb-6">
            <div className="flex gap-3">
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="댓글을 작성해주세요... "
                  className="p-3 w-full rounded-lg border resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  rows={3}
                  maxLength={500}
                />
                <div className="mt-1 text-xs text-right text-gray-500 dark:text-gray-400">
                  {newComment.length}/500
                </div>
              </div>
              <button
                type="submit"
                disabled={!newComment.trim() || commentLoading}
                className="flex items-center px-4 py-3 text-white rounded-lg transition-colors bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {commentLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
            {/* 정렬 옵션 */}
            <div className="flex gap-2 items-center mb-4">
              <select
                value={sortOrder}
                onChange={(e) =>
                  setSortOrder(e.target.value as "latest" | "oldest")
                }
                className="px-2 py-1 text-xs bg-white rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="latest">최신순</option>
                <option value="oldest">오래된순</option>
              </select>
            </div>
          </form>
        )}

        {/* 댓글 목록 */}
        <div className="space-y-4">
          {commentsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
            </div>
          ) : comments.length === 0 ? (
            <div className="py-8 text-center text-gray-500 dark:text-gray-400">
              아직 댓글이 없습니다. 첫 번째 댓글을 작성해보세요!
            </div>
          ) : (
            comments.map((comment) => (
              <div
                key={comment.id}
                className="p-4 bg-gray-50 rounded-lg dark:bg-gray-700"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex gap-2 items-center mb-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {comment.user_name}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(comment.created_at)}
                      </span>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap dark:text-gray-300">
                      {comment.content}
                    </p>
                  </div>
                  {/* 내 댓글인 경우 삭제 버튼 표시 */}
                  {user && comment.user_id === user.id && (
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="flex justify-center items-center ml-2 w-6 h-6 text-gray-400 rounded transition-colors hover:bg-gray-200 hover:text-red-500 dark:hover:bg-gray-600"
                      title="댓글 삭제"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
