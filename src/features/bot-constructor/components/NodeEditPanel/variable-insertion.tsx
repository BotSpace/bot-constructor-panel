"use client";

import {
  createContext,
  DragEvent,
  FocusEvent,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
} from "react";

type EditableElement = HTMLInputElement | HTMLTextAreaElement | HTMLElement;

interface VariableInsertionContextValue {
  insertVariable: (key: string) => void;
}

const VariableInsertionContext =
  createContext<VariableInsertionContextValue | null>(null);

function isTextInput(element: Element): element is HTMLInputElement {
  if (!(element instanceof HTMLInputElement)) {
    return false;
  }

  const textTypes = new Set([
    "text",
    "search",
    "url",
    "tel",
    "email",
    "password",
  ]);

  return textTypes.has(element.type || "text");
}

function isEditableElement(element: Element | null): element is EditableElement {
  if (!element) {
    return false;
  }

  return (
    isTextInput(element) ||
    element instanceof HTMLTextAreaElement ||
    (element instanceof HTMLElement && element.isContentEditable)
  );
}

function findEditableTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) {
    return null;
  }

  if (isEditableElement(target)) {
    return target;
  }

  return target.closest("input, textarea, [contenteditable='true']");
}

function setNativeValue(
  element: HTMLInputElement | HTMLTextAreaElement,
  value: string
) {
  const prototype =
    element instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : HTMLInputElement.prototype;
  const valueSetter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;

  valueSetter?.call(element, value);
  element.dispatchEvent(new Event("input", { bubbles: true }));
}

export function insertTextAtCursor(element: EditableElement, text: string) {
  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
    const start = element.selectionStart ?? element.value.length;
    const end = element.selectionEnd ?? start;
    const nextValue = `${element.value.slice(0, start)}${text}${element.value.slice(end)}`;

    element.focus();
    setNativeValue(element, nextValue);

    const nextCursorPosition = start + text.length;
    element.setSelectionRange(nextCursorPosition, nextCursorPosition);
    return true;
  }

  if (element instanceof HTMLElement && element.isContentEditable) {
    element.focus();
    document.execCommand("insertText", false, text);
    return true;
  }

  return false;
}

export function VariableInsertionProvider({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const activeEditableRef = useRef<EditableElement | null>(null);

  const handleFocusCapture = useCallback((event: FocusEvent<HTMLDivElement>) => {
    const editable = findEditableTarget(event.target);
    if (isEditableElement(editable)) {
      activeEditableRef.current = editable;
    }
  }, []);

  const insertVariable = useCallback((key: string) => {
    const token = `{{${key}}}`;
    const activeElement = activeEditableRef.current;

    if (activeElement && insertTextAtCursor(activeElement, token)) {
      return;
    }

    navigator.clipboard?.writeText(token).catch(() => undefined);
  }, []);

  const handleDropCapture = useCallback((event: DragEvent<HTMLDivElement>) => {
    const token =
      event.dataTransfer.getData("application/x-botmother-variable") ||
      event.dataTransfer.getData("text/plain");

    if (!token.startsWith("{{") || !token.endsWith("}}")) {
      return;
    }

    const editable = findEditableTarget(event.target);
    if (!isEditableElement(editable)) {
      return;
    }

    event.preventDefault();
    activeEditableRef.current = editable;
    insertTextAtCursor(editable, token);
  }, []);

  const value = useMemo(() => ({ insertVariable }), [insertVariable]);

  return (
    <VariableInsertionContext.Provider value={value}>
      <div
        className={className}
        onFocusCapture={handleFocusCapture}
        onDropCapture={handleDropCapture}
      >
        {children}
      </div>
    </VariableInsertionContext.Provider>
  );
}

export function useVariableInsertion() {
  const context = useContext(VariableInsertionContext);

  if (!context) {
    return {
      insertVariable: () => undefined,
    };
  }

  return context;
}
