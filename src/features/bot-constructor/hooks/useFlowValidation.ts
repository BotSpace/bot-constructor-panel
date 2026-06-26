import { useEffect } from "react";
import { useFlowStore } from "@/features/bot-constructor/store";
import {
  useDebugErrorsStore,
  ValidationWarning,
} from "@/features/bot-constructor/store/debug-errors";

/**
 * Client-side flow validation: runs whenever nodes/edges change, computes
 * structural warnings, and syncs them into the ErrorsPanel via the debug-errors
 * store.  Warnings use stable "cv-" prefixed ids so they don't duplicate on
 * every keystroke — only genuinely new issues increment the unread badge.
 *
 * Current rules:
 *   • PaymentNode with an unconnected "paid" or "failed" source handle.
 */
export function useFlowValidation(projectId: string) {
  const nodes = useFlowStore((s) => s.nodes);
  const edges = useFlowStore((s) => s.edges);

  useEffect(() => {
    const warnings: ValidationWarning[] = [];

    for (const node of nodes) {
      if (node.type !== "PaymentNode") continue;

      for (const handle of ["paid", "failed"] as const) {
        const connected = edges.some(
          (e) => e.source === node.id && e.sourceHandle === handle
        );
        if (!connected) {
          const label =
            handle === "paid" ? "To'landi (paid)" : "Xato (failed)";
          warnings.push({
            id: `cv-payment-${node.id}-${handle}`,
            project: projectId,
            node_id: node.id,
            node_type: "PaymentNode",
            message: `PaymentNode: '${label}' chiqishi ulanmagan — to'lovdan keyin hech narsa ishlamaydi.`,
            ts: Date.now(),
          });
        }
      }
    }

    useDebugErrorsStore.getState().syncValidationWarnings(warnings);
  }, [nodes, edges, projectId]);
}
