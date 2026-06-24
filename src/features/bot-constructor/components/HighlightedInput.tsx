"use client";

/**
 * HighlightedInput & HighlightedTextarea
 *
 * Input/Textarea wrapper'lari: foydalanuvchi {{var_name}} yozganda
 * o'sha token joyida rangli ko'rinadi. Dropdown autocomplete ham bor.
 *
 * Arxitektura (to'g'ri overlay texnikasi):
 *   - Wrapper <div>: fon rang, border, rounded, h-* — caller className shu yerga boradi.
 *   - Mirror <div>: butun matnni ko'rsatadi — oddiy qismlar var(--foreground),
 *     {{...}} tokenlar accent rang. zIndex 0 (orqada).
 *   - Haqiqiy <input>/<textarea>: color:transparent (caret va selection ko'rinadi),
 *     bg-transparent, zIndex 1 (ustda). Shu bilan matn FAQAT mirror orqali ko'rinadi,
 *     dubl/ghost yo'q.
 *
 * Muhim: dinamik Tailwind klass ISHLATILMAYDI — inline style + CSS var.
 */

import React, {
  useRef,
  useCallback,
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
  type TextareaHTMLAttributes,
  type InputHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";

// ─── Regex ────────────────────────────────────────────────────────────────────

const VAR_TOKEN_RE = /(\{\{[^}]+\}\})/g;

// ─── Token renderer ────────────────────────────────────────────────────────────

/**
 * Matn ichidagi {{...}} tokenlarni rangli <span> bilan almashtiradi.
 * Oddiy qismlar var(--foreground) rangida (ko'rinadigan).
 */
function highlightTokens(text: string): React.ReactNode[] {
  const parts = text.split(VAR_TOKEN_RE);
  const nodes: React.ReactNode[] = [];
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (!part) continue;
    if (i % 2 === 1) {
      // {{...}} token — accent rang
      nodes.push(
        <span
          key={i}
          style={{
            backgroundColor:
              "color-mix(in srgb, var(--primary, hsl(220 90% 56%)) 18%, transparent)",
            color: "var(--primary, hsl(220 90% 56%))",
            borderRadius: "3px",
          }}
        >
          {part}
        </span>,
      );
    } else {
      // Oddiy matn — foreground rang (ko'rinadigan, chunki input transparent)
      nodes.push(
        <span key={i} style={{ color: "var(--foreground)" }}>
          {part}
        </span>,
      );
    }
  }
  return nodes;
}

// ─── Mirror font sync ─────────────────────────────────────────────────────────

/**
 * Mirror div'ga haqiqiy input/textarea'ning padding/font stillarini ko'chiradi.
 * boxSizing va borderWidth ham qo'shilgan — pikselma-piksel mos kelishi uchun.
 */
function syncMirrorFont(
  sourceEl: HTMLInputElement | HTMLTextAreaElement,
  mirrorEl: HTMLDivElement,
) {
  const cs = window.getComputedStyle(sourceEl);
  const props = [
    "fontFamily",
    "fontSize",
    "fontWeight",
    "fontStyle",
    "letterSpacing",
    "lineHeight",
    "paddingTop",
    "paddingRight",
    "paddingBottom",
    "paddingLeft",
    "tabSize",
    "boxSizing",
    "textAlign",
  ] as const;
  for (const prop of props) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (mirrorEl.style as any)[prop] = (cs as any)[prop];
  }
  // Border width: mirror has 0 border (wrapper has the border), but we need to
  // account for the same total box width. Mirror border stays 0 — padding already
  // copied above so the inner area aligns perfectly.
}

// ─── useVarAutocomplete hook ──────────────────────────────────────────────────

interface AutocompleteState {
  open: boolean;
  query: string;
  filtered: string[];
  activeIndex: number;
}

interface UseVarAutocompleteOptions {
  suggestions: string[];
  getValue: () => string;
  getCaretPosition: () => number;
  setValue: (next: string, caretPos: number) => void;
}

