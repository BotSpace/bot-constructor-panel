"use client";

import Image from "next/image";
import HeaderActions from "./action/actions";

import { PromptInterface } from "./action/prompt-interface";
import LogoImage from "@/public/logo/android-chrome-192x192.png";

// Asosiy Header komponenti
export function ConstructorPageHeader() {
  return (
    <>
      <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6 sticky top-0 z-30">
        <div className="flex-1 relative">
          <Image
            width={120}
            height={120}
            src={LogoImage}
            alt="Logo"
            className="w-0 lg:w-auto h-8 lg:h-10 absolute left-0 top-1/2 -translate-y-1/2"
          />
        </div>
        <div className="flex gap-2">
          <HeaderActions />
          <PromptInterface />
        </div>
      </header>
    </>
  );
}
