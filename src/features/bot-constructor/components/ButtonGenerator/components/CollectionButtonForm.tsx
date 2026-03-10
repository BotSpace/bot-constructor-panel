// src/features/bot-constructor/components/ButtonGenerator/components/CollectionButtonForm.tsx

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Database, Zap, PlusCircle, LayoutGrid, Settings2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useCollectionStore } from "@/features/collections/store/collection-list";
import { useReactQueryAction } from "@/services/react-query";
import { ButtonConfig } from "../types";
import { APIDetailCreateResponse } from "@/types/http/response";
import { CollectionDetail } from "@/types/http/collection";
import { generateId } from "@/lib/utils";
import { FilterBuilder } from "@/features/bot-constructor/nodes/actions/shared/filter/filter";
import { useNodes, useEdges } from "reactflow";
import { Filter } from "@/features/bot-constructor/nodes/actions/shared/filter/types";
import { getAvailableStateKeys } from "@/features/bot-constructor/utils";

interface Props {
  onAdd: (button: ButtonConfig) => void;
  buttonType: "inline" | "reply";
  disabled?: boolean;
  nodeId: string;
}

export const CollectionButtonForm = ({
  onAdd,
  buttonType,
  disabled,
  nodeId,
}: Props) => {
  const { data: collections } = useCollectionStore();
  const nodes = useNodes();

  // --- STATELAR ---
  const [selectedCollection, setSelectedCollection] = useState<string>("");
  const [textTemplate, setTextTemplate] = useState("");
  const [filters, setFilters] = useState<Filter[]>([]);
  const [columns, setColumns] = useState(2);
  const [rows, setRows] = useState(5);
  const [enablePagination, setEnablePagination] = useState(true);

  // --- DATA FETCHING ---
  const { data: collectionFields } = useReactQueryAction<
    APIDetailCreateResponse<CollectionDetail>
  >({
    url: selectedCollection
      ? `collection/${selectedCollection}/?project=[id]`
      : "",
    enabled: !!selectedCollection,
  });

  // Flow'dagi mavjud o'zgaruvchilarni (faqat zanjiriga ulangan StateNode va Trigger'lar) filtrlar uchun olish
  const edges = useEdges();
  const availableStateKeys = useMemo(() => {
    return getAvailableStateKeys(nodes, edges, nodeId);
  }, [nodes, edges, nodeId]);

  // --- HANDLERS ---
  const handleCollectionChange = (val: string) => {
    setSelectedCollection(val);
    setTextTemplate("");
    setFilters([]);
  };

  const insertToTemplate = (fieldName: string) => {
    setTextTemplate((prev) => prev + `{{${fieldName}}}`);
  };

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!selectedCollection || !textTemplate) return;

    onAdd({
      id: `btn-coll-${generateId()}`,
      text: textTemplate,
      type: buttonType === "inline" ? "callback" : "reply",
      value: `collection_${selectedCollection}`,
      collectionData: {
        collection: selectedCollection,
        text: textTemplate,
        filters: filters,
        layout: { columns, rows },
        enablePagination: enablePagination,
      },
    });

    // Reset
    setTextTemplate("");
    setSelectedCollection("");
    setFilters([]);
  };

  return (
    <Card className="border-2 border-primary/20 shadow-md bg-card overflow-hidden">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2 text-primary">
          <Database className="h-4 w-4" />
          Dinamik {buttonType === "inline" ? "Inline" : "Reply"} Ro'yxat
        </CardTitle>
        <CardDescription className="text-[11px]">
          Ma'lumotlar bazasidan avtomatik tugmalar generatsiya qilish
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* 1. Collection Tanlash */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase opacity-70">
            1. Bazani tanlang
          </Label>
          <Select
            value={selectedCollection}
            onValueChange={handleCollectionChange}
          >
            <SelectTrigger className="w-full bg-background">
              <SelectValue placeholder="Collection tanlash..." />
            </SelectTrigger>
            <SelectContent>
              {collections?.map((c) => (
                <SelectItem key={c.id} value={c.name}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedCollection && collectionFields?.data && (
          <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
            {/* 2. Shablon va Maydonlar */}
            <div className="space-y-3">
              <Label className="text-xs font-semibold uppercase opacity-70">
                2. Tugma ko'rinishi
              </Label>
              <div className="p-3 bg-muted/40 rounded-lg border border-dashed space-y-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">
                  Maydonni qo'shish:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {collectionFields.data.fields.map((f) => (
                    <Badge
                      key={f.id}
                      variant="outline"
                      className="cursor-pointer hover:bg-black hover:text-white transition-all active:scale-95"
                      onClick={() => insertToTemplate(f.name)}
                    >
                      {f.name}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Input
                  className="font-mono text-sm border-primary/30 focus-visible:ring-primary"
                  placeholder="Masalan: {{name}} - {{price}} so'm"
                  value={textTemplate}
                  onChange={(e) => setTextTemplate(e.target.value)}
                />
                <p className="text-[10px] text-muted-foreground italic flex items-center gap-1">
                  <Zap className="w-3 h-3 text-yellow-500" /> Namuna:{" "}
                  <b>{"{{name}}"}</b>
                </p>
              </div>
            </div>

            {/* 3. Filtrlar (Accordion) */}
            <Accordion
              type="single"
              collapsible
              className="border rounded-md bg-background"
            >
              <AccordionItem value="filters" className="border-none">
                <AccordionTrigger className="px-3 py-2 text-xs font-semibold hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Settings2 className="w-3.5 h-3.5" /> Filtrlar sozlamalari
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-3 pb-3">
                  <FilterBuilder
                    fields={[
                      { id: "_id", label: "ID", type: "text" },
                      ...collectionFields.data.fields.map((f) => ({
                        id: f.name,
                        label: f.name,
                        type: f.type as any,
                      })),
                    ]}
                    filters={filters}
                    onChange={setFilters}
                    stateKeys={availableStateKeys}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* 4. Pagination & Layout Sozlamalari */}
            {enablePagination && (
              <Card className="border-primary/10 bg-primary/5">
                <CardHeader className="pb-0">
                  <CardTitle className="text-[11px] uppercase flex items-center gap-2">
                    <LayoutGrid className="w-3.5 h-3.5" /> Layout & Pagination
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[10px]">Qatorda tugmalar</Label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((n) => (
                          <Button
                            key={n}
                            size="sm"
                            variant={columns === n ? "default" : "outline"}
                            className="flex-1 h-7 text-xs"
                            onClick={() => setColumns(n)}
                          >
                            {n}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px]">Sahifada qatorlar</Label>
                      <Input
                        type="number"
                        className="h-7 text-xs"
                        min={1}
                        max={20}
                        value={rows}
                        onChange={(e) => setRows(Number(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="text-center p-2 border border-dashed rounded-md bg-background/50">
                    <p className="text-[10px] text-muted-foreground uppercase">
                      Bir sahifada jami:
                    </p>
                    <p className="text-sm font-bold text-primary">
                      {columns * rows} ta tugma
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex items-center justify-between p-2 bg-background rounded border border-primary/20">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold">PAGINATION</span>
                <span className="text-[9px] text-muted-foreground">
                  Keyingi/Oldingi tugmalari
                </span>
              </div>
              <Switch
                checked={enablePagination}
                onCheckedChange={setEnablePagination}
              />
            </div>

            {/* 5. Tasdiqlash */}
            <Button
              onClick={handleAdd}
              className="w-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 h-10"
              disabled={disabled || !textTemplate}
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Dinamik Ro'yxatni Qo'shish
            </Button>
          </div>
        )}

        {selectedCollection && !collectionFields && (
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
