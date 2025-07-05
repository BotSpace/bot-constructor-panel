# Loyiha Tahlili Hisoboti

Sana: 7/5/2025, 5:08:45 PM

## 📁 Fayl Strukturasi

```
constructor-next-js
├── .gitignore
├── README.md
├── analis_project.js
├── app
│   ├── constructor
│   │   ├── components
│   │   │   ├── header.tsx
│   │   │   └── index.ts
│   │   └── page.tsx
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   └── test
│       └── page.tsx
├── components
│   ├── theme
│   │   ├── theme-provider.tsx
│   │   └── toggle-button.tsx
│   └── ui
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── checkbox.tsx
│       ├── command.tsx
│       ├── dialog.tsx
│       ├── dropdown-menu.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── radio-group.tsx
│       ├── scroll-area.tsx
│       ├── select.tsx
│       ├── separator.tsx
│       ├── sonner.tsx
│       ├── switch.tsx
│       ├── tabs.tsx
│       ├── textarea.tsx
│       ├── toggle-group.tsx
│       ├── toggle.tsx
│       └── tooltip.tsx
├── components.json
├── constructor
│   ├── components
│   │   ├── ButtonGenerator
│   │   │   ├── ButtonGenerator.tsx
│   │   │   ├── index.ts
│   │   │   └── types.ts
│   │   ├── QuickAddPalette
│   │   │   ├── QuickAddPalette.tsx
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── constructor.tsx
│   ├── data
│   │   ├── elements.ts
│   │   ├── filters.ts
│   │   ├── index.ts
│   │   └── messages.ts
│   ├── nodes
│   │   ├── actions
│   │   │   ├── AudioMessageNode
│   │   │   │   ├── AudioMessageNode.tsx
│   │   │   │   ├── index.ts
│   │   │   │   └── types.ts
│   │   │   ├── FileMessageNode
│   │   │   │   ├── FileMessageNode.tsx
│   │   │   │   ├── index.ts
│   │   │   │   └── types.ts
│   │   │   ├── PhotoMessageNode
│   │   │   │   ├── PhotoMessageNode.tsx
│   │   │   │   ├── index.ts
│   │   │   │   └── types.ts
│   │   │   ├── TextMessageNode
│   │   │   │   ├── TextMessageNode.tsx
│   │   │   │   ├── index.ts
│   │   │   │   └── types.ts
│   │   │   ├── VideoMessageNode
│   │   │   │   ├── VideMessageNode.tsx
│   │   │   │   ├── index.ts
│   │   │   │   └── types.ts
│   │   │   ├── index.ts
│   │   │   └── shared
│   │   │       ├── NodeFooter.tsx
│   │   │       ├── NodeHeader.tsx
│   │   │       └── RecipientSelector.tsx
│   │   ├── custom
│   │   │   ├── CustomCodeNode
│   │   │   │   ├── CodeEditorDialog.tsx
│   │   │   │   ├── CustomCodeNode.tsx
│   │   │   │   ├── editor.setup.ts
│   │   │   │   ├── index.ts
│   │   │   │   └── types.ts
│   │   │   └── index.ts
│   │   ├── index.ts
│   │   └── triggers
│   │       ├── CallbackButtonTrigger
│   │       │   ├── CallbackButtonTrigger.tsx
│   │       │   ├── index.ts
│   │       │   └── types.ts
│   │       ├── CallbackQueryTrigger
│   │       │   ├── CallbackQueryTrigger.tsx
│   │       │   ├── index.ts
│   │       │   └── types.ts
│   │       ├── MessageTrigger
│   │       │   ├── MessageTrigger.tsx
│   │       │   ├── components
│   │       │   │   ├── FilterSelector.tsx
│   │       │   │   ├── ParameterInput
│   │       │   │   │   ├── RadiusInput.tsx
│   │       │   │   │   ├── SizeInput.tsx
│   │       │   │   │   ├── ValueInput.tsx
│   │       │   │   │   └── index.tsx
│   │       │   │   ├── TriggerHeader.tsx
│   │       │   │   └── TypeSelector.tsx
│   │       │   ├── index.ts
│   │       │   ├── types.ts
│   │       │   └── utils.ts
│   │       ├── ReplyButtonTrigger
│   │       │   ├── ReplyButtonTrigger.tsx
│   │       │   ├── index.ts
│   │       │   └── types.ts
│   │       ├── index.ts
│   │       └── shared
│   ├── store
│   │   └── flowStore.ts
│   └── types
├── lib
│   └── utils.ts
├── next-env.d.ts
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tsconfig.json
└── types
    └── element-types.ts
```

## 📄 Muhim Fayllar Tarkibi (içidan: constructor)

### 📄 constructor/components/ButtonGenerator/ButtonGenerator.tsx

```tsx
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

interface ButtonGeneratorProps {
  initialButtons?: ButtonConfig[][];
  onSave: (buttons: ButtonConfig[][]) => void;
  children: ReactNode;
}

const MAX_BUTTONS_PER_ROW = 10;

export function ButtonGenerator({
  initialButtons = [[]],
  onSave,
  children,
}: ButtonGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  // Bu holatlarni dialog ochilganda tozalab turamiz
  const [buttons, setButtons] = useState<ButtonConfig[][]>([[]]);
  const [activeTab, setActiveTab] = useState("inline");
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(0);
  const [inlineText, setInlineText] = useState("");
  const [inlineActionType, setInlineActionType] = useState<"url" | "callback">(
    "url"
  );
  const [inlineActionValue, setInlineActionValue] = useState("");
  const [replyText, setReplyText] = useState("");

  //
  // --- XATO TUZATILGAN QISM ---
  //
  useEffect(() => {
    // Effekt faqat dialog ochilganda (isOpen true bo'lganda) ishga tushadi.
    if (isOpen) {
      // Barcha holatlarni boshlang'ich qiymatga qaytaramiz.
      // initialButtons'dan chuqur nusxa olamiz.
      setButtons(JSON.parse(JSON.stringify(initialButtons || [[]])));
      setSelectedRowIndex(0);
      setInlineText("");
      setInlineActionValue("");
      setReplyText("");
      setActiveTab("inline");
    }
    // Bog'liqliklar massividan `initialButtons` olib tashlandi.
    // Endi bu effekt faqat `isOpen` holati o'zgarganda ishlaydi.
  }, [isOpen]);
  // --- XATO TUZATILGAN QISM TUGADI ---
  //

  const isCurrentRowFull =
    selectedRowIndex !== null &&
    buttons[selectedRowIndex]?.length >= MAX_BUTTONS_PER_ROW;

  // ... Qolgan barcha funksiyalar (handleAddButton, handleRemoveButton, va hokazo) o'zgarishsiz qoladi ...

  const handleAddButton = (
    type: "inline" | "reply" | "special",
    specialType?: "request_contact" | "request_location"
  ) => {
    if (
      selectedRowIndex !== null &&
      buttons[selectedRowIndex]?.length >= MAX_BUTTONS_PER_ROW
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
      setButtons((currentButtons) => {
        const updatedButtons = [...currentButtons];
        if (updatedButtons.length === 0) updatedButtons.push([]);

        const targetIndex =
          selectedRowIndex !== null && selectedRowIndex < updatedButtons.length
            ? selectedRowIndex
            : updatedButtons.length - 1;

        const targetRow = [...updatedButtons[targetIndex], newButton];
        updatedButtons[targetIndex] = targetRow;
        return updatedButtons;
      });
    }
  };

  const handleAddRow = () => {
    const newRowIndex = buttons.length;
    setButtons([...buttons, []]);
    setSelectedRowIndex(newRowIndex);
  };

  const handleRemoveButton = (rowIndex: number, buttonId: string) => {
    const newButtons = buttons
      .map((row, rIdx) => {
        if (rIdx === rowIndex) {
          return row.filter((button) => button.id !== buttonId);
        }
        return row;
      })
      .filter(
        (row) => row.length > 0 || (row.length === 0 && buttons.length === 1)
      );

    if (newButtons.length === 0) {
      setButtons([[]]);
      setSelectedRowIndex(0);
    } else {
      setButtons(newButtons);
    }

    if (selectedRowIndex !== null && selectedRowIndex >= newButtons.length) {
      setSelectedRowIndex(newButtons.length > 0 ? newButtons.length - 1 : 0);
    }
  };

  const handleOnOpenChange = (open: boolean) => {
    setIsOpen(open);
  };

  const handleSaveChanges = () => {
    const finalButtons = buttons.filter((row) => row.length > 0);
    onSave(finalButtons);
    handleOnOpenChange(false);
  };

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
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOnOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[90%] md:max-w-[80%] lg:max-w-[70%] h-[90vh] overflow-y-auto">
        {/* ... JSX qismi o'zgarishsiz qoladi ... */}
        <VisuallyHidden>
          <DialogTitle>Tugmalarni Sozlash</DialogTitle>
        </VisuallyHidden>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 py-4">
          <div className="md:col-span-4 flex flex-col gap-6 sticky top-0">
            <Tabs
              defaultValue="inline"
              onValueChange={setActiveTab}
              value={activeTab}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="inline">Inline Keyboard</TabsTrigger>
                <TabsTrigger value="replay">Reply Keyboard</TabsTrigger>
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
              <TabsContent value="replay" className="mt-4 space-y-4">
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
              {buttons.map((row, rowIndex) => (
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

```

### 📄 constructor/components/ButtonGenerator/index.ts

```ts
export * from "./ButtonGenerator";
export * from "./types";

```

### 📄 constructor/components/ButtonGenerator/types.ts

```ts
// Tugma konfiguratsiyasi uchun interfeys
export interface ButtonConfig {
  id: string;
  text: string;
  type: "url" | "callback" | "reply" | "request_contact" | "request_location";
  value?: string;
}

```

### 📄 constructor/components/QuickAddPalette/QuickAddPalette.tsx

```tsx
"use client";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Elements } from "@/constructor/data/elements";
import { ElementItemType } from "@/types/element-types";
import { useMemo } from "react";

interface QuickAddPaletteProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSelect: (element: ElementItemType) => void;
}

export function QuickAddPalette({
  isOpen,
  onOpenChange,
  onSelect,
}: QuickAddPaletteProps) {
  // `Elements` ma'lumotlarini tekis ro'yxatga o'giramiz
  const allElements = useMemo(
    () => Elements.flatMap((group) => group.elements),
    []
  );

  const handleSelect = (element: ElementItemType) => {
    onSelect(element);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 shadow-lg">
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          <CommandInput placeholder="Element qidirish..." />
          <CommandList>
            <CommandEmpty>Hech narsa topilmadi.</CommandEmpty>
            {Elements.map((group) => (
              <CommandGroup key={group.title} heading={group.title}>
                {group.elements.map((element) => (
                  <CommandItem
                    key={element.triggerId || element.name}
                    onSelect={() => handleSelect(element)}
                    className="cursor-pointer"
                  >
                    <span className="mr-2 text-lg">{element.icon}</span>
                    <span>{element.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}

```

### 📄 constructor/components/QuickAddPalette/index.ts

```ts
export { QuickAddPalette } from "./QuickAddPalette";

```

### 📄 constructor/components/index.ts

```ts
export * from "./ButtonGenerator";
export { QuickAddPalette } from "./QuickAddPalette";

```

### 📄 constructor/constructor.tsx

```tsx
"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useReactFlow,
  ReactFlowProvider,
  Node,
} from "reactflow";
import "reactflow/dist/style.css";
import { ElementItemType } from "@/types/element-types";
import { CustomNodes } from "./nodes";
import { useFlowStore } from "./store/flowStore";
import { QuickAddPalette } from "./components";

// Command Palette (Ctrl+Space) uchun QuickAddPalette komponentini
// alohida faylda yaratishni tavsiya qilaman, lekin hozircha shu yerda
// tasvirlab beraman.

function FlowchartInner() {
  const reactFlowWrapper = useRef<HTMLDivElement | null>(null);
  const { project, screenToFlowPosition } = useReactFlow();
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  // Palitradan element tanlanganda chaqiriladigan funksiya
  const handlePaletteSelect = (element: ElementItemType) => {
    const position = screenToFlowPosition(mousePosition);
    addNode(element, position);
  };

  // Sichqoncha pozitsiyasini saqlash uchun state (Ctrl+V uchun)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Store'dan yangi funksiyalarni olamiz
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    deleteSelectedElements,
    selectAll,
    copySelection,
    paste,
    duplicateSelection,
    setCtrlPressed,
  } = useFlowStore();

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      const data = JSON.parse(
        event.dataTransfer.getData("application/json")
      ) as ElementItemType;
      addNode(data, position);
    },
    [screenToFlowPosition, addNode]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  }, []);

  // Sichqoncha harakatini kuzatib boramiz
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // KLAVIATURA HODISALARINI TINGLASH UCHUN KENGAYTIRILGAN useEffect
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Control") {
        setCtrlPressed(true);
      }

      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const ctrlOrCmd = isMac ? event.metaKey : event.ctrlKey;

      if (ctrlOrCmd && event.key.toLowerCase() === "a") {
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
        deleteSelectedElements();
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      // Agar Ctrl qo'yib yuborilsa, holatni 'false' qilamiz
      if (event.key === "Control") {
        setCtrlPressed(false);
      }
    };

    // Foydalanuvchi oynadan tashqariga o'tib ketsa ham,
    // Ctrl bosilmagan deb hisoblash uchun
    const handleBlur = () => {
      setCtrlPressed(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur); // Oyna fokusni yo'qotganda

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
    };
  }, [
    selectAll,
    copySelection,
    paste,
    duplicateSelection,
    deleteSelectedElements,
    mousePosition,
    screenToFlowPosition,
    setCtrlPressed,
  ]);

  return (
    <div
      ref={reactFlowWrapper}
      className="w-full h-[calc(100vh-56px)]"
      onDrop={onDrop}
      onDragOver={onDragOver}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onConnect={onConnect}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={CustomNodes}
        fitView
        panOnScroll
        selectionOnDrag
        multiSelectionKeyCode={["Shift"]}
        deleteKeyCode={null} // O'zimizning handler'imizni ishlatamiz
      >
        <Background gap={24} color="#666" />
        <MiniMap />
        <Controls />
      </ReactFlow>

      <QuickAddPalette
        isOpen={isPaletteOpen}
        onOpenChange={setIsPaletteOpen}
        onSelect={handlePaletteSelect}
      />
    </div>
  );
}

export default function Flowchart() {
  return (
    <ReactFlowProvider>
      <FlowchartInner />
    </ReactFlowProvider>
  );
}

```

