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
import { useCredentialStore } from "@/features/credentials/store";
import { CredentialFormModal } from "@/features/credentials/components/CredentialFormModal";

interface CredentialSelectFieldProps {
  nodeId: string;
  data: Record<string, unknown>;
  /** Node data key to store credential id in (default: "credential_id") */
  dataKey?: string;
}

export function CredentialSelectField({
  nodeId,
  data,
  dataKey = "credential_id",
}: CredentialSelectFieldProps) {
  const updateNodeData = useFlowStore((s) => s.updateNodeData);
  const { credentials, loading, loadCredentials } = useCredentialStore();
  const [addOpen, setAddOpen] = useState(false);

  // Current value — stored as a number (or null/undefined)
  const currentId = data[dataKey];
  const selectedId =
    typeof currentId === "number"
      ? String(currentId)
      : typeof currentId === "string" && currentId !== ""
        ? currentId
        : "";

  useEffect(() => {
    if (!credentials) {
      loadCredentials();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          Credential
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
                <span className="ml-1.5 text-[10px] text-muted-foreground">
                  ({c.type.label})
                </span>
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
        onSuccess={(created) => {
          // Auto-select the newly created credential
          updateNodeData(nodeId, { [dataKey]: created.id });
          // Reload list
          loadCredentials();
        }}
      />
    </>
  );
}
