import { ProjectRetrive } from "@/types/http/project";
import { create } from "zustand";
import { instanceAuth } from "../instance";
import { APIResponseType } from "@/types/http";

interface UserStore {
  response: ProjectRetrive | null;
  loading: boolean;
  error: string | null;
  fetchProject: (id: string) => Promise<void>;
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
      const { data } = await instanceAuth.get<APIResponseType<ProjectRetrive>>(
        `/project/${id}`
      );

      set({
        response: data.data,
        loading: false,
        error: null,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Xatolik yuz berdi",
        loading: false,
      });
    }
  },
}));

export default useUserStore;
