import { instanceAuth } from "@/services/instance";
import { APIResponseType } from "@/types/http";
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
    const toastId = toast.loading("Bot yuklanmoqda...");

    instanceAuth
      .get<APIResponseType<ProjectRetrive>>(`/project/${project_id}`)
      .then(({ data }) => {
        toast.success("Bot muvaffaqiyatli yuklandi", { id: toastId });
        set({ project: data.data });
      })
      .catch(() => {
        toast.error("Bot yuklashda xatolik yuz berdi", { id: toastId });
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
