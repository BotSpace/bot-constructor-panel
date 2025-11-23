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
import { PlusCircle, Database } from "lucide-react";
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
    const buttonText = field.name;

    // Collection ma'lumotlarini object ko'rinishida saqlash
    const collectionData = {
      collection: selectedCollection,
      field: field.name,
      ...(filters.length > 0 && { filters }),
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
          <Separator className="my-4" />
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Collection'dan tugma yaratish
            </Label>
            <div>
              <Label htmlFor="collection-select">Collection</Label>
              <Select
                value={selectedCollection}
                onValueChange={handleCollectionChange}
              >
                <SelectTrigger id="collection-select">
                  <SelectValue placeholder="Collection tanlang..." />
                </SelectTrigger>
                <SelectContent>
                  {collections.map((collection) => (
                    <SelectItem key={collection.id} value={collection.name}>
                      {collection.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedCollection && collectionFields && (
              <>
                <div>
                  <Label htmlFor="field-select">Field</Label>
                  <Select
                    value={selectedField}
                    onValueChange={setSelectedField}
                  >
                    <SelectTrigger id="field-select">
                      <SelectValue placeholder="Field tanlang..." />
                    </SelectTrigger>
                    <SelectContent>
                      {collectionFields.data.fields.map((field) => (
                        <SelectItem key={field.id} value={field.id.toString()}>
                          {field.name} ({field.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Filter Builder */}
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="filters">
                    <AccordionTrigger className="text-sm">
                      Filter qo'shish (ixtiyoriy)
                    </AccordionTrigger>
                    <AccordionContent>
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
              </>
            )}
            <Button
              type="button"
              className="w-full"
              onClick={handleAddCollectionButton}
              disabled={disabled || !selectedCollection || !selectedField}
              variant="outline"
            >
              <Database className="mr-2 h-4 w-4" /> Collection Tugmasi Qo'shish
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