function getOpenQueryFromValue(value: string, caretPos: number): string | null {
  // Find the text before caret
  const before = value.slice(0, caretPos);
  // Find last {{ that is not yet closed
  const lastOpen = before.lastIndexOf("{{");
  if (lastOpen === -1) return null;
  const afterOpen = before.slice(lastOpen + 2);
  // If there's a }} after the last {{ before caret, it's already closed
  if (afterOpen.includes("}}")) return null;
  return afterOpen;
}

function useVarAutocomplete({
  suggestions,
  getValue,
  getCaretPosition,
  setValue,
}: UseVarAutocompleteOptions) {
  const [state, setState] = useState<AutocompleteState>({
    open: false,
    query: "",
    filtered: [],
    activeIndex: 0,
  });

  const checkTriggerFromArgs = useCallback(
    (value: string, caret: number) => {
      const query = getOpenQueryFromValue(value, caret);
      if (query === null) {
        setState((prev) => (prev.open ? { ...prev, open: false } : prev));
        return;
      }
      const q = query.toLowerCase();
      const filtered = suggestions.filter(
        (s) => q === "" || s.toLowerCase().includes(q),
      );
      setState({
        open: filtered.length > 0,
        query,
        filtered,
        activeIndex: 0,
      });
    },
    [suggestions],
  );

  const checkTrigger = useCallback(() => {
    const value = getValue();
    const caret = getCaretPosition();
    checkTriggerFromArgs(value, caret);
  }, [getValue, getCaretPosition, checkTriggerFromArgs]);

  const close = useCallback(() => {
    setState((prev) => ({ ...prev, open: false }));
  }, []);

  const selectSuggestion = useCallback(
    (suggestion: string) => {
      const value = getValue();
      const caret = getCaretPosition();
      const before = value.slice(0, caret);
      const after = value.slice(caret);
      const lastOpen = before.lastIndexOf("{{");
      if (lastOpen === -1) return;
      // Replace "{{query" with "{{suggestion}}"
      const newBefore = before.slice(0, lastOpen) + "{{" + suggestion + "}}";
      const newValue = newBefore + after;
      const newCaret = newBefore.length;
      setValue(newValue, newCaret);
      close();
    },
    [getValue, getCaretPosition, setValue, close],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!state.open) return;
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setState((prev) => ({
          ...prev,
          activeIndex: (prev.activeIndex + 1) % Math.max(prev.filtered.length, 1),
        }));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setState((prev) => ({
          ...prev,
          activeIndex:
            (prev.activeIndex - 1 + Math.max(prev.filtered.length, 1)) %
            Math.max(prev.filtered.length, 1),
        }));
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        if (state.filtered.length > 0) {
          e.preventDefault();
          selectSuggestion(state.filtered[state.activeIndex] ?? state.filtered[0]);
        }
        return;
      }
    },
    [state, close, selectSuggestion],
  );

  return { state, checkTrigger, checkTriggerFromArgs, close, selectSuggestion, handleKeyDown };
}

// ─── Autocomplete Dropdown ────────────────────────────────────────────────────

interface AutocompleteDropdownProps {
  open: boolean;
  items: string[];
  activeIndex: number;
  onSelect: (item: string) => void;
}

function AutocompleteDropdown({
  open,
  items,
  activeIndex,
  onSelect,
}: AutocompleteDropdownProps) {
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open && activeRef.current) {
      activeRef.current.scrollIntoView({ block: "nearest" });
    }
  }, [open, activeIndex]);

  if (!open || items.length === 0) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: "100%",
        left: 0,
        right: 0,
        zIndex: 50,
        marginTop: "2px",
        backgroundColor: "var(--popover)",
        color: "var(--popover-foreground)",
        border: "1px solid var(--border)",
        borderRadius: "6px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
        maxHeight: "180px",
        overflowY: "auto",
        padding: "4px",
      }}
      // Prevent blur on input when clicking dropdown
      onMouseDown={(e) => e.preventDefault()}
    >
      {items.map((item, index) => {
        const isActive = index === activeIndex;
        return (
          <button
            key={item}
            ref={isActive ? activeRef : undefined}
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              onSelect(item);
            }}
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              padding: "5px 8px",
              borderRadius: "4px",
              fontSize: "12px",
              fontFamily: "var(--font-mono, monospace)",
              cursor: "pointer",
              border: "none",
              backgroundColor: isActive
                ? "color-mix(in srgb, var(--primary) 15%, transparent)"
                : "transparent",
              color: isActive ? "var(--primary)" : "var(--popover-foreground)",
            }}
          >
            {`{{${item}}}`}
          </button>
        );
      })}
    </div>
  );
}

