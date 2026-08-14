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
import { ConstructorData } from "@/features/bot-constructor/lib";
import { localizedToString } from "@/features/bot-constructor/fields/generic-fields/i18n-helpers";
import { MessageTriggerValueTypes } from "@/features/bot-constructor/lib/messages";
import { ButtonGenerator } from "@/features/bot-constructor/panels/ButtonGenerator/ButtonGenerator";
import { Combobox } from "@/components/ui/combobox";
import { FilterBuilder } from "@/features/bot-constructor/nodes/shared/filter/filter";
import { useReactQueryAction } from "@/services/react-query/use-react-query-action";
import { findNearestParentAction } from "@/features/bot-constructor/lib/findNearestParentAction";
import { findNearestTriggerNode, getDynamicFilters } from "@/features/bot-constructor/nodes/bespoke/StateNode/getDynamicFilters";
import { getFiltersForType } from "@/features/bot-constructor/nodes/shared/HandlerBuilder/utils";
import { FilterSelector } from "@/features/bot-constructor/nodes/bespoke/MessageTrigger/components/FilterSelector";
import { ParameterInput } from "@/features/bot-constructor/nodes/bespoke/MessageTrigger/components/ParameterInput";
import { ValueInput } from "@/features/bot-constructor/nodes/bespoke/MessageTrigger/components/ParameterInput/ValueInput";
import { TypeSelector } from "@/features/bot-constructor/nodes/bespoke/MessageTrigger/components/TypeSelector";
import { useFlowStore } from "@/features/bot-constructor/store";
import { useCollectionStore } from "@/features/collections/store/collection-list";
import useProjectStore from "@/features/bot-constructor/store/project";
import { instanceAuth } from "@/services/instance";

