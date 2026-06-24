/**
 * useVarSuggestions
 *
 * Returns a merged list of variable suggestions for autocomplete:
 *   - Ancestor-chain state keys (via getAvailableStateKeys)
 *   - Standard auto-context vars (user.id, message.text, etc.)
 *
 * Used by modal-field-widgets (HighlightedInput/Textarea) and
 * shared-message-fields (TelegramRichTextEditor).
 */

import { useMemo } from "react";
import { useFlowStore } from "@/features/bot-constructor/store";
import { getAvailableStateKeys } from "@/features/bot-constructor/lib/get-state-keys";

/** Standard auto-context variables always available in any bot flow */
export const STANDARD_VAR_SUGGESTIONS = [
  "user.id",
  "user.first_name",
  "user.last_name",
  "user.username",
  "message.text",
  "webhook.body",
  "webhook.query",
  "private.",
];

export function useVarSuggestions(nodeId: string): string[] {
  const nodes = useFlowStore((s) => s.nodes);
  const edges = useFlowStore((s) => s.edges);
  return useMemo(() => {
    const stateKeys = getAvailableStateKeys(nodes, edges, nodeId);
    const merged = [...stateKeys];
    for (const std of STANDARD_VAR_SUGGESTIONS) {
      if (!merged.includes(std)) merged.push(std);
    }
    return merged;
  }, [nodes, edges, nodeId]);
}
