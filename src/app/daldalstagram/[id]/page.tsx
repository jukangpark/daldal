"use client";

import { useAuth } from "@/contexts/AuthContext";
import {
  Camera,
  Heart,
  MessageCircle,
  Share2,
  ArrowLeft,
  MoreHorizontal,
  Send,
  Edit,
  Trash2,
  X,
} from "lucide-react";
import MbtiBadge from "@/components/MbtiBadge";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  daldalstagramAPI,
  daldalstagramCommentAPI,
  DaldalstagramPost,
  DaldalstagramComment,
} from "@/lib/supabase";

const DaldalstagramDetailPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;

  const [post, setPost] = useState<DaldalstagramPost | null>(null);
  const [comments, setComments] = useState<DaldalstagramComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [commentAnonymousName, setCommentAnonymousName] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 드롭다운 및 모달 상태
  const [showDropdown, setShowDropdown] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState("");
  const [modalAction, setModalAction] = useState<"edit" | "delete" | null>(
    null
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    if (user && postId) {
      fetchPostData();
    }
  }, [user, postId]);

  const fetchPostData = async () => {
    try {
      setIsLoading(true);

      // 게시물 정보 가져오기
      const { data: postData, error: postError } =
        await daldalstagramAPI.getById(postId);

      if (postError) {
        console.error("게시물 로드 오류:", postError);
        setError("게시물을 찾을 수 없습니다.");
        return;
      }

      // 좋아요 상태 확인
      const { data: likeData } = await daldalstagramAPI.checkLikeStatus(postId);

      setPost({
        ...postData,
        is_liked: likeData?.liked || false,
      });

      // 댓글 가져오기
      const { data: commentsData, error: commentsError } =
        await daldalstagramCommentAPI.getAll(postId);

      if (commentsError) {
        console.error("댓글 로드 오류:", commentsError);
      } else {
        setComments(commentsData || []);
      }

      // 조회수 증가
      await daldalstagramAPI.incrementViews(postId);
    } catch (error) {
      console.error("데이터 로드 오류:", error);
      setError("게시물을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMoreClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDropdown(!showDropdown);
  };

  const handleEditClick = () => {
    setModalAction("edit");
    setShowPasswordModal(true);
    setShowDropdown(false);
  };

  const handleDeleteClick = () => {
    setModalAction("delete");
    setShowPasswordModal(true);
    setShowDropdown(false);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim() || !modalAction || !post) return;

    setIsProcessing(true);
    setPasswordError("");

    try {
      if (modalAction === "edit") {
        // 수정 페이지로 이동
        router.push(
          `/daldalstagram/edit/${post.id}?password=${encodeURIComponent(
            password
          )}`
        );
      } else if (modalAction === "delete") {
        // 삭제 실행
        const { error } = await daldalstagramAPI.delete(post.id, password);

        if (error) {
          setPasswordError("비밀번호가 일치하지 않습니다.");
          return;
        }

        // 삭제 성공 시 목록으로 이동
        router.push("/daldalstagram");
      }
    } catch (error) {
      console.error("처리 오류:", error);
      setPasswordError("처리 중 오류가 발생했습니다.");
    } finally {
      setIsProcessing(false);
    }
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setPassword("");
    setModalAction(null);
    setPasswordError("");
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="px-4 py-8 mx-auto max-w-4xl">
          <div className="text-center">
            <Camera className="mx-auto mb-4 w-16 h-16 text-gray-400" />
            <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
              로그인이 필요한 서비스입니다.
            </h1>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="px-4 py-8 mx-auto max-w-4xl">
          <div className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full border-4 animate-spin border-primary-600 border-t-transparent"></div>
            <p className="text-gray-600 dark:text-gray-400">
              게시물을 불러오는 중...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="px-4 py-8 mx-auto max-w-4xl">
          <div className="text-center">
            <Camera className="mx-auto mb-4 w-16 h-16 text-gray-400" />
            <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
              {error || "게시물을 찾을 수 없습니다."}
            </h1>
            <Link
              href="/daldalstagram"
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
            >
              목록으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleLike = async () => {
    if (!post) return;

    try {
      const { data, error } = await daldalstagramAPI.toggleLike(post.id);

      if (error) {
        console.error("좋아요 오류:", error);
        return;
      }

      setPost((prev) =>
        prev
          ? {
              ...prev,
              likes: data?.liked ? prev.likes + 1 : prev.likes - 1,
              is_liked: data?.liked || false,
            }
          : null
      );
    } catch (error) {
      console.error("좋아요 오류:", error);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !commentAnonymousName.trim()) return;

    setIsSubmittingComment(true);

    try {
      const { data, error } = await daldalstagramCommentAPI.create(
        post.id,
        commentAnonymousName.trim(),
        newComment.trim()
      );

      if (error) {
        console.error("댓글 작성 오류:", error);
        alert("댓글 작성 중 오류가 발생했습니다.");
        return;
      }

      setComments((prev) => [data, ...prev]);
      setNewComment("");
      setCommentAnonymousName("");
    } catch (error) {
      console.error("댓글 작성 오류:", error);
      alert("댓글 작성 중 오류가 발생했습니다.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleShare = async () => {
    try {
      const currentUrl = window.location.href;
      await navigator.clipboard.writeText(currentUrl);
      alert("링크가 클립보드에 복사되었습니다!");
    } catch (error) {
      console.error("클립보드 복사 오류:", error);
      alert("링크 복사에 실패했습니다.");
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="px-4 py-8 mx-auto max-w-4xl">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-8">
          <Link
            href="/daldalstagram"
            className="flex items-center text-gray-600 transition-colors duration-200 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeft className="mr-2 w-5 h-5" />
            돌아가기
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            게시물
          </h1>
          <div className="relative">
            <button
              onClick={handleMoreClick}
              className="flex justify-center items-center w-8 h-8 text-gray-600 transition-colors duration-200 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>

            {/* 드롭다운 메뉴 */}
            {showDropdown && (
              <div className="absolute right-0 top-full z-10 mt-2 w-32 bg-white rounded-lg border border-gray-200 shadow-lg dark:bg-gray-800 dark:border-gray-700">
                <button
                  onClick={handleEditClick}
                  className="flex items-center px-4 py-2 w-full text-sm text-gray-700 transition-colors duration-200 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Edit className="mr-2 w-4 h-4" />
                  수정하기
                </button>
                <button
                  onClick={handleDeleteClick}
                  className="flex items-center px-4 py-2 w-full text-sm text-red-600 transition-colors duration-200 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Trash2 className="mr-2 w-4 h-4" />
                  삭제하기
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 게시물 내용 */}
        <div className="overflow-hidden bg-white rounded-lg shadow-md dark:bg-gray-800">
          {/* 이미지 갤러리 */}
          <div className="relative">
            <div className="aspect-square">
              <img
                src={post.images[currentImageIndex]}
                alt={`${post.anonymous_name}의 게시물`}
                className="object-cover w-full h-full"
              />
            </div>

            {/* 이미지 인디케이터 */}
            {post.images.length > 1 && (
              <div className="flex absolute bottom-4 left-1/2 space-x-2 transform -translate-x-1/2">
                {post.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                      index === currentImageIndex
                        ? "bg-white"
                        : "bg-white bg-opacity-50"
                    }`}
                  />
                ))}
              </div>
            )}

            {/* 이미지 네비게이션 */}
            {post.images.length > 1 && (
              <>
                {currentImageIndex > 0 && (
                  <button
                    onClick={() => setCurrentImageIndex((prev) => prev - 1)}
                    className="flex absolute left-4 top-1/2 justify-center items-center w-10 h-10 text-white bg-black bg-opacity-50 rounded-full transition-colors duration-200 transform -translate-y-1/2 hover:bg-opacity-70"
                  >
                    ‹
                  </button>
                )}
                {currentImageIndex < post.images.length - 1 && (
                  <button
                    onClick={() => setCurrentImageIndex((prev) => prev + 1)}
                    className="flex absolute right-4 top-1/2 justify-center items-center w-10 h-10 text-white bg-black bg-opacity-50 rounded-full transition-colors duration-200 transform -translate-y-1/2 hover:bg-opacity-70"
                  >
                    ›
                  </button>
                )}
              </>
            )}
          </div>

          {/* 게시물 정보 */}
          <div className="p-6">
            {/* 사용자 정보 */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-3">
                <div className="flex justify-center items-center w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900">
                  <span className="font-medium text-primary-600 dark:text-primary-400">
                    {post.anonymous_name.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {post.anonymous_name}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(post.created_at)}
                  </div>
                </div>
              </div>
            </div>

            {/* 게시물 내용 */}
            <p className="mb-4 text-gray-700 whitespace-pre-wrap dark:text-gray-300">
              {post.content}
            </p>

            {/* 액션 버튼 */}
            <div className="flex justify-between items-center py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-6">
                <button
                  onClick={handleLike}
                  className={`flex items-center space-x-2 transition-colors duration-200 ${
                    post.is_liked
                      ? "text-red-500"
                      : "text-gray-700 dark:text-gray-300 hover:text-red-500"
                  }`}
                >
                  <Heart
                    className={`w-6 h-6 ${post.is_liked ? "fill-current" : ""}`}
                  />
                  <span className="font-medium">{post.likes}</span>
                </button>
                <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                  <MessageCircle className="w-6 h-6" />
                  <span className="font-medium">{comments.length}</span>
                </div>
                <button
                  onClick={handleShare}
                  className="flex items-center space-x-2 text-gray-700 transition-colors duration-200 dark:text-gray-300 hover:text-green-500"
                >
                  <Share2 className="w-6 h-6" />
                </button>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                조회 {post.views}
              </div>
            </div>

            {/* 댓글 섹션 */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="mb-4 font-medium text-gray-900 dark:text-white">
                댓글 {comments.length}개
              </h3>

              {/* 댓글 목록 */}
              <div className="mb-4 space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex space-x-3">
                    <div className="flex flex-shrink-0 justify-center items-center w-8 h-8 bg-gray-200 rounded-full dark:bg-gray-700">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {comment.anonymous_name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center mb-1 space-x-2">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {comment.anonymous_name}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(comment.created_at)}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* 댓글 작성 */}
              <form onSubmit={handleCommentSubmit} className="space-y-3">
                <input
                  type="text"
                  value={commentAnonymousName}
                  onChange={(e) => setCommentAnonymousName(e.target.value)}
                  placeholder="익명 닉네임"
                  className="px-4 py-2 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  maxLength={50}
                  required
                />
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="댓글을 입력하세요..."
                    className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    maxLength={200}
                    required
                  />
                  <button
                    type="submit"
                    disabled={
                      isSubmittingComment ||
                      !newComment.trim() ||
                      !commentAnonymousName.trim()
                    }
                    className="px-4 py-2 text-white rounded-lg transition-colors duration-200 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* 비밀번호 확인 모달 */}
      {showPasswordModal && (
        <div className="flex fixed inset-0 z-50 justify-center items-center bg-black bg-opacity-50">
          <div className="p-6 mx-4 w-full max-w-md bg-white rounded-lg dark:bg-gray-800">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {modalAction === "edit" ? "게시물 수정" : "게시물 삭제"}
              </h3>
              <button
                onClick={closePasswordModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  비밀번호를 입력하세요
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="px-4 py-2 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="게시물 작성 시 설정한 비밀번호"
                  required
                />
                {passwordError && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {passwordError}
                  </p>
                )}
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={closePasswordModal}
                  className="flex-1 px-4 py-2 text-gray-700 rounded-lg border border-gray-300 transition-colors duration-200 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isProcessing || !password.trim()}
                  className="flex-1 px-4 py-2 text-white rounded-lg transition-colors duration-200 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing
                    ? "처리 중..."
                    : modalAction === "edit"
                    ? "수정하기"
                    : "삭제하기"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DaldalstagramDetailPage;