### 📄 constructor/data/elements.ts

```ts
import { ElementTypes } from "@/types/element-types";

export const Elements: ElementTypes[] = [
  {
    title: "Trigger",
    elements: [
      {
        type: "message",
        name: "Message",
        description: "Send a message to the user",
        icon: "💬",
        color: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        triggerId: "MessageTriggerNode",
      },
      {
        type: "command",
        name: "Command",
        description: "Execute a command",
        icon: "⌘",
        color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        triggerId: "MessageTriggerNode",
      },
      {
        type: "reply_button",
        name: "Reply Button",
        description: "Oldingi qadamdagi reply tugmani ushlaydi",
        icon: "↩️", // Yoki Lucide'dan icon
        color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
        triggerId: "ReplyButtonTriggerNode", // Bu nom muhim!
      },
      {
        type: "callback_button",
        name: "Callback Button",
        description: "Oldingi qadamdagi aniq bir inline tugmani ushlaydi",
        icon: "👆",
        color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
        triggerId: "CallbackButtonTriggerNode",
      },

      {
        type: "callback_query",
        name: "Advanced Callback",
        description: "Callback ma'lumotini filtrlab ushlaydi",
        icon: "🕸️",
        color: "bg-teal-500/10 text-teal-400 border-teal-500/20",
        triggerId: "CallbackQueryTriggerNode",
      },
    ],
  },
  {
    title: "Actions",
    elements: [
      {
        type: "message",
        name: "Send Message",
        description: "Send a message to the user",
        icon: "💬",
        color: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        triggerId: "SendTextMessageNode",
      },
      {
        type: "photo",
        name: "Send Photo",
        description: "Send a photo to the user",
        icon: "🖼️",
        color: "bg-purple-500/10 text-purple-400 border-purple-500/20",
        triggerId: "SendPhotoNode",
      },
      {
        type: "video",
        name: "Send Video",
        description: "Send a video to the user",
        icon: "📹",
        color: "bg-red-500/10 text-red-400 border-red-500/20",
        triggerId: "SendVideoNode",
      },
      {
        type: "audio",
        name: "Send Audio",
        description: "Send an audio file to the user",
        icon: "🎵",
        color: "bg-pink-500/10 text-pink-400 border-pink-500/20",
        triggerId: "SendAudioNode",
      },
      {
        type: "file",
        name: "Send File",
        description: "Send a file to the user",
        icon: "📄",
        color: "bg-gray-500/10 text-gray-400 border-gray-500/20",
        triggerId: "SendFileNode",
      },
    ],
  },
  {
    title: "Custom Logic",
    elements: [
      {
        type: "code",
        name: "Custom Code",
        description: "Run custom code for advanced logic",
        icon: "🖥️",
        color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
        triggerId: "CustomCodeNode",
      },
      // {
      //   type: "condition",
      //   name: "Condition",
      //   description: "Add conditional logic to your flow",
      //   icon: "🔀",
      //   color: "bg-orange-500/10 text-orange-400 border-orange-500/20",
      // },
    ],
  },
];

```

### 📄 constructor/data/filters.ts

```ts
// Universal, ko'p ishlatiladigan filtrlar
const anyFilter = [{ value: "any", label: "Har qanday" }];

// Matnli ma'lumotlar uchun filtrlar
export const textFilters = [
  ...anyFilter, // "Har qanday"ni qo'shamiz
  { value: "equals", label: "Teng" },
  { value: "contains", label: "Ichida" },
  { value: "starts_with", label: "Boshlanadi" },
  { value: "regex", label: "Regex" },
  { value: "command", label: "Buyruq" },
];

// Joylashuv uchun filtrlar
export const locationFilters = [
  ...anyFilter,
  { value: "radius", label: "Radius (ichida)" },
];

// Fayllar (rasm, video, audio, hujjat) uchun filtrlar
export const fileFilters = [
  ...anyFilter,
  { value: "size", label: "Hajm (MB)" },
];

// Hujjatlar uchun maxsus qo'shimcha filtr
export const documentFilters = [
  ...fileFilters,
  { value: "extension", label: "Kengaytmasi" },
];

// Barcha filtrlar to'plami
export const Filters = {
  textFilters,
  locationFilters,
  fileFilters,
  documentFilters,
  anyFilter, // Faqat "Har qanday" kerak bo'lganda ishlatish uchun
};

```

### 📄 constructor/data/index.ts

```ts
import { MessageTypes } from "./messages";
import { Filters } from "./filters";

export const ConstructorData = {
  MessageTypes,
  Filters,
};

```

### 📄 constructor/data/messages.ts

```ts
import {
  Archive,
  FileText,
  ImageIcon,
  MapPin,
  MessageCircle,
  Music,
  Phone,
  User,
  Video,
  MessagesSquare,
} from "lucide-react";

export const MessageTypes = [
  { value: "any", label: "Har qanday xabar", icon: MessagesSquare },
  { value: "text", label: "Matn", icon: MessageCircle },
  { value: "location", label: "Joylashuv", icon: MapPin },
  { value: "contact", label: "Kontakt", icon: User },
  { value: "phone", label: "Telefon", icon: Phone },
  { value: "document", label: "Hujjat", icon: FileText },
  { value: "photo", label: "Rasm", icon: ImageIcon },
  { value: "video", label: "Video", icon: Video },
  { value: "audio", label: "Audio", icon: Music },
  { value: "sticker", label: "Stiker", icon: Archive },
];

```

### 📄 constructor/nodes/actions/AudioMessageNode/AudioMessageNode.tsx

```tsx
"use client";

import { useState, memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import TextareaAutosize from "react-textarea-autosize";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { useFlowStore } from "@/constructor/store/flowStore";
import { SendAudioNodeData, RecipientType, AudioSourceType } from "./types";

import { FiMusic } from "react-icons/fi";

// Bizning andozamiz uchun yangi importlar
import { NodeHeader } from "../shared/NodeHeader";
import { NodeFooter } from "../shared/NodeFooter";
import { RecipientsManager } from "../shared/RecipientSelector";

const SendAudioNodeComponent = ({
  id,
  data,
  selected,
}: NodeProps<SendAudioNodeData>) => {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleUpdate = (update: Partial<SendAudioNodeData>) => {
    updateNodeData(id, update);
  };

  const captionLength = data.caption?.length || 0;

  return (
    <Card className={cn("w-100 shadow-lg", selected && "ring-2 ring-primary")}>
      <Handle type="target" position={Position.Top} className="!bg-sky-500" />

      <NodeHeader
        icon={<FiMusic className="text-primary" />}
        title="Audio yuborish"
        buttonCount={data.buttons?.flat().length || 0}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {!isCollapsed && (
        <>
          <CardContent className="flex flex-col gap-4">
            {/* Qabul qiluvchi */}
            <RecipientsManager
              recipients={data.recipients}
              onUpdate={handleUpdate}
            />

            {/* Audio manbasi */}
            <div className="grid gap-2">
              <Label>Audio manbasi</Label>
              <Select
                value={data.audioSourceType}
                onValueChange={(value: AudioSourceType) =>
                  handleUpdate({ audioSourceType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Manbani tanlang..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="file_id">Mavjud File ID</SelectItem>
                  <SelectItem value="url">Internet (URL)</SelectItem>
                  <SelectItem value="upload">Kompyuterdan yuklash</SelectItem>
                </SelectContent>
              </Select>
              {data.audioSourceType === "file_id" && (
                <Input
                  placeholder="audio_fayl_idsi..."
                  value={data.audioFileId || ""}
                  onChange={(e) =>
                    handleUpdate({ audioFileId: e.target.value })
                  }
                />
              )}
              {data.audioSourceType === "url" && (
                <Input
                  placeholder="https://example.com/audio.mp3"
                  value={data.audioUrl || ""}
                  onChange={(e) => handleUpdate({ audioUrl: e.target.value })}
                />
              )}
            </div>

            {/* Audio metadatalari */}
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Ijrochi</Label>
                <Input
                  placeholder="Masalan, Yulduz U."
                  value={data.performer || ""}
                  onChange={(e) => handleUpdate({ performer: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Sarlavha</Label>
                <Input
                  placeholder="Masalan, Xasta bo'lma"
                  value={data.title || ""}
                  onChange={(e) => handleUpdate({ title: e.target.value })}
                />
              </div>
            </div>

            {/* Caption */}
            <div className="grid gap-2">
              <Label>Izoh (Caption)</Label>
              <TextareaAutosize
                className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Audio uchun izoh..."
                value={data.caption || ""}
                onChange={(e) => handleUpdate({ caption: e.target.value })}
                maxLength={1024}
              />
              <div
                className={cn(
                  "text-right text-xs",
                  captionLength > 1024
                    ? "text-destructive"
                    : "text-muted-foreground"
                )}
              >
                {captionLength}/1024
              </div>
            </div>

            <NodeFooter
              nodeId={id}
              buttons={data.buttons}
              disableNotification={data.disableNotification}
              protectContent={data.protectContent}
              onUpdate={handleUpdate}
            />
          </CardContent>
        </>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-teal-500"
      />
    </Card>
  );
};

export const SendAudioNode = memo(SendAudioNodeComponent);

```

### 📄 constructor/nodes/actions/AudioMessageNode/index.ts

```ts
export { SendAudioNode } from "./AudioMessageNode";

```

### 📄 constructor/nodes/actions/AudioMessageNode/types.ts

```ts
import { ButtonConfig } from "@/constructor/components/ButtonGenerator";

/**
 * Foydalanuvchi kimga yuborilishini aniqlaydi.
 */
export type RecipientType = "sender" | "custom_id";

/**
 * Yuboriladigan audioning manbasini belgilaydi.
 */
export type AudioSourceType = "file_id" | "url" | "upload";

/**
 * 'Send Audio' tugunining ma'lumotlar strukturasini belgilaydigan interfeys.
 */
export interface SendAudioNodeData {
  recipients?: {
    sendToSender: boolean;
    additionalIds: string[];
  };

  audioSourceType?: AudioSourceType;
  audioFileId?: string;
  audioUrl?: string;

  caption?: string;

  // Audio-spetsifik parametrlar
  duration?: string; // soniyalarda
  performer?: string; // ijrochi
  title?: string; // qo'shiq nomi

  // Maxsus muqova (thumbnail)
  hasCustomThumbnail?: boolean;
  thumbnailFileId?: string;

  // Umumiy sozlamalar
  disableNotification?: boolean;
  protectContent?: boolean;

  buttons?: ButtonConfig[][];
}

```

### 📄 constructor/nodes/actions/FileMessageNode/FileMessageNode.tsx

```tsx
"use client";

import { useState, memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import TextareaAutosize from "react-textarea-autosize";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useFlowStore } from "@/constructor/store/flowStore";
import { SendFileNodeData, RecipientType, FileSourceType } from "./types";

import { NodeFooter } from "../shared/NodeFooter";
import { NodeHeader } from "../shared/NodeHeader";
import { FileText } from "lucide-react";
import { RecipientsManager } from "../shared/RecipientSelector";

const SendFileNodeComponent = ({
  id,
  data,
  selected,
}: NodeProps<SendFileNodeData>) => {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleUpdate = (update: Partial<SendFileNodeData>) => {
    updateNodeData(id, update);
  };

  const captionLength = data.caption?.length || 0;

  return (
    <Card className={cn("w-100 shadow-lg", selected && "ring-2 ring-primary")}>
      <Handle type="target" position={Position.Top} className="!bg-sky-500" />

      <NodeHeader
        icon={<FileText className="text-primary" />}
        title="Xabar yuborish"
        buttonCount={data.buttons?.flat().length || 0}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {!isCollapsed && (
        <>
          <CardContent className="flex flex-col gap-4">
            {/* Qabul qiluvchi */}
            <RecipientsManager
              recipients={data.recipients}
              onUpdate={handleUpdate}
            />

            {/* Fayl manbasi */}
            <div className="grid gap-2">
              <Label>Fayl manbasi</Label>
              <Select
                value={data.fileSourceType}
                onValueChange={(value: FileSourceType) =>
                  handleUpdate({ fileSourceType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Manbani tanlang..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="file_id">Mavjud File ID</SelectItem>
                  <SelectItem value="url">Internet (URL)</SelectItem>
                  <SelectItem value="upload">Kompyuterdan yuklash</SelectItem>
                </SelectContent>
              </Select>
              {data.fileSourceType === "file_id" && (
                <Input
                  placeholder="fayl_idsi..."
                  value={data.fileId || ""}
                  onChange={(e) => handleUpdate({ fileId: e.target.value })}
                />
              )}
              {data.fileSourceType === "url" && (
                <Input
                  placeholder="https://example.com/document.pdf"
                  value={data.fileUrl || ""}
                  onChange={(e) => handleUpdate({ fileUrl: e.target.value })}
                />
              )}
            </div>

            {/* Maxsus muqova */}
            <div className="flex items-center justify-between space-y-0 rounded-lg border p-3">
              <div className="space-y-0.5">
                <Label htmlFor={`custom-thumb-${id}`}>Maxsus muqova</Label>
                <p className="text-xs text-muted-foreground">
                  Fayl uchun rasmli muqova.
                </p>
              </div>
              <Switch
                id={`custom-thumb-${id}`}
                checked={!!data.hasCustomThumbnail}
                onCheckedChange={(checked) =>
                  handleUpdate({ hasCustomThumbnail: checked })
                }
              />
            </div>
            {data.hasCustomThumbnail && (
              <Input
                placeholder="Muqova uchun File ID"
                value={data.thumbnailFileId || ""}
                onChange={(e) =>
                  handleUpdate({ thumbnailFileId: e.target.value })
                }
                className="animate-in fade-in-50"
              />
            )}

            {/* Caption */}
            <div className="grid gap-2">
              <Label>Izoh (Caption)</Label>
              <TextareaAutosize
                className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Fayl uchun izoh..."
                value={data.caption || ""}
                onChange={(e) => handleUpdate({ caption: e.target.value })}
                maxLength={1024}
              />
              <div
                className={cn(
                  "text-right text-xs",
                  captionLength > 1024
                    ? "text-destructive"
                    : "text-muted-foreground"
                )}
              >
                {captionLength}/1024
              </div>
            </div>
          </CardContent>

          <NodeFooter
            nodeId={id}
            buttons={data.buttons}
            disableNotification={data.disableNotification}
            protectContent={data.protectContent}
            onUpdate={handleUpdate}
          />
        </>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-teal-500"
      />
    </Card>
  );
};

export const SendFileNode = memo(SendFileNodeComponent);

```

