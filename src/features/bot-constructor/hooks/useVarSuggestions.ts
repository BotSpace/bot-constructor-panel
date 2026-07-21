/**
 * useVarSuggestions
 *
 * Returns a merged list of variable suggestions for autocomplete:
 *   - Ancestor-chain state keys (via getAvailableStateKeys)
 *   - Standard auto-context vars (user.id, message.text, etc.)
 *   - Runtime variables received via WS/SSE (from useDebugContextStore)
 *
 * Used by modal-field-widgets (HighlightedInput/Textarea) and
 * shared-message-fields (TelegramRichTextEditor).
 */

import { useMemo } from "react";
import { useFlowStore } from "@/features/bot-constructor/store";
import { getAvailableStateKeys } from "@/features/bot-constructor/lib/get-state-keys";
import { GLOBAL_CONTEXT_VARIABLE_GROUPS } from "@/features/bot-constructor/lib/global-context-variables";
import { useDebugContextStore } from "@/components/layout/debug-console/debug-context-store";

/** Standard auto-context variables always available in any bot flow */
export const STANDARD_VAR_SUGGESTIONS = [
  ...GLOBAL_CONTEXT_VARIABLE_GROUPS.flatMap((group) =>
    group.variables.map((variable) => variable.key),
  ),
  "user.id",
  "user.first_name",
  "user.last_name",
  "user.username",
  "webhook.body",
  "webhook.query",
  "private.",
];

/**
 * Internal prefixes/keys that are engine-technical and should not be
 * shown in user-facing autocomplete.
 */
const SKIP_PREFIXES = ["_", "trigger_type", "node_id", "flow_id", "session_id"];

function shouldSkipKey(key: string): boolean {
  for (const prefix of SKIP_PREFIXES) {
    if (key === prefix || key.startsWith(prefix)) return true;
  }
  return false;
}

/**
 * Maps a raw snapshot variable key to a user-friendly suggestion string.
 * Returns null if the key should be skipped entirely.
 *
 * Mapping rules:
 *   public_<x>           → x
 *   private_<x>          → private.<x>
 *   user_*               → user.<rest>  (e.g. user_id → user.id)
 *   message              → message.text  (root key hint)
 *   callback_query       → callback_query.data
 *   webhook              → webhook.body
 *   collection_*         → collection.<rest>
 *   everything else      → key as-is (if not in skip list)
 */
function snapshotKeyToSuggestion(key: string): string | null {
  if (shouldSkipKey(key)) return null;

  if (key.startsWith("public_")) {
    const name = key.slice("public_".length);
    return name || null;
  }
  if (key.startsWith("private_")) {
    const name = key.slice("private_".length);
    return name ? `private.${name}` : null;
  }
  if (key.startsWith("user_")) {
    const rest = key.slice("user_".length);
    return rest ? `user.${rest}` : "user.id";
  }
  if (key === "message") return "message.text";
  if (key === "callback_query") return "callback_query.data";
  if (key === "webhook") return "webhook.body";
  if (key.startsWith("collection_")) {
    const rest = key.slice("collection_".length);
    return rest ? `collection.${rest}` : null;
  }
  return key;
}

export function useVarSuggestions(nodeId: string): string[] {
  const nodes = useFlowStore((s) => s.nodes);
  const edges = useFlowStore((s) => s.edges);
  // Reactive: re-runs when any debug snapshot is updated via WS/SSE
  const snapshots = useDebugContextStore((s) => s.snapshots);

  return useMemo(() => {
    const stateKeys = getAvailableStateKeys(nodes, edges, nodeId);
    const merged = [...stateKeys];

    // Add standard suggestions
    for (const std of STANDARD_VAR_SUGGESTIONS) {
      if (!merged.includes(std)) merged.push(std);
    }

    // Collect keys from all WS/SSE runtime snapshots
    for (const snapshot of snapshots.values()) {
      for (const rawKey of Object.keys(snapshot.variables)) {
        const suggestion = snapshotKeyToSuggestion(rawKey);
        if (suggestion && !merged.includes(suggestion)) {
          merged.push(suggestion);
        }
      }
    }

    return merged;
  }, [nodes, edges, nodeId, snapshots]);
}
