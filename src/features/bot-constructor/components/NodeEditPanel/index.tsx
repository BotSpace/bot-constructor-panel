"use client";

import { useFlowStore } from "@/features/bot-constructor/store";
import { CustomNodes } from "@/features/bot-constructor/nodes";
import { NodePanelProvider } from "@/features/bot-constructor/contexts/NodePanelContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { X, Trash2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { getNodeManifestByType } from "@/features/bot-constructor/nodes/registry";
import { SIDEBAR_COLOR_CLASS_REGISTRY } from "@/features/bot-constructor/nodes/registry/colorRegistry";
import { useTranslations } from "next-intl";

function translate(
  t: ReturnType<typeof useTranslations>,
  key: string,
  fallback: string
) {
  return typeof t.has === "function" && t.has(key) ? t(key) : fallback;
}

// ── Component ────────────────────────────────────────────────────────────────
export function NodeEditPanel() {
  const t = useTranslations();
  const { editingNodeId, nodes, setEditingNodeId, deleteSelectedElements } =
    useFlowStore();

  const editingNode = nodes.find((n) => n.id === editingNodeId);
  const isOpen = !!editingNodeId && !!editingNode;

  const NodeComponent = isOpen
    ? CustomNodes[editingNode!.type as keyof typeof CustomNodes]
    : null;

  const manifest = isOpen ? getNodeManifestByType(editingNode!.type as string) : null;
  const colorClass = manifest
    ? SIDEBAR_COLOR_CLASS_REGISTRY[manifest.colorToken]
    : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
  const label = manifest
    ? translate(t, manifest.titleKey, manifest.titleFallback)
    : "";

  return (
    <div
      className={cn(
        "h-full shrink-0 flex flex-col border-l border-border bg-background",
        "transition-all duration-200 overflow-hidden",
        isOpen ? "w-[380px]" : "w-0 border-0"
      )}
    >
      {isOpen && (
        <>
          {/* ── Panel header ─────────────────────────────────────── */}
          <div className="shrink-0 flex items-center gap-3 px-4 py-3 border-b border-border" style={{ backgroundColor: '#171717' }}>
            {/* Colored node-type icon */}
            <div
              className={cn(
                "w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold border",
                colorClass
              )}
            >
              {label.charAt(0)}
            </div>

            {/* Node name */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{label}</p>
              <p className="text-[11px] text-muted-foreground truncate">
                ID: {editingNodeId}
              </p>
            </div>

            {/* Delete node */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              title="Node'ni o'chirish"
              onClick={() => {
                deleteSelectedElements();
                setEditingNodeId(null);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>

            {/* Close panel */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground"
              title="Yopish"
              onClick={() => setEditingNodeId(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <Separator />

          {/* ── Node configuration content ───────────────────────── */}
          <div className="flex-1 overflow-y-auto node-edit-panel-body">
            {NodeComponent ? (
              <NodePanelProvider>
                <NodeComponent
                  key={editingNodeId}
                  id={editingNodeId!}
                  data={editingNode!.data}
                  selected={false}
                  isConnectable={false}
                  xPos={0}
                  yPos={0}
                  zIndex={0}
                  dragging={false}
                  type={editingNode!.type ?? ''}
                />
              </NodePanelProvider>
            ) : (
              <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
                Bu node turi uchun konfiguratsiya topilmadi
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
