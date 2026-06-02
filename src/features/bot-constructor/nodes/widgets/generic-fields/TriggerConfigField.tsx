"use client";

import { useMemo, useState } from "react";
import { AlertCircle, Plus } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConstructorData } from "@/features/bot-constructor/data";
import { MessageTriggerValueTypes } from "@/features/bot-constructor/data/messages";
import { getFiltersForType } from "@/features/bot-constructor/nodes/actions/shared/HandlerBuilder/utils";
import { FilterSelector } from "@/features/bot-constructor/nodes/triggers/MessageTrigger/components/FilterSelector";
import { ParameterInput } from "@/features/bot-constructor/nodes/triggers/MessageTrigger/components/ParameterInput";
import { ValueInput } from "@/features/bot-constructor/nodes/triggers/MessageTrigger/components/ParameterInput/ValueInput";
import { TypeSelector } from "@/features/bot-constructor/nodes/triggers/MessageTrigger/components/TypeSelector";
import {
  StateConfigUI,
  getStateTypesForCallbackQueryTrigger,
  getStateTypesForMessageTrigger,
  getStateTypesForReplyButtonTrigger,
} from "@/features/bot-constructor/nodes/triggers/shared";
import { StateConfig } from "@/features/bot-constructor/nodes/triggers/shared/state-config-types";
import { useFlowStore } from "@/features/bot-constructor/store";
import { getNodeKeyboard } from "@/features/bot-constructor/utils/keyboard-compat";

// ---------------------------------------------------------------------------
// Public interface
// ---------------------------------------------------------------------------

export interface TriggerConfigFieldProps {
  nodeId: string;
  data: Record<string, unknown>;
  field: {
    type: "trigger-config";
    kind: "message" | "callback" | "reply";
    label?: string;
    stateOptional?: boolean;
  };
}

// ---------------------------------------------------------------------------
// kind="message"
// ---------------------------------------------------------------------------

interface MessageData {
  type?: MessageTriggerValueTypes;
  filter?: string;
  global?: boolean;
  context?: {
    value?: string;
    radius?: Record<string, string>;
    size?: Record<string, string>;
  };
  state?: StateConfig;
}

