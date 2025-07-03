# Loyiha Tahlili Hisoboti

Sana: 7/3/2025, 11:15:46 PM

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
│   │   └── ButtonGenerator.tsx
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
│   │   │   └── index.ts
│   │   ├── index.ts
│   │   └── triggers
│   │       ├── MessageTrigger
│   │       │   ├── MessageTrigger.tsx
│   │       │   ├── index.ts
│   │       │   └── types.ts
│   │       └── index.ts
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

### 📄 constructor/components/ButtonGenerator.tsx

```tsx
"use client"; // Agar Next.js App Router'da ishlatayotgan bo'lsangiz

import { useState, ReactNode } from "react";
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
  LayoutGrid, // Xabar uchun ikonka
} from "lucide-react";
import { cn } from "@/lib/utils"; // shadcn/ui utils fayli

import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { DialogTitle } from "@radix-ui/react-dialog";

// Tugma konfiguratsiyasi uchun interfeys
interface ButtonConfig {
  id: string;
  text: string;
  type: "url" | "callback" | "reply" | "request_contact" | "request_location";
  value?: string;
}

// Qatordagi maksimal tugmalar soni uchun konstanta
const MAX_BUTTONS_PER_ROW = 10;

export function ButtonGenerator() {
  const [isOpen, setIsOpen] = useState(false);
  const [buttons, setButtons] = useState<ButtonConfig[][]>([[]]);
  const [activeTab, setActiveTab] = useState("inline");
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(0);

  const [inlineText, setInlineText] = useState("");
  const [inlineActionType, setInlineActionType] = useState<"url" | "callback">(
    "url"
  );
  const [inlineActionValue, setInlineActionValue] = useState("");
  const [replyText, setReplyText] = useState("");

  // Joriy tanlangan qator to'lganligini tekshirish uchun o'zgaruvchi
  const isCurrentRowFull =
    selectedRowIndex !== null &&
    buttons[selectedRowIndex]?.length >= MAX_BUTTONS_PER_ROW;

  const handleAddButton = (
    type: "inline" | "reply" | "special",
    specialType?: "request_contact" | "request_location"
  ) => {
    // Funksiya ichida qo'shimcha himoya tekshiruvi
    if (
      selectedRowIndex !== null &&
      buttons[selectedRowIndex]?.length >= MAX_BUTTONS_PER_ROW
    ) {
      alert(
        `Bu qatorda maksimal tugmalar soniga (${MAX_BUTTONS_PER_ROW} ta) yetilgan. Iltimos, yangi qator yarating yoki mavjud tugmani o'chiring.`
      );
      return; // Funksiyadan chiqib ketish
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
        if (updatedButtons.length === 0) {
          updatedButtons.push([]);
        }

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
    if (!open) {
      // Oyna yopilganda barcha holatlarni boshlang'ich holatga qaytarish
      setButtons([[]]);
      setSelectedRowIndex(0);
      setInlineText("");
      setInlineActionValue("");
      setReplyText("");
    }
    setIsOpen(open);
  };

  const handleSaveChanges = () => {
    // Yakuniy `buttons` massivini serverga yuborish yoki boshqa logikani shu yerda bajarish mumkin
    console.log(
      "Yakuniy tugmalar strukturasi:",
      JSON.stringify(buttons, null, 2)
    );
    alert(
      "Tugmalar muvaffaqiyatli saqlandi! Natijani konsolda ko'rishingiz mumkin."
    );
    handleOnOpenChange(false); // Dialog oynasini yopish
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
      <DialogTrigger asChild>
        <Button variant="outline">
          <LayoutGrid className="mr-2 h-4 w-4" />
          Buttons
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[90%] md:max-w-[80%] lg:max-w-[70%] h-[90vh] overflow-y-auto">
        <VisuallyHidden>
          <DialogTitle>Buttons</DialogTitle>
        </VisuallyHidden>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 py-4">
          {/* Chap taraf: sozlamalar */}
          <div className="md:col-span-4 flex flex-col gap-6 sticky top-0">
            <Tabs defaultValue="inline" onValueChange={setActiveTab}>
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
            {/* Agar joriy qator to'lgan bo'lsa, foydalanuvchiga xabar ko'rsatish */}
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

          {/* O'ng taraf: tugmalar ko'rinishi */}
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
                            row.length > 1 && `flex-1` // Teng bo'linish uchun
                          )}
                        >
                          <Button
                            variant="outline"
                            className="pr-8 cursor-default w-full truncate" // Matn sig'masa qirqish
                          >
                            {getIconForButton(button)}
                            <span className="truncate">{button.text}</span>
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-5 w-5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation(); // Ota elementning onClick'ini chaqirmaslik uchun
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
                  {/* Har bir qator limitga yetganda xabar ko'rsatish */}
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