### 📄 constructor/nodes/actions/FileMessageNode/index.ts

```ts
export { SendFileNode } from "./FileMessageNode";

```

### 📄 constructor/nodes/actions/FileMessageNode/types.ts

```ts
import { ButtonConfig } from "@/constructor/components/ButtonGenerator";

/**
 * Foydalanuvchi kimga yuborilishini aniqlaydi.
 */
export type RecipientType = "sender" | "custom_id";

/**
 * Yuboriladigan faylning manbasini belgilaydi.
 */
export type FileSourceType = "file_id" | "url" | "upload";

/**
 * 'Send File' tugunining ma'lumotlar strukturasini belgilaydigan interfeys.
 */
export interface SendFileNodeData {
  recipients?: {
    sendToSender: boolean;
    additionalIds: string[];
  };

  fileSourceType?: FileSourceType;
  fileId?: string;
  fileUrl?: string;

  caption?: string;

  // Maxsus muqova (thumbnail)
  hasCustomThumbnail?: boolean;
  thumbnailFileId?: string;

  // Faylga xos sozlamalar
  disableContentTypeDetection?: boolean; // MIME turini aniqlashni o'chirish

  // Umumiy sozlamalar
  disableNotification?: boolean;
  protectContent?: boolean;

  buttons?: ButtonConfig[][];
}

```

### 📄 constructor/nodes/actions/PhotoMessageNode/PhotoMessageNode.tsx

```tsx
"use client";

import { useState, memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import TextareaAutosize from "react-textarea-autosize";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { useFlowStore } from "@/constructor/store/flowStore";
import { SendPhotoNodeData, RecipientType, PhotoSourceType } from "./types";

// Yaratgan andozamiz uchun kerakli importlar
import { Camera } from "lucide-react";
import { NodeHeader } from "../shared/NodeHeader";
import { NodeFooter } from "../shared/NodeFooter";
import { RecipientsManager } from "../shared/RecipientSelector";

const SendPhotoNodeComponent = ({
  id,
  data,
  selected,
}: NodeProps<SendPhotoNodeData>) => {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleUpdate = (update: Partial<SendPhotoNodeData>) => {
    updateNodeData(id, update);
  };

  const captionLength = data.caption?.length || 0;

  return (
    <Card className={cn("w-100 shadow-lg", selected && "ring-2 ring-primary")}>
      <Handle type="target" position={Position.Top} className="!bg-sky-500" />

      <NodeHeader
        icon={<Camera className="text-primary" />}
        title="Rasm Yuborish"
        buttonCount={data.buttons?.flat().length || 0}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {!isCollapsed && (
        <>
          <CardContent className="flex flex-col gap-4">
            {/* Qabul qiluvchi */}
            <RecipientsManager
              recipients={data.recipients}
              onUpdate={handleUpdate}
            />

            {/* Rasm manbasi */}
            <div className="grid gap-2">
              <Label>Rasm manbasi</Label>
              <Select
                value={data.photoSourceType}
                onValueChange={(value: PhotoSourceType) =>
                  handleUpdate({ photoSourceType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Manbani tanlang..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="file_id">Mavjud File ID</SelectItem>
                  <SelectItem value="url">Internet (URL)</SelectItem>
                  <SelectItem value="upload">Kompyuterdan yuklash</SelectItem>
                </SelectContent>
              </Select>
              {data.photoSourceType === "file_id" && (
                <Input
                  placeholder="rasm_fayl_idsi_bu_yerda..."
                  value={data.photoFileId || ""}
                  onChange={(e) =>
                    handleUpdate({ photoFileId: e.target.value })
                  }
                />
              )}
              {data.photoSourceType === "url" && (
                <Input
                  placeholder="https://example.com/image.jpg"
                  value={data.photoUrl || ""}
                  onChange={(e) => handleUpdate({ photoUrl: e.target.value })}
                />
              )}
            </div>

            {/* Rasm matni (Caption) */}
            <div className="grid gap-2">
              <Label>Rasm matni (Caption)</Label>
              <TextareaAutosize
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Rasm uchun matn kiriting..."
                value={data.caption || ""}
                onChange={(e) => handleUpdate({ caption: e.target.value })}
                maxLength={1024}
              />
              <div
                className={cn(
                  "text-right text-xs",
                  captionLength > 1024
                    ? "text-destructive"
                    : "text-muted-foreground"
                )}
              >
                {captionLength}/1024
              </div>
            </div>
          </CardContent>

          <NodeFooter
            nodeId={id}
            buttons={data.buttons}
            disableNotification={data.disableNotification}
            protectContent={data.protectContent}
            onUpdate={handleUpdate}
          />
        </>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-teal-500"
      />
    </Card>
  );
};

export const SendPhotoNode = memo(SendPhotoNodeComponent);

```

### 📄 constructor/nodes/actions/PhotoMessageNode/index.ts

```ts
export { SendPhotoNode } from "./PhotoMessageNode";

```

### 📄 constructor/nodes/actions/PhotoMessageNode/types.ts

```ts
import { ButtonConfig } from "@/constructor/components/ButtonGenerator/types";

/**
 * Foydalanuvchi kimga yuborilishini aniqlaydi.
 * 'sender' - xabarni yuborgan foydalanuvchining o'ziga.
 * 'custom_id' - aniq bir chat yoki foydalanuvchi ID'siga.
 */
export type RecipientType = "sender" | "custom_id";

/**
 * Yuboriladigan rasmning manbasini belgilaydi.
 * 'file_id' - Telegram serverida allaqachon mavjud bo'lgan faylning ID'si.
 * 'url' - rasmga to'g'ridan-to'g'ri havola (link).
 * 'upload' - foydalanuvchi kompyuteridan yangi rasm yuklashi.
 */
export type PhotoSourceType = "file_id" | "url" | "upload";

/**
 * 'Send Photo' tugunining ma'lumotlar strukturasini belgilaydigan interfeys.
 * React Flow'dagi `data` propining tipi.
 */
export interface SendPhotoNodeData {
  // Barcha maydonlar ixtiyoriy (`?`), chunki node yaratilganda ular bo'sh bo'lishi mumkin.
  recipients?: {
    sendToSender: boolean;
    additionalIds: string[];
  };

  photoSourceType?: PhotoSourceType;
  photoFileId?: string; // `photoSourceType` 'file_id' bo'lganda ishlatiladi.
  photoUrl?: string; // `photoSourceType` 'url' bo'lganda ishlatiladi.
  // 'upload' uchun alohida maydon qo'shish mumkin, masalan: `uploadedFile?: File`

  caption?: string; // Rasm ostidagi matn (1024 belgacha).

  disableNotification?: boolean; // Foydalanuvchiga ovozsiz xabar yuborish.
  protectContent?: boolean; // Xabarni nusxalash va saqlashni taqiqlash.

  buttons?: ButtonConfig[][];
}

```

### 📄 constructor/nodes/actions/TextMessageNode/TextMessageNode.tsx

```tsx
import { Handle, NodeProps, Position } from "reactflow";

import TextareaAutosize from "react-textarea-autosize";

import { ParseMode, SendTextMessageNodeData } from "./types";
import { useFlowStore } from "@/constructor/store/flowStore";
import { memo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LetterText, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@radix-ui/react-dropdown-menu";
import { Select } from "@/components/ui/select";
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@radix-ui/react-select";
import { Checkbox } from "@radix-ui/react-checkbox";
import { NodeHeader } from "../shared/NodeHeader";
import { NodeFooter } from "../shared/NodeFooter";
import { RecipientsManager } from "../shared/RecipientSelector";

const SendTextMessageNodeComponent = ({
  id,
  data,
  selected,
}: NodeProps<SendTextMessageNodeData>) => {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const [isCollapsed, setIsCollapsed] = useState(false);
  // Ma'lumotlarni global store'da yangilash uchun markaziy funksiya
  const handleUpdate = (update: Partial<SendTextMessageNodeData>) => {
    updateNodeData(id, update);
  };

  // UI'da ko'rsatish uchun hisob-kitoblar
  const textLength = data.messageText?.length || 0;
  return (
    <Card className={cn("w-100 shadow-lg", selected && "ring-2 ring-primary")}>
      <Handle type="target" position={Position.Top} className="!bg-sky-500" />

      <NodeHeader
        icon={<LetterText className="text-primary" />}
        title="Xabar yuborish"
        buttonCount={data.buttons?.flat().length || 0}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {!isCollapsed && (
        <>
          <CardContent className="flex flex-col gap-4">
            {/* Qabul qiluvchi */}
            <RecipientsManager
              recipients={data.recipients}
              onUpdate={handleUpdate}
            />

            {/* Xabar matni */}
            <div className="grid gap-2">
              <div className="flex justify-between items-center">
                <Label>Xabar matni</Label>
                <span
                  className={cn(
                    "text-xs",
                    textLength > 4096
                      ? "text-destructive"
                      : "text-muted-foreground"
                  )}
                >
                  {textLength}/4096
                </span>
              </div>
              <TextareaAutosize
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Bu yerga xabar matnini yozing..."
                value={data.messageText || ""}
                onChange={(e) => handleUpdate({ messageText: e.target.value })}
                maxLength={4096}
              />
            </div>
            {/* Sozlamalar */}
            <div className="grid gap-3">
              <Label className="flex items-center gap-2">
                <Settings className="w-4 h-4" /> Sozlamalar
              </Label>
              <Select
                value={data.parseMode || "None"}
                onValueChange={(value: ParseMode) =>
                  handleUpdate({ parseMode: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Parse Mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="None">Oddiy matn</SelectItem>
                  <SelectItem value="HTML">HTML</SelectItem>
                  <SelectItem value="MarkdownV2">MarkdownV2</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`disable-preview-${id}`}
                  checked={!!data.disableWebPagePreview}
                  onCheckedChange={(checked) =>
                    handleUpdate({ disableWebPagePreview: !!checked })
                  }
                />
                <Label className="text-sm font-normal cursor-pointer">
                  Link uchun prevyuni o'chirish
                </Label>
              </div>
            </div>
          </CardContent>

          <NodeFooter
            nodeId={id}
            buttons={data.buttons}
            disableNotification={data.disableNotification}
            protectContent={data.protectContent}
            onUpdate={handleUpdate}
          />
        </>
      )}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-teal-500"
      />
    </Card>
  );
};

export const SendTextMessageNode = memo(SendTextMessageNodeComponent);

```

### 📄 constructor/nodes/actions/TextMessageNode/index.ts

```ts
export { SendTextMessageNode } from "./TextMessageNode";

```

### 📄 constructor/nodes/actions/TextMessageNode/types.ts

```ts
import { ButtonConfig } from "@/constructor/components/ButtonGenerator/types";

/**
 * Foydalanuvchi kimga yuborilishini aniqlaydi.
 * 'sender' - xabarni yuborgan foydalanuvchining o'ziga.
 * 'custom_id' - aniq bir chat yoki foydalanuvchi ID'siga.
 */
export type RecipientType = "sender" | "custom_id";

/**
 * Xabar matnini qanday formatda yuborishni belgilaydi.
 */
export type ParseMode = "HTML" | "MarkdownV2" | "None";

/**
 * 'Send Text Message' tugunining ma'lumotlar strukturasini belgilaydigan interfeys.
 * React Flow'dagi `data` propining tipi.
 */
export interface SendTextMessageNodeData {
  /** Yuboruvchidan tashqari qo'shimcha oluvchi ID'lar ro'yxati */
  recipients?: {
    /** Xabar yuboruvchining o'ziga yuborilsinmi? (standart: true) */
    sendToSender: boolean;
    /** Qo'shimcha ID'lar ro'yxati */
    additionalIds: string[];
  };

  messageText?: string; // Yuboriladigan xabar matni (4096 belgacha).
  parseMode?: ParseMode;

  disableWebPagePreview?: boolean; // Xabardagi linklar uchun oldindan ko'rishni o'chirish.
  disableNotification?: boolean; // Foydalanuvchiga ovozsiz xabar yuborish.
  protectContent?: boolean; // Xabarni nusxalash va saqlashni taqiqlash.
  buttons?: ButtonConfig[][];
}

```

