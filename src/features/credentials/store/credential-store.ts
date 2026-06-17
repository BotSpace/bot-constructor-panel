import { create } from "zustand";
import { instanceAuth } from "@/services/instance";
import toast from "react-hot-toast";
import {
  CredentialListItem,
  CredentialType,
  CreateCredentialPayload,
  PatchCredentialPayload,
  CreateCredentialTypePayload,
} from "@/types/http/credential";

// ---------------------------------------------------------------------------
// Shape helpers
// ---------------------------------------------------------------------------

function extractResults<T>(raw: unknown): T[] {
  const r = (raw ?? {}) as Record<string, unknown>;
  const data = r.data as Record<string, unknown> | T[] | undefined;
  const candidates: unknown[] = [
    r.results,
    (data as Record<string, unknown> | undefined)?.results,
    data,
    raw,
  ];
  return (candidates.find(Array.isArray) as T[] | undefined) ?? [];
}

// ---------------------------------------------------------------------------
// Types store (global, not project-scoped)
// ---------------------------------------------------------------------------

type CredentialTypesStore = {
  types: CredentialType[] | null;
  typesLoading: boolean;
  loadTypes: () => void;
  createType: (payload: CreateCredentialTypePayload) => Promise<CredentialType>;
};

export const useCredentialTypesStore = create<CredentialTypesStore>((set, get) => ({
  types: null,
  typesLoading: false,

  loadTypes() {
    // avoid duplicate concurrent fetches
    if (get().typesLoading) return;
    set({ typesLoading: true });

    instanceAuth
      .get("/v1/credentials/types/")
      .then(({ data }) => {
        set({ types: extractResults<CredentialType>(data) });
      })
      .catch(() => {
        toast.error("Credential turlari yuklanmadi");
      })
      .finally(() => set({ typesLoading: false }));
  },

  async createType(payload) {
    const { data } = await instanceAuth.post("/v1/credentials/types/", payload);
    const created: CredentialType = data?.data ?? data;
    set((s) => ({ types: [...(s.types ?? []), created] }));
    return created;
  },
}));

// ---------------------------------------------------------------------------
// Project credentials store
// ---------------------------------------------------------------------------

type CredentialStore = {
  credentials: CredentialListItem[] | null;
  total: number;
  loading: boolean;
  page: number;
  pageSize: number;
  typeFilter: string;
  loadCredentials: (projectId: string, opts?: { page?: number; type?: string }) => void;
  setPage: (page: number) => void;
  setTypeFilter: (type: string) => void;
  createCredential: (projectId: string, payload: CreateCredentialPayload) => Promise<CredentialListItem>;
  updateCredential: (projectId: string, id: number, payload: PatchCredentialPayload) => Promise<CredentialListItem>;
  deleteCredential: (projectId: string, id: number) => Promise<void>;
  testCredential: (projectId: string, id: number) => Promise<{ ok: boolean }>;
};

export const useCredentialStore = create<CredentialStore>((set, get) => ({
  credentials: null,
  total: 0,
  loading: false,
  page: 1,
  pageSize: 20,
  typeFilter: "",

  loadCredentials(projectId, opts) {
    const { page: currentPage, pageSize, typeFilter: currentType } = get();
    const page = opts?.page ?? currentPage;
    const type = opts?.type ?? currentType;

    set({ loading: true });

    const params: Record<string, string | number> = { page, page_size: pageSize };
    if (type) params.type = type;

    instanceAuth
      .get(`/v1/credentials/projects/${projectId}/credentials/`, { params })
      .then(({ data }) => {
        const results = extractResults<CredentialListItem>(data);
        const raw = (data ?? {}) as Record<string, unknown>;
        const total =
          typeof raw.count === "number"
            ? raw.count
            : typeof (raw.data as Record<string, unknown> | undefined)?.count === "number"
              ? ((raw.data as Record<string, unknown>).count as number)
              : results.length;
        set({ credentials: results, total, page, typeFilter: type });
      })
      .catch(() => {
        toast.error("Credential'lar yuklanmadi");
      })
      .finally(() => set({ loading: false }));
  },

  setPage(page) {
    set({ page });
  },

  setTypeFilter(type) {
    set({ typeFilter: type, page: 1 });
  },

  async createCredential(projectId, payload) {
    const { data } = await instanceAuth.post(
      `/v1/credentials/projects/${projectId}/credentials/`,
      payload
    );
    const created: CredentialListItem = data?.data ?? data;
    set((s) => ({
      credentials: [created, ...(s.credentials ?? [])],
      total: s.total + 1,
    }));
    return created;
  },

  async updateCredential(projectId, id, payload) {
    const { data } = await instanceAuth.patch(
      `/v1/credentials/projects/${projectId}/credentials/${id}/`,
      payload
    );
    const updated: CredentialListItem = data?.data ?? data;
    set((s) => ({
      credentials: (s.credentials ?? []).map((c) => (c.id === id ? updated : c)),
    }));
    return updated;
  },

  async deleteCredential(projectId, id) {
    await instanceAuth.delete(`/v1/credentials/projects/${projectId}/credentials/${id}/`);
    set((s) => ({
      credentials: (s.credentials ?? []).filter((c) => c.id !== id),
      total: Math.max(0, s.total - 1),
    }));
  },

  async testCredential(projectId, id) {
    const { data } = await instanceAuth.post(
      `/v1/credentials/projects/${projectId}/credentials/${id}/test/`
    );
    return data?.data ?? data;
  },
}));
