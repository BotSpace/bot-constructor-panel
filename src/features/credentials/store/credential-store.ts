import { create } from "zustand";
import { instanceAuth } from "@/services/instance";
import toast from "react-hot-toast";
import {
  CredentialListItem,
  CredentialType,
  CreateCredentialPayload,
  PatchCredentialPayload,
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

// A Credential carries its OWN `data` field (masked values), so a naive `raw.data ?? raw`
// unwrap would return the inner masked dict instead of the credential. Only unwrap when the
// payload isn't already a credential (detect id/type_key).
function unwrapCredential(raw: unknown): CredentialListItem {
  const r = (raw ?? {}) as Record<string, unknown>;
  if (r.id !== undefined || r.type_key !== undefined) return r as CredentialListItem;
  const inner = r.data as Record<string, unknown> | undefined;
  if (inner && (inner.id !== undefined || inner.type_key !== undefined)) {
    return inner as CredentialListItem;
  }
  return r as CredentialListItem;
}

// ---------------------------------------------------------------------------
// Types store — READ-ONLY registry, defined in backend code (not user-created).
// ---------------------------------------------------------------------------

type CredentialTypesStore = {
  types: CredentialType[] | null;
  typesLoading: boolean;
  loadTypes: () => void;
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
}));

// ---------------------------------------------------------------------------
// Credentials store — GLOBAL per user (owner-scoped). NOT project-scoped:
// one credential set is shared across all of the user's bots/projects.
// ---------------------------------------------------------------------------

type CredentialStore = {
  credentials: CredentialListItem[] | null;
  total: number;
  loading: boolean;
  page: number;
  pageSize: number;
  typeFilter: string;
  loadCredentials: (opts?: { page?: number; type?: string }) => void;
  setPage: (page: number) => void;
  setTypeFilter: (type: string) => void;
  createCredential: (payload: CreateCredentialPayload) => Promise<CredentialListItem>;
  updateCredential: (id: number, payload: PatchCredentialPayload) => Promise<CredentialListItem>;
  deleteCredential: (id: number) => Promise<void>;
  testCredential: (id: number) => Promise<{ ok: boolean }>;
};

export const useCredentialStore = create<CredentialStore>((set, get) => ({
  credentials: null,
  total: 0,
  loading: false,
  page: 1,
  pageSize: 20,
  typeFilter: "",

  loadCredentials(opts) {
    const { page: currentPage, pageSize, typeFilter: currentType } = get();
    const page = opts?.page ?? currentPage;
    const type = opts?.type ?? currentType;

    set({ loading: true });

    const params: Record<string, string | number> = { page, page_size: pageSize };
    if (type) params.type_key = type;

    instanceAuth
      .get(`/v1/credentials/`, { params })
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

  async createCredential(payload) {
    const { data } = await instanceAuth.post(`/v1/credentials/`, payload);
    const created: CredentialListItem = unwrapCredential(data);
    set((s) => ({
      credentials: [created, ...(s.credentials ?? [])],
      total: s.total + 1,
    }));
    return created;
  },

  async updateCredential(id, payload) {
    const { data } = await instanceAuth.patch(`/v1/credentials/${id}/`, payload);
    const updated: CredentialListItem = unwrapCredential(data);
    set((s) => ({
      credentials: (s.credentials ?? []).map((c) => (c.id === id ? updated : c)),
    }));
    return updated;
  },

  async deleteCredential(id) {
    await instanceAuth.delete(`/v1/credentials/${id}/`);
    set((s) => ({
      credentials: (s.credentials ?? []).filter((c) => c.id !== id),
      total: Math.max(0, s.total - 1),
    }));
  },

  async testCredential(id) {
    const { data } = await instanceAuth.post(`/v1/credentials/${id}/test/`);
    return data?.data ?? data;
  },
}));
