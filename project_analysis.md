# Loyiha Tahlili Hisoboti

Sana: 10/12/2025, 6:59:12 AM

## 📁 Fayl Strukturasi

```
constructor-next-js
├── .env
├── .gitignore
├── README.md
├── analis_project.js
├── app
│   ├── AuthProvider.tsx
│   ├── ReactQueryProvider.tsx
│   ├── [id]
│   │   ├── components
│   │   │   ├── LogViewer
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── LogLine.tsx
│   │   │   │   ├── LogList.tsx
│   │   │   │   ├── OpenButton.tsx
│   │   │   │   ├── ResizeHandler.tsx
│   │   │   │   ├── index.tsx
│   │   │   │   └── types.ts
│   │   │   ├── action
│   │   │   │   ├── actions.tsx
│   │   │   │   ├── index.ts
│   │   │   │   └── prompt-interface.tsx
│   │   │   ├── header.tsx
│   │   │   └── index.ts
│   │   └── page.tsx
│   ├── api
│   │   └── auth
│   │       ├── [...nextauth]
│   │       │   ├── option.ts
│   │       │   └── route.ts
│   │       └── next-auth.d.ts
│   ├── auth
│   │   └── page.tsx
│   ├── favicon.ico
│   ├── globals.css
│   └── layout.tsx
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
│       ├── hover-border-gradient.tsx
│       ├── input-otp.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── radio-group.tsx
│       ├── scroll-area.tsx
│       ├── select.tsx
│       ├── separator.tsx
│       ├── slider.tsx
│       ├── sonner.tsx
│       ├── spinner.tsx
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
│   │   │   ├── components
│   │   │   │   ├── ButtonRow.tsx
│   │   │   │   ├── ControlPanel.tsx
│   │   │   │   ├── InlineForm.tsx
│   │   │   │   ├── KeyboardPreview.tsx
│   │   │   │   ├── LoginUrlForm.tsx
│   │   │   │   ├── PreviewButton.tsx
│   │   │   │   ├── ReplyForm.tsx
│   │   │   │   └── WebAppForm.tsx
│   │   │   ├── hook
│   │   │   │   └── useButtonGeneratorState.ts
│   │   │   ├── index.ts
│   │   │   ├── types.ts
│   │   │   └── utils.tsx
│   │   ├── QuickAddPalette
│   │   │   ├── QuickAddPalette.tsx
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── constructor.tsx
│   ├── data
│   │   ├── elements.ts
│   │   ├── filters.ts
│   │   ├── index.ts
│   │   ├── messages.ts
│   │   └── themes.ts
│   ├── edges
│   │   ├── SmartEdge.tsx
│   │   ├── components
│   │   │   └── EdgeContextMenu.tsx
│   │   └── index.ts
│   ├── hooks
│   │   ├── useFlowKeyboardShortcuts.ts
│   │   └── useMousePosition.ts
│   ├── lib
│   │   └── geometry.ts
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
│   │   ├── components
│   │   │   ├── index.ts
│   │   │   └── shared
│   │   │       ├── ReactFlowHandlers
│   │   │       │   ├── SourceHandler.tsx
│   │   │       │   ├── TargetHandler.tsx
│   │   │       │   └── index.ts
│   │   │       └── index.ts
│   │   ├── custom
│   │   │   ├── CustomCodeNode
│   │   │   │   ├── CustomCodeNode.tsx
│   │   │   │   ├── components
│   │   │   │   │   └── CodeEditorDialog.tsx
│   │   │   │   ├── index.ts
│   │   │   │   └── types.ts
│   │   │   └── index.ts
│   │   ├── index.ts
│   │   └── triggers
│   │       ├── CallbackQueryTrigger
│   │       │   ├── CallbackQueryTrigger.tsx
│   │       │   ├── index.ts
│   │       │   └── types.ts
│   │       ├── CommandTrigger
│   │       │   ├── CommandTriggerNode.tsx
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
│   │       └── index.ts
│   └── store
│       ├── actions.ts
│       ├── clipboardSlice.ts
│       ├── flowSlice.ts
│       ├── index.ts
│       └── types.ts
├── editor
│   ├── index.tsx
│   ├── settings
│   │   └── index.tsx
│   ├── setup
│   │   ├── aiogram
│   │   │   ├── bot
│   │   │   │   ├── edit.ts
│   │   │   │   ├── index.ts
│   │   │   │   └── send.ts
│   │   │   ├── buttons
│   │   │   │   ├── index.ts
│   │   │   │   ├── inline.ts
│   │   │   │   └── reply.ts
│   │   │   ├── callback
│   │   │   │   ├── context.ts
│   │   │   │   ├── edit.ts
│   │   │   │   ├── index.ts
│   │   │   │   └── send.ts
│   │   │   ├── globals.ts
│   │   │   ├── index.ts
│   │   │   ├── message
│   │   │   │   ├── context.ts
│   │   │   │   ├── edit.ts
│   │   │   │   ├── index.ts
│   │   │   │   └── send.ts
│   │   │   └── types
│   │   │       └── user.ts
│   │   ├── index.ts
│   │   └── python
│   │       └── keywords.ts
│   ├── store
│   │   ├── index.ts
│   │   └── settings.ts
│   └── themes
│       ├── ayu-mirage.ts
│       └── botfather.ts
├── hooks
│   ├── use-debounces.tsx
│   └── useWebSocketLogs.ts
├── i18n
│   ├── request.ts
│   └── routing.ts
├── just.json
├── just.py
├── lib
│   ├── env.ts
│   ├── query-generator.ts
│   └── utils.ts
├── log-server.mjs
├── messages
│   ├── en.json
│   ├── jp.json
│   ├── ru.json
│   └── uz.json
├── next-env.d.ts
├── next.config.ts
├── nodes.json
├── package.json
├── postcss.config.mjs
├── services
│   ├── instance.ts
│   ├── react-query
│   │   ├── index.ts
│   │   ├── use-react-query-action.ts
│   │   └── use-scroll-query-action.ts
│   ├── requests
│   │   ├── auth.ts
│   │   └── bot.ts
│   └── store
│       └── project.ts
├── tsconfig.json
└── types
    ├── auth
    │   ├── get-me.ts
    │   └── login.tsx
    ├── constructor
    │   └── project.ts
    ├── element-types.ts
    └── http
        ├── bot.ts
        ├── flow.ts
        └── index.ts
```

## 📄 Muhim Fayllar Tarkibi (içidan: constructor)

### 📄 constructor/components/ButtonGenerator/ButtonGenerator.tsx

```tsx
"use client";

import { useState, ReactNode } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { DialogTitle } from "@radix-ui/react-dialog";
import { KeyboardConfig } from "@/constructor/nodes/actions/TextMessageNode/types";
import { useButtonGeneratorState } from "./hook/useButtonGeneratorState";
import { ControlPanel } from "./components/ControlPanel";
import { KeyboardPreview } from "./components/KeyboardPreview";

interface ButtonGeneratorProps {
  initialKeyboard?: KeyboardConfig;
  onSave: (keyboard: KeyboardConfig) => void;
  children: ReactNode;
}

export function ButtonGenerator({
  initialKeyboard,
  onSave,
  children,
}: ButtonGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const {
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
  } = useButtonGeneratorState(isOpen, initialKeyboard);

  const handleSaveChanges = () => {
    onSave(getFinalKeyboardConfig());
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[90%] md:max-w-[80%] lg:max-w-[70%] h-[90vh] overflow-y-auto">
        <VisuallyHidden>
          <DialogTitle>Tugmalarni Sozlash</DialogTitle>
        </VisuallyHidden>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 py-4 h-full">
          <ControlPanel
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onAddButton={handleAddButton}
            isCurrentRowFull={isCurrentRowFull}
          />
          <KeyboardPreview
            buttons={currentButtons}
            selectedRowIndex={selectedRowIndex}
            maxButtonsPerRow={MAX_BUTTONS_PER_ROW}
            onSelectRow={setSelectedRowIndex}
            onAddRow={handleAddRow}
            onRemoveButton={handleRemoveButton}
            onSaveChanges={handleSaveChanges}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

```

### 📄 constructor/components/ButtonGenerator/components/ButtonRow.tsx

```tsx
// FAYL: constructor/components/ButtonGenerator/components/ButtonRow.tsx (YANGI)
import { cn } from "@/lib/utils";
import { AlertCircle, CornerDownLeft } from "lucide-react";
import { ButtonConfig } from "../types";
import { PreviewButton } from "./PreviewButton";

interface ButtonRowProps {
  row: ButtonConfig[];
  rowIndex: number;
  isSelected: boolean;
  isFull: boolean;
  maxButtons: number;
  onSelect: () => void;
  onRemoveButton: (buttonId: string) => void;
}

export const ButtonRow = ({
  row,
  rowIndex,
  isSelected,
  isFull,
  maxButtons,
  onSelect,
  onRemoveButton,
}: ButtonRowProps) => (
  <div>
    <div
      className={cn(
        "flex gap-2 items-center p-2 rounded-md transition-all border border-transparent cursor-pointer",
        {
          "bg-primary/10 border-primary/50": isSelected,
          "hover:bg-accent": !isSelected,
          "cursor-not-allowed opacity-75": isFull && !isSelected,
        }
      )}
      onClick={onSelect}
    >
      {row.length > 0 ? (
        row.map((button) => (
          <PreviewButton
            key={button.id}
            button={button}
            onRemove={() => onRemoveButton(button.id)}
            isFullWidth={row.length === 1}
          />
        ))
      ) : (
        <div className="text-sm text-muted-foreground w-full flex items-center">
          <CornerDownLeft className="h-4 w-4 mr-2 text-primary" />
          {isSelected
            ? "Chapdan yangi tugma qo'shing"
            : "Shu qatorga qo'shish uchun bosing"}
        </div>
      )}
    </div>
    {isFull && (
      <div className="flex items-center text-xs text-amber-600 dark:text-amber-500 mt-1.5 px-2">
        <AlertCircle className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
        Bu qatorning limiti to'lgan ({maxButtons} ta).
      </div>
    )}
  </div>
);

```

### 📄 constructor/components/ButtonGenerator/components/ControlPanel.tsx

```tsx
// FAYL: constructor/components/ButtonGenerator/components/ControlPanel.tsx (YANGI)
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle } from "lucide-react";
import { InlineForm } from "./InlineForm";
import { ReplyForm } from "./ReplyForm";
import { ButtonConfig } from "../types";

interface ControlPanelProps {
  activeTab: "inline" | "reply";
  onTabChange: (tab: "inline" | "reply") => void;
  onAddButton: (button: ButtonConfig) => void;
  isCurrentRowFull: boolean;
}

export const ControlPanel = ({
  activeTab,
  onTabChange,
  onAddButton,
  isCurrentRowFull,
}: ControlPanelProps) => {
  return (
    <div className="md:col-span-4 flex flex-col gap-6 sticky top-0">
      <Tabs
        value={activeTab}
        onValueChange={(v) => onTabChange(v as "inline" | "reply")}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="inline">Inline Keyboard</TabsTrigger>
          <TabsTrigger value="reply">Reply Keyboard</TabsTrigger>
        </TabsList>
        <TabsContent value="inline">
          <InlineForm onAdd={onAddButton} disabled={isCurrentRowFull} />
        </TabsContent>
        <TabsContent value="reply">
          <ReplyForm onAdd={onAddButton} disabled={isCurrentRowFull} />
        </TabsContent>
      </Tabs>
      {isCurrentRowFull && (
        <div className="p-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-md text-sm flex items-start gap-2">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>
            Tanlangan qator to'la. Yangi tugma qo'shish uchun boshqa qatorni
            tanlang yoki "Yangi Qator" tugmasini bosing.
          </span>
        </div>
      )}
    </div>
  );
};

```

