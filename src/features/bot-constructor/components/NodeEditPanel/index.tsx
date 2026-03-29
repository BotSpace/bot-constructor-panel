"use client";

import { useFlowStore } from "@/features/bot-constructor/store";
import { CustomNodes } from "@/features/bot-constructor/nodes";
import { NodePanelProvider } from "@/features/bot-constructor/contexts/NodePanelContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { X, Trash2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

// ── Node category → color mapping (mirrors globals.css) ─────────────────────
const TRIGGER_NODES = new Set([
  "CommandTriggerNode", "MessageTriggerNode", "CronTriggerNode",
]);
const SEND_MEDIA_NODES = new Set([
  "SendTextMessageNode", "SendPhotoNode", "SendVideoNode", "SendAudioNode",
  "SendFileNode", "SendAnimationNode", "SendVoiceNode", "SendVideoNoteNode",
]);
const SEND_OTHER_NODES = new Set([
  "SendLocationNode", "SendContactNode", "SendPollNode",
  "SendStickerNode", "SendMediaGroupNode", "SendDiceNode",
]);
const MSG_OP_NODES = new Set([
  "EditMessageNode", "EditOrSendMessageNode", "ForwardMessageNode",
  "CopyMessageNode", "PinMessageNode", "UnpinMessageNode",
  "DeleteMessageNode", "ChatActionNode", "DownloadFileNode", "SendToAdminNode",
]);
const LOGIC_NODES = new Set([
  "IfConditionNode", "ElseIfNode", "ElseNode", "DelayNode",
  "RandomNode", "ForLoopNode", "ForLoopContinueNode",
  "CheckMembershipNode", "FormNode",
]);
const DATA_NODES = new Set([
  "StateNode", "VariableNode", "CollectionNode", "LoadCollectionItemNode",
]);
const INTEGRATION_NODES = new Set([
  "HTTPRequestNode", "SubFlowNode", "SubFlowExitNode", "CallbackQueryAnswerNode",
]);

function getNodeColor(type: string): string {
  if (TRIGGER_NODES.has(type)) return "#b45309";
  if (SEND_MEDIA_NODES.has(type)) return "#1d4ed8";
  if (SEND_OTHER_NODES.has(type)) return "#0369a1";
  if (MSG_OP_NODES.has(type)) return "#475569";
  if (LOGIC_NODES.has(type)) return "#6d28d9";
  if (DATA_NODES.has(type)) return "#0f766e";
  if (INTEGRATION_NODES.has(type)) return "#047857";
  return "#52525b"; // code / default
}

function formatNodeName(type: string): string {
  return type
    .replace(/Node$/, "")
    .replace(/([A-Z])/g, " $1")
    .trim();
}

// ── Component ────────────────────────────────────────────────────────────────
export function NodeEditPanel() {
  const { editingNodeId, nodes, setEditingNodeId, deleteSelectedElements } =
    useFlowStore();

  const editingNode = nodes.find((n) => n.id === editingNodeId);
  const isOpen = !!editingNodeId && !!editingNode;

  const NodeComponent = isOpen
    ? CustomNodes[editingNode!.type as keyof typeof CustomNodes]
    : null;

  const color = isOpen ? getNodeColor(editingNode!.type as string) : "#52525b";
  const label = isOpen ? formatNodeName(editingNode!.type as string) : "";

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
          <div className="shrink-0 flex items-center gap-3 px-4 py-3 border-b border-border bg-background">
            {/* Colored node-type icon */}
            <div
              className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: color }}
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
