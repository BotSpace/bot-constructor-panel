"use client";

import React, { useEffect, useMemo } from "react";
import { useNodeExpanded } from "@/features/bot-constructor/hooks/useNodeCollapsed";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Database, ChevronDown, ArrowRight, Key } from "lucide-react";
import {
  APIDetailCreateResponse,
  APIListResponse,
} from "@/types/http/response";
import { useReactQueryAction } from "@/services/react-query/use-react-query-action";
import { CollectionDetail, CollectionListItem } from "@/types/http/collection";
import { NodeProps, useNodes, useEdges } from "reactflow";

import { CollectionNodeData } from "./types";
import { useFlowStore } from "@/features/bot-constructor/store";
import { SourceHandles, TargetHandles } from "../../components";
import { getAvailableStateKeys } from "@/features/bot-constructor/utils";

export function CollectionNode({
  id,
  data,
  selected,
}: NodeProps<CollectionNodeData>) {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const nodes = useNodes();
  const edges = useEdges();
  const [isExpanded, setIsExpanded] = useNodeExpanded();

  const { data: Collections } = useReactQueryAction<
    APIListResponse<CollectionListItem[]>
  >({
    url: "collection/?project=[id]",
    enabled: true,
  });

  const { data: CollectionData } = useReactQueryAction<
    APIDetailCreateResponse<CollectionDetail>
  >({
    url: `collection/${data.collection_name}/?project=[id]`,
    enabled: !!data.collection_name,
  });

  // Collection o'zgarganda fieldMappings'ni tozalash
  useEffect(() => {
    if (data.collection_name && CollectionData?.data) {
      const fields = CollectionData.data.fields;
      const currentMappings = data.fieldMappings || {};
      const newMappings: Record<string, string> = {};

      // Har bir field uchun default state key yaratish
      fields.forEach((field) => {
        if (currentMappings[field.name]) {
          newMappings[field.name] = currentMappings[field.name];
        } else {
          newMappings[field.name] = field.name; // Default: field nomi
        }
      });

      // Faqat o'zgarish bo'lsa yangilash
      const hasChanges =
        fields.some((field) => !currentMappings[field.name]) ||
        Object.keys(currentMappings).some(
          (key) => !fields.find((f) => f.name === key)
        );

      if (hasChanges) {
        updateNodeData(id, { fieldMappings: newMappings });
      }
    }
  }, [data.collection_name, CollectionData?.data?.id, id, updateNodeData]);

  // Field mappings'ni olish
  const fieldMappings = data.fieldMappings || {};

  // Mavjud StateNode'lardan va Trigger'lardan state key'larni olish (faqat zanjiriga ulangan)
  const availableStateKeys = useMemo(() => {
    return getAvailableStateKeys(nodes, edges, id);
  }, [nodes, edges, id]);

  // State key o'zgartirish
  const handleStateKeyChange = (fieldName: string, stateKey: string) => {
    updateNodeData(id, {
      fieldMappings: {
        ...fieldMappings,
        [fieldName]: stateKey,
      },
    });
  };

  // Collection sozlanganligini tekshirish
  const isConfigured = useMemo(() => {
    if (!data.collection_name || !CollectionData?.data) return false;
    const fields = CollectionData.data.fields;
    return fields.every((field) => {
      const stateKey = fieldMappings[field.name];
      return stateKey && stateKey.trim() !== "";
    });
  }, [data.collection_name, CollectionData?.data, fieldMappings]);

  return (
    <Card
      className={`w-[600px] rounded-xl border shadow-lg transition-all overflow-hidden ${selected
        ? "border-sky-500/80 shadow-xl shadow-sky-500/10 ring-2 ring-sky-500/20"
        : "border-gray-700/50 shadow-md"
        }`}
    >
      <TargetHandles />

      <CardHeader className="pb-3 px-6 pt-6">
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm flex items-center justify-between cursor-pointer group rounded-lg p-2 -m-2 hover:bg-gray-800/50 transition-colors"
        >
          <div className="flex items-center gap-2 flex-1">
            <Database className="h-4 w-4 text-purple-400 flex-shrink-0" />
            <span className="font-medium text-gray-200">Collection</span>
            {data.collection_name && (
              <Badge
                variant="secondary"
                className="border-gray-600/50 text-xs px-1.5 py-0"
              >
                {data.collection_name}
              </Badge>
            )}
            {CollectionData?.data && (
              <Badge
                variant="outline"
                className="border-blue-500/50 text-blue-400 text-xs px-1.5 py-0"
              >
                {CollectionData.data.fields.length} fields
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 ml-2">
            <div
              className={`w-2 h-2 rounded-full transition-all ${isConfigured
                ? "bg-green-500 shadow-sm shadow-green-500/50"
                : "bg-gray-600"
                }`}
              title={isConfigured ? "Sozlangan" : "Sozlanmagan"}
            />
            <ChevronDown
              className={`h-4 w-4 text-gray-400 transform transition-transform duration-200 ${isExpanded ? "rotate-0" : "-rotate-90"
                }`}
            />
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="px-6 pb-6 pt-0 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-400 flex items-center gap-1.5 font-medium">
              <Database className="h-3 w-3" />
              Collection
            </Label>
            <Select
              value={data.collection_name || ""}
              onValueChange={(value) => {
                updateNodeData(id, {
                  collection_name: value,
                  fieldMappings: {},
                });
              }}
            >
              <SelectTrigger className="w-full bg-gray-800/50 border-gray-600/50 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all">
                <SelectValue placeholder="Collection tanlang" />
              </SelectTrigger>
              <SelectContent className="border-gray-700/50">
                {Collections?.data.results.map((collection) => (
                  <SelectItem
                    key={collection.id}
                    value={collection.name}
                    className="focus:bg-gray-800/50 focus:text-purple-400 cursor-pointer"
                  >
                    {collection.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {CollectionData?.data && CollectionData.data.fields.length > 0 && (
            <div className="space-y-3 pt-2">
              <Label className="text-xs text-gray-400 font-medium flex items-center gap-1.5">
                <Key className="h-3 w-3" />
                Field Mappings
              </Label>
              <div className="space-y-3 overflow-y-auto pr-1">
                {CollectionData.data.fields.map((field) => (
                  <div
                    key={field.id}
                    className="bg-gray-800/30 rounded-lg border border-gray-700/50 p-3 hover:bg-gray-800/50 transition-colors"
                  >
                    {/* Key-Value Row */}
                    <div className="flex items-center gap-3">
                      {/* Key Side */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <Badge
                            variant="outline"
                            className="px-2.5 py-1 font-mono text-xs bg-gray-900/50 border-gray-600/50 text-gray-200 font-semibold"
                          >
                            {field.name}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="px-2 py-0.5 text-xs bg-gray-900/50 border-gray-600/50 text-gray-400"
                          >
                            {field.type}
                          </Badge>
                          {field.required && (
                            <Badge
                              variant="outline"
                              className="px-2 py-0.5 text-xs bg-red-500/20 border-red-500/50 text-red-400"
                            >
                              Required
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 font-medium">
                          Field Key
                        </p>
                      </div>

                      {/* Arrow */}
                      <div className="flex-shrink-0 px-2">
                        <ArrowRight className="h-4 w-4 text-gray-500" />
                      </div>

                      {/* Value Side */}
                      <div className="flex-1 min-w-0">
                        <Select
                          value={
                            fieldMappings[field.name] &&
                              availableStateKeys.includes(
                                fieldMappings[field.name]
                              )
                              ? fieldMappings[field.name]
                              : fieldMappings[field.name]
                                ? "custom"
                                : ""
                          }
                          onValueChange={(value) => {
                            if (value === "custom") {
                              handleStateKeyChange(field.name, "");
                            } else {
                              handleStateKeyChange(field.name, value);
                            }
                          }}
                        >
                          <SelectTrigger className="w-full bg-gray-900/50 border-gray-600/50 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all text-sm h-8">
                            <SelectValue placeholder="State key..." />
                          </SelectTrigger>
                          <SelectContent className="border-gray-700/50 max-h-60">
                            {availableStateKeys.map((stateKey) => (
                              <SelectItem
                                key={stateKey}
                                value={stateKey}
                                className="focus:bg-gray-800/50 focus:text-purple-400 cursor-pointer"
                              >
                                {stateKey}
                              </SelectItem>
                            ))}
                            <SelectItem
                              value="custom"
                              className="focus:bg-gray-800/50 focus:text-purple-400 cursor-pointer border-t border-gray-700/50 mt-1 pt-1"
                            >
                              Custom...
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        {/* Custom state key yozish uchun input */}
                        {(!fieldMappings[field.name] ||
                          !availableStateKeys.includes(
                            fieldMappings[field.name]
                          )) && (
                            <Input
                              type="text"
                              placeholder="Custom state key..."
                              value={
                                fieldMappings[field.name] &&
                                  !availableStateKeys.includes(
                                    fieldMappings[field.name]
                                  )
                                  ? fieldMappings[field.name]
                                  : ""
                              }
                              onChange={(e) =>
                                handleStateKeyChange(field.name, e.target.value)
                              }
                              className="w-full bg-gray-900/50 border-purple-500/30 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all text-sm h-8 mt-1.5"
                            />
                          )}
                        <p className="text-xs text-gray-500 font-medium mt-1">
                          State Value
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      )}

      <SourceHandles />
    </Card>
  );
}