### 📄 constructor/constructor.tsx

```tsx
"use client";

import React, { useCallback, useEffect, useRef } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useReactFlow,
  ReactFlowProvider,
} from "reactflow";
import "reactflow/dist/style.css";
import { ElementItemType } from "@/types/element-types";
import { CustomNodes } from "./nodes";
import { useFlowStore } from "./store/flowStore"; // Store'ni import qilamiz

function FlowchartInner() {
  const reactFlowWrapper = useRef<HTMLDivElement | null>(null);
  const { project } = useReactFlow();

  // Zustand store'dan kerakli holat va action'larni olamiz
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    deleteSelectedElements,
  } = useFlowStore();

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const data = JSON.parse(
        event.dataTransfer.getData("application/json")
      ) as ElementItemType;

      const position = project({
        x: event.clientX - (reactFlowBounds?.left || 0),
        y: event.clientY - (reactFlowBounds?.top || 0),
      });

      // Store'dagi action'ni chaqiramiz
      addNode(data, position);
    },
    [project, addNode]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  }, []);

  // Delete tugmasini bosishni eshitish
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Delete") {
        deleteSelectedElements();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [deleteSelectedElements]);

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
        deleteKeyCode={null}
      >
        <Background gap={24} color="#666" />
        <MiniMap />
        <Controls />
      </ReactFlow>
    </div>
  );
}

// Bu qism o'zgarishsiz qoladi
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
        type: "button",
        name: "Button",
        description: "Create a button for user interaction",
        icon: "🔘",
        color: "bg-green-500/10 text-green-400 border-green-500/20",
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
      },
      {
        type: "condition",
        name: "Condition",
        description: "Add conditional logic to your flow",
        icon: "🔀",
        color: "bg-orange-500/10 text-orange-400 border-orange-500/20",
      },
    ],
  },
];

```

### 📄 constructor/data/filters.ts

```ts
export const textFilters = [
  { value: "equals", label: "Teng" },
  { value: "contains", label: "Ichida" },
  { value: "starts_with", label: "Boshlanadi" },
  { value: "regex", label: "Regex" },
  { value: "command", label: "Buyruq" },
];

export const locationFilters = [
  { value: "any", label: "Har qanday" },
  { value: "radius", label: "Radius" },
];

export const fileFilters = [
  { value: "any", label: "Har qanday" },
  { value: "extension", label: "Kengaytma" },
  { value: "size", label: "Hajm" },
];

export const Filters = {
  textFilters,
  locationFilters,
  fileFilters,
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
} from "lucide-react";

export const MessageTypes = [
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
import { FiMusic, FiChevronDown } from "react-icons/fi";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useFlowStore } from "@/constructor/store/flowStore";
import { SendAudioNodeData, RecipientType, AudioSourceType } from "./types";
import { ChevronDown } from "lucide-react";

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
    <Card className={cn("w-80 shadow-lg", selected && "ring-2 ring-primary")}>
      <Handle type="target" position={Position.Top} className="!bg-sky-500" />

      <CardHeader
        className="flex flex-row items-center justify-between space-y-0 p-3 cursor-pointer"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <FiMusic className="text-primary" />
          Audio Yuborish
        </CardTitle>
        <div className="text-muted-foreground">
          {isCollapsed ? (
            <ChevronDown />
          ) : (
            <ChevronDown className="rotate-180" />
          )}
        </div>
      </CardHeader>

      {!isCollapsed && (
        <>
          <CardContent className="p-4 pt-0 flex flex-col gap-4">
            {/* Qabul qiluvchi */}
            <div className="grid gap-2">
              <Label>Qabul qiluvchi</Label>
              <ToggleGroup
                type="single"
                value={data.recipientType}
                onValueChange={(value: RecipientType) =>
                  value && handleUpdate({ recipientType: value })
                }
                className="w-full grid grid-cols-2"
              >
                <ToggleGroupItem value="sender">Yuboruvchiga</ToggleGroupItem>
                <ToggleGroupItem value="custom_id">ID bo'yicha</ToggleGroupItem>
              </ToggleGroup>
              {data.recipientType === "custom_id" && (
                <Input
                  placeholder="Chat yoki foydalanuvchi ID"
                  value={data.chatId || ""}
                  onChange={(e) => handleUpdate({ chatId: e.target.value })}
                />
              )}
            </div>

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

            {/* Qo'shimcha sozlamalar */}
            <div className="flex items-center justify-between">
              <Label htmlFor={`custom-thumb-${id}`} className="cursor-pointer">
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
          </CardContent>

          <CardFooter className="flex justify-around">
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`disable-notification-${id}`}
                checked={!!data.disableNotification}
                onCheckedChange={(checked) =>
                  handleUpdate({ disableNotification: !!checked })
                }
              />
              <Label
                htmlFor={`disable-notification-${id}`}
                className="text-sm font-normal cursor-pointer"
              >
                Ovozsiz
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`protect-content-${id}`}
                checked={!!data.protectContent}
                onCheckedChange={(checked) =>
                  handleUpdate({ protectContent: !!checked })
                }
              />
              <Label
                htmlFor={`protect-content-${id}`}
                className="text-sm font-normal cursor-pointer"
              >
                Himoyalangan
              </Label>
            </div>
          </CardFooter>
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
  recipientType?: RecipientType;
  chatId?: string;

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
}

```

