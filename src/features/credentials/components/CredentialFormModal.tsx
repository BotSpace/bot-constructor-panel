"use client";

import { useEffect, useState } from "react";
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
import { Loader2, Eye, EyeOff, ChevronLeft } from "lucide-react";
import toast from "react-hot-toast";
import { useCredentialTypesStore, useCredentialStore } from "@/features/credentials/store";
import {
  CredentialType,
  CredentialListItem,
  CredentialFieldDef,
} from "@/types/http/credential";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function maskLabel(value: string | null | undefined): string {
  if (!value) return "";
  // Backend returns "••••last4" style — just show it as placeholder hint
  return value;
}

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
    isEdit && isSecret ? "Unchanged (empty = keep existing)" : field.label;

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

  if (field.type === "textarea") {
    return (
      <Textarea
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
      />
    );
  }

  if (field.type === "password") {
    return (
      <div className="relative">
        <Input
          type={show ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pr-9"
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

  return (
    <Input
      type={field.type === "number" ? "number" : "text"}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

// ---------------------------------------------------------------------------
// Step 1 — pick credential type
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
        placeholder="Credential turi qidirish..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        autoFocus
      />
      <div className="max-h-[320px] overflow-y-auto space-y-1 pr-1">
        {filtered.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">
            Hech narsa topilmadi
          </p>
        ) : (
          filtered.map((type) => (
            <button
              key={type.key}
              type="button"
              onClick={() => onSelect(type)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg border px-4 py-3",
                "text-left hover:bg-muted/40 transition-colors"
              )}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{type.label}</p>
                <p className="text-xs text-muted-foreground">{type.mode}</p>
              </div>
              {type.system && (
                <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                  Tizimiy
                </span>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 2 — credential data form
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
          placeholder={`Masalan: My ${type.label}`}
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          autoFocus
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
// Main modal
// ---------------------------------------------------------------------------

interface CredentialFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pass existing credential to enter edit mode */
  editItem?: CredentialListItem | null;
  /** Called after successful create/update */
  onSuccess?: (credential: CredentialListItem) => void;
}

export function CredentialFormModal({
  open,
  onOpenChange,
  editItem,
  onSuccess,
}: CredentialFormModalProps) {
  const { types, typesLoading, loadTypes } = useCredentialTypesStore();
  const { createCredential, updateCredential } = useCredentialStore();

  const isEdit = Boolean(editItem);

  // Step 1 = type picker, step 2 = data form
  const [step, setStep] = useState<1 | 2>(isEdit ? 2 : 1);
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

      // Find the matching type from loaded types
      const matchedType = types?.find((t) => t.key === editItem.type.key) ?? null;
      setSelectedType(matchedType);

      // Seed field values from masked data (show masked placeholders)
      const initialValues: Record<string, string> = {};
      if (editItem.data) {
        Object.entries(editItem.data).forEach(([k, v]) => {
          // For masked (secret) fields, leave empty so user can type new value
          // or leave blank to keep existing
          initialValues[k] = isMasked(v) ? "" : (v ?? "");
        });
      }
      setFieldValues(initialValues);
    } else {
      setStep(1);
      setSelectedType(null);
      setName("");
      setFieldValues({});
    }
  }, [open, isEdit, editItem?.id]);

  // Load types on open
  useEffect(() => {
    if (open && !types && !typesLoading) {
      loadTypes();
    }
  }, [open]);

  // When type is selected in edit mode, also load
  useEffect(() => {
    if (open && types && isEdit && editItem) {
      const matched = types.find((t) => t.key === editItem.type.key) ?? null;
      if (matched && !selectedType) setSelectedType(matched);
    }
  }, [types, open]);

  const handleTypeSelect = (type: CredentialType) => {
    setSelectedType(type);
    // Pre-fill defaults
    const defaults: Record<string, string> = {};
    type.fields.forEach((f) => {
      if (f.default !== undefined && f.default !== null) {
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
      const val = fieldValues[field.name] ?? "";
      // In edit mode, if secret field is empty => keep existing (ok)
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
      // Build data: skip empty secret fields in edit mode
      const data: Record<string, string | number> = {};
      selectedType!.fields.forEach((f) => {
        const val = fieldValues[f.name] ?? "";
        if (isEdit && f.secret && !val) return; // keep existing
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step === 2 && !isEdit ? (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="mr-1 text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            ) : null}
            {isEdit
              ? "Credential tahrirlash"
              : step === 1
                ? "Credential turi tanlang"
                : selectedType
                  ? selectedType.label
                  : "Credential yaratish"}
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
            <DataForm
              type={selectedType}
              name={name}
              onNameChange={setName}
              fieldValues={fieldValues}
              onFieldChange={handleFieldChange}
              isEdit={isEdit}
            />
          ) : (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>

        {step === 2 ? (
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
