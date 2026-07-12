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

  // Process URL with params
  let processedUrl = url ?? "";

  Object.keys(params).forEach((key) => {
    const regex = new RegExp(`\\[${key}\\]`, "g");
    const value = Array.isArray(params[key])
      ? params[key]?.[0] // agar array bo'lsa — birinchi elementni olamiz
      : params[key];

    if (value !== undefined && processedUrl) {
      processedUrl = processedUrl.replace(regex, String(value));
    }
  });

  // ✅ Agar query object bo'lsa, uni stringga qo'shamiz
  if (query && processedUrl) {
    processedUrl += queryGenerator(query);
  }

  // Hooks must run in the same order even while the URL is not available yet.
  const debouncedValue = useDebounces(processedUrl, debounceTime ?? 0);
  const debouncedUrl = debounceTime ? debouncedValue : processedUrl;

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
    enabled: Boolean(processedUrl) && enabled && (!debounceTime || debouncedUrl === processedUrl),
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