### 📄 constructor/nodes/actions/FileMessageNode/FileMessageNode.tsx

```tsx
"use client";

import { useState, memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import TextareaAutosize from "react-textarea-autosize";
import { FiFileText, FiChevronDown, FiHelpCircle } from "react-icons/fi";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useFlowStore } from "@/constructor/store/flowStore";
import { SendFileNodeData, RecipientType, FileSourceType } from "./types";
import { ChevronDown } from "lucide-react";

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
    <Card className={cn("w-80 shadow-lg", selected && "ring-2 ring-primary")}>
      <Handle type="target" position={Position.Top} className="!bg-sky-500" />

      <CardHeader
        className="flex flex-row items-center justify-between space-y-0 p-3 cursor-pointer"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <FiFileText className="text-primary" />
          Fayl Yuborish
        </CardTitle>
        <div className="text-muted-foreground">
          {isCollapsed ? (
            <ChevronDown />
          ) : (
            <ChevronDown className="rotate-180" />
          )}
        </div>
      </CardHeader>

      {!isCollapsed && (
        <>
          <CardContent className="p-4 pt-0 flex flex-col gap-4">
            {/* Qabul qiluvchi */}
            <div className="grid gap-2">
              <Label>Qabul qiluvchi</Label>
              <ToggleGroup
                type="single"
                value={data.recipientType}
                onValueChange={(value: RecipientType) =>
                  value && handleUpdate({ recipientType: value })
                }
                className="w-full grid grid-cols-2"
              >
                <ToggleGroupItem value="sender">Yuboruvchiga</ToggleGroupItem>
                <ToggleGroupItem value="custom_id">ID bo'yicha</ToggleGroupItem>
              </ToggleGroup>
              {data.recipientType === "custom_id" && (
                <Input
                  placeholder="Chat yoki foydalanuvchi ID"
                  value={data.chatId || ""}
                  onChange={(e) => handleUpdate({ chatId: e.target.value })}
                />
              )}
            </div>

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

          <CardFooter className="flex flex-wrap justify-around gap-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`disable-notification-${id}`}
                checked={!!data.disableNotification}
                onCheckedChange={(checked) =>
                  handleUpdate({ disableNotification: !!checked })
                }
              />
              <Label
                htmlFor={`disable-notification-${id}`}
                className="text-sm font-normal cursor-pointer"
              >
                Ovozsiz
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`protect-content-${id}`}
                checked={!!data.protectContent}
                onCheckedChange={(checked) =>
                  handleUpdate({ protectContent: !!checked })
                }
              />
              <Label
                htmlFor={`protect-content-${id}`}
                className="text-sm font-normal cursor-pointer"
              >
                Himoyalangan
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`disable-mime-${id}`}
                        checked={!!data.disableContentTypeDetection}
                        onCheckedChange={(checked) =>
                          handleUpdate({
                            disableContentTypeDetection: !!checked,
                          })
                        }
                      />
                      <Label
                        htmlFor={`disable-mime-${id}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        MIME-turini o'chirish
                      </Label>
                      <FiHelpCircle className="text-muted-foreground" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Telegram fayl turini aniqlashga urinmaydi.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardFooter>
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
  recipientType?: RecipientType;
  chatId?: string;

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
}

```

### 📄 constructor/nodes/actions/PhotoMessageNode/PhotoMessageNode.tsx

```tsx
"use client";

