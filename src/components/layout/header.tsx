"use client";

import { PromptInterface } from "./components/ai-chat/prompt-interface";
import { ReleasePanel } from "./components/relas/relas";
import DebugActions from "./components/debug/debug";
import { useParams } from "next/navigation";
import { useLinkToParent } from "../common/link-to-parrent";
import { ArrowLeft, Database } from "lucide-react";
import { Button } from "../ui/button";

// Asosiy Header komponenti
export function ConstructorPageHeader() {
  const { id } = useParams();

  const { handleClick: backToCollection } = useLinkToParent({
    href: `/bot/${id}/collection`,
    onClick: (e) => console.log("Clicked!"),
  });

  const { handleClick: backToBotPanel } = useLinkToParent({
    href: `/bot/${id}`,
    onClick: (e) => console.log("Clicked!"),
  });

  return (
    <>
      <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6 sticky top-0 z-30">
        <div className="flex-1 relative">
          <button
            onClick={backToBotPanel}
            className="flex items-center cursor-pointer gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>
        <div className="flex items-center gap-2">
          {/* <PromptInterface /> */}
          <DebugActions />
          <ReleasePanel />
          <Button onClick={backToCollection}>
            <Database />
            Collections
          </Button>
        </div>
      </header>
    </>
  );
}
