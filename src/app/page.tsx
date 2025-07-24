import { Heart, Users, Star, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="overflow-hidden relative py-12 w-full text-center md:py-20">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 dark:from-pink-900/20 dark:via-purple-900/20 dark:to-blue-900/20 animate-gradient"></div>

        {/* Floating Particles */}
        <div className="overflow-hidden absolute inset-0">
          <div className="absolute left-10 top-20 w-4 h-4 bg-pink-400 rounded-full opacity-60 animate-float"></div>
          <div className="absolute right-20 top-40 w-3 h-3 bg-purple-400 rounded-full opacity-60 animate-float-delayed"></div>
          <div className="absolute bottom-20 left-20 w-5 h-5 bg-blue-400 rounded-full opacity-60 animate-float-slow"></div>
          <div className="absolute right-10 bottom-40 w-2 h-2 bg-pink-300 rounded-full opacity-60 animate-float-delayed"></div>
          <div className="absolute top-1/2 left-1/4 w-3 h-3 bg-purple-300 rounded-full opacity-60 animate-float-slow"></div>
          <div className="absolute top-1/3 right-1/3 w-4 h-4 bg-blue-300 rounded-full opacity-60 animate-float"></div>
        </div>

        {/* Sparkle Effects */}
        <div className="absolute top-10 left-1/4 animate-pulse">
          <Sparkles className="w-6 h-6 text-yellow-400" />
        </div>
        <div className="absolute top-20 right-1/3 delay-1000 animate-pulse">
          <Sparkles className="w-4 h-4 text-pink-400" />
        </div>
        <div className="absolute bottom-10 left-1/3 animate-pulse delay-2000">
          <Sparkles className="w-5 h-5 text-purple-400" />
        </div>

        <div className="relative px-4 mx-auto max-w-4xl">
          <div className="animate-fade-in-up">
            <h1 className="mb-6 text-4xl font-bold text-gray-900 md:text-6xl dark:text-white">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 animate-gradient-text">
                달달 네트워크
              </span>
              로
              <br />
              진정한 만남을 시작하세요
            </h1>
          </div>

          <div className="delay-300 animate-fade-in-up">
            <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-600 dark:text-gray-300">
              달달에서 특별한 수퍼 데이트 신청권을 통해 더 깊이 있는 만남을
              경험해보세요
            </p>
          </div>

          <div className="flex flex-col gap-4 justify-center delay-500 sm:flex-row animate-fade-in-up">
            <Link
              href="/super-date"
              className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-pink-500 to-purple-600 rounded-full shadow-lg transition-all duration-300 transform group hover:shadow-xl hover:scale-105 animate-bounce-subtle"
            >
              수퍼 데이트 신청하기
              <ArrowRight className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              href="/introductions"
              className="inline-flex items-center px-8 py-4 text-lg font-semibold text-gray-700 bg-white rounded-full border-2 border-gray-200 shadow-lg transition-all duration-300 transform group dark:text-white dark:bg-gray-800 hover:shadow-xl hover:scale-105 dark:border-gray-600"
            >
              자기소개서 보기
              <Users className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
            </Link>
          </div>
        </div>
      </section>

      {/* What is Super Date Section */}
      <section className="py-12">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-12 text-3xl font-bold text-center text-gray-900 md:text-4xl dark:text-white animate-fade-in-up">
            슈퍼 데이트 신청권이란?
          </h2>

          <div className="grid gap-8 items-center md:grid-cols-2">
            <div className="space-y-6">
              <div className="flex items-start space-x-4 delay-300 animate-fade-in-up">
                <div className="flex flex-shrink-0 justify-center items-center w-12 h-12 rounded-lg transition-transform duration-300 bg-primary-100 dark:bg-primary-900/30 hover:scale-110">
                  <Heart className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                    익명 투표 시스템
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    로그인한 상태에서 마음에 드는 상대에게 익명으로 투표할 수
                    있습니다. 한 번에 한 명에게만 투표 가능하며, 중복 투표는
                    불가합니다.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 delay-500 animate-fade-in-up">
                <div className="flex flex-shrink-0 justify-center items-center w-12 h-12 rounded-lg transition-transform duration-300 bg-primary-100 dark:bg-primary-900/30 hover:scale-110">
                  <Star className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                    상호 선택 시 매칭
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    상대방도 나를 선택했을 때만 매칭이 성사됩니다. 매칭 성공 시
                    내 프로필 페이지에 상대방 정보가 나타나고 슈퍼 데이트
                    신청권이 발행됩니다.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 delay-700 animate-fade-in-up">
                <div className="flex flex-shrink-0 justify-center items-center w-12 h-12 rounded-lg transition-transform duration-300 bg-primary-100 dark:bg-primary-900/30 hover:scale-110">
                  <Users className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                    필수 1:1 데이트
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    슈퍼 데이트 신청권을 사용하면 상대방과 무조건 1:1 데이트를
                    해야 합니다. 만남 후 서로 평소대로 지내기를 원한다면, 다른
                    사람에게 투표하면 신청권은 사라집니다.
                  </p>
                </div>
              </div>
            </div>

            <div className="transition-shadow duration-300 card animate-fade-in-up delay-900 hover:shadow-lg">
              <h3 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                슈퍼 데이트 신청권 규칙
              </h3>
              <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                <li className="flex items-center">
                  <div className="mr-3 w-2 h-2 rounded-full bg-primary-600"></div>
                  로그인한 사용자만 투표 가능
                </li>
                <li className="flex items-center">
                  <div className="mr-3 w-2 h-2 rounded-full bg-primary-600"></div>
                  한 번에 한 명에게만 투표 (중복 투표 불가)
                </li>
                <li className="flex items-center">
                  <div className="mr-3 w-2 h-2 rounded-full bg-primary-600"></div>
                  모든 투표는 익명으로 진행
                </li>
                <li className="flex items-center">
                  <div className="mr-3 w-2 h-2 rounded-full bg-primary-600"></div>
                  상호 선택 시에만 매칭 성사
                </li>
                <li className="flex items-center">
                  <div className="mr-3 w-2 h-2 rounded-full bg-primary-600"></div>
                  매칭 후 필수 1:1 데이트 진행
                </li>
                <li className="flex items-center">
                  <div className="mr-3 w-2 h-2 rounded-full bg-primary-600"></div>
                  다른 사람 투표 시 기존 신청권 소멸
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-12 bg-white rounded-lg shadow-sm transition-colors duration-200 dark:bg-gray-800">
        <div className="px-6 mx-auto max-w-4xl">
          <h2 className="mb-12 text-3xl font-bold text-center text-gray-900 md:text-4xl dark:text-white animate-fade-in-up">
            이용 방법
          </h2>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center transition-transform duration-300 delay-300 animate-fade-in-up hover:transform hover:scale-105">
              <div className="flex justify-center items-center mx-auto mb-4 w-16 h-16 rounded-full transition-transform duration-300 bg-primary-100 dark:bg-primary-900/30 hover:scale-110">
                <span className="text-2xl font-bold text-primary-600">1</span>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                자기소개서 작성
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                나만의 특별한 자기소개서를 작성하여 내면의 매력을 어필하세요
              </p>
            </div>

            <div className="text-center transition-transform duration-300 delay-500 animate-fade-in-up hover:transform hover:scale-105">
              <div className="flex justify-center items-center mx-auto mb-4 w-16 h-16 rounded-full transition-transform duration-300 bg-primary-100 dark:bg-primary-900/30 hover:scale-110">
                <span className="text-2xl font-bold text-primary-600">2</span>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                익명 투표하기
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                마음에 드는 상대에게 익명으로 투표하세요. 한 번에 한 명에게만
                투표할 수 있습니다
              </p>
            </div>

            <div className="text-center transition-transform duration-300 delay-700 animate-fade-in-up hover:transform hover:scale-105">
              <div className="flex justify-center items-center mx-auto mb-4 w-16 h-16 rounded-full transition-transform duration-300 bg-primary-100 dark:bg-primary-900/30 hover:scale-110">
                <span className="text-2xl font-bold text-primary-600">3</span>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                상호 선택 시 매칭
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                상대방도 나를 선택했을 때 매칭이 성사되고 필수 1:1 데이트가
                진행됩니다
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