### 📄 constructor/components/ButtonGenerator/components/InlineForm.tsx

```tsx
// FAYL: constructor/components/ButtonGenerator/components/InlineForm.tsx (YANGILANGAN)
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle } from "lucide-react";
import { ButtonConfig, ButtonType, LoginUrlConfig } from "../types";
import { WebAppForm } from "./WebAppForm";
import { LoginUrlForm } from "./LoginUrlForm";

interface InlineFormProps {
  onAdd: (button: ButtonConfig) => void;
  disabled: boolean;
}

type InlineType =
  | "url"
  | "callback"
  | "web_app"
  | "login_url"
  | "switch_inline_query"
  | "switch_inline_query_current_chat";

const inlineOptions: {
  value: InlineType;
  label: string;
  placeholder?: string;
}[] = [
  { value: "callback", label: "Callback Data", placeholder: "buyruq_nomi" },
  { value: "url", label: "URL (Havola)", placeholder: "https://example.com" },
  { value: "web_app", label: "Web App" },
  { value: "login_url", label: "Login URL" },
  {
    value: "switch_inline_query",
    label: "Switch Inline (Global)",
    placeholder: "qidiruv so`rovi...",
  },
  {
    value: "switch_inline_query_current_chat",
    label: "Switch Inline (Hozirgi chat)",
    placeholder: "qidiruv so`rovi...",
  },
];