// ─── HighlightedInput ─────────────────────────────────────────────────────────

export interface HighlightedInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  /** Autocomplete suggestions (e.g. state keys + user.id, message.text ...) */
  suggestions?: string[];
}

export const HighlightedInput = forwardRef<HTMLInputElement, HighlightedInputProps>(
  function HighlightedInput(
    { value, onChange, className, style, suggestions = [], ...rest },
    ref,
  ) {
    const inputRef = useRef<HTMLInputElement>(null);
    const mirrorRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    const syncScroll = useCallback(() => {
      if (!inputRef.current || !mirrorRef.current) return;
      mirrorRef.current.scrollLeft = inputRef.current.scrollLeft;
    }, []);

    useEffect(() => {
      if (!inputRef.current || !mirrorRef.current) return;
      syncMirrorFont(inputRef.current, mirrorRef.current);
    });

    const { state, checkTrigger, checkTriggerFromArgs, close, selectSuggestion, handleKeyDown } =
      useVarAutocomplete({
        suggestions,
        getValue: () => inputRef.current?.value ?? "",
        getCaretPosition: () => inputRef.current?.selectionStart ?? 0,
        setValue: (next, caretPos) => {
          // Trigger React controlled onChange
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype,
            "value",
          )?.set;
          if (nativeInputValueSetter && inputRef.current) {
            nativeInputValueSetter.call(inputRef.current, next);
            inputRef.current.dispatchEvent(new Event("input", { bubbles: true }));
            // Set caret after React re-render
            requestAnimationFrame(() => {
              if (inputRef.current) {
                inputRef.current.setSelectionRange(caretPos, caretPos);
              }
            });
          }
        },
      });

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e);
        // Use value/caret directly from the event — avoids rAF/React-batching skew
        const val = e.target.value;
        const caret = e.target.selectionStart ?? val.length;
        checkTriggerFromArgs(val, caret);
      },
      [onChange, checkTriggerFromArgs],
    );

    return (
      <div
        className={cn(
          "relative flex min-w-0 w-full rounded-md border border-input",
          "shadow-xs overflow-visible",
          className,
        )}
        style={style}
      >
        {/* Mirror — behind the real input; shows full text via foreground color */}
        <div
          ref={mirrorRef}
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            overflow: "hidden",
            // No color here — each span carries its own color (foreground or primary)
            whiteSpace: "pre",
            border: "0px solid transparent",
            zIndex: 0,
            // Single-line <input> vertically centers its text; mirror a block div
            // would top-align it. Flex-center the inner line so it matches the
            // input's caret/text baseline exactly.
            display: "flex",
            alignItems: "center",
          }}
        >
          <span style={{ whiteSpace: "pre" }}>
            {highlightTokens(value)}
            {/* Trailing zero-width space keeps height consistent when empty */}
            {"​"}
          </span>
        </div>

        {/* Real input — color:transparent so only mirror text shows; caret visible */}
        <input
          ref={inputRef}
          value={value}
          onChange={handleChange}
          onScroll={syncScroll}
          onKeyDown={handleKeyDown}
          onBlur={close}
          className={cn(
            "file:text-foreground placeholder:text-muted-foreground",
            "selection:bg-primary/30",
            "flex h-9 w-full min-w-0 bg-transparent",
            "px-3 py-1 text-base outline-none",
            "file:inline-flex file:h-7 file:border-0 file:bg-transparent",
            "file:text-sm file:font-medium",
            "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
            "md:text-sm",
            "focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none",
            "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
          )}
          style={{
            position: "relative",
            zIndex: 1,
            // Input text invisible — mirror shows it; caret remains visible
            color: "transparent",
            caretColor: "var(--foreground)",
          }}
          {...rest}
        />

        {/* Autocomplete dropdown */}
        <AutocompleteDropdown
          open={state.open}
          items={state.filtered}
          activeIndex={state.activeIndex}
          onSelect={selectSuggestion}
        />
      </div>
    );
  },
);

