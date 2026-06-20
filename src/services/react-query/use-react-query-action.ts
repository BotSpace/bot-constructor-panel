"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { instanceAuth } from "@/services/instance";
import { useDebounces } from "@/hooks/use-debounces";
import { handleApiError } from "@/lib/error-handler";
import { queryGenerator } from "@/lib/query-generator";

export const useReactQueryAction = <T>({
  url,
  query,
  debounceTime,
  enabled = true,
  method = "GET",
  data,
}: {
  url?: string;
  query?: Record<string, any>;
  debounceTime?: number;
  enabled?: boolean;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  data?: any;
}) => {
  const params = useParams();

  // Handle undefined url early - return disabled query if no URL
  if (!url) {
    return useQuery<T>({
      queryKey: ["disabled"],
      queryFn: async () => {
        throw new Error("URL is required");
      },
      enabled: false,
    });
  }

  // Process URL with params
  let processedUrl = url;

  Object.keys(params).forEach((key) => {
    const regex = new RegExp(`\\[${key}\\]`, "g");
    const value = Array.isArray(params[key])
      ? params[key]?.[0] // agar array bo'lsa — birinchi elementni olamiz
      : params[key];

    if (value !== undefined && processedUrl) {
      processedUrl = processedUrl.replace(regex, String(value));
    }
  });

  // Safety check: if processedUrl is still undefined or became empty, return disabled query
  if (!processedUrl) {
    return useQuery<T>({
      queryKey: ["disabled-no-url"],
      queryFn: async () => {
        throw new Error("Processed URL is empty");
      },
      enabled: false,
    });
  }

  // ✅ Agar query object bo'lsa, uni stringga qo'shamiz
  if (query) {
    processedUrl += queryGenerator(query);
  }

  // ✅ Debounce ishlatish (ixtiyoriy)
  const debouncedUrl = debounceTime ? useDebounces(processedUrl, debounceTime) : processedUrl;

  return useQuery<T>({
    queryKey: [debouncedUrl],
    queryFn: async () => {
      try {
        const { data: responseData } = await instanceAuth.request({
          method,
          url: debouncedUrl,
          data,
        });
        return responseData;
      } catch (error) {
        const apiError = handleApiError(error);

        // Development'da error'ni console'ga chiqarish
        if (process.env.NODE_ENV === "development") {
          console.error("React Query Error:", {
            url: debouncedUrl,
            error: apiError,
            originalError: error,
          });
        }

        // Error'ni throw qilish React Query'ga error state'ni berish uchun
        throw apiError;
      }
    },
    // ✅ Debounce bo'lsa, URL tayyor bo'lganda ishga tushsin
    enabled: enabled && (!debounceTime || debouncedUrl === processedUrl),
    retry: (failureCount, error) => {
      // 401, 403, 404 kabi error'larda retry qilmaslik
      if (error && typeof error === "object" && "status" in error) {
        const status = (error as any).status;
        if ([401, 403, 404].includes(status)) {
          return false;
        }
      }
      // Boshqa error'larda 3 marta retry qilish
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
};
