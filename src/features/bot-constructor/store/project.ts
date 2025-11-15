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
  changeProjectStatus: (status: ProjectRetrive["debug"]["status"]) => void;
}

const useProjectStore = create<ProjectState>((set, get) => ({
  project: null,
  loading: true,
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
  changeProject: (project: ProjectRetrive) => {
    set({ project: project });
  },

  changeProjectStatus: (status) => {
    const project = get().project;
    if (project && project.debug) {
      set({
        ...get(),
        project: {
          ...project,
          debug: {
            id: project.debug.id,
            service_id: project.debug.service_id,
            status: status,
          },
        },
      });
    }
  },
}));

export default useProjectStore;
