"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Check, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { NodeFieldManifest } from "@/features/bot-constructor/manifest/types";
import { useFlowStore } from "@/features/bot-constructor/store";
import useProjectStore from "@/features/bot-constructor/store/project";
import { mintWebhookEndpoint } from "@/services/requests/webhook";

interface WebhookUrlFieldProps {
  nodeId: string;
  data: Record<string, unknown>;
  field: NodeFieldManifest;
}

/**
 * Generic read-only field with copy button.
 *
 * When field.autofill === "webhook" AND data[key] is empty, mints a unique
 * webhook URL on first mount via POST /api/webhook/endpoint/ and writes the
 * result (url + token) into node data. Subsequent mounts skip the call because
 * data[key] is already populated (idempotent, cache via node data).
 *
 * Without autofill the field simply displays data[key] as read-only text.
 * This makes it usable for any "display-only" scenario (Phase 5 module URLs).
 */
export function WebhookUrlField({ nodeId, data, field }: WebhookUrlFieldProps) {
  const fieldKey = field.key ?? "";
  const currentValue = typeof data[fieldKey] === "string" ? (data[fieldKey] as string) : "";

  const updateNodeData = useFlowStore((s) => s.updateNodeData);
  const project = useProjectStore((s) => s.project);

  const [minting, setMinting] = useState(false);
  const [copied, setCopied] = useState(false);

  // Desired chat binding (optional chat_id field) vs the one the current URL was
  // minted for. When they differ we re-mint so the URL matches the chat binding.
  const desiredChatId = Number(data.chat_id) || 0;
  const mintedChatId = Number(data.webhook_chat_id) || 0;

  useEffect(() => {
    // Only autofill=webhook triggers minting.
    if (field.autofill !== "webhook") return;
    // Project not loaded yet — wait for it.
    if (!project?.id) return;
    // URL already minted for the desired chat binding — nothing to do.
    if (currentValue && mintedChatId === desiredChatId) return;

    // Debounce: chat_id is a number input; avoid minting on every keystroke.
    const timer = setTimeout(() => {
      setMinting(true);
      mintWebhookEndpoint(project.id, nodeId, desiredChatId)
        .then((result) => {
          updateNodeData(nodeId, {
            [fieldKey]: result.url,
            webhook_token: result.token,
            webhook_chat_id: result.chat_id,
          });
        })
        .catch(() => {
          toast.error("Webhook URL yaratishda xatolik yuz berdi");
        })
        .finally(() => {
          setMinting(false);
        });
    }, 700);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.id, desiredChatId]);

  const handleCopy = () => {
    if (!currentValue) return;
    navigator.clipboard
      .writeText(currentValue)
      .then(() => {
        setCopied(true);
        toast.success("URL nusxalandi");
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        toast.error("Nusxalab bo'lmadi");
      });
  };

  return (
    <div className="space-y-1.5">
      {field.label ? (
        <Label className="text-xs font-medium uppercase tracking-wide text-zinc-400">
          {field.label}
        </Label>
      ) : null}

      <div className="flex items-center gap-1.5">
        <div className="relative flex-1">
          {minting ? (
            <div className="flex h-10 items-center gap-2 rounded-md border border-white/10 bg-zinc-950/60 px-3 text-xs text-zinc-500">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              URL yaratilmoqda...
            </div>
          ) : (
            <Input
              readOnly
              value={currentValue}
              placeholder="URL hali yaratilmagan"
              className="h-10 cursor-default border-white/10 bg-zinc-950/60 pr-2 font-mono text-xs"
            />
          )}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-10 w-10 shrink-0 text-zinc-500 hover:text-zinc-200"
          disabled={!currentValue || minting}
          title="Nusxalash"
          onClick={handleCopy}
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-emerald-400" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>

      {field.helpText ? (
        <p className="text-xs leading-relaxed text-zinc-500">{field.helpText}</p>
      ) : null}
    </div>
  );
}
