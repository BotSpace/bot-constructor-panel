"use client";

/**
 * FieldHelp — label yonidagi '?' icon, bosilganda Popover'da helpText ko'rinadi.
 * hover emas, click-based.
 */

import React, { useState } from "react";
import { CircleHelp } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface FieldHelpProps {
  text: string;
}

export function FieldHelp({ text }: FieldHelpProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Yordam"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
            border: "none",
            background: "transparent",
            cursor: "pointer",
            color: "var(--muted-foreground)",
            lineHeight: 1,
            flexShrink: 0,
          }}
          onClick={() => setOpen((v) => !v)}
        >
          <CircleHelp style={{ width: 13, height: 13 }} />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="start"
        style={{
          maxWidth: 280,
          padding: "8px 10px",
          fontSize: 12,
          lineHeight: 1.6,
          whiteSpace: "pre-wrap",
        }}
        className="text-muted-foreground"
      >
        {text}
      </PopoverContent>
    </Popover>
  );
}
