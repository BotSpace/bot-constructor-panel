// FAYL: constructor/components/ButtonGenerator/components/ReplyForm.tsx (YANGILANGAN)
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
import {
  PlusCircle,
  Smartphone,
  MapPin,
  Globe,
  BarChart3,
  Database,
  LayoutGrid,
  List,
} from "lucide-react";
import { ButtonConfig } from "../types";
import { WebAppForm } from "./WebAppForm";
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

interface ReplyFormProps {
  onAdd: (button: ButtonConfig) => void;
  disabled: boolean;
  data?: SendTextMessageNodeData;
}

export const ReplyForm = ({ onAdd, disabled, data }: ReplyFormProps) => {
  const [text, setText] = useState("");
  const [pollType, setPollType] = useState<"quiz" | "regular">("regular");
  const [webAppUrl, setWebAppUrl] = useState("");
  const [webAppText, setWebAppText] = useState("");

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

    onAdd({
      id: `btn-${Date.now()}`,
      text: buttonText,
      type: "reply",
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
              <Label htmlFor="reply-collection-select" className="text-sm font-medium">
                Collection
              </Label>
              <Select
                value={selectedCollection}
                onValueChange={handleCollectionChange}
              >
                <SelectTrigger id="reply-collection-select" className="mt-1.5">
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
                  <Label htmlFor="reply-field-select" className="text-sm font-medium">
                    Field
                  </Label>
                  <Select
                    value={selectedField}
                    onValueChange={setSelectedField}
                  >
                    <SelectTrigger id="reply-field-select" className="mt-1.5">
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
                        <Label htmlFor="reply-columns" className="text-sm">
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
                        <Label htmlFor="reply-rows" className="text-sm">
                          Har bir sahifada
                        </Label>
                        <span className="text-sm font-medium text-primary">
                          {rows} ta qator
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          id="reply-rows"
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
