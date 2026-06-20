import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useParams } from "next/navigation";
import React, { useState } from "react";
import { AddEditEnvDialog } from "@/components/layout/add-env";
import {
  Bot,
  ChevronRight,
  CreditCard,
  ExternalLink,
  ListTree,
  RotateCcwKey,
} from "lucide-react";
import { instanceAuth } from "@/services/instance";
import toast from "react-hot-toast";
import useProjectStore from "@/features/bot-constructor/store/project";
import { useFlowStore } from "@/features/bot-constructor/store";
import { useLinkToParent } from "@/components/common/link-to-parrent";
import Link from "next/link";
import StatusBadge from "@/components/common/status-badge";
import SelectPlan from "@/components/layout/relas/select-plan/select-plan";
import {
  RunningBotLimitModal,
  RunningBotLimitError,
} from "@/components/layout/running-bot-limit-modal";

function ReleasePanel() {
  const { id, lang }: { id: string; lang: string } = useParams();
  const { loading, project } = useProjectStore();
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [limitError, setLimitError] = useState<RunningBotLimitError | null>(
    null
  );
  // Remembers plan args so we can retry after stopping a bot
  const [pendingRelease, setPendingRelease] = useState<{
    plan_id?: number;
    months?: number;
  } | null>(null);

  async function handleCreateRelease(plan_id?: number, months?: number) {
    const toastId = toast.loading("Release qilinmoqda...");

    // Saqlanmagan o'zgarishlar bo'lsa, release'dan OLDIN majburiy saqlaymiz —
    // aks holda oxirgi ~1s ichidagi tahrirlar release'ga kirmay qoladi.
    const { isDirty, saveFlow } = useFlowStore.getState();
    if (isDirty) {
      try {
        await saveFlow(id);
      } catch {
        toast.error("Flow saqlanmadi — release bekor qilindi, qayta urinib ko'ring.", { id: toastId });
        return;
      }
    }

    const body: Record<string, unknown> = { project: id };
    if (plan_id !== undefined) body.plan_id = plan_id;
    if (months !== undefined) body.months = months;

    instanceAuth
      .post("/relase/", body)
      .then(() => {
        toast.success("Telegram bot release qilindi", { id: toastId });
        setPlanDialogOpen(false);
        setPendingRelease(null);
      })
      .catch((err) => {
        const raw = err?.response?.data;
        const data = raw?.data ?? raw;
        if (
          err?.response?.status === 409 &&
          data?.code === "running_bot_limit"
        ) {
          toast.dismiss(toastId);
          setPendingRelease({ plan_id, months });
          setLimitError(data as RunningBotLimitError);
        } else {
          const d = data?.data;
          const message =
            d?.plan_id?.[0] ??
            d?.detail ??
            data?.detail ??
            "Xatolik yuz berdi";
          toast.error(message, { id: toastId });
        }
      });
  }

  function handleTokenSuccess() {
    if (!project?.release) {
      setPlanDialogOpen(true);
    } else {
      handleCreateRelease();
    }
  }

  if (loading) return null;

  // The limit modal is shared across all branches (state lives in this component)
  const limitModal = limitError ? (
    <RunningBotLimitModal
      open={limitError !== null}
      onOpenChange={(v) => {
        if (!v) setLimitError(null);
      }}
      errorData={limitError}
      currentProjectId={id}
      onStopSuccess={() =>
        handleCreateRelease(pendingRelease?.plan_id, pendingRelease?.months)
      }
    />
  ) : null;

  // No release bot token → prompt for token first
  if (!project?.release_bot) {
    return (
      <>
        <AddEditEnvDialog
          env_name="RELEASE_BOT_TOKEN"
          project_id={id}
          dialog_title="Release Bot qo'shish"
          dialog_description="Telegram release bot tokenini kiriting"
          onSuccess={handleTokenSuccess}
        >
          <Button
            id="version-switcher"
            className="cursor-pointer bg-blue-500 text-white hover:bg-blue-700 transition-colors duration-200"
          >
            Publish
          </Button>
        </AddEditEnvDialog>

        <PlanSelectionDialog
          open={planDialogOpen}
          onOpenChange={setPlanDialogOpen}
          title="Tarifni tanlang"
          description="Botni ishga tushirish uchun tarifni tanlang."
          onSelectPlan={(plan_id, months) => {
            handleCreateRelease(plan_id, months);
          }}
        />
        {limitModal}
      </>
    );
  }

  // Token exists but no release yet → first release needs plan selection
  if (!project?.release) {
    return (
      <>
        <Button
          id="version-switcher"
          onClick={() => setPlanDialogOpen(true)}
          className="cursor-pointer bg-blue-500 text-white hover:bg-blue-700 transition-colors duration-200"
        >
          Publish
        </Button>

        <PlanSelectionDialog
          open={planDialogOpen}
          onOpenChange={setPlanDialogOpen}
          title="Tarifni tanlang"
          description="Botni ishga tushirish uchun tarifni tanlang."
          onSelectPlan={(plan_id, months) => {
            handleCreateRelease(plan_id, months);
          }}
        />
        {limitModal}
      </>
    );
  }

  // Currently initializing
  if (project.release.status === "initializing") {
    return (
      <>
        <Button
          className="bg-blue-500 text-white hover:bg-blue-700 transition-colors duration-200"
          disabled
        >
          Publishing...
        </Button>
        {limitModal}
      </>
    );
  }

  // Release exists → show dropdown with re-publish + change tariff
  return (
    <>
      <ReleaseDropDown
        lang={lang}
        id={id}
        onPublish={() => handleCreateRelease()}
      />
      {limitModal}
    </>
  );
}

