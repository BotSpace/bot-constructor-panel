"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ConstructorData } from "@/features/bot-constructor/data";
import { MessageTriggerValueTypes } from "@/features/bot-constructor/data/messages";
import { ButtonGenerator } from "@/features/bot-constructor/components/ButtonGenerator/ButtonGenerator";
import { Combobox } from "@/components/ui/combobox";
import { FilterBuilder } from "@/features/bot-constructor/nodes/actions/shared/filter/filter";
import { useReactQueryAction } from "@/services/react-query/use-react-query-action";
import { findNearestParentAction } from "@/features/bot-constructor/lib/findNearestParentAction";
import { findNearestTriggerNode, getDynamicFilters } from "@/features/bot-constructor/nodes/custom/StateNode/getDynamicFilters";
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
import { useFlowStore } from "@/features/bot-constructor/store";
import { useCollectionStore } from "@/features/collections/store/collection-list";
import { AlertCircle, ArrowRight, Bot, GripVertical, Key, ListPlus, PlusIcon, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { CodeEditorDialog } from "@/features/bot-constructor/nodes/custom/CustomCodeNode/components/CodeEditorDialog";
import AddItemModal from "@/features/bot-constructor/nodes/custom/FormNode/components/add-item-modal";
import { FormItem } from "@/features/bot-constructor/nodes/custom/FormNode/components/form-item";
import { getAvailableStateKeys } from "@/features/bot-constructor/utils";
import { CollectionDetail, CollectionListItem } from "@/types/http/collection";
import { NodeFieldManifest } from "@/features/bot-constructor/nodes/registry/types";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  RichTextMessageField,
} from "@/features/bot-constructor/nodes/widgets/shared-message-fields";
import { CredentialSelectField } from "@/features/bot-constructor/nodes/widgets/generic-fields/CredentialSelectField";

interface WidgetProps {
  nodeId: string;
  data: Record<string, unknown>;
  field: NodeFieldManifest;
}

const BOT_GLOBALS = ["message", "user", "state"];

function MessageTriggerWidget({ nodeId, data }: WidgetProps) {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const typedData = data as {
    type?: MessageTriggerValueTypes;
    filter?: string;
    global?: boolean;
    context?: Record<string, unknown>;
    state?: unknown;
  };

  const filtersForType = useMemo(
    () => getFiltersForType(typedData.type),
    [typedData.type]
  );
  const availableStateTypes = useMemo(
    () => getStateTypesForMessageTrigger(typedData.type || "any"),
    [typedData.type]
  );

  const showFilterSection = typedData.type && typedData.type !== "any";

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label className="text-xs text-gray-400">Xabar turi</Label>
        <TypeSelector
          value={typedData.type || ""}
          onValueChange={(newType) =>
            updateNodeData(nodeId, {
              type: newType,
              filter: "any",
            })
          }
        />
      </div>

      {showFilterSection ? (
        <div className="space-y-1.5">
          <Label className="text-xs text-gray-400">Filter</Label>
          <FilterSelector
            value={typedData.filter || ""}
            onValueChange={(filter) => updateNodeData(nodeId, { filter })}
            options={filtersForType}
          />
        </div>
      ) : null}

      {showFilterSection && typedData.filter && typedData.filter !== "any" ? (
        <div className="space-y-1.5">
          <Label className="text-xs text-gray-400">Parametr</Label>
          <ParameterInput
            filter={typedData.filter}
            context={typedData.context}
            onContextUpdate={(context) => updateNodeData(nodeId, { context })}
          />
        </div>
      ) : null}

      <Label className="mt-2 flex items-center gap-2">
        <Checkbox
          checked={Boolean(typedData.global)}
          onCheckedChange={(checked) =>
            updateNodeData(nodeId, { global: Boolean(checked) })
          }
        />
        Global
      </Label>

      {typedData.type ? (
        <StateConfigUI
          state={typedData.state as never}
          onStateChange={(state) => updateNodeData(nodeId, { state })}
          availableTypes={availableStateTypes}
          nodeId={nodeId}
        />
      ) : null}
    </div>
  );
}

