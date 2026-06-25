"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HighlightedInput } from "@/features/bot-constructor/components/HighlightedInput";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useFlowStore } from "@/features/bot-constructor/store";
import { getAvailableStateKeys } from "@/features/bot-constructor/lib";
import { cn } from "@/lib/utils";
import { useMemo } from "react";
import { ChevronDown, Database, Plus, Type, X } from "lucide-react";
import {
  DynamicButtonForm,
  CollectionButtonData,
  DEFAULT_COLLECTION_BUTTON,
} from "@/features/bot-constructor/fields/generic-fields/DynamicButtonForm";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface NestedColumnFieldSpec {
  key: string;
  type: "text" | "select" | "switch";
  label?: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
  visibleWhen?: { key: string; equals?: unknown; notEquals?: unknown };
}

export interface NestedRowsFieldConfig {
  type: "nested-rows";
  key: string;
  label?: string;
  addRowLabel?: string;
  addColumnLabel?: string;
  maxColumns?: number;
  columnFields: NestedColumnFieldSpec[];
  defaultColumn?: Record<string, unknown>;
  /** Allow dynamic (collection-backed) columns. Default true if key contains "keyboard" or "buttons". */
  allowDynamicColumns?: boolean;
}

export interface NestedRowsFieldProps {
  nodeId: string;
  data: Record<string, unknown>;
  field: NestedRowsFieldConfig;
}

// ---------------------------------------------------------------------------
// Internal shape
// ---------------------------------------------------------------------------

interface StaticColumn {
  [key: string]: unknown;
}

interface DynamicColumn {
  collectionData: CollectionButtonData;
}

type NestedColumn = StaticColumn | DynamicColumn;

interface NestedRow {
  columns: NestedColumn[];
}

// ---------------------------------------------------------------------------
// Column type guards
// ---------------------------------------------------------------------------

