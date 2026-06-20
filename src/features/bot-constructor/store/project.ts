import { instanceAuth } from "@/services/instance";
import { APIDetailCreateResponse } from "@/types/http/response";
import { ProjectRetrive } from "@/types/http/project";
import { decompressFlow } from "@/lib/flow-compress";
import toast from "react-hot-toast";
import { create } from "zustand";

interface ProjectState {
  project: ProjectRetrive | null;
  loading: boolean;
  loadProject: (project_id: string) => void;
  changeProject: (project: ProjectRetrive) => void;
  changeRelease: (release: ProjectRetrive["release"]) => void;
  changeDebug: (debug: ProjectRetrive["debug"]) => void;
}

const useProjectStore = create<ProjectState>((set, get) => ({
  // datas
  project: null,
  loading: true,

  // actions
  loadProject(project_id) {
    set({ loading: true });

    instanceAuth
      .get<APIDetailCreateResponse<ProjectRetrive>>(
        `/project/${project_id}`,
        { params: { compress: 1 } }
      )
      .then(({ data }) => {
        const project = data.data;

        // flow_gz mavjud bo'lsa — decompress qilib flow'ga o'rnatamiz.
        // Xato yoki yo'q bo'lsa — plain flow (backward-compat fallback).
        if (project.flow_gz) {
          const decompressed = decompressFlow(project.flow_gz);
          if (decompressed && typeof decompressed === "object") {
            project.flow = decompressed as ProjectRetrive["flow"];
          } else {
            console.warn("[project] flow_gz decompress muvaffaqiyatsiz, plain flow ishlatiladi");
          }
        }

        set({ project });
      })
      .catch(() => {
        toast.error("Bot yuklashda xatolik yuz berdi");
      })
      .finally(() => {
        set({ loading: false });
      });
  },

  // changes
  changeProject: (project: ProjectRetrive) => {
    set({ project: project });
  },

  // change release
  changeRelease: (release) => {
    const project = get().project;
    if (!project) return; // project null bo'lsa, hech narsa qilmaymiz

    set({
      project: {
        ...project,
        release: release,
      },
    });
  },
  // change debug
  changeDebug: (debug) => {
    const project = get().project;
    if (!project) return; // project null bo'lsa, hech narsa qilmaymiz

    set({
      project: {
        ...project,
        debug: debug,
      },
    });
  },
}));

export default useProjectStore;
