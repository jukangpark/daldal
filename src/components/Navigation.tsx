"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  User,
  FileText,
  LogIn,
  LogOut,
  BookOpen,
  MessageCircle,
  Sun,
  Moon,
  Gamepad2,
  ChevronDown,
  Users,
  Camera,
  Trophy,
  Gift,
  Heart,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import LoginModal from "./LoginModal";
import SignupModal from "./SignupModal";
import Image from "next/image";

const Navigation = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { theme, loading: themeLoading, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showCommunityDropdown, setShowCommunityDropdown] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const communityDropdownRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { href: "/super-date", label: "이벤트", icon: Gift },
    { href: "/introductions", label: "자소설 목록", icon: FileText },
    { href: "/dating", label: "소개팅", icon: Heart },
    { href: "/rules", label: "모임회칙", icon: BookOpen },
    {
      href: "/dadalgame",
      label: "달달 게임",
      icon: Gamepad2,
      requiresAuth: true,
    },
    {
      href: "/honor",
      label: "명예의 전당",
      icon: Trophy,
      requiresAuth: false,
    },
  ];

  const communityItems = [
    {
      href: "/daldalChat",
      label: "달달톡",
      icon: MessageCircle,
      requiresAuth: true,
    },
    {
      href: "/daldalstagram",
      label: "달달스타그램",
      icon: Camera,
      requiresAuth: false,
    },
  ];

  const isActive = (href: string) => pathname === href;

  // 드롭다운 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        communityDropdownRef.current &&
        !communityDropdownRef.current.contains(event.target as Node)
      ) {
        setShowCommunityDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
        <div className="flex items-center h-16">
          {/* Logo */}
          <div className="flex items-center mr-8">
            <Link href="/" className="flex flex-shrink-0 items-center">
              <Image
                src="/icon.svg"
                alt="달달"
                width={32}
                height={32}
                className="w-8 h-8 text-primary-600"
              />
              <span className="ml-2 text-xl font-bold text-gray-900 truncate dark:text-white">
                달달
              </span>
            </Link>
          </div>

          {/* Desktop Navigation - Left Side */}
          <div className="hidden flex-1 items-center space-x-6 lg:flex">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleNavItemClick(item, e)}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    isActive(item.href)
                      ? "text-white bg-primary-600 dark:text-white dark:bg-primary-600"
                      : "text-gray-700 dark:text-gray-300 hover:text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                  title={item.label}
                >
                  <Icon className="w-4 h-4 lg:mr-2" />
                  <span className="hidden whitespace-nowrap lg:inline">
                    {item.label}
                  </span>
                </Link>
              );
            })}

            {/* 달달 커뮤니티 드롭다운 */}
            <div className="relative" ref={communityDropdownRef}>
              <button
                onClick={() => setShowCommunityDropdown(!showCommunityDropdown)}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  pathname.startsWith("/daldalChat") ||
                  pathname.startsWith("/daldalstagram")
                    ? "text-white bg-primary-600 dark:text-white dark:bg-primary-600"
                    : "text-gray-700 dark:text-gray-300 hover:text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <Users className="w-4 h-4 lg:mr-2" />
                <span className="hidden whitespace-nowrap lg:inline">
                  커뮤니티
                </span>
                <ChevronDown className="ml-1 w-4 h-4" />
              </button>

              {showCommunityDropdown && (
                <div className="absolute left-0 top-full z-50 mt-1 w-48 bg-white rounded-md border border-gray-200 shadow-lg dark:bg-gray-800 dark:border-gray-700">
                  {communityItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={(e) => {
                          handleNavItemClick(item, e);
                          setShowCommunityDropdown(false);
                        }}
                        className={`flex items-center px-4 py-2 text-sm transition-colors duration-200 ${
                          isActive(item.href)
                            ? "text-white bg-primary-600 dark:text-white dark:bg-primary-600"
                            : "text-gray-700 dark:text-gray-300 hover:text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                        }`}
                      >
                        <Icon className="mr-3 w-4 h-4" />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Desktop Navigation - Right Side */}
          <div className="hidden items-center space-x-4 lg:flex">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              disabled={themeLoading}
              className={`flex justify-center items-center w-10 h-10 rounded-md transition-colors duration-200 ${
                themeLoading
                  ? "text-gray-400 bg-gray-100 cursor-not-allowed dark:bg-gray-700"
                  : "text-gray-700 dark:text-gray-300 hover:text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              {themeLoading ? (
                <div className="w-5 h-5 bg-gray-300 rounded animate-pulse dark:bg-gray-600"></div>
              ) : theme === "light" ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </button>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-2 min-w-[200px]">
              {authLoading ? (
                <>
                  <div className="w-24 h-4 bg-gray-200 rounded animate-pulse dark:bg-gray-600"></div>
                  <div className="w-16 h-8 bg-gray-200 rounded animate-pulse dark:bg-gray-600"></div>
                </>
              ) : user ? (
                <>
                  <Link
                    href="/profile"
                    className="text-sm text-gray-700 truncate whitespace-nowrap transition-colors duration-200 cursor-pointer dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 max-w-24"
                  >
                    {user.user_metadata?.name || user.email}님
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 whitespace-nowrap rounded-md transition-colors duration-200 dark:text-gray-300 hover:text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <LogOut className="mr-2 w-4 h-4" />
                    로그아웃
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 whitespace-nowrap rounded-md transition-colors duration-200 dark:text-gray-300 hover:text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <LogIn className="mr-2 w-4 h-4" />
                  로그인
                </button>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center ml-auto space-x-2 lg:hidden">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              disabled={themeLoading}
              className={`flex flex-shrink-0 justify-center items-center w-10 h-10 rounded-md transition-colors duration-200 ${
                themeLoading
                  ? "text-gray-400 bg-gray-100 cursor-not-allowed dark:bg-gray-700"
                  : "text-gray-700 dark:text-gray-300 hover:text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              {themeLoading ? (
                <div className="w-5 h-5 bg-gray-300 rounded animate-pulse dark:bg-gray-600"></div>
              ) : theme === "light" ? (
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
                      ? "text-white bg-primary-600 dark:text-white dark:bg-primary-600"
                      : "text-gray-700 dark:text-gray-300 hover:text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  <Icon className="mr-3 w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}

            {/* 달달 커뮤니티 섹션 */}
            <div className="px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300">
              <div className="flex items-center">
                <Users className="mr-3 w-5 h-5" />
                커뮤니티
              </div>
            </div>
            {communityItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={(e) => {
                    handleNavItemClick(item, e);
                    setIsOpen(false);
                  }}
                  className={`flex items-center px-6 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                    isActive(item.href)
                      ? "text-white bg-primary-600 dark:text-white dark:bg-primary-600"
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
