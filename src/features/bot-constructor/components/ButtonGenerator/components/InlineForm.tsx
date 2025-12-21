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

  // Collection-based button yaratish
  const handleAddCollectionButton = () => {
    if (!selectedCollection || !selectedField) {
      alert("Iltimos, collection va field tanlang.");
      return;
    }

    const field = collectionFields?.data.fields.find(
      (f) => f.id.toString() === selectedField
    );

    if (!field) return;

    const buttonText = `📦 ${field.name}`;

    const collectionData = {
      collection: selectedCollection,
      field: field.name,
      ...(filters.length > 0 && { filters }),
      layout: {
        columns,
        rows,
      },
      enablePagination,
    };

    const callbackData = `collection_${selectedCollection}_field_${field.name}`;

    onAdd({
      id: `btn-${Date.now()}`,
      text: buttonText,
      type: "callback",
      value: callbackData,
      collectionData,
    });

    setSelectedCollection("");
    setSelectedField("");
    setFilters([]);
    setColumns(2);
    setRows(5);
    setEnablePagination(true);
  };

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
    <form onSubmit={handleAddClick} className="mt-4 space-y-4">
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
          <LoginUrlForm config={loginConfig} onConfigChange={setLoginConfig} />
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

      {/* Collection-based button yaratish */}
      {collections && collections.length > 0 && (
        <>
          <Separator className="my-6" />

          <Card className="border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <Database className="h-5 w-5 text-primary" />
                </div>
                Collection'dan tugma yaratish
              </CardTitle>
              <CardDescription className="text-xs">
                Collection ma'lumotlaridan avtomatik tugmalar yaratish
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label
                  htmlFor="collection-select"
                  className="text-sm font-medium"
                >
                  Collection
                </Label>
                <Select
                  value={selectedCollection}
                  onValueChange={handleCollectionChange}
                >
                  <SelectTrigger id="collection-select" className="mt-1.5">
                    <SelectValue placeholder="Collection tanlang..." />
                  </SelectTrigger>
                  <SelectContent>
                    {collections.map((collection) => (
                      <SelectItem key={collection.id} value={collection.name}>
                        <div className="flex items-center gap-2">
                          <Database className="h-3.5 w-3.5" />
                          {collection.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedCollection && collectionFields && (
                <>
                  <div className="">
                    <div className="flex gap-1.5 flex-wrap">
                      {collectionFields.data.fields.map((field) => (
                        <Badge variant={"outline"} key={field.id}>
                          {field.name}
                        </Badge>
                      ))}
                    </div>
                    <Input />
                  </div>

                  {/* Filter Builder */}
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem
                      value="filters"
                      className="border rounded-lg px-4 bg-muted/30"
                    >
                      <AccordionTrigger className="text-sm font-medium hover:no-underline">
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
                            Ixtiyoriy
                          </span>
                          Filter qo'shish
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-4">
                        <FilterBuilder
                          fields={[
                            {
                              id: "_id",
                              label: "id",
                              type: "text" as const,
                            },
                            ...collectionFields.data.fields.map((field) => ({
                              id: field.name,
                              label: field.name,
                              type: field.type as any,
                            })),
                          ]}
                          filters={filters}
                          onChange={setFilters}
                          stateKeys={availableStateKeys}
                        />
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  {/* Layout Settings */}
                  <Card className="border-dashed">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <LayoutGrid className="h-4 w-4" />
                        Pagination Sozlamalari
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Har bir sahifada nechta tugma chiqishini belgilang
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Columns */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="columns" className="text-sm">
                            Har bir qatorda
                          </Label>
                          <span className="text-sm font-medium text-primary">
                            {columns} ta tugma
                          </span>
                        </div>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4].map((num) => (
                            <Button
                              key={num}
                              type="button"
                              variant={columns === num ? "default" : "outline"}
                              size="sm"
                              className="flex-1"
                              onClick={() => setColumns(num)}
                            >
                              {num}
                            </Button>
                          ))}
                        </div>
                      </div>

                      {/* Rows */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="rows" className="text-sm">
                            Har bir sahifada
                          </Label>
                          <span className="text-sm font-medium text-primary">
                            {rows} ta qator
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            id="rows"
                            type="number"
                            min={1}
                            max={10}
                            value={rows}
                            onChange={(e) =>
                              setRows(
                                Math.min(
                                  10,
                                  Math.max(1, parseInt(e.target.value) || 1)
                                )
                              )
                            }
                            className="flex-1"
                          />
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            qator
                          </span>
                        </div>
                      </div>

                      {/* Calculation */}
                      <div className="p-3 bg-primary/10 border border-primary/30 rounded-md">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            Bir sahifada:
                          </span>
                          <span className="font-bold text-primary">
                            {columns} × {rows} = {columns * rows} ta tugma
                          </span>
                        </div>
                      </div>

                      {/* Enable Pagination Toggle */}
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md border">
                        <div className="space-y-0.5">
                          <Label
                            htmlFor="enable-pagination"
                            className="text-sm font-medium cursor-pointer"
                          >
                            Pagination yoqish
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Ko'p ma'lumotlar bo'lsa sahifalarga bo'lish
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            id="enable-pagination"
                            type="checkbox"
                            checked={enablePagination}
                            onChange={(e) =>
                              setEnablePagination(e.target.checked)
                            }
                            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary cursor-pointer"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Button
                    type="button"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
                    onClick={handleAddCollectionButton}
                    disabled={disabled || !selectedCollection || !selectedField}
                  >
                    <Database className="mr-2 h-4 w-4" /> Collection Tugmasi
                    Qo'shish
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </form>
  );
};
