import { FileType } from "@/types/http/file";

/**
 * Fayl turini MIME type yoki file extension'dan avtomatik aniqlaydi
 * @param file - Fayl obyekti
 * @returns FileType (photo, video, audio, file)
 */
export function detectFileType(file: File): FileType {
  const mimeType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();
  const extension = fileName.split(".").pop() || "";

  // Photo types
  const photoMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/bmp",
    "image/svg+xml",
  ];
  const photoExtensions = ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"];

  // Video types
  const videoMimeTypes = [
    "video/mp4",
    "video/mpeg",
    "video/quicktime",
    "video/x-msvideo",
    "video/x-ms-wmv",
    "video/webm",
    "video/ogg",
    "video/x-matroska",
  ];
  const videoExtensions = [
    "mp4",
    "mpeg",
    "mpg",
    "mov",
    "avi",
    "wmv",
    "webm",
    "ogv",
    "mkv",
  ];

  // Audio types
  const audioMimeTypes = [
    "audio/mpeg",
    "audio/mp3",
    "audio/wav",
    "audio/ogg",
    "audio/aac",
    "audio/flac",
    "audio/webm",
    "audio/x-m4a",
  ];
  const audioExtensions = ["mp3", "wav", "ogg", "aac", "flac", "m4a", "wma"];

  // MIME type bo'yicha tekshirish
  if (photoMimeTypes.some((type) => mimeType.includes(type))) {
    return "photo";
  }
  if (videoMimeTypes.some((type) => mimeType.includes(type))) {
    return "video";
  }
  if (audioMimeTypes.some((type) => mimeType.includes(type))) {
    return "audio";
  }

  // Extension bo'yicha tekshirish (MIME type bo'lmasa)
  if (photoExtensions.includes(extension)) {
    return "photo";
  }
  if (videoExtensions.includes(extension)) {
    return "video";
  }
  if (audioExtensions.includes(extension)) {
    return "audio";
  }

  // Default: file
  return "file";
}
