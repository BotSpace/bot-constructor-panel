import { Project } from "@/types/constructor/project";
import { create } from "zustand";
import { instanceAuth } from "../instance";
import { APIResponseType } from "@/types/http";

interface UserStore {
  response: APIResponseType<Project> | null;
  loading: boolean;
  error: string | null;
  fetchProject: (id: string) => Promise<void>;
  setDebugBot: (bot: Project["bot_for_debug"]) => void;
  setRelaseBot: (bot: Project["bot_for_release"]) => void;
}

const useUserStore = create<UserStore>((set, get) => ({
  response: null,
  loading: false,
  error: null,

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
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Xatolik yuz berdi",
        loading: false,
      });
    }
  },

  // 🔹 bot_for_debug maydonini yangilash
  setDebugBot: (bot) => {
    const current = get().response;

    if (current && current.data) {
      set({
        response: {
          ...current,
          data: {
            ...current.data,
            bot_for_debug: bot,
          },
        },
      });
    }
  },

  setRelaseBot: (bot) => {
    const current = get().response;

    if (current && current.data) {
      set({
        response: {
          ...current,
          data: {
            ...current.data,
            bot_for_release: bot,
          },
        },
      });
    }
  },
}));

export default useUserStore;