import { useState, memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import TextareaAutosize from "react-textarea-autosize";
import { FiCamera, FiChevronUp, FiChevronDown } from "react-icons/fi";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
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
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useFlowStore } from "@/constructor/store/flowStore";
import { SendPhotoNodeData, RecipientType, PhotoSourceType } from "./types";

const SendPhotoNodeComponent = ({
  id,
  data,
  selected,
}: NodeProps<SendPhotoNodeData>) => {
  // 1. Global store'dan `updateNodeData`'ni olamiz
  const updateNodeData = useFlowStore((state) => state.updateNodeData);

  // 2. Faqat UI uchun `useState`
  const [isCollapsed, setIsCollapsed] = useState(false);

  // 3. Markazlashgan yangilash funksiyasi
  const handleUpdate = (update: Partial<SendPhotoNodeData>) => {
    updateNodeData(id, update);
  };

  const captionLength = data.caption?.length || 0;

  return (
    <>
      <Card className={cn("w-80 shadow-lg", selected && "ring-2 ring-primary")}>
        {/* Kirish nuqtasi (Target) tepada */}
        <Handle type="target" position={Position.Top} className="!bg-sky-500" />

        <CardHeader
          className="flex flex-row items-center justify-between space-y-0 p-3 cursor-pointer"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <FiCamera className="text-primary" />
            Rasm Yuborish
          </CardTitle>
          <div className="text-muted-foreground">
            {isCollapsed ? <FiChevronDown /> : <FiChevronUp />}
          </div>
        </CardHeader>

        {!isCollapsed && (
          <>
            <CardContent className="p-4 pt-0 flex flex-col gap-4">
              {/* Qabul qiluvchi */}
              <div className="grid gap-2">
                <Label>Qabul qiluvchi</Label>
                <ToggleGroup
                  type="single"
                  // 4. `value`'ni `data`dan olamiz
                  value={data.recipientType}
                  // 5. O'zgarishni `handleUpdate` orqali jo'natamiz
                  onValueChange={(value: RecipientType) =>
                    value && handleUpdate({ recipientType: value })
                  }
                  className="w-full grid grid-cols-2"
                >
                  <ToggleGroupItem value="sender">Yuboruvchiga</ToggleGroupItem>
                  <ToggleGroupItem value="custom_id">
                    ID bo'yicha
                  </ToggleGroupItem>
                </ToggleGroup>
                {data.recipientType === "custom_id" && (
                  <Input
                    placeholder="Chat yoki foydalanuvchi ID"
                    value={data.chatId || ""}
                    onChange={(e) => handleUpdate({ chatId: e.target.value })}
                  />
                )}
              </div>

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

              <div className="border-t border-border pt-4 mt-2"></div>
            </CardContent>
            <CardFooter className="flex justify-around">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`disable-notification-${id}`}
                  checked={!!data.disableNotification}
                  onCheckedChange={(checked) =>
                    handleUpdate({ disableNotification: !!checked })
                  }
                />
                <Label
                  htmlFor={`disable-notification-${id}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  Ovozsiz
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`protect-content-${id}`}
                  checked={!!data.protectContent}
                  onCheckedChange={(checked) =>
                    handleUpdate({ protectContent: !!checked })
                  }
                />
                <Label
                  htmlFor={`protect-content-${id}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  Himoyalangan
                </Label>
              </div>
            </CardFooter>
          </>
        )}

        {/* Chiqish nuqtasi (Source) pastda */}
        <Handle
          type="source"
          position={Position.Bottom}
          className="!bg-teal-500"
        />
      </Card>
    </>
  );
};

// 6. Komponentni `memo` bilan o'rab eksport qilamiz
export const SendPhotoNode = memo(SendPhotoNodeComponent);

```

### 📄 constructor/nodes/actions/PhotoMessageNode/index.ts

```ts
export { SendPhotoNode } from "./PhotoMessageNode";

```

### 📄 constructor/nodes/actions/PhotoMessageNode/types.ts

```ts
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

  recipientType?: RecipientType;
  chatId?: string; // `recipientType` 'custom_id' bo'lganda ishlatiladi.

  photoSourceType?: PhotoSourceType;
  photoFileId?: string; // `photoSourceType` 'file_id' bo'lganda ishlatiladi.
  photoUrl?: string; // `photoSourceType` 'url' bo'lganda ishlatiladi.
  // 'upload' uchun alohida maydon qo'shish mumkin, masalan: `uploadedFile?: File`

  caption?: string; // Rasm ostidagi matn (1024 belgacha).

  disableNotification?: boolean; // Foydalanuvchiga ovozsiz xabar yuborish.
  protectContent?: boolean; // Xabarni nusxalash va saqlashni taqiqlash.
}

