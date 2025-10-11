import { Project } from "@/types/constructor/project";
import { create } from "zustand";
import { instanceAuth } from "../instance";
import { APIResponseType } from "@/types/http";

interface UserStore {
  response: APIResponseType<Project> | null;
  status: Project["debug"]["status"] | null;
  loading: boolean;
  error: string | null;
  fetchProject: (id: string) => Promise<void>;
  changeResponseStatus: (status: Project["debug"]["status"]) => void;
}

const useUserStore = create<UserStore>((set, get) => ({
  response: null,
  loading: false,
  error: null,
  status: null,

  // 🔹 API'dan ma'lumot olish
  fetchProject: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const { data } = await instanceAuth.get<APIResponseType<Project>>(
        `/project/${id}`
      );

      set({
        response: data,
        loading: false,
        error: null,
        status: data.data.debug?.status || null,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Xatolik yuz berdi",
        loading: false,
      });
    }
  },

  changeResponseStatus: (status: Project["debug"]["status"]) => {
    set({ status });
  },
}));

export default useUserStore;
