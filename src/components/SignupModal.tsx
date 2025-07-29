"use client";

import { useState } from "react";
import { X, User, Lock, Eye, EyeOff, Mail } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export default function SignupModal({
  isOpen,
  onClose,
  onSwitchToLogin,
}: SignupModalProps) {
  const { signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim() || !name.trim()) {
      setError("모든 필드를 입력해주세요.");
      return;
    }

    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (password.length < 6) {
      setError("비밀번호는 6자 이상이어야 합니다.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const { error } = await signUp(email.trim(), password, name.trim());
      if (error) {
        setError(error.message || "회원가입에 실패했습니다.");
      } else {
        setSuccess("작성하신 이메일로 인증 메일을 발송했습니다.");
        // 폼 초기화
        setTimeout(() => {
          onClose();
          setEmail("");
          setPassword("");
          setConfirmPassword("");
          setName("");
          setError("");
          setSuccess("");
        }, 4000);
      }
    } catch (error) {
      console.error("Signup error:", error);
      setError("회원가입 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="flex fixed inset-0 z-50 justify-center items-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900">회원가입</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="p-3 mb-4 text-red-700 bg-red-100 rounded-lg border border-red-400">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 mb-4 text-green-700 bg-green-100 rounded-lg border border-green-400">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              이름 *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 w-5 h-5 text-gray-400 transform -translate-y-1/2" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="이름을 입력하세요"
                className="py-3 pr-4 pl-10 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              이메일 *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 w-5 h-5 text-gray-400 transform -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일을 입력하세요"
                className="py-3 pr-4 pl-10 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              비밀번호 *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 w-5 h-5 text-gray-400 transform -translate-y-1/2" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요 (6자 이상)"
                className="py-3 pr-12 pl-10 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 text-gray-400 transform -translate-y-1/2 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              비밀번호 확인 *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 w-5 h-5 text-gray-400 transform -translate-y-1/2" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="비밀번호를 다시 입력하세요"
                className="py-3 pr-12 pl-10 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 text-gray-400 transform -translate-y-1/2 hover:text-gray-600"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="py-3 w-full font-medium text-white rounded-lg bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
          >
            {isSubmitting ? "가입 중..." : "회원가입"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            이미 계정이 있으신가요?{" "}
            <button
              onClick={onSwitchToLogin}
              className="font-medium text-primary-600 hover:text-primary-700"
            >
              로그인
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
