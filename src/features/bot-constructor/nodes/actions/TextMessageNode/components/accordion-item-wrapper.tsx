import React, { useMemo } from "react";
import { CollectionDetail, CollectionListItem } from "@/types/http/collection";
import { FilterBuilder } from "./filter/filter";
import { useReactQueryAction } from "@/services/react-query";
import { APIDetailCreateResponse } from "@/types/http/response";
import { Skeleton } from "@/components/ui/skeleton";
import { useFlowStore } from "@/features/bot-constructor/store";
import { SendTextMessageNodeData } from "../types";
import { Badge } from "@/components/ui/badge";
import TelegramEditor from "@/features/bot-constructor/components/RichTextEditor/editor/TelegramEditor";
import { useNodes } from "reactflow";
import { StateNodeData } from "@/features/bot-constructor/nodes/custom/StateNode/types";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";

type Props = {
  collection: CollectionListItem;
  data: SendTextMessageNodeData;
  id: string;
};

function AccordionItemWrapper({ data, collection, id }: Props) {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  // Ma'lumotlarni global store'da yangilash uchun markaziy funksiya
  const handleUpdate = (update: Partial<SendTextMessageNodeData>) => {
    updateNodeData(id, update);
  };

  const { data: fields } = useReactQueryAction<
    APIDetailCreateResponse<CollectionDetail>
  >({
    url: `collection/${collection.name}/?project=[id]`,
  });

  // State keys'larni olish
  const nodes = useNodes();
  const availableStateKeys = useMemo(() => {
    const stateKeys = new Set<string>();
    nodes.forEach((node) => {
      if (node.type === "StateNode") {
        const nodeData = node.data as StateNodeData;
        if (nodeData.key && nodeData.key.trim() !== "") {
          stateKeys.add(nodeData.key);
        }
      }
    });
    return Array.from(stateKeys).sort();
  }, [nodes]);

  if (!fields) return <Skeleton className="w-full h-10" />;

  // Collection'ga tegishli dynamic message'ni topish
  const currentMessage = data.dynamicMessages?.find(
    (message) => message.collection.id === collection.id
  );

  return (
    <>
      <FilterBuilder
        key={`filter-builder-${collection.id}`}
        fields={fields.data.fields.map((field) => ({
          id: field.name, // Field nomini id sifatida ishlatish
          label: field.name,
          type: field.type,
        }))}
        filters={currentMessage?.filters ?? []}
        onChange={(filters) =>
          handleUpdate({
            dynamicMessages: data.dynamicMessages?.map((message) =>
              message.collection.id === collection.id
                ? { ...message, filters }
                : message
            ),
          })
        }
        stateKeys={availableStateKeys}
      />

      {/* Pagination Controls */}
      <div className="mt-4 space-y-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor={`pagination-${collection.id}`} className="text-sm font-medium text-slate-900">
              Enable Pagination
            </Label>
            <p className="text-xs text-slate-500 mt-0.5">
              Load data in pages instead of all at once
            </p>
          </div>
          <Switch
            id={`pagination-${collection.id}`}
            checked={currentMessage?.enablePagination ?? false}
            onCheckedChange={(enabled) =>
              handleUpdate({
                dynamicMessages: data.dynamicMessages?.map((message) =>
                  message.collection.id === collection.id
                    ? { ...message, enablePagination: enabled, limit: enabled ? (message.limit || 10) : 0 }
                    : message
                ),
              })
            }
          />
        </div>
        
        {currentMessage?.enablePagination && (
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200 animate-in fade-in-50">
            <div className="space-y-1.5">
              <Label htmlFor={`limit-${collection.id}`} className="text-xs font-medium text-slate-700">
                Items per page
              </Label>
              <Input
                id={`limit-${collection.id}`}
                type="number"
                min="1"
                max="100"
                value={currentMessage?.limit || 10}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 10;
                  handleUpdate({
                    dynamicMessages: data.dynamicMessages?.map((message) =>
                      message.collection.id === collection.id
                        ? { ...message, limit: Math.min(Math.max(value, 1), 100) }
                        : message
                    ),
                  });
                }}
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`offset-${collection.id}`} className="text-xs font-medium text-slate-700">
                Start from (offset)
              </Label>
              <Input
                id={`offset-${collection.id}`}
                type="number"
                min="0"
                value={currentMessage?.offset || 0}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  handleUpdate({
                    dynamicMessages: data.dynamicMessages?.map((message) =>
                      message.collection.id === collection.id
                        ? { ...message, offset: Math.max(value, 0) }
                        : message
                    ),
                  });
                }}
                className="h-9"
              />
            </div>
          </div>
        )}
      </div>

      <div className="mt-4">
        <Label className="text-xs font-medium text-slate-700 mb-2 block">Available Variables</Label>
        <div className="flex flex-wrap gap-2">
          {fields.data.fields.map((field) => (
            <Badge
              key={`badge-${field.id}`}
              variant="outline"
              className="font-mono text-xs cursor-pointer hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors bg-slate-50 border-slate-300"
              onClick={() => {
                // Copy to clipboard
                navigator.clipboard.writeText(`\${${currentMessage?.name}.${field.name}}`);
              }}
              title={`Click to copy: \${${currentMessage?.name}.${field.name}}`}
            >
              ${currentMessage?.name}.{field.name}
            </Badge>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Click any variable to copy it to clipboard
        </p>
      </div>

      <TelegramEditor
        initialData={currentMessage?.messageText}
        onSave={(editorData) =>
          handleUpdate({
            dynamicMessages: data.dynamicMessages?.map((message) =>
              message.collection.id === collection.id
                ? { ...message, messageText: editorData }
                : message
            ),
          })
        }
        data={data}
      />
    </>
  );
}

export default AccordionItemWrapper;