export const InlineForm = ({ onAdd, disabled }: InlineFormProps) => {
  const [text, setText] = useState("");
  const [actionType, setActionType] = useState<InlineType>("callback");
  const [value, setValue] = useState("");
  const [loginConfig, setLoginConfig] = useState<Partial<LoginUrlConfig>>({});
  const [webAppUrl, setWebAppUrl] = useState("");

  const handleAddClick = () => {
    if (!text) {
      alert("Iltimos, tugma matnini kiriting.");
      return;
    }

    const newButton: Partial<ButtonConfig> = {
      id: `btn-${Date.now()}`,
      text,
      type: actionType,
    };

    switch (actionType) {
      case "login_url":
        if (!loginConfig.url) {
          alert("Login URL manzilini kiriting.");
          return;
        }
        newButton.loginUrl = loginConfig as LoginUrlConfig;
        break;
      case "web_app":
        if (!webAppUrl) {
          alert("Web App URL manzilini kiriting.");
          return;
        }
        newButton.webApp = { url: webAppUrl };
        break;
      default: // url, callback, switch_*
        if (!value) {
          alert("Iltimos, amal uchun qiymat kiriting.");
          return;
        }
        newButton.value = value;
        break;
    }

    onAdd(newButton as ButtonConfig);
    // Formalarni tozalash
    setText("");
    setValue("");
    setLoginConfig({});
    setWebAppUrl("");
  };

  const selectedOption = inlineOptions.find((opt) => opt.value === actionType);

  return (
    <div className="mt-4 space-y-4">
      <div>
        <Label htmlFor="inline-text">Tugma matni</Label>
        <Input
          id="inline-text"
          placeholder="Masalan, Bizning sayt"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>
      <div>
        <Label>Amal turi</Label>
        <Select
          value={actionType}
          onValueChange={(v: InlineType) => setActionType(v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Amal turini tanlang..." />
          </SelectTrigger>
          <SelectContent>
            {inlineOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="animate-in fade-in-50">
        {actionType === "login_url" && (
          <LoginUrlForm config={loginConfig} onConfigChange={setLoginConfig} />
        )}
        {actionType === "web_app" && (
          <WebAppForm url={webAppUrl} onUrlChange={setWebAppUrl} />
        )}
        {(actionType === "url" ||
          actionType === "callback" ||
          actionType.startsWith("switch_")) && (
          <div>
            <Label htmlFor="inline-value">{selectedOption?.label}</Label>
            <Input
              id="inline-value"
              placeholder={selectedOption?.placeholder}
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </div>
        )}
      </div>

      <Button
        type="button"
        className="w-full"
        onClick={handleAddClick}
        disabled={disabled}
      >
        <PlusCircle className="mr-2 h-4 w-4" /> Inline Tugma Qo'shish
      </Button>
    </div>
  );
};

```

### 📄 constructor/components/ButtonGenerator/components/KeyboardPreview.tsx

```tsx
// FAYL: constructor/components/ButtonGenerator/components/KeyboardPreview.tsx (YANGI)
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { ButtonConfig } from "../types";
import { ButtonRow } from "./ButtonRow";

interface KeyboardPreviewProps {
  buttons: ButtonConfig[][];
  selectedRowIndex: number;
  maxButtonsPerRow: number;
  onSelectRow: (index: number) => void;
  onAddRow: () => void;
  onRemoveButton: (rowIndex: number, buttonId: string) => void;
  onSaveChanges: () => void;
}

export const KeyboardPreview = ({
  buttons,
  selectedRowIndex,
  maxButtonsPerRow,
  onSelectRow,
  onAddRow,
  onRemoveButton,
  onSaveChanges,
}: KeyboardPreviewProps) => (
  <div className="md:col-span-8 flex flex-col gap-3 rounded-lg border bg-muted p-4 h-full w-full">
    <div className="flex justify-between items-center mb-2">
      <Label className="text-muted-foreground">Tugmalar ko'rinishi</Label>
      <Button variant="ghost" size="sm" onClick={onAddRow}>
        <Plus className="mr-2 h-4 w-4" /> Yangi Qator
      </Button>
    </div>
    <div className="flex flex-col gap-2 flex-grow min-h-[200px] bg-background/50 p-2 rounded-md">
      {buttons.map((row, rowIndex) => (
        <ButtonRow
          key={rowIndex}
          row={row}
          rowIndex={rowIndex}
          isSelected={selectedRowIndex === rowIndex}
          isFull={row.length >= maxButtonsPerRow}
          maxButtons={maxButtonsPerRow}
          onSelect={() => onSelectRow(rowIndex)}
          onRemoveButton={(buttonId) => onRemoveButton(rowIndex, buttonId)}
        />
      ))}
    </div>
    <div className="mt-auto pt-4 border-t">
      <Button className="w-full" onClick={onSaveChanges}>
        Saqlash
      </Button>
    </div>
  </div>
);

```

### 📄 constructor/components/ButtonGenerator/components/LoginUrlForm.tsx

```tsx
// FAYL: constructor/components/ButtonGenerator/components/LoginUrlForm.tsx (YANGI)
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { LoginUrlConfig } from "../types";

interface LoginUrlFormProps {
  config: Partial<LoginUrlConfig>;
  onConfigChange: (newConfig: Partial<LoginUrlConfig>) => void;
}

export const LoginUrlForm = ({ config, onConfigChange }: LoginUrlFormProps) => {
  const handleChange = (field: keyof LoginUrlConfig, value: any) => {
    onConfigChange({ ...config, [field]: value });
  };

  return (
    <div className="space-y-3 p-3 border rounded-md bg-muted/50">
      <div className="grid gap-2">
        <Label htmlFor="login-url">Login URL</Label>
        <Input
          id="login-url"
          placeholder="https://auth.example.com/login"
          value={config.url || ""}
          onChange={(e) => handleChange("url", e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="forward-text">Forward matni (ixtiyoriy)</Label>
        <Input
          id="forward-text"
          placeholder="Kirish uchun bosing"
          value={config.forward_text || ""}
          onChange={(e) => handleChange("forward_text", e.target.value)}
        />
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="write-access"
          checked={!!config.request_write_access}
          onCheckedChange={(checked) =>
            handleChange("request_write_access", checked)
          }
        />
        <Label htmlFor="write-access" className="font-normal cursor-pointer">
          Botga yozish uchun ruxsat so'rash
        </Label>
      </div>
    </div>
  );
};

```

### 📄 constructor/components/ButtonGenerator/components/PreviewButton.tsx

```tsx
// FAYL: constructor/components/ButtonGenerator/components/PreviewButton.tsx (YANGI)
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ButtonConfig } from "../types";
import { getIconForButton } from "../utils";

interface PreviewButtonProps {
  button: ButtonConfig;
  onRemove: () => void;
  isFullWidth: boolean;
}

export const PreviewButton = ({
  button,
  onRemove,
  isFullWidth,
}: PreviewButtonProps) => (
  <div
    className={cn(
      "relative group overflow-hidden",
      isFullWidth ? "flex-grow" : "flex-1"
    )}
  >
    <Button variant="outline" className="pr-8 cursor-default w-full truncate">
      {getIconForButton(button)}
      <span className="truncate">{button.text}</span>
    </Button>
    <Button
      variant="destructive"
      size="icon"
      className="absolute -top-2 -right-2 h-5 w-5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
      onClick={(e) => {
        e.stopPropagation();
        onRemove();
      }}
    >
      <Trash2 className="h-3 w-3" />
    </Button>
  </div>
);

```

### 📄 constructor/components/ButtonGenerator/components/ReplyForm.tsx

```tsx
// FAYL: constructor/components/ButtonGenerator/components/ReplyForm.tsx (YANGILANGAN)
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle, Smartphone, MapPin, Globe, BarChart3 } from "lucide-react";
import { ButtonConfig } from "../types";
import { WebAppForm } from "./WebAppForm";

interface ReplyFormProps {
  onAdd: (button: ButtonConfig) => void;
  disabled: boolean;
}

export const ReplyForm = ({ onAdd, disabled }: ReplyFormProps) => {
  const [text, setText] = useState("");
  const [pollType, setPollType] = useState<"quiz" | "regular">("regular");
  const [webAppUrl, setWebAppUrl] = useState("");
  const [webAppText, setWebAppText] = useState("");

  const handleAddText = () => {
    if (!text) {
      alert("Iltimos, matnli tugma uchun matn kiriting.");
      return;
    }
    onAdd({ id: `btn-${Date.now()}`, text, type: "reply" });
    setText("");
  };

  const handleAddWebApp = () => {
    if (!webAppText || !webAppUrl) {
      alert("Web App uchun matn va URL kiriting.");
      return;
    }
    onAdd({
      id: `btn-${Date.now()}`,
      text: webAppText,
      type: "web_app",
      webApp: { url: webAppUrl },
    });
    setWebAppText("");
    setWebAppUrl("");
  };

  const handleAddSpecial = (
    type: "request_contact" | "request_location" | "request_poll"
  ) => {
    let newButton: ButtonConfig;
    switch (type) {
      case "request_contact":
        newButton = {
          id: `btn-${Date.now()}`,
          text: "📱 Kontaktimni yuborish",
          type,
        };
        break;
      case "request_location":
        newButton = {
          id: `btn-${Date.now()}`,
          text: "📍 Joylashuvimni yuborish",
          type,
        };
        break;
      case "request_poll":
        newButton = {
          id: `btn-${Date.now()}`,
          text: `📊 So'rovnoma yaratish (${pollType})`,
          type,
          pollType,
        };
        break;
    }
    onAdd(newButton);
  };

  return (
    <div className="mt-4 space-y-4">
      {/* Oddiy matnli tugma */}
      <div>
        <Label htmlFor="reply-text">Oddiy matnli tugma</Label>
        <div className="flex gap-2">
          <Input
            id="reply-text"
            placeholder="Masalan, Asosiy Menyu"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <Button
            type="button"
            onClick={handleAddText}
            disabled={disabled || !text}
          >
            <PlusCircle className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Web App tugmasi */}
      <div className="space-y-2 p-3 border rounded-md">
        <Label>Web App Tugmasi</Label>
        <Input
          placeholder="Tugma matni (masalan, 'Katalog')"
          value={webAppText}
          onChange={(e) => setWebAppText(e.target.value)}
        />
        <WebAppForm url={webAppUrl} onUrlChange={setWebAppUrl} />
        <Button
          type="button"
          className="w-full"
          onClick={handleAddWebApp}
          disabled={disabled}
        >
          <Globe className="mr-2 h-4 w-4" /> Web App qo'shish
        </Button>
      </div>

      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Maxsus so'rovlar
          </span>
        </div>
      </div>

      {/* Maxsus so'rov tugmalari */}
      <div className="space-y-3">
        <Button
          variant="outline"
          className="w-full justify-start"
          type="button"
          onClick={() => handleAddSpecial("request_contact")}
          disabled={disabled}
        >
          <Smartphone className="mr-2 h-4 w-4" /> Kontakt so'rash
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start"
          type="button"
          onClick={() => handleAddSpecial("request_location")}
          disabled={disabled}
        >
          <MapPin className="mr-2 h-4 w-4" /> Joylashuv so'rash
        </Button>

        <div className="flex gap-2 items-end">
          <div className="flex-grow">
            <Label>So'rovnoma turi</Label>
            <Select
              value={pollType}
              onValueChange={(v: "quiz" | "regular") => setPollType(v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="regular">Oddiy</SelectItem>
                <SelectItem value="quiz">Viktorina (Quiz)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="outline"
            type="button"
            onClick={() => handleAddSpecial("request_poll")}
            disabled={disabled}
          >
            <BarChart3 className="mr-2 h-4 w-4" /> Qo'shish
          </Button>
        </div>
      </div>
    </div>
  );
};

```

### 📄 constructor/components/ButtonGenerator/components/WebAppForm.tsx

```tsx
// FAYL: constructor/components/ButtonGenerator/components/WebAppForm.tsx (YANGI)
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface WebAppFormProps {
  url: string;
  onUrlChange: (url: string) => void;
}

export const WebAppForm = ({ url, onUrlChange }: WebAppFormProps) => (
  <div className="grid gap-2">
    <Label htmlFor="webapp-url">Web App URL</Label>
    <Input
      id="webapp-url"
      placeholder="https://example.com/webapp"
      value={url}
      onChange={(e) => onUrlChange(e.target.value)}
    />
  </div>
);

```

### 📄 constructor/components/ButtonGenerator/hook/useButtonGeneratorState.ts

```ts
// FAYL: constructor/components/ButtonGenerator/hooks/useButtonGeneratorState.ts (YANGI HOOK)

import { useState, useEffect, useMemo } from "react";
import { ButtonConfig } from "../types";
import { KeyboardConfig } from "@/constructor/nodes/actions/TextMessageNode/types";

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

```

### 📄 constructor/components/ButtonGenerator/index.ts

```ts
export * from "./ButtonGenerator";
export * from "./types";

```

### 📄 constructor/components/ButtonGenerator/types.ts

```ts
// FAYL: constructor/components/ButtonGenerator/types.ts (YANGILANGAN)

// Login URL uchun maxsus konfiguratsiya
export interface LoginUrlConfig {
  url: string;
  forward_text?: string;
  bot_username?: string;
  request_write_access?: boolean;
}

// Web App uchun maxsus konfiguratsiya
export interface WebAppConfig {
  url: string;
}

// Barcha mumkin bo'lgan tugma turlari
export type ButtonType =
  // Mavjud
  | "url"
  | "callback"
  | "reply"
  | "request_contact"
  | "request_location"
  // Yangi
  | "switch_inline_query"
  | "switch_inline_query_current_chat"
  | "web_app"
  | "login_url"
  | "request_poll";

// Asosiy tugma konfiguratsiyasi
export interface ButtonConfig {
  id: string;
  text: string;
  type: ButtonType;

  // Ixtiyoriy, turli xil qiymatlar uchun
  value?: string; // url, callback, switch_inline_* uchun ishlatiladi
  webApp?: WebAppConfig;
  loginUrl?: LoginUrlConfig;
  pollType?: "quiz" | "regular"; // request_poll uchun
}

```

### 📄 constructor/components/ButtonGenerator/utils.tsx

```tsx
// FAYL: constructor/components/ButtonGenerator/utils.ts (YANGILANGAN)
import { ReactNode } from "react";
import {
  Link,
  Code,
  Smartphone,
  MapPin,
  Globe,
  LogIn,
  Repeat,
  BarChart3,
} from "lucide-react";
import { ButtonConfig } from "./types";

export const getIconForButton = (button: ButtonConfig): ReactNode => {
  const commonClasses = "mr-2 h-4 w-4";
  switch (button.type) {
    case "url":
      return <Link className={commonClasses} />;
    case "callback":
      return <Code className={commonClasses} />;
    case "request_contact":
      return <Smartphone className={commonClasses} />;
    case "request_location":
      return <MapPin className={commonClasses} />;
    // --- YANGI IKONKALAR ---
    case "web_app":
      return <Globe className={commonClasses} />;
    case "login_url":
      return <LogIn className={commonClasses} />;
    case "switch_inline_query":
    case "switch_inline_query_current_chat":
      return <Repeat className={commonClasses} />;
    case "request_poll":
      return <BarChart3 className={commonClasses} />;
    default:
      // 'reply' uchun ikonka yo'q
      return null;
  }
};

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
} from "reactflow";
import "reactflow/dist/style.css";
import { ElementItemType } from "@/types/element-types";
import { useFlowStore } from "./store";
import { CustomNodes } from "./nodes";
import { CustomEdge } from "./edges";
import { QuickAddPalette } from "./components";
import { useFlowKeyboardShortcuts } from "./hooks/useFlowKeyboardShortcuts";
import { useMousePosition } from "./hooks/useMousePosition";
import { instanceAuth } from "@/services/instance";
import { useParams } from "next/navigation";
import useUserStore from "@/services/store/project";

function FlowchartInner() {
  const { bot }: { bot: string } = useParams();
  const { fetchProject, loading, response } = useUserStore((state) => state);

  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const { screenToFlowPosition } = useReactFlow();
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const mousePosition = useMousePosition();

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useFlowKeyboardShortcuts({
    containerRef: reactFlowWrapper,
    mousePosition: mousePosition,
    onOpenPalette: () => {},
  });

  // Store'dan kerakli qismlarni olamiz
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode } =
    useFlowStore();

  // O'zgartirishdan keyin (tavsiya etiladi)
  const saveFlow = useCallback(() => {
    if (response)
      instanceAuth.patch(`/project/${response.data.id}/`, {
        flow: {
          nodes: nodes,
          edges: edges,
        },
      });
  }, [bot, nodes, edges]); // Funksiya faqat shu qiymatlar o'zgarganda yangilanadi

  // Bu useEffect nodes va edges o'zgarishini kuzatib boradi
  useEffect(() => {
    // Agar eski taymer bo'lsa, uni tozalaymiz
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Yangi taymerni o'rnatamiz. 2 sekunddan so'ng saqlaydi.
    saveTimeoutRef.current = setTimeout(() => {
      // Faqatgina o'zgarish bo'lgandagina saqlash mantiqini qo'shish mumkin
      // Bu yerda saveFlow'ni chaqiramiz.
      // `saveFlow` endi bildirishnoma ko'rsatmasligi uchun uni o'zgartirish kerak bo'lishi mumkin.
      console.log("Avtomatik saqlanmoqda...");
      saveFlow();
    }, 2000); // 2000ms = 2 sekund

    // Komponent yo'q qilinganda taymerni tozalash uchun
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [nodes, edges, saveFlow]); // nodes, edges yoki saveFlow o'zgarganda ishlaydi

  const handlePaletteSelect = (element: ElementItemType) => {
    const position = screenToFlowPosition(mousePosition);
    addNode(element, position);
  };

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

  // Fokusni boshqarish soddalashdi
  const handleContainerClick = (event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
    const isInteractiveElement =
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.isContentEditable ||
      target.closest("button, a, [role='button']");

    if (
      !isInteractiveElement &&
      reactFlowWrapper.current &&
      (target.classList.contains("react-flow__pane") ||
        event.target === reactFlowWrapper.current)
    ) {
      reactFlowWrapper.current.focus();
    }
  };

  return (
    <div
      ref={reactFlowWrapper}
      className="w-full h-[calc(100vh-56px)] outline-none" // `tabIndex` hook ichida o'rnatiladi
      onDrop={onDrop}
      onDragOver={onDragOver}
      onMouseDown={handleContainerClick}
    >
      <ReactFlow
        nodeTypes={CustomNodes}
        edgeTypes={CustomEdge}
        nodes={nodes}
        edges={edges}
        onConnect={onConnect}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        panOnScroll
        selectionOnDrag
        multiSelectionKeyCode={["Shift"]}
        deleteKeyCode={null} // O'zimizning handler'imizni ishlatamiz
        minZoom={0.1}
        maxZoom={2}
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
    // Bular bot senariysini ishga tushiruvchi hodisalar
    title: "🚀 Triggerlar (Boshlovchilar)",
    elements: [
      {
        type: "message",
        name: "Xabar kelganda",
        description: "Foydalanuvchidan xabar kelganda.",
        icon: "💬",
        color: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        triggerId: "MessageTriggerNode",
      },
      {
        type: "command",
        name: "Buyruq kelganda",
        description: "/start yoki /help kabi buyruq yuborganda.",
        icon: "⌘",
        color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        triggerId: "CommandTriggerNode",
      },
      {
        type: "reply_button",
        name: "Javob tugmasi bosilganda",
        description: "Tugmani bosganda.",
        icon: "↩️",
        color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
        triggerId: "ReplyButtonTriggerNode",
      },
      {
        type: "callback_query",
        name: "Inline tugma bosilganda",
        description: "Inline tugmani bosganda.",
        icon: "🕸️",
        color: "bg-teal-500/10 text-teal-400 border-teal-500/20",
        triggerId: "CallbackQueryTriggerNode",
      },
    ],
  },
  {
    // Bular bot bajaradigan amallar
    title: "⚙️ Amallar",
    elements: [
      {
        type: "message",
        name: "Matn yuborish",
        description: "Foydalanuvchiga matnli xabar yuboradi.",
        icon: "💬",
        color: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        triggerId: "SendTextMessageNode",
      },
      {
        type: "photo",
        name: "Rasm yuborish",
        description: "Foydalanuvchiga rasm yuboradi.",
        icon: "🖼️",
        color: "bg-purple-500/10 text-purple-400 border-purple-500/20",
        triggerId: "SendPhotoNode",
      },
      {
        type: "video",
        name: "Video yuborish",
        description: "Foydalanuvchiga video yuboradi.",
        icon: "📹",
        color: "bg-red-500/10 text-red-400 border-red-500/20",
        triggerId: "SendVideoNode",
      },
      {
        type: "audio",
        name: "Audio yuborish",
        description: "Foydalanuvchiga audio fayl yuboradi.",
        icon: "🎵",
        color: "bg-pink-500/10 text-pink-400 border-pink-500/20",
        triggerId: "SendAudioNode",
      },
      {
        type: "file",
        name: "Fayl yuborish",
        description:
          "Foydalanuvchiga hujjat yoki boshqa turdagi fayl yuboradi.",
        icon: "📄",
        color: "bg-gray-500/10 text-gray-400 border-gray-500/20",
        triggerId: "SendFileNode",
      },
    ],
  },
  {
    // Bu murakkab mantiq uchun maxsus blok
    title: "🧩 Maxsus Mantiq",
    elements: [
      {
        type: "code",
        name: "Maxsus Kod",
        description:
          "Murakkab amallar va shartlar uchun Python kodi yozish imkonini beradi.",
        icon: "🖥️",
        color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
        triggerId: "CustomCodeNode",
      },
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

### 📄 constructor/data/themes.ts

```ts
// FAYL: constructor/data/themes.ts

export const themes = {
  dark: {
    name: "dark",
    bg: "bg-black/80 backdrop-blur-sm",
    header: "bg-gray-900/80 border-gray-700/50",
    text: "text-gray-300",
    prompt: "text-gray-500",
    error: "text-red-400",
    info: "text-sky-400",
    warn: "text-yellow-400",
    system: "text-fuchsia-400",
  },
  light: {
    name: "light",
    bg: "bg-white/80 backdrop-blur-sm",
    header: "bg-gray-50/80 border-gray-200",
    text: "text-gray-800",
    prompt: "text-gray-400",
    error: "text-red-600",
    info: "text-sky-600",
    warn: "text-yellow-600",
    system: "text-fuchsia-600",
  },
};

export type Theme = typeof themes.dark;
export type ThemeName = keyof typeof themes;

```

### 📄 constructor/edges/SmartEdge.tsx

```tsx
"use client";
import {
  BaseEdge,
  type EdgeProps,
  getSmoothStepPath,
  useNodes,
} from "reactflow";
import { getObstacleNodes } from "../lib/geometry";

export interface SmartEdgeProps extends EdgeProps {
  data?: {
    // Kelajakda qo'shimcha sozlamalar uchun
  };
}

export default function SmartEdge({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  selected,
}: SmartEdgeProps) {
  const nodes = useNodes();

  const getPath = (): string => {
    // 1. To'siqlarni aniqlash
    const potentialObstacles = nodes.filter(
      (n) => n.id !== source && n.id !== target
    );
    const obstacles = getObstacleNodes(
      { x: sourceX, y: sourceY },
      { x: targetX, y: targetY },
      potentialObstacles
    );

    // 2. Aylanma yo'l kerakmi?
    const needsLoop = targetY < sourceY - 20 || obstacles.length > 0;

    if (!needsLoop) {
      // Yo'l toza bo'lsa, standart silliq chiziq
      const [path] = getSmoothStepPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
        borderRadius: 15,
      });
      return path;
    }

    // --- MUKAMMALLASHTIRILGAN, ANIQ VA SILLIQ AYLANMA YO'L CHIZISH ALGORITMI ---
    const verticalMargin = 40;
    const cornerRadius = 15;

    // Asosiy nuqtalarni va yo'nalishlarni hisoblash
    const sourceNode = nodes.find((n) => n.id === source);
    const targetNode = nodes.find((n) => n.id === target);

    // Qaysi tomondan aylanib o'tish
    const loopDirection = targetX >= sourceX ? 1 : -1;

    // Aylanib o'tish yo'lagining X koordinatasi
    let laneX: number;
    if (loopDirection === 1) {
      // O'ngdan
      const sourceRight = sourceNode
        ? sourceNode.position.x + (sourceNode.width || 0)
        : sourceX;
      const targetRight = targetNode
        ? targetNode.position.x + (targetNode.width || 0)
        : targetX;
      laneX = Math.max(sourceRight, targetRight) + 60;
    } else {
      // Chapdan
      const sourceLeft = sourceNode ? sourceNode.position.x : sourceX;
      const targetLeft = targetNode ? targetNode.position.x : targetX;
      laneX = Math.min(sourceLeft, targetLeft) - 60;
    }

    // Yo'lning burilish nuqtalari
    const p1 = { x: sourceX, y: sourceY + verticalMargin };
    const p2 = { x: laneX, y: p1.y };
    const p3 = { x: laneX, y: targetY - verticalMargin };
    const p4 = { x: targetX, y: p3.y };

    // Har bir segment uchun aniq yo'nalishlarni hisoblash
    const vDir1 = Math.sign(p2.y - p1.y); // Bu deyarli har doim 0, lekin qoldiramiz
    const hDir1 = Math.sign(p2.x - p1.x); // Bu loopDirection bilan bir xil

    const vDir2 = Math.sign(p3.y - p2.y); // Bu eng muhim vertikal yo'nalish
    const hDir2 = Math.sign(p4.x - p3.x); // Bu -loopDirection bilan bir xil

    const vDir3 = Math.sign(targetY - p4.y); // Bu har doim +1

    // SVG path stringini qismlab, ehtiyotkorlik bilan yig'amiz
    return [
      `M ${sourceX} ${sourceY}`, // Boshlang'ich nuqta
      `V ${p1.y - cornerRadius * vDir1}`, // 1-burilishgacha vertikal harakat
      `Q ${p1.x} ${p1.y}, ${p1.x + cornerRadius * hDir1} ${p1.y}`, // 1-burilish (silliq)
      `H ${p2.x - cornerRadius * hDir1}`, // 2-burilishgacha gorizontal harakat
      `Q ${p2.x} ${p2.y}, ${p2.x} ${p2.y + cornerRadius * vDir2}`, // 2-burilish
      `V ${p3.y - cornerRadius * vDir2}`, // 3-burilishgacha vertikal harakat
      `Q ${p3.x} ${p3.y}, ${p3.x + cornerRadius * hDir2} ${p3.y}`, // 3-burilish
      `H ${p4.x - cornerRadius * hDir2}`, // 4-burilishgacha gorizontal harakat
      `Q ${p4.x} ${p4.y}, ${p4.x} ${p4.y + cornerRadius * vDir3}`, // 4-burilish
      `V ${targetY}`, // Manzilga yetib borish
    ].join(" ");
  };

  const edgePath = getPath();

  // Tanlangan va tanlanmagan holat uchun stillarni aniqlab olamiz
  const selectedStyle = {
    stroke: "#3b82f6", // Ko'k rang
    strokeWidth: 2.5,
  };

  const defaultStyle = {
    stroke: "#495057", // To'q kulrang (default)
    strokeWidth: 1.5,
  };

  const dynamicStyle = selected ? selectedStyle : defaultStyle;

  const markerColor = selected ? "#3b82f6" : "#495057";

  return (
    <>
      <marker
        id={`arrowhead-${id}`}
        viewBox="0 0 10 10"
        refX="9" // Chiziq uchidan biroz oldinroq tugaydi
        refY="5"
        markerUnits="strokeWidth"
        markerWidth="10" // O'lchami
        markerHeight="8"
        orient="auto-start-reverse"
      >
        {/* MINIMALISTIK VA NAFIS STRELKA */}
        <path
          d="M 0 0 L 10 5 L 0 10 z" // Oddiy, lekin to'g'ri shakldagi uchburchak
          fill={markerColor}
          stroke="none"
        />
      </marker>

      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={`url(#arrowhead-${id})`}
        style={{
          ...style,
          ...dynamicStyle,
          transition:
            "stroke-width 0.15s ease-in-out, stroke 0.15s ease-in-out",
        }}
      />
    </>
  );
}

```

### 📄 constructor/edges/components/EdgeContextMenu.tsx

```tsx
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// Ranglar palitrasi
const colors = [
  "#6b7280", // Gray
  "#ef4444", // Red
  "#f97316", // Orange
  "#eab308", // Yellow
  "#22c55e", // Green
  "#3b82f6", // Blue
  "#8b5cf6", // Violet
];

interface EdgeContextMenuProps {
  onDelete: () => void;
  onColorChange: (color: string) => void;
}

export const EdgeContextMenu = ({
  onDelete,
  onColorChange,
}: EdgeContextMenuProps) => {
  return (
    <div className="p-1.5 bg-background border shadow-xl rounded-lg flex items-center gap-2">
      {/* Rang tanlash qismi */}
      <div className="flex items-center gap-1.5">
        {colors.map((color) => (
          <button
            key={color}
            onClick={() => onColorChange(color)}
            className="w-5 h-5 rounded-full border border-border transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
            style={{ backgroundColor: color }}
            aria-label={`Change color to ${color}`}
          />
        ))}
      </div>

      {/* Ajratuvchi */}
      <div className="w-px h-5 bg-border mx-1" />

      {/* O'chirish tugmasi */}
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        onClick={onDelete}
        aria-label="Delete edge"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

```

### 📄 constructor/edges/index.ts

```ts
// Mavjud `export const CustomEdge = {};` qatorini o'chiring va o'rniga buni yozing:

import SmartEdge from "./SmartEdge";

export const CustomEdge = {
  // Yangi edge turiga nom beramiz
  "smart-edge": SmartEdge,
};

```

### 📄 constructor/hooks/useFlowKeyboardShortcuts.ts

```ts
import { useEffect, RefObject } from "react";
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
    setCtrlPressed,
  } = useFlowStore((state) => ({
    selectAll: state.selectAll,
    copySelection: state.copySelection,
    paste: state.paste,
    duplicateSelection: state.duplicateSelection,
    deleteSelectedElements: state.deleteSelectedElements,
    setCtrlPressed: state.setCtrlPressed,
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
        event.preventDefault();
        deleteSelectedElements();
      } else if (ctrlOrCmd && event.key === " ") {
        event.preventDefault();
        onOpenPalette();
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === "Control") {
        setCtrlPressed(false);
      }
    };

    const handleBlur = () => {
      setCtrlPressed(false);
    };

    containerElement.setAttribute("tabIndex", "0");
    containerElement.addEventListener("keydown", handleKeyDown);
    containerElement.addEventListener("keyup", handleKeyUp);
    containerElement.addEventListener("blur", handleBlur);

    return () => {
      containerElement.removeEventListener("keydown", handleKeyDown);
      containerElement.removeEventListener("keyup", handleKeyUp);
      containerElement.removeEventListener("blur", handleBlur);
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
    containerRef,
    onOpenPalette,
  ]);
}

```

### 📄 constructor/hooks/useMousePosition.ts

```ts
import { useEffect, useState } from "react";

export function useMousePosition() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return mousePosition;
}

```

### 📄 constructor/lib/geometry.ts

```ts
import { Node, XYPosition } from "reactflow";

// To'rtburchak (Bounding Box) uchun interfeys
interface BBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Ikki nuqta orasidagi chiziq segmenti to'rtburchak bilan kesishadimi yoki yo'qligini tekshiradi.
 * @param p1 Chiziqning boshlang'ich nuqtasi {x, y}
 * @param p2 Chiziqning tugash nuqtasi {x, y}
 * @param rect To'rtburchakning BBox'i {x, y, width, height}
 * @returns Kesishsa `true`, aks holda `false`
 */
function lineIntersectsRect(
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  rect: BBox
): boolean {
  // To'rtburchakning chegaralarini aniqlaymiz
  const left = rect.x;
  const right = rect.x + rect.width;
  const top = rect.y;
  const bottom = rect.y + rect.height;

  // Har bir tomon bilan kesishishni tekshirib chiqamiz
  const intersects = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number,
    x4: number,
    y4: number
  ): boolean => {
    const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (den === 0) return false; // Parallel chiziqlar

    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;

    return t >= 0 && t <= 1 && u >= 0 && u <= 1;
  };

  // Har bir tomon bilan tekshirish
  if (intersects(p1.x, p1.y, p2.x, p2.y, left, top, right, top)) return true; // Yuqori tomon
  if (intersects(p1.x, p1.y, p2.x, p2.y, right, top, right, bottom))
    return true; // O'ng tomon
  if (intersects(p1.x, p1.y, p2.x, p2.y, right, bottom, left, bottom))
    return true; // Pastki tomon
  if (intersects(p1.x, p1.y, p2.x, p2.y, left, bottom, left, top)) return true; // Chap tomon

  return false;
}

/**
 * Chiziq yo'lidagi to'siq bo'lgan nodelarni topadi.
 * @param sourcePos - Boshlang'ich nuqta
 * @param targetPos - Manzil nuqtasi
 * @param nodes - Barcha nodelar ro'yxati
 * @param padding - Nodelar atrofidagi xavfsizlik maydoni (bufer)
 * @returns To'siq bo'lgan nodelar massivi
 */
export const getObstacleNodes = (
  sourcePos: XYPosition,
  targetPos: XYPosition,
  nodes: Node[],
  padding = 20 // Xavfsizlik maydonini kattaroq qilamiz
): Node[] => {
  const obstacles: Node[] = [];

  const minX = Math.min(sourcePos.x, targetPos.x);
  const maxX = Math.max(sourcePos.x, targetPos.x);
  const minY = Math.min(sourcePos.y, targetPos.y);
  const maxY = Math.max(sourcePos.y, targetPos.y);

  for (const node of nodes) {
    if (!node.width || !node.height || !node.position) {
      continue;
    }
    const nodeBBox: BBox = {
      x: node.position.x - padding,
      y: node.position.y - padding,
      width: node.width + padding * 2,
      height: node.height + padding * 2,
    };

    // Agar node to'g'ri chiziqning bounding box'i bilan kesishmasa, o'tkazib yuboramiz
    if (
      nodeBBox.x + nodeBBox.width < minX - padding ||
      nodeBBox.x > maxX + padding ||
      nodeBBox.y + nodeBBox.height < minY - padding ||
      nodeBBox.y > maxY + padding
    ) {
      continue;
    }

    // Agar chiziq nodening o'zi bilan kesishsa, uni to'siq deb hisoblaymiz
    if (lineIntersectsRect(sourcePos, targetPos, nodeBBox)) {
      obstacles.push(node);
    }
  }

  return obstacles;
};

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
import { useFlowStore } from "@/constructor/store";
import { SendAudioNodeData, RecipientType, AudioSourceType } from "./types";

import { FiMusic } from "react-icons/fi";

// Bizning andozamiz uchun yangi importlar
import { NodeHeader } from "../shared/NodeHeader";
import { NodeFooter } from "../shared/NodeFooter";
import { RecipientsManager } from "../shared/RecipientSelector";
import { SourceHandler, TargetHandler } from "../../components";

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
  const buttonCount =
    (data.keyboard?.active === "inline"
      ? data.keyboard?.inline
      : data.keyboard?.reply
    )?.flat().length || 0;

  return (
    <Card className={cn("w-100 shadow-lg", selected && "ring-2 ring-primary")}>
      <TargetHandler />

      <NodeHeader
        icon={<FiMusic className="text-primary" />}
        title="Audio yuborish"
        buttonCount={buttonCount}
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
              keyboard={data.keyboard}
              disableNotification={data.disableNotification}
              protectContent={data.protectContent}
              onUpdate={handleUpdate}
            />
          </CardContent>
        </>
      )}

      <SourceHandler />
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
import { KeyboardConfig } from "../TextMessageNode/types";

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

  keyboard?: KeyboardConfig; // <-- O'ZGARISH SHU YERDA
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
import { useFlowStore } from "@/constructor/store";
import { SendFileNodeData, RecipientType, FileSourceType } from "./types";

import { NodeFooter } from "../shared/NodeFooter";
import { NodeHeader } from "../shared/NodeHeader";
import { FileText } from "lucide-react";
import { RecipientsManager } from "../shared/RecipientSelector";
import { SourceHandler, TargetHandler } from "../../components";

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
  const buttonCount =
    (data.keyboard?.active === "inline"
      ? data.keyboard?.inline
      : data.keyboard?.reply
    )?.flat().length || 0;

  return (
    <Card className={cn("w-100 shadow-lg", selected && "ring-2 ring-primary")}>
      <TargetHandler />

      <NodeHeader
        icon={<FileText className="text-primary" />}
        title="Xabar yuborish"
        buttonCount={buttonCount}
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
            keyboard={data.keyboard}
            disableNotification={data.disableNotification}
            protectContent={data.protectContent}
            onUpdate={handleUpdate}
          />
        </>
      )}

      <SourceHandler />
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
import { KeyboardConfig } from "../TextMessageNode/types";

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

  keyboard?: KeyboardConfig;
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
import { cn } from "@/lib/utils";
import { useFlowStore } from "@/constructor/store";
import { SendPhotoNodeData, PhotoSourceType } from "./types";

// Yaratgan andozamiz uchun kerakli importlar
import { Camera } from "lucide-react";
import { NodeHeader } from "../shared/NodeHeader";
import { NodeFooter } from "../shared/NodeFooter";
import { RecipientsManager } from "../shared/RecipientSelector";
import { SourceHandler, TargetHandler } from "../../components";

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
  const buttonCount =
    (data.keyboard?.active === "inline"
      ? data.keyboard?.inline
      : data.keyboard?.reply
    )?.flat().length || 0;

  return (
    <Card className={cn("w-100 shadow-lg", selected && "ring-2 ring-primary")}>
      <TargetHandler />

      <NodeHeader
        icon={<Camera className="text-primary" />}
        title="Rasm Yuborish"
        buttonCount={buttonCount}
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
            <div className="flex flex-col gap-2">
              <Label>Rasm manbasi</Label>

              <div className="">
                <Select
                  value={data.photoSourceType}
                  onValueChange={(value: PhotoSourceType) =>
                    handleUpdate({ photoSourceType: value })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Manbani tanlang..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="file_id">Mavjud File ID</SelectItem>
                    <SelectItem value="url">Internet (URL)</SelectItem>
                    <SelectItem value="upload">Kompyuterdan yuklash</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
            keyboard={data.keyboard}
            disableNotification={data.disableNotification}
            protectContent={data.protectContent}
            onUpdate={handleUpdate}
          />
        </>
      )}

      <SourceHandler />
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
import { KeyboardConfig } from "../TextMessageNode/types";

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

  keyboard?: KeyboardConfig;
}

