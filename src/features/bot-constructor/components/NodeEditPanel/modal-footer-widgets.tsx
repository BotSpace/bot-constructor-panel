"use client";

import { ButtonGenerator, KeyboardConfig } from "@/features/bot-constructor/components";
import { HandlerAdder } from "@/features/bot-constructor/nodes/actions/shared/HandlerBuilder";
import ActionNodeSettings from "@/features/bot-constructor/nodes/actions/shared/ActionNodeSettings";
import { RecipientsManager } from "@/features/bot-constructor/nodes/actions/shared/RecipientSelector";
import { ParseMode } from "@/features/bot-constructor/nodes/types";
import { useFlowStore } from "@/features/bot-constructor/store";
import { Keyboard, SlidersHorizontal, Users, Workflow } from "lucide-react";

interface ModalActionPanelProps {
  nodeId: string;
  data: Record<string, unknown>;
  hideHandlers?: boolean;
}

function Section({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="mb-3 flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-200">
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-zinc-100">{title}</h3>
          {description ? <p className="text-xs text-zinc-500">{description}</p> : null}
        </div>
      </div>
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
        <Section
          icon={Users}
          title="Qabul qiluvchilar"
          description="Xabar kimga yuborilishini tanlang"
        >
          <RecipientsManager recipients={recipients} onUpdate={handleUpdate} />
        </Section>
      ) : null}

      {keyboard !== undefined ? (
        <Section icon={Keyboard} title="Tugmalar" description="Inline va reply tugmalar">
          <ButtonGenerator initialKeyboard={keyboard} node_id={nodeId} />
        </Section>
      ) : null}

      {!hideHandlers ? (
        <Section icon={Workflow} title="Handlerlar" description="Javob qoidalari">
          <HandlerAdder sourceNodeId={nodeId} />
        </Section>
      ) : null}

      <Section
        icon={SlidersHorizontal}
        title="Qo'shimcha sozlamalar"
        description="Xabar yuborish parametrlari"
      >
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
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="mb-3 flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-200">
          <Workflow className="h-4 w-4" />
        </span>
        <div>
          <h3 className="text-sm font-semibold text-zinc-100">Handlerlar</h3>
          <p className="text-xs text-zinc-500">React Flow handle chizmasdan boshqariladi</p>
        </div>
      </div>
      <HandlerAdder sourceNodeId={nodeId} />
    </section>
  );
}