### 📄 constructor/nodes/actions/VideoMessageNode/VideMessageNode.tsx

```tsx
"use client";

import { useState, memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import TextareaAutosize from "react-textarea-autosize";
import { FiHelpCircle } from "react-icons/fi";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useFlowStore } from "@/constructor/store/flowStore";
import { SendVideoNodeData, RecipientType, VideoSourceType } from "./types";
import { Video } from "lucide-react";

// Andozamiz uchun yangi importlar
import { NodeHeader } from "../shared/NodeHeader";
import { NodeFooter } from "../shared/NodeFooter";
import { RecipientsManager } from "../shared/RecipientSelector";

const SendVideoNodeComponent = ({
  id,
  data,
  selected,
}: NodeProps<SendVideoNodeData>) => {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleUpdate = (update: Partial<SendVideoNodeData>) => {
    updateNodeData(id, update);
  };

  const captionLength = data.caption?.length || 0;

  return (
    <Card className={cn("w-96 shadow-lg", selected && "ring-2 ring-primary")}>
      <Handle type="target" position={Position.Top} className="!bg-sky-500" />

      <NodeHeader
        icon={<Video className="text-primary" />}
        title="video Yuborish"
        buttonCount={data.buttons?.flat().length || 0}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {!isCollapsed && (
        <>
          <CardContent className="p-4 pt-0 flex flex-col gap-5">
            <RecipientsManager
              recipients={data.recipients}
              onUpdate={handleUpdate}
            />

            {/* Video manbasi */}
            <div className="grid gap-2">
              <Label>Video manbasi</Label>
              <Select
                value={data.videoSourceType}
                onValueChange={(value: VideoSourceType) =>
                  handleUpdate({ videoSourceType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Manbani tanlang..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="file_id">Mavjud File ID</SelectItem>
                  <SelectItem value="url">Internet (URL)</SelectItem>
                  <SelectItem value="upload">Kompyuterdan yuklash</SelectItem>
                </SelectContent>
              </Select>
              {data.videoSourceType === "file_id" && (
                <Input
                  placeholder="video_fayl_idsi..."
                  value={data.videoFileId || ""}
                  onChange={(e) =>
                    handleUpdate({ videoFileId: e.target.value })
                  }
                />
              )}
              {data.videoSourceType === "url" && (
                <Input
                  placeholder="https://example.com/video.mp4"
                  value={data.videoUrl || ""}
                  onChange={(e) => handleUpdate({ videoUrl: e.target.value })}
                />
              )}
            </div>

            {/* Video parametrlari */}
            <div className="grid gap-2">
              <Label>Video parametrlari (ixtiyoriy)</Label>
              <div className="grid grid-cols-3 gap-2">
                <Input
                  type="text"
                  placeholder="Davomiyligi (s)"
                  value={data.duration || ""}
                  onChange={(e) => handleUpdate({ duration: e.target.value })}
                />
                <Input
                  type="text"
                  placeholder="Eni (px)"
                  value={data.width || ""}
                  onChange={(e) => handleUpdate({ width: e.target.value })}
                />
                <Input
                  type="text"
                  placeholder="Bo'yi (px)"
                  value={data.height || ""}
                  onChange={(e) => handleUpdate({ height: e.target.value })}
                />
              </div>
            </div>

            {/* Qo'shimcha sozlamalar */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor={`custom-thumb-${id}`}
                  className="cursor-pointer"
                >
                  Maxsus muqova
                </Label>
                <Switch
                  id={`custom-thumb-${id}`}
                  checked={!!data.hasCustomThumbnail}
                  onCheckedChange={(checked) =>
                    handleUpdate({ hasCustomThumbnail: checked })
                  }
                />
              </div>
              {data.hasCustomThumbnail && (
                <Input
                  placeholder="Muqova uchun File ID"
                  value={data.thumbnailFileId || ""}
                  onChange={(e) =>
                    handleUpdate({ thumbnailFileId: e.target.value })
                  }
                  className="animate-in fade-in-50"
                />
              )}
              <div className="flex items-center justify-between">
                <Label
                  htmlFor={`streaming-${id}`}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  Striming
                  <TooltipProvider delayDuration={100}>
                    <Tooltip>
                      <TooltipTrigger type="button">
                        <FiHelpCircle className="text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Videoni to'liq yuklamasdan ko'rish.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <Switch
                  id={`streaming-${id}`}
                  checked={!!data.supportsStreaming}
                  onCheckedChange={(checked) =>
                    handleUpdate({ supportsStreaming: checked })
                  }
                />
              </div>
            </div>

            {/* Caption */}
            <div className="grid gap-2">
              <Label>Video matni (Caption)</Label>
              <TextareaAutosize
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Video uchun matn kiriting..."
                value={data.caption || ""}
                onChange={(e) => handleUpdate({ caption: e.target.value })}
                maxLength={1024}
              />
              <div
                className={cn(
                  "text-right text-xs",
                  captionLength > 1024
                    ? "text-destructive"
                    : "text-muted-foreground"
                )}
              >
                {captionLength}/1024
              </div>
            </div>
          </CardContent>

          <NodeFooter
            nodeId={id}
            buttons={data.buttons}
            disableNotification={data.disableNotification}
            protectContent={data.protectContent}
            onUpdate={handleUpdate}
          />
        </>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-teal-500"
      />
    </Card>
  );
};

export const SendVideoNode = memo(SendVideoNodeComponent);

```

### 📄 constructor/nodes/actions/VideoMessageNode/index.ts

```ts
export { SendVideoNode } from "./VideMessageNode";

```

### 📄 constructor/nodes/actions/VideoMessageNode/types.ts

```ts
import { ButtonConfig } from "@/constructor/components/ButtonGenerator";

/**
 * Foydalanuvchi kimga yuborilishini aniqlaydi.
 */
export type RecipientType = "sender" | "custom_id";

/**
 * Yuboriladigan videoning manbasini belgilaydi.
 */
export type VideoSourceType = "file_id" | "url" | "upload";

/**
 * 'Send Video' tugunining ma'lumotlar strukturasini belgilaydigan interfeys.
 */
export interface SendVideoNodeData {
  recipients?: {
    sendToSender: boolean;
    additionalIds: string[];
  };

  videoSourceType?: VideoSourceType;
  videoFileId?: string;
  videoUrl?: string;

  caption?: string;

  // Video-spetsifik parametrlar
  duration?: string; // soniyalarda
  width?: string; // piksellarda
  height?: string; // piksellarda
  supportsStreaming?: boolean; // Oqimli uzatishni qo'llab-quvvatlash

  // Maxsus muqova (thumbnail)
  hasCustomThumbnail?: boolean;
  thumbnailFileId?: string;

  // Umumiy sozlamalar
  disableNotification?: boolean;
  protectContent?: boolean;

  buttons?: ButtonConfig[][];
}

```

### 📄 constructor/nodes/actions/index.ts

```ts
export { SendTextMessageNode } from "./TextMessageNode";
export { SendPhotoNode } from "./PhotoMessageNode";
export { SendVideoNode } from "./VideoMessageNode";
export { SendAudioNode } from "./AudioMessageNode";
export { SendFileNode } from "./FileMessageNode";

```

### 📄 constructor/nodes/actions/shared/NodeFooter.tsx

```tsx
import { CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LayoutGrid } from "lucide-react";
import {
  ButtonGenerator,
  ButtonConfig,
} from "@/constructor/components/ButtonGenerator";

interface NodeFooterProps {
  nodeId: string;
  buttons?: ButtonConfig[][];
  disableNotification?: boolean;
  protectContent?: boolean;
  onUpdate: (
    update: Partial<{
      buttons: ButtonConfig[][];
      disableNotification: boolean;
      protectContent: boolean;
    }>
  ) => void;
}

export const NodeFooter = ({
  nodeId,
  buttons,
  disableNotification,
  protectContent,
  onUpdate,
}: NodeFooterProps) => {
  const buttonCount = buttons?.flat().length || 0;

  const handleSaveButtons = (newButtons: ButtonConfig[][]) => {
    onUpdate({ buttons: newButtons });
  };

  return (
    <CardFooter className="flex flex-col items-center gap-4 pt-4 border-t">
      <div className="flex w-full justify-around">
        <div className="flex items-center space-x-2">
          <Checkbox
            id={`disable-notification-${nodeId}`}
            checked={!!disableNotification}
            onCheckedChange={(checked) =>
              onUpdate({ disableNotification: !!checked })
            }
          />
          <Label
            htmlFor={`disable-notification-${nodeId}`}
            className="text-sm font-normal cursor-pointer"
          >
            Ovozsiz
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id={`protect-content-${nodeId}`}
            checked={!!protectContent}
            onCheckedChange={(checked) =>
              onUpdate({ protectContent: !!checked })
            }
          />
          <Label
            htmlFor={`protect-content-${nodeId}`}
            className="text-sm font-normal cursor-pointer"
          >
            Himoyalangan
          </Label>
        </div>
      </div>

      <ButtonGenerator initialButtons={buttons} onSave={handleSaveButtons}>
        <div className="relative w-full">
          <Button variant="outline" className="w-full">
            <LayoutGrid className="mr-2 h-4 w-4" />
            Tugmalarni Sozlash
          </Button>
          {buttonCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 px-1.5"
            >
              {buttonCount}
            </Badge>
          )}
        </div>
      </ButtonGenerator>
    </CardFooter>
  );
};

```

### 📄 constructor/nodes/actions/shared/NodeHeader.tsx

```tsx
import { ReactNode } from "react";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ChevronDown, LayoutGrid } from "lucide-react";

interface NodeHeaderProps {
  /** Node'ning asosiy ikonasi */
  icon: ReactNode;
  /** Node'ning nomi (sarlavhasi) */
  title: string;
  /** Tugmalar sonini ko'rsatish uchun (ixtiyoriy) */
  buttonCount?: number;
  /** Node yig'ilgan (collapsed) holatidami? */
  isCollapsed: boolean;
  /** Sarlavha bosilganda chaqiriladigan funksiya */
  onToggleCollapse: () => void;
}

export const NodeHeader = ({
  icon,
  title,
  buttonCount = 0,
  isCollapsed,
  onToggleCollapse,
}: NodeHeaderProps) => {
  return (
    <CardHeader onClick={onToggleCollapse}>
      <div
        className="h flex flex-row items-center justify-between p-3 cursor-pointer hover:bg-secondary rounded-md transition-colors"
        role="button"
      >
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          {/* Ikonani props orqali qabul qilamiz */}
          {icon}
          {title}
        </CardTitle>

        <div className="flex items-center gap-2">
          {/* Agar tugmalar bo'lsa, badge'ni ko'rsatamiz */}
          {buttonCount > 0 && (
            <Badge variant="secondary" className="font-normal">
              <LayoutGrid className="w-3 h-3 mr-1" />
              {buttonCount}
            </Badge>
          )}

          {/* Yig'ish/ochish ikonasi */}
          <ChevronDown
            className={cn(
              "h-5 w-5 text-muted-foreground transition-transform duration-200",
              isCollapsed && "-rotate-90"
            )}
          />
        </div>
      </div>
    </CardHeader>
  );
};

```

### 📄 constructor/nodes/actions/shared/RecipientSelector.tsx