```

### 📄 constructor/nodes/actions/TextMessageNode/TextMessageNode.tsx

```tsx
import { NodeProps } from "reactflow";

import TextareaAutosize from "react-textarea-autosize";

import { ParseMode, SendTextMessageNodeData } from "./types";
import { useFlowStore } from "@/constructor/store";
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
import { NodeHeader } from "../shared/NodeHeader";
import { NodeFooter } from "../shared/NodeFooter";
import { RecipientsManager } from "../shared/RecipientSelector";
import { SourceHandler, TargetHandler } from "../../components";

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
  // Tugmalar sonini yangi `keyboard` strukturasidan hisoblaymiz
  const buttonCount =
    (data.keyboard?.active === "inline"
      ? data.keyboard?.inline
      : data.keyboard?.reply
    )?.flat().length || 0;
  return (
    <Card className={cn("w-100 shadow-lg", selected && "ring-2 ring-primary")}>
      <TargetHandler />

      <NodeHeader
        icon={<LetterText className="text-primary" />}
        title="Xabar yuborish"
        buttonCount={buttonCount}
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
            </div>
          </CardContent>

          <NodeFooter
            nodeId={id}
            keyboard={data.keyboard}
            disableNotification={data.disableNotification}
            protectContent={data.protectContent}
            onUpdate={handleUpdate}
          />
        </>
      )}
      <SourceHandler />
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

