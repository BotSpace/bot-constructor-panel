"use client";

import { useEffect, useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check, ChevronsUpDown, Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFlowStore } from "@/features/bot-constructor/store";
import { instanceAuth } from "@/services/instance";

// ---------------------------------------------------------------------------
// Per-(resource + credential + params) in-memory cache. Key = JSON string.
// Cleared on full page navigation.
// ---------------------------------------------------------------------------
interface OptionItem {
  value: string;
  label: string;
}

const _optionsCache: Map<string, OptionItem[]> = new Map();

interface DynamicSelectFieldProps {
  nodeId: string;
  data: Record<string, unknown>;
  dataKey: string;
  resource: string;
  /**
   * Data key that holds the credential id. When undefined the field does NOT
   * require a credential — it fetches options unconditionally (module fields).
   * When provided the old gate logic applies: credential must be selected first.
   */
  credentialKey?: string;
  dependsOn?: string[];
  label?: string;
  placeholder?: string;
  /** Allow typing a literal/{{var}} value in addition to loaded options (default: true) */
  allowCustom?: boolean;
}

export function DynamicSelectField({
  nodeId,
  data,
  dataKey,
  resource,
  credentialKey,
  dependsOn = [],
  label,
  placeholder = "Tanlang...",
  allowCustom = true,
}: DynamicSelectFieldProps) {
  const updateNodeData = useFlowStore((s) => s.updateNodeData);
  const nodes = useFlowStore((s) => s.nodes);

  // Whether this field requires a credential at all
  const requiresCredential = credentialKey !== undefined;

  // Resolve credential id (only relevant when requiresCredential)
  const credentialId = requiresCredential ? data[credentialKey as string] : undefined;
  const credentialIdStr = requiresCredential
    ? typeof credentialId === "number"
      ? String(credentialId)
      : typeof credentialId === "string" && credentialId !== ""
        ? credentialId
        : null
    : null;

  // Derive module_slug from node type (e.g. "mymodule.PickCity" → "mymodule").
  // Built-in nodes (no dot in type) do not send module_slug.
  const nodeType = nodes.find((n) => n.id === nodeId)?.type ?? "";
  const dotIndex = nodeType.indexOf(".");
  const moduleSlug = dotIndex > 0 ? nodeType.slice(0, dotIndex) : null;

  // Resolve dependency values
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

  // Build cache key
  const cacheKey = JSON.stringify({
    resource,
    credentialId: requiresCredential ? credentialIdStr : undefined,
    params: depValues,
    moduleSlug,
  });

  const [options, setOptions] = useState<OptionItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [customInput, setCustomInput] = useState("");

  // Track whether we've ever fetched for this cacheKey
  const fetchedKeyRef = useRef<string | null>(null);

  const currentValue = typeof data[dataKey] === "string" ? (data[dataKey] as string) : "";

  // Field is disabled when:
  //   - requiresCredential AND credential not yet chosen, OR
  //   - a dependency key is missing
  const isDisabled = (requiresCredential && !credentialIdStr) || !!missingDep;

  const disabledHint = requiresCredential && !credentialIdStr
    ? "Avval credential tanlang"
    : missingDep
      ? `Avval "${missingDep}" ni tanlang`
      : null;

  const fetchOptions = (forceRefresh = false) => {
    // Guard: if credential is required but not yet provided, or dep missing → skip
    if ((requiresCredential && !credentialIdStr) || missingDep) return;

    if (!forceRefresh && _optionsCache.has(cacheKey)) {
      setOptions(_optionsCache.get(cacheKey)!);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    // Build request body: include credential_id only when required; add
    // module_slug so the backend knows which module handles the resource.
    const body: Record<string, unknown> = { params: depValues };
    if (requiresCredential && credentialIdStr) {
      // Credential ids are UUID strings on the Go backend — do not coerce to Number.
      body.credential_id = credentialIdStr;
    }
    if (moduleSlug) {
      body.module_slug = moduleSlug;
    }

    // NOTE: /credentials/options/:resource does not exist on the Go backend
    // (internal/modules/credential/routes.go has no such route) — this call
    // will 404 until it's ported. Kept wired so the UI compiles.
    instanceAuth
      .post(`/credentials/options/${resource}`, body)
      .then(({ data: raw }) => {
        const r = (raw ?? {}) as Record<string, unknown>;
        // Support {options:[...]} and {data:{options:[...]}} envelopes
        const opts: OptionItem[] =
          Array.isArray(r.options)
            ? (r.options as OptionItem[])
            : Array.isArray((r.data as Record<string, unknown> | undefined)?.options)
              ? ((r.data as Record<string, unknown>).options as OptionItem[])
              : [];

        const apiError =
          typeof r.error === "string" ? r.error : null;

        _optionsCache.set(cacheKey, opts);
        setOptions(opts);
        if (apiError) {
          setError(apiError);
        }
      })
      .catch((err: unknown) => {
        const msg =
          err instanceof Error ? err.message : "Yuklab bo'lmadi";
        setError(msg);
        setOptions([]);
      })
      .finally(() => {
        setLoading(false);
        fetchedKeyRef.current = cacheKey;
      });
  };

  // Reload when credential / deps / module context change
  useEffect(() => {
    if (isDisabled) {
      setOptions(null);
      setError(null);
      return;
    }
    if (fetchedKeyRef.current === cacheKey && options !== null) return;
    fetchOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey, isDisabled]);

  const handleSelect = (val: string) => {
    updateNodeData(nodeId, { [dataKey]: val });
    setOpen(false);
  };

  const handleCustomSubmit = () => {
    const trimmed = customInput.trim();
    if (!trimmed) return;
    updateNodeData(nodeId, { [dataKey]: trimmed });
    setCustomInput("");
  };

  const selectedLabel = options?.find((o) => o.value === currentValue)?.label ?? currentValue;

  return (
    <div className="space-y-1.5">
      {label ? (
        <Label className="text-xs font-medium uppercase tracking-wide text-zinc-400">
          {label}
        </Label>
      ) : null}

      {isDisabled ? (
        <div className="flex items-center gap-2 rounded-md border border-white/10 bg-zinc-950/40 px-3 py-2 text-xs text-zinc-500">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {disabledHint}
        </div>
      ) : (
        <div className="flex items-center gap-1.5">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                disabled={loading}
                className="h-10 min-w-0 flex-1 justify-between border-white/10 bg-zinc-950/60 text-sm font-normal hover:bg-zinc-900/60"
              >
                <span className="truncate">
                  {loading ? (
                    <span className="flex items-center gap-1.5 text-zinc-500">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Yuklanmoqda...
                    </span>
                  ) : currentValue ? (
                    selectedLabel
                  ) : (
                    <span className="text-zinc-500">{placeholder}</span>
                  )}
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
              <Command>
                <CommandInput placeholder="Qidirish..." className="text-sm" />
                <CommandList>
                  {error ? (
                    <div className="flex items-center gap-2 px-3 py-2 text-xs text-red-400">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      {error}
                    </div>
                  ) : null}
                  <CommandEmpty className="py-4 text-center text-xs text-zinc-500">
                    {loading ? "Yuklanmoqda..." : "Hech narsa topilmadi"}
                  </CommandEmpty>
                  <CommandGroup>
                    {(options ?? []).map((opt) => (
                      <CommandItem
                        key={opt.value}
                        value={opt.value}
                        onSelect={() => handleSelect(opt.value)}
                        className="cursor-pointer text-sm"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4 shrink-0",
                            currentValue === opt.value ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {opt.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  {allowCustom ? (
                    <div className="border-t border-white/10 p-2">
                      <p className="mb-1.5 px-1 text-[10px] uppercase tracking-wide text-zinc-500">
                        Qo&apos;lda kiritish
                      </p>
                      <div className="flex gap-1">
                        <Input
                          value={customInput}
                          onChange={(e) => setCustomInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleCustomSubmit();
                              setOpen(false);
                            }
                          }}
                          placeholder="{{var}} yoki to'g'ridan-to'g'ri"
                          className="h-8 border-white/10 bg-zinc-950/60 text-xs"
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-8 px-2 text-xs"
                          onClick={() => {
                            handleCustomSubmit();
                            setOpen(false);
                          }}
                        >
                          OK
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Manual refresh button */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-10 w-10 shrink-0 text-zinc-500 hover:text-zinc-200"
            disabled={loading}
            title="Yangilash"
            onClick={() => {
              _optionsCache.delete(cacheKey);
              fetchedKeyRef.current = null;
              fetchOptions(true);
            }}
          >
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
          </Button>
        </div>
      )}

      {/* Show current typed/template value when not in the list */}
      {currentValue && !isDisabled && options && !options.find((o) => o.value === currentValue) ? (
        <p className="flex items-center gap-1 text-[11px] text-zinc-500">
          <span className="font-mono">{currentValue}</span>
          <span>(qo&apos;lda kiritilgan)</span>
        </p>
      ) : null}
    </div>
  );
}
