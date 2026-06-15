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
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCollectionStore } from "@/features/collections/store/collection-list";
import { CollectionListItem } from "@/types/http/collection";
import { Database, Loader2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";

interface CollectionManageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CollectionManageDialog({
  open,
  onOpenChange,
}: CollectionManageDialogProps) {
  const t = useTranslations("collections");
  const { id: projectId } = useParams<{ id: string }>();

  const { data: collections, loading, loadCollections, deleteCollection } =
    useCollectionStore();

  // The collection pending deletion; null means no dialog open
  const [pendingDelete, setPendingDelete] = useState<CollectionListItem | null>(
    null
  );
  const [deleting, setDeleting] = useState(false);

  // Reload list whenever the dialog opens
  useEffect(() => {
    if (open && projectId) {
      loadCollections(projectId);
    }
  }, [open, projectId]);

  const handleDeleteClick = (item: CollectionListItem) => {
    if (item.system) return; // UI guard — system collections are not deletable
    setPendingDelete(item);
  };

  const handleDeleteConfirm = async () => {
    if (!pendingDelete || !projectId) return;
    setDeleting(true);
    try {
      await deleteCollection(projectId, pendingDelete.name);
      toast.success(t("deleteSuccess"));
      setPendingDelete(null);
    } catch (err: unknown) {
      const status =
        err &&
        typeof err === "object" &&
        "response" in err &&
        (err as { response?: { status?: number } }).response?.status;
      if (status === 403) {
        toast.error(t("deleteErrorSystem"));
      } else {
        toast.error(t("deleteError"));
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              {t("title")}
            </DialogTitle>
            <DialogDescription>{t("description")}</DialogDescription>
          </DialogHeader>

          <div className="min-h-[120px]">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : !collections || collections.length === 0 ? (
              <p className="text-center py-10 text-sm text-muted-foreground">
                {t("empty")}
              </p>
            ) : (
              <ScrollArea className="max-h-[360px]">
                <div className="space-y-2">
                  {collections.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 rounded-lg border px-4 py-3 group hover:bg-muted/40 transition-colors"
                    >
                      <Database className="w-4 h-4 shrink-0 text-muted-foreground" />

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-mono font-medium truncate">
                          {item.name}
                        </p>
                      </div>

                      {item.system && (
                        <Badge
                          variant="outline"
                          className="shrink-0 text-xs text-muted-foreground"
                        >
                          {t("systemBadge")}
                        </Badge>
                      )}

                      {!item.system && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleDeleteClick(item)}
                          title={t("deleteTitle")}
                          className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t("close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Destructive confirmation dialog */}
      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open && !deleting) setPendingDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteDescription", { name: pendingDelete?.name ?? "" })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>
              {t("deleteCancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mr-1.5" />
              )}
              {t("deleteConfirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
