"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
  Scale,
  MessageCircle,
  Users,
  Send,
  ArrowLeft,
  CheckCircle,
  Edit3,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import balanceGameAPI from "@/lib/api/balance-game";
import {
  BalanceGame,
  BalanceGameComment,
  VoteResult,
} from "@/lib/types/balance-game";
import LoginModal from "@/components/LoginModal";
import UserAvatar from "@/components/UserAvatar";

export default function BalanceGameDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { user } = useAuth();
  const router = useRouter();
  const [game, setGame] = useState<BalanceGame | null>(null);
  const [voteResult, setVoteResult] = useState<VoteResult | null>(null);
  const [userVote, setUserVote] = useState<"A" | "B" | null>(null);
  const [comments, setComments] = useState<BalanceGameComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [commentContent, setCommentContent] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    if (params.id) {
      fetchGameData();
    }
  }, [params.id, user]);

  const fetchGameData = async () => {
    try {
      setLoading(true);
      const [gameData, voteResultData, userVoteData, commentsData] =
        await Promise.all([
          balanceGameAPI.getById(params.id),
          balanceGameAPI.getVoteResult(params.id),
          user
            ? balanceGameAPI.getUserVote(params.id, user.id)
            : Promise.resolve({ data: null, error: null }),
          balanceGameAPI.getComments(params.id),
        ]);

      if (gameData.error) {
        console.error("게임 로드 오류:", gameData.error);
        return;
      }

      setGame(gameData.data);
      setVoteResult(voteResultData.data);
      setUserVote(userVoteData.data);
      setComments(commentsData.data || []);
    } catch (error) {
      console.error("데이터 로드 오류:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (option: "A" | "B") => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    try {
      setVoting(true);
      const { error } = await balanceGameAPI.vote(params.id, user.id, option);

      if (error) {
        console.error("투표 오류:", error);
        alert("투표 중 오류가 발생했습니다: " + (error.message || error));
        return;
      }

      setUserVote(option);
      await fetchGameData(); // 결과 새로고침
    } catch (error) {
      console.error("투표 오류:", error);
      alert("투표 중 오류가 발생했습니다.");
    } finally {
      setVoting(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!user || !commentContent.trim()) return;

    try {
      setSubmittingComment(true);
      const { error } = await balanceGameAPI.addComment(
        params.id,
        user.id,
        commentContent.trim()
      );

      if (error) {
        console.error("댓글 작성 오류:", error);
        return;
      }

      setCommentContent("");
      await fetchGameData(); // 댓글 목록 새로고침
    } catch (error) {
      console.error("댓글 작성 오류:", error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) return;

    try {
      const { error } = await balanceGameAPI.updateComment(
        commentId,
        editContent.trim()
      );

      if (error) {
        console.error("댓글 수정 오류:", error);
        return;
      }

      setEditingComment(null);
      setEditContent("");
      await fetchGameData();
    } catch (error) {
      console.error("댓글 수정 오류:", error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("댓글을 삭제하시겠습니까?")) return;

    try {
      const { error } = await balanceGameAPI.deleteComment(commentId);

      if (error) {
        console.error("댓글 삭제 오류:", error);
        return;
      }

      await fetchGameData();
    } catch (error) {
      console.error("댓글 삭제 오류:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "방금 전";
    if (diffInHours < 24) return `${diffInHours}시간 전`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}일 전`;

    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="px-4 py-8 mx-auto max-w-4xl">
          <div className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full border-4 animate-spin border-primary-600 border-t-transparent"></div>
            <p className="text-gray-600 dark:text-gray-400">
              밸런스 게임을 불러오는 중...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="px-4 py-8 mx-auto max-w-4xl">
          <div className="text-center">
            <Scale className="mx-auto mb-4 w-16 h-16 text-gray-400" />
            <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
              게임을 찾을 수 없습니다
            </h1>
            <Link
              href="/dadalgame/balance-game"
              className="inline-flex items-center px-6 py-2 text-white rounded-lg transition-colors duration-200 bg-primary-600 hover:bg-primary-700"
            >
              <ArrowLeft className="mr-2 w-4 h-4" />
              목록으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="px-4 py-8 mx-auto max-w-4xl">
        {/* 뒤로가기 버튼 */}
        <div className="mb-6">
          <Link
            href="/dadalgame/balance-game"
            className="inline-flex items-center text-gray-600 transition-colors duration-200 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            목록으로 돌아가기
          </Link>
        </div>

        {/* 게임 정보 */}
        <div className="p-6 mb-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
          <div className="mb-4">
            <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
              {game.title}
            </h1>
            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <span className="inline-block px-2 py-1 text-xs font-medium rounded-full text-primary-600 bg-primary-100 dark:bg-primary-900/30 dark:text-primary-400">
                {game.category}
              </span>
              <span className="flex items-center">
                <Users className="mr-1 w-4 h-4" />
                {voteResult?.total_votes || 0}명 참여
              </span>
              <span className="flex items-center">
                <MessageCircle className="mr-1 w-4 h-4" />
                {comments.length}개 댓글
              </span>
            </div>
          </div>

          {game.description && (
            <p className="mb-6 text-gray-600 dark:text-gray-300">
              {game.description}
            </p>
          )}

          {/* 투표 섹션 */}
          <div className="mb-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              어떤 것을 더 선호하시나요?
            </h2>

            {/* 통합된 퍼센티지 표시 */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  A
                </span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  B
                </span>
              </div>
              <div className="overflow-hidden relative w-full h-4 bg-gray-200 rounded-full dark:bg-gray-700">
                <div
                  className="absolute top-0 left-0 h-full transition-all duration-500 bg-primary-600"
                  style={{
                    width: `${voteResult?.option_a_percentage || 0}%`,
                  }}
                ></div>
                <div
                  className="absolute top-0 right-0 h-full bg-blue-600 transition-all duration-500"
                  style={{
                    width: `${voteResult?.option_b_percentage || 0}%`,
                  }}
                ></div>
              </div>
              <div className="flex justify-between items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
                <span>
                  {voteResult?.option_a_percentage || 0}% (
                  {voteResult?.option_a_votes || 0}명)
                </span>
                <span>
                  {voteResult?.option_b_percentage || 0}% (
                  {voteResult?.option_b_votes || 0}명)
                </span>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {/* 옵션 A */}
              <button
                onClick={() => handleVote("A")}
                // disabled={voting || userVote !== null}
                className={`relative p-6 rounded-lg border-2 transition-all duration-300 ${
                  userVote === "A"
                    ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                    : userVote === "B"
                    ? "border-gray-200 dark:border-gray-600 opacity-50"
                    : "border-gray-200 dark:border-gray-600 hover:border-primary-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                } ${voting ? "cursor-not-allowed" : "cursor-pointer"}`}
              >
                {userVote === "A" && (
                  <CheckCircle className="absolute top-2 right-2 w-6 h-6 text-primary-600" />
                )}
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    A. {game.option_a}
                  </div>
                </div>
              </button>

              {/* 옵션 B */}
              <button
                onClick={() => handleVote("B")}
                // disabled={voting || userVote !== null}
                className={`relative p-6 rounded-lg border-2 transition-all duration-300 ${
                  userVote === "B"
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : userVote === "A"
                    ? "border-gray-200 dark:border-gray-600 opacity-50"
                    : "border-gray-200 dark:border-gray-600 hover:border-blue-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                } ${voting ? "cursor-not-allowed" : "cursor-pointer"}`}
              >
                {userVote === "B" && (
                  <CheckCircle className="absolute top-2 right-2 w-6 h-6 text-blue-600" />
                )}
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    B. {game.option_b}
                  </div>
                </div>
              </button>
            </div>

            {!user && (
              <div className="py-4 text-center">
                <p className="mb-2 text-gray-600 dark:text-gray-400">
                  투표하려면 로그인이 필요합니다
                </p>
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="px-4 py-2 text-white rounded-lg transition-colors duration-200 bg-primary-600 hover:bg-primary-700"
                >
                  로그인하기
                </button>
              </div>
            )}

            {userVote && (
              <div className="py-4 text-center">
                <p className="font-medium text-primary-600 dark:text-primary-400">
                  ✓ 투표 완료! 토론장에서 의견을 나눠보세요
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 토론장 */}
        <div className="bg-white rounded-lg shadow-md dark:bg-gray-800">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
              💬 토론장
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              여러분의 의견을 자유롭게 나눠보세요!
            </p>
          </div>

          {/* 댓글 작성 */}
          {user && (
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex space-x-3">
                <UserAvatar
                  imageUrl={user.user_metadata?.avatar_url}
                  userName={user.user_metadata?.full_name || user.email}
                  size="sm"
                  gender={"annonymous"}
                />
                <div className="flex-1">
                  <textarea
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    placeholder="의견을 작성해보세요..."
                    className="p-3 w-full rounded-lg border border-gray-300 resize-none dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    rows={3}
                    maxLength={500}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {commentContent.length}/500
                    </span>
                    <button
                      onClick={handleSubmitComment}
                      disabled={!commentContent.trim() || submittingComment}
                      className="flex items-center px-4 py-2 text-white rounded-lg transition-colors duration-200 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="mr-2 w-4 h-4" />
                      {submittingComment ? "작성 중..." : "댓글 작성"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 댓글 목록 */}
          <div className="p-6">
            {comments.length === 0 ? (
              <div className="py-8 text-center">
                <MessageCircle className="mx-auto mb-4 w-12 h-12 text-gray-400" />
                <p className="text-gray-500 dark:text-gray-400">
                  아직 댓글이 없습니다. 첫 번째 댓글을 작성해보세요!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex space-x-3">
                    <UserAvatar
                      imageUrl={comment.user_avatar}
                      userName={comment.user_name || "익명"}
                      size="sm"
                      gender={"annonymous"}
                    />
                    <div className="flex-1">
                      <div className="p-3 bg-gray-50 rounded-lg dark:bg-gray-700">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {comment.user_name}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(comment.created_at)}
                          </span>
                        </div>

                        {editingComment === comment.id ? (
                          <div>
                            <textarea
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              className="p-2 w-full rounded border border-gray-300 resize-none dark:bg-gray-600 dark:border-gray-500 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                              rows={2}
                              maxLength={500}
                            />
                            <div className="flex justify-end mt-2 space-x-2">
                              <button
                                onClick={() => {
                                  setEditingComment(null);
                                  setEditContent("");
                                }}
                                className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                              >
                                취소
                              </button>
                              <button
                                onClick={() => handleEditComment(comment.id)}
                                className="px-3 py-1 text-sm text-white rounded bg-primary-600 hover:bg-primary-700"
                              >
                                수정
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-700 whitespace-pre-wrap dark:text-gray-300">
                            {comment.content}
                          </p>
                        )}
                      </div>

                      {/* 댓글 액션 버튼 */}
                      {user &&
                        comment.user_id === user.id &&
                        editingComment !== comment.id && (
                          <div className="flex mt-2 space-x-2">
                            <button
                              onClick={() => {
                                setEditingComment(comment.id);
                                setEditContent(comment.content);
                              }}
                              className="flex items-center text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                            >
                              <Edit3 className="mr-1 w-3 h-3" />
                              수정
                            </button>
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="flex items-center text-xs text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="mr-1 w-3 h-3" />
                              삭제
                            </button>
                          </div>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToSignup={() => {
          setShowLoginModal(false);
        }}
      />
    </div>
  );
}
