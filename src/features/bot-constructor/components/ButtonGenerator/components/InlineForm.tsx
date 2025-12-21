// FAYL: constructor/components/ButtonGenerator/components/InlineForm.tsx (YANGILANGAN)
import { useState, useMemo } from "react";
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
import { PlusCircle, Database, LayoutGrid } from "lucide-react";
import { ButtonConfig, LoginUrlConfig } from "../types";
import { WebAppForm } from "./WebAppForm";
import { LoginUrlForm } from "./LoginUrlForm";
import { SendTextMessageNodeData } from "@/features/bot-constructor/nodes/actions/TextMessageNode/types";
import { useCollectionStore } from "@/features/collections/store/collection-list";
import { useReactQueryAction } from "@/services/react-query";
import { APIDetailCreateResponse } from "@/types/http/response";
import { CollectionDetail } from "@/types/http/collection";
import { Separator } from "@/components/ui/separator";
import { FilterBuilder } from "@/features/bot-constructor/nodes/actions/shared/filter/filter";
import { Filter } from "@/features/bot-constructor/nodes/actions/shared/filter/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useNodes } from "reactflow";
import { StateNodeData } from "@/features/bot-constructor/nodes/custom/StateNode/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import SeparatorWithTitle from "@/components/common/separetor";
import { Badge } from "@/components/ui/badge";
import { CollectionButtonForm } from "./CollectionButtonForm";

interface InlineFormProps {
  onAdd: (button: ButtonConfig) => void;
  disabled: boolean;
  data?: SendTextMessageNodeData;
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

// Common buttons configuration (Best Practice: Configuration over Code)
const commonButtonGroups = [
  {
    title: "Navigatsiya",
    buttons: [
      { label: "⬅️ Ortga", value: "back", variant: "outline" as const },
      { label: "Oldinga ➡️", value: "next", variant: "outline" as const },
      {
        label: "⏭ O'tkazib yuborish",
        value: "skip",
        variant: "outline" as const,
      },
    ],
  },
  {
    title: "Tasdiqlash",
    buttons: [
      { label: "✅ Tasdiqlash", value: "confirm", variant: "default" as const },
      {
        label: "❌ Bekor qilish",
        value: "cancel",
        variant: "destructive" as const,
      },
    ],
  },
  {
    title: "Menyu",
    buttons: [
      {
        label: "🏠 Bosh menyu",
        value: "main_menu",
        variant: "secondary" as const,
      },
      { label: "📋 Menyu", value: "menu", variant: "secondary" as const },
    ],
  },
];

export const InlineForm = ({ onAdd, disabled }: InlineFormProps) => {
  const [text, setText] = useState("");
  const [actionType, setActionType] = useState<InlineType>("callback");
  const [value, setValue] = useState("");
  const [loginConfig, setLoginConfig] = useState<Partial<LoginUrlConfig>>({});
  const [webAppUrl, setWebAppUrl] = useState("");

  // Collection ma'lumotlari
  const { data: collections } = useCollectionStore();
  const [selectedCollection, setSelectedCollection] = useState<string>("");
  const [selectedField, setSelectedField] = useState<string>("");
  const [filters, setFilters] = useState<Filter[]>([]);

  // Layout settings - pagination uchun
  const [columns, setColumns] = useState<number>(2);
  const [rows, setRows] = useState<number>(5);
  const [enablePagination, setEnablePagination] = useState<boolean>(true);

  // Collection field'larini olish
  const { data: collectionFields } = useReactQueryAction<
    APIDetailCreateResponse<CollectionDetail>
  >({
    url: selectedCollection
      ? `collection/${selectedCollection}/?project=[id]`
      : "",
    enabled: !!selectedCollection,
  });

  // State keys'larni olish
  const nodes = useNodes();
  const availableStateKeys = useMemo(() => {
    const stateKeys = new Set<string>();
    nodes.forEach((node) => {
      if (node.type === "StateNode") {
        const nodeData = node.data as StateNodeData;
        if (nodeData.key && nodeData.key.trim() !== "") {
          stateKeys.add(nodeData.key);
        }
      }
    });
    return Array.from(stateKeys).sort();
  }, [nodes]);

  // Collection o'zgarganda filter'larni tozalash
  const handleCollectionChange = (collectionName: string) => {
    setSelectedCollection(collectionName);
    setSelectedField("");
    setFilters([]);
    setColumns(2);
    setRows(5);
    setEnablePagination(true);
  };

  const handleAddClick = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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
      default:
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

  // Common buttonlarni qo'shish funksiyasi
  const handleAddCommonButton = (btnLabel: string, btnValue: string) => {
    const newButton: ButtonConfig = {
      id: `btn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Unikal ID
      text: btnLabel,
      type: "callback",
      value: btnValue,
    };

    onAdd(newButton);
  };

  return (
    <>
      <form onSubmit={handleAddClick} className="my-4 space-y-4">
        <div className="grid grid-cols-6 gap-2">
          <div className="col-span-4 flex flex-col gap-1.5">
            <Label htmlFor="inline-text">Tugma matni</Label>
            <Input
              id="inline-text"
              placeholder="Masalan, Bizning sayt"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>
          <div className="col-span-2 flex flex-col gap-1.5">
            <Label>Amal turi</Label>
            <Select
              value={actionType}
              onValueChange={(v: InlineType) => setActionType(v)}
            >
              <SelectTrigger className="w-full">
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
        </div>

        <div className="animate-in fade-in-50">
          {actionType === "login_url" && (
            <LoginUrlForm
              config={loginConfig}
              onConfigChange={setLoginConfig}
            />
          )}
          {actionType === "web_app" && (
            <WebAppForm url={webAppUrl} onUrlChange={setWebAppUrl} />
          )}
          {(actionType === "url" ||
            actionType === "callback" ||
            actionType.startsWith("switch_")) && (
            <div className="flex flex-col gap-1.5">
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

        <Button type="submit" className="w-full" disabled={disabled}>
          <PlusCircle className="mr-2 h-4 w-4" /> Inline Tugma Qo'shish
        </Button>

        <SeparatorWithTitle>Tezkor Tugmalar (Common)</SeparatorWithTitle>

        {/* Common buttons section */}
        <div className="space-y-3">
          {commonButtonGroups.map((group, index) => (
            <div key={index} className="space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {group.title}
              </h4>
              <div className="flex flex-wrap gap-2">
                {group.buttons.map((btn, btnIndex) => (
                  <Button
                    key={btnIndex}
                    type="button"
                    onClick={() => handleAddCommonButton(btn.label, btn.value)}
                    variant={btn.variant}
                    size="sm"
                    disabled={disabled}
                    className="shadow-sm"
                  >
                    {btn.label}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </form>

      <CollectionButtonForm
        onAdd={onAdd}
        buttonType="inline"
        disabled={disabled}
      />
    </>
  );
};