export type KeyboardType = "inline" | "reply";

// --- Yengi qo'shiladigan struktura ---
export interface KeyboardConfig {
  active: KeyboardType;
  inline: ButtonConfig[][];
  reply: ButtonConfig[][];
}

export type ParseMode = "HTML" | "MarkdownV2" | "None";

export interface SendTextMessageNodeData {
  recipients?: {
    sendToSender: boolean;
    additionalIds: string[];
  };
  messageText?: string;
  parseMode?: ParseMode;
  disableWebPagePreview?: boolean;
  disableNotification?: boolean;
  protectContent?: boolean;

  // `buttons` va `keyboardType` o'rniga bitta obyekt keladi
  keyboard?: KeyboardConfig; // <-- O'ZGARISH SHU YERDA
}

```

### 📄 constructor/nodes/actions/VideoMessageNode/VideMessageNode.tsx

```tsx
"use client";

import { useState, memo } from "react";
import { NodeProps } from "reactflow";
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
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useFlowStore } from "@/constructor/store";
import { SendVideoNodeData, RecipientType, VideoSourceType } from "./types";
import { Video } from "lucide-react";

// Andozamiz uchun yangi importlar
import { NodeHeader } from "../shared/NodeHeader";
import { NodeFooter } from "../shared/NodeFooter";
import { RecipientsManager } from "../shared/RecipientSelector";
import { SourceHandler, TargetHandler } from "../../components";

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

  const buttonCount =
    (data.keyboard?.active === "inline"
      ? data.keyboard?.inline
      : data.keyboard?.reply
    )?.flat().length || 0;

  return (
    <Card className={cn("w-96 shadow-lg", selected && "ring-2 ring-primary")}>
      <TargetHandler />

      <NodeHeader
        icon={<Video className="text-primary" />}
        title="video Yuborish"
        buttonCount={buttonCount}
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
            keyboard={data.keyboard}
            disableNotification={data.disableNotification}
            protectContent={data.protectContent}
            onUpdate={handleUpdate}
          />
        </>
      )}

      <SourceHandler />
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
import { KeyboardConfig } from "../TextMessageNode/types";

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

  keyboard?: KeyboardConfig;
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

import { KeyboardConfig } from "../TextMessageNode/types";

interface NodeFooterProps {
  nodeId: string;
  keyboard?: KeyboardConfig;
  disableNotification?: boolean;
  protectContent?: boolean;
  onUpdate: (
    update: Partial<{
      keyboard: KeyboardConfig;
      disableNotification: boolean;
      protectContent: boolean;
    }>
  ) => void;
}

