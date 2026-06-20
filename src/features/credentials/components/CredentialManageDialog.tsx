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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Shield, Pencil, Trash2, Plus, FlaskConical } from "lucide-react";
import toast from "react-hot-toast";
import { useCredentialStore, useCredentialTypesStore } from "@/features/credentials/store";
import { CredentialListItem } from "@/types/http/credential";
import { CredentialFormModal } from "@/features/credentials/components/CredentialFormModal";
import { cn } from "@/lib/utils";

interface CredentialManageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PAGE_SIZE = 15;

export function CredentialManageDialog({
  open,
  onOpenChange,
}: CredentialManageDialogProps) {
  const {
    credentials,
    total,
    loading,
    page,
    typeFilter,
    loadCredentials,
    setPage,
    setTypeFilter,
    deleteCredential,
    testCredential,
  } = useCredentialStore();
  const { types, loadTypes } = useCredentialTypesStore();

  const [pendingDelete, setPendingDelete] = useState<CredentialListItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [testing, setTesting] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<CredentialListItem | null>(null);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Load data whenever the dialog opens or filter/page changes
  useEffect(() => {
    if (!open) return;
    loadCredentials({ page, type: typeFilter });
  }, [open, page, typeFilter]);

  // Load types for filter dropdown
  useEffect(() => {
    if (open && !types) {
      loadTypes();
    }
  }, [open]);

  const handleFilterChange = (value: string) => {
    setTypeFilter(value === "all" ? "" : value);
  };

  const handleDeleteConfirm = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await deleteCredential(pendingDelete.id);
      toast.success("Credential o'chirildi");
      setPendingDelete(null);
    } catch {
      toast.error("O'chirishda xatolik yuz berdi");
    } finally {
      setDeleting(false);
    }
  };

  const handleTest = async (item: CredentialListItem) => {
    setTesting(item.id);
    try {
      const result = await testCredential(item.id);
      if (result?.ok) {
        toast.success("Credential ishlayapti!");
      } else {
        toast.error("Credential ishlamadi");
      }
    } catch {
      toast.error("Test xatoligi");
    } finally {
      setTesting(null);
    }
  };

  const handleEdit = (item: CredentialListItem) => {
    setEditItem(item);
    setFormOpen(true);
  };

  const handleCreate = () => {
    setEditItem(null);
    setFormOpen(true);
  };

  const handleFormSuccess = () => {
    loadCredentials({ page, type: typeFilter });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Credentials
            </DialogTitle>
            <DialogDescription>
              Autentifikatsiya ma&apos;lumotlari — barcha loyihalaringiz uchun umumiy
            </DialogDescription>
          </DialogHeader>

          {/* Toolbar: filter + actions */}
          <div className="flex items-center gap-2 pr-6">
            <Select
              value={typeFilter || "all"}
              onValueChange={handleFilterChange}
            >
              <SelectTrigger className="h-8 w-[180px] text-xs">
                <SelectValue placeholder="Turi bo'yicha filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Barcha turlar</SelectItem>
                {(types ?? []).map((t) => (
                  <SelectItem key={t.key} value={t.key} className="text-xs">
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex-1" />

            <Button size="sm" className="h-8 gap-1 text-xs" onClick={handleCreate}>
              <Plus className="h-3 w-3" />
              Qo&apos;shish
            </Button>
          </div>

          {/* List */}
          <div className="min-h-[160px] min-w-0 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : !credentials || credentials.length === 0 ? (
              <p className="text-center py-12 text-sm text-muted-foreground">
                {typeFilter
                  ? "Bu turdagi credential topilmadi"
                  : "Hozircha credential yo'q"}
              </p>
            ) : (
              <div className="max-h-[380px] overflow-y-auto pr-1">
                <div className="space-y-1.5">
                  {credentials.map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        "flex items-center gap-3 rounded-lg border px-4 py-3",
                        "group hover:bg-muted/40 transition-colors"
                      )}
                    >
                      <Shield className="h-4 w-4 shrink-0 text-muted-foreground" />

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.type?.label ?? item.type_key}
                        </p>
                      </div>

                      <span className="text-[10px] text-muted-foreground hidden sm:block">
                        {new Date(item.updated_at).toLocaleDateString()}
                      </span>

                      {/* Actions — shown on hover */}
                      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          title="Test"
                          disabled={testing === item.id}
                          onClick={() => handleTest(item)}
                        >
                          {testing === item.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <FlaskConical className="h-3.5 w-3.5" />
                          )}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          title="Tahrirlash"
                          onClick={() => handleEdit(item)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          title="O'chirish"
                          onClick={() => setPendingDelete(item)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 ? (
            <div className="flex items-center justify-center gap-2 pt-1">
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2 text-xs"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                ←
              </Button>
              <span className="text-xs text-muted-foreground">
                {page} / {totalPages}
              </span>
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2 text-xs"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                →
              </Button>
            </div>
          ) : null}

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Yopish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(v) => {
          if (!v && !deleting) setPendingDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Credential o&apos;chirish</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{pendingDelete?.name}&quot; credential&apos;ni o&apos;chirishni
              xohlaysizmi? Bu amalni bekor qilib bo&apos;lmaydi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Bekor qilish</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-1.5 h-4 w-4" />
              )}
              O&apos;chirish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create / Edit form */}
      <CredentialFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        editItem={editItem}
        onSuccess={handleFormSuccess}
      />
    </>
  );
}
