import { instanceAuth } from "../instance";
import { CreateFileResponse, CreateFileRequest, FileType } from "@/types/http/file";

/**
 * Fayl yuklash funksiyasi
 * @param file - Yuklanayotgan fayl
 * @param filetype - Fayl turi (photo, video, audio, file)
 * @returns Upload qilingan fayl ma'lumotlari
 */
export async function uploadFile(
  file: File,
  filetype: FileType
): Promise<CreateFileResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("filetype", filetype);

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