```

### 📄 constructor/nodes/actions/TextMessageNode/TextMessageNode.tsx

```tsx
"use client";

import { useState, memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import TextareaAutosize from "react-textarea-autosize";
import { MessageSquare, Settings, ChevronDown } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
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
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useFlowStore } from "@/constructor/store/flowStore";
import { SendTextMessageNodeData, RecipientType, ParseMode } from "./types";

const SendTextMessageNodeComponent = ({
  id,
  data,
  selected,
}: NodeProps<SendTextMessageNodeData>) => {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleUpdate = (update: Partial<SendTextMessageNodeData>) => {
    updateNodeData(id, update);
  };

  const textLength = data.messageText?.length || 0;
  const isNodeConfigured = !!(data.recipientType && data.messageText);

  return (
    <Card className={cn("w-80 shadow-lg", selected && "ring-2 ring-primary")}>
      <Handle type="target" position={Position.Top} className="!bg-sky-500" />

      <CardHeader
        className="flex flex-row items-center justify-between space-y-0 p-3 cursor-pointer"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <MessageSquare className="text-primary" />
          Matnli Xabar
        </CardTitle>
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "w-2 h-2 rounded-full transition-all",
              isNodeConfigured ? "bg-green-500" : "bg-yellow-500"
            )}
          />
          <div className="text-muted-foreground">
            {isCollapsed ? (
              <ChevronDown />
            ) : (
              <ChevronDown className="rotate-180" />
            )}
          </div>
        </div>
      </CardHeader>

      {!isCollapsed && (
        <>
          <CardContent className="p-4 pt-0 flex flex-col gap-4">
            {/* Qabul qiluvchi */}
            <div className="grid gap-2">
              <Label>Qabul qiluvchi</Label>
              <ToggleGroup
                type="single"
                value={data.recipientType}
                onValueChange={(value: RecipientType) =>
                  value && handleUpdate({ recipientType: value })
                }
                className="w-full grid grid-cols-2"
              >
                <ToggleGroupItem value="sender">Yuboruvchiga</ToggleGroupItem>
                <ToggleGroupItem value="custom_id">ID bo'yicha</ToggleGroupItem>
              </ToggleGroup>
              {data.recipientType === "custom_id" && (
                <Input
                  placeholder="Chat yoki foydalanuvchi ID"
                  value={data.chatId || ""}
                  onChange={(e) => handleUpdate({ chatId: e.target.value })}
                />
              )}
            </div>

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
                <Label
                  htmlFor={`disable-preview-${id}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  Link uchun prevyuni o'chirish
                </Label>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-around">
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`disable-notification-${id}`}
                checked={!!data.disableNotification}
                onCheckedChange={(checked) =>
                  handleUpdate({ disableNotification: !!checked })
                }
              />
              <Label
                htmlFor={`disable-notification-${id}`}
                className="text-sm font-normal cursor-pointer"
              >
                Ovozsiz
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`protect-content-${id}`}
                checked={!!data.protectContent}
                onCheckedChange={(checked) =>
                  handleUpdate({ protectContent: !!checked })
                }
              />
              <Label
                htmlFor={`protect-content-${id}`}
                className="text-sm font-normal cursor-pointer"
              >
                Himoyalangan
              </Label>
            </div>
          </CardFooter>
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
  recipientType?: RecipientType;
  chatId?: string; // `recipientType` 'custom_id' bo'lganda ishlatiladi.

  messageText?: string; // Yuboriladigan xabar matni (4096 belgacha).
  parseMode?: ParseMode;

  disableWebPagePreview?: boolean; // Xabardagi linklar uchun oldindan ko'rishni o'chirish.
  disableNotification?: boolean; // Foydalanuvchiga ovozsiz xabar yuborish.
  protectContent?: boolean; // Xabarni nusxalash va saqlashni taqiqlash.
}

```

### 📄 constructor/nodes/actions/VideoMessageNode/VideMessageNode.tsx

```tsx
"use client";

import { useState, memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import TextareaAutosize from "react-textarea-autosize";
import { FiVideo, FiChevronDown, FiHelpCircle } from "react-icons/fi";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
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
import { Checkbox } from "@/components/ui/checkbox";
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
import { ChevronDown } from "lucide-react";

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

      <CardHeader
        className="flex flex-row items-center justify-between space-y-0 p-3 cursor-pointer"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <FiVideo className="text-primary" />
          Video Yuborish
        </CardTitle>
        <div className="text-muted-foreground">
          {isCollapsed ? (
            <ChevronDown />
          ) : (
            <ChevronDown className="rotate-180" />
          )}
        </div>
      </CardHeader>

      {!isCollapsed && (
        <>
          <CardContent className="p-4 pt-0 flex flex-col gap-5">
            {/* Qabul qiluvchi */}
            <div className="grid gap-2">
              <Label>Qabul qiluvchi</Label>
              <ToggleGroup
                type="single"
                value={data.recipientType}
                onValueChange={(value: RecipientType) =>
                  value && handleUpdate({ recipientType: value })
                }
                className="w-full grid grid-cols-2"
              >
                <ToggleGroupItem value="sender">Yuboruvchiga</ToggleGroupItem>
                <ToggleGroupItem value="custom_id">ID bo'yicha</ToggleGroupItem>
              </ToggleGroup>
              {data.recipientType === "custom_id" && (
                <Input
                  placeholder="Chat yoki foydalanuvchi ID"
                  value={data.chatId || ""}
                  onChange={(e) => handleUpdate({ chatId: e.target.value })}
                />
              )}
            </div>

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

          <CardFooter className="flex justify-around">
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`disable-notification-${id}`}
                checked={!!data.disableNotification}
                onCheckedChange={(checked) =>
                  handleUpdate({ disableNotification: !!checked })
                }
              />
              <Label
                htmlFor={`disable-notification-${id}`}
                className="text-sm font-normal cursor-pointer"
              >
                Ovozsiz
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`protect-content-${id}`}
                checked={!!data.protectContent}
                onCheckedChange={(checked) =>
                  handleUpdate({ protectContent: !!checked })
                }
              />
              <Label
                htmlFor={`protect-content-${id}`}
                className="text-sm font-normal cursor-pointer"
              >
                Himoyalangan
              </Label>
            </div>
          </CardFooter>
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
  recipientType?: RecipientType;
  chatId?: string;

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

### 📄 constructor/nodes/index.ts

```ts
import { MessageTriggerNode } from "./triggers";
import {
  SendTextMessageNode,
  SendPhotoNode,
  SendVideoNode,
  SendAudioNode,
  SendFileNode,
} from "./actions";

export const CustomNodes = {
  MessageTriggerNode,
  SendTextMessageNode,
  SendPhotoNode,
  SendVideoNode,
  SendAudioNode,
  SendFileNode,
};

```

### 📄 constructor/nodes/triggers/MessageTrigger/MessageTrigger.tsx

```tsx
"use client";

import { useState, memo, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Settings, ChevronDown } from "lucide-react";
import { ConstructorData } from "@/constructor/data"; // Sizning statik ma'lumotlaringiz
import { Handle, Position, NodeProps } from "reactflow";
import { useFlowStore } from "@/constructor/store/flowStore"; // Bizning global store
import { MessageTriggerNodeData } from "./types"; // Shu komponent uchun maxsus tip

// memo'dan foydalanish performans uchun juda muhim!
const MessageTriggerNodeComponent = ({
  id,
  data,
  selected,
}: NodeProps<MessageTriggerNodeData>) => {
  // Global holatdan faqat kerakli action'ni olamiz.
  const updateNodeData = useFlowStore((state) => state.updateNodeData);

  // UI'ga tegishli holat (ochiq/yopiq). Bu ma'lumot global saqlanishi shart emas.
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // MARKAZLASHGAN YANGILASH FUNKSIYASI
  // Bu funksiya orqali barcha o'zgarishlar global store'ga yuboriladi.
  const handleUpdate = (update: Partial<MessageTriggerNodeData>) => {
    updateNodeData(id, update);
  };

  // Ma'lumot turi o'zgarganda, unga bog'liq bo'lgan filter va context'ni tozalaymiz
  const onTypeChange = (newType: string) => {
    handleUpdate({
      type: newType,
      filter: "", // Filterni tozalash
      context: {}, // Contextni tozalash
    });
  };

  // Faqat filter o'zgarganda context'ni tozalash
  const onFilterChange = (newFilter: string) => {
    handleUpdate({
      filter: newFilter,
      context: {}, // Contextni tozalash
    });
  };

  // Kontekst inputlarini yangilash uchun funksiyalar
  const handleContextValueUpdate = (value: string) => {
    handleUpdate({ context: { ...data.context, value } });
  };

  const handleRadiusContextUpdate = (
    field: "lat" | "lng" | "km",
    value: string
  ) => {
    handleUpdate({
      context: {
        ...data.context,
        radius: { ...data.context?.radius, [field]: value },
      },
    });
  };

  const handleSizeContextUpdate = (field: "min" | "max", value: string) => {
    handleUpdate({
      context: {
        ...data.context,
        size: { ...data.context?.size, [field]: value },
      },
    });
  };

  // Ma'lumotlarni hisoblash uchun memo'dan foydalanish
  const {
    selectedTypeData,
    selectedFilterData,
    filtersForType,
    isNodeConfigured,
  } = useMemo(() => {
    const getFiltersForType = (type: string) => {
      switch (type) {
        case "text":
          return ConstructorData.Filters.textFilters;
        case "location":
          return ConstructorData.Filters.locationFilters;
        case "document":
        case "photo":
        case "video":
        case "audio":
          return ConstructorData.Filters.fileFilters;
        default:
          return [{ value: "any", label: "Har qanday" }];
      }
    };

    const filters = data.type ? getFiltersForType(data.type) : [];

    return {
      selectedTypeData: ConstructorData.MessageTypes.find(
        (type) => type.value === data.type
      ),
      selectedFilterData: filters.find(
        (filter) => filter.value === data.filter
      ),
      filtersForType: filters,
      isNodeConfigured: !!(data.type && data.filter),
    };
  }, [data.type, data.filter]);

  const renderContextInput = () => {
    if (!data.filter || data.filter === "any") return null;
    const inputClass =
      "h-8 text-xs border-gray-700 text-gray-100 placeholder:text-gray-400";

    switch (data.filter) {
      case "regex":
      case "command":
      case "contains":
        return (
          <Input
            placeholder="..."
            value={data.context?.value || ""}
            onChange={(e) => handleContextValueUpdate(e.target.value)}
            className={`${inputClass} font-mono`}
          />
        );
      case "extension":
        return (
          <Input
            placeholder="pdf,jpg,png"
            value={data.context?.value || ""}
            onChange={(e) => handleContextValueUpdate(e.target.value)}
            className={inputClass}
          />
        );
      case "radius":
        return (
          <div className="grid grid-cols-3 gap-1">
            <Input
              placeholder="Lat"
              value={data.context?.radius?.lat || ""}
              onChange={(e) => handleRadiusContextUpdate("lat", e.target.value)}
              className={`${inputClass} font-mono`}
            />
            <Input
              placeholder="Lng"
              value={data.context?.radius?.lng || ""}
              onChange={(e) => handleRadiusContextUpdate("lng", e.target.value)}
              className={`${inputClass} font-mono`}
            />
            <Input
              placeholder="Km"
              value={data.context?.radius?.km || ""}
              onChange={(e) => handleRadiusContextUpdate("km", e.target.value)}
              className={`${inputClass} font-mono`}
            />
          </div>
        );
      case "size":
        return (
          <div className="grid grid-cols-2 gap-1">
            <Input
              placeholder="Min MB"
              value={data.context?.size?.min || ""}
              onChange={(e) => handleSizeContextUpdate("min", e.target.value)}
              className={`${inputClass} font-mono`}
            />
            <Input
              placeholder="Max MB"
              value={data.context?.size?.max || ""}
              onChange={(e) => handleSizeContextUpdate("max", e.target.value)}
              className={`${inputClass} font-mono`}
            />
          </div>
        );
      default:
        return null;
    }
  };

  const TypeIcon = selectedTypeData?.icon;

  return (
    <Card
      className={`w-80 rounded-lg shadow-md bg-gray-800 border-gray-700 ${
        selected ? "ring-2 ring-blue-500/80" : "border-gray-700"
      }`}
    >
      <CardHeader className="p-2">
        <CardTitle
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm flex items-center justify-between cursor-pointer group rounded-lg p-2 -m-2 hover:bg-gray-700/50"
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
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
                isNodeConfigured
                  ? "bg-green-500 shadow-sm shadow-green-500/50"
                  : "bg-gray-600"
              }`}
            />
            <ChevronDown
              className={`h-4 w-4 text-gray-400 transform transition-transform duration-200 ${
                isExpanded ? "rotate-0" : "-rotate-90"
              }`}
            />
          </div>
        </CardTitle>
      </CardHeader>

      {isExpanded && (
        <CardContent className="p-4 pt-2 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-400">Xabar turi</Label>
            <Select value={data.type || ""} onValueChange={onTypeChange}>
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
          </div>

          {data.type && (
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-400">Filter</Label>
              <Select value={data.filter || ""} onValueChange={onFilterChange}>
                <SelectTrigger className="h-8 w-full text-xs">
                  <SelectValue placeholder="Tanlang..." />
                </SelectTrigger>
                <SelectContent>
                  {filtersForType.map((filter) => (
                    <SelectItem key={filter.value} value={filter.value}>
                      {filter.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {data.filter && data.filter !== "any" && (
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-400">Parametr</Label>
              {renderContextInput()}
            </div>
          )}
        </CardContent>
      )}

      {!isExpanded && isNodeConfigured && (
        <CardContent className="pt-0 pb-3 px-4">
          <div className="flex items-center justify-between text-xs text-gray-300">
            <div className="flex items-center gap-1.5">
              {TypeIcon && <TypeIcon className="h-3 w-3 text-gray-400" />}
              <span>{selectedTypeData?.label}</span>
            </div>
            {selectedFilterData && (
              <Badge variant="outline" className="text-xs font-normal">
                {selectedFilterData.label}
              </Badge>
            )}
          </div>
        </CardContent>
      )}

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Top}
        id="in"
        className="!bg-sky-500"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="out"
        className="!bg-teal-500"
      />
    </Card>
  );
};

// Asl komponentni memo bilan o'rab eksport qilamiz
export const MessageTriggerNode = memo(MessageTriggerNodeComponent);

```

### 📄 constructor/nodes/triggers/MessageTrigger/index.ts

```ts
export { MessageTriggerNode } from "./MessageTrigger";

```

### 📄 constructor/nodes/triggers/MessageTrigger/types.ts

```ts
// Murakkab context'lar uchun tiplar
interface RadiusContext {
  lat?: number | string;
  lng?: number | string;
  km?: number | string;
}

interface SizeContext {
  min?: number | string;
  max?: number | string;
}

// Bizning node saqlaydigan asosiy ma'lumotlar strukturasi
export interface MessageTriggerNodeData {
  // Bu maydonlar ixtiyoriy (`?`), chunki node dastlab bo'sh bo'lishi mumkin
  type?: string; // 'text', 'location', 'document'
  filter?: string; // 'contains', 'regex', 'radius'
  context?: {
    value?: string; // Umumiy qiymat uchun (matn, command, extension)
    radius?: RadiusContext;
    size?: SizeContext;
  };
}

```

### 📄 constructor/nodes/triggers/index.ts

```ts
export { MessageTriggerNode } from "./MessageTrigger";

```

### 📄 constructor/store/flowStore.ts

```ts
import { create } from 'zustand';
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
} from 'reactflow';
import { ElementItemType } from '@/types/element-types'; // O'zingizning typingizni import qiling

let id = 0;
const getId = () => `node_${id++}`;

// Store'ning holati va action'lari uchun interfeys (TypeScript uchun)
export type RFState = {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: (connection: Connection) => void;
  addNode: (data: ElementItemType, position: { x: number; y: number }) => void;
  updateNodeData: (nodeId: string, newData: any) => void;
  deleteSelectedElements: () => void;
};

export const useFlowStore = create<RFState>((set, get) => ({
  nodes: [],
  edges: [],

  // React Flow kutubxonasi uchun majburiy handler'lar
  onNodesChange: (changes: NodeChange[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },
  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },

  // Yangi qirrani (edge) qo'shish uchun
  onConnect: (connection: Connection) => {
    set({
      edges: addEdge(connection, get().edges),
    });
  },
  
  // Yangi nodeni qo'shish
  addNode: (data: ElementItemType, position: { x: number; y: number }) => {
    const newNode: Node = {
        id: getId(),
        type: data.triggerId,
        position,
        data: data,
    };
    set({ nodes: [...get().nodes, newNode] });
  },

  // **Eng muhim qismi: Node ma'lumotini yangilash**
  // Custom node ichidan shu funksiyani chaqirasiz
  updateNodeData: (nodeId: string, newData: any) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId) {
          // data obyektini yangi ma'lumotlar bilan birlashtiramiz
          return { ...node, data: { ...node.data, ...newData } };
        }
        return node;
      }),
    });
  },
  
  // Tanlangan elementlarni o'chirish
  deleteSelectedElements: () => {
    const { nodes, edges } = get();
    const selectedNodes = nodes.filter(node => node.selected).map(node => node.id);
    const selectedEdges = edges.filter(edge => edge.selected).map(edge => edge.id);

    set({
      nodes: nodes.filter(node => !selectedNodes.includes(node.id)),
      edges: edges.filter(edge => !selectedEdges.includes(edge.id)),
    });
  }
}));
```

