"use client";

import { Badge } from "@/components/ui/badge";
import { NodeManifest } from "@/features/bot-constructor/nodes/registry/types";
import { Blocks } from "lucide-react";
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

export function NodeOverviewPanel({ nodeId, manifest }: NodeOverviewPanelProps) {
  const t = useTranslations();
  const title = translate(t, manifest.titleKey, manifest.titleFallback);
  const description = translate(
    t,
    manifest.descriptionKey,
    manifest.descriptionFallback
  );

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
      </div>
    </aside>
  );
}
