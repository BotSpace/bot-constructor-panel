// FAYL: constructor/components/ButtonGenerator/hooks/useButtonGeneratorState.ts (YANGI HOOK)

import { useState, useEffect, useMemo } from "react";
import { ButtonConfig } from "../types";
import { KeyboardConfig } from "@/features/bot-constructor/nodes/actions/TextMessageNode/types";

const MAX_BUTTONS_PER_ROW = 10;

export const useButtonGeneratorState = (
  isOpen: boolean,
  initialKeyboard?: KeyboardConfig
) => {
  const [keyboards, setKeyboards] = useState<
    Pick<KeyboardConfig, "inline" | "reply">
  >({ inline: [[]], reply: [[]] });
  const [activeTab, setActiveTab] = useState<"inline" | "reply">("inline");
  const [selectedRowIndex, setSelectedRowIndex] = useState<number>(0);

  useEffect(() => {
    if (isOpen) {
      setKeyboards({
        inline: JSON.parse(JSON.stringify(initialKeyboard?.inline || [[]])),
        reply: JSON.parse(JSON.stringify(initialKeyboard?.reply || [[]])),
      });
      setActiveTab(initialKeyboard?.active || "inline");
      setSelectedRowIndex(0);
    }
  }, [isOpen, initialKeyboard]);

  const isInlineTab = activeTab === "inline";
  const currentButtons = isInlineTab ? keyboards.inline : keyboards.reply;

  const setCurrentButtons = (
    updater: (prev: ButtonConfig[][]) => ButtonConfig[][]
  ) => {
    setKeyboards((prev) => ({
      ...prev,
      [activeTab]: updater(prev[activeTab]),
    }));
  };

  const isCurrentRowFull = useMemo(
    () => currentButtons[selectedRowIndex]?.length >= MAX_BUTTONS_PER_ROW,
    [currentButtons, selectedRowIndex]
  );

  const handleAddButton = (newButton: ButtonConfig) => {
    if (isCurrentRowFull) {
      alert(
        `Bu qatorda maksimal tugmalar soniga (${MAX_BUTTONS_PER_ROW} ta) yetilgan.`
      );
      return;
    }

    setCurrentButtons((current) => {
      const updated = [...current];
      if (updated.length === 0) updated.push([]);

      const targetIndex =
        selectedRowIndex < updated.length
          ? selectedRowIndex
          : updated.length - 1;

      const targetRow = [...updated[targetIndex], newButton];
      updated[targetIndex] = targetRow;
      return updated;
    });
  };

  const handleAddRow = () => {
    const newRowIndex = currentButtons.length;
    // `setCurrentButtons` ga updater funksiya uzatamiz
    setCurrentButtons((prev) => [...prev, []]); // <-- TUZATILDI
    setSelectedRowIndex(newRowIndex);
  };

  const handleRemoveButton = (rowIndex: number, buttonId: string) => {
    setCurrentButtons((current) => {
      const newButtons = current
        .map((row, rIdx) => {
          if (rIdx === rowIndex) {
            return row.filter((button) => button.id !== buttonId);
          }
          return row;
        })
        .filter(
          (row) => row.length > 0 || (row.length === 0 && current.length === 1)
        );

      if (newButtons.length === 0) {
        if (selectedRowIndex !== 0) setSelectedRowIndex(0);
        return [[]];
      }

      if (selectedRowIndex >= newButtons.length) {
        setSelectedRowIndex(newButtons.length - 1);
      }
      return newButtons;
    });
  };

  const getFinalKeyboardConfig = (): KeyboardConfig => {
    return {
      active: activeTab,
      inline: keyboards.inline.filter((row) => row.length > 0),
      reply: keyboards.reply.filter((row) => row.length > 0),
    };
  };

  return {
    keyboards,
    activeTab,
    setActiveTab,
    selectedRowIndex,
    setSelectedRowIndex,
    currentButtons,
    isCurrentRowFull,
    MAX_BUTTONS_PER_ROW,
    handleAddButton,
    handleAddRow,
    handleRemoveButton,
    getFinalKeyboardConfig,
  };
};
