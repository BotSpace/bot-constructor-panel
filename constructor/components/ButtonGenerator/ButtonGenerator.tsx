"use client";

import { useState, ReactNode, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  PlusCircle,
  Link,
  Code,
  Trash2,
  Smartphone,
  MapPin,
  Plus,
  CornerDownLeft,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { DialogTitle } from "@radix-ui/react-dialog";
import { ButtonConfig } from "./types";
import { KeyboardConfig } from "@/constructor/nodes/actions/TextMessageNode/types";

interface ButtonGeneratorProps {
  initialKeyboard?: KeyboardConfig;
  onSave: (keyboard: KeyboardConfig) => void;
  children: ReactNode;
}

const MAX_BUTTONS_PER_ROW = 10;

export function ButtonGenerator({
  initialKeyboard,
  onSave,
  children,
}: ButtonGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inlineButtons, setInlineButtons] = useState<ButtonConfig[][]>([[]]);
  const [replyButtons, setReplyButtons] = useState<ButtonConfig[][]>([[]]);
  const [activeTab, setActiveTab] = useState<"inline" | "reply">("inline");
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(0);
  const [inlineText, setInlineText] = useState("");
  const [inlineActionType, setInlineActionType] = useState<"url" | "callback">(
    "url"
  );
  const [inlineActionValue, setInlineActionValue] = useState("");
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    if (isOpen) {
      const initialInline = initialKeyboard?.inline || [[]];
      const initialReply = initialKeyboard?.reply || [[]];
      const initialActiveTab = initialKeyboard?.active || "inline";

      setInlineButtons(JSON.parse(JSON.stringify(initialInline)));
      setReplyButtons(JSON.parse(JSON.stringify(initialReply)));
      setActiveTab(initialActiveTab);

      setSelectedRowIndex(0);
      setInlineText("");
      setInlineActionValue("");
      setReplyText("");
    }
  }, [isOpen, initialKeyboard]);

  const isInlineTab = activeTab === "inline";
  const currentButtons = isInlineTab ? inlineButtons : replyButtons;
  const setCurrentButtons = isInlineTab ? setInlineButtons : setReplyButtons;

  const isCurrentRowFull =
    selectedRowIndex !== null &&
    currentButtons[selectedRowIndex]?.length >= MAX_BUTTONS_PER_ROW;

  // ... handleAddButton, handleRemoveButton, handleAddRow, handleOnOpenChange funksiyalari o'zgarishsiz qoladi ...
  const handleAddButton = (
    type: "inline" | "reply" | "special",
    specialType?: "request_contact" | "request_location"
  ) => {
    if (
      selectedRowIndex === null ||
      currentButtons[selectedRowIndex]?.length >= MAX_BUTTONS_PER_ROW
    ) {
      alert(
        `Bu qatorda maksimal tugmalar soniga (${MAX_BUTTONS_PER_ROW} ta) yetilgan.`
      );
      return;
    }

    let newButton: ButtonConfig | null = null;

    if (type === "inline") {
      if (!inlineText || !inlineActionValue) {
        alert("Iltimos, inline tugma uchun barcha maydonlarni to'ldiring.");
        return;
      }
      newButton = {
        id: `btn-${Date.now()}`,
        text: inlineText,
        type: inlineActionType,
        value: inlineActionValue,
      };
      setInlineText("");
      setInlineActionValue("");
    } else if (type === "reply") {
      if (!replyText) {
        alert("Iltimos, reply tugmasi uchun matn kiriting.");
        return;
      }
      newButton = { id: `btn-${Date.now()}`, text: replyText, type: "reply" };
      setReplyText("");
    } else if (type === "special" && specialType) {
      newButton = {
        id: `btn-${Date.now()}`,
        text: specialType === "request_contact" ? "📱 Kontakt" : "📍 Lokatsiya",
        type: specialType,
      };
    }

    if (newButton) {
      setCurrentButtons((current) => {
        const updatedButtons = [...current];
        if (updatedButtons.length === 0) updatedButtons.push([]);

        const targetIndex =
          selectedRowIndex !== null && selectedRowIndex < updatedButtons.length
            ? selectedRowIndex
            : updatedButtons.length - 1;

        const targetRow = [
          ...updatedButtons[targetIndex],
          newButton as ButtonConfig,
        ];
        updatedButtons[targetIndex] = targetRow;
        return updatedButtons;
      });
    }
  };

  const handleAddRow = () => {
    const newRowIndex = currentButtons.length;
    setCurrentButtons([...currentButtons, []]);
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

      if (selectedRowIndex !== null && selectedRowIndex >= newButtons.length) {
        setSelectedRowIndex(newButtons.length > 0 ? newButtons.length - 1 : 0);
      }
      return newButtons;
    });
  };

  const handleOnOpenChange = (open: boolean) => {
    setIsOpen(open);
  };

  const handleSaveChanges = () => {
    const finalInline = inlineButtons.filter((row) => row.length > 0);
    const finalReply = replyButtons.filter((row) => row.length > 0);

    onSave({
      active: activeTab,
      inline: finalInline,
      reply: finalReply,
    });
    handleOnOpenChange(false);
  };

  // --- TUZATISH: Ikonkani qaytaruvchi funksiya qo'shildi ---
  const getIconForButton = (button: ButtonConfig): ReactNode => {
    switch (button.type) {
      case "url":
        return <Link className="mr-2 h-4 w-4" />;
      case "callback":
        return <Code className="mr-2 h-4 w-4" />;
      case "request_contact":
        return <Smartphone className="mr-2 h-4 w-4" />;
      case "request_location":
        return <MapPin className="mr-2 h-4 w-4" />;
      default:
        // 'reply' tugmalari uchun ikonka yo'q
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOnOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[90%] md:max-w-[80%] lg:max-w-[70%] h-[90vh] overflow-y-auto">
        <VisuallyHidden>
          <DialogTitle>Tugmalarni Sozlash</DialogTitle>
        </VisuallyHidden>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 py-4">
          <div className="md:col-span-4 flex flex-col gap-6 sticky top-0">
            <Tabs
              defaultValue="inline"
              onValueChange={(value) =>
                setActiveTab(value as "inline" | "reply")
              }
              value={activeTab}
            >
              {/* ... Tabs va TabsContent qismi o'zgarishsiz qoladi ... */}
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="inline">Inline Keyboard</TabsTrigger>
                <TabsTrigger value="reply">Reply Keyboard</TabsTrigger>
              </TabsList>
              <TabsContent value="inline" className="mt-4 space-y-4">
                <div>
                  <Label htmlFor="inline-text">Tugma matni</Label>
                  <Input
                    id="inline-text"
                    placeholder="Masalan, Saytimizga o'tish"
                    value={inlineText}
                    onChange={(e) => setInlineText(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Amal turi</Label>
                  <RadioGroup
                    value={inlineActionType}
                    onValueChange={(value: "url" | "callback") =>
                      setInlineActionType(value)
                    }
                    className="flex items-center gap-4 mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="url" id="r-url" />
                      <Label htmlFor="r-url">URL (Havola)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="callback" id="r-callback" />
                      <Label htmlFor="r-callback">Callback Data</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div>
                  <Label htmlFor="inline-action-value">
                    {inlineActionType === "url"
                      ? "URL Manzil"
                      : "Callback ma'lumoti"}
                  </Label>
                  <Input
                    id="inline-action-value"
                    placeholder={
                      inlineActionType === "url"
                        ? "https://example.com"
                        : "menu_1"
                    }
                    value={inlineActionValue}
                    onChange={(e) => setInlineActionValue(e.target.value)}
                  />
                </div>
                <Button
                  type="button"
                  className="w-full"
                  onClick={() => handleAddButton("inline")}
                  disabled={isCurrentRowFull}
                >
                  <PlusCircle className="mr-2 h-4 w-4" /> Inline Tugma Qo'shish
                </Button>
              </TabsContent>
              <TabsContent value="reply" className="mt-4 space-y-4">
                <div>
                  <Label htmlFor="reply-text">Tugma matni</Label>
                  <Input
                    id="reply-text"
                    placeholder="Masalan, Asosiy Menyu"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  />
                </div>
                <Button
                  type="button"
                  className="w-full"
                  onClick={() => handleAddButton("reply")}
                  disabled={isCurrentRowFull}
                >
                  <PlusCircle className="mr-2 h-4 w-4" /> Matnli Tugma Qo'shish
                </Button>
                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Yoki
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() =>
                      handleAddButton("special", "request_contact")
                    }
                    disabled={isCurrentRowFull}
                  >
                    <Smartphone className="mr-2 h-4 w-4" /> Kontakt so'rash
                  </Button>
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() =>
                      handleAddButton("special", "request_location")
                    }
                    disabled={isCurrentRowFull}
                  >
                    <MapPin className="mr-2 h-4 w-4" /> Lokatsiya so'rash
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
            {isCurrentRowFull && (
              <div className="p-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-md text-sm flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>
                  Tanlangan qator to'la. Yangi tugma qo'shish uchun boshqa
                  qatorni tanlang yoki "Yangi Qator" tugmasini bosing.
                </span>
              </div>
            )}
          </div>
          <div className="md:col-span-8 flex flex-col gap-3 rounded-lg border bg-muted p-4 h-full w-full">
            <div className="flex justify-between items-center mb-2">
              <Label className="text-muted-foreground">
                Tugmalar ko'rinishi
              </Label>
              <Button variant="ghost" size="sm" onClick={handleAddRow}>
                <Plus className="mr-2 h-4 w-4" /> Yangi Qator
              </Button>
            </div>
            <div className="flex flex-col gap-2 flex-grow min-h-[200px] bg-background/50 p-2 rounded-md">
              {currentButtons.map((row, rowIndex) => (
                <div key={rowIndex}>
                  <div
                    className={cn(
                      "flex gap-2 items-center p-2 rounded-md transition-all border border-transparent cursor-pointer",
                      {
                        "bg-primary/10 border-primary/50":
                          selectedRowIndex === rowIndex,
                        "hover:bg-accent": selectedRowIndex !== rowIndex,
                        "cursor-not-allowed opacity-75":
                          row.length >= MAX_BUTTONS_PER_ROW &&
                          selectedRowIndex !== rowIndex,
                      }
                    )}
                    onClick={() => setSelectedRowIndex(rowIndex)}
                  >
                    {row.length > 0 ? (
                      row.map((button) => (
                        <div
                          key={button.id}
                          className={cn(
                            "relative group overflow-hidden",
                            row.length === 1 && "flex-grow",
                            row.length > 1 && `flex-1`
                          )}
                        >
                          <Button
                            variant="outline"
                            className="pr-8 cursor-default w-full truncate"
                          >
                            {/* --- TUZATISH: Ikonka funksiyasi chaqirildi --- */}
                            {getIconForButton(button)}
                            <span className="truncate">{button.text}</span>
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-5 w-5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveButton(rowIndex, button.id);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-muted-foreground w-full flex items-center">
                        <CornerDownLeft className="h-4 w-4 mr-2 text-primary" />
                        {selectedRowIndex === rowIndex
                          ? "Chapdan yangi tugma qo'shing"
                          : "Shu qatorga qo'shish uchun bosing"}
                      </div>
                    )}
                  </div>
                  {row.length >= MAX_BUTTONS_PER_ROW && (
                    <div className="flex items-center text-xs text-amber-600 dark:text-amber-500 mt-1.5 px-2">
                      <AlertCircle className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                      Bu qatorning limiti to'lgan ({MAX_BUTTONS_PER_ROW} ta).
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-auto pt-4 border-t">
              <Button className="w-full" onClick={handleSaveChanges}>
                Saqlash
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
