"use client";

import { ButtonGenerator, KeyboardConfig } from "@/features/bot-constructor/components";
import { HandlerAdder } from "@/features/bot-constructor/nodes/actions/shared/HandlerBuilder";
import ActionNodeSettings from "@/features/bot-constructor/nodes/actions/shared/ActionNodeSettings";
import { RecipientsManager } from "@/features/bot-constructor/nodes/actions/shared/RecipientSelector";
import { ParseMode } from "@/features/bot-constructor/nodes/types";
import { useFlowStore } from "@/features/bot-constructor/store";
import { Workflow } from "lucide-react";

interface ModalActionPanelProps {
  nodeId: string;
  data: Record<string, unknown>;
  hideHandlers?: boolean;
}

function Section({
  title,
  children,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">{title}</p>
      {children}
    </section>
  );
}

export function ModalActionPanel({
  nodeId,
  data,
  hideHandlers = true,
}: ModalActionPanelProps) {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const recipients = data.recipients as
    | {
        sendToSender: boolean;
        additionalIds: string[];
      }
    | undefined;
  const keyboard = data.keyboard as KeyboardConfig | undefined;

  const handleUpdate = (update: Partial<Record<string, unknown>>) => {
    updateNodeData(nodeId, update);
  };

  return (
    <div className="space-y-3">
      {recipients !== undefined ? (
        <Section title="Qabul qiluvchilar">
          <RecipientsManager recipients={recipients} onUpdate={handleUpdate} />
        </Section>
      ) : null}

      {keyboard !== undefined ? (
        <Section title="Tugmalar">
          <ButtonGenerator initialKeyboard={keyboard} node_id={nodeId} />
        </Section>
      ) : null}

      {!hideHandlers ? (
        <Section title="Handlerlar">
          <HandlerAdder sourceNodeId={nodeId} />
        </Section>
      ) : null}

      <Section title="Qo'shimcha sozlamalar">
        <ActionNodeSettings
          notificationDisabled={
            typeof data.disableNotification === "boolean"
              ? data.disableNotification
              : undefined
          }
          contentProtected={
            typeof data.protectContent === "boolean" ? data.protectContent : undefined
          }
          parseMode={typeof data.parseMode === "string" ? (data.parseMode as ParseMode) : undefined}
          handleUpdate={handleUpdate}
        />
      </Section>
    </div>
  );
}

export function ModalHandlersList({
  nodeId,
}: {
  nodeId: string;
  data: Record<string, unknown>;
}) {
  return (
    <section className="space-y-3">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">Handlerlar</p>
      <HandlerAdder sourceNodeId={nodeId} />
    </section>
  );
}