function isDynamicColumn(col: NestedColumn): col is DynamicColumn {
  return (
    col !== null &&
    typeof col === "object" &&
    "collectionData" in col &&
    typeof (col as DynamicColumn).collectionData === "object"
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isColumnFieldVisible(
  column: StaticColumn,
  spec: NestedColumnFieldSpec
): boolean {
  const rule = spec.visibleWhen;
  if (!rule) return true;

  const current = column[rule.key];

  if (Object.prototype.hasOwnProperty.call(rule, "equals")) {
    return current === rule.equals;
  }
  if (Object.prototype.hasOwnProperty.call(rule, "notEquals")) {
    return current !== rule.notEquals;
  }
  return true;
}

function normalizeRows(raw: unknown): NestedRow[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (r): r is { columns: unknown[] } =>
        r !== null && typeof r === "object" && Array.isArray((r as { columns?: unknown }).columns)
    )
    .map((r) => ({
      columns: r.columns.filter(
        (c): c is NestedColumn => c !== null && typeof c === "object"
      ),
    }));
}

// ---------------------------------------------------------------------------
// ColumnField — renders a single spec inside one static column
// ---------------------------------------------------------------------------

interface ColumnFieldProps {
  spec: NestedColumnFieldSpec;
  column: StaticColumn;
  onChange: (key: string, value: unknown) => void;
  suggestions?: string[];
}

function ColumnField({ spec, column, onChange, suggestions = [] }: ColumnFieldProps) {
  if (!isColumnFieldVisible(column, spec)) return null;

  const rawValue = column[spec.key];

  if (spec.type === "switch") {
    // default TRUE: undefined = yoqilgan (backward-compat — eski tugmalar handle oladi)
    const on = rawValue !== false;
    return (
      <div className="flex items-center justify-between gap-2">
        {spec.label ? (
          <Label className="text-[11px] text-white/50">{spec.label}</Label>
        ) : null}
        <Switch
          checked={on}
          onCheckedChange={(v) => onChange(spec.key, v)}
          className="scale-75"
        />
      </div>
    );
  }

  if (spec.type === "select") {
    const strValue = typeof rawValue === "string" ? rawValue : "";
    return (
      <div className="grid gap-1">
        {spec.label ? (
          <Label className="text-[11px] text-white/50">{spec.label}</Label>
        ) : null}
        <Select value={strValue} onValueChange={(v) => onChange(spec.key, v)}>
          <SelectTrigger className="h-8 border-white/10 bg-zinc-950/60 text-xs">
            <SelectValue placeholder={spec.placeholder ?? "Tanlang"} />
          </SelectTrigger>
          <SelectContent>
            {(spec.options ?? []).map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className="text-xs">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  // default: text
  const strValue = typeof rawValue === "string" ? rawValue : "";
  return (
    <div className="grid gap-1">
      {spec.label ? (
        <Label className="text-[11px] text-white/50">{spec.label}</Label>
      ) : null}
      <HighlightedInput
        type="text"
        placeholder={spec.placeholder}
        value={strValue}
        suggestions={suggestions}
        className="h-8 border-white/10 bg-zinc-950/60 text-xs"
        onChange={(e) => onChange(spec.key, e.target.value)}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// ColumnCard — one column inside a row
// ---------------------------------------------------------------------------

interface ColumnCardProps {
  column: NestedColumn;
  columnFields: NestedColumnFieldSpec[];
  onFieldChange: (key: string, value: unknown) => void;
  onDynamicChange: (value: CollectionButtonData) => void;
  onRemove: () => void;
  canRemove: boolean;
  allowDynamic: boolean;
  onSwitchType: (toDynamic: boolean) => void;
  suggestions?: string[];
}

function ColumnCard({
  column,
  columnFields,
  onFieldChange,
  onDynamicChange,
  onRemove,
  canRemove,
  allowDynamic,
  onSwitchType,
  suggestions = [],
}: ColumnCardProps) {
  const dynamic = isDynamicColumn(column);

  return (
    <div
      className={cn(
        "relative w-full rounded-lg border p-2.5 space-y-2 transition-colors",
        dynamic
          ? "border-blue-500/25 bg-blue-500/[0.04]"
          : "border-white/10 bg-white/[0.03]"
      )}
    >
      {/* Top controls: type switcher + remove */}
      <div className="flex items-center justify-between gap-1">
        {allowDynamic ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={cn(
                  "inline-flex h-5 items-center gap-1 rounded px-1.5 text-[10px] font-medium transition-colors",
                  dynamic
                    ? "bg-blue-500/15 text-blue-400/80 hover:bg-blue-500/25"
                    : "bg-white/[0.06] text-white/40 hover:bg-white/10"
                )}
              >
                {dynamic ? (
                  <Database className="h-2.5 w-2.5" />
                ) : (
                  <Type className="h-2.5 w-2.5" />
                )}
                {dynamic ? "Dinamik" : "Statik"}
                <ChevronDown className="h-2.5 w-2.5 opacity-60" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[140px]">
              <DropdownMenuItem
                className={cn("text-xs", !dynamic && "bg-accent")}
                onClick={() => !dynamic || onSwitchType(false)}
              >
                <Type className="mr-2 h-3 w-3" />
                Oddiy tugma
              </DropdownMenuItem>
              <DropdownMenuItem
                className={cn("text-xs", dynamic && "bg-accent")}
                onClick={() => dynamic || onSwitchType(true)}
              >
                <Database className="mr-2 h-3 w-3 text-blue-400" />
                <span>
                  Dinamik{" "}
                  <span className="text-[10px] text-blue-400/70">(collection)</span>
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <span className="text-[10px] text-white/30">Tugma</span>
        )}

        {canRemove ? (
          <button
            type="button"
            aria-label="Ustunni o'chirish"
            className="flex h-4 w-4 items-center justify-center rounded text-white/30 transition-colors hover:text-red-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-400"
            onClick={onRemove}
          >
            <X className="h-3 w-3" />
          </button>
        ) : null}
      </div>

      {/* Content */}
      {dynamic ? (
        <DynamicButtonForm
          value={(column as DynamicColumn).collectionData}
          onChange={onDynamicChange}
        />
      ) : (
        columnFields.map((spec) => (
          <ColumnField
            key={spec.key}
            spec={spec}
            column={column as StaticColumn}
            onChange={onFieldChange}
            suggestions={suggestions}
          />
        ))
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// RowCard — one row containing N columns
// ---------------------------------------------------------------------------

interface RowCardProps {
  row: NestedRow;
  rowIndex: number;
  field: NestedRowsFieldConfig;
  allowDynamic: boolean;
  onColumnFieldChange: (colIdx: number, key: string, value: unknown) => void;
  onColumnDynamicChange: (colIdx: number, value: CollectionButtonData) => void;
  onAddStaticColumn: () => void;
  onAddDynamicColumn: () => void;
  onRemoveColumn: (colIdx: number) => void;
  onSwitchColumnType: (colIdx: number, toDynamic: boolean) => void;
  onRemoveRow: () => void;
  suggestions?: string[];
}

function RowCard({
  row,
  rowIndex,
  field,
  allowDynamic,
  onColumnFieldChange,
  onColumnDynamicChange,
  onAddStaticColumn,
  onAddDynamicColumn,
  onRemoveColumn,
  onSwitchColumnType,
  onRemoveRow,
  suggestions = [],
}: RowCardProps) {
  const maxColumns = field.maxColumns ?? 8;
  const canAddColumn = row.columns.length < maxColumns;

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 space-y-2.5">
      {/* Row header */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-white/40">
          Qator {rowIndex + 1}
        </span>
        <button
          type="button"
          aria-label="Qatorni o'chirish"
          className="flex h-5 w-5 items-center justify-center rounded text-white/30 transition-colors hover:text-red-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-400"
          onClick={onRemoveRow}
        >
          <X className="h-3 w-3" />
        </button>
      </div>

      {/* Columns — vertical stack, each button full-width (one per row) */}
      {row.columns.length > 0 ? (
        <div className="flex flex-col gap-2">
          {row.columns.map((column, colIdx) => (
            <ColumnCard
              key={colIdx}
              column={column}
              columnFields={field.columnFields}
              onFieldChange={(key, value) => onColumnFieldChange(colIdx, key, value)}
              onDynamicChange={(value) => onColumnDynamicChange(colIdx, value)}
              onRemove={() => onRemoveColumn(colIdx)}
              canRemove={row.columns.length > 1}
              allowDynamic={allowDynamic}
              onSwitchType={(toDynamic) => onSwitchColumnType(colIdx, toDynamic)}
              suggestions={suggestions}
            />
          ))}
        </div>
      ) : (
        <p className="text-[11px] text-white/25">Ustun yo'q</p>
      )}

      {/* Add column button(s) */}
      {allowDynamic ? (
        <div className="flex gap-1.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={!canAddColumn}
            className={cn(
              "h-7 flex-1 border border-dashed border-white/10 text-[11px] text-white/40",
              "hover:border-white/20 hover:bg-white/[0.03] hover:text-white/60",
              "disabled:opacity-30"
            )}
            onClick={onAddStaticColumn}
          >
            <Type className="mr-1 h-3 w-3" />
            Oddiy tugma
            {canAddColumn ? (
              <span className="ml-auto text-white/25">
                {row.columns.length}/{maxColumns}
              </span>
            ) : null}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={!canAddColumn}
            className={cn(
              "h-7 flex-1 border border-dashed border-blue-500/20 text-[11px] text-blue-400/50",
              "hover:border-blue-500/30 hover:bg-blue-500/[0.04] hover:text-blue-400/80",
              "disabled:opacity-30"
            )}
            onClick={onAddDynamicColumn}
          >
            <Database className="mr-1 h-3 w-3" />
            Dinamik
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={!canAddColumn}
          className={cn(
            "h-7 w-full border border-dashed border-white/10 text-[11px] text-white/40",
            "hover:border-white/20 hover:bg-white/[0.03] hover:text-white/60",
            "disabled:opacity-30"
          )}
          onClick={onAddStaticColumn}
        >
          <Plus className="mr-1 h-3 w-3" />
          {field.addColumnLabel ?? "Ustun qo'shish"}
          {canAddColumn ? (
            <span className="ml-auto text-white/25">
              {row.columns.length}/{maxColumns}
            </span>
          ) : null}
        </Button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function NestedRowsField({ nodeId, data, field }: NestedRowsFieldProps) {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const nodes = useFlowStore((s) => s.nodes);
  const edges = useFlowStore((s) => s.edges);
  const availableStateKeys = useMemo(
    () => getAvailableStateKeys(nodes, edges, nodeId),
    [nodes, edges, nodeId]
  );

  // Dynamic columns are opt-in via manifest only. Default OFF — a plain
  // nested-rows shows just a single "add column" button (no Static/Dynamic
  // switch). Set `allowDynamicColumns: true` in the field manifest to enable.
  const allowDynamic = field.allowDynamicColumns === true;

  const rows = normalizeRows(data[field.key]);

  // --- helpers that produce the next rows array immutably ---

  const setRows = (next: NestedRow[]) => {
    updateNodeData(nodeId, { [field.key]: next });
  };

  const handleAddRow = () => {
    const defaultColumn: NestedColumn = { ...(field.defaultColumn ?? {}) };
    setRows([...rows, { columns: [defaultColumn] }]);
  };

  const handleRemoveRow = (rowIdx: number) => {
    setRows(rows.filter((_, i) => i !== rowIdx));
  };

  const handleAddStaticColumn = (rowIdx: number) => {
    const maxColumns = field.maxColumns ?? 8;
    const row = rows[rowIdx];
    if (!row || row.columns.length >= maxColumns) return;
    const newColumn: NestedColumn = { ...(field.defaultColumn ?? {}) };
    setRows(
      rows.map((r, i) =>
        i === rowIdx ? { ...r, columns: [...r.columns, newColumn] } : r
      )
    );
  };

  const handleAddDynamicColumn = (rowIdx: number) => {
    const maxColumns = field.maxColumns ?? 8;
    const row = rows[rowIdx];
    if (!row || row.columns.length >= maxColumns) return;
    const newColumn: DynamicColumn = {
      collectionData: { ...DEFAULT_COLLECTION_BUTTON },
    };
    setRows(
      rows.map((r, i) =>
        i === rowIdx ? { ...r, columns: [...r.columns, newColumn] } : r
      )
    );
  };

  const handleSwitchColumnType = (
    rowIdx: number,
    colIdx: number,
    toDynamic: boolean
  ) => {
    setRows(
      rows.map((r, i) => {
        if (i !== rowIdx) return r;
        const newCols = r.columns.map((c, ci) => {
          if (ci !== colIdx) return c;
          if (toDynamic) {
            return { collectionData: { ...DEFAULT_COLLECTION_BUTTON } } as DynamicColumn;
          } else {
            return { ...(field.defaultColumn ?? {}) } as StaticColumn;
          }
        });
        return { ...r, columns: newCols };
      })
    );
  };

  const handleRemoveColumn = (rowIdx: number, colIdx: number) => {
    setRows(
      rows.map((r, i) =>
        i === rowIdx
          ? { ...r, columns: r.columns.filter((_, ci) => ci !== colIdx) }
          : r
      )
    );
  };

  const handleColumnFieldChange = (
    rowIdx: number,
    colIdx: number,
    key: string,
    value: unknown
  ) => {
    setRows(
      rows.map((r, i) =>
        i === rowIdx
          ? {
              ...r,
              columns: r.columns.map((c, ci) =>
                ci === colIdx ? { ...c, [key]: value } : c
              ),
            }
          : r
      )
    );
  };

  const handleColumnDynamicChange = (
    rowIdx: number,
    colIdx: number,
    value: CollectionButtonData
  ) => {
    setRows(
      rows.map((r, i) =>
        i === rowIdx
          ? {
              ...r,
              columns: r.columns.map((c, ci) =>
                ci === colIdx ? { collectionData: value } : c
              ),
            }
          : r
      )
    );
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-3">
      {/* Header */}
      {field.label ? (
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium text-white/70">
            {field.label}
          </Label>
          <span className="text-[10px] text-white/30">{rows.length} qator</span>
        </div>
      ) : null}

      {/* Rows */}
      {rows.length > 0 ? (
        <div className="space-y-2">
          {rows.map((row, rowIdx) => (
            <RowCard
              key={rowIdx}
              row={row}
              rowIndex={rowIdx}
              field={field}
              allowDynamic={allowDynamic}
              onColumnFieldChange={(colIdx, key, value) =>
                handleColumnFieldChange(rowIdx, colIdx, key, value)
              }
              onColumnDynamicChange={(colIdx, value) =>
                handleColumnDynamicChange(rowIdx, colIdx, value)
              }
              onAddStaticColumn={() => handleAddStaticColumn(rowIdx)}
              onAddDynamicColumn={() => handleAddDynamicColumn(rowIdx)}
              onRemoveColumn={(colIdx) => handleRemoveColumn(rowIdx, colIdx)}
              onSwitchColumnType={(colIdx, toDynamic) =>
                handleSwitchColumnType(rowIdx, colIdx, toDynamic)
              }
              onRemoveRow={() => handleRemoveRow(rowIdx)}
              suggestions={availableStateKeys}
            />
          ))}
        </div>
      ) : null}

      {/* Add row button */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full border-white/10 bg-transparent text-xs text-white/50 hover:bg-white/5 hover:text-white/80"
        onClick={handleAddRow}
      >
        <Plus className="mr-1.5 h-3.5 w-3.5" />
        {field.addRowLabel ?? "Qator qo'shish"}
      </Button>
    </div>
  );
}
