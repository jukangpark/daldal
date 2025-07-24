"use client";

import { useEffect } from "react";

export default function ThemeScript() {
  useEffect(() => {
    try {
      const theme = localStorage.getItem("theme");
      const html = document.documentElement;

      // 기존 클래스 제거
      html.classList.remove("light", "dark");

      if (
        theme === "dark" ||
        (!theme && window.matchMedia("(prefers-color-scheme: dark)").matches)
      ) {
        html.classList.add("dark");
      } else {
        html.classList.add("light");
      }
    } catch (e) {
      console.error("Theme initialization error:", e);
    }
  }, []);

  return null;
}
