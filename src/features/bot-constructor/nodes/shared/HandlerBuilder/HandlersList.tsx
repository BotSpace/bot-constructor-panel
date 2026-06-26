"use client";

import React, { useEffect, useMemo } from "react";
import { Position, useUpdateNodeInternals } from "reactflow";
import { useFlowStore } from "@/features/bot-constructor/store";
import { useIsInNodePanel } from "@/features/bot-constructor/hooks/NodePanelContext";
import { Button } from "@/components/ui/button";
import { KeyboardConfig } from "@/features/bot-constructor/panels";
import { PillHandle } from "@/features/bot-constructor/canvas/handles/PillHandle";
import { getNodeKeyboard } from "@/features/bot-constructor/lib/keyboard-compat";
import { canonicalLocalized, localizedToString } from "@/features/bot-constructor/fields/generic-fields/i18n-helpers";

interface HandlersListProps {
  /** Node ID to get handlers from */
  sourceNodeId?: string;

  // Keyboardlarni handler qilish uchun
  keyboard: KeyboardConfig;
}

export function HandlersList({ sourceNodeId, keyboard }: HandlersListProps) {
  const inPanel = useIsInNodePanel();
  const nodes = useFlowStore((state) => state.nodes);
  const defaultLanguage = useFlowStore((state) => state.defaultLanguage);
  const languages = useFlowStore((state) => state.languages);
  const updateNodeInternals = useUpdateNodeInternals();

  // Source node ni topish
  const sourceNode = useMemo(() => {
    return nodes.find((n) => n.id === sourceNodeId);
  }, [nodes, sourceNodeId]);

  // Routable tugmalar ro'yxati — handle chiqaradigan (callback) tugmalar, matn bo'yicha
  // dedup qilingan (faqat birinchi takror handle oladi). Bitta joyda hisoblanadi:
  // ro'yxat ham, handle re-measure ham shundan.
  //
  // canonicalLabel — handle ID uchun ishlatiladi (engine bilan mos, deterministik).
  // displayLabel  — foydalanuvchiga ko'rsatiladigan matn (har qanday til).
  const routableButtons = useMemo(() => {
    const NON_ROUTABLE = ["url", "web_app", "login_url", "switch_inline_query", "switch_inline_query_current_chat"];
    const seenCanonical = new Set<string>();
    const normalized = getNodeKeyboard(sourceNode?.data ?? { keyboard });
    return (normalized[normalized.active] as any[][]) // eslint-disable-line @typescript-eslint/no-explicit-any
      .flat()
      .filter((b: any) => b?.handler !== false && !NON_ROUTABLE.includes(b?.type)) // eslint-disable-line @typescript-eslint/no-explicit-any
      .map((button: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        const fallback = button.collectionData?.collection ?? "";
        const canonicalLabel: string =
          canonicalLocalized(button.text, defaultLanguage, languages) || fallback;
        const displayLabel: string =
          localizedToString(button.text) || fallback;
        const isFirstOccurrence = !seenCanonical.has(canonicalLabel);
        if (isFirstOccurrence) seenCanonical.add(canonicalLabel);
        return { button, canonicalLabel, displayLabel, isFirstOccurrence };
      });
  }, [sourceNode?.data, keyboard, defaultLanguage, languages]);

  // React Flow dinamik handle'larni avtomatik qayta o'lchamaydi. Tugma qo'shil/o'chsa
  // yoki nomi o'zgarsa, mavjud handle ID'lar to'plami o'zgaradi — shu paytda
  // updateNodeInternals chaqirib hamma handle'ni qayta o'lchatamiz, aks holda oxirgi
  // qo'shilgan tugmaning handle pozitsiyasi stale qolib, undan chiqqan edge ko'rinmaydi.
  const handleSignature = routableButtons
    .filter((b) => b.isFirstOccurrence)
    .map((b) => b.canonicalLabel)
    .join("|");
  useEffect(() => {
    if (sourceNodeId) updateNodeInternals(sourceNodeId);
  }, [sourceNodeId, handleSignature, updateNodeInternals]);

  // Faqat unikal (birinchi marta uchragan) tugmalar — tashqi handle uchun
  const uniqueButtons = routableButtons.filter((b) => b.isFirstOccurrence);
  const totalHandles = uniqueButtons.length;

  return (
    <div className="space-y-2 w-full">
      <div className="space-y-2">
        {routableButtons.length > 0 && (
          <div className="flex flex-col gap-2 mb-3 pb-3 border-b">
            {routableButtons.map(({ button, displayLabel }: { button: any; canonicalLabel: string; displayLabel: string; isFirstOccurrence: boolean }) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
              <Button
                key={button.id}
                variant="outline"
                className="w-full text-xs px-2 py-1"
              >
                <span className="truncate">{displayLabel}</span>
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Tashqi labeled source handle'lar — SwitchNode uslubida.
          position:absolute bo'lgani uchun eng yaqin positioned ancestor'ga
          (React Flow node wrapper) nisbatan joylashadi: right:0 = node o'ng
          chetida, top:X% = node balandligining X foizi. */}
      {!inPanel && sourceNodeId && uniqueButtons.map(({ canonicalLabel, displayLabel }, index) => {
        const topPct = ((index + 1) / (totalHandles + 1)) * 100;
        const handleId = `target-handler-${sourceNodeId}-${canonicalLabel}`;
        return (
          <div
            key={canonicalLabel}
            className="group/bh"
            style={{
              position: "absolute",
              right: 0,
              top: `${topPct}%`,
              transform: "translateY(-50%)",
            }}
          >
            <PillHandle
              id={handleId}
              type="source"
              position={Position.Right}
              tone="neutral"
              title={displayLabel}
              style={{ top: 0, transform: "translate(calc(100% + 8px), -50%)" }}
            />
            <span
              style={{
                position: "absolute",
                top: "50%",
                transform: "translateY(-50%)",
                transformOrigin: "-24px center",
                left: "calc(100% + 40px)",
                whiteSpace: "nowrap",
                fontSize: 9,
                lineHeight: "12px",
                pointerEvents: "none",
                userSelect: "none",
              }}
              className="text-muted-foreground font-medium transition-transform duration-150 group-hover/bh:scale-125"
            >
              {displayLabel}
            </span>
          </div>
        );
      })}
    </div>
  );
}