```tsx
import { useState, KeyboardEvent } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Send, UserPlus, X, AlertCircle } from "lucide-react";

/**
 * Komponent qabul qiladigan props'lar uchun interfeys.
 */
interface RecipientsManagerProps {
  recipients?: {
    sendToSender: boolean;
    additionalIds: string[];
  };
  onUpdate: (update: {
    recipients: RecipientsManagerProps["recipients"];
  }) => void;
}

/**
 * Oluvchilarni to'liq boshqarish uchun mo'ljallangan komponent.
 * Yuboruvchini o'chirish/qo'shish va qo'shimcha ID'lar bilan ishlash imkonini beradi.
 */
export const RecipientsManager = ({
  recipients,
  onUpdate,
}: RecipientsManagerProps) => {
  // Standart qiymatlarni belgilaymiz
  const sendToSender = recipients?.sendToSender ?? true; // Agar belgilanmagan bo'lsa, 'true'
  const additionalIds = recipients?.additionalIds || [];

  const [inputValue, setInputValue] = useState("");
  const [isInputVisible, setIsInputVisible] = useState(false);

  /**
   * Komponent holatini yangilash uchun markaziy funksiya
   */
  const updateRecipients = (
    newRecipients: RecipientsManagerProps["recipients"]
  ) => {
    onUpdate({ recipients: newRecipients });
  };

  /**
   * "Yuboruvchiga" holatini o'zgartiradi.
   */
  const toggleSendToSender = () => {
    updateRecipients({
      sendToSender: !sendToSender,
      additionalIds: additionalIds,
    });
  };

  const handleAddRecipient = () => {
    const newId = inputValue.trim();
    if (newId === "" || additionalIds.includes(newId)) {
      setInputValue("");
      setIsInputVisible(false);
      return;
    }
    updateRecipients({
      sendToSender: sendToSender,
      additionalIds: [...additionalIds, newId],
    });
    setInputValue("");
    setIsInputVisible(false);
  };

  const handleRemoveRecipient = (idToRemove: string) => {
    updateRecipients({
      sendToSender: sendToSender,
      additionalIds: additionalIds.filter((id) => id !== idToRemove),
    });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleAddRecipient();
    } else if (event.key === "Escape") {
      setIsInputVisible(false);
      setInputValue("");
    }
  };

  const noRecipientsSelected = !sendToSender && additionalIds.length === 0;

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between">
        <Label>Qabul qiluvchilar</Label>
        {noRecipientsSelected && (
          <div
            className="flex items-center text-xs text-destructive"
            title="Hech bo'lmaganda bitta qabul qiluvchi tanlanishi kerak"
          >
            <AlertCircle className="h-3.5 w-3.5 mr-1" />
            Tanlanmagan
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2 rounded-lg border p-2 min-h-[40px]">
        {/* === "YUBORUVCHIGA" TOGGLE TUGMASI === */}
        <button
          type="button"
          onClick={toggleSendToSender}
          title={
            sendToSender
              ? "Yuboruvchiga yuborishni bekor qilish"
              : "Yuboruvchiga ham yuborish"
          }
          className={cn(
            "flex items-center gap-1.5 pl-2 pr-3 py-1 text-sm rounded-md transition-colors border",
            sendToSender
              ? "bg-secondary text-secondary-foreground"
              : "bg-transparent text-muted-foreground hover:bg-muted/50 border-dashed"
          )}
        >
          <Send className={cn("h-3.5 w-3.5", !sendToSender && "opacity-50")} />
          Yuboruvchiga
        </button>

        {/* Qo'shilgan ID'lar ro'yxati (chiplar) */}
        {additionalIds.map((id) => (
          <Badge
            key={id}
            variant="outline"
            className="gap-1 pl-2.5 pr-1.5 py-1 text-sm font-mono"
          >
            {id}
            <button
              onClick={() => handleRemoveRecipient(id)}
              className="ml-1 rounded-full p-0.5 hover:bg-destructive/20"
              title={`O'chirish: ${id}`}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}

        {/* Yangi ID kiritish Input'i */}
        {isInputVisible && (
          <Input
            autoFocus
            type="text"
            placeholder="User/Chat ID"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleAddRecipient}
            className="h-7 w-32 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-1"
          />
        )}

        {/* "Qo'shish" tugmasi */}
        {!isInputVisible && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setIsInputVisible(true)}
            title="Qo'shimcha qabul qiluvchi qo'shish"
          >
            <UserPlus className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

```

### 📄 constructor/nodes/custom/CustomCodeNode/CodeEditorDialog.tsx

```tsx
import { useState, useEffect } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Save,
  Zap,
  HelpCircle,
  Bot,
  MessageSquare,
  Braces,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { CodeExecutionContext } from "./types";
import { setupPythonEditor } from "./editor.setup"; // Modular config

interface CodeEditorDialogProps {
  initialCode: string;
  onSave: (newCode: string) => void;
  children: React.ReactNode;
  contextType: CodeExecutionContext;
}

const ContextInfoPanel = () => (
  <div className="h-full w-64 bg-background/50 p-4 border-l overflow-y-auto">
    <div className="space-y-4">
      <div>
        <h4 className="font-bold mb-2 flex items-center gap-2">
          <Bot className="h-4 w-4 text-primary" /> `bot` obyekti
        </h4>
        <p className="text-xs text-muted-foreground font-mono">
          bot.send_message(...)
        </p>
        <p className="text-xs text-muted-foreground font-mono">
          bot.send_photo(...)
        </p>
        <p className="text-xs text-muted-foreground font-mono">
          ... va boshqalar
        </p>
      </div>
      <div>
        <h4 className="font-bold mb-2 flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-green-400" /> Triggerlar
        </h4>
        <p className="text-xs text-muted-foreground font-mono">
          message: Message
        </p>
        <p className="text-xs text-muted-foreground font-mono">
          callback: CallbackQuery
        </p>
        <p className="text-xs text-muted-foreground font-mono">chat_id: int</p>
      </div>
      <div>
        <h4 className="font-bold mb-2 flex items-center gap-2">
          <Braces className="h-4 w-4 text-amber-400" /> `context` lug'ati
        </h4>
        <p className="text-xs text-muted-foreground">
          Keyingi node'larga ma'lumot uzatish uchun ishlatiladi.
        </p>
        <p className="text-xs text-muted-foreground font-mono mt-1">
          context['yangi_uzgaruvchi'] = 123
        </p>
      </div>
    </div>
  </div>
);

export const CodeEditorDialog = ({
  initialCode,
  onSave,
  children,
  contextType,
}: CodeEditorDialogProps) => {
  const [code, setCode] = useState(initialCode);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCode(initialCode);
    }
  }, [isOpen, initialCode]);

  const handleSave = () => {
    onSave(code);
    setIsOpen(false);
  };

  const handleEditorMount: OnMount = (editor, monaco) => {
    // Python muharririni konfiguratsiya qilish
    const disposables = setupPythonEditor(monaco, contextType);

    // Ctrl/Cmd + S bosilganda saqlash
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, handleSave);
    editor.focus();

    // Editor yopilganda tozalash
    return () => {
      disposables.forEach((d) => d.dispose());
    };
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[90%] w-full h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="flex items-center gap-2">
            <Zap className="text-yellow-400" />
            Maxsus Python Kodi
          </DialogTitle>
        </DialogHeader>
        <Separator />
        <div className="flex-grow flex h-full overflow-hidden">
          <div className="flex-1 h-full">
            <Editor
              height="100%"
              language="python"
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value || "")}
              onMount={handleEditorMount}
              options={{
                fontSize: 14,
                fontFamily: "Fira Code, monospace",
                wordWrap: "on",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                tabSize: 4,
                automaticLayout: true,
              }}
            />
          </div>
          <ContextInfoPanel />
        </div>
        <Separator />
        <DialogFooter className="p-4 bg-background/95 backdrop-blur-sm">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <HelpCircle className="h-4 w-4" />
            <span>
              Snippet'lar uchun <strong>if</strong> yoki <strong>try</strong>{" "}
              yozib Tab'ni bosing.
            </span>
          </div>
          <div className="flex-grow" />
          <Button variant="ghost" onClick={() => setIsOpen(false)}>
            Bekor qilish
          </Button>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" /> Saqlash
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

```

### 📄 constructor/nodes/custom/CustomCodeNode/CustomCodeNode.tsx

```tsx
import { memo, useState } from "react";
import { Handle, NodeProps, Position } from "reactflow";
import { useFlowStore } from "@/constructor/store/flowStore";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Code2, PenLine } from "lucide-react";
import { CodeEditorDialog } from "./CodeEditorDialog";
import { NodeHeader } from "@/constructor/nodes/actions/shared/NodeHeader"; // <-- Bizning umumiy sarlavha

interface CustomCodeNodeData {
  pythonCode?: string;
}

const DEFAULT_CODE = `# Ushbu kod sxema shu nuqtaga yetganda ishga tushadi.
# Sizga quyidagi o'zgaruvchilar taqdim etiladi:
#
# bot: aiogram.Bot              - Bot obyekti
# chat_id: int                  - Hozirgi chat ID'si
# message: aiogram.types.Message - Trigger bo'lgan xabar (mavjud bo'lsa)
# callback: aiogram.types.CallbackQuery - Trigger bo'lgan callback (mavjud bo'lsa)
# context: dict                 - Sxema konteksti, o'zgaruvchilarni saqlaydi
#
# Siz 'context' lug'atiga yangi qiymatlar qo'shishingiz mumkin,
# ular keyingi node'larda ishlatiladi.

# Misol: Foydalanuvchi nomini 'user_name' o'zgaruvchisiga saqlash
if message:
    context['user_name'] = message.from_user.first_name
    print(f"Foydalanuvchi {context['user_name']} kodni ishga tushirdi.")

# Misol: Bot orqali javob yuborish
# await bot.send_message(chat_id, f"Salom, {context.get('user_name', 'Noma'lum')}!")
`;

