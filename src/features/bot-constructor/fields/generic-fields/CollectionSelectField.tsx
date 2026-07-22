"use client";

import { useEffect, useMemo } from "react";
import { useCollectionStore } from "@/features/collections/store/collection-list";
import { useReactQueryAction } from "@/services/react-query";
import { CollectionDetail } from "@/types/http/collection";
import { getAvailableStateKeys } from "@/features/bot-constructor/lib";
import { FilterBuilder } from "@/features/bot-constructor/nodes/shared/filter/filter";
import { useFlowStore } from "@/features/bot-constructor/store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Key } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CollectionSelectFieldDef {
  type: "collection-select";
  key: string;
  label?: string;
  withFieldMapping?: boolean;
  withFilters?: boolean;
  contextKeyField?: string;
}

interface CollectionSelectFieldProps {
  nodeId: string;
  data: Record<string, unknown>;
  field: CollectionSelectFieldDef;
  /** OVERRIDE: when provided, all writes go through onPatch instead of updateNodeData. */
  onPatch?: (partial: Record<string, unknown>) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CollectionSelectField({
  nodeId,
  data,
  field,
  onPatch,
}: CollectionSelectFieldProps) {
  const updateNodeData = useFlowStore((s) => s.updateNodeData);

  const write = (partial: Record<string, unknown>) => {
    if (onPatch) {
      onPatch(partial);
    } else {
      updateNodeData(nodeId, partial);
    }
  };
  const nodes = useFlowStore((s) => s.nodes);
  const edges = useFlowStore((s) => s.edges);

  const { data: collections } = useCollectionStore();

  // The collection name is stored as a plain string in data[field.key]
  const collectionName =
    typeof data[field.key] === "string" ? (data[field.key] as string) : "";
  const collectionListLoaded = Array.isArray(collections);
  const collectionExists = Boolean(
    collectionName && collections?.some((collection) => collection.name === collectionName)
  );

  const { data: collectionDetail } = useReactQueryAction<CollectionDetail>({
    url: collectionName
      ? `cms/projects/[id]/collections/${collectionName}/`
      : undefined,
    enabled: Boolean(collectionName),
  });

  const availableStateKeys = useMemo(
    () => getAvailableStateKeys(nodes, edges, nodeId),
    [nodes, edges, nodeId]
  );

  // Field mappings — only relevant when withFieldMapping is true
  const fieldMappings =
    field.withFieldMapping &&
    data.fieldMappings &&
    typeof data.fieldMappings === "object"
      ? (data.fieldMappings as Record<string, string>)
      : {};

  // Sync field mappings when collection detail loads (CollectionWidget pattern)
  useEffect(() => {
    if (!field.withFieldMapping) return;
    const fields = collectionDetail?.fields;
    if (!collectionName || !fields) return;

    const nextMappings: Record<string, string> = {};
    fields.forEach((f) => {
      nextMappings[f.name] = fieldMappings[f.name] || f.name;
    });

    const hasChanges =
      fields.some((f) => !fieldMappings[f.name]) ||
      Object.keys(fieldMappings).some(
        (k) => !fields.find((f) => f.name === k)
      );

    if (hasChanges) {
      write({ fieldMappings: nextMappings });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionDetail?.fields, collectionName, nodeId]);

  const handleCollectionChange = (value: string) => {
    const update: Record<string, unknown> = { [field.key]: value };
    if (field.withFieldMapping) {
      update.fieldMappings = {};
    }
    if (field.withFilters) {
      update.filters = [];
    }
    write(update);
  };

  const handleStateKeyChange = (fieldName: string, stateKey: string) => {
    write({
      fieldMappings: { ...fieldMappings, [fieldName]: stateKey },
    });
  };

  // Context key (LoadCollectionItem)
  const contextKeyField = field.contextKeyField ?? "contextKey";
  const contextKeyValue =
    field.withFilters && typeof data[contextKeyField] === "string"
      ? (data[contextKeyField] as string)
      : "";

  return (
    <div className="space-y-4">
      {/* Collection selector */}
      <div className="space-y-1.5">
        <Label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          {field.label ?? "Collection"}
        </Label>
        <Select value={collectionName} onValueChange={handleCollectionChange}>
          <SelectTrigger className="border-white/10 bg-zinc-950/60">
            <SelectValue placeholder="Collection tanlang" />
          </SelectTrigger>
          <SelectContent>
            {collectionName && collectionListLoaded && !collectionExists ? (
              <SelectItem value={collectionName} disabled>
                Noma&apos;lum collection: {collectionName}
              </SelectItem>
            ) : null}
            {collections?.map((c) => (
              <SelectItem key={c.id} value={c.name}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {collectionName && collectionListLoaded && !collectionExists ? (
          <p className="text-xs text-destructive">
            Saqlangan qiymat mavjud collectionlardan biri emas. Ro&apos;yxatdan qayta tanlang.
          </p>
        ) : null}
      </div>

      {/* Context key + Filter builder (LoadCollectionItem) */}
      {field.withFilters ? (
        <>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              Context Key
            </Label>
            <Input
              className="border-white/10 bg-zinc-950/60"
              placeholder="e.g., selected_film"
              value={contextKeyValue}
              onChange={(e) =>
                write({ [contextKeyField]: e.target.value })
              }
            />
            <p className="text-xs text-muted-foreground">
              {`{{collection.${contextKeyValue || "key"}.fieldname}}`}
            </p>
          </div>

          {collectionName && collectionDetail?.fields ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">
                Filters
              </Label>
              <FilterBuilder
                fields={[
                  { id: "_id", label: "id", type: "text" as const },
                  ...collectionDetail.fields.map((f) => ({
                    id: f.name,
                    label: f.label || f.name,
                    type: f.kind as any,
                  })),
                ]}
                filters={Array.isArray(data.filters) ? (data.filters as any) : []}
                onChange={(filters) => write({ filters })}
                stateKeys={availableStateKeys}
              />
            </div>
          ) : null}
        </>
      ) : null}

      {/* Field mappings (CollectionNode) */}
      {field.withFieldMapping && collectionDetail?.fields?.length ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-3">
          <Label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Key className="h-3 w-3" />
            Field Mappings
          </Label>
          {collectionDetail.fields.map((f) => {
            const mapped = fieldMappings[f.name];
            const usesAvailableKey =
              mapped !== undefined && availableStateKeys.includes(mapped);

            return (
              <div
                key={f.id}
                className="rounded-lg border border-white/10 bg-white/[0.02] p-3"
              >
                <div className="flex items-center gap-3">
                  {/* Field info */}
                  <div className="min-w-0 flex-1">
                    <div className="mb-1.5 flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="font-mono text-xs">
                        {f.name}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-xs text-muted-foreground"
                      >
                        {f.kind}
                      </Badge>
                      {f.required ? (
                        <Badge
                          variant="outline"
                          className="text-xs text-red-400"
                        >
                          Required
                        </Badge>
                      ) : null}
                    </div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Field Key
                    </p>
                  </div>

                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />

                  {/* State key selector */}
                  <div className="min-w-0 flex-1">
                    <Select
                      value={
                        usesAvailableKey ? mapped : mapped ? "custom" : ""
                      }
                      onValueChange={(value) =>
                        handleStateKeyChange(
                          f.name,
                          value === "custom" ? "" : value
                        )
                      }
                    >
                      <SelectTrigger className="h-8 border-white/10 bg-zinc-950/60 text-sm">
                        <SelectValue placeholder="State key..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableStateKeys.map((sk) => (
                          <SelectItem key={sk} value={sk}>
                            {sk}
                          </SelectItem>
                        ))}
                        <SelectItem value="custom">Custom...</SelectItem>
                      </SelectContent>
                    </Select>
                    {!mapped || !usesAvailableKey ? (
                      <Input
                        className="mt-1.5 h-8 border-white/10 bg-zinc-950/60 text-sm"
                        placeholder="Custom state key..."
                        value={!usesAvailableKey ? mapped || "" : ""}
                        onChange={(e) =>
                          handleStateKeyChange(f.name, e.target.value)
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
