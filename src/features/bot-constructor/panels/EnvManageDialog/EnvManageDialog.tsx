"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  getEnvList,
  createEnv,
  deleteEnv,
} from "@/services/requests/enviroment";
import { Env } from "@/types/http/env";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Key,
  Save,
  X,
  Eye,
  EyeOff,
  Lock,
} from "lucide-react";
import toast from "react-hot-toast";

interface EnvManageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string | number;
}

interface EditingEnv {
  id: string | null;
  key: string;
  value: string;
  secret: boolean;
}

const MASKED = "••••••••";

export function EnvManageDialog({
  open,
  onOpenChange,
  projectId,
}: EnvManageDialogProps) {
  const [envList, setEnvList] = useState<Env[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<EditingEnv | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [visibleIds, setVisibleIds] = useState<Set<string>>(new Set());
  const [showEditValue, setShowEditValue] = useState(false);

  const fetchEnvs = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const res = await getEnvList(String(projectId));
      setEnvList(res);
    } catch {
      toast.error("Kalitlarni yuklashda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (open) {
      fetchEnvs();
      setEditing(null);
      setVisibleIds(new Set());
      setShowEditValue(false);
    }
  }, [open, fetchEnvs]);

  const handleStartCreate = () => {
    setEditing({ id: null, key: "", value: "", secret: false });
    setShowEditValue(true);
  };

  const handleStartEdit = (env: Env) => {
    setEditing({ id: env.id, key: env.key, value: "", secret: env.secret });
    setShowEditValue(false);
  };

  const handleCancelEdit = () => {
    setEditing(null);
    setShowEditValue(false);
  };

  const handleSave = async () => {
    if (!editing) return;

    const trimmedKey = editing.key.trim();
    const trimmedValue = editing.value.trim();

    if (!trimmedKey) {
      toast.error("Kalit nomi bo'sh bo'lishi mumkin emas");
      return;
    }

    // The new backend has no PATCH — POST is upsert-only and requires a
    // value every time (it never echoes back a secret's plaintext to
    // prefill from), so both create and edit must supply a fresh value.
    if (!trimmedValue) {
      toast.error("Qiymat bo'sh bo'lishi mumkin emas");
      return;
    }

    setSaving(true);
    try {
      await createEnv({
        key: trimmedKey,
        value: trimmedValue,
        secret: editing.secret,
        project: String(projectId),
      });
      toast.success(
        editing.id === null
          ? "Kalit muvaffaqiyatli qo'shildi"
          : "Kalit muvaffaqiyatli yangilandi"
      );
      setEditing(null);
      setShowEditValue(false);
      await fetchEnvs();
    } catch {
      toast.error(
        editing.id === null
          ? "Kalit qo'shishda xatolik yuz berdi"
          : "Kalitni yangilashda xatolik yuz berdi"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (env: Env) => {
    setDeletingId(env.id);
    try {
      await deleteEnv(env.key);
      toast.success("Kalit muvaffaqiyatli o'chirildi");
      setEnvList((prev) => prev.filter((e) => e.id !== env.id));
      if (editing?.id === env.id) setEditing(null);
    } catch {
      toast.error("Kalitni o'chirishda xatolik yuz berdi");
    } finally {
      setDeletingId(null);
    }
  };

  const toggleVisible = (id: string) => {
    setVisibleIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const displayValue = (env: Env) => {
    if (env.secret) {
      return visibleIds.has(env.id) ? env.value : MASKED;
    }
    return env.value;
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange} modal={false}>
      <SheetContent
        side="right"
        showOverlay={false}
        onInteractOutside={() => onOpenChange(false)}
        className="w-full sm:max-w-[480px] flex flex-col gap-0 p-0 overflow-hidden"
      >
        <SheetHeader className="shrink-0 border-b px-5 py-4 gap-0 space-y-0">
          <div className="flex items-center gap-3">
            <Key className="h-5 w-5 shrink-0" />
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-base font-semibold leading-tight">
                Kalitlarni boshqarish
              </SheetTitle>
              <SheetDescription className="text-xs">
                Loyiha muhit o&apos;zgaruvchilari
              </SheetDescription>
            </div>
            <Button
              size="sm"
              onClick={handleStartCreate}
              disabled={editing !== null}
            >
              <Plus className="w-4 h-4 mr-1" />
              Yangi
            </Button>
          </div>
        </SheetHeader>

        <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 space-y-4">
          {/* Add/Edit form */}
          {editing && (
            <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
              <p className="text-sm font-medium">
                {editing.id === null
                  ? "Yangi kalit qo'shish"
                  : "Kalitni tahrirlash"}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="Kalit nomi (masalan: API_KEY)"
                  value={editing.key}
                  onChange={(e) =>
                    setEditing({ ...editing, key: e.target.value })
                  }
                  disabled={saving}
                  autoFocus
                />
                <div className="relative">
                  <Input
                    placeholder="Qiymati"
                    type={showEditValue ? "text" : "password"}
                    value={editing.value}
                    onChange={(e) =>
                      setEditing({ ...editing, value: e.target.value })
                    }
                    disabled={saving}
                    className="pr-9"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSave();
                      if (e.key === "Escape") handleCancelEdit();
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditValue((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showEditValue ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Secret toggle */}
              <div className="flex items-center gap-2">
                <Switch
                  id="secret-toggle"
                  checked={editing.secret}
                  onCheckedChange={(checked) =>
                    setEditing({ ...editing, secret: checked })
                  }
                  disabled={saving}
                />
                <Label
                  htmlFor="secret-toggle"
                  className="flex items-center gap-1.5 cursor-pointer text-sm"
                >
                  <Lock className="w-3.5 h-3.5" />
                  Maxfiy (qiymatni API da yashirish)
                </Label>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelEdit}
                  disabled={saving}
                >
                  <X className="w-4 h-4 mr-1" />
                  Bekor qilish
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={saving || !editing.key.trim() || !editing.value.trim()}
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-1" />
                  )}
                  Saqlash
                </Button>
              </div>
            </div>
          )}

          {/* List */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : envList.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Hozircha kalitlar yo&apos;q. Yangi kalit qo&apos;shish uchun
              &quot;+&quot; tugmasini bosing.
            </div>
          ) : (
            <div className="space-y-2">
              {envList.map((env) => (
                  <div
                    key={env.id}
                    className="flex items-center gap-3 rounded-lg border px-4 py-3 group hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-mono font-medium truncate">
                          {env.key}
                        </p>
                        {env.secret && (
                          <Lock className="w-3 h-3 text-muted-foreground shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground font-mono truncate">
                        {displayValue(env)}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* Show/hide toggle — only for secret vars; non-secret always readable */}
                      {env.secret && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => toggleVisible(env.id)}
                          title={
                            visibleIds.has(env.id)
                              ? "Qiymatni yashirish"
                              : "Qiymatni ko'rsatish"
                          }
                        >
                          {visibleIds.has(env.id) ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleStartEdit(env)}
                        disabled={saving}
                        title="Tahrirlash"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDelete(env)}
                        disabled={deletingId === env.id}
                        title="O'chirish"
                        className="text-destructive hover:text-destructive"
                      >
                        {deletingId === env.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