function CallbackQueryTriggerWidget({ nodeId, data }: WidgetProps) {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const nodes = useFlowStore((state) => state.nodes);
  const edges = useFlowStore((state) => state.edges);
  const typedData = data as {
    filter?: string;
    global?: boolean;
    context?: { value?: string };
    state?: unknown;
  };

  const availableCallbacks = useMemo(() => {
    const incomingEdge = edges.find((edge) => edge.target === nodeId);
    if (!incomingEdge) return [];

    const parentNode = nodes.find((node) => node.id === incomingEdge.source);
    const keyboard = parentNode?.data?.keyboard;
    if (!Array.isArray((keyboard as any)?.inline)) return [];

    return (keyboard as any).inline.flat().flatMap((button: any) => {
      if (button.type === "callback" && button.value && !button.collectionData) {
        return [{
          id: button.id,
          text: button.text ?? "",
          value: button.value,
          isCollection: false,
        }];
      }

      if (button.collectionData) {
        const { collection, text } = button.collectionData;
        return [{
          id: button.id,
          text: button.text?.replace("📦 ", "") ?? collection ?? "",
          value: `collection:${collection}:${text}`,
          isCollection: true,
          collectionName: collection,
          fieldName: text,
        }];
      }

      return [];
    });
  }, [edges, nodeId, nodes]);

  const showStaticSelector =
    availableCallbacks.length > 0 && typedData.filter === "equals";
  const showCollectionSelector =
    availableCallbacks.some((item: any) => item.isCollection) &&
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
        <Label className="text-xs text-muted-foreground">
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
          <Label className="text-xs text-muted-foreground">Parametr</Label>
          {showStaticSelector ? (
            <Select
              value={typedData.context?.value || ""}
              onValueChange={(value) =>
                updateNodeData(nodeId, { context: { value } })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Static callback tanlang..." />
              </SelectTrigger>
              <SelectContent>
                {availableCallbacks
                  .filter((button: any) => !button.isCollection)
                  .map((button: any) => (
                    <SelectItem key={button.id} value={button.value}>
                      {button.text}
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
              <SelectTrigger>
                <SelectValue placeholder="Collection callback tanlang..." />
              </SelectTrigger>
              <SelectContent>
                {availableCallbacks
                  .filter((button: any) => button.isCollection)
                  .map((button: any) => (
                    <SelectItem key={button.id} value={button.value}>
                      {button.collectionName}.{button.fieldName}
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
          id={`global-checkbox-${nodeId}`}
          checked={Boolean(typedData.global)}
          onCheckedChange={(checked) =>
            updateNodeData(nodeId, { global: Boolean(checked) })
          }
        />
        <Label
          htmlFor={`global-checkbox-${nodeId}`}
          className="cursor-pointer text-sm"
        >
          Global
        </Label>
      </div>

      <StateConfigUI
        state={typedData.state as never}
        onStateChange={(state) => updateNodeData(nodeId, { state })}
        availableTypes={availableStateTypes}
        nodeId={nodeId}
      />
    </div>
  );
}

function ReplyButtonTriggerWidget({ nodeId, data }: WidgetProps) {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const nodes = useFlowStore((state) => state.nodes);
  const edges = useFlowStore((state) => state.edges);
  const typedData = data as {
    selectedButtons?: Array<{ id: string; text: string }>;
    catchNoButton?: boolean;
    global?: boolean;
    state?: unknown;
  };

  const availableReplyButtons = useMemo(() => {
    const incomingEdge = edges.find((edge) => edge.target === nodeId);
    if (!incomingEdge) return [];
    const parentNode = nodes.find((node) => node.id === incomingEdge.source);
    const reply = parentNode?.data?.keyboard?.reply;
    if (!reply) return [];

    return reply.flat().filter((button: any) =>
      ["reply", "request_contact", "request_location"].includes(button.type)
    );
  }, [edges, nodeId, nodes]);

  return (
    <div className="space-y-3">
      {!typedData.catchNoButton ? (
        availableReplyButtons.length > 0 ? (
          <div className="space-y-3">
            <Label className="text-xs text-muted-foreground">
              Qaysi tugma ushlansin?
            </Label>
            <div className="space-y-2">
              {availableReplyButtons.map((button: any) => (
                <div key={button.id} className="flex items-center gap-3">
                  <Checkbox
                    checked={
                      typedData.selectedButtons?.some(
                        (item) => item.id === button.id
                      ) || false
                    }
                    onCheckedChange={(toggle) => {
                      const selectedButtons = typedData.selectedButtons || [];
                      if (toggle) {
                        updateNodeData(nodeId, {
                          selectedButtons: [...selectedButtons, button],
                          catchNoButton: false,
                        });
                      } else {
                        updateNodeData(nodeId, {
                          selectedButtons: selectedButtons.filter(
                            (item) => item.id !== button.id
                          ),
                        });
                      }
                    }}
                  />
                  <Label>{button.text}</Label>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-md border border-amber-500/20 bg-amber-500/10 p-3 text-center text-sm text-amber-500">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>
              Iltimos, bu nodeni Reply-tugmalari mavjud bo&apos;lgan node&apos;ga ulang.
            </span>
          </div>
        )
      ) : (
        <div className="flex items-center gap-2 rounded-md border border-blue-500/20 bg-blue-500/10 p-3 text-center text-sm text-blue-500">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>Bu node hech qanday tugma bosilmagan xabarlarni tutib oladi.</span>
        </div>
      )}

      <div className="mt-2 space-y-2">
        <Label className="flex cursor-pointer items-center gap-2">
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

        <Label className="flex cursor-pointer items-center gap-2">
          <Checkbox
            checked={Boolean(typedData.global)}
            onCheckedChange={(checked) =>
              updateNodeData(nodeId, { global: Boolean(checked) })
            }
          />
          Global
        </Label>
      </div>

      <StateConfigUI
        state={typedData.state as never}
        onStateChange={(state) => updateNodeData(nodeId, { state })}
        availableTypes={getStateTypesForReplyButtonTrigger()}
        nodeId={nodeId}
      />
    </div>
  );
}

function CronTriggerWidget({ nodeId, data }: WidgetProps) {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const schedule = (data.schedule as string) || "0 9 * * *";
  const parts = schedule.split(" ");
  const [minute, hour, dayOfMonth, month, dayOfWeek] =
    parts.length === 5 ? parts : ["0", "9", "*", "*", "*"];
  const initialType =
    month !== "*"
      ? "yearly"
      : dayOfMonth !== "*"
        ? "monthly"
        : dayOfWeek !== "*"
          ? "weekly"
          : "daily";

  const [type, setType] = useState(initialType);
  const [localMinute, setLocalMinute] = useState(minute === "*" ? "0" : minute);
  const [localHour, setLocalHour] = useState(hour === "*" ? "9" : hour);
  const [localDayOfMonth, setLocalDayOfMonth] = useState(
    dayOfMonth === "*" ? "1" : dayOfMonth
  );
  const [localMonth, setLocalMonth] = useState(month === "*" ? "1" : month);
  const [localDayOfWeek, setLocalDayOfWeek] = useState(
    dayOfWeek === "*" ? "1" : dayOfWeek
  );

  useEffect(() => {
    let cronDayOfMonth = "*";
    let cronMonth = "*";
    let cronDayOfWeek = "*";

    if (type === "weekly") cronDayOfWeek = localDayOfWeek;
    if (type === "monthly" || type === "yearly") cronDayOfMonth = localDayOfMonth;
    if (type === "yearly") cronMonth = localMonth;

    const nextSchedule = `${localMinute || "0"} ${localHour || "0"} ${cronDayOfMonth} ${cronMonth} ${cronDayOfWeek}`;
    if (nextSchedule !== data.schedule) {
      updateNodeData(nodeId, { schedule: nextSchedule });
    }
  }, [
    data.schedule,
    localDayOfMonth,
    localDayOfWeek,
    localHour,
    localMinute,
    localMonth,
    nodeId,
    type,
    updateNodeData,
  ]);

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label className="text-[11px] font-bold uppercase text-muted-foreground">
          Takrorlanish
        </Label>
        <Select value={type} onValueChange={(value) => setType(value as typeof type)}>
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Har kuni</SelectItem>
            <SelectItem value="weekly">Har hafta</SelectItem>
            <SelectItem value="monthly">Har oy</SelectItem>
            <SelectItem value="yearly">Har yili</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-[11px] text-muted-foreground">Soat</Label>
          <Input type="number" value={localHour} onChange={(e) => setLocalHour(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[11px] text-muted-foreground">Daqiqa</Label>
          <Input type="number" value={localMinute} onChange={(e) => setLocalMinute(e.target.value)} />
        </div>
      </div>

      {type === "weekly" ? (
        <div className="space-y-1.5">
          <Label className="text-[11px] text-muted-foreground">Hafta kuni</Label>
          <Select value={localDayOfWeek} onValueChange={setLocalDayOfWeek}>
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Dushanba</SelectItem>
              <SelectItem value="2">Seshanba</SelectItem>
              <SelectItem value="3">Chorshanba</SelectItem>
              <SelectItem value="4">Payshanba</SelectItem>
              <SelectItem value="5">Juma</SelectItem>
              <SelectItem value="6">Shanba</SelectItem>
              <SelectItem value="0">Yakshanba</SelectItem>
            </SelectContent>
          </Select>
        </div>
      ) : null}

      {type === "monthly" || type === "yearly" ? (
        <div className="space-y-1.5">
          <Label className="text-[11px] text-muted-foreground">Oyning sanasi</Label>
          <Input
            type="number"
            value={localDayOfMonth}
            onChange={(e) => setLocalDayOfMonth(e.target.value)}
          />
        </div>
      ) : null}

      {type === "yearly" ? (
        <div className="space-y-1.5">
          <Label className="text-[11px] text-muted-foreground">Oy</Label>
          <Input type="number" value={localMonth} onChange={(e) => setLocalMonth(e.target.value)} />
        </div>
      ) : null}
    </div>
  );
}

function ButtonGeneratorWidget({ nodeId, data, field }: WidgetProps) {
  return (
    <div className="space-y-3">
      {field.textFallback ? (
        <div className="p-4 text-center text-sm text-muted-foreground">
          {field.textFallback}
        </div>
      ) : null}
      <ButtonGenerator initialKeyboard={data.keyboard as never} node_id={nodeId} />
    </div>
  );
}

function DownloadFileWidget({ nodeId, data }: WidgetProps) {
  const nodes = useFlowStore((state) => state.nodes);
  const edges = useFlowStore((state) => state.edges);
  const updateNodeData = useFlowStore((state) => state.updateNodeData);

  const parentMessageTrigger = useMemo(() => {
    const incomingEdge = edges.find((edge) => edge.target === nodeId);
    if (!incomingEdge) return null;
    const parentNode = nodes.find((node) => node.id === incomingEdge.source);
    if (!parentNode || parentNode.type !== "MessageTriggerNode") return null;
    const messageType = parentNode.data?.type;
    if (!["photo", "video", "audio", "document"].includes(messageType)) return null;
    return messageType;
  }, [edges, nodeId, nodes]);

  useEffect(() => {
    if (parentMessageTrigger && parentMessageTrigger !== data.messageType) {
      updateNodeData(nodeId, { messageType: parentMessageTrigger });
    }
  }, [data.messageType, nodeId, parentMessageTrigger, updateNodeData]);

  return parentMessageTrigger ? (
    <div className="space-y-2 text-sm text-muted-foreground">
      <div>
        Xabar turi: <b>{parentMessageTrigger}</b>
      </div>
      <div>Fayl ID triggerdan olinadi.</div>
    </div>
  ) : (
    <div className="flex items-center gap-2 rounded-md border border-amber-500/20 bg-amber-500/10 p-3 text-center text-sm text-amber-500">
      <AlertCircle className="h-5 w-5 shrink-0" />
      <span>Bu node file turidagi MessageTrigger&apos;dan keyin kelishi kerak.</span>
    </div>
  );
}

function HTTPRequestWidget({ nodeId, data }: WidgetProps) {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const typedData = data as {
    method?: string;
    url?: string;
    headers?: Record<string, string>;
    body?: string;
    responseVariable?: string;
    timeout?: number;
    storeHeaders?: boolean;
    credential_id?: number | null;
  };

  return (
    <div className="space-y-3">
      {/* Credential selector — id stored as credential_id in node data */}
      <CredentialSelectField nodeId={nodeId} data={data} dataKey="credential_id" />

      <div className="flex flex-col gap-2">
        <Label>HTTP Metod</Label>
        <Select
          value={typedData.method || "GET"}
          onValueChange={(value) => updateNodeData(nodeId, { method: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {["GET", "POST", "PUT", "DELETE", "PATCH"].map((method) => (
              <SelectItem key={method} value={method}>
                {method}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <Label>URL</Label>
        <Input
          placeholder="https://api.example.com/endpoint"
          value={typedData.url || ""}
          onChange={(e) => updateNodeData(nodeId, { url: e.target.value })}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label>Headers (JSON)</Label>
        <Textarea
          className="min-h-[90px]"
          value={typedData.headers ? JSON.stringify(typedData.headers, null, 2) : ""}
          onChange={(e) => {
            try {
              updateNodeData(nodeId, { headers: JSON.parse(e.target.value) });
            } catch {
              updateNodeData(nodeId, { headers: typedData.headers });
            }
          }}
        />
      </div>
      {["POST", "PUT", "PATCH"].includes(typedData.method || "GET") ? (
        <div className="flex flex-col gap-2">
          <Label>Body (JSON)</Label>
          <Textarea
            className="min-h-[90px]"
            value={typedData.body || ""}
            onChange={(e) => updateNodeData(nodeId, { body: e.target.value })}
          />
        </div>
      ) : null}
      <div className="flex flex-col gap-2">
        <Label>Javob o&apos;zgaruvchisi</Label>
        <Input
          value={typedData.responseVariable || ""}
          onChange={(e) =>
            updateNodeData(nodeId, { responseVariable: e.target.value })
          }
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label>Timeout</Label>
        <Input
          type="number"
          value={typedData.timeout || ""}
          onChange={(e) =>
            updateNodeData(nodeId, { timeout: Number(e.target.value) || 30 })
          }
        />
      </div>
      <div className="flex items-center justify-between">
        <Label>Response header&apos;larni saqlash</Label>
        <Checkbox
          checked={Boolean(typedData.storeHeaders)}
          onCheckedChange={(checked) =>
            updateNodeData(nodeId, { storeHeaders: Boolean(checked) })
          }
        />
      </div>
    </div>
  );
}


function EditMessageWidget({ nodeId, data }: WidgetProps) {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const nodes = useFlowStore((state) => state.nodes);
  const edges = useFlowStore((state) => state.edges);

  const nearestParentAction = findNearestParentAction(nodeId, nodes, edges);
  const parentActionType = nearestParentAction?.type;
  const isTextLike =
    !parentActionType || parentActionType === "SendTextMessageNode";

  return (
    <div className="grid gap-4">
      <Select
        onValueChange={(value) =>
          updateNodeData(nodeId, { messageIdSource: value })
        }
        value={typeof data.messageIdSource === "string" ? (data.messageIdSource as string) : "this_message"}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="this_message">Yuqoridagi xabar</SelectItem>
          <SelectItem value="connected_node">Ko&apos;rsatilgan xabar</SelectItem>
          <SelectItem value="message_id">Message ID</SelectItem>
        </SelectContent>
      </Select>

      {data.messageIdSource === "message_id" ? (
        <Input
          value={typeof data.messageId === "string" ? (data.messageId as string) : ""}
          onChange={(e) => updateNodeData(nodeId, { messageId: e.target.value })}
          placeholder="Enter message id"
        />
      ) : isTextLike ? (
        <RichTextMessageField
          nodeId={nodeId}
          data={data}
          textKey="newText"
          dynamicKey="dynamicMessages"
          label="Yangi matn"
          showParseMode
        />
      ) : (
        <RichTextMessageField
          nodeId={nodeId}
          data={data}
          textKey="newCaption"
          dynamicKey="dynamicMessages"
          label="Yangi caption"
          showParseMode
        />
      )}
    </div>
  );
}

function ConditionListEditor({
  conditions,
  onChange,
}: {
  conditions: Array<{ variable?: string; operator?: string; value?: unknown }>;
  onChange: (
    nextConditions: Array<{ variable?: string; operator?: string; value?: unknown }>
  ) => void;
}) {
  const addCondition = () => {
    onChange([
      ...conditions,
      { variable: "", operator: "equals", value: "" },
    ]);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Label>Shartlar</Label>
        <Button size="sm" variant="outline" onClick={addCondition} className="h-8">
          <ListPlus className="mr-1 h-4 w-4" />
          Qo&apos;shish
        </Button>
      </div>

      {conditions.length === 0 ? (
        <div className="py-4 text-center text-sm text-muted-foreground">
          Hali shart qo&apos;shilmagan
        </div>
      ) : null}

      {conditions.map((condition, index) => (
        <div key={index} className="flex flex-col gap-2 rounded-md border bg-muted/50 p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Shart {index + 1}</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() =>
                onChange(conditions.filter((_, currentIndex) => currentIndex !== index))
              }
              className="h-6 w-6 p-0"
            >
              <span className="text-destructive">×</span>
            </Button>
          </div>

          <Input
            placeholder="O'zgaruvchi nomi"
            value={condition.variable || ""}
            onChange={(e) =>
              onChange(
                conditions.map((item, currentIndex) =>
                  currentIndex === index
                    ? { ...item, variable: e.target.value }
                    : item
                )
              )
            }
          />

          <Select
            value={condition.operator || "equals"}
            onValueChange={(operator) =>
              onChange(
                conditions.map((item, currentIndex) =>
                  currentIndex === index ? { ...item, operator } : item
                )
              )
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="equals">Teng (=)</SelectItem>
              <SelectItem value="not_equals">Teng emas (≠)</SelectItem>
              <SelectItem value="greater_than">Katta (&gt;)</SelectItem>
              <SelectItem value="less_than">Kichik (&lt;)</SelectItem>
              <SelectItem value="greater_equal">Katta yoki teng (≥)</SelectItem>
              <SelectItem value="less_equal">Kichik yoki teng (≤)</SelectItem>
              <SelectItem value="contains">O&apos;z ichiga oladi</SelectItem>
              <SelectItem value="not_contains">O&apos;z ichiga olmaydi</SelectItem>
              <SelectItem value="starts_with">Boshlanadi</SelectItem>
              <SelectItem value="ends_with">Tugaydi</SelectItem>
              <SelectItem value="is_empty">Bo&apos;sh</SelectItem>
              <SelectItem value="not_empty">Bo&apos;sh emas</SelectItem>
              <SelectItem value="exists">Mavjud</SelectItem>
              <SelectItem value="not_exists">Mavjud emas</SelectItem>
              <SelectItem value="in">Ro&apos;yxatda bor</SelectItem>
              <SelectItem value="not_in">Ro&apos;yxatda yo&apos;q</SelectItem>
            </SelectContent>
          </Select>

          {!["is_empty", "not_empty", "exists", "not_exists"].includes(
            condition.operator || "equals"
          ) ? (
            <Input
              placeholder="Qiymat"
              value={condition.value?.toString() || ""}
              onChange={(e) =>
                onChange(
                  conditions.map((item, currentIndex) =>
                    currentIndex === index ? { ...item, value: e.target.value } : item
                  )
                )
              }
            />
          ) : null}
        </div>
      ))}
    </div>
  );
}

function IfConditionWidget({ nodeId, data }: WidgetProps) {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const conditions = Array.isArray(data.conditions) ? (data.conditions as any[]) : [];

  return (
    <div className="grid gap-3">
      <div className="grid gap-2">
        <Label>Mantiq operatori</Label>
        <Select
          value={typeof data.operator === "string" ? (data.operator as string) : "AND"}
          onValueChange={(operator) => updateNodeData(nodeId, { operator })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="AND">AND (Barcha shartlar)</SelectItem>
            <SelectItem value="OR">OR (Biror shart)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ConditionListEditor
        conditions={conditions}
        onChange={(nextConditions) =>
          updateNodeData(nodeId, { conditions: nextConditions, mode: "simple" })
        }
      />
    </div>
  );
}

function ElseIfWidget({ nodeId, data }: WidgetProps) {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const conditions = Array.isArray(data.conditions) ? (data.conditions as any[]) : [];

  return (
    <div className="grid gap-3">
      <div className="grid gap-2">
        <Label>Mantiq operatori</Label>
        <Select
          value={typeof data.operator === "string" ? (data.operator as string) : "AND"}
          onValueChange={(operator) => updateNodeData(nodeId, { operator })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="AND">AND (Barcha shartlar)</SelectItem>
            <SelectItem value="OR">OR (Biror shart)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <ConditionListEditor
        conditions={conditions}
        onChange={(nextConditions) => updateNodeData(nodeId, { conditions: nextConditions })}
      />
    </div>
  );
}

function CheckMembershipWidget({ nodeId, data }: WidgetProps) {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const channels = Array.isArray(data.channels) ? (data.channels as Array<{ id: string; value: string }>) : [];
  const inputType = typeof data.inputType === "string" ? (data.inputType as "id" | "username") : "username";

  return (
    <div className="grid gap-3">
      <div className="grid gap-2">
        <Label>Kirish turi</Label>
        <Select
          value={inputType}
          onValueChange={(value) => updateNodeData(nodeId, { inputType: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="username">Username (@kanal)</SelectItem>
            <SelectItem value="id">Chat ID</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <Label>Kanal/Guruhlar</Label>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              updateNodeData(nodeId, {
                channels: [...channels, { id: `channel_${Date.now()}`, value: "" }],
              })
            }
          >
            Qo&apos;shish
          </Button>
        </div>

        {channels.map((channel) => (
          <div key={channel.id} className="flex gap-2">
            <Input
              placeholder={inputType === "username" ? "@kanalUsername" : "-100123456789"}
              value={channel.value}
              onChange={(e) =>
                updateNodeData(nodeId, {
                  channels: channels.map((item) =>
                    item.id === channel.id ? { ...item, value: e.target.value } : item
                  ),
                })
              }
            />
            <Button
              size="icon"
              variant="ghost"
              onClick={() =>
                updateNodeData(nodeId, {
                  channels: channels.filter((item) => item.id !== channel.id),
                })
              }
            >
              ×
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function PollWidget({ nodeId, data }: WidgetProps) {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const options = Array.isArray(data.options) ? (data.options as Array<{ text: string }>) : [];
  return (
    <div className="grid gap-3">
      <div className="grid gap-2">
        <Label>Savol</Label>
        <Input
          placeholder="Sevimli rangingiz qaysi?"
          value={typeof data.question === "string" ? (data.question as string) : ""}
          onChange={(e) => updateNodeData(nodeId, { question: e.target.value })}
        />
      </div>
      <div className="grid gap-3">
        <div className="flex items-center justify-between">
          <Label>Variantlar</Label>
          <Button
            size="sm"
            variant="outline"
            onClick={() => updateNodeData(nodeId, { options: [...options, { text: "" }] })}
          >
            Qo&apos;shish
          </Button>
        </div>
        {options.map((option, index) => (
          <div key={index} className="flex gap-2">
            <Input
              placeholder={`Variant ${index + 1}`}
              value={option.text}
              onChange={(e) =>
                updateNodeData(nodeId, {
                  options: options.map((item, currentIndex) =>
                    currentIndex === index ? { text: e.target.value } : item
                  ),
                })
              }
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={() =>
                updateNodeData(nodeId, {
                  options: options.filter((_, currentIndex) => currentIndex !== index),
                })
              }
            >
              ×
            </Button>
          </div>
        ))}
      </div>
      <div className="grid gap-2">
        <Label>Turi</Label>
        <Select
          value={typeof data.type === "string" ? (data.type as string) : "regular"}
          onValueChange={(type) => updateNodeData(nodeId, { type })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="regular">Oddiy so&apos;rovnoma</SelectItem>
            <SelectItem value="quiz">Test/Quiz</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {data.type === "quiz" ? (
        <>
          <div className="grid gap-2">
            <Label>To&apos;g&apos;ri javob indeksi</Label>
            <Input
              type="number"
              min="0"
              value={data.correctOptionId === undefined ? "" : String(data.correctOptionId)}
              onChange={(e) =>
                updateNodeData(nodeId, {
                  correctOptionId:
                    e.target.value === "" ? undefined : Number(e.target.value),
                })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label>Tushuntirish</Label>
            <Textarea
              rows={2}
              value={typeof data.explanation === "string" ? (data.explanation as string) : ""}
              onChange={(e) => updateNodeData(nodeId, { explanation: e.target.value })}
            />
          </div>
        </>
      ) : null}
      <div className="flex items-center justify-between">
        <Label>Anonim</Label>
        <Checkbox
          checked={data.isAnonymous !== false}
          onCheckedChange={(checked) => updateNodeData(nodeId, { isAnonymous: Boolean(checked) })}
        />
      </div>
      {data.type !== "quiz" ? (
        <div className="flex items-center justify-between">
          <Label>Bir nechta javob</Label>
          <Checkbox
            checked={Boolean(data.allowsMultipleAnswers)}
            onCheckedChange={(checked) =>
              updateNodeData(nodeId, { allowsMultipleAnswers: Boolean(checked) })
            }
          />
        </div>
      ) : null}
      <div className="grid gap-2">
        <Label>Avtomatik yopish</Label>
        <Input
          type="number"
          placeholder="60"
          value={data.openPeriod === undefined ? "" : String(data.openPeriod)}
          onChange={(e) =>
            updateNodeData(nodeId, {
              openPeriod: e.target.value === "" ? undefined : Number(e.target.value),
            })
          }
        />
      </div>
    </div>
  );
}

function MediaGroupWidget({ nodeId, data }: WidgetProps) {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const mediaItems = Array.isArray(data.mediaItems) ? (data.mediaItems as any[]) : [];
  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between">
        <Label>Media elementlar</Label>
        <Button
          size="sm"
          variant="outline"
          disabled={mediaItems.length >= 10}
          onClick={() =>
            updateNodeData(nodeId, {
              mediaItems: [...mediaItems, { type: "photo", sourceType: "file_id" }],
            })
          }
        >
          Qo&apos;shish
        </Button>
      </div>
      {mediaItems.map((item, index) => (
        <div key={index} className="grid gap-2 rounded-lg border p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Media #{index + 1}</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() =>
                updateNodeData(nodeId, {
                  mediaItems: mediaItems.filter((_, currentIndex) => currentIndex !== index),
                })
              }
            >
              ×
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Select
              value={item.type}
              onValueChange={(type) =>
                updateNodeData(nodeId, {
                  mediaItems: mediaItems.map((current, currentIndex) =>
                    currentIndex === index ? { ...current, type } : current
                  ),
                })
              }
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="photo">Rasm</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="audio">Audio</SelectItem>
                <SelectItem value="document">Fayl</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={item.sourceType}
              onValueChange={(sourceType) =>
                updateNodeData(nodeId, {
                  mediaItems: mediaItems.map((current, currentIndex) =>
                    currentIndex === index ? { ...current, sourceType } : current
                  ),
                })
              }
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="file_id">File ID</SelectItem>
                <SelectItem value="url">URL</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Input
            placeholder={item.sourceType === "file_id" ? "File ID" : "https://example.com/file"}
            value={item.sourceType === "file_id" ? item.fileId || "" : item.url || ""}
            onChange={(e) =>
              updateNodeData(nodeId, {
                mediaItems: mediaItems.map((current, currentIndex) =>
                  currentIndex === index
                    ? item.sourceType === "file_id"
                      ? { ...current, fileId: e.target.value }
                      : { ...current, url: e.target.value }
                    : current
                ),
              })
            }
          />
          <Input
            placeholder="Caption"
            value={item.caption || ""}
            onChange={(e) =>
              updateNodeData(nodeId, {
                mediaItems: mediaItems.map((current, currentIndex) =>
                  currentIndex === index ? { ...current, caption: e.target.value } : current
                ),
              })
            }
          />
        </div>
      ))}
    </div>
  );
}

function StateWidget({ nodeId, data }: WidgetProps) {
  const nodes = useFlowStore((state) => state.nodes);
  const edges = useFlowStore((state) => state.edges);
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const triggerNode = useMemo(() => findNearestTriggerNode(nodeId, nodes, edges), [edges, nodeId, nodes]);
  const dynamicFilterOptions = useMemo(() => getDynamicFilters(triggerNode), [triggerNode]);
  const comboboxOptions = useMemo(
    () => [
      // Custom first so it's always visible at the top of the dropdown — it was
      // appended last (group "Boshqa") and fell below the fold, so users thought
      // it was missing.
      { value: "Custom", label: "Custom (o'zingiz kiriting)", group: "Boshqa" },
      ...dynamicFilterOptions,
    ],
    [dynamicFilterOptions]
  );

  return (
    <div className="grid gap-3">
      {triggerNode ? (
        <div className="rounded-md border border-purple-500/20 bg-purple-500/10 px-2.5 py-1.5 text-xs text-purple-300">
          {String(triggerNode.type).replace("Node", "")}
        </div>
      ) : (
        <div className="rounded-md border border-amber-500/20 bg-amber-500/10 px-2.5 py-1.5 text-xs text-amber-300">
          Trigger node ulanmagan
        </div>
      )}
      <div className="grid gap-2">
        <Label>State Key</Label>
        <Input
          value={typeof data.key === "string" ? (data.key as string) : ""}
          onChange={(e) => updateNodeData(nodeId, { key: e.target.value })}
        />
      </div>
      <div className="grid gap-2">
        <Label>Saqlanadigan ma&apos;lumot</Label>
        <Combobox
          options={comboboxOptions}
          value={typeof data.type === "string" ? (data.type as string) : ""}
          onValueChange={(value) =>
            value === "Custom"
              ? updateNodeData(nodeId, { type: "Custom", customType: data.customType || "" })
              : updateNodeData(nodeId, { type: value, customType: undefined })
          }
          placeholder="Ma'lumot turini tanlang..."
          searchPlaceholder="Qidirish..."
          emptyText="Hech narsa topilmadi"
          triggerClassName="h-9 text-sm"
        />
      </div>
      {data.type === "Custom" ? (
        <div className="grid gap-2">
          <Label>Custom Type</Label>
          <Input
            value={typeof data.customType === "string" ? (data.customType as string) : ""}
            onChange={(e) => updateNodeData(nodeId, { customType: e.target.value })}
          />
        </div>
      ) : null}
    </div>
  );
}

function CustomCodeWidget({ nodeId, data }: WidgetProps) {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const outputs = Array.isArray(data.outputs)
    ? (data.outputs as { name: string; description?: string }[])
    : [];
  const [newOutput, setNewOutput] = useState("");

  const addOutput = () => {
    const name = newOutput.trim();
    if (!name) return;
    if (outputs.some((o) => o.name === name)) {
      setNewOutput("");
      return;
    }
    updateNodeData(nodeId, {
      ...data,
      outputs: [...outputs, { name }],
    });
    setNewOutput("");
  };

  const removeOutput = (name: string) => {
    updateNodeData(nodeId, {
      ...data,
      outputs: outputs.filter((o) => o.name !== name),
    });
  };

  return (
    <div className="grid gap-3">
      <div className="rounded-md border border-dashed border-muted-foreground/20 bg-muted/40 p-2">
        <pre className="w-full overflow-hidden truncate text-[10px] opacity-70">
          {typeof data.jsCode === "string" && data.jsCode.trim()
            ? data.jsCode.slice(0, 60)
            : "// JS kod yozilmagan"}
        </pre>
      </div>
      <CodeEditorDialog
        code={typeof data.jsCode === "string" ? (data.jsCode as string) : ""}
        onChange={(jsCode) => updateNodeData(nodeId, { ...data, jsCode })}
        globals={BOT_GLOBALS}
      />

      <div className="grid gap-2">
        <Label className="text-xs">
          Chiqishlar (exit nomlar)
          <span className="ml-1 text-[10px] text-muted-foreground font-normal">
            — kod ichida exit("nom") ishlatilganda shu nom orqali yo'naltirish
          </span>
        </Label>
        <div className="flex flex-wrap gap-1">
          {outputs.map((o) => (
            <span
              key={o.name}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded text-[11px] border border-emerald-500/20 font-mono"
            >
              {o.name}
              <button
                type="button"
                onClick={() => removeOutput(o.name)}
                className="hover:text-red-500"
                aria-label={`Remove ${o.name}`}
              >
                ×
              </button>
            </span>
          ))}
          {outputs.length === 0 && (
            <span className="text-[10px] text-muted-foreground italic">
              Chiqish yo'q — bitta default source handle ishlatiladi
            </span>
          )}
        </div>
        <div className="flex gap-1">
          <Input
            value={newOutput}
            onChange={(e) => setNewOutput(e.target.value)}
            placeholder="masalan: ok, invalid, not_found"
            className="h-8 text-xs"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addOutput();
              }
            }}
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={addOutput}
            disabled={!newOutput.trim()}
          >
            <PlusIcon className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function FormWidget({ nodeId, data }: WidgetProps) {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  const items = Array.isArray(data.items) ? (data.items as any[]) : [];
  const sortedItems = [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const sortableIds = sortedItems.map((_, index) => `form-item-${index}`);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = parseInt(active.id.toString().replace("form-item-", ""));
    const newIndex = parseInt(over.id.toString().replace("form-item-", ""));
    if (isNaN(oldIndex) || isNaN(newIndex)) return;
    const reorderedItems = arrayMove(sortedItems, oldIndex, newIndex).map((item, index) => ({
      ...item,
      order: index,
    }));
    updateNodeData(nodeId, { items: reorderedItems });
  };

  return (
    <div className="grid gap-3">
      {sortedItems.length > 0 ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
            <div className="space-y-2 nodrag">
              {sortedItems.map((item, index) => (
                <FormItem
                  key={`form-item-${index}`}
                  item={item}
                  index={index}
                  onRemove={() =>
                    updateNodeData(nodeId, {
                      items: sortedItems
                        .filter((_, currentIndex) => currentIndex !== index)
                        .map((entry, order) => ({ ...entry, order })),
                    })
                  }
                  onEdit={() => setEditingItem(item)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : null}
      <AddItemModal
        onAddItem={(item) =>
          updateNodeData(nodeId, {
            items: [...sortedItems, { ...item, order: Math.max(...sortedItems.map((entry) => entry.order ?? 0), -1) + 1 }],
          })
        }
        onEditItem={(item) => {
          updateNodeData(nodeId, {
            items: sortedItems.map((entry) =>
              entry.order === editingItem?.order ? item : entry
            ),
          });
          setEditingItem(null);
        }}
        editingItem={editingItem}
        onClose={() => setEditingItem(null)}
      />
    </div>
  );
}

function CollectionWidget({ nodeId, data }: WidgetProps) {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const nodes = useFlowStore((state) => state.nodes);
  const edges = useFlowStore((state) => state.edges);
  const fieldMappings =
    data.fieldMappings && typeof data.fieldMappings === "object"
      ? (data.fieldMappings as Record<string, string>)
      : {};

  const { data: collections } = useCollectionStore();

  const { data: collectionDetail } = useReactQueryAction<CollectionDetail>({
    url:
      typeof data.collection_name === "string" && data.collection_name
        ? `cms/projects/[id]/collections/${data.collection_name}/`
        : undefined,
    enabled: Boolean(data.collection_name),
  });

  const availableStateKeys = useMemo(
    () => getAvailableStateKeys(nodes, edges, nodeId),
    [edges, nodeId, nodes]
  );

  useEffect(() => {
    const fields = collectionDetail?.fields;
    if (!data.collection_name || !fields) return;

    const nextMappings: Record<string, string> = {};
    fields.forEach((field) => {
      nextMappings[field.name] = fieldMappings[field.name] || field.name;
    });

    const hasChanges =
      fields.some((field) => !fieldMappings[field.name]) ||
      Object.keys(fieldMappings).some(
        (key) => !fields.find((field) => field.name === key)
      );

    if (hasChanges) {
      updateNodeData(nodeId, { fieldMappings: nextMappings });
    }
  }, [
    collectionDetail?.fields,
    data.collection_name,
    fieldMappings,
    nodeId,
    updateNodeData,
  ]);

  const handleStateKeyChange = (fieldName: string, stateKey: string) => {
    updateNodeData(nodeId, {
      fieldMappings: {
        ...fieldMappings,
        [fieldName]: stateKey,
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          Collection
        </Label>
        <Select
          value={typeof data.collection_name === "string" ? data.collection_name : ""}
          onValueChange={(collection_name) =>
            updateNodeData(nodeId, { collection_name, fieldMappings: {} })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Collection tanlang" />
          </SelectTrigger>
          <SelectContent>
            {collections?.map((collection) => (
              <SelectItem key={collection.id} value={collection.name}>
                {collection.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {collectionDetail?.fields?.length ? (
        <div className="space-y-3">
          <Label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Key className="h-3 w-3" />
            Field Mappings
          </Label>
          {collectionDetail.fields.map((field) => {
            const mappedStateKey = fieldMappings[field.name];
            const usesAvailableKey =
              mappedStateKey && availableStateKeys.includes(mappedStateKey);

            return (
              <div key={field.id} className="rounded-lg border bg-muted/30 p-3">
                <div className="flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1.5 flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="font-mono text-xs">
                        {field.name}
                      </Badge>
                      <Badge variant="outline" className="text-xs text-muted-foreground">
                        {field.kind}
                      </Badge>
                      {field.required ? (
                        <Badge variant="outline" className="text-xs text-red-400">
                          Required
                        </Badge>
                      ) : null}
                    </div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Field Key
                    </p>
                  </div>

                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />

                  <div className="min-w-0 flex-1">
                    <Select
                      value={usesAvailableKey ? mappedStateKey : mappedStateKey ? "custom" : ""}
                      onValueChange={(value) =>
                        handleStateKeyChange(field.name, value === "custom" ? "" : value)
                      }
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder="State key..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableStateKeys.map((stateKey) => (
                          <SelectItem key={stateKey} value={stateKey}>
                            {stateKey}
                          </SelectItem>
                        ))}
                        <SelectItem value="custom">Custom...</SelectItem>
                      </SelectContent>
                    </Select>
                    {!mappedStateKey || !usesAvailableKey ? (
                      <Input
                        className="mt-1.5 h-8 text-sm"
                        placeholder="Custom state key..."
                        value={!usesAvailableKey ? mappedStateKey || "" : ""}
                        onChange={(event) =>
                          handleStateKeyChange(field.name, event.target.value)
                        }
                      />
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function LoadCollectionItemWidget({ nodeId, data }: WidgetProps) {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const nodes = useFlowStore((state) => state.nodes);
  const edges = useFlowStore((state) => state.edges);
  const { data: collections } = useCollectionStore();
  const selectedCollection =
    data.collection && typeof data.collection === "object"
      ? (data.collection as { name?: string })
      : null;

  const { data: fields } = useReactQueryAction<CollectionDetail>({
    url: selectedCollection?.name
      ? `cms/projects/[id]/collections/${selectedCollection.name}/`
      : undefined,
    enabled: Boolean(selectedCollection?.name),
  });

  const availableStateKeys = useMemo(
    () => getAvailableStateKeys(nodes, edges, nodeId),
    [edges, nodeId, nodes]
  );

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Collection</Label>
        <Select
          value={selectedCollection?.name ?? ""}
          onValueChange={(value) => {
            const collection = collections?.find((item) => item.name === value);
            updateNodeData(nodeId, {
              collection: collection || null,
              filters: [],
            });
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select collection" />
          </SelectTrigger>
          <SelectContent>
            {collections?.map((collection) => (
              <SelectItem key={collection.id} value={collection.name}>
                {collection.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Context Key</Label>
        <Input
          placeholder="e.g., selected_film"
          value={typeof data.contextKey === "string" ? data.contextKey : ""}
          onChange={(event) =>
            updateNodeData(nodeId, { contextKey: event.target.value })
          }
        />
        <p className="text-xs text-muted-foreground">
          Use: {`{{collection.${typeof data.contextKey === "string" && data.contextKey ? data.contextKey : "key"}.fieldname}}`}
        </p>
      </div>

      {selectedCollection && fields?.fields ? (
        <div className="space-y-2">
          <Label>Filters</Label>
          <FilterBuilder
            fields={[
              { id: "_id", label: "id", type: "text" as const },
              ...fields.fields.map((field) => ({
                id: field.name,
                label: field.label || field.name,
                type: field.kind as any,
              })),
            ]}
            filters={Array.isArray(data.filters) ? data.filters : []}
            onChange={(filters) => updateNodeData(nodeId, { filters })}
            stateKeys={availableStateKeys}
          />
        </div>
      ) : null}

      {selectedCollection && fields?.fields ? (
        <div className="space-y-2">
          <Label className="text-xs">Available Fields</Label>
          <div className="flex flex-wrap gap-1">
            {fields.fields.slice(0, 5).map((field) => (
              <Badge
                key={field.id}
                variant="secondary"
                className="cursor-pointer font-mono text-[10px]"
                onClick={() =>
                  navigator.clipboard.writeText(
                    `{{collection_${typeof data.contextKey === "string" && data.contextKey ? data.contextKey : "key"}_${field.name}}}`
                  )
                }
              >
                {field.name}
              </Badge>
            ))}
            {fields.fields.length > 5 ? (
              <Badge variant="outline" className="text-[10px]">
                +{fields.fields.length - 5}
              </Badge>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

interface SchemaField {
  name: string;
  title?: string;
  type: string;
  description?: string;
  required: boolean;
  defaultValue?: unknown;
  enumValues?: string[];
  itemFields?: SchemaField[];
}

function getSchemaFields(schema: Record<string, unknown>): SchemaField[] {
  const properties = (schema as any)?.properties;
  const required = (schema as any)?.required || [];
  if (!properties) return [];

  return Object.entries(properties).map(([name, prop]: [string, any]) => {
    const field: SchemaField = {
      name,
      title: prop.title,
      type: prop.type || "string",
      description: prop.description,
      required: required.includes(name),
      defaultValue: prop.default,
      enumValues: prop.enum,
    };

    if (prop.type === "array" && prop.items?.properties) {
      const itemRequired = prop.items.required || [];
      field.itemFields = Object.entries(prop.items.properties).map(
        ([subName, subProp]: [string, any]) => ({
          name: subName,
          title: subProp.title,
          type: subProp.type || "string",
          description: subProp.description,
          required: itemRequired.includes(subName),
          defaultValue: subProp.default,
          enumValues: subProp.enum,
        })
      );
    }

    return field;
  });
}

function StringParamField({
  field,
  value,
  onChange,
}: {
  field: SchemaField;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <>
      <Label className="text-xs">
        {field.title || field.name}
        {field.required ? <span className="ml-1 text-destructive">*</span> : null}
      </Label>
      {field.enumValues ? (
        <Select value={value || (field.defaultValue as string)} onValueChange={onChange}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder={field.title || field.name} />
          </SelectTrigger>
          <SelectContent>
            {field.enumValues.map((option) => (
              <SelectItem key={option} value={option} className="text-xs">
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          placeholder={field.description || field.name}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-8 text-xs"
        />
      )}
      {field.description ? (
        <p className="text-[10px] text-muted-foreground">{field.description}</p>
      ) : null}
    </>
  );
}

function BooleanParamField({
  field,
  value,
  onChange,
}: {
  field: SchemaField;
  value: boolean | undefined;
  onChange: (value: boolean) => void;
}) {
  const checked = value ?? (field.defaultValue as boolean) ?? false;
  return (
    <label className="flex cursor-pointer items-center gap-2">
      <Checkbox checked={checked} onCheckedChange={(nextValue) => onChange(nextValue === true)} />
      <span className="text-xs">{field.title || field.name}</span>
    </label>
  );
}

function ArrayParamField({
  field,
  value,
  onChange,
}: {
  field: SchemaField;
  value: Record<string, unknown>[];
  onChange: (value: Record<string, unknown>[]) => void;
}) {
  const itemFields = field.itemFields || [];
  const items = Array.isArray(value) ? value : [];

  const addItem = () => {
    const newItem: Record<string, unknown> = {};
    itemFields.forEach((itemField) => {
      newItem[itemField.name] = itemField.defaultValue ?? "";
    });
    onChange([...items, newItem]);
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <Label className="text-xs">
          {field.title || field.name}
          {field.required ? <span className="ml-1 text-destructive">*</span> : null}
        </Label>
        <span className="text-[10px] text-muted-foreground">{items.length} ta</span>
      </div>
      <div className="flex flex-col gap-2">
        {items.map((item, index) => (
          <div key={index} className="flex flex-col gap-1.5 rounded-lg border bg-muted/30 p-2.5">
            <div className="mb-0.5 flex items-center justify-between">
              <div className="flex items-center gap-1 text-muted-foreground">
                <GripVertical className="h-3 w-3" />
                <span className="text-[10px] font-medium">#{index + 1}</span>
              </div>
              <button
                type="button"
                onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))}
                className="rounded p-0.5 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
            {itemFields.map((itemField) => (
              <div key={itemField.name} className="flex flex-col gap-0.5">
                <Label className="text-[10px] text-muted-foreground">
                  {itemField.title || itemField.name}
                </Label>
                {itemField.enumValues ? (
                  <Select
                    value={String(item[itemField.name] ?? itemField.defaultValue ?? "")}
                    onValueChange={(nextValue) =>
                      onChange(
                        items.map((currentItem, itemIndex) =>
                          itemIndex === index
                            ? { ...currentItem, [itemField.name]: nextValue }
                            : currentItem
                        )
                      )
                    }
                  >
                    <SelectTrigger className="h-7 text-[11px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {itemField.enumValues.map((option) => (
                        <SelectItem key={option} value={option} className="text-xs">
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : itemField.type === "boolean" ? (
                  <label className="flex cursor-pointer items-center gap-1.5">
                    <Checkbox
                      checked={item[itemField.name] === true}
                      onCheckedChange={(nextValue) =>
                        onChange(
                          items.map((currentItem, itemIndex) =>
                            itemIndex === index
                              ? { ...currentItem, [itemField.name]: nextValue === true }
                              : currentItem
                          )
                        )
                      }
                      className="h-3.5 w-3.5"
                    />
                    <span className="text-[10px]">
                      {itemField.title || itemField.name}
                    </span>
                  </label>
                ) : (
                  <Input
                    placeholder={itemField.title || itemField.name}
                    value={String(item[itemField.name] ?? "")}
                    onChange={(event) =>
                      onChange(
                        items.map((currentItem, itemIndex) =>
                          itemIndex === index
                            ? { ...currentItem, [itemField.name]: event.target.value }
                            : currentItem
                        )
                      )
                    }
                    className="h-7 text-[11px]"
                  />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addItem}
        className="flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed py-1.5 text-xs text-muted-foreground hover:bg-primary/5 hover:text-foreground"
      >
        <PlusIcon className="h-3.5 w-3.5" />
        Qo&apos;shish
      </button>
    </>
  );
}

function AIAgentAdvancedWidget({ nodeId, data }: WidgetProps) {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-md border border-muted/50">
      <button
        type="button"
        className="flex w-full items-center justify-between px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground"
        onClick={() => setOpen((prev) => !prev)}
      >
        <span>Advanced</span>
        <span className="opacity-60">{open ? "▲" : "▼"}</span>
      </button>
      {open ? (
        <div className="grid gap-3 border-t border-muted/40 px-3 pb-3 pt-2">
          <div className="grid gap-1.5">
            <Label className="text-xs text-muted-foreground">User Input Source</Label>
            <Input
              className="h-8 text-xs"
              placeholder="message.text"
              value={typeof data.userInputSource === "string" ? data.userInputSource : "message.text"}
              onChange={(e) => updateNodeData(nodeId, { userInputSource: e.target.value })}
            />
            <p className="text-[10px] text-muted-foreground">Context path used when User Input is empty.</p>
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs text-muted-foreground">Max Iterations</Label>
            <Input
              type="number"
              className="h-8 text-xs"
              min={1}
              max={10}
              value={typeof data.maxIterations === "number" ? String(data.maxIterations) : "5"}
              onChange={(e) =>
                updateNodeData(nodeId, { maxIterations: e.target.value === "" ? 5 : Number(e.target.value) })
              }
            />
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs text-muted-foreground">Return Mode</Label>
            <Select
              value={typeof data.returnMode === "string" ? data.returnMode : "text"}
              onValueChange={(val) => updateNodeData(nodeId, { returnMode: val })}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs text-muted-foreground">History Key</Label>
            <Input
              className="h-8 text-xs"
              placeholder="Leave empty to disable"
              value={typeof data.historyKey === "string" ? data.historyKey : ""}
              onChange={(e) => updateNodeData(nodeId, { historyKey: e.target.value })}
            />
            <p className="text-[10px] text-muted-foreground">Context key for conversation history.</p>
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs text-muted-foreground">Error Output Key</Label>
            <Input
              className="h-8 text-xs"
              placeholder="agent_error"
              value={typeof data.errorOutputKey === "string" ? data.errorOutputKey : "agent_error"}
              onChange={(e) => updateNodeData(nodeId, { errorOutputKey: e.target.value })}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

const ALL_CRUD_OPS = ["create", "read", "update", "delete"] as const;
type CrudOp = (typeof ALL_CRUD_OPS)[number];

// ── AICollectionToolConfigWidget types ──────────────────────────────────────

type CollectionAction = "create" | "read" | "update" | "delete" | "list";

type AiFieldEntry = {
  field: string;
  value: string;
  aiMode: boolean;
  aiDescription: string;
};

const emptyEntry = (): AiFieldEntry => ({
  field: "",
  value: "",
  aiMode: false,
  aiDescription: "",
});

const COLL_ACTIONS: { value: CollectionAction; label: string }[] = [
  { value: "create", label: "Create" },
  { value: "read", label: "Read" },
  { value: "update", label: "Update" },
  { value: "delete", label: "Delete" },
  { value: "list", label: "List" },
];

// Sub-component: one field row with AI toggle
function AiFieldRow({
  entry,
  fieldOptions,
  valuePlaceholder,
  onChange,
  onRemove,
}: {
  entry: AiFieldEntry;
  fieldOptions: string[];
  valuePlaceholder?: string;
  onChange: (next: AiFieldEntry) => void;
  onRemove?: () => void;
}) {
  const val = entry.aiMode ? entry.aiDescription : entry.value;
  const setVal = (v: string) =>
    onChange(entry.aiMode ? { ...entry, aiDescription: v } : { ...entry, value: v });

  return (
    <div className="flex items-center gap-1.5 rounded-md border border-white/[0.08] bg-white/[0.02] px-2 py-1.5">
      {/* Field name */}
      {fieldOptions.length > 0 ? (
        <Select value={entry.field} onValueChange={(v) => onChange({ ...entry, field: v })}>
          <SelectTrigger className="h-7 w-28 shrink-0 text-[11px] font-mono">
            <SelectValue placeholder="field" />
          </SelectTrigger>
          <SelectContent>
            {fieldOptions.map((f) => (
              <SelectItem key={f} value={f} className="text-[11px] font-mono">
                {f}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          className="h-7 w-28 shrink-0 text-[11px] font-mono"
          placeholder="field"
          value={entry.field}
          onChange={(e) => onChange({ ...entry, field: e.target.value })}
        />
      )}

      {/* Value / AI description */}
      <Input
        className={cn(
          "h-7 min-w-0 flex-1 text-[11px]",
          entry.aiMode &&
            "border-blue-500/40 bg-blue-500/5 text-blue-200 placeholder:text-blue-400/40"
        )}
        placeholder={entry.aiMode ? "AI uchun tavsif..." : valuePlaceholder ?? "Qiymat..."}
        value={val}
        onChange={(e) => setVal(e.target.value)}
      />

      {/* AI toggle */}
      <button
        type="button"
        title={entry.aiMode ? "AI mode yoqilgan — o'chirish" : "AI mode yoqish"}
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded transition-colors",
          entry.aiMode
            ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
            : "text-zinc-500 hover:text-zinc-300"
        )}
        onClick={() => onChange({ ...entry, aiMode: !entry.aiMode })}
      >
        <Bot className="h-3.5 w-3.5" />
      </button>

      {onRemove ? (
        <button
          type="button"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-zinc-500 hover:text-red-400"
          onClick={onRemove}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </div>
  );
}

function AICollectionToolConfigWidget({ nodeId, data }: WidgetProps) {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const { data: collections } = useCollectionStore();

  const collection = typeof data.collection === "string" ? data.collection : "";
  const action: CollectionAction = (data.action as CollectionAction) || "create";

  const { data: collectionDetail } = useReactQueryAction<CollectionDetail>({
    url: collection ? `cms/projects/[id]/collections/${collection}/` : undefined,
    enabled: Boolean(collection),
  });
  const fieldOptions = (collectionDetail?.fields ?? []).map((f) => f.name);

  // Action-specific data
  const toEntries = (raw: unknown): AiFieldEntry[] =>
    Array.isArray(raw)
      ? (raw as AiFieldEntry[]).map((e) => ({ ...emptyEntry(), ...e }))
      : [];
  const toEntry = (raw: unknown): AiFieldEntry =>
    raw && typeof raw === "object" ? { ...emptyEntry(), ...(raw as AiFieldEntry) } : emptyEntry();

  const createFields = toEntries(data.createFields);
  const readFilter = toEntry(data.readFilter);
  const readContextKey = typeof data.readContextKey === "string" ? data.readContextKey : "";
  const updateFilter = toEntry(data.updateFilter);
  const updateFields = toEntries(data.updateFields);
  const deleteFilter = toEntry(data.deleteFilter);
  const listFilters = toEntries(data.listFilters);
  const listLimit = typeof data.listLimit === "number" ? data.listLimit : 10;
  const listContextKey = typeof data.listContextKey === "string" ? data.listContextKey : "";

  const upd = (patch: Record<string, unknown>) => updateNodeData(nodeId, patch);

  return (
    <div className="grid gap-3">
      {/* Collection selector */}
      <div className="grid gap-1.5">
        <Label className="text-xs text-muted-foreground">Collection</Label>
        <Select value={collection} onValueChange={(v) => upd({ collection: v })}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="Collection tanlang" />
          </SelectTrigger>
          <SelectContent>
            {collections?.map((col) => (
              <SelectItem key={col.id} value={col.name} className="text-xs">
                {col.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Action tabs */}
      <div className="grid gap-1.5">
        <Label className="text-xs text-muted-foreground">Amal</Label>
        <div className="flex gap-1 rounded-lg border border-white/[0.08] bg-white/[0.02] p-1">
          {COLL_ACTIONS.map((a) => (
            <button
              key={a.value}
              type="button"
              className={cn(
                "flex-1 rounded-md py-1 text-[11px] font-medium transition-colors",
                action === a.value
                  ? "bg-white/10 text-white"
                  : "text-zinc-500 hover:text-zinc-300"
              )}
              onClick={() => upd({ action: a.value })}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>

      {/* CREATE — fields to set */}
      {action === "create" && (
        <div className="grid gap-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Fieldlar</Label>
            <button
              type="button"
              className="flex items-center gap-1 rounded border border-dashed border-white/10 px-2 py-0.5 text-[10px] text-zinc-500 hover:text-zinc-300"
              onClick={() => upd({ createFields: [...createFields, emptyEntry()] })}
            >
              <PlusIcon className="h-3 w-3" /> Field
            </button>
          </div>
          {createFields.length === 0 && (
            <p className="text-[10px] italic text-zinc-500">Qo'shiladigan fieldlar yo'q.</p>
          )}
          {createFields.map((e, i) => (
            <AiFieldRow
              key={i}
              entry={e}
              fieldOptions={fieldOptions}
              valuePlaceholder="Qiymat yoki {{var}}"
              onChange={(next) => upd({ createFields: createFields.map((x, j) => (j === i ? next : x)) })}
              onRemove={() => upd({ createFields: createFields.filter((_, j) => j !== i) })}
            />
          ))}
        </div>
      )}

      {/* READ — single filter + context key */}
      {action === "read" && (
        <>
          <div className="grid gap-1.5">
            <Label className="text-xs text-muted-foreground">Filter (topish sharti)</Label>
            <AiFieldRow
              entry={readFilter}
              fieldOptions={fieldOptions}
              valuePlaceholder="Qiymat yoki {{var}}"
              onChange={(next) => upd({ readFilter: next })}
            />
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs text-muted-foreground">Context key</Label>
            <Input
              className="h-7 text-xs font-mono"
              placeholder="masalan: found_user"
              value={readContextKey}
              onChange={(e) => upd({ readContextKey: e.target.value })}
            />
          </div>
        </>
      )}

      {/* UPDATE — filter + fields to update */}
      {action === "update" && (
        <>
          <div className="grid gap-1.5">
            <Label className="text-xs text-muted-foreground">Filter (yangilanadigan yozuv)</Label>
            <AiFieldRow
              entry={updateFilter}
              fieldOptions={fieldOptions}
              valuePlaceholder="Qiymat yoki {{var}}"
              onChange={(next) => upd({ updateFilter: next })}
            />
          </div>
          <div className="grid gap-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Yangilanadigan fieldlar</Label>
              <button
                type="button"
                className="flex items-center gap-1 rounded border border-dashed border-white/10 px-2 py-0.5 text-[10px] text-zinc-500 hover:text-zinc-300"
                onClick={() => upd({ updateFields: [...updateFields, emptyEntry()] })}
              >
                <PlusIcon className="h-3 w-3" /> Field
              </button>
            </div>
            {updateFields.length === 0 && (
              <p className="text-[10px] italic text-zinc-500">Yangilanadigan fieldlar yo'q.</p>
            )}
            {updateFields.map((e, i) => (
              <AiFieldRow
                key={i}
                entry={e}
                fieldOptions={fieldOptions}
                valuePlaceholder="Yangi qiymat"
                onChange={(next) => upd({ updateFields: updateFields.map((x, j) => (j === i ? next : x)) })}
                onRemove={() => upd({ updateFields: updateFields.filter((_, j) => j !== i) })}
              />
            ))}
          </div>
        </>
      )}

      {/* DELETE — single filter */}
      {action === "delete" && (
        <div className="grid gap-1.5">
          <Label className="text-xs text-muted-foreground">Filter (o'chiriladigan yozuv)</Label>
          <AiFieldRow
            entry={deleteFilter}
            fieldOptions={fieldOptions}
            valuePlaceholder="Qiymat yoki {{var}}"
            onChange={(next) => upd({ deleteFilter: next })}
          />
        </div>
      )}

      {/* LIST — filters + limit + context key */}
      {action === "list" && (
        <>
          <div className="grid gap-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Filterlar (ixtiyoriy)</Label>
              <button
                type="button"
                className="flex items-center gap-1 rounded border border-dashed border-white/10 px-2 py-0.5 text-[10px] text-zinc-500 hover:text-zinc-300"
                onClick={() => upd({ listFilters: [...listFilters, emptyEntry()] })}
              >
                <PlusIcon className="h-3 w-3" /> Filter
              </button>
            </div>
            {listFilters.map((e, i) => (
              <AiFieldRow
                key={i}
                entry={e}
                fieldOptions={fieldOptions}
                valuePlaceholder="Qiymat yoki {{var}}"
                onChange={(next) => upd({ listFilters: listFilters.map((x, j) => (j === i ? next : x)) })}
                onRemove={() => upd({ listFilters: listFilters.filter((_, j) => j !== i) })}
              />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="grid gap-1.5">
              <Label className="text-xs text-muted-foreground">Limit</Label>
              <Input
                type="number"
                className="h-7 text-xs"
                value={listLimit}
                min={1}
                onChange={(e) => upd({ listLimit: Number(e.target.value) || 10 })}
              />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs text-muted-foreground">Context key</Label>
              <Input
                className="h-7 text-xs font-mono"
                placeholder="masalan: items"
                value={listContextKey}
                onChange={(e) => upd({ listContextKey: e.target.value })}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function AIKnowledgeToolConfigWidget({ nodeId, data }: WidgetProps) {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const { data: collections } = useCollectionStore();

  const collection = typeof data.collection === "string" ? data.collection : "";
  const textFields = Array.isArray(data.textFields)
    ? (data.textFields as string[])
    : [];
  const embeddingProvider =
    typeof data.embeddingProvider === "string" ? data.embeddingProvider : "openai";
  const embeddingModel =
    typeof data.embeddingModel === "string" ? data.embeddingModel : "text-embedding-3-small";
  const embeddingApiKey =
    typeof data.embeddingApiKey === "string" ? data.embeddingApiKey : "";
  const embeddingBaseURL =
    typeof data.embeddingBaseURL === "string" ? data.embeddingBaseURL : "";
  const vectorDbUrl =
    typeof data.vectorDbUrl === "string" ? data.vectorDbUrl : "";
  const vectorDbApiKey =
    typeof data.vectorDbApiKey === "string" ? data.vectorDbApiKey : "";
  const topK =
    typeof data.topK === "number" ? data.topK : 5;
  const toolName =
    typeof data.toolName === "string" ? data.toolName : "knowledge";

  const [newTextField, setNewTextField] = useState("");

  const addTextField = () => {
    const field = newTextField.trim();
    if (!field || textFields.includes(field)) {
      setNewTextField("");
      return;
    }
    updateNodeData(nodeId, { textFields: [...textFields, field] });
    setNewTextField("");
  };

  const removeTextField = (index: number) => {
    updateNodeData(nodeId, {
      textFields: textFields.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="grid gap-3">
      <div className="grid gap-1.5">
        <Label className="text-xs text-muted-foreground">Tool Name</Label>
        <Input
          className="h-8 text-xs"
          placeholder="knowledge"
          value={toolName}
          onChange={(e) => updateNodeData(nodeId, { toolName: e.target.value })}
        />
      </div>

      <div className="grid gap-1.5">
        <Label className="text-xs text-muted-foreground">Collection</Label>
        <Select value={collection} onValueChange={(val) => updateNodeData(nodeId, { collection: val })}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="Select collection" />
          </SelectTrigger>
          <SelectContent>
            {collections?.map((col) => (
              <SelectItem key={col.id} value={col.name} className="text-xs">
                {col.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Text Fields to Embed</Label>
          <span className="text-[10px] text-muted-foreground">
            {textFields.length === 0 ? "whole doc" : `${textFields.length} field(s)`}
          </span>
        </div>
        <div className="flex flex-wrap gap-1">
          {textFields.map((field, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 rounded border border-violet-500/20 bg-violet-500/10 px-1.5 py-0.5 font-mono text-[11px] text-violet-400"
            >
              {field}
              <button
                type="button"
                onClick={() => removeTextField(index)}
                className="hover:text-destructive"
                aria-label={`Remove ${field}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          {textFields.length === 0 ? (
            <span className="text-[10px] text-muted-foreground italic">
              Empty = embed whole document
            </span>
          ) : null}
        </div>
        <div className="flex gap-1">
          <Input
            className="h-7 text-[11px] font-mono"
            placeholder="field name (e.g. content)"
            value={newTextField}
            onChange={(e) => setNewTextField(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTextField();
              }
            }}
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={addTextField}
            disabled={!newTextField.trim()}
            className="h-7 px-2"
          >
            <PlusIcon className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <div className="grid gap-1.5">
        <Label className="text-xs text-muted-foreground">Embedding Provider</Label>
        <Select
          value={embeddingProvider}
          onValueChange={(val) => {
            const modelDefaults: Record<string, string> = {
              openai: "text-embedding-3-small",
              ollama: "nomic-embed-text",
              gemini: "text-embedding-004",
            };
            updateNodeData(nodeId, {
              embeddingProvider: val,
              embeddingModel: modelDefaults[val] ?? "",
            });
          }}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="openai">OpenAI</SelectItem>
            <SelectItem value="ollama">Ollama</SelectItem>
            <SelectItem value="gemini">Gemini</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-1.5">
        <Label className="text-xs text-muted-foreground">Embedding Model</Label>
        <Input
          className="h-8 text-xs font-mono"
          placeholder={
            embeddingProvider === "openai"
              ? "text-embedding-3-small"
              : embeddingProvider === "ollama"
              ? "nomic-embed-text"
              : "text-embedding-004"
          }
          value={embeddingModel}
          onChange={(e) => updateNodeData(nodeId, { embeddingModel: e.target.value })}
        />
      </div>

      <div className="grid gap-1.5">
        <Label className="text-xs text-muted-foreground">Embedding API Key</Label>
        <Input
          className="h-8 text-xs"
          placeholder="sk-... or {{env.EMBEDDING_KEY}}"
          value={embeddingApiKey}
          onChange={(e) => updateNodeData(nodeId, { embeddingApiKey: e.target.value })}
        />
      </div>

      <div className="grid gap-1.5">
        <Label className="text-xs text-muted-foreground">Embedding Base URL</Label>
        <Input
          className="h-8 text-xs"
          placeholder="https://api.openai.com/v1 (optional)"
          value={embeddingBaseURL}
          onChange={(e) => updateNodeData(nodeId, { embeddingBaseURL: e.target.value })}
        />
      </div>

      <div className="grid gap-1.5">
        <Label className="text-xs text-muted-foreground">Qdrant URL</Label>
        <Input
          className="h-8 text-xs"
          placeholder="http://localhost:6333"
          value={vectorDbUrl}
          onChange={(e) => updateNodeData(nodeId, { vectorDbUrl: e.target.value })}
        />
      </div>

      <div className="grid gap-1.5">
        <Label className="text-xs text-muted-foreground">Qdrant API Key</Label>
        <Input
          className="h-8 text-xs"
          placeholder="qdrant-api-key (optional)"
          value={vectorDbApiKey}
          onChange={(e) => updateNodeData(nodeId, { vectorDbApiKey: e.target.value })}
        />
      </div>

      <div className="grid gap-1.5">
        <Label className="text-xs text-muted-foreground">Top-K Results</Label>
        <Input
          type="number"
          className="h-8 text-xs"
          min={1}
          max={50}
          value={String(topK)}
          onChange={(e) =>
            updateNodeData(nodeId, { topK: e.target.value === "" ? 5 : Number(e.target.value) })
          }
        />
        <p className="text-[10px] text-muted-foreground">
          Number of most-similar chunks returned to the agent.
        </p>
      </div>
    </div>
  );
}

function buildParametersSchema(
  searchFields: { field: string; description: string }[]
): Record<string, unknown> {
  const properties: Record<string, unknown> = {};
  searchFields.forEach(({ field, description }) => {
    if (field) {
      properties[field] = { type: "string", description };
    }
  });
  return {
    type: "object",
    properties,
    required: [],
  };
}

function SubFlowWidget({ nodeId, data }: WidgetProps) {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const params =
    data.params && typeof data.params === "object"
      ? (data.params as Record<string, unknown>)
      : {};
  const paramFields =
    data.paramsSchema && typeof data.paramsSchema === "object"
      ? getSchemaFields(data.paramsSchema as Record<string, unknown>)
      : [];
  const outputs = Array.isArray(data.outputs)
    ? (data.outputs as Array<{ name: string; description?: string }>)
    : [];

  const handleParamChange = useCallback(
    (key: string, value: unknown) => {
      updateNodeData(nodeId, {
        params: {
          ...params,
          [key]: value,
        },
      });
    },
    [nodeId, params, updateNodeData]
  );

  return (
    <div className="flex flex-col gap-3">
      {typeof data.pluginDescription === "string" && data.pluginDescription ? (
        <p className="text-xs text-muted-foreground">{data.pluginDescription}</p>
      ) : null}

      {paramFields.length > 0 ? (
        <div className="flex flex-col gap-3">
          <Label className="text-xs font-semibold">Parametrlar</Label>
          {paramFields.map((field) => (
            <div key={field.name} className="flex flex-col gap-1">
              {field.type === "array" ? (
                <ArrayParamField
                  field={field}
                  value={(params[field.name] as Record<string, unknown>[]) || []}
                  onChange={(value) => handleParamChange(field.name, value)}
                />
              ) : field.type === "boolean" ? (
                <BooleanParamField
                  field={field}
                  value={params[field.name] as boolean | undefined}
                  onChange={(value) => handleParamChange(field.name, value)}
                />
              ) : (
                <StringParamField
                  field={field}
                  value={String(params[field.name] ?? "")}
                  onChange={(value) => handleParamChange(field.name, value)}
                />
              )}
            </div>
          ))}
        </div>
      ) : null}

      {outputs.length > 0 ? (
        <div className="flex flex-col gap-1">
          <Label className="text-xs font-semibold">Chiqishlar</Label>
          <div className="flex flex-wrap gap-1">
            {outputs.map((output) => (
              <Badge key={output.name} variant="outline" className="text-[10px]">
                {output.name}
              </Badge>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

const widgetRegistry: Record<string, (props: WidgetProps) => ReactNode> = {
  messageTrigger: MessageTriggerWidget,
  callbackQueryTrigger: CallbackQueryTriggerWidget,
  replyButtonTrigger: ReplyButtonTriggerWidget,
  cronTrigger: CronTriggerWidget,
  buttonGenerator: ButtonGeneratorWidget,
  downloadFile: DownloadFileWidget,
  httpRequest: HTTPRequestWidget,
  editMessage: EditMessageWidget,
  ifCondition: IfConditionWidget,
  elseIf: ElseIfWidget,
  checkMembership: CheckMembershipWidget,
  pollMessage: PollWidget,
  mediaGroup: MediaGroupWidget,
  stateNode: StateWidget,
  customCode: CustomCodeWidget,
  formNode: FormWidget,
  collectionNode: CollectionWidget,
  loadCollectionItem: LoadCollectionItemWidget,
  subFlow: SubFlowWidget,
  aiAgentAdvanced: AIAgentAdvancedWidget,
  aiCollectionToolConfig: AICollectionToolConfigWidget,
  aiKnowledgeToolConfig: AIKnowledgeToolConfigWidget,
};

export function renderCustomWidget(props: WidgetProps) {
  const widgetKey = props.field.widgetKey;
  if (!widgetKey || !widgetRegistry[widgetKey]) {
    return null;
  }

  return widgetRegistry[widgetKey](props);
}