export const NodeFooter = ({
  nodeId,
  keyboard,
  disableNotification,
  protectContent,
  onUpdate,
}: NodeFooterProps) => {
  const buttonCount =
    (keyboard?.active === "inline" ? keyboard?.inline : keyboard?.reply)?.flat()
      .length || 0;

  const handleKeyboardUpdate = (newKeyboard: KeyboardConfig) => {
    onUpdate({ keyboard: newKeyboard });
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

      <ButtonGenerator initialKeyboard={keyboard} onSave={handleKeyboardUpdate}>
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

### 📄 constructor/nodes/components/index.ts

```ts
export * from "./shared";

```

### 📄 constructor/nodes/components/shared/ReactFlowHandlers/SourceHandler.tsx

```tsx
import React from "react";
import { PlusIcon } from "lucide-react";
import { Handle, Position } from "reactflow";

export function SourceHandler() {
  return (
    <Handle
      type="source"
      position={Position.Bottom}
      // Handle'ga stil berish uchun asosiy klasslar
      className="!w-4 !h-4 !bg-sky-500 !border-2 !border-gray-800 flex items-center justify-center"
    >
      <PlusIcon
        size={12}
        // MUHIM: Bu klass sichqoncha hodisalarini "o'tkazib yuboradi"
        className="w-2 h-2 text-white pointer-events-none"
      />
    </Handle>
  );
}

```

### 📄 constructor/nodes/components/shared/ReactFlowHandlers/TargetHandler.tsx

```tsx
import React from "react";
import { CircleDot } from "lucide-react";
import { Handle, Position } from "reactflow";

export function TargetHandler() {
  return (
    <Handle
      type="target"
      position={Position.Top}
      className="!w-4 !h-4 !bg-sky-500 !border-2 !border-gray-800 flex items-center justify-center"
    >
      <CircleDot size={12} className="w-2 h-2 text-white" />
    </Handle>
  );
}

```

### 📄 constructor/nodes/components/shared/ReactFlowHandlers/index.ts

```ts
export * from "./SourceHandler";
export * from "./TargetHandler";

```

### 📄 constructor/nodes/components/shared/index.ts

```ts
export * from "./ReactFlowHandlers";

```

### 📄 constructor/nodes/custom/CustomCodeNode/CustomCodeNode.tsx

```tsx
"use client";

import { memo, useState } from "react";
import { NodeProps } from "reactflow";
import { useFlowStore } from "@/constructor/store";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Code2, PenLine } from "lucide-react";
import { NodeHeader } from "@/constructor/nodes/actions/shared/NodeHeader";
import { SourceHandler, TargetHandler } from "../../components";
import { CustomCodeNodeData } from "./types";
import { EditorThemeName } from "@/constructor/data/editor-themes";
import { CodeEditorDialog } from "./components/CodeEditorDialog";

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

// Kod prevyusini yaratuvchi yordamchi funksiya
const generateCodePreview = (code: string | undefined): string => {
  if (!code || code.trim() === "") {
    return "";
  }
  // Kodni qatorlarga bo'lib, bo'sh va izohli qatorlarni olib tashlaymiz
  const lines = code
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));
  // Birinchi 3-4 qatorni olamiz
  return lines.slice(0, 4).join("\n");
};

const CustomCodeNodeComponent = ({
  id,
  data,
  selected,
}: NodeProps<CustomCodeNodeData>) => {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleSave = (newCode: string, theme: EditorThemeName) => {
    updateNodeData(id, { pythonCode: newCode, editorTheme: theme });
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateNodeData(id, { nodeTitle: e.target.value });
  };

  const hasCode = data.pythonCode && data.pythonCode.trim() !== "";
  const codePreview = generateCodePreview(data.pythonCode);

  return (
    <Card className={cn("w-80 shadow-lg", selected && "ring-2 ring-primary")}>
      <TargetHandler />

      <NodeHeader
        icon={<Code2 className="text-yellow-400" />}
        title={data.nodeTitle || "Custom Code"}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {isCollapsed ? (
        <CardContent className="p-3 text-xs text-muted-foreground">
          <pre className="font-mono bg-muted/50 p-2 rounded-md overflow-hidden max-h-24">
            <code>{codePreview || "Kod mavjud emas..."}</code>
          </pre>
        </CardContent>
      ) : (
        <CardContent className="p-4 pt-0 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor={`node-title-${id}`}>Node nomi</Label>
            <Input
              id={`node-title-${id}`}
              placeholder="Masalan, Foydalanuvchini tekshirish"
              value={data.nodeTitle || ""}
              onChange={handleTitleChange}
            />
          </div>

          <CodeEditorDialog
            initialCode={data.pythonCode || DEFAULT_CODE}
            initialTheme={data.editorTheme}
            onSave={handleSave}
            contextType={"message"}
          >
            {/* --- ASOSIY O'ZGARISH SHU YERDA --- */}
            {hasCode ? (
              // Agar kod mavjud bo'lsa, uning prevyusini ko'rsatamiz
              <div className="p-3 border border-dashed rounded-lg hover:bg-muted cursor-pointer transition-colors text-left">
                <p className="text-xs text-muted-foreground mb-2">
                  Kod prevyusi (tahrirlash uchun bosing):
                </p>
                <pre className="font-mono text-xs bg-black/20 p-2 rounded-md overflow-hidden max-h-24">
                  <code>{codePreview}</code>
                </pre>
              </div>
            ) : (
              // Agar kod mavjud bo'lmasa, tahrirlashga taklif qilamiz
              <div className="flex flex-col items-center justify-center text-center p-4 border border-dashed rounded-lg hover:bg-muted cursor-pointer transition-colors">
                <PenLine className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="font-semibold">
                  Python kodeni tahrirlash uchun bosing
                </p>
              </div>
            )}
            {/* --- O'ZGARISH TUGADI --- */}
          </CodeEditorDialog>
        </CardContent>
      )}
      <SourceHandler />
    </Card>
  );
};

export const CustomCodeNode = memo(CustomCodeNodeComponent);

```

### 📄 constructor/nodes/custom/CustomCodeNode/components/CodeEditorDialog.tsx

```tsx
import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { DialogTitle } from "@radix-ui/react-dialog";
import { CodeExecutionContext } from "../types";
import AiogramEditor from "@/editor";
import EditorSettings from "@/editor/settings";

interface CodeEditorDialogProps {
  initialCode: string;
  onSave: (newCode: string) => void;
  children: React.ReactNode;
  contextType: CodeExecutionContext;
}

export const CodeEditorDialog = ({
  initialCode,
  onSave,
  children,
  contextType,
}: CodeEditorDialogProps) => {
  const [code, setCode] = useState(initialCode);
  const [isOpen, setIsOpen] = useState(false);

  // Bu ref "Bekor qilish" tugmasi bosilganini aniqlash uchun kerak
  const isCancelledRef = useRef(false);

  useEffect(() => {
    // Dialog ochilganda boshlang'ich qiymatlarni o'rnatamiz
    if (isOpen) {
      setCode(initialCode);
      isCancelledRef.current = false; // Holatni tozalaymiz
    }
  }, [isOpen, initialCode]);

  const handleOpenChange = (open: boolean) => {
    if (!open && !isCancelledRef.current) {
      // Agar oyna yopilayotgan bo'lsa va "Bekor qilish" bosilmagan bo'lsa, saqlaymiz
      onSave(code);
    }
    setIsOpen(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[90%] w-full h-[90vh] flex flex-col">
        <VisuallyHidden>
          <DialogTitle>Edit code</DialogTitle>
        </VisuallyHidden>
        <div className="grid overflow-hidden flex-grow">
          <AiogramEditor
            contextType={contextType}
            initialCode={initialCode}
            onSave={onSave}
          />
        </div>
        <DialogFooter className="p-4 border-t bg-background/95 backdrop-blur-sm flex justify-between items-center">
          <EditorSettings />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

```

### 📄 constructor/nodes/custom/CustomCodeNode/index.ts

```ts
export * from "./CustomCodeNode";

```

### 📄 constructor/nodes/custom/CustomCodeNode/types.ts

```ts
// FAYL: constructor/nodes/custom/CustomCodeNode/types.ts (YANGILANGAN)

import { EditorThemeName } from "@/constructor/data/editor-themes";

export type CodeExecutionContext = "message" | "callback";

export interface CustomCodeNodeData {
  // --- YANGI MAYDONLAR ---
  /** Foydalanuvchi tomonidan berilgan maxsus nom */
  nodeTitle?: string;
  /** Tanlangan kod muharriri temasi */
  editorTheme?: EditorThemeName;

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
  MessageTriggerNode,
  ReplyButtonTriggerNode,
  CallbackQueryTriggerNode,
  CommandTriggerNode,
} from "./triggers";

import { CustomCodeNode } from "./custom";

export const CustomNodes = {
  ReplyButtonTriggerNode,
  MessageTriggerNode,
  CallbackQueryTriggerNode,
  SendTextMessageNode,
  SendPhotoNode,
  SendVideoNode,
  SendAudioNode,
  SendFileNode,
  CustomCodeNode,
  CommandTriggerNode,
};

```

### 📄 constructor/nodes/triggers/CallbackQueryTrigger/CallbackQueryTrigger.tsx

```tsx
// FAYL: constructor/nodes/triggers/CallbackQueryTrigger/CallbackQueryTrigger.tsx (YANGI, "AQLLI" VERSIYA)

import { memo, useMemo } from "react";
import { NodeProps, useNodes, useEdges } from "reactflow";
import { useFlowStore } from "@/constructor/store";
import { CallbackQueryTriggerData } from "./types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { FilterSelector } from "@/constructor/nodes/triggers/MessageTrigger/components/FilterSelector";
import { ValueInput } from "@/constructor/nodes/triggers/MessageTrigger/components/ParameterInput/ValueInput";
import { ConstructorData } from "@/constructor/data";
import { MousePointerClick } from "lucide-react";
import { cn } from "@/lib/utils";
import { SourceHandler, TargetHandler } from "../../components";
import { KeyboardConfig } from "../../actions/TextMessageNode/types";

// YORDAMCHI INTERFEYS: Ota-ona node'ning `data` obyekti qanday bo'lishini tasvirlaydi
interface NodeWithKeyboardData {
  keyboard?: KeyboardConfig;
}

const CallbackQueryTriggerNodeComponent = ({
  id,
  data,
  selected,
}: NodeProps<CallbackQueryTriggerData>) => {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const nodes = useNodes();
  const edges = useEdges();

  // --- 1. OTA-ONA NODE'DAN CALLBACK TUGMALARINI OLISH UCHUN "AQLLI" LOGIKA ---
  const availableCallbacks = useMemo(() => {
    const incomingEdge = edges.find((edge) => edge.target === id);
    if (!incomingEdge) return [];

    const parentNode = nodes.find((node) => node.id === incomingEdge.source);
    if (!parentNode) return [];

    const parentNodeData = parentNode.data as NodeWithKeyboardData;
    if (!parentNodeData.keyboard || !parentNodeData.keyboard.inline) {
      return [];
    }

    // Faqat "callback" turidagi, "value"si mavjud bo'lgan tugmalarni olamiz
    return parentNodeData.keyboard.inline
      .flat()
      .filter((button) => button.type === "callback" && button.value);
  }, [nodes, edges, id]);

  const isConnected = useMemo(
    () => edges.some((edge) => edge.target === id),
    [edges, id]
  );

  // --- 2. "AQLLI" REJIMNI YOQISH UCHUN SHART ---
  // Node ulangan, unda callback'lar bor va "teng" filtri tanlangan bo'lsa
  const showSmartSelector =
    isConnected && availableCallbacks.length > 0 && data.filter === "equals";

  const handleUpdate = (update: Partial<CallbackQueryTriggerData>) => {
    updateNodeData(id, update);
  };

  const onFilterChange = (newFilter: string) => {
    // Agar filtr o'zgarsa, tanlangan qiymatni tozalab qo'yamiz
    handleUpdate({ filter: newFilter, context: { value: "" } });
  };

  const onValueChange = (newValue: string) => {
    handleUpdate({ context: { value: newValue } });
  };

  const isConfigured =
    data.filter === "any" || (!!data.filter && !!data.context?.value);

  const filterOptions = useMemo(
    () =>
      ConstructorData.Filters.textFilters.filter((f) => f.value !== "command"),
    []
  );

  return (
    <Card className={cn("w-80 shadow-lg", selected && "ring-2 ring-primary")}>
      <TargetHandler />

      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <MousePointerClick className="h-5 w-5 text-primary" />
            <span>Advanced Callback Handler</span>
          </div>
          <div
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              isConfigured ? "bg-green-500" : "bg-destructive/50"
            }`}
            title={isConfigured ? "Sozlangan" : "Sozlanmagan"}
          />
        </CardTitle>
        <CardDescription className="text-xs pt-1">
          {isConnected
            ? "Oldingi qadamdan so'ng callback'larni tinglaydi."
            : "Yangi sxemani boshlovchi global handler."}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 pt-2">
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

        {/* --- 3. KONDISIONAL RENDER QISMI (SHARTGA QARAB INPUT YOKI SELECT KO'RSATISH) --- */}
        {data.filter && data.filter !== "any" && (
          <div className="space-y-1.5 animate-in fade-in-50">
            <Label className="text-xs text-muted-foreground">Parametr</Label>
            {showSmartSelector ? (
              <Select
                value={data.context?.value || ""}
                onValueChange={onValueChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Mavjud callback'lardan birini tanlang..." />
                </SelectTrigger>
                <SelectContent>
                  {availableCallbacks.map((button) => (
                    <SelectItem key={button.id} value={button.value!}>
                      <div className="flex items-center justify-between w-full">
                        <span>{button.text}</span>
                        <span className="text-xs text-muted-foreground font-mono ml-4">
                          {button.value}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              // STANDART REJIM: Oddiy matn kiritish maydoni (Input)
              <ValueInput
                value={data.context?.value || ""}
                onChange={onValueChange}
                placeholder={
                  data.filter === "regex"
                    ? "Masalan: item:.*"
                    : "Masalan: main_menu"
                }
              />
            )}
          </div>
        )}
      </CardContent>

      <SourceHandler />
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

### 📄 constructor/nodes/triggers/CommandTrigger/CommandTriggerNode.tsx

```tsx
// FAYL: constructor/nodes/triggers/CommandTrigger/CommandTriggerNode.tsx

import { memo } from "react";
import { NodeProps } from "reactflow";
import { useFlowStore } from "@/constructor/store";
import { CommandTriggerNodeData } from "./types";
import { cn } from "@/lib/utils";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Command } from "lucide-react";

import { SourceHandler, TargetHandler } from "../../components";

const CommandTriggerNodeComponent = ({
  id,
  data,
  selected,
}: NodeProps<CommandTriggerNodeData>) => {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);

  const handleUpdate = (update: Partial<CommandTriggerNodeData>) => {
    updateNodeData(id, update);
  };

  // Node sozlangaligini tekshirish (buyruq matni kiritilgan bo'lishi kerak)
  const isConfigured = !!data.command?.trim();

  return (
    <Card className={cn("w-80 shadow-lg", selected && "ring-2 ring-primary")}>
      <TargetHandler />

      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <Command className="h-5 w-5 text-blue-400" />
            <span>Command Handler</span>
          </div>
          <div
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              isConfigured ? "bg-green-500" : "bg-destructive/50"
            }`}
            title={isConfigured ? "Sozlangan" : "Sozlanmagan"}
          />
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {/* Buyruq kiritish maydoni */}
        <div>
          <Label
            htmlFor={`command-input-${id}`}
            className="text-xs text-muted-foreground"
          >
            Buyruq matni (masalan, "start")
          </Label>
          <div className="relative mt-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-gray-500 sm:text-sm">/</span>
            </div>
            <Input
              id={`command-input-${id}`}
              placeholder="start"
              value={data.command || ""}
              onChange={(e) => handleUpdate({ command: e.target.value.trim() })}
              className="pl-7" // "/" belgisi uchun joy
            />
          </div>
        </div>

        {/* Qo'shimcha argumentlarni ushlash uchun checkbox */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id={`with-args-${id}`}
            checked={!!data.withArgs}
            onCheckedChange={(checked) => handleUpdate({ withArgs: !!checked })}
          />
          <Label
            htmlFor={`with-args-${id}`}
            className="text-sm font-normal cursor-pointer"
          >
            Argumentlarni ushlash (deep linking)
          </Label>
        </div>
      </CardContent>

      <SourceHandler />
    </Card>
  );
};

export const CommandTriggerNode = memo(CommandTriggerNodeComponent);

```

### 📄 constructor/nodes/triggers/CommandTrigger/index.ts

```ts
export * from "./CommandTriggerNode";

```

### 📄 constructor/nodes/triggers/CommandTrigger/types.ts

```ts
// FAYL: constructor/nodes/triggers/CommandTrigger/types.ts

export interface CommandTriggerNodeData {
  /** Foydalanuvchi kiritgan buyruq (masalan, "start", "help"). "/" belgisisiz saqlanadi. */
  command?: string;
  /** Buyruq bilan birga keladigan qo'shimcha ma'lumotlarni (deep linking) ushlash uchun ixtiyoriy maydon */
  withArgs?: boolean;
}

```

### 📄 constructor/nodes/triggers/MessageTrigger/MessageTrigger.tsx

```tsx
import { memo, useMemo, useState } from "react";
import { NodeProps } from "reactflow";
import { useFlowStore } from "@/constructor/store";
import { MessageTriggerNodeData } from "./types";
import { getFiltersForType } from "./utils";

import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

import { TriggerHeader } from "./components/TriggerHeader";
import { TypeSelector } from "./components/TypeSelector";
import { FilterSelector } from "./components/FilterSelector";
import { ParameterInput } from "./components/ParameterInput";
import { SourceHandler, TargetHandler } from "../../components";

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
      className={`w-80 rounded-lg shadow-xl bg-[#212529] border-2 ${
        selected ? "border-sky-500/80" : "border-gray-600/50"
      }`}

      // className={`w-100 rounded-lg shadow-md bg-gray-800 border-gray-700 ${
      //   selected ? "ring-2 ring-blue-500/80" : ""
      // }`}
    >
      <TargetHandler />

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

      <SourceHandler />
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
"use client";

import { memo, useMemo } from "react";
import { NodeProps, useNodes, useEdges } from "reactflow";
import { useFlowStore } from "@/constructor/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ReplyButtonTriggerData } from "./types";
import { AlertCircle, CornerDownLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { SourceHandler, TargetHandler } from "../../components";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { KeyboardConfig } from "../../actions/TextMessageNode/types";

// YORDAMCHI INTERFEYS: Ota-ona node'ning `data` obyekti qanday bo'lishini tasvirlaydi
// --- O'ZGARTIRISH: `keyboard` ixtiyoriy qilindi, xatolikdan saqlanish uchun ---
interface NodeWithButtonsData {
  keyboard?: KeyboardConfig;
}

const ReplyButtonTriggerNodeComponent = ({
  id,
  data,
  selected,
}: NodeProps<ReplyButtonTriggerData>) => {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const nodes = useNodes();
  const edges = useEdges();

  // --- O'ZGARTIRISH: Mantiq to'liq yangilandi va soddalashtirildi ---
  const availableReplyButtons = useMemo(() => {
    const incomingEdge = edges.find((edge) => edge.target === id);
    if (!incomingEdge) return [];

    const parentNode = nodes.find((node) => node.id === incomingEdge.source);
    if (!parentNode) return [];

    const parentNodeData = parentNode.data as NodeWithButtonsData;
    // Ota-ona node'da `keyboard` yoki `keyboard.reply` bo'lmasa, bo'sh massiv qaytaramiz
    if (!parentNodeData.keyboard || !parentNodeData.keyboard.reply) {
      return [];
    }

    // 1. Ota-onaning `reply` tugmalarini olamiz (bu 2D massiv)
    const replyButtonRows = parentNodeData.keyboard.reply;

    // 2. Massivni bir o'lchamli qilamiz (`.flat()`)
    // 3. Faqat "Reply Keyboard" uchun mo'ljallangan tugmalarni filterlaymiz
    const allReplyButtons = replyButtonRows
      .flat()
      .filter(
        (button) =>
          button.type === "reply" ||
          button.type === "request_contact" ||
          button.type === "request_location"
      );

    return allReplyButtons;
  }, [nodes, edges, id]);

  const handleSelectionChange = (selectedButtonId: string) => {
    // Tanlangan ID bo'yicha to'liq tugma obyektini topamiz
    const selectedButtonObject = availableReplyButtons.find(
      (btn) => btn.id === selectedButtonId
    );

    // Va shu obyektni state'ga yozamiz
    updateNodeData(id, { selectedButton: selectedButtonObject });
  };

  const isConfigured = !!data.selectedButton;

  return (
    <Card className={cn("w-80 shadow-lg", selected && "ring-2 ring-primary")}>
      <TargetHandler />

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
          <div className="space-y-3">
            <Label className="text-xs text-muted-foreground">
              Qaysi tugma ushlansin?
            </Label>

            <RadioGroup
              value={data.selectedButton?.id} // Tanlangan tugmaning ID'sini `value` sifatida beramiz
              onValueChange={handleSelectionChange} // O'zgarish bo'lganda handler'ni chaqiramiz
            >
              {availableReplyButtons.map((button) => (
                <div className="flex items-center gap-3" key={button.id}>
                  <RadioGroupItem
                    className="cursor-pointer"
                    value={button.id}
                    id={`r-${button.id}`}
                  />
                  <Label
                    htmlFor={`r-${button.id}`}
                    className="font-normal cursor-pointer"
                  >
                    {button.text}
                  </Label>
                </div>
              ))}
            </RadioGroup>
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
      <SourceHandler />
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
import { ButtonConfig } from "@/constructor/components";

export interface ReplyButtonTriggerData {
  // `selectedButtons` (ko'plik) o'rniga `selectedButton` (birlik)
  selectedButton?: ButtonConfig;
}

```

### 📄 constructor/nodes/triggers/index.ts

```ts
export { MessageTriggerNode } from "./MessageTrigger";
export { ReplyButtonTriggerNode } from "./ReplyButtonTrigger";
export { CallbackQueryTriggerNode } from "./CallbackQueryTrigger";
export { CommandTriggerNode } from "./CommandTrigger";

```

### 📄 constructor/store/actions.ts

```ts
import { StateCreator } from "zustand";
import { toast } from "sonner";
import { Node } from "reactflow";
import { FlowStoreState, Actions } from "./types";

// Node yaratilganda unga to'g'ri default ma'lumot beruvchi funksiya
const getDefaultNodeData = (nodeType: string) => {
  const baseMessageData = {
    recipients: { sendToSender: true, additionalIds: [] },
    keyboard: {
      active: "inline",
      inline: [],
      reply: [],
    },
  };

  switch (nodeType) {
    case "SendTextMessageNode":
      return {
        ...baseMessageData,
        messageText: "Yangi xabar",
        parseMode: "None",
      };
    case "SendPhotoNode":
      return { ...baseMessageData, photoSourceType: "url", caption: "" };
    case "SendVideoNode":
      return { ...baseMessageData, videoSourceType: "url", caption: "" };
    case "SendAudioNode":
      return { ...baseMessageData, audioSourceType: "url", caption: "" };
    case "SendFileNode":
      return { ...baseMessageData, fileSourceType: "url", caption: "" };
    case "CustomCodeNode":
      return {}; // Custom code uchun alohida sozlamalar
    default:
      return {};
  }
};

let nodeIdCounter = 0;
const generateNodeId = () => `node_${Date.now()}_${nodeIdCounter++}`;

export const createActions: StateCreator<FlowStoreState, [], [], Actions> = (
  set,
  get
) => ({
  addNode: (element, position) => {
    const newNode: Node = {
      id: generateNodeId(),
      type: element.triggerId,
      position,
      data: getDefaultNodeData(element.triggerId || ""),
    };
    set({ nodes: [...get().nodes, newNode], isDirty: true });
  },

  saveFlow: async () => {
    const { nodes, edges } = get();
    set({ isLoading: true });
    toast.loading("Saqlanmoqda...");

    try {
      const flowData = { nodes, edges };
      const response = await fetch("flow/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(flowData),
      });

      if (!response.ok) {
        throw new Error("Serverda saqlashda xatolik.");
      }

      toast.dismiss();
      toast.success("Sxema muvaffaqiyatli saqlandi!");
      set({
        isDirty: false, // O'zgarishlar saqlandi
        initialState: { nodes, edges }, // Boshlang'ich holatni yangilaymiz
      });
    } catch (error) {
      console.error("Saqlashda xatolik:", error);
      // Xatolikni yuqoriga uzatamiz, toast.promise uni ushlab oladi
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  loadFlow: async (flow) => {
    set({ isLoading: true });

    set({
      nodes: flow["nodes"],
      edges: flow["edges"],
      isDirty: false, // Yangi yuklandi, demak o'zgarishlar yo'q
      initialState: {
        nodes: flow["nodes"],
        edges: flow["edges"],
      },
    });
  },
});

```

### 📄 constructor/store/clipboardSlice.ts

```ts
import { StateCreator } from "zustand";
import { FlowStoreState, ClipboardSlice } from "./types";

let idOffset = 0;
const getId = () => `dndnode_${Date.now()}_${idOffset++}`;

export const createClipboardSlice: StateCreator<
  FlowStoreState,
  [],
  [],
  ClipboardSlice
> = (set, get) => ({
  clipboard: null,
  copySelection: () => {
    const { nodes, edges } = get();
    const selectedNodes = nodes.filter((n) => n.selected);
    if (selectedNodes.length === 0) {
      set({ clipboard: null });
      return;
    }

    const selectedNodeIds = selectedNodes.map((n) => n.id);
    const selectedEdges = edges.filter(
      (e) =>
        selectedNodeIds.includes(e.source) && selectedNodeIds.includes(e.target)
    );

    set({ clipboard: { nodes: selectedNodes, edges: selectedEdges } });
  },
  paste: (position) => {
    const clipboard = get().clipboard;
    if (!clipboard || clipboard.nodes.length === 0) return;

    const { nodes, edges } = get();
    const oldToNewIdMap = new Map<string, string>();

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
        data: { ...node.data },
      };
    });

    const newEdges = clipboard.edges.map((edge) => ({
      ...edge,
      id: `edge-${oldToNewIdMap.get(edge.source)!}-${oldToNewIdMap.get(
        edge.target
      )!}`,
      source: oldToNewIdMap.get(edge.source)!,
      target: oldToNewIdMap.get(edge.target)!,
    }));

    set({
      nodes: [...nodes.map((n) => ({ ...n, selected: false })), ...newNodes],
      edges: [...edges, ...newEdges],
      isDirty: true,
    });
  },
  duplicateSelection: () => {
    const { nodes, edges } = get();
    const selectedNodes = nodes.filter((n) => n.selected);
    if (selectedNodes.length === 0) return;

    const oldToNewIdMap = new Map<string, string>();

    const newNodes = selectedNodes.map((node) => {
      const newNodeId = getId();
      oldToNewIdMap.set(node.id, newNodeId);
      return {
        ...node,
        id: newNodeId,
        selected: true,
        position: { x: node.position.x + 30, y: node.position.y + 30 },
        data: { ...node.data },
      };
    });

    const selectedNodeIds = selectedNodes.map((n) => n.id);
    const relevantEdges = edges.filter(
      (e) =>
        selectedNodeIds.includes(e.source) && selectedNodeIds.includes(e.target)
    );

    const newEdges = relevantEdges.map((edge) => ({
      ...edge,
      id: `edge-${oldToNewIdMap.get(edge.source)!}-${oldToNewIdMap.get(
        edge.target
      )!}`,
      source: oldToNewIdMap.get(edge.source)!,
      target: oldToNewIdMap.get(edge.target)!,
    }));

    set({
      nodes: [...nodes.map((n) => ({ ...n, selected: false })), ...newNodes],
      edges: [...get().edges, ...newEdges],
      isDirty: true,
    });
  },
});

```

### 📄 constructor/store/flowSlice.ts

```ts
// constructor/store/flowSlice.ts

import { StateCreator } from "zustand";
import {
  applyEdgeChanges,
  applyNodeChanges,
  addEdge,
  NodeChange,
} from "reactflow";
import { FlowStoreState, FlowSlice } from "./types";

export const createFlowSlice: StateCreator<
  FlowStoreState,
  [],
  [],
  FlowSlice
> = (set, get) => ({
  nodes: [],
  edges: [],

  // --- Yaxshilangan onNodesChange ---
  onNodesChange: (changes: NodeChange[]) => {
    const { isCtrlPressed } = get(); // Asosiy store'dan holatni olamiz
    const gridSize = 10; // 10px'lik to'r

    // Har bir o'zgarishni tekshirib chiqamiz
    const updatedChanges = changes.map((change) => {
      // Agar Ctrl bosilgan, node siljiyotgan va bu pozitsiya o'zgarishi bo'lsa
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
      // Yangilangan o'zgarishlarni qo'llaymiz
      nodes: applyNodeChanges(updatedChanges, get().nodes),
      isDirty: true,
    });
  },
  // --- onNodesChange tugadi ---

  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
      isDirty: true,
    });
  },

  onConnect: (connection) => {
    // Bu funksiya endi index.ts da override qilinadi,
    // lekin slice ichida standart versiyasi bo'lgani yaxshi.
    set({
      edges: addEdge(connection, get().edges),
      isDirty: true,
    });
  },

  updateNodeData: (nodeId, newData) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId) {
          return { ...node, data: { ...node.data, ...newData } };
        }
        return node;
      }),
      isDirty: true,
    });
  },

  deleteSelectedElements: () => {
    const { nodes, edges } = get();
    const selectedNodes = nodes.filter((node) => node.selected);
    const selectedEdges = edges.filter((edge) => edge.selected);

    // Agar hech narsa tanlanmagan bo'lsa, hech narsa qilmaymiz
    if (selectedNodes.length === 0 && selectedEdges.length === 0) {
      return;
    }

    const selectedNodeIds = selectedNodes.map((node) => node.id);

    // O'chirilmaydigan nodelarni qoldiramiz
    const nextNodes = nodes.filter((node) => !node.selected);

    // O'chirilmaydigan chiziqlarni qoldiramiz:
    // 1. O'zi tanlanmagan BO'LISHI KERAK
    // 2. Tanlangan node'larga ulanmagan BO'LISHI KERAK
    const nextEdges = edges.filter(
      (edge) =>
        !edge.selected &&
        !selectedNodeIds.includes(edge.source) &&
        !selectedNodeIds.includes(edge.target)
    );

    set({
      nodes: nextNodes,
      edges: nextEdges,
      isDirty: true,
    });
  },

  selectAll: () => {
    set({
      nodes: get().nodes.map((n) => ({ ...n, selected: true })),
      edges: get().edges.map((e) => ({ ...e, selected: true })),
    });
  },
});

