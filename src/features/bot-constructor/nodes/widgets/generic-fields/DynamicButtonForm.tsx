"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useCollectionStore } from "@/features/collections/store/collection-list";
import { useReactQueryAction } from "@/services/react-query";
import { CollectionDetail } from "@/types/http/collection";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronRight,
  Database,
  Filter,
  LayoutGrid,
  Layers,
  Hash,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CollectionButtonData {
  collection: string;
  field: string;
  text: string;
  callbackDataPattern: string;
  filterType: "static" | "state";
  filterField: string;
  filterValue: string;
  stateKey: string;
  enablePagination: boolean;
  layout: { rows: number; columns: number };
}

export const DEFAULT_COLLECTION_BUTTON: CollectionButtonData = {
  collection: "",
  field: "",
  text: "",
  callbackDataPattern: "{id}",
  filterType: "static",
  filterField: "",
  filterValue: "",
  stateKey: "",
  enablePagination: false,
  layout: { rows: 5, columns: 2 },
};

interface DynamicButtonFormProps {
  value: CollectionButtonData;
  onChange: (value: CollectionButtonData) => void;
}

// ---------------------------------------------------------------------------
// Section wrapper — collapsible accordion-like
// ---------------------------------------------------------------------------

function Section({
  title,
  icon: Icon,
  children,
  defaultOpen = false,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-white/50 transition-colors",
            "hover:bg-white/[0.04] hover:text-white/70",
            open && "text-white/70"
          )}
        >
          <Icon className="h-3 w-3 shrink-0" />
          <span className="flex-1 text-left">{title}</span>
          <ChevronRight
            className={cn(
              "h-3 w-3 shrink-0 transition-transform duration-150",
              open && "rotate-90"
            )}
          />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-1 space-y-2 px-2.5 pb-2">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
}

// ---------------------------------------------------------------------------
// Field token hints
// ---------------------------------------------------------------------------

