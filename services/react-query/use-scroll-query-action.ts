"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { instance } from "../instance";
import { ScrollAPIResponse } from "@/types";

export const useReactQueryScrollLoadingAction = <T>(
  url: string,
  params?: Record<string, any>
) => {
  const getNextPageParam = (
    lastPage: ScrollAPIResponse<T>
  ): number | undefined => {
    const nextUrlString = lastPage.data.links.next;

    if (!nextUrlString) {
      return undefined; // Boshqa sahifa yo'q
    }

    try {
      // URLSearchParams yordamida ishonchli parse qilish
      // Agar nextUrlString to'liq URL bo'lmasa, base URL ko'rsatish kerak bo'lishi mumkin
      // Masalan: new URL(nextUrlString, window.location.origin)
      const nextUrl = new URL(nextUrlString);
      const nextPageParam = nextUrl.searchParams.get("page");

      if (nextPageParam === null) {
        console.warn(
          "Keyingi URLda 'page' parametri topilmadi:",
          nextUrlString
        );
        return undefined; // Parametr topilmadi
      }

      const nextPage = parseInt(nextPageParam, 10);

      if (isNaN(nextPage)) {
        console.warn(
          "Keyingi URLdan sahifa raqamini parse qilib bo'lmadi:",
          nextUrlString
        );
        return undefined; // Parse qilishda xatolik
      }

      // Muvaffaqiyatli parse qilingan sahifa raqamini qaytarish
      return nextPage;
    } catch (error) {
      console.error(
        "Keyingi URLni parse qilishda xatolik:",
        nextUrlString,
        error
      );
      return undefined; // URL parse qilishda xatolik
    }
  };

  return useInfiniteQuery<ScrollAPIResponse<T>>({
    queryKey: [url + JSON.stringify(params)],
    queryFn: async ({ pageParam }): Promise<ScrollAPIResponse<T>> => {
      // Check if the URL already has query parameters
      return await instance.get(url, {
        params: {
          ...params,
          page: pageParam,
        },
      });
    },
    initialPageParam: 1,
    getNextPageParam: getNextPageParam,
  });
};
