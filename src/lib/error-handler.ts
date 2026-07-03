import { AxiosError } from "axios";

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export function handleApiError(error: unknown): ApiError {
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    const data = error.response?.data;

    // Go backend error envelope: { error: { code, message, details } }.
    if (data?.error?.message) {
      return {
        message: data.error.message,
        status,
        code: data.error.code,
      };
    }

    // Old Django-style flat error response
    if (data?.message) {
      return {
        message: data.message,
        status,
        code: data.code,
      };
    }

    // Network error
    if (error.code === "NETWORK_ERROR" || !error.response) {
      return {
        message: "Internet aloqasi yo'q. Iltimos, qaytadan urinib ko'ring.",
        status: 0,
        code: "NETWORK_ERROR",
      };
    }

    // HTTP status based errors
    switch (status) {
      case 400:
        return {
          message:
            "Noto'g'ri so'rov. Ma'lumotlarni tekshirib qaytadan urinib ko'ring.",
          status,
          code: "BAD_REQUEST",
        };
      case 401:
        return {
          message: "Sizning sessiyangiz tugagan. Qaytadan kiring.",
          status,
          code: "UNAUTHORIZED",
        };
      case 403:
        return {
          message: "Bu amalni bajarish uchun ruxsatingiz yo'q.",
          status,
          code: "FORBIDDEN",
        };
      case 404:
        return {
          message: "Ma'lumot topilmadi.",
          status,
          code: "NOT_FOUND",
        };
      case 422:
        return {
          message: data?.errors
            ? Object.values(data.errors).flat().join(", ")
            : "Ma'lumotlar noto'g'ri.",
          status,
          code: "VALIDATION_ERROR",
        };
      case 429:
        return {
          message:
            "Juda ko'p so'rov yuborildi. Biroz kutib qaytadan urinib ko'ring.",
          status,
          code: "RATE_LIMITED",
        };
      case 500:
        return {
          message: "Server xatoligi. Iltimos, keyinroq urinib ko'ring.",
          status,
          code: "SERVER_ERROR",
        };
      default:
        return {
          message: `Xatolik yuz berdi (${status}). Iltimos, qaytadan urinib ko'ring.`,
          status,
          code: "UNKNOWN_ERROR",
        };
    }
  }

  // Generic error
  if (error instanceof Error) {
    return {
      message: error.message,
      code: "GENERIC_ERROR",
    };
  }

  // Unknown error
  return {
    message: "Noma'lum xatolik yuz berdi.",
    code: "UNKNOWN_ERROR",
  };
}



