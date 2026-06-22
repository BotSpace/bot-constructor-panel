"use client";

import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Loader2,
  Eye,
  EyeOff,
  ChevronLeft,
  Key,
  Shield,
  Mail,
  Table,
  Folder,
  Send,
  User,
  Globe,
  List,
  Bot,
  Sparkles,
  Boxes,
  LucideIcon,
  ExternalLink,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";
import { instanceAuth } from "@/services/instance";
import { useCredentialTypesStore, useCredentialStore } from "@/features/credentials/store";
import {
  CredentialType,
  CredentialListItem,
  CredentialFieldDef,
  CredentialSource,
} from "@/types/http/credential";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Icon map: registry icon string → lucide component
// ---------------------------------------------------------------------------

const ICON_MAP: Record<string, LucideIcon> = {
  key: Key,
  shield: Shield,
  mail: Mail,
  table: Table,
  folder: Folder,
  send: Send,
  user: User,
  globe: Globe,
  list: List,
  bot: Bot,
  sparkles: Sparkles,
  boxes: Boxes,
};

function getTypeIcon(iconName: string | undefined): LucideIcon {
  if (!iconName) return Key;
  return ICON_MAP[iconName] ?? Key;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isMasked(value: string | null | undefined): boolean {
  return typeof value === "string" && value.startsWith("••••");
}

// ---------------------------------------------------------------------------
// Dynamic field renderer
// ---------------------------------------------------------------------------

interface FieldRendererProps {
  field: CredentialFieldDef;
  value: string;
  isEdit: boolean;
  onChange: (v: string) => void;
}

function FieldRenderer({ field, value, isEdit, onChange }: FieldRendererProps) {
  const [show, setShow] = useState(false);

  const isSecret = field.secret === true;
  const placeholder =
    isEdit && isSecret ? "O'zgarishsiz qoldirish uchun bo'sh qoldiring" : (field.label ?? "");

  // select
  if (field.type === "select" && field.options?.length) {
    return (
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder={`${field.label} tanlang`} />
        </SelectTrigger>
        <SelectContent>
          {field.options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  // textarea
  if (field.type === "textarea") {
    return (
      <Textarea
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        autoComplete="off"
        data-1p-ignore="true"
        data-lpignore="true"
        data-bwignore="true"
      />
    );
  }

  // password or secret
  if (field.type === "password" || isSecret) {
    return (
      <div className="relative">
        <Input
          type={show ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pr-9"
          autoComplete="new-password"
          data-1p-ignore="true"
          data-lpignore="true"
          data-bwignore="true"
        />
        <button
          type="button"
          tabIndex={-1}
          className="absolute inset-y-0 right-2 flex items-center text-muted-foreground hover:text-foreground"
          onClick={() => setShow((s) => !s)}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    );
  }

  // switch / toggle (bool stored as "true"/"false")
  if (field.type === "switch") {
    const checked = value === "true";
    return (
      <div className="flex items-center gap-2 h-9">
        <Switch
          checked={checked}
          onCheckedChange={(v) => onChange(v ? "true" : "false")}
          id={`field-switch-${field.name}`}
        />
        <label
          htmlFor={`field-switch-${field.name}`}
          className="text-sm text-muted-foreground cursor-pointer select-none"
        >
          {checked ? "Yoqilgan" : "O'chirilgan"}
        </label>
      </div>
    );
  }

  // url
  if (field.type === "url") {
    return (
      <Input
        type="url"
        placeholder={placeholder || "https://..."}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="off"
        data-1p-ignore="true"
        data-lpignore="true"
        data-bwignore="true"
      />
    );
  }

  // number
  if (field.type === "number") {
    return (
      <Input
        type="number"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="off"
        data-1p-ignore="true"
        data-lpignore="true"
        data-bwignore="true"
      />
    );
  }

  // text (default)
  return (
    <Input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      autoComplete="off"
      data-1p-ignore="true"
      data-lpignore="true"
      data-bwignore="true"
    />
  );
}

// ---------------------------------------------------------------------------
// Source badge helper
// ---------------------------------------------------------------------------

const SOURCE_BADGE: Record<
  NonNullable<CredentialSource>,
  { label: string; className: string }
> = {
  system: { label: "System", className: "bg-muted text-muted-foreground" },
  admin: { label: "Admin", className: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  module: { label: "Modul", className: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
};

// ---------------------------------------------------------------------------
// Step 1 — card grid type picker
// ---------------------------------------------------------------------------

function TypePicker({
  types,
  onSelect,
}: {
  types: CredentialType[];
  onSelect: (type: CredentialType) => void;
}) {
  const [search, setSearch] = useState("");
  const filtered = types.filter(
    (t) =>
      t.label.toLowerCase().includes(search.toLowerCase()) ||
      t.key.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-3">
      <Input
        type="text"
        name="credential-type-search"
        placeholder="Credential turi qidirish..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        autoFocus
        autoComplete="off"
        data-1p-ignore="true"
        data-lpignore="true"
        data-bwignore="true"
      />
      <div className="max-h-[320px] overflow-y-auto pr-0.5">
        {filtered.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">
            Hech narsa topilmadi
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {filtered.map((type) => {
              const Icon = getTypeIcon(type.icon);
              const color = type.color || undefined;
              const sourceBadge = type.source && type.source !== "system"
                ? SOURCE_BADGE[type.source]
                : null;
              return (
                <button
                  key={type.key}
                  type="button"
                  onClick={() => onSelect(type)}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg border p-3 text-left",
                    "hover:bg-muted/50 hover:border-primary/40 transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  )}
                >
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted"
                    style={color ? { backgroundColor: `${color}1A` } : undefined}
                  >
                    <Icon className="h-5 w-5" style={color ? { color } : undefined} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[12px] font-medium leading-tight line-clamp-2">
                      {type.label}
                    </span>
                    {sourceBadge ? (
                      <span
                        className={cn(
                          "mt-0.5 inline-flex items-center rounded px-1 py-px text-[10px] font-medium leading-none",
                          sourceBadge.className
                        )}
                      >
                        {sourceBadge.label}
                      </span>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 2a — credential data form (non-oauth types)
// ---------------------------------------------------------------------------

interface DataFormProps {
  type: CredentialType;
  name: string;
  onNameChange: (v: string) => void;
  fieldValues: Record<string, string>;
  onFieldChange: (name: string, value: string) => void;
  isEdit: boolean;
}

function DataForm({
  type,
  name,
  onNameChange,
  fieldValues,
  onFieldChange,
  isEdit,
}: DataFormProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Credential nomi</Label>
        <Input
          name="credential-name"
          placeholder={`Masalan: My ${type.label}`}
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          autoFocus
          autoComplete="off"
          data-1p-ignore="true"
          data-lpignore="true"
          data-bwignore="true"
        />
      </div>

      {type.fields.map((field) => (
        <div key={field.name} className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">
            {field.label}
            {field.required ? (
              <span className="ml-1 text-destructive">*</span>
            ) : null}
          </Label>
          <FieldRenderer
            field={field}
            value={fieldValues[field.name] ?? ""}
            isEdit={isEdit}
            onChange={(v) => onFieldChange(field.name, v)}
          />
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 2b — OAuth2 connect panel
// ---------------------------------------------------------------------------

interface OAuthConnectProps {
  type: CredentialType;
  /** When editing, the existing credential's account email (if available) */
  accountEmail?: string | null;
  onSuccess: () => void;
}

function OAuthConnect({ type, accountEmail, onSuccess }: OAuthConnectProps) {
  const [connecting, setConnecting] = useState(false);
  const cleanupRef = useRef<(() => void) | null>(null);

  // Tear down listeners/timers/popup on unmount
  useEffect(() => {
    return () => {
      cleanupRef.current?.();
      cleanupRef.current = null;
    };
  }, []);

  const handleConnect = async () => {
    if (connecting) return;
    setConnecting(true);

    let settled = false;
    const finish = (ok: boolean, errMsg?: string | null) => {
      if (settled) return;
      settled = true;
      cleanupRef.current?.();
      cleanupRef.current = null;
      setConnecting(false);
      if (ok) {
        toast.success("Muvaffaqiyatli ulandi");
        onSuccess();
      } else if (errMsg) {
        toast.error(errMsg);
      }
    };

    const fetchList = async (): Promise<CredentialListItem[]> => {
      const { data } = await instanceAuth.get(`/v1/credentials/`, {
        params: { type_key: type.key, page: 1, page_size: 50 },
      });
      const raw = (data ?? {}) as Record<string, unknown>;
      const inner = raw.data as Record<string, unknown> | undefined;
      const candidates: unknown[] = [raw.results, inner?.results, inner, data];
      return (candidates.find(Array.isArray) as CredentialListItem[] | undefined) ?? [];
    };

    try {
      const { data } = await instanceAuth.post(
        `/v1/credentials/oauth/${type.provider}/start/`,
        { type_key: type.key }
      );
      const payload = (data?.data ?? data) as { authorize_url?: string };
      const authorizeUrl = payload?.authorize_url;

      if (!authorizeUrl) {
        toast.error("OAuth URL olinmadi");
        setConnecting(false);
        return;
      }

      // Snapshot existing credentials of this type so we can detect the new/updated one.
      const snapshot = new Set<string>();
      try {
        (await fetchList()).forEach((c) =>
          snapshot.add(`${c.id}:${c.updated_at}`)
        );
      } catch {
        /* empty snapshot still works */
      }

      const popup = window.open(authorizeUrl, "oauth", "width=520,height=640");

      // Fast path: postMessage from the callback page. Google sets COOP on its consent
      // pages which severs window.opener, so this often never arrives — the poll below
      // is the reliable path.
      const handler = (e: MessageEvent) => {
        if (!e.data || e.data.type !== "credential-oauth") return;
        if (e.data.ok === true) finish(true);
        else
          finish(
            false,
            e.data.error ? `OAuth xatoligi: ${e.data.error}` : "OAuth ulashda xatolik"
          );
      };
      window.addEventListener("message", handler);

      // Reliable path: poll the backend until a credential for this type appears/updates.
      const poll = setInterval(async () => {
        try {
          const now = await fetchList();
          if (now.some((c) => !snapshot.has(`${c.id}:${c.updated_at}`))) {
            finish(true);
          }
        } catch {
          /* keep polling */
        }
      }, 2500);

      // If the user closes the popup, give the poll a few cycles, then silently cancel.
      let graceTicks = 0;
      const closeWatch = setInterval(() => {
        if (popup?.closed && ++graceTicks >= 8) finish(false, null);
      }, 500);

      const timeout = setTimeout(() => finish(false, null), 180000);

      cleanupRef.current = () => {
        window.removeEventListener("message", handler);
        clearInterval(poll);
        clearInterval(closeWatch);
        clearTimeout(timeout);
        try {
          popup?.close();
        } catch {
          /* close may be blocked — harmless */
        }
      };
    } catch {
      finish(false, "OAuth boshlanmadi");
    }
  };

  const Icon = getTypeIcon(type.icon);
  const isReconnect = Boolean(accountEmail);

  return (
    <div className="flex flex-col items-center justify-center gap-5 py-6">
      <div className="flex h-14 w-14 items-center justify-center rounded-xl border bg-muted">
        <Icon className="h-7 w-7 text-foreground" />
      </div>

      {isReconnect ? (
        <div className="flex flex-col items-center gap-1 text-center">
          <div className="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400">
            <CheckCircle2 className="h-4 w-4" />
            <span>Ulangan</span>
          </div>
          {accountEmail ? (
            <p className="text-xs text-muted-foreground">{accountEmail}</p>
          ) : null}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center max-w-[260px]">
          {type.label} ga ulanish uchun quyidagi tugmani bosing
        </p>
      )}

      <Button
        onClick={handleConnect}
        disabled={connecting}
        variant={isReconnect ? "outline" : "default"}
        className="gap-2"
      >
        {connecting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isReconnect ? (
          <RefreshCw className="h-4 w-4" />
        ) : (
          <ExternalLink className="h-4 w-4" />
        )}
        {connecting
          ? "Kutilmoqda..."
          : isReconnect
            ? "Qayta ulash"
            : `${type.label} bilan ulash`}
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main modal
// ---------------------------------------------------------------------------

interface CredentialFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pass existing credential to enter edit mode */
  editItem?: CredentialListItem | null;
  /** Called after successful create/update */
  onSuccess?: (credential?: CredentialListItem) => void;
  /**
   * When set, skips the type-picker step and locks the form to this
   * credential type key (e.g. "telegram", "openai"). The user cannot
   * change the type.
   */
  lockedTypeKey?: string;
}

export function CredentialFormModal({
  open,
  onOpenChange,
  editItem,
  onSuccess,
  lockedTypeKey,
}: CredentialFormModalProps) {
  const { types, typesLoading, loadTypes } = useCredentialTypesStore();
  const { createCredential, updateCredential, loadCredentials } = useCredentialStore();

  const isEdit = Boolean(editItem);

  // Step 1 = type picker, step 2 = data form (or oauth connect).
  // When lockedTypeKey is provided we go straight to step 2.
  const [step, setStep] = useState<1 | 2>(isEdit || lockedTypeKey ? 2 : 1);
  const [selectedType, setSelectedType] = useState<CredentialType | null>(null);
  const [name, setName] = useState("");
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (!open) return;

    if (isEdit && editItem) {
      setStep(2);
      setName(editItem.name);

      const matchedType = types?.find((t) => t.key === (editItem.type?.key ?? editItem.type_key)) ?? null;
      setSelectedType(matchedType);

      const initialValues: Record<string, string> = {};
      if (editItem.data) {
        Object.entries(editItem.data).forEach(([k, v]) => {
          initialValues[k] = isMasked(v) ? "" : (v ?? "");
        });
      }
      setFieldValues(initialValues);
    } else {
      const lockedType = lockedTypeKey
        ? (types?.find((t) => t.key === lockedTypeKey) ?? null)
        : null;
      setStep(lockedTypeKey ? 2 : 1);
      setSelectedType(lockedType);
      setName("");
      if (lockedType) {
        const defaults: Record<string, string> = {};
        lockedType.fields.forEach((f) => {
          if (f.default !== undefined && f.default !== null) {
            defaults[f.name] = String(f.default);
          }
        });
        setFieldValues(defaults);
      } else {
        setFieldValues({});
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isEdit, editItem?.id, lockedTypeKey]);

  // Load types on open
  useEffect(() => {
    if (open && !types && !typesLoading) {
      loadTypes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // When types load in edit mode, resolve the type object
  useEffect(() => {
    if (open && types && isEdit && editItem) {
      const matched = types.find((t) => t.key === (editItem.type?.key ?? editItem.type_key)) ?? null;
      if (matched && !selectedType) setSelectedType(matched);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [types, open]);

  // Resolve locked type once types list arrives
  useEffect(() => {
    if (!open || !lockedTypeKey || !types || selectedType) return;
    const matched = types.find((t) => t.key === lockedTypeKey) ?? null;
    if (matched) {
      setSelectedType(matched);
      setStep(2);
      const defaults: Record<string, string> = {};
      matched.fields.forEach((f) => {
        if (f.default !== undefined && f.default !== null) {
          defaults[f.name] = String(f.default);
        }
      });
      setFieldValues((prev) => ({ ...defaults, ...prev }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [types, open, lockedTypeKey]);

  const handleTypeSelect = (type: CredentialType) => {
    setSelectedType(type);
    const defaults: Record<string, string> = {};
    type.fields.forEach((f) => {
      if (f.type === "switch") {
        // switch defaults to "false" unless explicitly set
        defaults[f.name] = f.default !== undefined && f.default !== null
          ? String(f.default)
          : "false";
      } else if (f.default !== undefined && f.default !== null) {
        defaults[f.name] = String(f.default);
      }
    });
    setFieldValues(defaults);
    setStep(2);
  };

  const handleFieldChange = (fieldName: string, value: string) => {
    setFieldValues((prev) => ({ ...prev, [fieldName]: value }));
  };

  const validate = (): string | null => {
    if (!name.trim()) return "Credential nomi kiritilishi shart";
    if (!selectedType) return "Credential turi tanlanmagan";

    for (const field of selectedType.fields) {
      if (!field.required) continue;
      // switch always has a value ("true"/"false") — skip required check
      if (field.type === "switch") continue;
      const val = fieldValues[field.name] ?? "";
      if (!val && isEdit && field.secret) continue;
      if (!val) return `"${field.label}" maydoni to'ldirilishi shart`;
    }
    return null;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) {
      toast.error(err);
      return;
    }

    setSaving(true);
    try {
      const data: Record<string, string | number | boolean> = {};
      selectedType!.fields.forEach((f) => {
        const val = fieldValues[f.name] ?? "";
        if (isEdit && f.secret && !val) return;
        if (f.type === "switch") {
          // Always send boolean for switch fields
          data[f.name] = val === "true";
          return;
        }
        if (val !== "") {
          data[f.name] = f.type === "number" ? Number(val) : val;
        }
      });

      let result: CredentialListItem;
      if (isEdit && editItem) {
        result = await updateCredential(editItem.id, { name: name.trim(), data });
        toast.success("Credential yangilandi");
      } else {
        result = await createCredential({
          name: name.trim(),
          type_key: selectedType!.key,
          data,
        });
        toast.success("Credential yaratildi");
      }

      onSuccess?.(result);
      onOpenChange(false);
    } catch {
      toast.error(isEdit ? "Credential yangilashda xatolik" : "Credential yaratishda xatolik");
    } finally {
      setSaving(false);
    }
  };

  // Resolve whether current type is oauth2
  const isOAuth2 = selectedType?.mode === "oauth2";

  // For oauth edit mode: find account_email from editItem.data
  const accountEmail =
    isEdit && editItem?.data?.account_email
      ? (editItem.data.account_email ?? null)
      : null;

  // OAuth success: close modal + refresh list + call parent
  const handleOAuthSuccess = () => {
    loadCredentials();
    onSuccess?.();
    onOpenChange(false);
  };

  // Dialog title
  const dialogTitle = isEdit
    ? "Credential tahrirlash"
    : step === 1
      ? "Credential turi tanlang"
      : selectedType
        ? selectedType.label
        : "Credential yaratish";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step === 2 && !isEdit && !lockedTypeKey ? (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="mr-1 text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            ) : null}
            {dialogTitle}
          </DialogTitle>
          {step === 1 ? (
            <DialogDescription>
              Autentifikatsiya turini tanlang
            </DialogDescription>
          ) : null}
        </DialogHeader>

        <div className="min-h-[120px]">
          {step === 1 ? (
            typesLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <TypePicker types={types ?? []} onSelect={handleTypeSelect} />
            )
          ) : selectedType ? (
            isOAuth2 ? (
              <OAuthConnect
                type={selectedType}
                accountEmail={accountEmail}
                onSuccess={handleOAuthSuccess}
              />
            ) : (
              <DataForm
                type={selectedType}
                name={name}
                onNameChange={setName}
                fieldValues={fieldValues}
                onFieldChange={handleFieldChange}
                isEdit={isEdit}
              />
            )
          ) : (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Footer: only show Save/Create for non-oauth data forms */}
        {step === 2 && !isOAuth2 ? (
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              Bekor qilish
            </Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : null}
              {isEdit ? "Saqlash" : "Yaratish"}
            </Button>
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
