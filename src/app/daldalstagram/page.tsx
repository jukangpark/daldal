"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Camera, Heart, MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  daldalstagramAPI,
  daldalstagramCommentAPI,
  DaldalstagramPost,
} from "@/lib/supabase";
import LoginModal from "@/components/LoginModal";

const DaldalstagramPage = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<
    (DaldalstagramPost & { commentCount: number })[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await daldalstagramAPI.getAll();

      if (error) {
        console.error("게시물 로드 오류:", error);
        setError("게시물을 불러오는 중 오류가 발생했습니다.");
        return;
      }

      // 각 게시물의 좋아요 상태와 댓글 수 확인
      const postsWithDetails = await Promise.all(
        data?.map(async (post) => {
          const [likeData, commentsData] = await Promise.all([
            daldalstagramAPI.checkLikeStatus(post.id),
            daldalstagramCommentAPI.getAll(post.id),
          ]);

          return {
            ...post,
            is_liked: likeData.data?.liked || false,
            commentCount: commentsData.data?.length || 0,
          };
        }) || []
      );

      setPosts(postsWithDetails);
    } catch (error) {
      console.error("게시물 로드 오류:", error);
      setError("게시물을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewPostClick = () => {
    if (!user) {
      setShowLoginModal(true);
    }
  };

  const handleCardClick = (postId: string) => {
    if (!user) {
      setShowLoginModal(true);
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="px-4 py-8 mx-auto max-w-4xl">
          <div className="text-center">
            <Camera className="mx-auto mb-4 w-16 h-16 text-gray-400" />
            <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
              오류가 발생했습니다
            </h1>
            <p className="mb-4 text-gray-600 dark:text-gray-400">{error}</p>
            <button
              onClick={fetchPosts}
              className="px-6 py-2 text-white rounded-lg transition-colors duration-200 bg-primary-600 hover:bg-primary-700"
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="px-4 py-8 mx-auto max-w-4xl">
        {/* 헤더 */}
        <div className="mb-8 text-center">
          <div className="flex justify-center items-center mb-4">
            <Camera className="mr-3 w-8 h-8 text-primary-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              달달스타그램
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            달달 커뮤니티의 소중한 순간들을 공유해보세요
          </p>
        </div>

        {/* 새 게시물 작성 버튼 */}
        <div className="mb-8">
          {user ? (
            <Link
              href="/daldalstagram/write"
              className="block flex justify-center items-center px-6 py-3 w-full font-medium text-white rounded-lg transition-colors duration-200 bg-primary-600 hover:bg-primary-700"
            >
              <Camera className="mr-2 w-5 h-5" />새 게시물 작성하기
            </Link>
          ) : (
            <button
              onClick={handleNewPostClick}
              className="block flex justify-center items-center px-6 py-3 w-full font-medium text-white rounded-lg transition-colors duration-200 bg-primary-600 hover:bg-primary-700"
            >
              <Camera className="mr-2 w-5 h-5" />새 게시물 작성하기
            </button>
          )}
        </div>

        {/* 게시물이 없을 때 */}
        {posts.length === 0 && (
          <div className="py-12 text-center">
            <Camera className="mx-auto mb-4 w-16 h-16 text-gray-400" />
            <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
              아직 게시물이 없습니다
            </h2>
            <p className="mb-6 text-gray-600 dark:text-gray-400">
              첫 번째 게시물을 작성해보세요!
            </p>
          </div>
        )}

        {/* 인스타그램 스타일 그리드 */}
        {posts.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {posts.map((post, index) => (
              <div
                key={post.id}
                style={{
                  animationDelay: `${index * 0.1}s`,
                  animationFillMode: "both",
                  animation: "fadeInUp 0.6s ease-out forwards",
                  opacity: 0,
                  transform: "translateY(30px)",
                }}
              >
                {user ? (
                  <Link
                    href={`/daldalstagram/${post.id}`}
                    className="overflow-hidden relative bg-white rounded-lg shadow-md transition-all duration-300 cursor-pointer group dark:bg-gray-800 hover:shadow-lg"
                  >
                    {/* 작성자 정보 (이미지 위쪽 별도 공간) */}
                    <div className="flex justify-between items-center p-3 border-b border-gray-100 dark:border-gray-700">
                      <div className="flex items-center space-x-2">
                        <div className="flex justify-center items-center w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900">
                          <span className="text-xs font-medium text-primary-600 dark:text-primary-400">
                            {post.anonymous_name.charAt(0)}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {post.anonymous_name}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(post.created_at)}
                      </span>
                    </div>

                    {/* 게시물 이미지 */}
                    <div className="relative aspect-square">
                      <img
                        src={post.images[0]} // 첫 번째 이미지를 썸네일로 사용
                        alt={post.content}
                        className="object-cover w-full h-full"
                      />

                      {/* 이미지 개수 표시 */}
                      {post.images.length > 1 && (
                        <div className="absolute right-2 bottom-2 px-2 py-1 text-sm text-white bg-black bg-opacity-50 rounded">
                          +{post.images.length - 1}
                        </div>
                      )}
                    </div>

                    {/* 게시물 내용 (아래쪽) */}
                    <div className="p-3">
                      <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 line-clamp-2">
                        {post.content}
                      </p>
                    </div>

                    {/* 액션 버튼 (세부 페이지와 동일한 스타일) */}
                    <div className="flex justify-between items-center p-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-6">
                        <div
                          className={`flex items-center space-x-2 ${
                            post.is_liked
                              ? "text-red-500"
                              : "text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          <Heart
                            className={`w-5 h-5 ${
                              post.is_liked ? "fill-current" : ""
                            }`}
                          />
                          <span className="text-sm font-medium">
                            {post.likes}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                          <MessageCircle className="w-5 h-5" />
                          <span className="text-sm font-medium">
                            {post.commentCount}
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        조회 {post.views}
                      </div>
                    </div>
                  </Link>
                ) : (
                  <button
                    onClick={() => handleCardClick(post.id)}
                    className="overflow-hidden relative w-full text-left bg-white rounded-lg shadow-md transition-all duration-300 cursor-pointer group dark:bg-gray-800 hover:shadow-lg"
                  >
                    {/* 작성자 정보 (이미지 위쪽 별도 공간) */}
                    <div className="flex justify-between items-center p-3 border-b border-gray-100 dark:border-gray-700">
                      <div className="flex items-center space-x-2">
                        <div className="flex justify-center items-center w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900">
                          <span className="text-xs font-medium text-primary-600 dark:text-primary-400">
                            {post.anonymous_name.charAt(0)}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {post.anonymous_name}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(post.created_at)}
                      </span>
                    </div>

                    {/* 게시물 이미지 */}
                    <div className="relative aspect-square">
                      <img
                        src={post.images[0]} // 첫 번째 이미지를 썸네일로 사용
                        alt={post.content}
                        className="object-cover w-full h-full"
                      />

                      {/* 이미지 개수 표시 */}
                      {post.images.length > 1 && (
                        <div className="absolute right-2 bottom-2 px-2 py-1 text-sm text-white bg-black bg-opacity-50 rounded">
                          +{post.images.length - 1}
                        </div>
                      )}
                    </div>

                    {/* 게시물 내용 (아래쪽) */}
                    <div className="p-3">
                      <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 line-clamp-2">
                        {post.content}
                      </p>
                    </div>

                    {/* 액션 버튼 (세부 페이지와 동일한 스타일) */}
                    <div className="flex justify-between items-center p-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-6">
                        <div
                          className={`flex items-center space-x-2 ${
                            post.is_liked
                              ? "text-red-500"
                              : "text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          <Heart
                            className={`w-5 h-5 ${
                              post.is_liked ? "fill-current" : ""
                            }`}
                          />
                          <span className="text-sm font-medium">
                            {post.likes}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                          <MessageCircle className="w-5 h-5" />
                          <span className="text-sm font-medium">
                            {post.commentCount}
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        조회 {post.views}
                      </div>
                    </div>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToSignup={() => {
          setShowLoginModal(false);
          setShowSignupModal(true);
        }}
      />

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default DaldalstagramPage;
