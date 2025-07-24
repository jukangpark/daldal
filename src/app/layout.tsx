import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

export const metadata: Metadata = {
  title: "달달 - 수퍼 데이트 플랫폼",
  description: "진정한 만남을 위한 수퍼 데이트 신청권 플랫폼",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
                (function() {
                  try {
                    var theme = localStorage.getItem('theme');
                    var html = document.documentElement;
                    
                    // 기존 클래스 제거
                    html.classList.remove('light', 'dark');
                    
                    if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                      html.classList.add('dark');
                    } else {
                      html.classList.add('light');
                    }
                  } catch (e) {
                    console.error('Theme initialization error:', e);
                  }
                })();
              `,
          }}
        />
      </head>
      <body className="min-h-screen bg-gray-50 transition-colors duration-200 dark:bg-gray-900">
        <ThemeProvider>
          <AuthProvider>
            <Navigation />
            <main className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
              {children}
            </main>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
