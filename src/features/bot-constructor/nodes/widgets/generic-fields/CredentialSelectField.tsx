"use client";

import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Shield } from "lucide-react";
import { useFlowStore } from "@/features/bot-constructor/store";
import { CredentialFormModal } from "@/features/credentials/components/CredentialFormModal";
import { instanceAuth } from "@/services/instance";
import { CredentialListItem } from "@/types/http/credential";

// ---------------------------------------------------------------------------
// Per-typeKey result cache so multiple fields of the SAME type (rare but
// possible) don't fire duplicate requests. Cleared on page navigation.
// ---------------------------------------------------------------------------
const _cache: Map<string, CredentialListItem[]> = new Map();

interface CredentialSelectFieldProps {
  nodeId: string;
  data: Record<string, unknown>;
  /** Node data key to store credential id in (default: "credential_id") */
  dataKey?: string;
  /**
   * When set, only credentials whose type_key matches this value are shown,
   * and the "+ New credential" modal opens pre-locked to this type.
   * When omitted, all credentials are shown (original behaviour).
   */
  typeKey?: string;
  /** Label shown above the selector (default: "Credential") */
  label?: string;
  /** When true a "(required)" hint is shown next to the label */
  required?: boolean;
}

export function CredentialSelectField({
  nodeId,
  data,
  dataKey = "credential_id",
  typeKey,
  label = "Credential",
  required,
}: CredentialSelectFieldProps) {
  const updateNodeData = useFlowStore((s) => s.updateNodeData);
  const [credentials, setCredentials] = useState<CredentialListItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  // Current value — stored as a number (or null/undefined)
  const currentId = data[dataKey];
  const selectedId =
    typeof currentId === "number"
      ? String(currentId)
      : typeof currentId === "string" && currentId !== ""
        ? currentId
        : "";

  const cacheKey = typeKey ?? "__all__";

  useEffect(() => {
    // Serve from cache if available
    if (_cache.has(cacheKey)) {
      setCredentials(_cache.get(cacheKey)!);
      return;
    }

    setLoading(true);
    const params: Record<string, string> = {};
    if (typeKey) params.type_key = typeKey;

    instanceAuth
      .get("/v1/credentials/", { params })
      .then(({ data: raw }) => {
        // Support both paginated { results: [...] } and plain array responses
        const r = (raw ?? {}) as Record<string, unknown>;
        const results: CredentialListItem[] =
          Array.isArray(r.results)
            ? (r.results as CredentialListItem[])
            : Array.isArray((r.data as Record<string, unknown> | undefined)?.results)
              ? ((r.data as Record<string, unknown>).results as CredentialListItem[])
              : Array.isArray(raw)
                ? (raw as CredentialListItem[])
                : [];
        _cache.set(cacheKey, results);
        setCredentials(results);
      })
      .catch(() => {
        setCredentials([]);
      })
      .finally(() => setLoading(false));
  }, [cacheKey]);

  const handleChange = (value: string) => {
    if (value === "__none__") {
      updateNodeData(nodeId, { [dataKey]: null });
    } else {
      updateNodeData(nodeId, { [dataKey]: Number(value) });
    }
  };

  const handleNewCredential = () => setAddOpen(true);

  if (loading && !credentials) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Yuklanmoqda...
      </div>
    );
  }

  return (
    <>
      <div className="space-y-1.5">
        <Label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Shield className="h-3 w-3" />
          {label}
          {required ? (
            <span className="ml-0.5 text-destructive">*</span>
          ) : null}
        </Label>

        <Select value={selectedId || "__none__"} onValueChange={handleChange}>
          <SelectTrigger className="border-white/10 bg-zinc-950/60">
            <SelectValue placeholder="— none —" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">— none —</SelectItem>
            {(credentials ?? []).map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.name}
                {!typeKey ? (
                  <span className="ml-1.5 text-[10px] text-muted-foreground">
                    ({c.type.label})
                  </span>
                ) : null}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-7 w-full text-xs text-muted-foreground hover:text-foreground gap-1"
          onClick={handleNewCredential}
        >
          <Plus className="h-3 w-3" />
          Yangi credential
        </Button>
      </div>

      <CredentialFormModal
        open={addOpen}
        onOpenChange={setAddOpen}
        lockedTypeKey={typeKey}
        onSuccess={(created) => {
          // Auto-select the newly created credential
          updateNodeData(nodeId, { [dataKey]: created.id });
          // Invalidate local cache and refresh
          _cache.delete(cacheKey);
          setCredentials((prev) => (prev ? [created, ...prev] : [created]));
        }}
      />
    </>
  );
}
