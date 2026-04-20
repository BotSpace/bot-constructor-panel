"use client";

import { Button } from "@/components/ui/button";
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
import TelegramRichTextEditor from "@/features/bot-constructor/components/TelegramRichTextEditor/TelegramRichTextEditor";
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
import useProjectStore from "@/features/bot-constructor/store/project";
import { uploadFile } from "@/services/requests/file";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, ListPlus, Loader2, Upload } from "lucide-react";
import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { DynamicMessageConstructor } from "../actions/TextMessageNode/components/dynamic-message-constructor-modal";
import { CodeEditorDialog } from "../custom/CustomCodeNode/components/CodeEditorDialog";
import AddItemModal from "../custom/FormNode/components/add-item-modal";
import { FormItem } from "../custom/FormNode/components/form-item";
import { getAvailableStateKeys } from "@/features/bot-constructor/utils";
import { APIDetailCreateResponse, APIListResponse } from "@/types/http/response";
import { CollectionDetail, CollectionListItem } from "@/types/http/collection";
import { NodeFieldManifest } from "./types";
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

interface WidgetProps {
  nodeId: string;
  data: Record<string, unknown>;
  field: NodeFieldManifest;
}

type MediaKind = "photo" | "video" | "audio" | "file";
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
    if (!keyboard?.inline) return [];

    return keyboard.inline.flat().flatMap((button: any) => {
      if (button.type === "callback" && button.value && !button.collectionData) {
        return [{
          id: button.id,
          text: button.text,
          value: button.value,
          isCollection: false,
        }];
      }

      if (button.collectionData) {
        const { collection, text } = button.collectionData;
        return [{
          id: button.id,
          text: button.text.replace("📦 ", ""),
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
  };

  return (
    <div className="space-y-3">
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

function RichTextMessageEditor({
  nodeId,
  value,
  onValueChange,
  dynamicMessages,
  intro,
  label,
  parseMode,
  onParseModeChange,
}: {
  nodeId: string;
  value?: string;
  onValueChange: (nextValue: string) => void;
  dynamicMessages?: unknown;
  intro?: string;
  label: string;
  parseMode?: string;
  onParseModeChange?: (nextValue: "None" | "HTML") => void;
}) {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);

  return (
    <div className="grid gap-3">
      {intro ? (
        <div className="rounded-md bg-muted/50 px-2 py-1.5 text-xs text-muted-foreground">
          {intro}
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-2">
        <Label>{label}</Label>
        <DynamicMessageConstructor
          handleUpdate={(update) => updateNodeData(nodeId, update)}
          initialDynamicMessages={dynamicMessages as any}
          id={nodeId}
        >
          <Button size="icon-sm" variant="outline">
            <ListPlus />
          </Button>
        </DynamicMessageConstructor>
      </div>

      <TelegramRichTextEditor
        defaultValue={value}
        onChange={onValueChange}
      />

      {onParseModeChange ? (
        <div className="grid gap-2">
          <Label>Matn formatlash</Label>
          <Select
            value={parseMode || "None"}
            onValueChange={(nextValue) =>
              onParseModeChange(nextValue as "None" | "HTML")
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Tanlang" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="None">Yo&apos;q</SelectItem>
              <SelectItem value="HTML">HTML</SelectItem>
            </SelectContent>
          </Select>
        </div>
      ) : null}
    </div>
  );
}

function TextMessageWidget({ nodeId, data }: WidgetProps) {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);

  return (
    <RichTextMessageEditor
      nodeId={nodeId}
      value={typeof data.messageText === "string" ? data.messageText : ""}
      dynamicMessages={data.dynamicMessages}
      label="Xabar matni"
      onValueChange={(messageText) => updateNodeData(nodeId, { messageText })}
    />
  );
}

function EditOrSendMessageWidget({ nodeId, data }: WidgetProps) {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);

  return (
    <RichTextMessageEditor
      nodeId={nodeId}
      value={typeof data.messageText === "string" ? data.messageText : ""}
      dynamicMessages={data.dynamicMessages}
      intro="Callback bo'lsa xabarni tahrirlaydi, aks holda yangi xabar yuboradi"
      label="Xabar matni"
      onValueChange={(messageText) => updateNodeData(nodeId, { messageText })}
    />
  );
}

function MediaSourceField({
  nodeId,
  data,
  kind,
}: {
  nodeId: string;
  data: Record<string, unknown>;
  kind: MediaKind;
}) {
  const project = useProjectStore((state) => state.project);
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sourceTypeKey =
    kind === "photo"
      ? "photoSourceType"
      : kind === "video"
        ? "videoSourceType"
        : kind === "audio"
          ? "audioSourceType"
          : "fileSourceType";
  const fileIdKey =
    kind === "photo"
      ? "photoFileId"
      : kind === "video"
        ? "videoFileId"
        : kind === "audio"
          ? "audioFileId"
          : "fileId";
  const urlKey =
    kind === "photo"
      ? "photoUrl"
      : kind === "video"
        ? "videoUrl"
        : kind === "audio"
          ? "audioUrl"
          : "fileUrl";
  const sourceType = typeof data[sourceTypeKey] === "string" ? (data[sourceTypeKey] as string) : "upload";

  const labels = {
    photo: {
      title: "Rasm manbasi",
      fileIdPlaceholder: "rasm_fayl_idsi_bu_yerda...",
      urlPlaceholder: "https://example.com/image.jpg",
      accept: "image/*",
      hint: "Rasm fayllari (JPG, PNG, GIF, WebP)",
    },
    video: {
      title: "Video manbasi",
      fileIdPlaceholder: "video_fayl_idsi...",
      urlPlaceholder: "https://example.com/video.mp4",
      accept: "video/*",
      hint: "Video fayllari (MP4, MOV, AVI, WebM)",
    },
    audio: {
      title: "Audio manbasi",
      fileIdPlaceholder: "audio_fayl_idsi...",
      urlPlaceholder: "https://example.com/audio.mp3",
      accept: "audio/*",
      hint: "Audio fayllari (MP3, WAV, OGG, AAC)",
    },
    file: {
      title: "Fayl manbasi",
      fileIdPlaceholder: "fayl_idsi...",
      urlPlaceholder: "https://example.com/document.pdf",
      accept: "*/*",
      hint: "Har qanday fayl turi",
    },
  }[kind];

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadedFileName(file.name);

    try {
      const response = await uploadFile(file, undefined, project?.id);
      updateNodeData(nodeId, { uploadedFileUuid: response.data.uuid });
      setUploadedFileName(file.name);
    } catch {
      setUploadedFileName(null);
      toast.error("Fayl yuklashda xatolik yuz berdi");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="grid gap-2">
      <Label>{labels.title}</Label>
      <Select
        value={sourceType}
        onValueChange={(value) => updateNodeData(nodeId, { [sourceTypeKey]: value })}
      >
        <SelectTrigger>
          <SelectValue placeholder="Manbani tanlang..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="file_id">Mavjud File ID</SelectItem>
          <SelectItem value="url">Internet (URL)</SelectItem>
          <SelectItem value="upload">Kompyuterdan yuklash</SelectItem>
        </SelectContent>
      </Select>

      {sourceType === "file_id" ? (
        <Input
          placeholder={labels.fileIdPlaceholder}
          value={typeof data[fileIdKey] === "string" ? (data[fileIdKey] as string) : ""}
          onChange={(e) => updateNodeData(nodeId, { [fileIdKey]: e.target.value })}
        />
      ) : null}

      {sourceType === "url" ? (
        <Input
          placeholder={labels.urlPlaceholder}
          value={typeof data[urlKey] === "string" ? (data[urlKey] as string) : ""}
          onChange={(e) => updateNodeData(nodeId, { [urlKey]: e.target.value })}
        />
      ) : null}

      {sourceType === "upload" ? (
        <div className="space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept={labels.accept}
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (file) {
                await handleFileUpload(file);
              }
            }}
            className="hidden"
          />

          <div
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDrop={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              const file = e.dataTransfer.files?.[0];
              if (file) {
                await handleFileUpload(file);
              }
            }}
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className={cn(
              "cursor-pointer rounded-lg border-2 border-dashed p-6 transition-colors",
              "hover:border-primary/50 hover:bg-primary/5",
              isUploading && "pointer-events-none opacity-50"
            )}
          >
            <div className="flex flex-col items-center justify-center gap-2 text-center">
              {isUploading ? (
                <>
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm font-medium">Yuklanmoqda...</p>
                </>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      Fayl tanlash yoki bu yerga sudrab tashlang
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {labels.hint}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {uploadedFileName && data.uploadedFileUuid && !isUploading ? (
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
              <CheckCircle2 className="h-4 w-4" />
              <span className="truncate">{uploadedFileName}</span>
            </div>
          ) : null}

          <div className="grid gap-1">
            <Label className="text-xs text-muted-foreground">UUID</Label>
            <Input
              placeholder="UUID ni kiriting yoki fayl yuklang..."
              value={
                typeof data.uploadedFileUuid === "string"
                  ? (data.uploadedFileUuid as string)
                  : ""
              }
              onChange={(e) =>
                updateNodeData(nodeId, { uploadedFileUuid: e.target.value })
              }
              className="text-xs"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function MediaMessageWidget({
  nodeId,
  data,
  kind,
}: {
  nodeId: string;
  data: Record<string, unknown>;
  kind: MediaKind;
}) {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const captionKey = "caption";
  const captionValue = typeof data[captionKey] === "string" ? (data[captionKey] as string) : "";
  const captionLabel =
    kind === "photo"
      ? "Rasm matni (Caption)"
      : kind === "video"
        ? "Video matni (Caption)"
        : kind === "audio"
          ? "Izoh (Caption)"
          : "Izoh (Caption)";

  return (
    <div className="grid gap-4">
      <MediaSourceField nodeId={nodeId} data={data} kind={kind} />

      {kind === "audio" ? (
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label>Ijrochi</Label>
            <Input
              placeholder="Masalan, Yulduz U."
              value={typeof data.performer === "string" ? (data.performer as string) : ""}
              onChange={(e) => updateNodeData(nodeId, { performer: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label>Sarlavha</Label>
            <Input
              placeholder="Masalan, Xasta bo'lma"
              value={typeof data.title === "string" ? (data.title as string) : ""}
              onChange={(e) => updateNodeData(nodeId, { title: e.target.value })}
            />
          </div>
        </div>
      ) : null}

      <div className="grid gap-2">
        <Label>{captionLabel}</Label>
        {kind === "file" ? (
          <Textarea
            className="min-h-[90px]"
            maxLength={1024}
            placeholder="Fayl uchun izoh..."
            value={captionValue}
            onChange={(e) => updateNodeData(nodeId, { caption: e.target.value })}
          />
        ) : (
          <TelegramRichTextEditor
            defaultValue={captionValue}
            onChange={(caption) => updateNodeData(nodeId, { caption })}
          />
        )}
        <div
          className={cn(
            "text-right text-xs",
            captionValue.length > 1024
              ? "text-destructive"
              : "text-muted-foreground"
          )}
        >
          {captionValue.length}/1024
        </div>
      </div>
    </div>
  );
}

function SendPhotoWidget(props: WidgetProps) {
  return <MediaMessageWidget nodeId={props.nodeId} data={props.data} kind="photo" />;
}

function SendVideoWidget(props: WidgetProps) {
  return <MediaMessageWidget nodeId={props.nodeId} data={props.data} kind="video" />;
}

function SendAudioWidget(props: WidgetProps) {
  return <MediaMessageWidget nodeId={props.nodeId} data={props.data} kind="audio" />;
}

function SendFileWidget(props: WidgetProps) {
  return <MediaMessageWidget nodeId={props.nodeId} data={props.data} kind="file" />;
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
        <RichTextMessageEditor
          nodeId={nodeId}
          value={typeof data.newText === "string" ? data.newText : ""}
          dynamicMessages={data.dynamicMessages}
          label="Yangi matn"
          parseMode={typeof data.parseMode === "string" ? data.parseMode : "None"}
          onParseModeChange={(parseMode) => updateNodeData(nodeId, { parseMode })}
          onValueChange={(newText) => updateNodeData(nodeId, { newText })}
        />
      ) : (
        <RichTextMessageEditor
          nodeId={nodeId}
          value={typeof data.newCaption === "string" ? data.newCaption : ""}
          dynamicMessages={data.dynamicMessages}
          label="Yangi caption"
          parseMode={typeof data.parseMode === "string" ? data.parseMode : "None"}
          onParseModeChange={(parseMode) => updateNodeData(nodeId, { parseMode })}
          onValueChange={(newCaption) => updateNodeData(nodeId, { newCaption })}
        />
      )}
    </div>
  );
}

function DeleteMessageWidget({ nodeId, data }: WidgetProps) {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const nodes = useFlowStore((state) => state.nodes);
  const edges = useFlowStore((state) => state.edges);

  const connectedMessageNode = useMemo(() => {
    const deleteHandlerEdge = edges.find(
      (edge) =>
        edge.source === nodeId && edge.sourceHandle === "delete-message-source"
    );
    if (!deleteHandlerEdge) return null;

    return nodes.find((node) => node.id === deleteHandlerEdge.target) || null;
  }, [edges, nodeId, nodes]);

  const deleteFromContext = Boolean(data.deleteFromContext);
  const isConfigured = deleteFromContext || Boolean(connectedMessageNode);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Label>Contextdan xabarni o&apos;chirish</Label>
        <Checkbox
          checked={deleteFromContext}
          onCheckedChange={(checked) =>
            updateNodeData(nodeId, { deleteFromContext: Boolean(checked) })
          }
        />
      </div>

      {!deleteFromContext ? (
        connectedMessageNode ? (
          <div className="flex items-center gap-2 rounded-md bg-green-50 p-2 text-sm text-green-600">
            <AlertCircle className="h-4 w-4" />
            <span>Xabar ulangan: {connectedMessageNode.type}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-md bg-muted/50 p-2 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            <span>O&apos;chiriladigan xabarni edge orqali ulang</span>
          </div>
        )
      ) : null}

      {!isConfigured ? (
        <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span>Context yoki edge orqali xabar tanlanishi kerak</span>
        </div>
      ) : null}
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

function ElseWidget() {
  return (
    <div className="rounded-md border bg-muted/30 p-3 text-center text-sm text-muted-foreground">
      If yoki Else If shartlari bajarilmasa, bu yo&apos;nalish ishga tushadi.
    </div>
  );
}

function ForLoopWidget({ nodeId, data }: WidgetProps) {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  return (
    <div className="grid gap-3">
      <div className="grid gap-2">
        <Label>Ro&apos;yxat (dataKey)</Label>
        <Input
          placeholder="{{users}} yoki {{items}}"
          value={typeof data.dataKey === "string" ? (data.dataKey as string) : ""}
          onChange={(e) => updateNodeData(nodeId, { dataKey: e.target.value })}
        />
      </div>
      <div className="grid gap-2">
        <Label>Element o&apos;zgaruvchisi</Label>
        <Input
          placeholder="item"
          value={typeof data.itemVariable === "string" ? (data.itemVariable as string) : ""}
          onChange={(e) => updateNodeData(nodeId, { itemVariable: e.target.value })}
        />
      </div>
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
      ...dynamicFilterOptions,
      { value: "__custom__", label: "Custom (o'zingiz kiriting)", group: "Boshqa" },
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
            value === "__custom__"
              ? updateNodeData(nodeId, { type: "__custom__", customType: data.customType || "" })
              : updateNodeData(nodeId, { type: value, customType: undefined })
          }
          placeholder="Ma'lumot turini tanlang..."
          searchPlaceholder="Qidirish..."
          emptyText="Hech narsa topilmadi"
          triggerClassName="h-9 text-sm"
        />
      </div>
      {data.type === "__custom__" ? (
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

const widgetRegistry: Record<string, (props: WidgetProps) => ReactNode> = {
  messageTrigger: MessageTriggerWidget,
  callbackQueryTrigger: CallbackQueryTriggerWidget,
  replyButtonTrigger: ReplyButtonTriggerWidget,
  cronTrigger: CronTriggerWidget,
  buttonGenerator: ButtonGeneratorWidget,
  downloadFile: DownloadFileWidget,
  httpRequest: HTTPRequestWidget,
  textMessage: TextMessageWidget,
  photoMessage: SendPhotoWidget,
  videoMessage: SendVideoWidget,
  audioMessage: SendAudioWidget,
  fileMessage: SendFileWidget,
  editOrSendMessage: EditOrSendMessageWidget,
  editMessage: EditMessageWidget,
  deleteMessage: DeleteMessageWidget,
  ifCondition: IfConditionWidget,
  elseIf: ElseIfWidget,
  else: ElseWidget,
  forLoop: ForLoopWidget,
  checkMembership: CheckMembershipWidget,
  pollMessage: PollWidget,
  mediaGroup: MediaGroupWidget,
  stateNode: StateWidget,
  customCode: CustomCodeWidget,
  formNode: FormWidget,
};

export function renderCustomWidget(props: WidgetProps) {
  const widgetKey = props.field.widgetKey;
  if (!widgetKey || !widgetRegistry[widgetKey]) {
    return null;
  }

  return widgetRegistry[widgetKey](props);
}