```

### 📄 constructor/store/index.ts

```ts
// constructor/store/index.ts

import { create } from "zustand";
import { FlowStoreState } from "./types";
import { createFlowSlice } from "./flowSlice";
import { createClipboardSlice } from "./clipboardSlice";
import { createActions } from "./actions";
import { Connection, addEdge } from "reactflow";

// Keling, shu usulga o'tamiz.
export const useFlowStore = create<FlowStoreState>()((set, get) => {
  return {
    initialState: null, // Boshlang'ich qiymat null

    // UI holatlari uchun boshlang'ich qiymatlar
    isDirty: false,
    isLoading: false,

    isCtrlPressed: false, // Boshlang'ich holat
    setCtrlPressed: (isPressed) => set({ isCtrlPressed: isPressed }),

    // Barcha slice'larni birlashtiramiz
    // Har bir slice'ga (set, get) ni uzatamiz
    ...createFlowSlice(set, get, {} as any),
    ...createClipboardSlice(set, get, {} as any),
    ...createActions(set, get, {} as any),

    onConnect: (connection: Connection) => {
      const newEdge = {
        ...connection,
        type: "smart-edge", // Bizning maxsus chizig'imiz
        // Rasmga mos stil
        style: {
          strokeWidth: 1.5,
          stroke: "#495057", // To'q kulrang
        },
        animated: false,
      };

      set({
        edges: addEdge(newEdge, get().edges),
        isDirty: true,
      });
    },
  };
});