const CustomCodeNodeComponent = ({
  id,
  data,
  selected,
}: NodeProps<CustomCodeNodeData>) => {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const [isCollapsed, setIsCollapsed] = useState(true);

  // Standart kontekst turini 'message' deb belgilaymiz

  const handleSaveCode = (newCode: string) => {
    updateNodeData(id, { pythonCode: newCode });
  };

  const hasCode = !!data.pythonCode?.trim();

  return (
    <Card className={cn("w-80 shadow-lg", selected && "ring-2 ring-primary")}>
      <Handle type="target" position={Position.Top} className="!bg-sky-500" />

      <NodeHeader
        icon={<Code2 className="text-yellow-400" />}
        title="Custom Code"
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {!isCollapsed && (
        <CardContent className="p-4 pt-0">
          <CodeEditorDialog
            initialCode={data.pythonCode || DEFAULT_CODE}
            onSave={handleSaveCode}
            // === TUZATISH SHU YERDA ===
            contextType={"message"}
          >
            <div className="flex flex-col items-center justify-center text-center p-4 border border-dashed rounded-lg hover:bg-muted cursor-pointer transition-colors">
              <PenLine className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="font-semibold">Kodni Tahrirlash</p>
              <p className="text-xs text-muted-foreground">
                {hasCode
                  ? "Kod mavjud. O'zgartirish uchun bosing."
                  : "Python kodi yozish uchun bosing."}
              </p>
            </div>
          </CodeEditorDialog>
        </CardContent>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-teal-500"
      />
    </Card>
  );
};

export const CustomCodeNode = memo(CustomCodeNodeComponent);

```

### 📄 constructor/nodes/custom/CustomCodeNode/editor.setup.ts

```ts
import type { IRange, IDisposable } from "monaco-editor";
import type * as monacoEditor from "monaco-editor";
import { CodeExecutionContext } from "./types";

// =========================================================================
// YORDAMCHI FUNKSIYALAR: Podskazkalar ro'yxatini yaratish uchun
// Har bir funksiya 'monaco' obyektini parametr sifatida qabul qiladi
// =========================================================================

/** Tayyor shablonlar (Snippets) ro'yxatini qaytaradi */
const getSnippets = (range: IRange, monaco: typeof monacoEditor) => [
  {
    label: "print",
    kind: monaco.languages.CompletionItemKind.Snippet,
    insertText: ["print(${1:'Hello world'})"].join("\n"),
    insertTextRules:
      monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    documentation: "if/else bloki uchun shablon",
    range: range,
  },
  {
    label: "if/else",
    kind: monaco.languages.CompletionItemKind.Snippet,
    insertText: [
      "if ${1:condition}:",
      "\t${2:pass}",
      "else:",
      "\t${3:pass}",
    ].join("\n"),
    insertTextRules:
      monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    documentation: "if/else bloki uchun shablon",
    range: range,
  },
  {
    label: "try/except",
    kind: monaco.languages.CompletionItemKind.Snippet,
    insertText: [
      "try:",
      "\t${1:pass}",
      "except Exception as e:",
      '\tprint(f"Xatolik: {e}")',
    ].join("\n"),
    insertTextRules:
      monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    documentation: "try/except bloki uchun shablon",
    range: range,
  },
  {
    label: "for loop",
    kind: monaco.languages.CompletionItemKind.Snippet,
    insertText: "for ${1:item} in ${2:iterable}:\n\t${3:pass}",
    insertTextRules:
      monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    documentation: "For tsikli uchun shablon",
    range: range,
  },
];

/** 'bot' obyekti uchun metodlar ro'yxatini qaytaradi */
const getBotCompletions = (range: IRange, monaco: typeof monacoEditor) => [
  {
    label: "send_message",
    kind: monaco.languages.CompletionItemKind.Method,
    insertText: 'send_message(chat_id=${1:chat_id}, text="${2:Salom}")',
    insertTextRules:
      monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    documentation: "Matnli xabar yuborish",
    range: range,
  },
  {
    label: "send_photo",
    kind: monaco.languages.CompletionItemKind.Method,
    insertText: 'send_photo(chat_id=${1:chat_id}, photo="${2:file_id_or_url}")',
    insertTextRules:
      monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    documentation: "Rasm yuborish",
    range: range,
  },
  {
    label: "answer_callback_query",
    kind: monaco.languages.CompletionItemKind.Method,
    insertText:
      'answer_callback_query(callback_query_id=${1:callback.id}, text="${2:Bajarildi}")',
    insertTextRules:
      monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    documentation: "Callback so`roviga javob berish",
    range: range,
  },
];

/** 'message' obyekti uchun maydonlar ro'yxatini qaytaradi */
const getMessageCompletions = (range: IRange, monaco: typeof monacoEditor) => [
  {
    label: "text",
    kind: monaco.languages.CompletionItemKind.Field,
    insertText: "text",
    documentation: "Xabar matni",
    range,
  },
  {
    label: "from_user",
    kind: monaco.languages.CompletionItemKind.Field,
    insertText: "from_user",
    documentation: "Yuboruvchi haqida ma`lumot",
    range,
  },
  {
    label: "chat",
    kind: monaco.languages.CompletionItemKind.Field,
    insertText: "chat",
    documentation: "Chat haqida ma`lumot",
    range,
  },
  {
    label: "message_id",
    kind: monaco.languages.CompletionItemKind.Field,
    insertText: "message_id",
    documentation: "Xabar IDsi",
    range,
  },
  {
    label: "caption",
    kind: monaco.languages.CompletionItemKind.Field,
    insertText: "caption",
    documentation: "Rasm/video ostidagi matn",
    range,
  },
];

/** 'callback' obyekti uchun maydonlar ro'yxatini qaytaradi */
const getCallbackCompletions = (range: IRange, monaco: typeof monacoEditor) => [
  {
    label: "data",
    kind: monaco.languages.CompletionItemKind.Field,
    insertText: "data",
    documentation: "Callback ma`lumoti",
    range,
  },
  {
    label: "message",
    kind: monaco.languages.CompletionItemKind.Field,
    insertText: "message",
    documentation: "Callback kelgan xabar",
    range,
  },
  {
    label: "from_user",
    kind: monaco.languages.CompletionItemKind.Field,
    insertText: "from_user",
    documentation: "Yuboruvchi haqida ma`lumot",
    range,
  },
];

/** Global o'zgaruvchilar ro'yxatini kontekstga qarab qaytaradi */
const getGlobalVariables = (
  range: IRange,
  monaco: typeof monacoEditor,
  contextType: CodeExecutionContext
) => {
  const variables = [
    {
      label: "bot",
      kind: monaco.languages.CompletionItemKind.Variable,
      insertText: "bot",
      range,
    },
    {
      label: "context",
      kind: monaco.languages.CompletionItemKind.Variable,
      insertText: "context",
      range,
    },
    {
      label: "chat_id",
      kind: monaco.languages.CompletionItemKind.Variable,
      insertText: "chat_id",
      range,
    },
  ];

  if (contextType === "message") {
    variables.push({
      label: "message",
      kind: monaco.languages.CompletionItemKind.Variable,
      insertText: "message",
      range,
    });
  } else {
    // 'callback'
    variables.push({
      label: "callback",
      kind: monaco.languages.CompletionItemKind.Variable,
      insertText: "callback",
      range,
    });
  }
  return variables;
};

// =========================================================================
// ASOSIY FUNKSIYA: Monaco Editor'ni sozlaydi
// =========================================================================

/**
 * Monaco Editor'ni Python va Aiogram podskazkalari bilan sozlaydi.
 * @param monaco Monaco obyektining instansi
 * @param contextType Qaysi kontekstda ishlash kerakligi ('message' yoki 'callback')
 * @returns Tozalash uchun `disposable` obyektlar massivi
 */
export const setupPythonEditor = (
  monaco: typeof monacoEditor,
  contextType: CodeExecutionContext
): IDisposable[] => {
  const disposables: IDisposable[] = [];

  // Provider 1: Umumiy snippetlar va global o'zgaruvchilar uchun
  // Bu provider 'Ctrl+Space' bosilganda yoki harf yozishni boshlaganda ishlaydi.
  disposables.push(
    monaco.languages.registerCompletionItemProvider("python", {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        const snippets = getSnippets(range, monaco);
        const globalVars = getGlobalVariables(range, monaco, contextType);

        return { suggestions: [...snippets, ...globalVars] };
      },
    })
  );

  // Provider 2: Nuqtadan keyingi (obyekt metodlari va maydonlari) podskazkalar uchun
  // Bu provider faqat '.' belgisi yozilganda ishga tushadi.
  disposables.push(
    monaco.languages.registerCompletionItemProvider("python", {
      triggerCharacters: ["."],
      provideCompletionItems: (model, position) => {
        const textUntilPosition = model
          .getLineContent(position.lineNumber)
          .substring(0, position.column - 1)
          .trim();
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        if (textUntilPosition.endsWith("bot")) {
          return { suggestions: getBotCompletions(range, monaco) };
        }
        if (textUntilPosition.endsWith("message")) {
          return { suggestions: getMessageCompletions(range, monaco) };
        }
        if (
          contextType === "callback" &&
          textUntilPosition.endsWith("callback")
        ) {
          return { suggestions: getCallbackCompletions(range, monaco) };
        }
        if (textUntilPosition.endsWith("from_user")) {
          // Masalan: message.from_user. dan keyin
          // Bu qismni yanada boyitish mumkin
        }

        // Agar mos kelmasa, hech narsa qaytarmaymiz, shunda Monaco o'zining standart podskazkalarini berishi mumkin.
        return undefined;
      },
    })
  );

  return disposables;
};

```

### 📄 constructor/nodes/custom/CustomCodeNode/index.ts

```ts
export * from "./CustomCodeNode";

```

### 📄 constructor/nodes/custom/CustomCodeNode/types.ts

```ts
export type CodeExecutionContext = "message" | "callback";

export interface CustomCodeNodeData {
  pythonCode?: string;
  // Yangi maydon: foydalanuvchi tanlagan kontekst
  contextType?: CodeExecutionContext;
}

```

### 📄 constructor/nodes/custom/index.ts

```ts
export * from "./CustomCodeNode";

```

### 📄 constructor/nodes/index.ts

```ts
import {
  SendTextMessageNode,
  SendPhotoNode,
  SendVideoNode,
  SendAudioNode,
  SendFileNode,
} from "./actions";
import {
  CallbackButtonTriggerNode,
  MessageTriggerNode,
  ReplyButtonTriggerNode,
  CallbackQueryTriggerNode,
} from "./triggers";

import { CustomCodeNode } from "./custom";
export const CustomNodes = {
  ReplyButtonTriggerNode,
  MessageTriggerNode,
  CallbackButtonTriggerNode,
  CallbackQueryTriggerNode,
  SendTextMessageNode,
  SendPhotoNode,
  SendVideoNode,
  SendAudioNode,
  SendFileNode,
  CustomCodeNode,
};

```

### 📄 constructor/nodes/triggers/CallbackButtonTrigger/CallbackButtonTrigger.tsx

```tsx
import { memo, useMemo } from "react";
import { Handle, NodeProps, Position, useNodes, useEdges } from "reactflow";
import { useFlowStore } from "@/constructor/store/flowStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { CallbackButtonTriggerData } from "./types";
import { ButtonConfig } from "@/constructor/components/ButtonGenerator";
import { AlertCircle, Zap } from "lucide-react"; // Ikonkani o'zgartirdik
import { cn } from "@/lib/utils";

interface NodeWithButtonsData {
  buttons?: ButtonConfig[][];
}

const CallbackButtonTriggerNodeComponent = ({
  id,
  data,
  selected,
}: NodeProps<CallbackButtonTriggerData>) => {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const nodes = useNodes();
  const edges = useEdges();

  const availableCallbackButtons = useMemo(() => {
    const incomingEdge = edges.find((edge) => edge.target === id);
    if (!incomingEdge) return [];

    const parentNode = nodes.find((node) => node.id === incomingEdge.source);
    if (!parentNode) return [];

    const parentNodeData = parentNode.data as NodeWithButtonsData;
    const parentButtons = parentNodeData.buttons || [];

    // --- ASOSIY O'ZGARISH: Faqat 'callback' tipli tugmalarni olamiz ---
    return parentButtons
      .flat()
      .filter((button) => button.type === "callback" || button.type === "url");
  }, [nodes, edges, id]);

  const handleSelectionChange = (callbackValue: string, checked: boolean) => {
    const currentSelection = data.selectedCallbacks || [];
    let newSelection: string[];

    if (checked) {
      newSelection = [...currentSelection, callbackValue];
    } else {
      newSelection = currentSelection.filter(
        (value) => value !== callbackValue
      );
    }
    // MUHIM: `selectedCallbacks` maydonini yangilaymiz
    updateNodeData(id, { selectedCallbacks: newSelection });
  };

  const isConfigured = (data.selectedCallbacks?.length ?? 0) > 0;

  return (
    <Card className={cn("w-80 shadow-lg", selected && "ring-2 ring-primary")}>
      <Handle type="target" position={Position.Top} className="!bg-sky-500" />

      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" /> {/* Yangi ikonka */}
            <span>Callback Tugma Handleri</span>
          </div>
          <div
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              isConfigured ? "bg-green-500" : "bg-destructive/50"
            }`}
            title={isConfigured ? "Sozlangan" : "Sozlanmagan"}
          />
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        {availableCallbackButtons.length > 0 ? (
          <div className="space-y-2 p-3 bg-muted/50 rounded-md border">
            <Label className="text-xs text-muted-foreground">
              Qaysi callback'lar ushlansin?
            </Label>
            {availableCallbackButtons.map((button) => (
              <div key={button.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`${id}-${button.id}`}
                  // MUHIM: `selectedCallbacks` ichidan qidiramiz
                  checked={data.selectedCallbacks?.includes(button.value || "")}
                  onCheckedChange={(checked) =>
                    // MUHIM: `button.value` ni (callback_data) yuboramiz
                    handleSelectionChange(button.value || "", !!checked)
                  }
                />
                <Label
                  htmlFor={`${id}-${button.id}`}
                  className="font-normal cursor-pointer"
                >
                  {button.text}{" "}
                  <span className="text-xs text-muted-foreground font-mono">
                    ({button.value})
                  </span>
                </Label>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-3 text-center text-sm text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded-md flex items-center gap-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>
              Iltimos, bu nodeni Inline (callback) tugmalari mavjud bo'lgan
              node'ga ulang.
            </span>
          </div>
        )}
      </CardContent>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-teal-500"
      />
    </Card>
  );
};

export const CallbackButtonTriggerNode = memo(
  CallbackButtonTriggerNodeComponent
);

```

### 📄 constructor/nodes/triggers/CallbackButtonTrigger/index.ts

```ts
export { CallbackButtonTriggerNode } from "./CallbackButtonTrigger";

```

### 📄 constructor/nodes/triggers/CallbackButtonTrigger/types.ts

```ts
export interface CallbackButtonTriggerData {
  /** Foydalanuvchi tanlagan callback tugmalarining `value` (callback_data)lari ro'yxati */
  selectedCallbacks?: string[];
}

```

### 📄 constructor/nodes/triggers/CallbackQueryTrigger/CallbackQueryTrigger.tsx

```tsx
import { memo, useMemo } from "react";
import { Handle, NodeProps, Position, useEdges } from "reactflow";
import { useFlowStore } from "@/constructor/store/flowStore";
import { CallbackQueryTriggerData } from "./types";
import {
  Card,
  CardContent,
  CardDescription, // <-- YANGI IMPORT
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { FilterSelector } from "@/constructor/nodes/triggers/MessageTrigger/components/FilterSelector";
import { ValueInput } from "@/constructor/nodes/triggers/MessageTrigger/components/ParameterInput/ValueInput";
import { ConstructorData } from "@/constructor/data";
import { MousePointerClick } from "lucide-react";
import { cn } from "@/lib/utils";

const CallbackQueryTriggerNodeComponent = ({
  id,
  data,
  selected,
}: NodeProps<CallbackQueryTriggerData>) => {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const edges = useEdges();

  // --- NODE'NING IKKI XIL HOLATINI ANIQLASH UCHUN LOGIKA ---
  const isConnected = useMemo(() => {
    return edges.some((edge) => edge.target === id);
  }, [edges, id]);

  const handleUpdate = (update: Partial<CallbackQueryTriggerData>) => {
    updateNodeData(id, update);
  };

  const onFilterChange = (newFilter: string) => {
    handleUpdate({ filter: newFilter, context: {} });
  };

  const onValueChange = (newValue: string) => {
    handleUpdate({ context: { value: newValue } });
  };

  const isConfigured =
    data.filter === "any" || (!!data.filter && !!data.context?.value);

  const filterOptions = useMemo(() => ConstructorData.Filters.textFilters, []);

  return (
    <Card className={cn("w-80 shadow-lg", selected && "ring-2 ring-primary")}>
      {/* Ulanish uchun handle doim mavjud bo'ladi */}
      <Handle type="target" position={Position.Top} className="!bg-sky-500" />

      <CardHeader className="pb-2">
        {" "}
        {/* Pastdagi masofani kichraytirdik */}
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <MousePointerClick className="h-5 w-5 text-primary" />
            <span>Callback Query Handler</span>
          </div>
          <div
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              isConfigured ? "bg-green-500" : "bg-destructive/50"
            }`}
            title={isConfigured ? "Sozlangan" : "Sozlanmagan"}
          />
        </CardTitle>
        {/* --- FOYDALANUVCHIGA VIZUAL ISHORA BERUVCHI QISM --- */}
        <CardDescription className="text-xs pt-1">
          {isConnected
            ? "Oldingi qadamdan so'ng callback'larni tinglaydi."
            : "Yangi sxemani boshlovchi global handler."}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 pt-2">
        {/* Sozlamalar doim ko'rinib turadi, bloklanmaydi */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">
            Callback ma'lumoti filtri
          </Label>
          <FilterSelector
            value={data.filter || ""}
            onValueChange={onFilterChange}
            options={filterOptions}
          />
        </div>

        {data.filter && data.filter !== "any" && (
          <div className="space-y-1.5 animate-in fade-in-50">
            <Label className="text-xs text-muted-foreground">Parametr</Label>
            <ValueInput
              value={data.context?.value || ""}
              onChange={onValueChange}
              placeholder="Masalan, 'main_menu' yoki 'item:.*'"
            />
          </div>
        )}
      </CardContent>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-teal-500"
      />
    </Card>
  );
};

export const CallbackQueryTriggerNode = memo(CallbackQueryTriggerNodeComponent);

```

### 📄 constructor/nodes/triggers/CallbackQueryTrigger/index.ts

```ts
export { CallbackQueryTriggerNode } from "./CallbackQueryTrigger";

```

### 📄 constructor/nodes/triggers/CallbackQueryTrigger/types.ts

```ts
export interface CallbackQueryTriggerData {
  filter?: string;
  context?: {
    value?: string;
  };
}

```

### 📄 constructor/nodes/triggers/MessageTrigger/MessageTrigger.tsx

```tsx
import { memo, useMemo, useState } from "react";
import { Handle, NodeProps, Position } from "reactflow";
import { useFlowStore } from "@/constructor/store/flowStore";
import { MessageTriggerNodeData } from "./types";
import { getFiltersForType } from "./utils";

