"use client";

import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ModalNodeFormRenderer } from "@/features/bot-constructor/components/NodeEditPanel/ModalNodeFormRenderer";
import { NodeVariablePanel } from "@/features/bot-constructor/components/NodeEditPanel/NodeVariablePanel";
import { VariableInsertionProvider } from "@/features/bot-constructor/components/NodeEditPanel/variable-insertion";
import { NodePanelProvider } from "@/features/bot-constructor/contexts/NodePanelContext";
import { getNodeManifestByType } from "@/features/bot-constructor/nodes/registry";
import { SIDEBAR_COLOR_CLASS_REGISTRY } from "@/features/bot-constructor/nodes/registry/colorRegistry";
import { useFlowStore } from "@/features/bot-constructor/store";
import { getAvailableStateKeys } from "@/features/bot-constructor/utils";
import { cn } from "@/lib/utils";
import { Pencil, Trash2, X } from "lucide-react";
import { useTranslations } from "next-intl";

function translate(
  t: ReturnType<typeof useTranslations>,
  key: string,
  fallback: string
) {
  return typeof t.has === "function" && t.has(key) ? t(key) : fallback;
}

// ---------------------------------------------------------------------------
// NodeNameInput — inline editable node name inside the detail panel header.
// Shows node_label when set, falls back to manifest title. Saves on blur/Enter,
// reverts on Escape; clearing resets to manifest title (node_label → null).
// ---------------------------------------------------------------------------

interface NodeNameInputProps {
  nodeId: string;
  /** Resolved display name: node_label if set, otherwise manifest title. */
  displayName: string;
  /** Manifest title — used as placeholder and to detect "no custom label" state. */
  manifestTitle: string;
}

function NodeNameInput({ nodeId, displayName, manifestTitle }: NodeNameInputProps) {
  const updateNodeData = useFlowStore((s) => s.updateNodeData);
  const inputRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  // When the panel opens for a different node, exit edit mode.
  useEffect(() => {
    setEditing(false);
  }, [nodeId]);

  const startEdit = () => {
    setDraft(displayName);
    setEditing(true);
  };

  const commit = () => {
    const trimmed = draft.trim();
    // Empty or same as manifest title → clear custom label.
    const next = trimmed === "" || trimmed === manifestTitle ? null : trimmed;
    updateNodeData(nodeId, { node_label: next });
    setEditing(false);
  };

  const cancel = () => {
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        autoFocus
        value={draft}
        placeholder={manifestTitle}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") { e.preventDefault(); commit(); }
          else if (e.key === "Escape") { e.preventDefault(); cancel(); }
        }}
        className={cn(
          "w-full truncate bg-transparent text-base font-semibold text-white outline-none",
          "border-b border-primary/60 focus:border-primary pb-px leading-tight",
        )}
        style={{ minWidth: 0 }}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={startEdit}
      className="group flex min-w-0 items-center gap-1.5 text-left"
      title="Node nomini o'zgartirish"
    >
      <span className="truncate text-base font-semibold text-white group-hover:text-white/80 transition-colors">
        {displayName}
      </span>
      <Pencil className="h-3 w-3 shrink-0 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
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
  const manifestTitle = manifest
    ? translate(t, manifest.titleKey, manifest.titleFallback)
    : "Node";

  // Resolved display name: node_label takes priority over manifest title.
  const nodeData = editingNode?.data as Record<string, unknown> | undefined;
  const nodeLabel = typeof nodeData?.node_label === "string" && nodeData.node_label.trim() !== ""
    ? nodeData.node_label.trim()
    : null;
  const displayName = nodeLabel ?? manifestTitle;

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
    <Sheet open={isOpen} onOpenChange={handleOpenChange} modal={false}>
      <SheetContent
        side="right"
        showOverlay={false}
        showCloseButton={false}
        onInteractOutside={(e) => e.preventDefault()}
        className={cn(
          "w-full gap-0 overflow-hidden border-l border-white/10 bg-[#141414] p-0 text-white shadow-2xl",
          "sm:max-w-[560px]"
        )}
      >
        <NodePanelProvider>
          <VariableInsertionProvider className="flex h-full min-h-0 flex-col">
            <SheetHeader className="shrink-0 gap-0 space-y-0 border-b border-white/10 bg-[#171717] px-5 py-4">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-sm font-bold",
                    colorClass
                  )}
                >
                  {manifestTitle.charAt(0)}
                </div>

                <div className="min-w-0 flex-1">
                  {/* SheetTitle is required by Radix for a11y (dialog accessible name). */}
                  <SheetTitle className="sr-only">{displayName}</SheetTitle>
                  {isOpen && editingNodeId ? (
                    <NodeNameInput
                      nodeId={editingNodeId}
                      displayName={displayName}
                      manifestTitle={manifestTitle}
                    />
                  ) : (
                    <p className="truncate text-base font-semibold text-white">
                      {manifestTitle}
                    </p>
                  )}
                  <SheetDescription className="truncate text-xs text-zinc-500">
                    ID: {editingNodeId}
                  </SheetDescription>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-zinc-400 hover:bg-red-500/10 hover:text-red-300"
                  title={t("common.delete")}
                  onClick={handleDelete}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-zinc-400 hover:bg-white/10 hover:text-white"
                  title={t("common.close")}
                  onClick={() => setEditingNodeId(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </SheetHeader>

            <div className="flex min-h-0 flex-1 flex-col">
              <div className="min-h-0 flex-1 overflow-y-auto bg-[#101010] node-edit-dialog-body">
                {manifest && editingNode ? (
                  <ModalNodeFormRenderer
                    nodeId={editingNodeId!}
                    data={editingNode.data as Record<string, unknown>}
                    manifest={manifest}
                  />
                ) : (
                  <div className="flex h-40 items-center justify-center text-sm text-zinc-500">
                    {t("editor.nodePanel.noConfig")}
                  </div>
                )}
              </div>

              <NodeVariablePanel stateKeys={stateKeys} />
            </div>
          </VariableInsertionProvider>
        </NodePanelProvider>
      </SheetContent>
    </Sheet>
  );
}

export const NodeEditPanel = NodeEditDialog;
