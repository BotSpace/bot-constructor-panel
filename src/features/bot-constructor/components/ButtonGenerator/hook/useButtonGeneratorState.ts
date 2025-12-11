// FAYL: constructor/components/ButtonGenerator/hooks/useButtonGeneratorState.ts (YANGI HOOK)

import { useState, useEffect, useMemo } from "react";
import { ButtonConfig, KeyboardConfig } from "../types";

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
    // Faqat dialog ochilganda state ni o'rnatamiz, initialKeyboard o'zgarganda emas
    // chunki foydalanuvchi o'zgartirishlar kiritmoqda va ularni yo'qotmasligimiz kerak
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

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
    // Collection button bo'lsa, alohida qatorga qo'shish
    if (newButton.collectionData?.layout) {
      setCurrentButtons((current) => {
        const updated = [...current];
        // Yangi qator yaratish va collection buttonni qo'shish
        updated.push([newButton]);
        return updated;
      });
      // Yangi qatorni tanlash
      setSelectedRowIndex(currentButtons.length);
      return;
    }

    // Tanlangan qatorda collection button bor-yo'qligini tekshirish
    const selectedRow = currentButtons[selectedRowIndex] || [];
    const hasCollectionButton = selectedRow.some(
      (btn) => btn.collectionData?.layout
    );

    if (hasCollectionButton) {
      alert(
        "Collection buttonlar bo'lgan qatorga boshqa button qo'shib bo'lmaydi."
      );
      return;
    }

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
    // Hozirgi activeTab va buttons qiymatlarini olamiz
    const currentTabButtons = keyboards[activeTab];
    const currentTab = activeTab;
    const newRowIndex = currentTabButtons.length;

    // Ikkala state yangilanishini bir vaqtning o'zida amalga oshirish
    // React ularni avtomatik batch qiladi
    setKeyboards((prev) => ({
      ...prev,
      [currentTab]: [...prev[currentTab], []],
    }));
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

  const handleEditButton = (
    rowIndex: number,
    buttonId: string,
    updatedButton: Partial<ButtonConfig>
  ) => {
    setCurrentButtons((current) => {
      return current.map((row, rIdx) => {
        if (rIdx === rowIndex) {
          return row.map((button) => {
            if (button.id === buttonId) {
              return { ...button, ...updatedButton };
            }
            return button;
          });
        }
        return row;
      });
    });
  };

  const handleReorderButtons = (
    rowIndex: number,
    reorderedButtons: ButtonConfig[]
  ) => {
    setCurrentButtons((current) => {
      return current.map((row, rIdx) => {
        if (rIdx === rowIndex) {
          return reorderedButtons;
        }
        return row;
      });
    });
  };

  const handleRemoveRow = (rowIndex: number) => {
    setCurrentButtons((current) => {
      const newButtons = current.filter((_, idx) => idx !== rowIndex);

      if (newButtons.length === 0) {
        if (selectedRowIndex !== 0) setSelectedRowIndex(0);
        return [[]];
      }

      if (selectedRowIndex >= newButtons.length) {
        setSelectedRowIndex(newButtons.length - 1);
      } else if (selectedRowIndex === rowIndex && selectedRowIndex > 0) {
        setSelectedRowIndex(selectedRowIndex - 1);
      }

      return newButtons;
    });
  };

  const handleReorderRows = (reorderedRows: ButtonConfig[][]) => {
    setCurrentButtons(() => reorderedRows);
  };

  const getFinalKeyboardConfig = (): KeyboardConfig => {
    return {
      active: activeTab,
      // Bo'sh qatorlarni ham saqlaymiz, chunki foydalanuvchi ularni yaratgan
      // va ular keyinchalik tugmalar bilan to'ldirilishi mumkin
      inline: keyboards.inline,
      reply: keyboards.reply,
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
    handleEditButton,
    handleReorderButtons,
    handleRemoveRow,
    handleReorderRows,
    getFinalKeyboardConfig,
  };
};