```

### 📄 constructor/store/types.ts

```ts
import { Edge, Node, OnConnect, OnEdgesChange, OnNodesChange } from "reactflow";
import { ElementItemType } from "@/types/element-types";
import { FlowData } from "@/types/http/flow";

// React Flow asosiy holati uchun slice tipi
export interface FlowSlice {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  updateNodeData: (nodeId: string, newData: any) => void;
  deleteSelectedElements: () => void;
  selectAll: () => void;
}

// Clipboard (nusxa olish) uchun slice tipi
export interface ClipboardSlice {
  clipboard: { nodes: Node[]; edges: Edge[] } | null;
  copySelection: () => void;
  paste: (position: { x: number; y: number }) => void;
  duplicateSelection: () => void;
}

// Umumiy, yuqori darajadagi amallar
export interface Actions {
  addNode: (
    element: ElementItemType,
    position: { x: number; y: number }
  ) => void;
  saveFlow: () => Promise<void>;
  loadFlow: (flow: FlowData["flow"]) => Promise<void>;
}

// Barcha qismlarni birlashtirgan yakuniy store tipi
export interface FlowStoreState extends FlowSlice, ClipboardSlice, Actions {
  // UI holatlari
  initialState: { nodes: Node[]; edges: Edge[] } | null;
  isDirty: boolean;
  isLoading: boolean;
  isCtrlPressed: boolean;
  setCtrlPressed: (isPressed: boolean) => void;
}

```

