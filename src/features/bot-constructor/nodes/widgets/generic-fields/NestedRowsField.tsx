"use client";

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
import { useFlowStore } from "@/features/bot-constructor/store";
import { cn } from "@/lib/utils";
import { Plus, X } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface NestedColumnFieldSpec {
  key: string;
  type: "text" | "select";
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
}

export interface NestedRowsFieldProps {
  nodeId: string;
  data: Record<string, unknown>;
  field: NestedRowsFieldConfig;
}

// ---------------------------------------------------------------------------
// Internal shape
// ---------------------------------------------------------------------------

interface NestedColumn {
  [key: string]: unknown;
}

interface NestedRow {
  columns: NestedColumn[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isColumnFieldVisible(
  column: NestedColumn,
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
// ColumnField — renders a single spec inside one column
// ---------------------------------------------------------------------------

interface ColumnFieldProps {
  spec: NestedColumnFieldSpec;
  column: NestedColumn;
  onChange: (key: string, value: unknown) => void;
}

function ColumnField({ spec, column, onChange }: ColumnFieldProps) {
  if (!isColumnFieldVisible(column, spec)) return null;

  const rawValue = column[spec.key];

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
      <Input
        type="text"
        placeholder={spec.placeholder}
        value={strValue}
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
  onRemove: () => void;
  canRemove: boolean;
}

function ColumnCard({
  column,
  columnFields,
  onFieldChange,
  onRemove,
  canRemove,
}: ColumnCardProps) {
  return (
    <div className="relative min-w-[140px] flex-1 rounded-lg border border-white/10 bg-white/[0.03] p-2.5 space-y-2">
      {canRemove ? (
        <button
          type="button"
          aria-label="Ustunni o'chirish"
          className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded text-white/30 transition-colors hover:text-red-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-400"
          onClick={onRemove}
        >
          <X className="h-3 w-3" />
        </button>
      ) : null}

      {columnFields.map((spec) => (
        <ColumnField
          key={spec.key}
          spec={spec}
          column={column}
          onChange={onFieldChange}
        />
      ))}
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
  onColumnFieldChange: (colIdx: number, key: string, value: unknown) => void;
  onAddColumn: () => void;
  onRemoveColumn: (colIdx: number) => void;
  onRemoveRow: () => void;
}

function RowCard({
  row,
  rowIndex,
  field,
  onColumnFieldChange,
  onAddColumn,
  onRemoveColumn,
  onRemoveRow,
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

      {/* Columns */}
      {row.columns.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {row.columns.map((column, colIdx) => (
            <ColumnCard
              key={colIdx}
              column={column}
              columnFields={field.columnFields}
              onFieldChange={(key, value) =>
                onColumnFieldChange(colIdx, key, value)
              }
              onRemove={() => onRemoveColumn(colIdx)}
              canRemove={row.columns.length > 1}
            />
          ))}
        </div>
      ) : (
        <p className="text-[11px] text-white/25">Ustun yo'q</p>
      )}

      {/* Add column button */}
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
        onClick={onAddColumn}
      >
        <Plus className="mr-1 h-3 w-3" />
        {field.addColumnLabel ?? "Ustun qo'shish"}
        {canAddColumn ? (
          <span className="ml-auto text-white/25">
            {row.columns.length}/{maxColumns}
          </span>
        ) : null}
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function NestedRowsField({ nodeId, data, field }: NestedRowsFieldProps) {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);

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

  const handleAddColumn = (rowIdx: number) => {
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
              onColumnFieldChange={(colIdx, key, value) =>
                handleColumnFieldChange(rowIdx, colIdx, key, value)
              }
              onAddColumn={() => handleAddColumn(rowIdx)}
              onRemoveColumn={(colIdx) => handleRemoveColumn(rowIdx, colIdx)}
              onRemoveRow={() => handleRemoveRow(rowIdx)}
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
