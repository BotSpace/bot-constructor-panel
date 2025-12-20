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
import React from "react";
import { AddEnvDialog } from "../add-env";
import {
  Activity,
  Bot,
  ChevronRight,
  ExternalLink,
  ListTree,
} from "lucide-react";
import { instanceAuth } from "@/services/instance";
import toast from "react-hot-toast";
import useProjectStore from "@/features/bot-constructor/store/project";
import { useLinkToParent } from "@/components/common/link-to-parrent";
import Link from "next/link";
import StatusBadge from "@/components/common/status-badge";

function ReleasePanel() {
  const { id, lang }: { id: string; lang: string } = useParams();
  const { loading, project } = useProjectStore();

  function handleCreateRelease() {
    const toastId = toast.loading("release qilinmoqda");

    instanceAuth
      .post("/relase/", {
        project: id,
      })
      .then(() => {
        toast.success("Telegram bot relase qilindi", { id: toastId });
      })
      .catch(() => {
        toast.error("Xatolik yuz berdi", { id: toastId });
      });
  }

  // Yuklanish
  if (loading) return <>Loading...</>;

  // relase uchun bot tayinlash
  if (!project?.release_bot) {
    return (
      <AddEnvDialog
        env_name="RELEASE_BOT_TOKEN"
        project_id={id}
        dialog_title="Release Bot qo‘shish"
        dialog_description="Telegram release bot tokenini kiriting"
        onSuccess={() => {
          // create new relase bot
          handleCreateRelease();
        }}
      >
        <Button id="version-switcher"
        >Publish</Button>
      </AddEnvDialog>
    );
  }

  // Relase qilb yubrish
  if (!project?.release)
    return (
      <Button
        id="version-switcher"
        onClick={() => handleCreateRelease()}
        className="cursor-pointer bg-blue-500 text-white hover:bg-blue-700 transition-colors duration-200"
      >
        Publish
      </Button>
    );

  if (project.release.status === "initializing") {
    return (
      <Button
        onClick={() => handleCreateRelease()}
        className="bg-blue-500 text-white hover:bg-blue-700 transition-colors duration-200"
        disabled
      >
        Publishing...
      </Button>
    );
  }

  return (
    <ReleaseDropDown lang={lang} id={id} onPublish={handleCreateRelease} />
  );
}

// Drop Down
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

  const { handleClick } = useLinkToParent({
    href: `/${lang}/bot/${id}/release`,
    onClick: (e) => console.log("Clicked!"),
  });

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            id="version-switcher"
            className="cursor-pointer bg-blue-500 text-white hover:bg-blue-700 transition-colors duration-200">
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
            <DropdownMenuItem>
              <Activity />
              12 changes
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-2" />
            <DropdownMenuItem asChild>
              <Button
                onClick={onPublish}
                variant={"secondary"}
                className="bg-blue-500 cursor-pointer text-white hover:bg-blue-600 transition-colors duration-200 w-full text-center"
              >
                Publish
              </Button>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

export { ReleasePanel };