function FieldTokenHints({
  fields,
  onInsert,
}: {
  fields: string[];
  onInsert: (token: string) => void;
}) {
  if (!fields.length) return null;
  return (
    <div className="flex flex-wrap gap-1 pt-0.5">
      {fields.map((f) => (
        <button
          key={f}
          type="button"
          title={`{{${f}}}`}
          onClick={() => onInsert(`{{${f}}}`)}
          className="inline-flex h-5 items-center rounded border border-white/10 bg-white/[0.04] px-1.5 text-[10px] text-white/40 hover:border-white/20 hover:text-white/60 transition-colors"
        >
          {`{{${f}}}`}
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function DynamicButtonForm({ value, onChange }: DynamicButtonFormProps) {
  const t = useTranslations("nodes.dynamicButtonForm");

  const { data: collections } = useCollectionStore();

  const { data: collectionDetail } = useReactQueryAction<CollectionDetail>({
    url: value.collection
      ? `cms/projects/[id]/collections/${value.collection}/`
      : undefined,
    enabled: Boolean(value.collection),
  });

  const fieldNames = useMemo(
    () => (collectionDetail?.fields ?? []).map((f) => f.name),
    [collectionDetail]
  );

  const set = (partial: Partial<CollectionButtonData>) =>
    onChange({ ...value, ...partial });

  const setLayout = (partial: Partial<CollectionButtonData["layout"]>) =>
    onChange({ ...value, layout: { ...value.layout, ...partial } });

  const appendToken = (
    currentText: string,
    token: string,
    setter: (v: string) => void
  ) => {
    setter(currentText + token);
  };

  return (
    <div className="space-y-1 rounded-lg border border-blue-500/20 bg-blue-500/[0.04] p-2.5">
      {/* Header badge */}
      <div className="flex items-center gap-2 pb-1">
        <Database className="h-3.5 w-3.5 text-blue-400/70" />
        <span className="text-[11px] font-semibold text-blue-400/80 uppercase tracking-wide">
          {t("dynamicButtonTitle")}
        </span>
      </div>

      {/* ── Collection & Field ── */}
      <Section title={`${t("collection")} & Field`} icon={Database} defaultOpen>
        {/* Collection */}
        <div className="grid gap-1">
          <Label className="text-[10px] text-white/40">{t("collection")}</Label>
          <Select
            value={value.collection}
            onValueChange={(v) => set({ collection: v, field: "" })}
          >
            <SelectTrigger className="h-7 border-white/10 bg-zinc-950/60 text-[11px]">
              <SelectValue placeholder={t("collectionSelect")} />
            </SelectTrigger>
            <SelectContent>
              {(collections ?? []).map((c) => (
                <SelectItem key={String(c.id)} value={c.name} className="text-xs">
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Field (default display field) */}
        {fieldNames.length > 0 && (
          <div className="grid gap-1">
            <Label className="text-[10px] text-white/40">{t("mainField")}</Label>
            <Select
              value={value.field}
              onValueChange={(v) => set({ field: v })}
            >
              <SelectTrigger className="h-7 border-white/10 bg-zinc-950/60 text-[11px]">
                <SelectValue placeholder={t("fieldSelect")} />
              </SelectTrigger>
              <SelectContent>
                {fieldNames.map((f) => (
                  <SelectItem key={f} value={f} className="text-xs">
                    {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Text template */}
        <div className="grid gap-1">
          <Label className="text-[10px] text-white/40">
            {t("buttonTextTemplate")}
          </Label>
          <Input
            value={value.text}
            placeholder={`{{name}} — {{price}}`}
            className="h-7 border-white/10 bg-zinc-950/60 text-[11px]"
            onChange={(e) => set({ text: e.target.value })}
          />
          <FieldTokenHints
            fields={fieldNames}
            onInsert={(token) =>
              appendToken(value.text, token, (v) => set({ text: v }))
            }
          />
        </div>

        {/* callbackDataPattern */}
        <div className="grid gap-1">
          <Label className="text-[10px] text-white/40">
            {t("callbackPattern")}
          </Label>
          <Input
            value={value.callbackDataPattern}
            placeholder="course:{id}"
            className="h-7 border-white/10 bg-zinc-950/60 text-[11px] font-mono"
            onChange={(e) => set({ callbackDataPattern: e.target.value })}
          />
          <FieldTokenHints
            fields={["id", ...fieldNames]}
            onInsert={(token) => {
              // Convert {{field}} → {field} for callback pattern
              const callbackToken = token.replace(/^\{\{/, "{").replace(/\}\}$/, "}");
              appendToken(
                value.callbackDataPattern,
                callbackToken,
                (v) => set({ callbackDataPattern: v })
              );
            }}
          />
          <p className="text-[10px] text-white/25">{t("tokenHint")}</p>
        </div>
      </Section>

      {/* ── Filter ── */}
      <Section title={t("filterSection")} icon={Filter}>
        <div className="grid gap-1">
          <Label className="text-[10px] text-white/40">{t("filterType")}</Label>
          <Select
            value={value.filterType}
            onValueChange={(v: "static" | "state") =>
              set({ filterType: v, filterField: "", filterValue: "", stateKey: "" })
            }
          >
            <SelectTrigger className="h-7 border-white/10 bg-zinc-950/60 text-[11px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="static" className="text-xs">
                {t("filterTypeStatic")}
              </SelectItem>
              <SelectItem value="state" className="text-xs">
                {t("filterTypeState")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-1">
          <Label className="text-[10px] text-white/40">{t("filterField")}</Label>
          {fieldNames.length > 0 ? (
            <Select
              value={value.filterField}
              onValueChange={(v) => set({ filterField: v })}
            >
              <SelectTrigger className="h-7 border-white/10 bg-zinc-950/60 text-[11px]">
                <SelectValue placeholder={t("fieldSelect")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="" className="text-xs text-white/40">
                  {t("noFilter")}
                </SelectItem>
                {fieldNames.map((f) => (
                  <SelectItem key={f} value={f} className="text-xs">
                    {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              value={value.filterField}
              placeholder="active"
              className="h-7 border-white/10 bg-zinc-950/60 text-[11px]"
              onChange={(e) => set({ filterField: e.target.value })}
            />
          )}
        </div>

        {value.filterType === "static" ? (
          <div className="grid gap-1">
            <Label className="text-[10px] text-white/40">
              {t("filterValue")}
            </Label>
            <Input
              value={value.filterValue}
              placeholder="true"
              className="h-7 border-white/10 bg-zinc-950/60 text-[11px]"
              onChange={(e) => set({ filterValue: e.target.value })}
            />
          </div>
        ) : (
          <div className="grid gap-1">
            <Label className="text-[10px] text-white/40">{t("stateKey")}</Label>
            <Input
              value={value.stateKey}
              placeholder="user_category"
              className="h-7 border-white/10 bg-zinc-950/60 text-[11px] font-mono"
              onChange={(e) => set({ stateKey: e.target.value })}
            />
          </div>
        )}
      </Section>

      {/* ── Pagination & Layout ── */}
      <Section title={t("paginationLayout")} icon={LayoutGrid}>
        {/* Pagination toggle */}
        <div className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-1.5">
          <span className="text-[11px] text-white/50">{t("enablePagination")}</span>
          <Switch
            checked={value.enablePagination}
            onCheckedChange={(checked) => set({ enablePagination: checked })}
            className="scale-75"
          />
        </div>

        {/* Layout rows × columns */}
        <div className="flex gap-2">
          <div className="flex-1 grid gap-1">
            <Label className="flex items-center gap-1 text-[10px] text-white/40">
              <Layers className="h-2.5 w-2.5" />
              {t("rows")}
            </Label>
            <Input
              type="number"
              min={1}
              max={20}
              value={value.layout.rows}
              className="h-7 border-white/10 bg-zinc-950/60 text-[11px]"
              onChange={(e) =>
                setLayout({ rows: Math.max(1, Number(e.target.value)) })
              }
            />
          </div>
          <div className="flex-1 grid gap-1">
            <Label className="flex items-center gap-1 text-[10px] text-white/40">
              <Hash className="h-2.5 w-2.5" />
              {t("columns")}
            </Label>
            <Input
              type="number"
              min={1}
              max={8}
              value={value.layout.columns}
              className="h-7 border-white/10 bg-zinc-950/60 text-[11px]"
              onChange={(e) =>
                setLayout({ columns: Math.max(1, Number(e.target.value)) })
              }
            />
          </div>
        </div>

        {/* Layout column preview */}
        <div className="flex flex-wrap gap-0.5 pt-0.5">
          {Array.from({ length: Math.min(value.layout.columns, 4) }).map((_, i) => (
            <Badge
              key={i}
              variant="outline"
              className="h-4 flex-1 justify-center border-white/10 px-0 text-[9px] text-white/20"
            >
              btn
            </Badge>
          ))}
          {value.layout.columns > 4 && (
            <span className="text-[9px] text-white/20 self-center pl-1">
              +{value.layout.columns - 4}
            </span>
          )}
        </div>
        <p className="text-[10px] text-white/25">
          {value.layout.rows} {t("rows")} × {value.layout.columns} {t("columns")}{" "}
          = max {value.layout.rows * value.layout.columns}
        </p>
      </Section>
    </div>
  );
}