import { AlertCircle, ArrowRight, Bot, GripVertical, Key, ListPlus, Loader2, PlusIcon, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { CodeEditorDialog } from "@/features/bot-constructor/nodes/bespoke/CustomCodeNode/components/CodeEditorDialog";
import AddItemModal from "@/features/bot-constructor/nodes/bespoke/FormNode/components/add-item-modal";
import { FormItem } from "@/features/bot-constructor/nodes/bespoke/FormNode/components/form-item";
import { getAvailableStateKeys } from "@/features/bot-constructor/lib";
import { CollectionDetail, CollectionListItem } from "@/types/http/collection";
import { NodeFieldManifest } from "@/features/bot-constructor/manifest/types";
import { getNodeManifestByType } from "@/features/bot-constructor/manifest";
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
} from "@/features/bot-constructor/fields/shared-message-fields";
import { CredentialSelectField } from "@/features/bot-constructor/fields/generic-fields/CredentialSelectField";
import { useTranslations } from "next-intl";

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
  };

  const filtersForType = useMemo(
    () => getFiltersForType(typedData.type),
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
          text: localizedToString(button.text),
          value: button.value,
          isCollection: false,
        }];
      }

      if (button.collectionData) {
        const { collection, text } = button.collectionData;
        return [{
          id: button.id,
          text: localizedToString(button.text).replace("📦 ", "") || collection || "",
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
                      {localizedToString(button.text)}
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
                  <Label>{localizedToString(button.text)}</Label>
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
    if (!["photo", "video", "audio", "document", "voice", "video_note", "animation", "sticker"].includes(messageType)) return null;
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

function HTTPRequestWidget({ nodeId, data, field }: WidgetProps) {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const typedData = data as {
    method?: string;
    url?: string;
    headers?: Record<string, string>;
    body?: string;
    responseVariable?: string;
    timeout?: number;
    storeHeaders?: boolean;
    // Go backend credential IDs are UUID strings, not ints.
    credential_id?: string | null;
  };

  return (
    <div className="space-y-3">
      {/* Credential selector — id stored as credential_id (UUID string) in node
          data. HTTP accepts any auth mode, so typeKey is only set when the
          manifest constrains it via field.credentialType (otherwise all shown). */}
      <CredentialSelectField
        nodeId={nodeId}
        data={data}
        dataKey="credential_id"
        typeKey={field.credentialType}
      />

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
          label="Yangi matn"
          showParseMode
        />
      ) : (
        <RichTextMessageField
          nodeId={nodeId}
          data={data}
          textKey="newCaption"
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
  const fieldMappings = useMemo(
    () =>
      data.fieldMappings && typeof data.fieldMappings === "object"
        ? (data.fieldMappings as Record<string, string>)
        : {},
    [data.fieldMappings],
  );

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

// ── AICollectionToolConfigWidget — TEMPLATE GIBRID model ──────────────────
// Engine kontrakt: collection / operation / filterMatch /
//   filterConditions / documentFields / changeFields

type TemplateOp = "create" | "read" | "update" | "delete";

/** Filter/document/change qatoridagi yagona entry */
type TemplateFieldEntry = {
  /** Collection field nomi */
  field: string;
  /** Faqat filterConditions: taqqoslash operatori */
  op: string;
  /** "fixed" — foydalanuvchi yozadi; "ai" — AI runtime'da to'ldiradi */
  source: "fixed" | "ai";
  /** source=="fixed" da ko'rsatiladi */
  value: string;
  /** source=="ai" da ko'rsatiladi */
  aiDescription: string;
};

const FILTER_OPS: { value: string; label: string }[] = [
  { value: "eq",       label: "=" },
  { value: "ne",       label: "≠" },
  { value: "gt",       label: ">" },
  { value: "gte",      label: "≥" },
  { value: "lt",       label: "<" },
  { value: "lte",      label: "≤" },
  { value: "in",       label: "ichida (in)" },
  { value: "nin",      label: "ichida emas" },
  { value: "contains", label: "oʻz ichiga" },
  { value: "exists",   label: "mavjud" },
];

const CRUD_OPS_SINGLE: { value: TemplateOp; label: string }[] = [
  { value: "create", label: "Create" },
  { value: "read",   label: "Read" },
  { value: "update", label: "Update" },
  { value: "delete", label: "Delete" },
];

function emptyFilterEntry(): TemplateFieldEntry {
  return { field: "", op: "eq", source: "ai", value: "", aiDescription: "" };
}

function emptyDocEntry(): TemplateFieldEntry {
  return { field: "", op: "eq", source: "ai", value: "", aiDescription: "" };
}

/** Bitta template qatori: field + (op) + source-toggle + value/aiDescription + trash */
function TemplateFieldRow({
  entry,
  fieldOptions,
  forceFieldSelect = false,
  showOp,
  allowRemove = true,
  onChange,
  onRemove,
}: {
  entry: TemplateFieldEntry;
  fieldOptions: string[];
  forceFieldSelect?: boolean;
  /** true — filterConditions'da (op ko'rsatilsin) */
  showOp: boolean;
  allowRemove?: boolean;
  onChange: (next: TemplateFieldEntry) => void;
  onRemove: () => void;
}) {
  return (
    <div className="grid gap-1 rounded-md border border-white/[0.07] bg-white/[0.02] px-2 py-1.5">
      {/* Qator 1: field + op (agar showOp) + trash */}
      <div className="flex items-center gap-1.5">
        {/* Field dropdown yoki input */}
        {forceFieldSelect || fieldOptions.length > 0 ? (
          <Select value={entry.field} onValueChange={(v) => onChange({ ...entry, field: v })}>
            <SelectTrigger className="h-7! w-28 shrink-0 py-0 text-[11px] font-mono">
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

        {/* Op dropdown — faqat filter qatorida */}
        {showOp && (
          <Select value={entry.op} onValueChange={(v) => onChange({ ...entry, op: v })}>
            <SelectTrigger className="h-7! w-22 shrink-0 py-0 text-[11px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FILTER_OPS.map((o) => (
                <SelectItem key={o.value} value={o.value} className="text-[11px]">
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Source toggle: Fixed / AI */}
        <div className="ml-auto flex shrink-0 overflow-hidden rounded border border-white/[0.08]">
          <button
            type="button"
            onClick={() => onChange({ ...entry, source: "fixed" })}
            className={cn(
              "px-2 py-0.5 text-[10px] font-medium transition-colors",
              entry.source === "fixed"
                ? "bg-amber-500/20 text-amber-300"
                : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            Qiymat
          </button>
          <button
            type="button"
            onClick={() => onChange({ ...entry, source: "ai" })}
            className={cn(
              "px-2 py-0.5 text-[10px] font-medium transition-colors",
              entry.source === "ai"
                ? "bg-blue-500/20 text-blue-300"
                : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            AI
          </button>
        </div>

        {/* Trash */}
        {allowRemove && (
          <button
            type="button"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-zinc-600 hover:text-red-400"
            onClick={onRemove}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Qator 2: value yoki aiDescription (source ga qarab) */}
      {entry.source === "fixed" ? (
        <Input
          className="h-7 text-[11px]"
          placeholder="Qiymat yoki {{chat_id}}"
          value={entry.value}
          onChange={(e) => onChange({ ...entry, value: e.target.value })}
        />
      ) : (
        <Input
          className="h-7 text-[11px]"
          placeholder="AI uchun tavsif: bu qiymat nima"
          value={entry.aiDescription}
          onChange={(e) => onChange({ ...entry, aiDescription: e.target.value })}
        />
      )}
    </div>
  );
}

/** Yengil migratsiya: eski searchFields → filterConditions (source:"ai", op:"eq") */
function migrateSearchFields(raw: unknown): TemplateFieldEntry[] {
  if (!Array.isArray(raw)) return [];
  return (raw as Array<{ field?: unknown; description?: unknown }>).map((e) => ({
    field: typeof e?.field === "string" ? e.field : "",
    op: "eq",
    source: "ai",
    value: "",
    aiDescription: typeof e?.description === "string" ? e.description : "",
  }));
}

function parseTemplateEntries(raw: unknown): TemplateFieldEntry[] {
  if (!Array.isArray(raw)) return [];
  return (raw as Array<Partial<TemplateFieldEntry>>).map((e) => ({
    field:         typeof e?.field === "string" ? e.field : "",
    op:            typeof e?.op === "string" ? e.op : "eq",
    source:        e?.source === "fixed" ? "fixed" : "ai",
    value:         typeof e?.value === "string" ? e.value : "",
    aiDescription: typeof e?.aiDescription === "string" ? e.aiDescription : "",
  }));
}

function AICollectionToolConfigWidget({ nodeId, data }: WidgetProps) {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const { data: collections } = useCollectionStore();

  // ── collection ──────────────────────────────────────────────────────────
  const collection = typeof data.collection === "string" ? data.collection : "";

  // ── operation: bitta tanlash — yengil migratsiya eski `operations[0]`/`action` ──
  const rawOperation: unknown = data.operation
    ?? (Array.isArray(data.operations) && (data.operations as string[]).length > 0
        ? (data.operations as string[])[0]
        : undefined)
    ?? data.action;
  const VALID_OPS: TemplateOp[] = ["create", "read", "update", "delete"];
  const operation: TemplateOp =
    typeof rawOperation === "string" && VALID_OPS.includes(rawOperation as TemplateOp)
      ? (rawOperation as TemplateOp)
      : "read";

  // ── filterMatch ──────────────────────────────────────────────────────────
  const filterMatch: "and" | "or" =
    data.filterMatch === "or" ? "or" : "and";

  // ── filterConditions — yengil migratsiya eski searchFields ──────────────
  const filterConditions: TemplateFieldEntry[] = Array.isArray(data.filterConditions)
    ? parseTemplateEntries(data.filterConditions)
    : Array.isArray(data.searchFields)
    ? migrateSearchFields(data.searchFields)
    : [];

  // ── documentFields (create) ──────────────────────────────────────────────
  const documentFields = useMemo<TemplateFieldEntry[]>(
    () =>
      Array.isArray(data.documentFields)
        ? parseTemplateEntries(data.documentFields)
        : [],
    [data.documentFields],
  );

  // ── changeFields (update) ────────────────────────────────────────────────
  const changeFields: TemplateFieldEntry[] = Array.isArray(data.changeFields)
    ? parseTemplateEntries(data.changeFields)
    : [];

  // ── collection field'lari (dropdown uchun) ──────────────────────────────
  const { data: collectionDetail } = useReactQueryAction<CollectionDetail>({
    url: collection ? `cms/projects/[id]/collections/${collection}/` : undefined,
    enabled: Boolean(collection),
  });
  const fieldOptions = (collectionDetail?.fields ?? []).map((f) => f.name);

  const upd = useCallback(
    (patch: Record<string, unknown>) => updateNodeData(nodeId, patch),
    [nodeId, updateNodeData],
  );

  useEffect(() => {
    if (operation !== "create" || !collection || !collectionDetail?.fields) return;

    const entriesByField = new Map(documentFields.map((entry) => [entry.field, entry]));
    const nextDocumentFields = collectionDetail.fields.map(
      (field) => entriesByField.get(field.name) ?? { ...emptyDocEntry(), field: field.name },
    );
    const isSynced =
      documentFields.length === nextDocumentFields.length &&
      documentFields.every((entry, index) => entry.field === nextDocumentFields[index]?.field);

    if (!isSynced) {
      upd({ documentFields: nextDocumentFields });
    }
  }, [collection, collectionDetail?.fields, documentFields, operation, upd]);

  // filterConditions helpers
  const addFilter = () => upd({ filterConditions: [...filterConditions, emptyFilterEntry()] });
  const updateFilter = (i: number, next: TemplateFieldEntry) =>
    upd({ filterConditions: filterConditions.map((e, j) => (j === i ? next : e)) });
  const removeFilter = (i: number) =>
    upd({ filterConditions: filterConditions.filter((_, j) => j !== i) });

  // documentFields helpers
  const updateDocField = (i: number, next: TemplateFieldEntry) =>
    upd({ documentFields: documentFields.map((e, j) => (j === i ? next : e)) });
  const removeDocField = (i: number) =>
    upd({ documentFields: documentFields.filter((_, j) => j !== i) });

  // changeFields helpers
  const addChangeField = () => upd({ changeFields: [...changeFields, emptyDocEntry()] });
  const updateChangeField = (i: number, next: TemplateFieldEntry) =>
    upd({ changeFields: changeFields.map((e, j) => (j === i ? next : e)) });
  const removeChangeField = (i: number) =>
    upd({ changeFields: changeFields.filter((_, j) => j !== i) });

  const showFilter = operation === "read" || operation === "update" || operation === "delete";
  const showDocFields = operation === "create";
  const showChangeFields = operation === "update";

  return (
    <div className="grid gap-3">
      {/* 1. Collection selector */}
      <div className="grid gap-1.5">
        <Label className="text-xs text-muted-foreground">Collection</Label>
        <Select
          value={collection}
          onValueChange={(v) =>
            upd({
              collection: v,
              filterConditions: [],
              documentFields: [],
              changeFields: [],
            })
          }
        >
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

      {/* 2. Operation — bitta segment tanlash */}
      <div className="grid gap-1.5">
        <Label className="text-xs text-muted-foreground">Amal</Label>
        <div className="flex overflow-hidden rounded-md border border-white/[0.08]">
          {CRUD_OPS_SINGLE.map((op) => (
            <button
              key={op.value}
              type="button"
              onClick={() => upd({ operation: op.value })}
              className={cn(
                "flex-1 py-1 text-[11px] font-medium transition-colors",
                operation === op.value
                  ? "bg-blue-500/20 text-blue-300"
                  : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              {op.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Filter (read / update / delete) */}
      {showFilter && (
        <div className="grid gap-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Filter (topish sharti)</Label>
            {/* AND/OR mini-toggle */}
            <div className="flex overflow-hidden rounded border border-white/[0.08]">
              {(["and", "or"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => upd({ filterMatch: m })}
                  className={cn(
                    "px-2 py-0.5 text-[10px] font-medium uppercase transition-colors",
                    filterMatch === m
                      ? "bg-white/10 text-zinc-200"
                      : "text-zinc-600 hover:text-zinc-400"
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {filterConditions.map((entry, i) => (
            <TemplateFieldRow
              key={i}
              entry={entry}
              fieldOptions={fieldOptions}
              forceFieldSelect={Boolean(collection)}
              showOp
              onChange={(next) => updateFilter(i, next)}
              onRemove={() => removeFilter(i)}
            />
          ))}

          <button
            type="button"
            className="flex items-center gap-1 rounded border border-dashed border-white/10 px-2 py-1 text-[10px] text-zinc-500 hover:text-zinc-300"
            onClick={addFilter}
          >
            <PlusIcon className="h-3 w-3" /> Shart qo&apos;shish
          </button>
        </div>
      )}

      {/* 4. changeFields (update) */}
      {showChangeFields && (
        <div className="grid gap-1.5">
          <Label className="text-xs text-muted-foreground">Yangilanadigan qiymatlar</Label>

          {changeFields.map((entry, i) => (
            <TemplateFieldRow
              key={i}
              entry={entry}
              fieldOptions={fieldOptions}
              forceFieldSelect={Boolean(collection)}
              showOp={false}
              onChange={(next) => updateChangeField(i, next)}
              onRemove={() => removeChangeField(i)}
            />
          ))}

          <button
            type="button"
            className="flex items-center gap-1 rounded border border-dashed border-white/10 px-2 py-1 text-[10px] text-zinc-500 hover:text-zinc-300"
            onClick={addChangeField}
          >
            <PlusIcon className="h-3 w-3" /> Field qo&apos;shish
          </button>
        </div>
      )}

      {/* 5. documentFields (create) */}
      {showDocFields && (
        <div className="grid gap-1.5">
          <Label className="text-xs text-muted-foreground">Yozuv fieldlari</Label>

          {documentFields.map((entry, i) => (
            <TemplateFieldRow
              key={i}
              entry={entry}
              fieldOptions={fieldOptions}
              forceFieldSelect={Boolean(collection)}
              showOp={false}
              allowRemove={false}
              onChange={(next) => updateDocField(i, next)}
              onRemove={() => removeDocField(i)}
            />
          ))}
        </div>
      )}

      {/* 6. Qisqa izoh */}
      <p className="text-[10px] leading-relaxed text-zinc-500">
        <span className="font-medium text-amber-400/80">Qiymat</span> — siz yozasiz (
        <span className="font-mono">&#123;&#123;chat_id&#125;&#125;</span> ishlatish mumkin).{" "}
        <span className="font-medium text-blue-400/80">AI to&apos;ldiradi</span> — AI runtime&apos;da
        tavsifga qarab kiritadi.
      </p>
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
          type="password"
          autoComplete="new-password"
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
          type="password"
          autoComplete="new-password"
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
  const params = useMemo(
    () =>
      data.params && typeof data.params === "object"
        ? (data.params as Record<string, unknown>)
        : {},
    [data.params],
  );
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

function LoadCollectionListWidget({ nodeId, data }: WidgetProps) {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const nodes = useFlowStore((state) => state.nodes);
  const edges = useFlowStore((state) => state.edges);
  const { data: collections } = useCollectionStore();

  const selectedCollection =
    data.collection && typeof data.collection === "object"
      ? (data.collection as { name?: string })
      : null;

  const { data: collectionDetail } = useReactQueryAction<CollectionDetail>({
    url: selectedCollection?.name
      ? `cms/projects/[id]/collections/${selectedCollection.name}/`
      : undefined,
    enabled: Boolean(selectedCollection?.name),
  });

  const availableStateKeys = useMemo(
    () => getAvailableStateKeys(nodes, edges, nodeId),
    [edges, nodeId, nodes]
  );

  const collectionFields = useMemo(() => {
    if (!collectionDetail?.fields) return [];
    return [
      { id: "_id", label: "id" },
      ...collectionDetail.fields.map((f) => ({
        id: f.name,
        label: f.label || f.name,
        type: f.kind as any,
      })),
    ];
  }, [collectionDetail?.fields]);

  return (
    <div className="space-y-4">
      {/* Collection selector */}
      <div className="space-y-2">
        <Label>Collection</Label>
        <Select
          value={selectedCollection?.name ?? ""}
          onValueChange={(value) => {
            const collection = collections?.find((item) => item.name === value);
            updateNodeData(nodeId, {
              collection: collection || null,
              filters: [],
              sorts: [],
            });
          }}
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

      {/* Result key */}
      <div className="space-y-2">
        <Label>Natija kaliti (state)</Label>
        <Input
          placeholder="collection_results"
          value={typeof data.resultKey === "string" ? data.resultKey : ""}
          onChange={(e) => updateNodeData(nodeId, { resultKey: e.target.value })}
        />
        <p className="text-xs text-muted-foreground">
          {`{{${typeof data.resultKey === "string" && data.resultKey ? data.resultKey : "collection_results"}.0.fieldname}}`}
        </p>
      </div>

      {/* Limit */}
      <div className="space-y-2">
        <Label>Limit</Label>
        <Input
          type="number"
          placeholder="10"
          min={1}
          max={1000}
          value={typeof data.limit === "number" ? data.limit : 10}
          onChange={(e) =>
            updateNodeData(nodeId, { limit: parseInt(e.target.value) || 10 })
          }
        />
        <p className="text-xs text-muted-foreground">Maksimal qaytariladigan hujjatlar soni (1–1000)</p>
      </div>

      {/* Filters */}
      {selectedCollection && collectionDetail?.fields ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">Filterlar</Label>
          <FilterBuilder
            fields={collectionFields as any}
            filters={Array.isArray(data.filters) ? (data.filters as any) : []}
            onChange={(filters) => updateNodeData(nodeId, { filters })}
            stateKeys={availableStateKeys}
          />
        </div>
      ) : null}

      {/* Sorts */}
      {selectedCollection && collectionDetail?.fields ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">Saralash (Sort)</Label>
          <SortBuilderWidget
            fields={collectionFields}
            sorts={Array.isArray(data.sorts) ? (data.sorts as SortRuleData[]) : []}
            onChange={(sorts) => updateNodeData(nodeId, { sorts })}
          />
        </div>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Inline sort builder for LoadCollectionList (avoids extra file import issues)
// ---------------------------------------------------------------------------
interface SortRuleData {
  id: string;
  field: string;
  direction: "asc" | "desc";
}

interface SortBuilderWidgetProps {
  fields: { id: string; label: string }[];
  sorts: SortRuleData[];
  onChange: (sorts: SortRuleData[]) => void;
}

function SortBuilderWidget({ fields, sorts, onChange }: SortBuilderWidgetProps) {
  const addSort = () => {
    const usedFields = sorts.map((s) => s.field);
    const nextField = fields.find((f) => !usedFields.includes(f.id));
    onChange([
      ...sorts,
      { id: Math.random().toString(36).slice(2), field: nextField?.id ?? "", direction: "asc" as const },
    ]);
  };

  const removeSort = (id: string) => onChange(sorts.filter((s) => s.id !== id));

  const updateSort = (id: string, patch: Partial<SortRuleData>) =>
    onChange(sorts.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  const usedFields = sorts.map((s) => s.field);

  return (
    <div className="space-y-2">
      {sorts.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground">
          <p className="text-sm mb-2">Sort qoidasi yo'q</p>
          <Button onClick={addSort} variant="outline" size="sm" disabled={fields.length === 0}>
            <PlusIcon className="h-4 w-4 mr-1" />
            Sort qo'shish
          </Button>
        </div>
      ) : (
        <>
          {sorts.map((rule) => {
            const availableFields = fields.filter(
              (f) => f.id === rule.field || !usedFields.includes(f.id)
            );
            return (
              <div
                key={rule.id}
                className="flex items-center gap-2 p-2 rounded-lg border border-border bg-card hover:bg-accent/30 transition-all group"
              >
                <Select value={rule.field} onValueChange={(v) => updateSort(rule.id, { field: v })}>
                  <SelectTrigger className="flex-1 min-w-0 h-8 text-sm">
                    <SelectValue placeholder="Field tanlang" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableFields.map((f) => (
                      <SelectItem key={f.id} value={f.id}>
                        {f.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={rule.direction}
                  onValueChange={(v) => updateSort(rule.id, { direction: v as "asc" | "desc" })}
                >
                  <SelectTrigger className="w-[90px] shrink-0 h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">A → Z</SelectItem>
                    <SelectItem value="desc">Z → A</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive shrink-0"
                  onClick={() => removeSort(rule.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
          {sorts.length < fields.length && (
            <Button onClick={addSort} variant="outline" size="sm" className="w-full mt-1">
              <PlusIcon className="h-4 w-4 mr-1" />
              Sort qo'shish
            </Button>
          )}
        </>
      )}
    </div>
  );
}

// ── AIToolParamConfigWidget ───────────────────────────────────────────────────
// Engine kontrakt: data.paramConfig = { "<param>": { source, value, aiDescription } }
// Param paramConfig'da yo'q → default (AI, schema desc).
//
// Parametr manbalari:
//   - Static tool'lar (payment_link, payment_status): STATIC_TOOL_PARAMS map
//   - Modul tool'lar: data.parametersSchema.properties (manifest defaults orqali keladi)

interface AiToolParamDef {
  key: string;
  label: string;
  type: string;
  description?: string;
}

interface AiToolParamConfigEntry {
  source: "ai" | "fixed";
  value: string;
  aiDescription: string;
}

type KanbanField = { key: string; label: string; type?: string; description?: string; required?: boolean };
type KanbanFieldEntry = { source: "ai" | "fixed"; value: string; aiDescription: string };

/**
 * AI Kanban tool configuration. Board metadata is deliberately fetched only
 * after a board is selected: the board list stays fast, while its custom
 * fields are always current.
 */
function AIKanbanToolConfigWidget({ nodeId, data }: WidgetProps) {
  const updateNodeData = useFlowStore((s) => s.updateNodeData);
  const projectId = useProjectStore((s) => s.project?.id);
  const [fieldSchema, setFieldSchema] = useState<KanbanField[]>([]);
  const [loadingFields, setLoadingFields] = useState(false);
  const boardId = typeof data.boardId === "string" ? data.boardId : "";
  const titleConfig = (data.titleConfig ?? { source: "ai", value: "", aiDescription: "" }) as KanbanFieldEntry;
  const descriptionConfig = (data.descriptionConfig ?? { source: "ai", value: "", aiDescription: "" }) as KanbanFieldEntry;
  const customFieldConfig = (data.customFieldConfig ?? {}) as Record<string, KanbanFieldEntry>;

  useEffect(() => {
    if (!boardId) { setFieldSchema([]); return; }
    let active = true;
    setLoadingFields(true);
    instanceAuth.get<{ field_schema?: unknown }>(`/boards/${boardId}`).then((response) => {
      if (!active) return;
      const raw = response.data.field_schema;
      const fields = Array.isArray(raw) ? raw : raw && typeof raw === "object" && Array.isArray((raw as { fields?: unknown[] }).fields) ? (raw as { fields: unknown[] }).fields : [];
      setFieldSchema(fields.flatMap((item) => {
        if (!item || typeof item !== "object") return [];
        const field = item as Record<string, unknown>;
        const key = String(field.key ?? field.name ?? "").trim();
        return key ? [{ key, label: String(field.label ?? field.name ?? key), type: typeof field.type === "string" ? field.type : "string", description: typeof field.description === "string" ? field.description : undefined, required: field.required === true }] : [];
      }));
    }).catch(() => { if (active) setFieldSchema([]); }).finally(() => { if (active) setLoadingFields(false); });
    return () => { active = false; };
  }, [boardId, projectId]);

  const write = (patch: Record<string, unknown>) => updateNodeData(nodeId, patch);
  const setConfig = (key: string, entry: KanbanFieldEntry) => write({ [key]: entry });
  const renderConfig = (key: "titleConfig" | "descriptionConfig", label: string, multiline = false) => {
    const entry = key === "titleConfig" ? titleConfig : descriptionConfig;
    const fixed = entry.source === "fixed";
    return <div className="grid gap-1.5 rounded-md border border-white/[0.07] bg-white/[0.02] p-2">
      <div className="flex items-center justify-between gap-2"><Label className="text-xs">{label}</Label><div className="flex overflow-hidden rounded border border-white/[0.08]">
        {(["fixed", "ai"] as const).map((source) => <button key={source} type="button" onClick={() => setConfig(key, { ...entry, source })} className={cn("px-2 py-0.5 text-[10px]", entry.source === source ? (source === "fixed" ? "bg-amber-500/20 text-amber-300" : "bg-blue-500/20 text-blue-300") : "text-zinc-500")}>{source === "fixed" ? "Static" : "AI izohi"}</button>)}
      </div></div>
      {fixed ? <Input className="h-8 text-xs" placeholder="{{message_text}}" value={entry.value} onChange={(e) => setConfig(key, { ...entry, value: e.target.value })} /> : <Textarea className="min-h-[52px] text-xs" rows={multiline ? 2 : 1} placeholder="AI bu qiymatni qanday tanlashini yozing" value={entry.aiDescription} onChange={(e) => setConfig(key, { ...entry, aiDescription: e.target.value })} />}
    </div>;
  };

  return <div className="grid gap-3">
    <div className="grid gap-1.5"><Label className="text-xs">Tool tavsifi (LLM uchun)</Label><Textarea className="min-h-[56px] text-xs" rows={2} placeholder="Qachon karta yaratish kerakligini yozing" value={typeof data.description === "string" ? data.description : ""} onChange={(e) => write({ description: e.target.value })} /></div>
    <div className="rounded-md border border-primary/20 bg-primary/[0.04] p-2 text-[11px] text-muted-foreground">Kanban karta aynan tanlangan board va ustunga yoziladi. Boardni tanlaganingizdan keyin uning qo‘shimcha fieldlari yuklanadi.</div>

    {renderConfig("titleConfig", "Karta sarlavhasi")}
    {renderConfig("descriptionConfig", "Karta tavsifi", true)}
    {loadingFields ? <div className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Qo‘shimcha fieldlar yuklanmoqda…</div> : fieldSchema.length > 0 ? <div className="grid gap-2"><Label className="text-xs text-muted-foreground">Board qo‘shimcha fieldlari</Label>{fieldSchema.map((field) => { const entry = customFieldConfig[field.key] ?? { source: "ai" as const, value: "", aiDescription: field.description ?? "" }; const fixed = entry.source === "fixed"; return <div key={field.key} className="grid gap-1.5 rounded-md border border-white/[0.07] p-2"><div className="flex items-center justify-between gap-2"><span className="text-xs font-medium">{field.label}{field.required ? " *" : ""}</span><div className="flex overflow-hidden rounded border border-white/[0.08]"><button type="button" onClick={() => write({ customFieldConfig: { ...customFieldConfig, [field.key]: { ...entry, source: "fixed" } } })} className={cn("px-2 py-0.5 text-[10px]", fixed ? "bg-amber-500/20 text-amber-300" : "text-zinc-500")}>Static</button><button type="button" onClick={() => write({ customFieldConfig: { ...customFieldConfig, [field.key]: { ...entry, source: "ai" } } })} className={cn("px-2 py-0.5 text-[10px]", !fixed ? "bg-blue-500/20 text-blue-300" : "text-zinc-500")}>AI izohi</button></div></div>{fixed ? <Input className="h-8 text-xs" value={entry.value} placeholder={field.type ?? "Qiymat"} onChange={(e) => write({ customFieldConfig: { ...customFieldConfig, [field.key]: { ...entry, value: e.target.value } } })} /> : <Textarea className="min-h-[48px] text-xs" rows={2} value={entry.aiDescription} placeholder="AI bu fieldni qanday to‘ldirishini yozing" onChange={(e) => write({ customFieldConfig: { ...customFieldConfig, [field.key]: { ...entry, aiDescription: e.target.value } } })} />}</div>; })}</div> : boardId ? <div className="text-xs text-muted-foreground">Bu boardda qo‘shimcha field yo‘q.</div> : null}
  </div>;
}

const STATIC_TOOL_PARAMS: Record<string, AiToolParamDef[]> = {
  payment_link: [
    { key: "amount",      label: "To'lov summasi", type: "number",  description: "Payment amount in UZS" },
    { key: "description", label: "Izoh",           type: "string",  description: "Payment description" },
  ],
  payment_status: [
    { key: "order_id", label: "Order ID", type: "integer", description: "The order ID to check status for" },
  ],
};

function googleSheetsParams(operation: string): AiToolParamDef[] {
  const range: AiToolParamDef = {
    key: "range",
    label: "Range",
    type: "string",
    description: "A1 notation range, for example A1:D10. Leave empty to use the selected tab.",
  };
  const values: AiToolParamDef = {
    key: "values",
    label: "Qiymatlar",
    type: "array",
    description: "Rows as a two-dimensional JSON array, for example [[\"Ali\", \"+998...\"]].",
  };
  if (operation === "append") return [range, values];
  if (operation === "update") return [range, values];
  if (operation === "clear") return [range];
  return [range];
}

function parseSchemaToParamDefs(schema: unknown): AiToolParamDef[] {
  const s = schema as Record<string, unknown> | undefined;
  if (!s || typeof s !== "object") return [];
  const properties = s.properties as Record<string, Record<string, unknown>> | undefined;
  if (!properties) return [];
  return Object.entries(properties).map(([key, prop]) => ({
    key,
    label: typeof prop.title === "string" ? prop.title : key,
    type:  typeof prop.type  === "string" ? prop.type  : "string",
    description: typeof prop.description === "string" ? prop.description : undefined,
  }));
}

function AIToolParamConfigWidget({ nodeId, data }: WidgetProps) {
  const updateNodeData = useFlowStore((s) => s.updateNodeData);
  const nodes = useFlowStore((s) => s.nodes);
  const t = useTranslations("constructor.ai.paramConfig");
  const tRoot = useTranslations();

  const tool = typeof data.tool === "string" ? data.tool : "";

  // The tool's built-in description (from its node manifest) is the default the
  // user starts editing from. Resolved via i18n key with fallback.
  const nodeType = nodes.find((n) => n.id === nodeId)?.type ?? "";
  const manifest = nodeType ? getNodeManifestByType(nodeType) : undefined;
  const defaultToolDescription =
    manifest?.descriptionKey && tRoot.has(manifest.descriptionKey)
      ? tRoot(manifest.descriptionKey)
      : manifest?.descriptionFallback ?? "";
  const toolDescription =
    typeof data.toolDescription === "string" ? data.toolDescription : "";

  // Param definitions: static tools first, then schema-driven (module tools)
  const params: AiToolParamDef[] =
    tool === "google_sheets"
      ? googleSheetsParams(typeof data.operation === "string" ? data.operation : "read")
      : STATIC_TOOL_PARAMS[tool] ?? parseSchemaToParamDefs(data.parametersSchema);

  const paramConfig =
    data.paramConfig && typeof data.paramConfig === "object"
      ? (data.paramConfig as Record<string, AiToolParamConfigEntry>)
      : {};

  function setEntry(key: string, patch: Partial<AiToolParamConfigEntry>) {
    const prev = paramConfig[key] ?? { source: "ai" as const, value: "", aiDescription: "" };
    updateNodeData(nodeId, {
      paramConfig: { ...paramConfig, [key]: { ...prev, ...patch } },
    });
  }

  // Seed each AI-filled param's own description as the default aiDescription,
  // so the textarea opens pre-populated (and editable) instead of empty.
  // Runs once per node/tool; skips params that already have a value set.
  useEffect(() => {
    const seed: Record<string, AiToolParamConfigEntry> = {};
    for (const param of params) {
      if (!param.description) continue;
      const entry = paramConfig[param.key];
      const source = entry?.source ?? "ai";
      if (source === "ai" && !entry?.aiDescription) {
        seed[param.key] = {
          source: "ai",
          value: entry?.value ?? "",
          aiDescription: param.description,
        };
      }
    }
    if (Object.keys(seed).length > 0) {
      updateNodeData(nodeId, { paramConfig: { ...paramConfig, ...seed } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodeId, tool, data.operation]);

  // Seed the tool's built-in description as the editable default (once per
  // node/tool, only while empty) so the box opens pre-populated.
  useEffect(() => {
    if (!defaultToolDescription) return;
    if (typeof data.toolDescription === "string" && data.toolDescription.trim() !== "") return;
    updateNodeData(nodeId, { toolDescription: defaultToolDescription });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodeId, tool]);

  return (
    <div className="grid gap-2">
      {/* Tool description — what this tool does, shown to the AI agent */}
      <div className="grid gap-1">
        <Label className="text-xs text-muted-foreground">{t("toolDescriptionLabel")}</Label>
        <Textarea
          className="min-h-[56px] resize-y text-[11px] leading-snug"
          rows={2}
          placeholder={t("toolDescriptionPlaceholder")}
          value={toolDescription}
          onChange={(e) => updateNodeData(nodeId, { toolDescription: e.target.value })}
        />
      </div>

      {params.length > 0 && (
        <Label className="text-xs text-muted-foreground">{t("paramsLabel")}</Label>
      )}
      {params.map((param) => {
        const entry: AiToolParamConfigEntry =
          paramConfig[param.key] ?? { source: "ai", value: "", aiDescription: "" };
        const isFixed = entry.source === "fixed";
        return (
          <div
            key={param.key}
            className="grid gap-1 rounded-md border border-white/[0.07] bg-white/[0.02] px-2 py-1.5"
          >
            {/* Row 1: param label + type badge + source toggle */}
            <div className="flex items-center gap-1.5">
              <span className="truncate text-[11px] font-mono text-zinc-300">{param.label}</span>
              <span
                className="shrink-0 rounded px-1 py-0 text-[9px] text-zinc-500"
                style={{ background: "rgba(255,255,255,0.05)" }}
              >
                {param.type}
              </span>
              {/* Source toggle */}
              <div className="ml-auto flex shrink-0 overflow-hidden rounded border border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setEntry(param.key, { source: "fixed" })}
                  className={cn(
                    "px-2 py-0.5 text-[10px] font-medium transition-colors",
                    isFixed
                      ? "bg-amber-500/20 text-amber-300"
                      : "text-zinc-500 hover:text-zinc-300"
                  )}
                >
                  {t("fixedValue")}
                </button>
                <button
                  type="button"
                  onClick={() => setEntry(param.key, { source: "ai" })}
                  className={cn(
                    "px-2 py-0.5 text-[10px] font-medium transition-colors",
                    !isFixed
                      ? "bg-blue-500/20 text-blue-300"
                      : "text-zinc-500 hover:text-zinc-300"
                  )}
                >
                  {t("aiFills")}
                </button>
              </div>
            </div>

            {/* Row 2: value input (fixed) or ai description input (ai) */}
            {isFixed ? (
              <Input
                className="h-7 text-[11px]"
                placeholder={t("fixedValuePlaceholder")}
                value={entry.value}
                onChange={(e) => setEntry(param.key, { value: e.target.value })}
              />
            ) : (
              <Textarea
                className="min-h-[56px] resize-y text-[11px] leading-snug"
                rows={2}
                placeholder={t("aiDescriptionPlaceholder")}
                value={entry.aiDescription}
                onChange={(e) => setEntry(param.key, { aiDescription: e.target.value })}
              />
            )}
          </div>
        );
      })}
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
  loadCollectionList: LoadCollectionListWidget,
  subFlow: SubFlowWidget,
  aiAgentAdvanced: AIAgentAdvancedWidget,
  aiCollectionToolConfig: AICollectionToolConfigWidget,
  aiKnowledgeToolConfig: AIKnowledgeToolConfigWidget,
  aiKanbanToolConfig: AIKanbanToolConfigWidget,
  aiToolParamConfig: AIToolParamConfigWidget,
};

export function renderCustomWidget(props: WidgetProps) {
  const widgetKey = props.field.widgetKey;
  if (!widgetKey || !widgetRegistry[widgetKey]) {
    return null;
  }

  return widgetRegistry[widgetKey](props);
}
