import { instanceAuth } from "@/services/instance";
import {
  DebugInfo,
  ProjectResponse,
  ProjectRetrive,
  ReleaseInfo,
} from "@/types/http/project";
import { Env } from "@/types/http/env";
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

/**
 * The Go backend stores `flow` as raw JSON and defaults a brand-new project
 * to `[]` (empty array) rather than `{nodes:[],edges:[]}`. Normalize here so
 * downstream `loadFlow(project.flow)` always receives a shape it accepts —
 * otherwise a new project would throw "flow.nodes array emas" on first open.
 */
function normalizeProjectFlow(flow: unknown): ProjectRetrive["flow"] {
  if (
    flow &&
    typeof flow === "object" &&
    !Array.isArray(flow) &&
    Array.isArray((flow as Record<string, unknown>).nodes) &&
    Array.isArray((flow as Record<string, unknown>).edges)
  ) {
    return flow as ProjectRetrive["flow"];
  }
  return { nodes: [], edges: [], languages: ["en"], defaultLanguage: "en" };
}

const STOPPED_DEBUG_STUB = (project_id: string): DebugInfo => ({
  id: "",
  project_id,
  status: "stopped",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});

const useProjectStore = create<ProjectState>((set, get) => ({
  // datas
  project: null,
  loading: true,

  // actions
  loadProject(project_id) {
    set({ loading: true });

    // The new backend's project detail no longer embeds release/debug/env —
    // fetch them alongside the project and merge into the ProjectRetrive
    // shape the rest of the UI (debug.tsx, relas.tsx) already expects.
    Promise.all([
      instanceAuth.get<ProjectResponse>(`/projects/${project_id}`),
      instanceAuth
        .get<ReleaseInfo[]>("/relase", { params: { project: project_id } })
        .catch(() => ({ data: [] as ReleaseInfo[] })),
      instanceAuth
        .get<DebugInfo>(`/projects/${project_id}/info`)
        .catch(() => null),
      instanceAuth
        .get<Env[]>("/enviroment", { params: { project: project_id } })
        .catch(() => ({ data: [] as Env[] })),
    ])
      .then(([projectRes, releasesRes, debugRes, envRes]) => {
        const raw = projectRes.data;
        const releases = Array.isArray(releasesRes.data) ? releasesRes.data : [];
        const latestRelease = releases.length
          ? releases.reduce((a, b) => (b.version > a.version ? b : a))
          : null;
        const envs = Array.isArray(envRes.data) ? envRes.data : [];
        const hasReleaseToken = envs.some((e) => e.key === "RELEASE_BOT_TOKEN");

        const project: ProjectRetrive = {
          ...raw,
          username: raw.bot_username ?? raw.username ?? null,
          flow: normalizeProjectFlow(raw.flow),
          debug: debugRes?.data ?? STOPPED_DEBUG_STUB(project_id),
          debug_uuid: raw.debug_webhook_uuid,
          release: latestRelease,
          release_bot: hasReleaseToken,
          // Debug never gated by a bot token on the new backend — always on.
          debug_bot: true,
        };

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
