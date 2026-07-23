"use client";

import { useState } from "react";
import { BookOpen, CheckCircle2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export function ConstructorGuide() {
  const t = useTranslations("editor.guide");
  const [open, setOpen] = useState(false);
  const steps = ["canvas", "nodes", "connect", "configure", "variables", "debug", "publish"] as const;

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        data-tour="constructor-guide"
        className="h-9 shrink-0 gap-1.5 px-2 text-white/70 hover:bg-white/10 hover:text-white"
        onClick={() => setOpen(true)}
        title={t("button")}
      >
        <BookOpen className="h-4 w-4" />
        <span className="hidden lg:inline">{t("button")}</span>
      </Button>

      {open && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="max-h-[min(760px,90vh)] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#171717] p-5 text-white shadow-2xl">
            <div className="mb-5 flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-200">
                <BookOpen className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-semibold">{t("title")}</h2>
                <p className="mt-1 text-sm text-zinc-400">{t("description")}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)} className="text-zinc-400 hover:bg-white/10 hover:text-white">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              {steps.map((step, index) => (
                <div key={step} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
                    <div>
                      <p className="text-sm font-medium">{index + 1}. {t(`steps.${step}.title`)}</p>
                      <p className="mt-1 text-xs leading-5 text-zinc-400">{t(`steps.${step}.body`)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 flex justify-end">
              <Button onClick={() => setOpen(false)}>{t("close")}</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
