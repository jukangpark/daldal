"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Camera, ArrowLeft, Upload, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import daldalstagramAPI from "@/lib/api/daldalstagram";
import fileAPI from "@/lib/api/file";
import { DaldalstagramPost } from "@/lib/types";

const DaldalstagramEditPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const postId = params.id as string;
  const password = searchParams.get("password");

  const [post, setPost] = useState<DaldalstagramPost | null>(null);
  const [anonymousName, setAnonymousName] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    if (user && postId) {
      // URL 파라미터에서 비밀번호 가져오기
      const urlPassword = searchParams.get("password");
      if (urlPassword) {
        // 세션 스토리지에 비밀번호 저장 (URL에서 제거)
        sessionStorage.setItem(`daldalstagram_edit_${postId}`, urlPassword);
        // URL에서 비밀번호 파라미터 제거
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete("password");
        window.history.replaceState({}, "", newUrl.toString());
      }

      // 세션 스토리지에서 비밀번호 가져오기
      const storedPassword = sessionStorage.getItem(
        `daldalstagram_edit_${postId}`
      );
      if (storedPassword) {
        fetchPostData();
      } else {
        setError("비밀번호가 필요합니다.");
        setIsLoading(false);
      }
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

      setPost(postData);
      setAnonymousName(postData.anonymous_name);
      setContent(postData.content);
      setImageUrls(postData.images);
    } catch (error) {
      console.error("데이터 로드 오류:", error);
      setError("게시물을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (imageUrls.length + imageFiles.length > 6) {
      alert("이미지는 최대 6개까지 업로드할 수 있습니다.");
      return;
    }

    setImages((prev) => [...prev, ...imageFiles]);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!anonymousName.trim() || !content.trim()) {
      alert("모든 필드를 입력해주세요.");
      return;
    }

    if (imageUrls.length === 0 && images.length === 0) {
      alert("최소 1개의 이미지를 업로드해주세요.");
      return;
    }

    // 세션 스토리지에서 비밀번호 가져오기
    const storedPassword = sessionStorage.getItem(
      `daldalstagram_edit_${postId}`
    );
    if (!storedPassword) {
      alert("비밀번호가 필요합니다.");
      return;
    }

    setIsSubmitting(true);

    try {
      let uploadedUrls: string[] = [];

      // 새로 업로드된 이미지가 있는 경우
      if (images.length > 0) {
        // File[]를 FileList로 변환
        const dataTransfer = new DataTransfer();
        images.forEach((image) => dataTransfer.items.add(image));
        const fileList = dataTransfer.files;

        const { uploadedUrls: newUploadedUrls, errors } =
          await fileAPI.uploadFilesToStorage(fileList, user!.id, postId);

        if (errors.length > 0) {
          console.error("이미지 업로드 오류:", errors);
          alert("일부 이미지 업로드 중 오류가 발생했습니다.");
          return;
        }

        uploadedUrls = newUploadedUrls || [];
      }

      // 기존 이미지와 새 이미지 합치기
      const allImages = [...imageUrls, ...uploadedUrls];

      // 게시물 업데이트 (비밀번호 확인 포함)
      const { error: updateError } = await daldalstagramAPI.upsert(
        postId,
        {
          anonymous_name: anonymousName.trim(),
          content: content.trim(),
          images: allImages,
          password: storedPassword,
        },
        storedPassword
      );

      if (updateError) {
        console.error("게시물 업데이트 오류:", updateError);
        if (
          updateError.message?.includes("비밀번호") ||
          updateError.message?.includes("password")
        ) {
          alert("비밀번호가 일치하지 않습니다.");
        } else {
          alert("게시물 업데이트 중 오류가 발생했습니다.");
        }
        return;
      }

      // 성공 시 세션 스토리지에서 비밀번호 제거
      sessionStorage.removeItem(`daldalstagram_edit_${postId}`);

      alert("게시물이 성공적으로 수정되었습니다.");
      router.push(`/daldalstagram/${postId}`);
    } catch (error) {
      console.error("게시물 수정 오류:", error);
      alert("게시물 수정 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
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

  if (error || passwordError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="px-4 py-8 mx-auto max-w-4xl">
          <div className="text-center">
            <Camera className="mx-auto mb-4 w-16 h-16 text-gray-400" />
            <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
              {passwordError || error || "오류가 발생했습니다."}
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="px-4 py-8 mx-auto max-w-4xl">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-8">
          <Link
            href={`/daldalstagram/${postId}`}
            className="flex items-center text-gray-600 transition-colors duration-200 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeft className="mr-2 w-5 h-5" />
            돌아가기
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            게시물 수정
          </h1>
          <div className="w-8"></div>
        </div>

        {/* 수정 폼 */}
        <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 익명 닉네임 */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                익명 닉네임
              </label>
              <input
                type="text"
                value={anonymousName}
                onChange={(e) => setAnonymousName(e.target.value)}
                className="px-4 py-2 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="익명 닉네임을 입력하세요"
                maxLength={50}
                required
              />
            </div>

            {/* 게시물 내용 */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                게시물 내용
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="px-4 py-2 w-full rounded-lg border border-gray-300 resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                rows={6}
                placeholder="게시물 내용을 입력하세요..."
                maxLength={1000}
                required
              />
            </div>

            {/* 기존 이미지 */}
            {imageUrls.length > 0 && (
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  기존 이미지 ({imageUrls.length}/6)
                </label>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
                  {imageUrls.map((url, index) => (
                    <div key={index} className="relative aspect-square">
                      <img
                        src={url}
                        alt={`기존 이미지 ${index + 1}`}
                        className="object-cover w-full h-full rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(index)}
                        className="flex absolute top-1 right-1 justify-center items-center w-6 h-6 text-white bg-red-500 rounded-full transition-colors duration-200 hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 새 이미지 업로드 */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                새 이미지 추가 ({images.length}/6)
              </label>
              <div className="p-6 text-center rounded-lg border-2 border-gray-300 border-dashed dark:border-gray-600">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="flex flex-col items-center space-y-2 cursor-pointer"
                >
                  <Upload className="w-8 h-8 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    이미지를 선택하거나 드래그하여 업로드하세요
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-500">
                    최대 6개까지 업로드 가능
                  </span>
                </label>
              </div>
            </div>

            {/* 업로드된 이미지 미리보기 */}
            {images.length > 0 && (
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  업로드할 이미지 미리보기
                </label>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
                  {images.map((file, index) => (
                    <div key={index} className="relative aspect-square">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`업로드 이미지 ${index + 1}`}
                        className="object-cover w-full h-full rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="flex absolute top-1 right-1 justify-center items-center w-6 h-6 text-white bg-red-500 rounded-full transition-colors duration-200 hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 제출 버튼 */}
            <div className="flex space-x-4">
              <Link
                href={`/daldalstagram/${postId}`}
                className="flex-1 px-6 py-3 text-center text-gray-700 rounded-lg border border-gray-300 transition-colors duration-200 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                취소
              </Link>
              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  !anonymousName.trim() ||
                  !content.trim() ||
                  (imageUrls.length === 0 && images.length === 0)
                }
                className="flex-1 px-6 py-3 text-white rounded-lg transition-colors duration-200 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "수정 중..." : "게시물 수정"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DaldalstagramEditPage;
