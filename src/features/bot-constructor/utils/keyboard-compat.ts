/**
 * Keyboard format compatibility helper.
 *
 * Reads button rows from either the new format ({keyboard_kind, rows:[{columns:[btn]}]})
 * or the legacy format ({keyboard:{active, inline:[[btn]], reply:[[btn]]}}) and returns
 * a normalized view so call-sites don't need to know which format the node uses.
 */

export interface NormalizedKeyboard {
  active: "inline" | "reply";
  inline: unknown[][];
  reply: unknown[][];
}

export function getNodeKeyboard(data: unknown): NormalizedKeyboard {
  const d = (data ?? {}) as Record<string, unknown>;

  // New format
  if (Array.isArray(d.rows)) {
    const kind = d.keyboard_kind === "reply" ? "reply" : "inline";
    const rows = (d.rows as Array<{ columns?: unknown[] }>).map((row) =>
      Array.isArray(row?.columns) ? row.columns : []
    );
    return {
      active: kind,
      inline: kind === "inline" ? rows : [],
      reply: kind === "reply" ? rows : [],
    };
  }

  // Legacy format
  const kb = d.keyboard as
    | { active?: string; inline?: unknown[]; reply?: unknown[] }
    | undefined;
  if (kb && typeof kb === "object") {
    return {
      active: kb.active === "reply" ? "reply" : "inline",
      inline: (Array.isArray(kb.inline) ? kb.inline : []) as unknown[][],
      reply: (Array.isArray(kb.reply) ? kb.reply : []) as unknown[][],
    };
  }

  return { active: "inline", inline: [], reply: [] };
}