// ─── HighlightedTextarea ──────────────────────────────────────────────────────

export interface HighlightedTextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "value" | "onChange"> {
  value: string;
  onChange: React.ChangeEventHandler<HTMLTextAreaElement>;
  /** Autocomplete suggestions (e.g. state keys + user.id, message.text ...) */
  suggestions?: string[];
}

export const HighlightedTextarea = forwardRef<
  HTMLTextAreaElement,
  HighlightedTextareaProps
>(function HighlightedTextarea(
  { value, onChange, className, style, rows, suggestions = [], ...rest },
  ref,
) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mirrorRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => textareaRef.current as HTMLTextAreaElement);

  const syncScroll = useCallback(() => {
    if (!textareaRef.current || !mirrorRef.current) return;
    mirrorRef.current.scrollTop = textareaRef.current.scrollTop;
    mirrorRef.current.scrollLeft = textareaRef.current.scrollLeft;
  }, []);

  useEffect(() => {
    if (!textareaRef.current || !mirrorRef.current) return;
    syncMirrorFont(textareaRef.current, mirrorRef.current);
    mirrorRef.current.style.height = `${textareaRef.current.offsetHeight}px`;
    mirrorRef.current.style.width = `${textareaRef.current.offsetWidth}px`;
  });

  const { state, checkTriggerFromArgs, close, selectSuggestion, handleKeyDown } =
    useVarAutocomplete({
      suggestions,
      getValue: () => textareaRef.current?.value ?? "",
      getCaretPosition: () => textareaRef.current?.selectionStart ?? 0,
      setValue: (next, caretPos) => {
        const nativeValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLTextAreaElement.prototype,
          "value",
        )?.set;
        if (nativeValueSetter && textareaRef.current) {
          nativeValueSetter.call(textareaRef.current, next);
          textareaRef.current.dispatchEvent(new Event("input", { bubbles: true }));
          requestAnimationFrame(() => {
            if (textareaRef.current) {
              textareaRef.current.setSelectionRange(caretPos, caretPos);
            }
          });
        }
      },
    });

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e);
      // Use value/caret directly from the event — avoids rAF/React-batching skew
      const val = e.target.value;
      const caret = e.target.selectionStart ?? val.length;
      checkTriggerFromArgs(val, caret);
    },
    [onChange, checkTriggerFromArgs],
  );

  return (
    <div
      className={cn(
        "relative w-full overflow-visible rounded-md border border-input shadow-xs",
        className,
      )}
      style={style}
    >
      {/* Mirror */}
      <div
        ref={mirrorRef}
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          pointerEvents: "none",
          overflow: "hidden",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          overflowWrap: "break-word",
          border: "0px solid transparent",
          zIndex: 0,
        }}
      >
        {highlightTokens(value)}
        {/* Trailing newline keeps mirror height in sync */}
        {"\n​"}
      </div>

      {/* Real textarea — color:transparent; mirror shows the text */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onScroll={syncScroll}
        onKeyDown={handleKeyDown}
        onBlur={close}
        rows={rows}
        className={cn(
          "placeholder:text-muted-foreground",
          "selection:bg-primary/30",
          "flex field-sizing-content min-h-16 w-full bg-transparent",
          "px-3 py-2 text-base outline-none",
          "transition-[color,box-shadow]",
          "focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
          "disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        )}
        style={{
          position: "relative",
          zIndex: 1,
          backgroundColor: "transparent",
          // Text invisible — mirror renders it; caret stays visible
          color: "transparent",
          caretColor: "var(--foreground)",
          resize: "vertical",
          wordBreak: "break-word",
          overflowWrap: "break-word",
        }}
        {...rest}
      />

      {/* Autocomplete dropdown */}
      <AutocompleteDropdown
        open={state.open}
        items={state.filtered}
        activeIndex={state.activeIndex}
        onSelect={selectSuggestion}
      />
    </div>
  );
});
