import { useState, useEffect } from "react";

// 닉네임 입력/편집 모달 컴포넌트
function NickNameModal({
  open,
  mode,
  initialNickname = "",
  onSave,
  onCancel,
}: {
  open: boolean;
  mode: "create" | "edit";
  initialNickname?: string;
  onSave: (nickname: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState(initialNickname);
  useEffect(() => {
    setValue(initialNickname);
  }, [initialNickname, open]);
  if (!open) return null;
  return (
    <div className="flex fixed inset-0 z-50 justify-center items-center bg-black bg-opacity-40">
      <div className="relative p-6 w-full max-w-md bg-white rounded-lg shadow-lg dark:bg-gray-800">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          onClick={onCancel}
          aria-label="닫기"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <h2 className="mb-4 text-xl font-bold text-center text-gray-900 dark:text-white">
          {mode === "create"
            ? "닉네임을 입력하세요 (최대 11자)"
            : "닉네임 편집"}
        </h2>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (value.trim()) onSave(value.trim());
            } else if (e.key === "Escape") {
              e.preventDefault();
              onCancel();
            }
          }}
          placeholder="닉네임을 입력하세요 (최대 11자)"
          className="px-3 py-2 w-full rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          maxLength={11}
          autoFocus
        />
        <div className="flex justify-end mt-4 space-x-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md dark:text-gray-300 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            취소
          </button>
          <button
            onClick={() => value.trim() && onSave(value.trim())}
            disabled={!value.trim()}
            className="px-4 py-2 text-white rounded-md bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
          >
            {mode === "create" ? "입장" : "저장"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default NickNameModal;
