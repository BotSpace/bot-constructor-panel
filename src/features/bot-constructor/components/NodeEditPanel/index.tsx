"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ModalNodeFormRenderer } from "@/features/bot-constructor/components/NodeEditPanel/ModalNodeFormRenderer";
import { NodeOverviewPanel } from "@/features/bot-constructor/components/NodeEditPanel/NodeOverviewPanel";
import { NodeVariablePanel } from "@/features/bot-constructor/components/NodeEditPanel/NodeVariablePanel";
import { VariableInsertionProvider } from "@/features/bot-constructor/components/NodeEditPanel/variable-insertion";
import { NodePanelProvider } from "@/features/bot-constructor/contexts/NodePanelContext";
import { getNodeManifestByType } from "@/features/bot-constructor/nodes/registry";
import { SIDEBAR_COLOR_CLASS_REGISTRY } from "@/features/bot-constructor/nodes/registry/colorRegistry";
import { useFlowStore } from "@/features/bot-constructor/store";
import { getAvailableStateKeys } from "@/features/bot-constructor/utils";
import { cn } from "@/lib/utils";
import { Trash2, X } from "lucide-react";
import { useTranslations } from "next-intl";

function translate(
  t: ReturnType<typeof useTranslations>,
  key: string,
  fallback: string
) {
  return typeof t.has === "function" && t.has(key) ? t(key) : fallback;
}

export function NodeEditDialog() {
  const t = useTranslations();
  const { editingNodeId, nodes, edges, setEditingNodeId, deleteSelectedElements } =
    useFlowStore();

  const editingNode = nodes.find((node) => node.id === editingNodeId);
  const isOpen = Boolean(editingNodeId && editingNode);

  const manifest = isOpen
    ? getNodeManifestByType(editingNode!.type as string)
    : null;
  const colorClass = manifest
    ? SIDEBAR_COLOR_CLASS_REGISTRY[manifest.colorToken]
    : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
  const label = manifest
    ? translate(t, manifest.titleKey, manifest.titleFallback)
    : "Node";
  const stateKeys =
    isOpen && editingNodeId
      ? getAvailableStateKeys(nodes, edges, editingNodeId)
      : [];

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setEditingNodeId(null);
    }
  };

  const handleDelete = () => {
    deleteSelectedElements();
    setEditingNodeId(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          "h-[min(820px,calc(100vh-2rem))] w-[min(1180px,calc(100vw-2rem))]",
          "!max-w-none gap-0 overflow-hidden border-white/10 bg-[#141414] p-0 text-white shadow-2xl"
        )}
      >
        <NodePanelProvider>
        <VariableInsertionProvider className="flex h-full min-h-0 flex-col">
          <DialogHeader className="shrink-0 border-b border-white/10 bg-[#171717] px-5 py-4">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-sm font-bold",
                  colorClass
                )}
              >
                {label.charAt(0)}
              </div>

              <div className="min-w-0 flex-1">
                <DialogTitle className="truncate text-base font-semibold text-white">
                  {label}
                </DialogTitle>
                <DialogDescription className="truncate text-xs text-zinc-500">
                  ID: {editingNodeId}
                </DialogDescription>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-zinc-400 hover:bg-red-500/10 hover:text-red-300"
                title="Node'ni o'chirish"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-zinc-400 hover:bg-white/10 hover:text-white"
                title="Yopish"
                onClick={() => setEditingNodeId(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)_auto] lg:grid-cols-[320px_minmax(0,1fr)_320px] lg:grid-rows-1">
            {manifest && editingNode ? (
              <NodeOverviewPanel nodeId={editingNodeId!} manifest={manifest} />
            ) : (
              <div className="hidden border-r border-white/10 bg-[#0f0f0f] lg:block" />
            )}

            <div className="min-h-0 overflow-y-auto bg-[#101010] node-edit-dialog-body">
              {manifest && editingNode ? (
                <ModalNodeFormRenderer
                  nodeId={editingNodeId!}
                  data={editingNode.data as Record<string, unknown>}
                  manifest={manifest}
                />
              ) : (
                <div className="flex h-40 items-center justify-center text-sm text-zinc-500">
                  Bu node turi uchun konfiguratsiya topilmadi
                </div>
              )}
            </div>

            <NodeVariablePanel stateKeys={stateKeys} />
          </div>
        </VariableInsertionProvider>
        </NodePanelProvider>
      </DialogContent>
    </Dialog>
  );
}

export const NodeEditPanel = NodeEditDialog;
