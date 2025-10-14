"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

import { queryGenerator } from "@/lib/query-generator";
import { useDebounces } from "@/hooks/use-debounces";
import { instanceAuth } from "../instance";
import { AxiosError } from "@/types/http/error";

export const useReactQueryAction = <T>({
  url,
  query,
  debounceTime,
  enabled,
}: {
  url: string;
  query?: Record<string, any>;
  debounceTime?: number;
  enabled?: boolean;
}) => {
  let params: any = useParams();

  Object.keys(params).map((key) => {
    url = url.replace(`[${key}]`, params[key]);
  });

  // urlga paramslarni qo'shish
  if (query) {
    url = url + queryGenerator(query);
  }

  // Debounced URL
  const debouncedUrl = debounceTime ? useDebounces(url, debounceTime) : url;

  return useQuery<T, AxiosError>({
    queryKey: [debouncedUrl],
    queryFn: async () => {
      return await instanceAuth.get(debouncedUrl);

      try {
        let { data } = await instanceAuth.get(debouncedUrl);
        return data;
      } catch (error) {
        return error;
      }
    },
    enabled: enabled && (!debounceTime || debouncedUrl === url),
  });
};
