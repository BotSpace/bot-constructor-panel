import { instanceAuth } from "@/services/instance";
import { APIDetailCreateResponse } from "@/types/http/response";
import { ProjectRetrive } from "@/types/http/project";
import toast from "react-hot-toast";
import create from "zustand";

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
      .get<APIDetailCreateResponse<ProjectRetrive>>(`/project/${project_id}`)
      .then(({ data }) => {
        set({ project: data.data });
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
