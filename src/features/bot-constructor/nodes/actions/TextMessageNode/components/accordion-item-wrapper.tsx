import React, { useMemo } from "react";
import { CollectionDetail, CollectionListItem } from "@/types/http/collection";
import { FilterBuilder } from "../../shared/filter/filter";
import { useReactQueryAction } from "@/services/react-query";
import { APIDetailCreateResponse } from "@/types/http/response";
import { Skeleton } from "@/components/ui/skeleton";
import { useFlowStore } from "@/features/bot-constructor/store";
import { SendTextMessageNodeData } from "../types";
import { Badge } from "@/components/ui/badge";
import { useNodes } from "reactflow";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { DynamicMessage } from "../../shared/types";
import { getAvailableStateKeys } from "@/features/bot-constructor/utils";

type Props = {
  collection: CollectionListItem;
  id: string;
  dynamicMessages: DynamicMessage[];
};

function AccordionItemWrapper({ collection, id, dynamicMessages }: Props) {
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

  // State keys'larni olish (StateNode va Trigger'lardan)
  const nodes = useNodes();
  const availableStateKeys = useMemo(() => {
    return getAvailableStateKeys(nodes);
  }, [nodes]);

  if (!fields) return <Skeleton className="w-full h-10" />;

  // Collection'ga tegishli dynamic message'ni topish
  const currentMessage = dynamicMessages?.find(
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
            dynamicMessages: dynamicMessages?.map((message) =>
              message.collection.id === collection.id
                ? { ...message, filters }
                : message
            ),
          })
        }
        stateKeys={availableStateKeys}
      />

      {/* Pagination Controls */}
      <div className="mt-4 space-y-3 p-4  rounded-lg border">
        <div className="flex items-center justify-between">
          <div>
            <Label
              htmlFor={`pagination-${collection.id}`}
              className="text-sm font-medium"
            >
              Enable Pagination
            </Label>
            <p className="text-xs text-muted-foreground mt-0.5">
              Load data in pages instead of all at once
            </p>
          </div>
          <Switch
            id={`pagination-${collection.id}`}
            checked={currentMessage?.enablePagination ?? false}
            onCheckedChange={(enabled) =>
              handleUpdate({
                dynamicMessages: dynamicMessages?.map((message) =>
                  message.collection.id === collection.id
                    ? {
                        ...message,
                        enablePagination: enabled,
                        limit: enabled ? message.limit || 10 : 0,
                      }
                    : message
                ),
              })
            }
          />
        </div>

        {currentMessage?.enablePagination && (
          <div className="grid grid-cols-2 gap-3 pt-2 border-t animate-in fade-in-50">
            <div className="space-y-1.5">
              <Label
                htmlFor={`limit-${collection.id}`}
                className="text-xs font-medium text-slate-700"
              >
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
                    dynamicMessages: dynamicMessages?.map((message) =>
                      message.collection.id === collection.id
                        ? {
                            ...message,
                            limit: Math.min(Math.max(value, 1), 100),
                          }
                        : message
                    ),
                  });
                }}
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor={`offset-${collection.id}`}
                className="text-xs font-medium text-muted-foreground"
              >
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
                    dynamicMessages: dynamicMessages?.map((message) =>
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
        <Label className="text-xs font-medium mb-2 block">
          Available Variables
        </Label>
        <div className="flex flex-wrap gap-2">
          {fields.data.fields.map((field) => (
            <Badge
              key={`badge-${field.id}`}
              variant="outline"
              className="font-mono text-xs cursor-pointer  transition-colors"
              onClick={() => {
                // Copy to clipboard
                navigator.clipboard.writeText(
                  `\${${currentMessage?.name}.${field.name}}`
                );
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
    </>
  );
}

export default AccordionItemWrapper;