import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

import { TriggerHeader } from "./components/TriggerHeader";
import { TypeSelector } from "./components/TypeSelector";
import { FilterSelector } from "./components/FilterSelector";
import { ParameterInput } from "./components/ParameterInput";

const MessageTriggerNodeComponent = ({
  id,
  data,
  selected,
}: NodeProps<MessageTriggerNodeData>) => {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const [isExpanded, setIsExpanded] = useState(true);

  const handleUpdate = (update: Partial<MessageTriggerNodeData>) => {
    updateNodeData(id, update);
  };

  const onTypeChange = (newType: string) => {
    handleUpdate({ type: newType, filter: undefined, context: {} });
  };

  const onFilterChange = (newFilter: string) => {
    handleUpdate({ filter: newFilter, context: {} });
  };

  const { filtersForType, isNodeConfigured } = useMemo(() => {
    const filters = getFiltersForType(data.type);

    console.log("Received filters:", filters); // Debug uchun

    const configured =
      data.type === "any" ||
      data.type === "any_text" ||
      (!!data.type && !!data.filter);

    return {
      filtersForType: filters,
      isNodeConfigured: configured,
    };
  }, [data.type, data.filter]);

  const showFilterSection =
    data.type && data.type !== "any" && data.type !== "any_text";

  return (
    <Card
      className={`w-100 rounded-lg shadow-md bg-gray-800 border-gray-700 ${
        selected ? "ring-2 ring-blue-500/80" : ""
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        id="in"
        className="!bg-sky-500"
      />

      <TriggerHeader
        isExpanded={isExpanded}
        isConfigured={isNodeConfigured}
        dataType={data.type}
        onToggle={() => setIsExpanded(!isExpanded)}
      />

      {isExpanded && (
        <CardContent className="p-4 pt-2 space-y-4 w-full">
          <div className="space-y-1.5 w-full">
            <Label className="text-xs text-gray-400">Xabar turi</Label>
            <TypeSelector
              value={data.type || ""}
              onValueChange={onTypeChange}
            />
          </div>

          {showFilterSection && (
            <div className="space-y-1.5 animate-in fade-in-50">
              <Label className="text-xs text-gray-400">Filter</Label>
              <FilterSelector
                value={data.filter || ""}
                onValueChange={onFilterChange}
                options={filtersForType}
              />
            </div>
          )}

          {showFilterSection && data.filter && data.filter !== "any" && (
            <div className="space-y-1.5 animate-in fade-in-50">
              <Label className="text-xs text-gray-400">Parametr</Label>
              <ParameterInput
                filter={data.filter}
                context={data.context}
                onContextUpdate={(context) => handleUpdate({ context })}
              />
            </div>
          )}
        </CardContent>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        id="out"
        className="!bg-teal-500"
      />
    </Card>
  );
};

export const MessageTriggerNode = memo(MessageTriggerNodeComponent);

```

### 📄 constructor/nodes/triggers/MessageTrigger/components/FilterSelector.tsx

```tsx
// React va kerakli komponent/tiplarni import qilamiz
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Filtr opsiyasi uchun tip
interface FilterOption {
  value: string;
  label: string;
}

interface FilterSelectorProps {
  value: string;
  onValueChange: (newFilter: string) => void;
  options: FilterOption[];
}

// Komponentni export qilamiz
export const FilterSelector = ({
  value,
  onValueChange,
  options,
}: FilterSelectorProps) => {
  return (
    <Select value={value || ""} onValueChange={onValueChange}>
      <SelectTrigger className="h-8 w-full text-xs">
        <SelectValue placeholder="Tanlang..." />
      </SelectTrigger>
      <SelectContent>
        {options.map((filter) => (
          <SelectItem key={filter.value} value={filter.value}>
            {filter.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

```

### 📄 constructor/nodes/triggers/MessageTrigger/components/ParameterInput/RadiusInput.tsx

```tsx
// React va kerakli komponentlarni import qilamiz.
// Bu importlar faylni modulga aylantiradi.
import React from "react";
import { Input } from "@/components/ui/input";

// Komponent qabul qiladigan props'lar uchun interfeys
interface RadiusInputProps {
  // `value` obyekti ichidagi maydonlar ixtiyoriy bo'lishi mumkin
  value?: { lat?: string; lng?: string; km?: string };
  // O'zgarish bo'lganda chaqiriladigan funksiya
  onChange: (field: "lat" | "lng" | "km", value: string) => void;
}

// Komponentni `export` qilamiz
export const RadiusInput = ({ value = {}, onChange }: RadiusInputProps) => {
  return (
    <div className="grid grid-cols-3 gap-1">
      <Input
        placeholder="Lat"
        value={value.lat || ""}
        onChange={(e) => onChange("lat", e.target.value)}
        className="h-8 text-xs font-mono"
      />
      <Input
        placeholder="Lng"
        value={value.lng || ""}
        onChange={(e) => onChange("lng", e.target.value)}
        className="h-8 text-xs font-mono"
      />
      <Input
        placeholder="Km"
        value={value.km || ""}
        onChange={(e) => onChange("km", e.target.value)}
        className="h-8 text-xs font-mono"
      />
    </div>
  );
};

```

### 📄 constructor/nodes/triggers/MessageTrigger/components/ParameterInput/SizeInput.tsx

```tsx
// React va kerakli komponentlarni import qilamiz
import React from "react";
import { Input } from "@/components/ui/input";

// Komponent qabul qiladigan props'lar uchun interfeys
interface SizeInputProps {
  value?: { min?: string; max?: string };
  onChange: (field: "min" | "max", value: string) => void;
}

// Komponentni `export` qilamiz
export const SizeInput = ({ value = {}, onChange }: SizeInputProps) => {
  return (
    <div className="grid grid-cols-2 gap-1">
      <Input
        placeholder="Min MB"
        value={value.min || ""}
        onChange={(e) => onChange("min", e.target.value)}
        className="h-8 text-xs font-mono"
      />
      <Input
        placeholder="Max MB"
        value={value.max || ""}
        onChange={(e) => onChange("max", e.target.value)}
        className="h-8 text-xs font-mono"
      />
    </div>
  );
};

```

### 📄 constructor/nodes/triggers/MessageTrigger/components/ParameterInput/ValueInput.tsx

```tsx
// React va kerakli komponentlarni import qilamiz
import React from "react";
import { Input } from "@/components/ui/input";

// Komponent qabul qiladigan props'lar uchun interfeys
interface ValueInputProps {
  value?: string; // Qiymat bo'sh bo'lishi mumkin
  onChange: (value: string) => void;
  placeholder?: string; // Placeholder matnini props orqali olish imkoniyati
}

// Komponentni `ValueInput` nomi bilan eksport qilamiz
export const ValueInput = ({
  value,
  onChange,
  placeholder = "...",
}: ValueInputProps) => {
  return (
    <Input
      placeholder={placeholder}
      value={value || ""} // `value` undefined bo'lsa, bo'sh string ishlatamiz
      onChange={(e) => onChange(e.target.value)}
      className="h-8 text-xs font-mono"
    />
  );
};

```

### 📄 constructor/nodes/triggers/MessageTrigger/components/ParameterInput/index.tsx

```tsx
import { MessageTriggerNodeData } from "../../types";
import { ValueInput } from "./ValueInput";
import { RadiusInput } from "./RadiusInput";
import { SizeInput } from "./SizeInput"; // <-- YANGI IMPORT

interface ParameterInputProps {
  filter?: string;
  context: MessageTriggerNodeData["context"];
  onContextUpdate: (newContext: MessageTriggerNodeData["context"]) => void;
}

export const ParameterInput = ({
  filter,
  context,
  onContextUpdate,
}: ParameterInputProps) => {
  switch (filter) {
    case "equals":
    case "contains":
    case "starts_with":
    case "regex":
    case "command":
    case "extension":
      return (
        <ValueInput
          value={context?.value || ""}
          onChange={(value) => onContextUpdate({ value })}
        />
      );

    case "radius":
      return (
        <RadiusInput
          value={context?.radius || {}}
          onChange={(field, value) =>
            onContextUpdate({
              ...context,
              radius: { ...context?.radius, [field]: value },
            })
          }
        />
      );

    // ----- TUZATILGAN QISM -----
    case "size":
      return (
        <SizeInput
          value={context?.size || {}}
          onChange={(field, value) =>
            onContextUpdate({
              ...context,
              size: { ...context?.size, [field]: value },
            })
          }
        />
      );

    default:
      return null;
  }
};

```

### 📄 constructor/nodes/triggers/MessageTrigger/components/TriggerHeader.tsx

```tsx
// React va kerakli tiplarni import qilamiz
import React, { useMemo } from "react";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, ChevronDown } from "lucide-react";
import { ConstructorData } from "@/constructor/data";

interface TriggerHeaderProps {
  isExpanded: boolean;
  isConfigured: boolean;
  dataType?: string;
  onToggle: () => void;
}

// Komponentni export qilamiz
export const TriggerHeader = ({
  isExpanded,
  isConfigured,
  dataType,
  onToggle,
}: TriggerHeaderProps) => {
  // Sarlavhadagi badge uchun kerakli ma'lumotlarni hisoblaymiz
  const selectedTypeData = useMemo(() => {
    if (!dataType) return null;
    return ConstructorData.MessageTypes.find((type) => type.value === dataType);
  }, [dataType]);

  const TypeIcon = selectedTypeData?.icon;

  return (
    <CardHeader>
      <div
        onClick={onToggle}
        className="text-sm flex items-center justify-between cursor-pointer group rounded-lg p-2 -m-2 hover:bg-gray-700/50"
      >
        <div className="flex items-center gap-2 flex-1">
          <Settings className="h-4 w-4 text-blue-400 flex-shrink-0" />
          <span className="font-medium text-gray-200 truncate">Handler</span>
          {TypeIcon && (
            <Badge variant="secondary" className="border-gray-600/50">
              <TypeIcon className="h-3 w-3 mr-1" />
              {selectedTypeData.label}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 ml-2">
          <div
            className={`w-2 h-2 rounded-full transition-all ${
              isConfigured
                ? "bg-green-500 shadow-sm shadow-green-500/50"
                : "bg-gray-600"
            }`}
            title={isConfigured ? "Sozlangan" : "Sozlanmagan"}
          />
          <ChevronDown
            className={`h-4 w-4 text-gray-400 transform transition-transform duration-200 ${
              isExpanded ? "rotate-0" : "-rotate-90"
            }`}
          />
        </div>
      </div>
    </CardHeader>
  );
};

```

### 📄 constructor/nodes/triggers/MessageTrigger/components/TypeSelector.tsx

```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConstructorData } from "@/constructor/data";

interface TypeSelectorProps {
  value: string;
  onValueChange: (newType: string) => void;
}

export const TypeSelector = ({ value, onValueChange }: TypeSelectorProps) => (
  <Select value={value || ""} onValueChange={onValueChange}>
    <SelectTrigger className="h-8 w-full text-xs">
      <SelectValue placeholder="Tanlang..." />
    </SelectTrigger>
    <SelectContent>
      {ConstructorData.MessageTypes.map((type) => (
        <SelectItem key={type.value} value={type.value}>
          <div className="flex items-center gap-2">
            <type.icon className="h-3 w-3" />
            <span>{type.label}</span>
          </div>
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);

```

### 📄 constructor/nodes/triggers/MessageTrigger/index.ts

```ts
export { MessageTriggerNode } from "./MessageTrigger";

```

### 📄 constructor/nodes/triggers/MessageTrigger/types.ts

```ts
// Murakkab context'lar uchun tiplar
interface RadiusContext {
  lat?: string; // Faqat string
  lng?: string;
  km?: string;
}

interface SizeContext {
  min?: string; // Faqat string
  max?: string;
}

// Bizning node saqlaydigan asosiy ma'lumotlar strukturasi
export interface MessageTriggerNodeData {
  type?: string;
  filter?: string;
  context?: {
    value?: string;
    radius?: RadiusContext;
    size?: SizeContext;
  };
}

```

### 📄 constructor/nodes/triggers/MessageTrigger/utils.ts

```ts
import { ConstructorData } from "@/constructor/data";

/**
 * Berilgan xabar turiga mos keladigan filtrlar ro'yxatini qaytaradi.
 * Bu funksiya markazlashtirilgan bo'lib, o'zgartirishni osonlashtiradi.
 * @param type - Xabar turi (masalan, 'text', 'location', 'document')
 * @returns Filter obyektlaridan iborat massiv.
 */
export const getFiltersForType = (type?: string) => {
  if (!type) {
    return [];
  }

  switch (type) {
    // === Matnli turlar ===
    case "text":
    case "phone": // Telefon raqami ham matn hisoblanadi
      return ConstructorData.Filters.textFilters;

    case "contact":
      // Kontaktda ismi, familiyasi, telefon raqami bo'ladi (barchasi matn)
      return ConstructorData.Filters.textFilters;

    // === Joylashuv turi ===
    case "location":
      return ConstructorData.Filters.locationFilters;

    // === Fayl turlari ===
    case "photo":
    case "video":
    case "audio":
      // Bu fayllarda faqat "hajm" bo'yicha filtrlash mantiqan to'g'ri
      return ConstructorData.Filters.fileFilters;

    case "document":
      // Hujjatda "hajm" va "kengaytma" bo'yicha filtrlash mumkin
      return ConstructorData.Filters.documentFilters;

    // === Maxsus turlar (filtrlar kam yoki yo'q) ===
    case "sticker":
      // Stiker uchun maxsus filtrlar yo'q. Faqat "har qanday stiker" bo'lishi mumkin.
      return ConstructorData.Filters.anyFilter;

    // === "Har qanday" turi ===
    case "any": // <-- YANGI
    case "any_text":
      return []; // Bu turlar uchun filtr yo'q.

    // === Qolgan barcha holatlar ===
    default:
      // Agar noma'lum tur kelsa yoki filtr talab etilmaydigan tur bo'lsa
      return [];
  }
};

```

### 📄 constructor/nodes/triggers/ReplyButtonTrigger/ReplyButtonTrigger.tsx

```tsx
import { memo, useMemo } from "react";
import { Handle, NodeProps, Position, useNodes, useEdges } from "reactflow";
import { useFlowStore } from "@/constructor/store/flowStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ReplyButtonTriggerData } from "./types";
import { ButtonConfig } from "@/constructor/components/ButtonGenerator";
import { AlertCircle, CornerDownLeft } from "lucide-react";
import { cn } from "@/lib/utils";

// YORDAMCHI INTERFEYS: Ota-ona node'ning `data` obyekti qanday bo'lishini tasvirlaydi
interface NodeWithButtonsData {
  buttons?: ButtonConfig[][];
}

const ReplyButtonTriggerNodeComponent = ({
  id,
  data,
  selected,
}: NodeProps<ReplyButtonTriggerData>) => {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const nodes = useNodes();
  const edges = useEdges();

  const availableReplyButtons = useMemo(() => {
    console.log("--- Trigger re-calculating ---"); // Har safar hisoblaganda ko'ramiz

    const incomingEdge = edges.find((edge) => edge.target === id);
    console.log("Incoming edge:", incomingEdge); // Ulanishni topdimi?

    if (!incomingEdge) return [];

    const parentNode = nodes.find((node) => node.id === incomingEdge.source);
    console.log("Parent node:", parentNode); // Ota-onani topdimi?

    if (!parentNode) return [];

    const parentNodeData = parentNode.data as NodeWithButtonsData;
    console.log("Parent node DATA:", parentNodeData); // Ota-onaning ma'lumotlari qanday?

    const parentButtons = parentNodeData.buttons || [];
    console.log("Buttons from parent:", parentButtons); // Tugmalar massivi qanday?

    const filteredButtons = parentButtons.flat().filter((button) => {
      // HAR BIR TUGMANI FILTERDAN OLDIN TEKSHIRAMIZ
      console.log("TUGMANI TEKSHIRISH:", button);
      // return button.type === "reply";
      switch (button.type) {
        case "request_contact":
        case "request_location":
        case "reply":
          return true;
        default:
          return false;
      }
    });

    return filteredButtons;
  }, [nodes, edges, id]);

  const handleSelectionChange = (buttonText: string, checked: boolean) => {
    const currentSelection = data.selectedButtons || [];
    let newSelection: string[];

    if (checked) {
      newSelection = [...currentSelection, buttonText];
    } else {
      newSelection = currentSelection.filter((text) => text !== buttonText);
    }
    updateNodeData(id, { selectedButtons: newSelection });
  };

  const isConfigured = (data.selectedButtons?.length ?? 0) > 0;

  return (
    <Card className={cn("w-80 shadow-lg", selected && "ring-2 ring-primary")}>
      <Handle type="target" position={Position.Top} className="!bg-sky-500" />

      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <CornerDownLeft className="h-5 w-5 text-primary" />
            <span>Reply Tugma Handleri</span>
          </div>
          <div
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              isConfigured ? "bg-green-500" : "bg-destructive/50"
            }`}
            title={isConfigured ? "Sozlangan" : "Sozlanmagan"}
          />
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        {availableReplyButtons.length > 0 ? (
          <div className="space-y-2 p-3 bg-muted/50 rounded-md border">
            <Label className="text-xs text-muted-foreground">
              Qaysi tugmalar ushlansin?
            </Label>
            {availableReplyButtons.map((button) => (
              <div key={button.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`${id}-${button.id}`}
                  checked={data.selectedButtons?.includes(button.text)}
                  onCheckedChange={(checked) =>
                    handleSelectionChange(button.text, !!checked)
                  }
                />
                <Label
                  htmlFor={`${id}-${button.id}`}
                  className="font-normal cursor-pointer"
                >
                  {button.text}
                </Label>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-3 text-center text-sm text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded-md flex items-center gap-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>
              Iltimos, bu nodeni Reply-tugmalari mavjud bo'lgan node'ga ulang.
            </span>
          </div>
        )}
      </CardContent>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-teal-500"
      />
    </Card>
  );
};

export const ReplyButtonTriggerNode = memo(ReplyButtonTriggerNodeComponent);

```

### 📄 constructor/nodes/triggers/ReplyButtonTrigger/index.ts

```ts
export { ReplyButtonTriggerNode } from "./ReplyButtonTrigger";

```

### 📄 constructor/nodes/triggers/ReplyButtonTrigger/types.ts

```ts
// Bu node qanday ma'lumotlarni saqlashini belgilaydi
export interface ReplyButtonTriggerData {
  /** Foydalanuvchi tanlagan reply-tugmalarining matnlari ro'yxati */
  selectedButtons?: string[];
}

```

### 📄 constructor/nodes/triggers/index.ts

```ts
export { MessageTriggerNode } from "./MessageTrigger";
export { ReplyButtonTriggerNode } from "./ReplyButtonTrigger";
export { CallbackButtonTriggerNode } from "./CallbackButtonTrigger";
export { CallbackQueryTriggerNode } from "./CallbackQueryTrigger";

```

### 📄 constructor/store/flowStore.ts

```ts
import { create } from "zustand";
import {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  addEdge,
  OnNodesChange,
  OnEdgesChange,
  applyNodeChanges,
  applyEdgeChanges,
} from "reactflow";
import { ElementItemType } from "@/types/element-types";

// Bu funksiya sizda mavjud bo'lishi kerak
const getDefaultNodeData = (nodeType: string) => {
  switch (nodeType) {
    case "SendTextMessageNode":
      return {
        recipients: { sendToSender: true, additionalIds: [] },
        messageText: "",
        parseMode: "None",
      };
    case "SendPhotoNode":
      return {
        recipients: { sendToSender: true, additionalIds: [] },
        photoSourceType: "url",
        caption: "",
      };
    // ... boshqa node'lar uchun ham
    default:
      return {};
  }
};

let id = 0;
// Mavjud nodelar sonidan kelib chiqib ID berish xatoliklarni kamaytiradi
const getId = () => `dndnode_${id++}`;

// Nusxalangan elementlarni vaqtincha saqlash uchun tip
type Clipboard = {
  nodes: Node[];
  edges: Edge[];
};

export type RFState = {
  nodes: Node[];
  edges: Edge[];
  clipboard: Clipboard | null;
  isCtrlPressed: boolean;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: (connection: Connection) => void;
  addNode: (data: ElementItemType, position: { x: number; y: number }) => void;
  updateNodeData: (nodeId: string, newData: any) => void;
  deleteSelectedElements: () => void;
  // --- BARCHA YANGI FUNKSIYALARNING TIPLARI ---
  selectAll: () => void;
  copySelection: () => void;
  paste: (position: { x: number; y: number }) => void;
  duplicateSelection: () => void;
  setCtrlPressed: (isPressed: boolean) => void; // <-- YANGI FUNKSIYA TIPI
};

export const useFlowStore = create<RFState>((set, get) => ({
  nodes: [],
  edges: [],
  clipboard: null,
  isCtrlPressed: false,

  // React Flow kutubxonasi uchun majburiy handler'lar

  onNodesChange: (changes: NodeChange[]) => {
    const { isCtrlPressed } = get();
    const gridSize = 10; // 10px'lik to'r

    const updatedChanges = changes.map((change) => {
      // Agar Ctrl bosilgan bo'lsa, node siljiyotgan bo'lsa va bu pozitsiya o'zgarishi bo'lsa
      if (
        isCtrlPressed &&
        change.type === "position" &&
        change.dragging &&
        change.position
      ) {
        // Yangi pozitsiyani 10ga karrali songa yaxlitlaymiz
        const snappedPosition = {
          x: Math.round(change.position.x / gridSize) * gridSize,
          y: Math.round(change.position.y / gridSize) * gridSize,
        };

        // O'zgartirilgan 'change' obyektini qaytaramiz
        return { ...change, position: snappedPosition };
      }
      // Agar shartlar bajarilmasa, o'zgarishsiz qaytaramiz
      return change;
    });

    set({
      // O'zgartirilgan 'updatedChanges' ni qo'llaymiz
      nodes: applyNodeChanges(updatedChanges, get().nodes),
    });
  },

  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  onConnect: (connection: Connection) => {
    set({
      edges: addEdge(connection, get().edges),
    });
  },
  addNode: (element: ElementItemType, position: { x: number; y: number }) => {
    const newNode: Node = {
      id: getId(),
      type: element.triggerId,
      position,
      data: getDefaultNodeData(element.triggerId || ""),
    };
    set({ nodes: [...get().nodes, newNode] });
  },
  updateNodeData: (nodeId: string, newData: any) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId) {
          return { ...node, data: { ...node.data, ...newData } };
        }
        return node;
      }),
    });
  },

  deleteSelectedElements: () => {
    const { nodes, edges } = get();
    const selectedNodes = nodes
      .filter((node) => node.selected)
      .map((node) => node.id);
    const selectedEdges = edges
      .filter((edge) => edge.selected)
      .map((edge) => edge.id);

    set({
      nodes: nodes.filter((node) => !selectedNodes.includes(node.id)),
      edges: edges.filter(
        (edge) =>
          !selectedEdges.includes(edge.id) &&
          !selectedNodes.includes(edge.source) &&
          !selectedNodes.includes(edge.target)
      ),
    });
  },

  /** Barcha elementlarni tanlash */
  selectAll: () => {
    set({
      nodes: get().nodes.map((node) => ({ ...node, selected: true })),
      edges: get().edges.map((edge) => ({ ...edge, selected: true })),
    });
  },

  /** Tanlangan elementlarni nusxa buferiga saqlash */
  copySelection: () => {
    const { nodes, edges } = get();
    // Faqat tanlangan node'larni olamiz
    const selectedNodes = nodes.filter((node) => node.selected);
    if (selectedNodes.length === 0) {
      set({ clipboard: null });
      return;
    }

    const selectedNodeIds = selectedNodes.map((n) => n.id);
    // Faqat tanlangan node'lar orasidagi ulanishlarni olamiz
    const selectedEdges = edges.filter(
      (e) =>
        selectedNodeIds.includes(e.source) && selectedNodeIds.includes(e.target)
    );

    set({ clipboard: { nodes: selectedNodes, edges: selectedEdges } });
  },

  /** Nusxa buferidagi elementlarni ish maydoniga qo'yish */
  paste: (position: { x: number; y: number }) => {
    const clipboard = get().clipboard;
    if (!clipboard || clipboard.nodes.length === 0) return;

    const { nodes, edges } = get();
    const oldToNewIdMap = new Map<string, string>();

    // Nusxalangan nodelarning birinchisini topamiz
    const firstNode = clipboard.nodes[0];
    const offsetX = position.x - firstNode.position.x;
    const offsetY = position.y - firstNode.position.y;

    const newNodes = clipboard.nodes.map((node) => {
      const newNodeId = getId();
      oldToNewIdMap.set(node.id, newNodeId);

      return {
        ...node,
        id: newNodeId,
        selected: false,
        position: {
          x: node.position.x + offsetX,
          y: node.position.y + offsetY,
        },
        data: { ...node.data }, // Chuqur nusxalash
      };
    });

    const newEdges = clipboard.edges.map((edge) => ({
      ...edge,
      id: `reactflow__edge-${oldToNewIdMap.get(
        edge.source
      )!}-${oldToNewIdMap.get(edge.target)!}`,
      source: oldToNewIdMap.get(edge.source)!,
      target: oldToNewIdMap.get(edge.target)!,
    }));

    set({
      nodes: [...nodes.map((n) => ({ ...n, selected: false })), ...newNodes],
      edges: [...edges, ...newEdges],
    });
  },

  /** Tanlangan elementlardan dublikat yaratish */
  duplicateSelection: () => {
    const { nodes, edges } = get();
    const selectedNodes = nodes.filter((node) => node.selected);
    if (selectedNodes.length === 0) return;

    const oldToNewIdMap = new Map<string, string>();

    const newNodes = selectedNodes.map((node) => {
      const newNodeId = getId();
      oldToNewIdMap.set(node.id, newNodeId);
      return {
        ...node,
        id: newNodeId,
        selected: true, // Dublikat qilinganlarni tanlangan holatda qoldiramiz
        position: { x: node.position.x + 30, y: node.position.y + 30 },
        data: { ...node.data }, // Chuqur nusxalash
      };
    });

    const selectedNodeIds = selectedNodes.map((n) => n.id);
    const relevantEdges = edges.filter(
      (e) =>
        selectedNodeIds.includes(e.source) && selectedNodeIds.includes(e.target)
    );

    const newEdges = relevantEdges.map((edge) => ({
      ...edge,
      id: `reactflow__edge-${oldToNewIdMap.get(
        edge.source
      )!}-${oldToNewIdMap.get(edge.target)!}`,
      source: oldToNewIdMap.get(edge.source)!,
      target: oldToNewIdMap.get(edge.target)!,
    }));

    set({
      // Eskilarini tanlanmagan holatga o'tkazamiz
      nodes: [...nodes.map((n) => ({ ...n, selected: false })), ...newNodes],
      edges: [...get().edges, ...newEdges],
    });
  },

  setCtrlPressed: (isPressed: boolean) => {
    set({ isCtrlPressed: isPressed });
  },
}));

```

