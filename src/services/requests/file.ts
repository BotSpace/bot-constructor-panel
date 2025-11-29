import { instanceAuth } from "../instance";
import {
  CreateFileResponse,
  CreateFileRequest,
  FileType,
} from "@/types/http/file";
import { detectFileType } from "@/lib/file-utils";

/**
 * Fayl yuklash funksiyasi
 * @param file - Yuklanayotgan fayl
 * @param filetype - Fayl turi (photo, video, audio, file). Agar berilmasa, avtomatik aniqlanadi
 * @returns Upload qilingan fayl ma'lumotlari
 */
export async function uploadFile(
  file: File,
  filetype?: FileType
): Promise<CreateFileResponse> {
  // Agar filetype berilmagan bo'lsa, avtomatik aniqlash
  const detectedFileType = filetype || detectFileType(file);

  const formData = new FormData();
  formData.append("file", file);
  formData.append("filetype", detectedFileType);

  const response = await instanceAuth.post<CreateFileResponse>(
    "/file/",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
}
