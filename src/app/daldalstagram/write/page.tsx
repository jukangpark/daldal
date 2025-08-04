"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Camera, X, Upload, ArrowLeft } from "lucide-react";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import daldalstagramAPI from "@/lib/api/daldalstagram";
import fileAPI from "@/lib/api/file";

const WriteDaldalstagramPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [anonymousName, setAnonymousName] = useState("");
  const [content, setContent] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="px-4 py-8 mx-auto max-w-2xl">
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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    if (images.length + files.length > 6) {
      alert("이미지는 최대 6개까지 업로드할 수 있습니다.");
      return;
    }

    const newImages = [...images, ...files];
    setImages(newImages);

    // 미리보기 URL 생성
    const newUrls = files.map((file) => URL.createObjectURL(file));
    setImageUrls([...imageUrls, ...newUrls]);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newUrls = imageUrls.filter((_, i) => i !== index);

    setImages(newImages);
    setImageUrls(newUrls);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!anonymousName.trim()) {
      alert("익명 닉네임을 입력해주세요.");
      return;
    }

    if (!content.trim()) {
      alert("게시물 내용을 입력해주세요.");
      return;
    }

    if (!password.trim()) {
      alert("비밀번호를 입력해주세요.");
      return;
    }

    if (password !== confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (password.length < 4) {
      alert("비밀번호는 최소 4자 이상이어야 합니다.");
      return;
    }

    if (images.length === 0) {
      alert("최소 1개의 이미지를 업로드해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 이미지 업로드
      const { uploadedUrls, errors } = await fileAPI.uploadFilesToStorage(
        images as any,
        user.id,
        `daldalstagram_${Date.now()}`
      );

      if (errors.length > 0) {
        console.error("이미지 업로드 오류:", errors);
        alert("이미지 업로드 중 오류가 발생했습니다.");
        return;
      }

      // 게시물 생성
      const { data, error } = await daldalstagramAPI.create({
        anonymous_name: anonymousName.trim(),
        content: content.trim(),
        images: uploadedUrls,
        password: password,
      });

      if (error) {
        console.error("게시물 작성 오류:", error);
        alert(error.message || "게시물 작성 중 오류가 발생했습니다.");
        return;
      }

      alert("게시물이 성공적으로 작성되었습니다!");
      router.push("/daldalstagram");
    } catch (error) {
      console.error("게시물 작성 오류:", error);
      alert("게시물 작성 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="px-4 py-8 mx-auto max-w-2xl">
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
            새 게시물 작성
          </h1>
          <div className="w-20"></div> {/* 균형을 위한 빈 공간 */}
        </div>

        {/* 작성 폼 */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 익명 닉네임 */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              익명 닉네임 *
            </label>
            <input
              type="text"
              value={anonymousName}
              onChange={(e) => setAnonymousName(e.target.value)}
              placeholder="익명으로 표시될 닉네임을 입력하세요"
              className="px-4 py-3 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              maxLength={50}
              required
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              최대 50자까지 입력 가능합니다.
            </p>
          </div>

          {/* 비밀번호 */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              비밀번호 * (게시물 수정/삭제용)
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="게시물 수정/삭제 시 사용할 비밀번호를 입력하세요"
              className="px-4 py-3 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              minLength={4}
              required
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              최소 4자 이상 입력해주세요.
            </p>
          </div>

          {/* 비밀번호 확인 */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              비밀번호 확인 *
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="비밀번호를 다시 입력하세요"
              className="px-4 py-3 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              required
            />
            {confirmPassword && password !== confirmPassword && (
              <p className="mt-1 text-sm text-red-500">
                비밀번호가 일치하지 않습니다.
              </p>
            )}
          </div>

          {/* 이미지 업로드 */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              이미지 업로드 * (최대 6개)
            </label>

            {/* 이미지 미리보기 그리드 */}
            {imageUrls.length > 0 && (
              <div className="grid grid-cols-3 gap-4 mb-4">
                {imageUrls.map((url, index) => (
                  <div key={index} className="relative aspect-square">
                    <img
                      src={url}
                      alt={`미리보기 ${index + 1}`}
                      className="object-cover w-full h-full rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="flex absolute top-2 right-2 justify-center items-center w-6 h-6 text-white bg-red-500 rounded-full transition-colors duration-200 hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* 이미지 업로드 버튼 */}
            {images.length < 6 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col justify-center items-center w-full h-32 text-gray-500 rounded-lg border-2 border-gray-300 border-dashed transition-colors duration-200 dark:border-gray-600 dark:text-gray-400 hover:border-primary-500 hover:text-primary-500"
              >
                <Upload className="mb-2 w-8 h-8" />
                <span>이미지를 선택하거나 드래그하여 업로드</span>
                <span className="text-sm">({images.length}/6)</span>
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          {/* 게시물 내용 */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              게시물 내용 *
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="무엇을 공유하고 싶으신가요?"
              rows={6}
              className="px-4 py-3 w-full rounded-lg border border-gray-300 resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              maxLength={1000}
              required
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {content.length}/1000자
            </p>
          </div>

          {/* 제출 버튼 */}
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => router.push("/daldalstagram")}
              className="flex-1 px-6 py-3 text-gray-700 rounded-lg border border-gray-300 transition-colors duration-200 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 text-white rounded-lg transition-colors duration-200 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "작성 중..." : "게시물 작성"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WriteDaldalstagramPage;
