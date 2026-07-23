import { Button } from "@/components/ui/button";
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
import { Bot, ChevronRight, ExternalLink, ListTree, RotateCcwKey } from "lucide-react";
import { instanceAuth } from "@/services/instance";
import toast from "react-hot-toast";
import useProjectStore from "@/features/bot-constructor/store/project";
import { useFlowStore } from "@/features/bot-constructor/store";
import { useLinkToParent } from "@/components/common/link-to-parrent";
import Link from "next/link";
import StatusBadge from "@/components/common/status-badge";
import {
  RunningBotLimitModal,
  RunningBotLimitError,
} from "@/components/layout/running-bot-limit-modal";
import { ReleaseBotDialog } from "@/components/layout/relas/release-bot-dialog";
import type { ReleaseInfo } from "@/types/http/project";
import { useTranslations } from "next-intl";

function ReleasePanel() {
  const { id, lang }: { id: string; lang: string } = useParams();
  const t = useTranslations("releaseBot");
  const { loading, project, changeRelease, loadProject } = useProjectStore();
  const [limitError, setLimitError] = useState<RunningBotLimitError | null>(null);
  const [publishing, setPublishing] = useState(false);

  async function handleCreateRelease(): Promise<boolean> {
    if (publishing) return false;

    const toastId = toast.loading("Release qilinmoqda...");
    setPublishing(true);

    const { isDirty, saveFlow } = useFlowStore.getState();
    if (isDirty) {
      try {
        await saveFlow(id);
      } catch {
        toast.error("Flow saqlanmadi — release bekor qilindi, qayta urinib ko'ring.", {
          id: toastId,
        });
        setPublishing(false);
        return false;
      }
    }

    try {
      const response = await instanceAuth.post<ReleaseInfo>("/relase", {
        project_id: id,
      });
      changeRelease(response.data);
      loadProject(id);
      toast.success("Telegram bot release qilindi", { id: toastId });
      return true;
    } catch (err: unknown) {
      const error = err as {
        response?: {
          status?: number;
          data?: {
            code?: string;
            detail?: string;
            data?: RunningBotLimitError;
            error?: { message?: string };
          };
        };
      };
      const raw = error.response?.data;
      const data = raw?.data ?? raw;
      if (
        error.response?.status === 409 &&
        data?.code === "running_bot_limit"
      ) {
        toast.dismiss(toastId);
        setLimitError(data as RunningBotLimitError);
      } else {
        toast.error(
          data?.detail ?? raw?.error?.message ?? "Xatolik yuz berdi",
          { id: toastId }
        );
      }
      return false;
    } finally {
      setPublishing(false);
    }
  }

  if (loading) return null;

  const limitModal = limitError ? (
    <RunningBotLimitModal
      open={limitError !== null}
      onOpenChange={(open) => {
        if (!open) setLimitError(null);
      }}
      errorData={limitError}
      currentProjectId={id}
      onStopSuccess={() => void handleCreateRelease()}
    />
  ) : null;

  if (!project?.release_bot) {
    return (
      <>
        <ReleaseBotDialog projectId={id} onConnected={handleCreateRelease}>
          <Button
            id="version-switcher"
            disabled={publishing}
            className="cursor-pointer bg-blue-500 text-white transition-colors duration-200 hover:bg-blue-700"
          >
            {publishing ? t("publishing") : t("publish")}
          </Button>
        </ReleaseBotDialog>
        {limitModal}
      </>
    );
  }

  if (!project?.release) {
    return (
      <>
        <Button
          id="version-switcher"
          onClick={() => void handleCreateRelease()}
          disabled={publishing}
          className="cursor-pointer bg-blue-500 text-white transition-colors duration-200 hover:bg-blue-700"
        >
          {publishing ? t("publishing") : t("publish")}
        </Button>
        {limitModal}
      </>
    );
  }

  if (project.release.status === "initializing" || publishing) {
    return (
      <>
        <Button className="bg-blue-500 text-white" disabled>
          {t("publishing")}
        </Button>
        {limitModal}
      </>
    );
  }

  return (
    <>
      <ReleaseDropDown
        lang={lang}
        id={id}
        onPublish={handleCreateRelease}
      />
      {limitModal}
    </>
  );
}

function ReleaseDropDown({
  id,
  lang,
  onPublish,
}: {
  id: string;
  lang: string;
  onPublish: () => Promise<boolean>;
}) {
  const { project } = useProjectStore();
  const t = useTranslations("releaseBot");
  const { handleClick } = useLinkToParent({
    href: `/${lang}/bot/${id}/release`,
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          id="version-switcher"
          className="cursor-pointer bg-blue-500 text-white transition-colors duration-200 hover:bg-blue-700"
        >
          Version {project?.release?.version}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuGroup>
          {project?.username && (
            <DropdownMenuItem asChild>
              <Link href={`https://telegram.me/${project.username}`} target="_blank">
                <Bot />
                <span className="text-muted-foreground">@{project.username}</span>
                <DropdownMenuShortcut>
                  <ExternalLink />
                </DropdownMenuShortcut>
              </Link>
            </DropdownMenuItem>
          )}
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
          <ReleaseBotDialog projectId={id} onConnected={onPublish}>
            <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
              <RotateCcwKey className="h-4 w-4" />
              <span>{t("changeBot")}</span>
            </DropdownMenuItem>
          </ReleaseBotDialog>
          <DropdownMenuSeparator className="my-2" />
          <DropdownMenuItem asChild>
            <Button
              onClick={() => void onPublish()}
              variant="secondary"
              className="w-full cursor-pointer bg-blue-500 text-center text-white transition-colors duration-200 hover:bg-blue-600"
            >
              {t("publish")}
            </Button>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { ReleasePanel };
