"use client";

import { useMemo } from "react";
import { useFlowStore } from "@/features/bot-constructor/store";
import {
  findNearestTriggerNode,
  getDynamicFilters,
} from "@/features/bot-constructor/nodes/custom/StateNode/getDynamicFilters";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface StateTypeSelectFieldDef {
  type: "state-type-select";
  keyField?: string;
  typeField?: string;
  label?: string;
}

interface StateTypeSelectFieldProps {
  nodeId: string;
  data: Record<string, unknown>;
  field: StateTypeSelectFieldDef;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function StateTypeSelectField({
  nodeId,
  data,
  field,
}: StateTypeSelectFieldProps) {
  const updateNodeData = useFlowStore((s) => s.updateNodeData);
  const nodes = useFlowStore((s) => s.nodes);
  const edges = useFlowStore((s) => s.edges);

  const keyField = field.keyField ?? "key";
  const typeField = field.typeField ?? "type";

  const triggerNode = useMemo(
    () => findNearestTriggerNode(nodeId, nodes, edges),
    [nodeId, nodes, edges]
  );

  const comboboxOptions = useMemo(() => {
    const dynamicOptions = getDynamicFilters(triggerNode);
    return [
      { value: "Custom", label: "Custom (o'zingiz kiriting)", group: "Boshqa" },
      ...dynamicOptions,
    ];
  }, [triggerNode]);

  const stateKey =
    typeof data[keyField] === "string" ? (data[keyField] as string) : "";
  const stateType =
    typeof data[typeField] === "string" ? (data[typeField] as string) : "";
  const customType =
    typeof data.customType === "string" ? (data.customType as string) : "";

  return (
    <div className="grid gap-3">
      {/* Trigger badge / warning */}
      {triggerNode ? (
        <div className="rounded-md border border-purple-500/20 bg-purple-500/10 px-2.5 py-1.5 text-xs text-purple-300">
          {String(triggerNode.type).replace("Node", "")}
        </div>
      ) : (
        <div className="rounded-md border border-amber-500/20 bg-amber-500/10 px-2.5 py-1.5 text-xs text-amber-300">
          Trigger node ulanmagan
        </div>
      )}

      {/* State key input */}
      <div className="grid gap-2">
        <Label>{field.label ?? "State Key"}</Label>
        <Input
          className="border-white/10 bg-zinc-950/60"
          value={stateKey}
          onChange={(e) => updateNodeData(nodeId, { [keyField]: e.target.value })}
        />
      </div>

      {/* Type combobox */}
      <div className="grid gap-2">
        <Label>Saqlanadigan ma&apos;lumot</Label>
        <Combobox
          options={comboboxOptions}
          value={stateType}
          onValueChange={(value) =>
            value === "Custom"
              ? updateNodeData(nodeId, {
                  [typeField]: "Custom",
                  customType: data.customType ?? "",
                })
              : updateNodeData(nodeId, {
                  [typeField]: value,
                  customType: undefined,
                })
          }
          placeholder="Ma'lumot turini tanlang..."
          searchPlaceholder="Qidirish..."
          emptyText="Hech narsa topilmadi"
          triggerClassName="h-9 border-white/10 bg-zinc-950/60 text-sm"
        />
      </div>

      {/* Custom type input */}
      {stateType === "Custom" ? (
        <div className="grid gap-2">
          <Label>Custom Type</Label>
          <Input
            className="border-white/10 bg-zinc-950/60"
            value={customType}
            onChange={(e) =>
              updateNodeData(nodeId, { customType: e.target.value })
            }
          />
        </div>
      ) : null}
    </div>
  );
}
