import { supabase } from "../supabase";

// 파일 업로드 관련 함수들
const fileAPI = {
  // 파일을 Supabase Storage에 업로드
  async uploadFilesToStorage(files: FileList, userId: string, postId?: string) {
    const uploadedUrls = [];
    const errors = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // 파일 검증
      if (!this.validateFile(file)) {
        errors.push(`파일 ${file.name}: 지원하지 않는 형식입니다.`);
        continue;
      }

      const fileExt = file.name.split(".").pop();
      const timestamp = Date.now() + i; // 중복 방지
      const fileName = postId
        ? `${userId}/${postId}/${timestamp}.${fileExt}`
        : `${userId}/${timestamp}.${fileExt}`;

      try {
        // Storage에 업로드
        const { data, error } = await supabase.storage
          .from("photos")
          .upload(fileName, file);

        if (error) {
          console.error("Upload error:", error);
          errors.push(`파일 ${file.name}: 업로드 실패`);
          continue;
        }

        // 공개 URL 생성
        const {
          data: { publicUrl },
        } = supabase.storage.from("photos").getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
      } catch (err) {
        console.error("Upload error:", err);
        errors.push(`파일 ${file.name}: 업로드 중 오류 발생`);
      }
    }

    return { uploadedUrls, errors };
  },

  // 파일 검증
  validateFile(file: File): boolean {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      return false;
    }

    if (file.size > maxSize) {
      return false;
    }

    return true;
  },

  // 파일 삭제
  async deleteFile(fileName: string) {
    const { error } = await supabase.storage.from("photos").remove([fileName]);

    if (error) {
      console.error("File delete error:", error);
      throw error;
    }
  },
};

export default fileAPI;
