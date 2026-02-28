"use client";

import { useState } from "react";
import { ReleasePanel } from "./components/relas/relas";
import DebugingButtons from "./components/debug/debug";
import { useParams } from "next/navigation";
import { useLinkToParent } from "../common/link-to-parrent";
import { useTranslations } from "next-intl";

// Asosiy Header komponenti
export function ConstructorPageHeader() {
  const { id } = useParams();
  const t = useTranslations();
  const [isChatOpen, setIsChatOpen] = useState(false);

  const { handleClick: backToBotPanel } = useLinkToParent({
    href: `/bot/${id}`,
    onClick: (e) => console.log("Clicked!"),
  });

  return (
    <>
      <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6 sticky top-0 z-30">

        <div className="flex items-center gap-2">
          <DebugingButtons />

          <ReleasePanel />
        </div>
      </header>
    </>
  );
}
