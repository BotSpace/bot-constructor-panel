"use client";

import { useMemo } from "react";
import { useFlowStore } from "@/features/bot-constructor/store";
import {
  findNearestTriggerNode,
  getDynamicFilters,
} from "@/features/bot-constructor/nodes/bespoke/StateNode/getDynamicFilters";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

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
  const staticValue =
    typeof data.value === "string" ? (data.value as string) : "";
  const isPrivate = data.private === true;

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

      {stateType === "static" ? (
        <div className="grid gap-2">
          <Label>Doimiy qiymat</Label>
          <Input
            className="border-white/10 bg-zinc-950/60"
            value={staticValue}
            onChange={(e) => updateNodeData(nodeId, { value: e.target.value })}
            placeholder="Masalan: premium"
          />
        </div>
      ) : null}

      {/* Private switch */}
      <div className="flex items-center justify-between gap-3 rounded-md border border-white/10 bg-white/[0.02] px-3 py-2">
        <div className="min-w-0">
          <Label className="cursor-pointer text-sm text-zinc-200">
            Maxfiy (private)
          </Label>
          <p className="mt-0.5 text-[11px] leading-relaxed text-zinc-500">
            {isPrivate
              ? `{{private.${stateKey || "key"}}} sifatida o'qiladi`
              : `{{${stateKey || "key"}}} sifatida o'qiladi (public)`}
          </p>
        </div>
        <Switch
          checked={isPrivate}
          onCheckedChange={(checked) =>
            updateNodeData(nodeId, { private: checked })
          }
        />
      </div>
    </div>
  );
}