// Shared plan selection dialog
function PlanSelectionDialog({
  open,
  onOpenChange,
  title,
  description,
  onSelectPlan,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onSelectPlan: (plan_id: number, months: number) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[90%] max-h-[90vh] overflow-y-auto">
        <SelectPlan
          header={
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>{description}</DialogDescription>
            </DialogHeader>
          }
          onSelectPlan={onSelectPlan}
        />

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Bekor qilish</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Dropdown shown when a release already exists
function ReleaseDropDown({
  id,
  lang,
  onPublish,
}: {
  id: string;
  lang: string;
  onPublish: () => void;
}) {
  const { project } = useProjectStore();
  const [changePlanOpen, setChangePlanOpen] = useState(false);

  const { handleClick } = useLinkToParent({
    href: `/${lang}/bot/${id}/release`,
    onClick: (e) => console.log("Clicked!"),
  });

  function handleUpgradePlan(plan_id: number, months: number) {
    const toastId = toast.loading("Tarif o'zgartirilmoqda...");
    instanceAuth
      .post(`/project/${id}/plan/upgrade/`, { plan_id, months })
      .then(() => {
        toast.success("Tarif muvaffaqiyatli o'zgartirildi", { id: toastId });
        setChangePlanOpen(false);
      })
      .catch((err) => {
        const d = err?.response?.data?.data;
        const message =
          d?.detail ??
          d?.plan_id?.[0] ??
          err?.response?.data?.detail ??
          "Xatolik yuz berdi";
        toast.error(message, { id: toastId });
      });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            id="version-switcher"
            className="cursor-pointer bg-blue-500 text-white hover:bg-blue-700 transition-colors duration-200"
          >
            Version {project?.release?.version}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end">
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link href={"https://t.me/" + project?.username}>
                <Bot />
                <span className="text-muted-foreground">
                  @{project?.username}
                </span>
                <DropdownMenuShortcut>
                  <ExternalLink />
                </DropdownMenuShortcut>
              </Link>
            </DropdownMenuItem>
            {project?.release?.status && (
              <DropdownMenuItem onClick={handleClick}>
                <ListTree />
                Version {project.release.version}
                <StatusBadge status={project.release.status} />
                <DropdownMenuShortcut>
                  <ChevronRight />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            )}
            <AddEditEnvDialog
              env_name="RELEASE_BOT_TOKEN"
              project_id={id}
              dialog_title="Release Bot yangilash"
              dialog_description="Yangi bot tokenini kiriting"
              isEdit={true}
            >
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <RotateCcwKey className="h-4 w-4" />
                <span>Token yangilash</span>
              </DropdownMenuItem>
            </AddEditEnvDialog>
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                setChangePlanOpen(true);
              }}
            >
              <CreditCard className="h-4 w-4" />
              <span>Tarifni o&apos;zgartirish</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-2" />
            <DropdownMenuItem asChild>
              <Button
                onClick={onPublish}
                variant="secondary"
                className="bg-blue-500 cursor-pointer text-white hover:bg-blue-600 transition-colors duration-200 w-full text-center"
              >
                Publish
              </Button>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <PlanSelectionDialog
        open={changePlanOpen}
        onOpenChange={setChangePlanOpen}
        title="Tarifni o'zgartirish"
        description="Yangi tarifni va to'lov muddatini tanlang."
        onSelectPlan={(plan_id, months) => {
          handleUpgradePlan(plan_id, months);
        }}
      />
    </>
  );
}

export { ReleasePanel };
