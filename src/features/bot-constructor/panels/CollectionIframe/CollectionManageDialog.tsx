"use client";

import { useEffect, useRef, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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

  // Opening a nested AlertDialog inside a non-modal Sheet causes Radix to fire
  // onInteractOutside on the Sheet in the same tick, instantly closing it.
  // Record when the delete dialog opened and ignore that spurious close.
  const deleteOpenedAtRef = useRef(0);
  useEffect(() => {
    if (pendingDelete !== null) deleteOpenedAtRef.current = Date.now();
  }, [pendingDelete]);

  // Reload list whenever the dialog opens
  useEffect(() => {
    if (open && projectId) {
      loadCollections(projectId);
    }
  }, [loadCollections, open, projectId]);

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
      <Sheet open={open} onOpenChange={onOpenChange} modal={false}>
        <SheetContent
          side="right"
          showOverlay={false}
          showCloseButton={false}
          onInteractOutside={(e) => {
            // Nested AlertDialog open — prevent spurious Sheet close
            if (pendingDelete !== null) {
              e.preventDefault();
              return;
            }
            onOpenChange(false);
          }}
          className="flex w-full flex-col gap-0 overflow-hidden border-l border-white/10 bg-[#141414] p-0 text-white shadow-2xl sm:max-w-[480px]"
        >
          {/* Header */}
          <SheetHeader className="shrink-0 gap-0 space-y-0 border-b border-white/10 bg-[#171717] px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                <Database className="h-4 w-4 text-zinc-400" />
              </div>
              <div className="flex-1 min-w-0">
                <SheetTitle className="text-base font-semibold leading-tight">
                  {t("title")}
                </SheetTitle>
                <SheetDescription className="text-xs mt-0.5">
                  {t("description")}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          {/* List — scrollable area */}
          <div className="flex-1 min-h-0 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : !collections || collections.length === 0 ? (
              <p className="text-center py-10 text-sm text-muted-foreground">
                {t("empty")}
              </p>
            ) : (
              <ScrollArea className="h-full">
                <div className="space-y-2 px-4 py-3">
                  {collections.map((item) => (
                    <div
                      key={item.id}
                      className="group flex items-center gap-3 rounded-lg border border-white/10 bg-white/3 px-4 py-3 transition-colors hover:bg-white/5"
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

          {/* Footer */}
          <div className="shrink-0 border-t border-white/10 px-5 py-3">
            <Button variant="outline" className="w-full" onClick={() => onOpenChange(false)}>
              {t("close")}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Destructive confirmation dialog */}
      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(v) => {
          if (v) return;
          if (deleting) return;
          // Ignore the spurious close fired in the same tick as opening
          if (Date.now() - deleteOpenedAtRef.current < 400) return;
          setPendingDelete(null);
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
