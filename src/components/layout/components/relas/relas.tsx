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
import { Link } from "@/i18n/routing";

function ReleasePanel() {
  const { id }: { id: string } = useParams();
  const { loadProject, loading, project } = useProjectStore();

  function handleCreateRelease() {
    const toastId = toast.loading("release qilinmoqda");

    instanceAuth
      .post("/relase/", {
        project: id,
      })
      .then(() => {
        toast.success("Telegram bot relase qilindi", { id: toastId });
        loadProject(id);
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

          // fetch project qayta chaqiramiz
          loadProject(id);
        }}
      >
        <Button>Add Release Bot</Button>
      </AddEnvDialog>
    );
  }

  // Relase qilb yubrish
  if (!project?.release)
    return (
      <Button
        onClick={() => handleCreateRelease()}
        className="cursor-pointer bg-blue-500 text-white hover:bg-blue-700 transition-colors duration-200"
      >
        Publish
      </Button>
    );

  return <ReleaseDropDown id={id} onPublish={handleCreateRelease} />;
}

// Drop Down
function ReleaseDropDown({
  id,
  onPublish,
}: {
  id: string;
  onPublish: () => void;
}) {
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="cursor-pointer bg-blue-500 text-white hover:bg-blue-700 transition-colors duration-200">
            Publish
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end">
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <Bot />
              <span className="text-muted-foreground">@coffechi_uz_bot</span>
              <DropdownMenuShortcut>
                <ExternalLink />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link className="cursor-pointer" href={`/bot/${id}/release`}>
                <ListTree />
                1h ago version 10.1
                <DropdownMenuShortcut>
                  <ChevronRight />
                </DropdownMenuShortcut>
              </Link>
            </DropdownMenuItem>
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
