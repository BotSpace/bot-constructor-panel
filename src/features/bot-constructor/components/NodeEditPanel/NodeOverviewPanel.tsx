"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NodeManifest } from "@/features/bot-constructor/nodes/registry/types";
import { ArrowDownToLine, ArrowUpToLine, Blocks, Settings2 } from "lucide-react";
import { useTranslations } from "next-intl";

interface NodeOverviewPanelProps {
  nodeId: string;
  manifest: NodeManifest;
}

const CATEGORY_LABELS: Record<string, string> = {
  triggers: "Trigger",
  actions: "Action",
  messageOperations: "Message operation",
  flowControl: "Flow control",
  integrations: "Integration",
  customLogic: "Logic",
};

function translate(
  t: ReturnType<typeof useTranslations>,
  key: string,
  fallback: string
) {
  return typeof t.has === "function" && t.has(key) ? t(key) : fallback;
}

function scrollEditor(toBottom: boolean) {
  const container = document.querySelector(".node-edit-dialog-body");
  if (!(container instanceof HTMLElement)) {
    return;
  }

  container.scrollTo({
    top: toBottom ? container.scrollHeight : 0,
    behavior: "smooth",
  });
}

export function NodeOverviewPanel({ nodeId, manifest }: NodeOverviewPanelProps) {
  const t = useTranslations();
  const title = translate(t, manifest.titleKey, manifest.titleFallback);
  const description = translate(
    t,
    manifest.descriptionKey,
    manifest.descriptionFallback
  );
  const fieldCount = manifest.content?.length || 0;
  const hasActionSettings = manifest.footer?.some((item) => item.type === "actionPanel");
  const hasHandlers = manifest.footer?.some((item) => item.type === "handlersList");

  return (
    <aside className="hidden h-full min-h-0 flex-col overflow-y-auto border-r border-white/10 bg-[#0f0f0f] p-4 lg:flex">
      <div className="space-y-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-200">
              <Blocks className="h-4 w-4" />
            </span>
            <Badge variant="outline" className="border-white/15 text-zinc-300">
              {CATEGORY_LABELS[manifest.category] || manifest.category}
            </Badge>
          </div>
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          <p className="mt-2 text-xs leading-5 text-zinc-500">{description}</p>
          <p className="mt-3 truncate text-[11px] text-zinc-600">ID: {nodeId}</p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-white/10 bg-zinc-900/70 p-3">
            <p className="text-[10px] uppercase tracking-wide text-zinc-500">Fields</p>
            <p className="mt-1 text-sm font-semibold text-zinc-100">{fieldCount}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-zinc-900/70 p-3">
            <p className="text-[10px] uppercase tracking-wide text-zinc-500">Width</p>
            <p className="mt-1 text-sm font-semibold text-zinc-100">{manifest.size.width}px</p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="mb-3 flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-cyan-200" />
            <p className="text-sm font-medium text-zinc-200">Imkoniyatlar</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="outline" className="border-white/15 text-zinc-300">
              Edit form
            </Badge>
            {hasActionSettings ? (
              <Badge variant="outline" className="border-white/15 text-zinc-300">
                Action settings
              </Badge>
            ) : null}
            {hasHandlers ? (
              <Badge variant="outline" className="border-white/15 text-zinc-300">
                Handlers
              </Badge>
            ) : null}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="mb-3 text-xs font-medium text-zinc-300">Quick navigation</p>
          <div className="grid grid-cols-2 gap-2">
            <Button size="sm" variant="outline" onClick={() => scrollEditor(false)}>
              <ArrowUpToLine className="mr-1 h-3.5 w-3.5" />
              Tepaga
            </Button>
            <Button size="sm" variant="outline" onClick={() => scrollEditor(true)}>
              <ArrowDownToLine className="mr-1 h-3.5 w-3.5" />
              Pastga
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
