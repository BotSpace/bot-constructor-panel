import { CollectionField, CollectionListItem } from "@/types/http/collection";
import { create } from "zustand";
import { instanceAuth } from "@/services/instance";
import toast from "react-hot-toast";

// The cms collections endpoint returns the paginated body DIRECTLY
// ({ results: [{id, name, ...}], total_items, ... }). Some endpoints instead
// wrap it as { status, data: {...} } or { status, data: [...] }. Be robust to
// all shapes — the previous code read raw.data.results and crashed on the bare
// { results } body (raw.data was undefined → "ma'lumot yuklashda xatolik").
type CmsCollectionRaw = {
  _id?: string;
  id?: string | number;
  name: string;
  slug?: string;
  fields?: unknown;
  [key: string]: unknown;
};

function extractFields(raw: unknown): CollectionField[] | undefined {
  if (!Array.isArray(raw)) return undefined;

  return raw
    .filter(
      (field): field is Record<string, unknown> =>
        Boolean(field && typeof field === "object" && typeof field.name === "string"),
    )
    .map((field) => ({
      id:
        typeof field.id === "string" || typeof field.id === "number"
          ? field.id
          : String(field.name),
      name: String(field.name),
      label: typeof field.label === "string" ? field.label : undefined,
      kind:
        typeof field.kind === "string"
          ? field.kind
          : typeof field.type === "string"
            ? field.type
            : "text",
      type: typeof field.type === "string" ? field.type : undefined,
      required: Boolean(field.required),
      default: field.default,
      relation_collection:
        typeof field.relation_collection === "string" ||
        typeof field.relation_collection === "number" ||
        field.relation_collection === null
          ? field.relation_collection
          : undefined,
      relation_collection_id:
        typeof field.relation_collection_id === "string"
          ? field.relation_collection_id
          : field.relation_collection_id === null
            ? null
            : undefined,
    }));
}

function extractCollections(raw: unknown): CollectionListItem[] {
  const r = (raw ?? {}) as Record<string, unknown>;
  const data = r.data as Record<string, unknown> | unknown[] | undefined;
  const candidates: unknown[] = [
    r.items, // { items: [...] }  (Go backend list envelope, the actual shape)
    r.results, // { results: [...] }  (old Django paginated body)
    (data as Record<string, unknown> | undefined)?.results, // { data: { results: [...] } }
    data, // { data: [...] }
    raw, // bare array
  ];
  const items = (candidates.find(Array.isArray) as CmsCollectionRaw[] | undefined) ?? [];
  return items
    .filter((item) => item && typeof item.name === "string")
    .map((item) => ({
      id: item.id ?? item._id ?? item.name,
      name: item.name,
      slug: typeof item.slug === "string" && item.slug ? item.slug : undefined,
      system: Boolean(item.system),
      fields: extractFields(item.fields),
    }));
}

type CollectionStore = {
  data: CollectionListItem[] | null;
  loading: boolean;
  loadCollections: (project_id: string) => void;
  changeData: (data: CollectionListItem[]) => void;
  deleteCollection: (project_id: string, name: string) => Promise<void>;
};

export const useCollectionStore = create<CollectionStore>((set, get) => ({
  data: null,
  loading: true,

  // Load collections from cms app (Mongo — agent-created, engine-used)
  loadCollections(project_id) {
    set({ loading: true });

    instanceAuth
      .get(`/cms/projects/${project_id}/collections/`)
      .then(({ data }) => {
        set({ data: extractCollections(data) });
      })
      .catch(() => {
        toast.error("Ma'lumot yuklashda xatolik yuz berdi");
      })
      .finally(() => set({ loading: false }));
  },

  // Update data
  changeData(data) {
    set({ data });
  },

  // Delete a collection by name (system collections are blocked on both
  // UI and server sides; 403 PermissionDenied is handled by the caller).
  async deleteCollection(project_id, name) {
    await instanceAuth.delete(`/cms/projects/${project_id}/collections/${name}/`);
    const current = get().data ?? [];
    set({ data: current.filter((c) => c.name !== name) });
  },
}));
