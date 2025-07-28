"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  Heart,
  User,
  FileText,
  Home,
  LogIn,
  LogOut,
  BookOpen,
  MessageCircle,
  Sun,
  Moon,
  Gamepad2,
  Medal,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import LoginModal from "./LoginModal";
import SignupModal from "./SignupModal";

const Navigation = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { theme, loading: themeLoading, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // 로딩 중일 때는 인증 버튼만 스켈레톤으로 처리
  const renderAuthButtons = () => {
    if (authLoading) {
      return (
        <div className="flex items-center space-x-2">
          {/* 사용자 이름 스켈레톤 */}
          <div className="text-sm">
            <div className="w-24 h-4 bg-gray-200 rounded animate-pulse dark:bg-gray-600"></div>
          </div>
          {/* 로그아웃 버튼 스켈레톤 */}
          <div className="flex items-center px-3 py-2 text-sm font-medium rounded-md">
            <div className="w-16 h-4 bg-gray-200 rounded animate-pulse dark:bg-gray-600"></div>
          </div>
        </div>
      );
    }

    if (user) {
      return (
        <div className="flex items-center space-x-2">
          <Link
            href="/profile"
            className="text-sm text-gray-700 truncate transition-colors duration-200 cursor-pointer dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 max-w-24"
          >
            {user.user_metadata?.name || user.email}님
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md transition-colors duration-200 dark:text-gray-300 hover:text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <LogOut className="mr-2 w-4 h-4" />
            로그아웃
          </button>
        </div>
      );
    } else {
      return (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowLoginModal(true)}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md transition-colors duration-200 dark:text-gray-300 hover:text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <LogIn className="mr-2 w-4 h-4" />
            로그인
          </button>
        </div>
      );
    }
  };

  const navItems = [
    { href: "/super-date", label: "이벤트", icon: Heart },
    { href: "/introductions", label: "자소설 목록", icon: FileText },
    { href: "/rules", label: "모임회칙", icon: BookOpen },
    {
      href: "/dadalgame",
      label: "달달 게임",
      icon: Gamepad2,
      requiresAuth: true,
    },
    {
      href: "/daldalChat",
      label: "달달톡",
      icon: MessageCircle,
      requiresAuth: true,
    },
    {
      href: "/honor",
      label: "명예의 전당",
      icon: Medal,
      requiresAuth: false,
    },
  ];

  const isActive = (href: string) => pathname === href;

  const handleNavItemClick = (item: any, e: React.MouseEvent) => {
    if (item.requiresAuth && !user) {
      e.preventDefault();
      setShowLoginModal(true);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await signOut();
      if (error) {
        console.error("Logout error:", error);
        alert("로그아웃 중 오류가 발생했습니다.");
      } else {
        alert("로그아웃되었습니다.");
        // 홈페이지로 리다이렉트
        router.push("/");
      }
    } catch (error) {
      console.error("Logout error:", error);
      alert("로그아웃 중 오류가 발생했습니다.");
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-lg transition-colors duration-200 dark:bg-gray-800 dark:border-gray-700">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex flex-shrink-0 items-center">
              <Heart className="w-8 h-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900 truncate dark:text-white">
                달달
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden items-center space-x-8 md:flex">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleNavItemClick(item, e)}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    isActive(item.href)
                      ? "text-primary-600 bg-primary-50 dark:bg-primary-900/20"
                      : "text-gray-700 dark:text-gray-300 hover:text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                  title={item.label}
                >
                  <Icon className="w-4 h-4 lg:mr-2" />
                  <span className="hidden lg:inline">{item.label}</span>
                </Link>
              );
            })}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="flex justify-center items-center w-10 h-10 text-gray-700 rounded-md transition-colors duration-200 dark:text-gray-300 hover:text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {theme === "light" ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </button>

            {/* Auth Buttons */}
            <div className="hidden lg:block">{renderAuthButtons()}</div>
            <div className="lg:hidden">
              {user ? (
                <Link
                  href="/profile"
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md transition-colors duration-200 dark:text-gray-300 hover:text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                  title={user.user_metadata?.name || user.email}
                >
                  <User className="w-4 h-4" />
                </Link>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md transition-colors duration-200 dark:text-gray-300 hover:text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                  title="로그인"
                >
                  <LogIn className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center space-x-2 lg:hidden">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="flex flex-shrink-0 justify-center items-center w-10 h-10 text-gray-700 rounded-md transition-colors duration-200 dark:text-gray-300 hover:text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {theme === "light" ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </button>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex justify-center items-center p-2 text-gray-700 rounded-md dark:text-gray-300 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            >
              {isOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="lg:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200 dark:bg-gray-800 dark:border-gray-700 sm:px-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={(e) => {
                    handleNavItemClick(item, e);
                  }}
                  className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                    isActive(item.href)
                      ? "text-primary-600 bg-primary-50 dark:bg-primary-900/20"
                      : "text-gray-700 dark:text-gray-300 hover:text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  <Icon className="mr-3 w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}

            {/* Mobile Auth Buttons */}
            {authLoading ? (
              <>
                <div className="flex items-center px-3 py-2 text-base font-medium text-gray-700 border-b border-gray-200 dark:text-gray-300 dark:border-gray-700">
                  <div className="mr-3 w-5 h-5 bg-gray-200 rounded animate-pulse dark:bg-gray-600"></div>
                  <div className="w-32 h-4 bg-gray-200 rounded animate-pulse dark:bg-gray-600"></div>
                </div>
                <div className="flex items-center px-3 py-2 w-full text-base font-medium rounded-md">
                  <div className="mr-3 w-5 h-5 bg-gray-200 rounded animate-pulse dark:bg-gray-600"></div>
                  <div className="w-16 h-4 bg-gray-200 rounded animate-pulse dark:bg-gray-600"></div>
                </div>
              </>
            ) : user ? (
              <>
                <Link
                  href="/profile"
                  className="flex items-center px-3 py-2 w-full text-base font-medium text-gray-700 border-b border-gray-200 transition-colors duration-200 cursor-pointer dark:text-gray-300 dark:border-gray-700 hover:text-primary-600 dark:hover:text-primary-400"
                >
                  <User className="mr-3 w-5 h-5" />
                  {user.user_metadata?.name || user.email}님
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="flex items-center px-3 py-2 w-full text-base font-medium text-gray-700 rounded-md transition-colors duration-200 dark:text-gray-300 hover:text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <LogOut className="mr-3 w-5 h-5" />
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setShowLoginModal(true);
                    setIsOpen(false);
                  }}
                  className="flex items-center px-3 py-2 w-full text-base font-medium text-gray-700 rounded-md transition-colors duration-200 dark:text-gray-300 hover:text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <LogIn className="mr-3 w-5 h-5" />
                  로그인
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToSignup={() => {
          setShowLoginModal(false);
          setShowSignupModal(true);
        }}
      />

      <SignupModal
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        onSwitchToLogin={() => {
          setShowSignupModal(false);
          setShowLoginModal(true);
        }}
      />
    </nav>
  );
};

export default Navigation;