function MessageTriggerConfig({
  nodeId,
  data,
  stateOptional,
}: {
  nodeId: string;
  data: Record<string, unknown>;
  stateOptional?: boolean;
}) {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const [showState, setShowState] = useState(false);

  const typedData = data as MessageData;

  const filtersForType = useMemo(
    () => getFiltersForType(typedData.type),
    [typedData.type]
  );

  const availableStateTypes = useMemo(
    () => getStateTypesForMessageTrigger(typedData.type || "any"),
    [typedData.type]
  );

  const showFilterSection = Boolean(typedData.type && typedData.type !== "any");
  const showParameterInput =
    showFilterSection &&
    Boolean(typedData.filter) &&
    typedData.filter !== "any";

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label className="text-xs text-white/50">Xabar turi</Label>
        <TypeSelector
          value={typedData.type || ""}
          onValueChange={(newType) =>
            updateNodeData(nodeId, { type: newType, filter: "any" })
          }
        />
      </div>

      {showFilterSection ? (
        <div className="space-y-1.5">
          <Label className="text-xs text-white/50">Filter</Label>
          <FilterSelector
            value={typedData.filter || ""}
            onValueChange={(filter) => updateNodeData(nodeId, { filter })}
            options={filtersForType}
          />
        </div>
      ) : null}

      {showParameterInput ? (
        <div className="space-y-1.5">
          <Label className="text-xs text-white/50">Parametr</Label>
          <ParameterInput
            filter={typedData.filter}
            context={typedData.context}
            onContextUpdate={(context) => updateNodeData(nodeId, { context })}
          />
        </div>
      ) : null}

      <Label className="mt-2 flex cursor-pointer items-center gap-2 text-sm">
        <Checkbox
          checked={Boolean(typedData.global)}
          onCheckedChange={(checked) =>
            updateNodeData(nodeId, { global: Boolean(checked) })
          }
        />
        Global
      </Label>

      {typedData.type ? (
        stateOptional && !showState ? (
          <button
            type="button"
            onClick={() => setShowState(true)}
            className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <Plus className="h-3 w-3" />
            Ma&apos;lumotni saqlash
          </button>
        ) : (stateOptional && showState) || !stateOptional ? (
          <StateConfigUI
            state={typedData.state}
            onStateChange={(state) => updateNodeData(nodeId, { state })}
            availableTypes={availableStateTypes}
            nodeId={nodeId}
          />
        ) : null
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// kind="callback"
// ---------------------------------------------------------------------------

interface AvailableCallback {
  id: string;
  text: string;
  value: string;
  isCollection: boolean;
  collectionName?: string;
  fieldName?: string;
}

interface CallbackData {
  filter?: string;
  global?: boolean;
  context?: { value?: string };
  state?: StateConfig;
}

function CallbackQueryTriggerConfig({
  nodeId,
  data,
  stateOptional,
}: {
  nodeId: string;
  data: Record<string, unknown>;
  stateOptional?: boolean;
}) {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const [showState, setShowState] = useState(false);
  const nodes = useFlowStore((state) => state.nodes);
  const edges = useFlowStore((state) => state.edges);

  const typedData = data as CallbackData;

  const availableCallbacks = useMemo<AvailableCallback[]>(() => {
    const incomingEdge = edges.find((edge) => edge.target === nodeId);
    if (!incomingEdge) return [];

    const parentNode = nodes.find((node) => node.id === incomingEdge.source);
    const inline = getNodeKeyboard(parentNode?.data).inline;
    if (inline.length === 0) return [];

    return inline.flat().flatMap<AvailableCallback>((button: unknown) => {
      const btn = button as Record<string, unknown>;

      if (btn.type === "callback" && btn.value && !btn.collectionData) {
        return [
          {
            id: btn.id as string,
            text: (btn.text as string) ?? "",
            value: btn.value as string,
            isCollection: false,
          },
        ];
      }

      if (btn.collectionData) {
        const cd = btn.collectionData as {
          collection?: string;
          text?: string;
        };
        return [
          {
            id: btn.id as string,
            text:
              ((btn.text as string) ?? "").replace("📦 ", "") ??
              cd.collection ??
              "",
            value: `collection:${cd.collection}:${cd.text}`,
            isCollection: true,
            collectionName: cd.collection,
            fieldName: cd.text,
          },
        ];
      }

      return [];
    });
  }, [edges, nodeId, nodes]);

  const showStaticSelector =
    availableCallbacks.length > 0 && typedData.filter === "equals";
  const showCollectionSelector =
    availableCallbacks.some((item) => item.isCollection) &&
    typedData.filter === "collection";

  const availableStateTypes = useMemo(
    () =>
      getStateTypesForCallbackQueryTrigger(
        (typedData.context?.value || "").startsWith("collection:")
      ),
    [typedData.context?.value]
  );

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label className="text-xs text-white/50">
          Callback ma&apos;lumoti filtri
        </Label>
        <FilterSelector
          value={typedData.filter || ""}
          onValueChange={(filter) => updateNodeData(nodeId, { filter })}
          options={ConstructorData.Filters.callbackFilters}
        />
      </div>

      {typedData.filter && typedData.filter !== "any" ? (
        <div className="space-y-1.5">
          <Label className="text-xs text-white/50">Parametr</Label>
          {showStaticSelector ? (
            <Select
              value={typedData.context?.value || ""}
              onValueChange={(value) =>
                updateNodeData(nodeId, { context: { value } })
              }
            >
              <SelectTrigger className="h-8 border-white/10 bg-zinc-950/60 text-xs">
                <SelectValue placeholder="Static callback tanlang..." />
              </SelectTrigger>
              <SelectContent>
                {availableCallbacks
                  .filter((btn) => !btn.isCollection)
                  .map((btn) => (
                    <SelectItem key={btn.id} value={btn.value}>
                      {btn.text}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          ) : showCollectionSelector ? (
            <Select
              value={typedData.context?.value || ""}
              onValueChange={(value) =>
                updateNodeData(nodeId, { context: { value } })
              }
            >
              <SelectTrigger className="h-8 border-white/10 bg-zinc-950/60 text-xs">
                <SelectValue placeholder="Collection callback tanlang..." />
              </SelectTrigger>
              <SelectContent>
                {availableCallbacks
                  .filter((btn) => btn.isCollection)
                  .map((btn) => (
                    <SelectItem key={btn.id} value={btn.value}>
                      {btn.collectionName}.{btn.fieldName}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          ) : (
            <ValueInput
              value={typedData.context?.value || ""}
              onChange={(value) =>
                updateNodeData(nodeId, { context: { value } })
              }
              placeholder="Masalan: main_menu"
            />
          )}
        </div>
      ) : null}

      <div className="flex items-center gap-2">
        <Checkbox
          id={`tcf-global-cb-${nodeId}`}
          checked={Boolean(typedData.global)}
          onCheckedChange={(checked) =>
            updateNodeData(nodeId, { global: Boolean(checked) })
          }
        />
        <Label
          htmlFor={`tcf-global-cb-${nodeId}`}
          className="cursor-pointer text-sm"
        >
          Global
        </Label>
      </div>

      {stateOptional && !showState ? (
        <button
          type="button"
          onClick={() => setShowState(true)}
          className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <Plus className="h-3 w-3" />
          Ma&apos;lumotni saqlash
        </button>
      ) : (
        <StateConfigUI
          state={typedData.state}
          onStateChange={(state) => updateNodeData(nodeId, { state })}
          availableTypes={availableStateTypes}
          nodeId={nodeId}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// kind="reply"
// ---------------------------------------------------------------------------

interface ReplyButton {
  id: string;
  text: string;
  type: string;
}

interface ReplyData {
  selectedButtons?: Array<{ id: string; text: string }>;
  catchNoButton?: boolean;
  global?: boolean;
  state?: StateConfig;
}

function ReplyButtonTriggerConfig({
  nodeId,
  data,
  stateOptional,
}: {
  nodeId: string;
  data: Record<string, unknown>;
  stateOptional?: boolean;
}) {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const [showState, setShowState] = useState(false);
  const nodes = useFlowStore((state) => state.nodes);
  const edges = useFlowStore((state) => state.edges);

  const typedData = data as ReplyData;

  const availableReplyButtons = useMemo<ReplyButton[]>(() => {
    const incomingEdge = edges.find((edge) => edge.target === nodeId);
    if (!incomingEdge) return [];

    const parentNode = nodes.find((node) => node.id === incomingEdge.source);
    const reply = getNodeKeyboard(parentNode?.data).reply;
    if (reply.length === 0) return [];

    return reply
      .flat()
      .filter((btn: unknown) =>
        ["reply", "request_contact", "request_location"].includes(
          (btn as Record<string, unknown>).type as string
        )
      ) as ReplyButton[];
  }, [edges, nodeId, nodes]);

  return (
    <div className="space-y-3">
      {!typedData.catchNoButton ? (
        availableReplyButtons.length > 0 ? (
          <div className="space-y-3">
            <Label className="text-xs text-white/50">
              Qaysi tugma ushlansin?
            </Label>
            <div className="space-y-2">
              {availableReplyButtons.map((button) => (
                <div key={button.id} className="flex items-center gap-3">
                  <Checkbox
                    checked={
                      typedData.selectedButtons?.some(
                        (item) => item.id === button.id
                      ) ?? false
                    }
                    onCheckedChange={(toggle) => {
                      const selected = typedData.selectedButtons ?? [];
                      if (toggle) {
                        updateNodeData(nodeId, {
                          selectedButtons: [...selected, button],
                          catchNoButton: false,
                        });
                      } else {
                        updateNodeData(nodeId, {
                          selectedButtons: selected.filter(
                            (item) => item.id !== button.id
                          ),
                        });
                      }
                    }}
                  />
                  <Label className="cursor-pointer text-sm">{button.text}</Label>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-md border border-amber-500/20 bg-amber-500/10 p-3 text-sm text-amber-500">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>
              Iltimos, bu nodeni Reply-tugmalari mavjud bo&apos;lgan
              node&apos;ga ulang.
            </span>
          </div>
        )
      ) : (
        <div className="flex items-center gap-2 rounded-md border border-blue-500/20 bg-blue-500/10 p-3 text-sm text-blue-500">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>Bu node hech qanday tugma bosilmagan xabarlarni tutib oladi.</span>
        </div>
      )}

      <div className="mt-2 space-y-2">
        <Label className="flex cursor-pointer items-center gap-2 text-sm">
          <Checkbox
            checked={Boolean(typedData.catchNoButton)}
            onCheckedChange={(checked) =>
              updateNodeData(nodeId, {
                catchNoButton: Boolean(checked),
                ...(checked ? { selectedButtons: undefined } : {}),
              })
            }
          />
          <span>Hech qanday tugma bosilmasa ham tutib ol</span>
        </Label>

        <Label className="flex cursor-pointer items-center gap-2 text-sm">
          <Checkbox
            checked={Boolean(typedData.global)}
            onCheckedChange={(checked) =>
              updateNodeData(nodeId, { global: Boolean(checked) })
            }
          />
          Global
        </Label>
      </div>

      {stateOptional && !showState ? (
        <button
          type="button"
          onClick={() => setShowState(true)}
          className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <Plus className="h-3 w-3" />
          Ma&apos;lumotni saqlash
        </button>
      ) : (
        <StateConfigUI
          state={typedData.state}
          onStateChange={(state) => updateNodeData(nodeId, { state })}
          availableTypes={getStateTypesForReplyButtonTrigger()}
          nodeId={nodeId}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Public export — unified dispatcher
// ---------------------------------------------------------------------------

export function TriggerConfigField({
  nodeId,
  data,
  field,
}: TriggerConfigFieldProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-zinc-950/60 p-3">
      {field.label ? (
        <p className="mb-3 text-xs font-medium text-white/50">{field.label}</p>
      ) : null}

      {field.kind === "message" ? (
        <MessageTriggerConfig nodeId={nodeId} data={data} stateOptional={field.stateOptional} />
      ) : field.kind === "callback" ? (
        <CallbackQueryTriggerConfig nodeId={nodeId} data={data} stateOptional={field.stateOptional} />
      ) : (
        <ReplyButtonTriggerConfig nodeId={nodeId} data={data} stateOptional={field.stateOptional} />
      )}
    </div>
  );
}
