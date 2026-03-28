"use client";

import { useIsInNodePanel } from "@/features/bot-constructor/contexts/NodePanelContext";

interface Props {
  text?: string;
  placeholder?: string;
}

/**
 * Canvas mode: shows a compact text preview below NodeHeader.
 * Panel mode: renders nothing (full editor is shown inside the collapsed block).
 */
export function NodeTextPreview({ text, placeholder = "Matn yozilmagan..." }: Props) {
  const inPanel = useIsInNodePanel();
  if (inPanel) return null;

  return (
    <div className="px-3 py-2 border-t border-border/30 bg-muted/20">
      <div
        className="text-xs text-foreground/70 line-clamp-3 leading-relaxed"
        dangerouslySetInnerHTML={{
          __html: text?.trim()
            ? text.replace(/\n/g, "<br>")
            : `<span class="italic text-muted-foreground/50">${placeholder}</span>`,
        }}
      />
    </div>
  );
}
