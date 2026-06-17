"use client";

import { useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useCredentialTypesStore } from "@/features/credentials/store";
import {
  CredentialFieldDef,
  CredentialFieldType,
  CredentialMode,
  CredentialType,
} from "@/types/http/credential";

const MODES: { value: CredentialMode; label: string }[] = [
  { value: "apikey", label: "API Key" },
  { value: "bearer", label: "Bearer Token" },
  { value: "header", label: "Header Auth" },
  { value: "basic", label: "Basic Auth" },
  { value: "none", label: "None (Custom)" },
];

const FIELD_TYPES: { value: CredentialFieldType; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "password", label: "Password" },
  { value: "number", label: "Number" },
  { value: "select", label: "Select" },
  { value: "textarea", label: "Textarea" },
];

function emptyField(): CredentialFieldDef {
  return {
    name: "",
    label: "",
    type: "text",
    secret: false,
    required: false,
    default: "",
  };
}

interface CustomTypeBuilderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (type: CredentialType) => void;
}

export function CustomTypeBuilderModal({
  open,
  onOpenChange,
  onSuccess,
}: CustomTypeBuilderModalProps) {
  const { createType } = useCredentialTypesStore();

  const [key, setKey] = useState("");
  const [label, setLabel] = useState("");
  const [icon, setIcon] = useState("");
  const [mode, setMode] = useState<CredentialMode>("apikey");
  const [fields, setFields] = useState<CredentialFieldDef[]>([emptyField()]);
  const [saving, setSaving] = useState(false);

  const handleReset = () => {
    setKey("");
    setLabel("");
    setIcon("");
    setMode("apikey");
    setFields([emptyField()]);
  };

  const addField = () => setFields((f) => [...f, emptyField()]);

  const removeField = (index: number) =>
    setFields((f) => f.filter((_, i) => i !== index));

  const updateField = (index: number, patch: Partial<CredentialFieldDef>) =>
    setFields((f) => f.map((item, i) => (i === index ? { ...item, ...patch } : item)));

  const validate = (): string | null => {
    if (!key.trim()) return "Kalit (key) kiritilishi shart";
    if (!/^[a-z0-9_]+$/.test(key)) return "Key faqat kichik harf, raqam va _ dan iborat bo'lishi kerak";
    if (!label.trim()) return "Label kiritilishi shart";
    for (let i = 0; i < fields.length; i++) {
      const f = fields[i];
      if (!f.name.trim()) return `Field #${i + 1}: name kiritilishi shart`;
      if (!/^[a-z0-9_]+$/.test(f.name)) return `Field #${i + 1}: name faqat kichik harf, raqam va _ dan iborat bo'lishi kerak`;
      if (!f.label.trim()) return `Field #${i + 1}: label kiritilishi shart`;
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
      const created = await createType({
        key: key.trim(),
        label: label.trim(),
        icon: icon.trim() || undefined,
        mode,
        fields: fields.map((f) => ({
          ...f,
          name: f.name.trim(),
          label: f.label.trim(),
          default: f.default === "" ? undefined : f.default,
        })),
      });
      toast.success("Credential turi yaratildi");
      handleReset();
      onSuccess?.(created);
      onOpenChange(false);
    } catch {
      toast.error("Credential turi yaratishda xatolik");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!saving) {
          if (!v) handleReset();
          onOpenChange(v);
        }
      }}
    >
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Yangi Credential turi</DialogTitle>
          <DialogDescription>
            Maxsus autentifikatsiya turini yarating
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Basic info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Key <span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="my_api_service"
                value={key}
                onChange={(e) => setKey(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Label <span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="My API Service"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Icon</Label>
              <Input
                placeholder="key"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Mode <span className="text-destructive">*</span>
              </Label>
              <Select value={mode} onValueChange={(v) => setMode(v as CredentialMode)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MODES.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Fields editor */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Maydonlar</Label>
              <Button type="button" size="sm" variant="outline" onClick={addField} className="h-7 gap-1">
                <Plus className="h-3 w-3" />
                Qo&apos;shish
              </Button>
            </div>

            {fields.map((field, index) => (
              <div
                key={index}
                className="rounded-lg border bg-muted/30 p-3 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    Field #{index + 1}
                  </span>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => removeField(index)}
                    className="h-6 w-6 text-destructive hover:text-destructive"
                    disabled={fields.length === 1}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">Name *</Label>
                    <Input
                      className="h-7 text-xs"
                      placeholder="field_name"
                      value={field.name}
                      onChange={(e) =>
                        updateField(index, {
                          name: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">Label *</Label>
                    <Input
                      className="h-7 text-xs"
                      placeholder="Field Label"
                      value={field.label}
                      onChange={(e) => updateField(index, { label: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">Type</Label>
                    <Select
                      value={field.type}
                      onValueChange={(v) => updateField(index, { type: v as CredentialFieldType })}
                    >
                      <SelectTrigger className="h-7 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FIELD_TYPES.map((ft) => (
                          <SelectItem key={ft.value} value={ft.value} className="text-xs">
                            {ft.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">Default</Label>
                    <Input
                      className="h-7 text-xs"
                      placeholder="Default qiymat"
                      value={String(field.default ?? "")}
                      onChange={(e) => updateField(index, { default: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex cursor-pointer items-center gap-1.5 text-xs">
                    <Checkbox
                      checked={Boolean(field.secret)}
                      onCheckedChange={(v) => updateField(index, { secret: v === true })}
                    />
                    Secret
                  </label>
                  <label className="flex cursor-pointer items-center gap-1.5 text-xs">
                    <Checkbox
                      checked={Boolean(field.required)}
                      onCheckedChange={(v) => updateField(index, { required: v === true })}
                    />
                    Required
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Bekor qilish
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : null}
            Yaratish
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
