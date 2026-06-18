"use client";

import { useEffect, useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { useFlowStore } from "@/features/bot-constructor/store";
import { instanceAuth } from "@/services/instance";

// ---------------------------------------------------------------------------
// DynamicInputsField — loads a list of "columns" (e.g. a Google Sheet's header
// row) for the selected credential/spreadsheet/sheet and renders ONE input per
// column. The user does NOT pick a column; every column becomes a value input.
//
// Storage:
//   data[`${dataKey}_map`] = { "<ColumnName>": "<value>" }   ← UI source of truth
//   data[dataKey]          = JSON "[[v1, v2, ...]]"           ← engine payload
//                            (single row, values in loaded column order)
// The engine's GoogleSheetsNode reads `values` unchanged.
// ---------------------------------------------------------------------------
interface OptionItem {
  value: string;
  label: string;
}

const _optionsCache: Map<string, OptionItem[]> = new Map();

interface DynamicInputsFieldProps {
  nodeId: string;
  data: Record<string, unknown>;
  /** Key for the engine 2D-array payload (default "values") */
  dataKey: string;
  resource: string;
  credentialKey?: string;
  dependsOn?: string[];
  label?: string;
}

export function DynamicInputsField({
  nodeId,
  data,
  dataKey,
  resource,
  credentialKey = "credential_id",
  dependsOn = [],
  label,
}: DynamicInputsFieldProps) {
  const updateNodeData = useFlowStore((s) => s.updateNodeData);
  const mapKey = `${dataKey}_map`;

  const credentialId = data[credentialKey];
  const credentialIdStr =
    typeof credentialId === "number"
      ? String(credentialId)
      : typeof credentialId === "string" && credentialId !== ""
        ? credentialId
        : null;

  const depValues: Record<string, string> = {};
  let missingDep: string | null = null;
  for (const depKey of dependsOn) {
    const v = data[depKey];
    const vStr = typeof v === "string" && v !== "" ? v : typeof v === "number" ? String(v) : null;
    if (!vStr) {
      missingDep = depKey;
      break;
    }
    depValues[depKey] = vStr;
  }

  const cacheKey = JSON.stringify({ resource, credentialId: credentialIdStr, params: depValues });

  const [columns, setColumns] = useState<OptionItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchedKeyRef = useRef<string | null>(null);

  const rowMap =
    data[mapKey] && typeof data[mapKey] === "object"
      ? (data[mapKey] as Record<string, string>)
      : {};

  const isDisabled = !credentialIdStr || !!missingDep;
  const disabledHint = !credentialIdStr
    ? "Avval credential tanlang"
    : missingDep
      ? `Avval "${missingDep}" ni tanlang`
      : null;

  const fetchColumns = (forceRefresh = false) => {
    if (!credentialIdStr || missingDep) return;
    if (!forceRefresh && _optionsCache.has(cacheKey)) {
      setColumns(_optionsCache.get(cacheKey)!);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    instanceAuth
      .post(`/v1/credentials/options/${resource}/`, {
        credential_id: Number(credentialIdStr),
        params: depValues,
      })
      .then(({ data: raw }) => {
        const r = (raw ?? {}) as Record<string, unknown>;
        const opts: OptionItem[] = Array.isArray(r.options)
          ? (r.options as OptionItem[])
          : Array.isArray((r.data as Record<string, unknown> | undefined)?.options)
            ? ((r.data as Record<string, unknown>).options as OptionItem[])
            : [];
        const apiError = typeof r.error === "string" ? r.error : null;
        _optionsCache.set(cacheKey, opts);
        setColumns(opts);
        if (apiError) setError(apiError);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Ustunlarni yuklab bo'lmadi");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isDisabled) {
      setColumns(null);
      return;
    }
    if (fetchedKeyRef.current === cacheKey) return;
    fetchedKeyRef.current = cacheKey;
    fetchColumns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey, isDisabled]);

  // Rebuild the engine `values` 2D array (single row) from the map in column order.
  const commit = (nextMap: Record<string, string>, cols: OptionItem[]) => {
    const row = cols.map((c) => nextMap[c.label] ?? "");
    updateNodeData(nodeId, {
      [mapKey]: nextMap,
      [dataKey]: JSON.stringify([row]),
    });
  };

  const onCellChange = (col: string, val: string) => {
    if (!columns) return;
    commit({ ...rowMap, [col]: val }, columns);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium text-muted-foreground">
          {label ?? "Ustun qiymatlari"}
        </Label>
        {!isDisabled ? (
          <button
            type="button"
            onClick={() => fetchColumns(true)}
            className="text-muted-foreground hover:text-foreground"
            title="Ustunlarni yangilash"
          >
            <RefreshCw className={cnSpin(loading)} />
          </button>
        ) : null}
      </div>

      {isDisabled ? (
        <p className="text-[11px] text-muted-foreground">{disabledHint}</p>
      ) : loading && !columns ? (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Ustunlar yuklanmoqda...
        </div>
      ) : error && (!columns || columns.length === 0) ? (
        <div className="flex items-center gap-1.5 text-[11px] text-amber-400">
          <AlertCircle className="h-3.5 w-3.5" /> {error}
        </div>
      ) : columns && columns.length > 0 ? (
        <div className="space-y-2">
          {columns.map((col) => (
            <div key={col.value} className="space-y-1">
              <Label className="text-[11px] text-muted-foreground">{col.label}</Label>
              <Input
                value={rowMap[col.label] ?? ""}
                onChange={(e) => onCellChange(col.label, e.target.value)}
                placeholder={`${col.label} qiymati — {{message.text}} ham mumkin`}
                className="border-white/10 bg-zinc-950/60 text-sm"
                autoComplete="off"
                data-1p-ignore="true"
                data-lpignore="true"
                data-bwignore="true"
              />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[11px] text-muted-foreground">
          Ustun topilmadi (sheetning birinchi qatorida sarlavhalar bo'lsin)
          {error ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="ml-2 h-6 px-2 text-[11px]"
              onClick={() => fetchColumns(true)}
            >
              Qayta urinish
            </Button>
          ) : null}
        </p>
      )}
    </div>
  );
}

function cnSpin(loading: boolean): string {
  return loading ? "h-3.5 w-3.5 animate-spin" : "h-3.5 w-3.5";
}
