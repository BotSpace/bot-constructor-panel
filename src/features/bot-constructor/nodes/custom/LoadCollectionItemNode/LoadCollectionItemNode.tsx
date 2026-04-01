"use client";

import { memo, useMemo } from "react";
import { NodeProps, Handle, Position } from "reactflow";
import { LoadCollectionItemNodeData } from "./types";
import { Card, CardContent } from "@/components/ui/card";
import { Database } from "lucide-react";
import { useFlowStore } from "@/features/bot-constructor/store";
import { SourceHandles, TargetHandles } from "../../components";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCollectionStore } from "@/features/collections/store/collection-list";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FilterBuilder } from "../../actions/shared/filter/filter";
import { useReactQueryAction } from "@/services/react-query";
import { APIDetailCreateResponse } from "@/types/http/response";
import { CollectionDetail } from "@/types/http/collection";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { NodeHeader } from "../../actions/shared/NodeHeader";
import { getAvailableStateKeys } from "@/features/bot-constructor/utils";

function LoadCollectionItemNode({
  id,
  data,
  selected,
}: NodeProps<LoadCollectionItemNodeData>) {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const { data: collections } = useCollectionStore();

  const handleUpdate = (update: Partial<LoadCollectionItemNodeData>) => {
    updateNodeData(id, update);
  };

  // Get collection fields
  const { data: fields } = useReactQueryAction<
    APIDetailCreateResponse<CollectionDetail>
  >({
    url: data.collection
      ? `collection/${data.collection.name}/?project=[id]`
      : undefined,
    enabled: !!data.collection,
  });

  // Get available state keys (faqat zanjiriga ulangan)
  const nodes = useFlowStore((state) => state.nodes);
  const edges = useFlowStore((state) => state.edges);
  const availableStateKeys = useMemo(() => {
    return getAvailableStateKeys(nodes, edges, id);
  }, [nodes, edges, id]);

  return (
    <>
      <TargetHandles />
      <Card
        className={cn("w-[700px] shadow-lg", selected && "ring-2 ring-primary")}
      >
        <NodeHeader
          icon={<Database className="text-primary" />}
          title="Collectiondan item yuklash"
        />
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            {/* Collection Selection */}
            <div className="space-y-2">
              <Label>Collection</Label>
              <Select

                value={data.collection?.name ?? ""}
                onValueChange={(value) => {
                  const selected = collections?.find((c) => c.name === value);
                  handleUpdate({
                    collection: selected || null,
                    filters: [], // Reset filters when collection changes
                  });
                }}
              >
                <SelectTrigger className="w-[200px]">
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

            {/* Context Key */}
            <div className="space-y-2 w-full">
              <Label>Context Key</Label>
              <Input
                placeholder="e.g., selected_film"
                value={data.contextKey || ""}
                onChange={(e) => handleUpdate({ contextKey: e.target.value })}
                required
              />
              {data.contextKey && data.contextKey.length <= 0 && (
                <p className="text-red-500">Context key must be at least 1 character long</p>
              )}
              <p className="text-xs text-muted-foreground">
                Use: {"{"}
                {"{"}collection.{data.contextKey || "key"}.fieldname{"}}"}
              </p>
            </div>
          </div>

          {/* Filters */}
          {data.collection && fields && (
            <div className="space-y-2">
              <Label>Filters</Label>
              <FilterBuilder
                fields={[
                  // Default _id field
                  {
                    id: "_id",
                    label: "id",
                    type: "text" as const,
                  },
                  // Collection field'lari
                  ...fields.data.fields.map((field) => ({
                    id: field.name,
                    label: field.name,
                    type: field.type,
                  })),
                ]}
                filters={data.filters || []}
                onChange={(filters) => handleUpdate({ filters })}
                stateKeys={availableStateKeys}
              />
            </div>
          )}

          {/* Available Fields */}
          {data.collection && fields && (
            <div className="space-y-2">
              <Label className="text-xs">Available Fields</Label>
              <div className="flex flex-wrap gap-1">
                {fields.data.fields.slice(0, 5).map((field) => (
                  <Badge
                    key={field.id}
                    variant="secondary"
                    className="text-[10px] font-mono cursor-pointer"
                    onClick={() =>
                      navigator.clipboard.writeText(
                        `{{collection_${data.contextKey || "key"}_${field.name
                        }}}`
                      )
                    }
                  >
                    {field.name}
                  </Badge>
                ))}
                {fields.data.fields.length > 5 && (
                  <Badge variant="outline" className="text-[10px]">
                    +{fields.data.fields.length - 5}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Not found - o'ng tomonda (ElseIf/Else ga) */}
      <SourceHandles className="!bg-red-500 translate-y-[-75%]" id="not_found" position={Position.Right} />

      {/* Found - pastda (shart bajarilsa) */}
      <SourceHandles className="translate-y-[75%]" id="found" position={Position.Right} />
    </>
  );
}

export default memo(LoadCollectionItemNode);
