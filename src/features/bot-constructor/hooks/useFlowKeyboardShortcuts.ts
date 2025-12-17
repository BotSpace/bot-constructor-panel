import { useEffect } from "react";
import { useReactFlow } from "reactflow";
import { useFlowStore } from "../store";

type UseFlowKeyboardShortcutsProps = {
  containerRef: React.RefObject<HTMLDivElement | null>;
  mousePosition: { x: number; y: number };
  onOpenPalette: () => void;
};

export function useFlowKeyboardShortcuts({
  containerRef,
  mousePosition,
  onOpenPalette,
}: UseFlowKeyboardShortcutsProps) {
  const { screenToFlowPosition } = useReactFlow();
  const {
    selectAll,
    copySelection,
    paste,
    duplicateSelection,
    deleteSelectedElements,
    undo,
    redo,
  } = useFlowStore((state) => ({
    selectAll: state.selectAll,
    copySelection: state.copySelection,
    paste: state.paste,
    duplicateSelection: state.duplicateSelection,
    deleteSelectedElements: state.deleteSelectedElements,
    undo: state.undo,
    redo: state.redo,
  }));

  useEffect(() => {
    const containerElement = containerRef.current;
    if (!containerElement) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const ctrlOrCmd = isMac ? event.metaKey : event.ctrlKey;

      if (ctrlOrCmd && event.key.toLowerCase() === "z" && !event.shiftKey) {
        event.preventDefault();
        undo();
      } else if (
        (ctrlOrCmd && event.key.toLowerCase() === "y") ||
        (ctrlOrCmd && event.shiftKey && event.key.toLowerCase() === "z")
      ) {
        event.preventDefault();
        redo();
      } else if (ctrlOrCmd && event.key.toLowerCase() === "a") {
        event.preventDefault();
        selectAll();
      } else if (ctrlOrCmd && event.key.toLowerCase() === "c") {
        event.preventDefault();
        copySelection();
      } else if (ctrlOrCmd && event.key.toLowerCase() === "v") {
        event.preventDefault();
        const position = screenToFlowPosition(mousePosition);
        paste(position);
      } else if (ctrlOrCmd && event.key.toLowerCase() === "d") {
        event.preventDefault();
        duplicateSelection();
      } else if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        deleteSelectedElements();
      } else if (ctrlOrCmd && event.key === " ") {
        event.preventDefault();
        onOpenPalette();
      }
    };

    containerElement.setAttribute("tabIndex", "0");
    containerElement.addEventListener("keydown", handleKeyDown);

    return () => {
      containerElement.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    selectAll,
    copySelection,
    paste,
    duplicateSelection,
    deleteSelectedElements,
    undo,
    redo,
    mousePosition,
    screenToFlowPosition,
    containerRef,
    onOpenPalette,
  ]);
}
