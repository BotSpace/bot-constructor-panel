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
import { PlusCircle, Database, LayoutGrid, List } from "lucide-react";
import { ButtonConfig, ButtonType, LoginUrlConfig } from "../types";
import { WebAppForm } from "./WebAppForm";
import { LoginUrlForm } from "./LoginUrlForm";
import { SendTextMessageNodeData } from "@/features/bot-constructor/nodes/actions/TextMessageNode/types";
import { useCollectionStore } from "@/features/collections/store/collection-list";
import { useReactQueryAction } from "@/services/react-query";
import { APIDetailCreateResponse } from "@/types/http/response";
import { CollectionDetail } from "@/types/http/collection";
import { Separator } from "@/components/ui/separator";
import { FilterBuilder } from "@/features/bot-constructor/nodes/actions/TextMessageNode/components/filter/filter";
import { Filter } from "@/features/bot-constructor/nodes/actions/TextMessageNode/components/filter/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useNodes } from "reactflow";
import { StateNodeData } from "@/features/bot-constructor/nodes/custom/StateNode/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CollectionLayoutPreview } from "./CollectionLayoutPreview";

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

export const InlineForm = ({ onAdd, disabled, data }: InlineFormProps) => {
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
  const [columns, setColumns] = useState<number>(2);  // Har qatorda 2 ta
  const [rows, setRows] = useState<number>(5);        // 5 qator

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
    // Reset layout to default
    setColumns(2);
    setRows(5);
  };

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

    // Field nomini button text sifatida ishlatish
    const buttonText = `📦 ${field.name}`;

    // Collection ma'lumotlarini object ko'rinishida saqlash
    const collectionData = {
      collection: selectedCollection,
      field: field.name,
      ...(filters.length > 0 && { filters }),
      layout: {
        columns,  // Har qatorda nechta tugma
        rows,     // Har sahifada nechta qator
        // Jami: columns × rows = bir sahifada tugmalar soni
      },
    };

    // Callback data - backward compatibility uchun
    const callbackData = `collection_${selectedCollection}_field_${field.name}`;

    onAdd({
      id: `btn-${Date.now()}`,
      text: buttonText,
      type: "callback",
      value: callbackData,
      collectionData,
    });

    // Tozalash
    setSelectedCollection("");
    setSelectedField("");
    setFilters([]);
    setColumns(2);
    setRows(5);
  };

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
              <Label htmlFor="collection-select" className="text-sm font-medium">
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
                <div>
                  <Label htmlFor="field-select" className="text-sm font-medium">
                    Field
                  </Label>
                  <Select
                    value={selectedField}
                    onValueChange={setSelectedField}
                  >
                    <SelectTrigger id="field-select" className="mt-1.5">
                      <SelectValue placeholder="Field tanlang..." />
                    </SelectTrigger>
                    <SelectContent>
                      {collectionFields.data.fields.map((field) => (
                        <SelectItem key={field.id} value={field.id.toString()}>
                          <div className="flex items-center justify-between w-full gap-2">
                            <span>{field.name}</span>
                            <span className="text-xs text-muted-foreground">({field.type})</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Filter Builder */}
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="filters" className="border rounded-lg px-4 bg-muted/30">
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
                        fields={collectionFields.data.fields.map((field) => ({
                          id: field.name, // Field nomini id sifatida ishlatish
                          label: field.name,
                          type: field.type as
                            | "text"
                            | "number"
                            | "bool"
                            | "datetime",
                        }))}
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
                          onChange={(e) => setRows(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
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
                        <span className="text-muted-foreground">Bir sahifada:</span>
                        <span className="font-bold text-primary">
                          {columns} × {rows} = {columns * rows} ta tugma
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Qolgan tugmalar keyingi sahifalarda ko'rsatiladi (pagination)
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
            <Button
              type="button"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
              onClick={handleAddCollectionButton}
              disabled={disabled || !selectedCollection || !selectedField}
            >
              <Database className="mr-2 h-4 w-4" /> Collection Tugmasi Qo'shish
            </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
