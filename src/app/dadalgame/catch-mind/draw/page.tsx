"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, RotateCcw, Save, Download, Loader2 } from "lucide-react";
import { catchMindAPI } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export default function DrawPage() {
  const { user } = useAuth();
  const [currentWord, setCurrentWord] = useState<string>("");
  const [isDrawing, setIsDrawing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("전체");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  // 랜덤 제시어 가져오기 (난이도 필터링만)
  const getRandomWord = async () => {
    try {
      setIsLoading(true);
      const filters = {
        difficulty_level:
          selectedDifficulty !== "전체" ? selectedDifficulty : undefined,
      };

      const { data, error } = await catchMindAPI.getRandomWord(filters);
      if (error) {
        console.error("제시어 가져오기 오류:", error);
        // 폴백: 기본 제시어 사용
        const fallbackWords = ["고양이", "강아지", "사과", "자동차", "집"];
        const randomIndex = Math.floor(Math.random() * fallbackWords.length);
        setCurrentWord(fallbackWords[randomIndex]);
      } else if (data) {
        setCurrentWord(data.word);
      }
    } catch (err) {
      console.error("제시어 가져오기 오류:", err);
      // 폴백: 기본 제시어 사용
      const fallbackWords = ["고양이", "강아지", "사과", "자동차", "집"];
      const randomIndex = Math.floor(Math.random() * fallbackWords.length);
      setCurrentWord(fallbackWords[randomIndex]);
    } finally {
      setIsLoading(false);
    }
  };

  // 캔버스 초기화
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = 400;
    canvas.height = 400;
    canvas.style.width = "400px";
    canvas.style.height = "400px";

    const context = canvas.getContext("2d");
    if (!context) return;

    context.lineCap = "round";
    context.strokeStyle = "black";
    context.lineWidth = 3;
    contextRef.current = context;

    // 제시어 설정
    getRandomWord();
  }, []);

  // 그리기 시작
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const { offsetX, offsetY } = e.nativeEvent;
    contextRef.current?.beginPath();
    contextRef.current?.moveTo(offsetX, offsetY);
  };

  // 그리기 중
  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = e.nativeEvent;
    contextRef.current?.lineTo(offsetX, offsetY);
    contextRef.current?.stroke();
  };

  // 그리기 종료
  const stopDrawing = () => {
    setIsDrawing(false);
  };

  // 캔버스 초기화
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
  };

  // 새 제시어 받기
  const getNewWord = async () => {
    await getRandomWord();
    clearCanvas();
    setIsSaved(false);
  };

  // 필터 변경 시 새 제시어 가져오기
  const handleFilterChange = async () => {
    await getRandomWord();
    clearCanvas();
    setIsSaved(false);
  };

  // 그림 저장
  const saveDrawing = async () => {
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      setIsLoading(true);

      // 이미지를 blob으로 변환
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
          },
          "image/png",
          0.8
        ); // 품질을 0.8로 설정하여 파일 크기 줄이기
      });

      // 파일 크기 확인 (5MB 제한)
      if (blob.size > 5 * 1024 * 1024) {
        alert("파일 크기가 너무 큽니다. (5MB 이하로 그려주세요)");
        return;
      }

      // Supabase에 저장
      const { data, error } = await catchMindAPI.saveDrawing(currentWord, blob);

      if (error) {
        console.error("그림 저장 오류:", error);
        alert(`그림 저장에 실패했습니다: ${JSON.stringify(error)}`);
      } else {
        setIsSaved(true);
        alert("그림이 저장되었습니다!");
      }
    } catch (error) {
      console.error("그림 저장 오류:", error);
      alert("그림 저장에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 그림 다운로드
  const downloadDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = `catch-mind-${currentWord}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <div className="px-4 py-4 mx-auto max-w-4xl sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <Link
              href="/dadalgame/catch-mind"
              className="flex items-center text-gray-600 transition-colors dark:text-white hover:text-gray-900 dark:hover:text-gray-200"
            >
              <ArrowLeft className="mr-2 w-5 h-5" />
              뒤로가기
            </Link>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              그림 그리기
            </h1>
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      <div className="px-4 py-8 mx-auto max-w-4xl sm:px-6 lg:px-8">
        {/* 난이도 필터링 UI */}
        <div className="mb-6">
          <div className="flex justify-center">
            <div className="flex flex-col items-center">
              <label className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                난이도
              </label>
              <select
                value={selectedDifficulty}
                onChange={(e) => {
                  setSelectedDifficulty(e.target.value);
                  handleFilterChange();
                }}
                className="px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="전체">전체</option>
                <option value="1">쉬움 (1)</option>
                <option value="2">보통 (2)</option>
                <option value="3">어려움 (3)</option>
              </select>
            </div>
          </div>
        </div>

        {/* 제시어 표시 */}
        <div className="mb-6 text-center">
          <div className="inline-block px-6 py-3 rounded-full bg-primary-100 dark:bg-primary-900/20">
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="w-6 h-6 animate-spin text-primary-700" />
                <h2 className="text-2xl font-bold text-primary-700 dark:text-primary-300">
                  제시어 로딩 중...
                </h2>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold text-primary-700 dark:text-primary-300">
                  제시어: {currentWord}
                </h2>
                <p className="mt-1 text-sm text-primary-600 dark:text-primary-400">
                  {selectedDifficulty !== "전체" &&
                    `난이도: ${
                      selectedDifficulty === "1"
                        ? "쉬움"
                        : selectedDifficulty === "2"
                        ? "보통"
                        : "어려움"
                    }`}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 캔버스 */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              className="bg-white rounded-lg border-2 border-gray-300 cursor-crosshair dark:border-gray-600"
              style={{ touchAction: "none" }}
            />
          </div>
        </div>

        {/* 컨트롤 버튼들 */}
        <div className="flex justify-center mb-6 space-x-4">
          <button
            onClick={getNewWord}
            className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-lg transition-colors hover:bg-blue-700"
          >
            <RotateCcw className="mr-2 w-4 h-4" />새 제시어
          </button>
          <button
            onClick={clearCanvas}
            className="flex items-center px-4 py-2 text-white bg-gray-600 rounded-lg transition-colors hover:bg-gray-700"
          >
            <RotateCcw className="mr-2 w-4 h-4" />
            지우기
          </button>
          <button
            onClick={saveDrawing}
            disabled={isSaved || isLoading}
            className="flex items-center px-4 py-2 text-white bg-green-600 rounded-lg transition-colors hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="mr-2 w-4 h-4 animate-spin" />
            ) : (
              <Save className="mr-2 w-4 h-4" />
            )}
            {isSaved ? "저장됨" : isLoading ? "저장 중..." : "저장"}
          </button>
          <button
            onClick={downloadDrawing}
            className="flex items-center px-4 py-2 text-white bg-purple-600 rounded-lg transition-colors hover:bg-purple-700"
          >
            <Download className="mr-2 w-4 h-4" />
            다운로드
          </button>
        </div>

        {/* 안내 메시지 */}
        <div className="text-center text-gray-600 dark:text-gray-400">
          <p className="mb-2">마우스로 그림을 그려보세요!</p>
          <p>그림을 완성하면 저장 버튼을 눌러주세요.</p>
        </div>
      </div>
    </div>
  );
}
