"use client";

import { useCallback, useEffect, useState } from "react";
import { BookOpen, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

type StepKey = "canvas" | "nodes" | "connect" | "configure" | "variables" | "debug" | "publish";

const STEPS: Array<{ key: StepKey; target?: string }> = [
  { key: "canvas", target: "constructor-node" },
  { key: "nodes", target: "constructor-add-node" },
  { key: "connect", target: "constructor-handle" },
  { key: "configure", target: "constructor-node" },
  { key: "variables", target: "constructor-variables" },
  { key: "debug", target: "constructor-debug" },
  { key: "publish", target: "constructor-save" },
];

function visibleTarget(name?: string): HTMLElement | null {
  if (!name || typeof document === "undefined") return null;
  return Array.from(document.querySelectorAll<HTMLElement>(`[data-tour="${name}"]`)).find((element) => {
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }) ?? null;
}

export function ConstructorGuide() {
  const t = useTranslations("editor.guide");
  const [open, setOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const step = STEPS[stepIndex];

  const finish = useCallback(() => {
    setOpen(false);
    setStepIndex(0);
    setRect(null);
  }, []);

  const measure = useCallback(() => {
    const target = visibleTarget(step.target);
    setRect(target?.getBoundingClientRect() ?? null);
  }, [step.target]);

  useEffect(() => {
    if (!open) return;
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [open, measure]);

  const next = () => {
    if (stepIndex >= STEPS.length - 1) finish();
    else setStepIndex((current) => current + 1);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        data-tour="constructor-guide"
        className="h-9 shrink-0 gap-1.5 px-2 text-white/70 hover:bg-white/10 hover:text-white"
        onClick={() => { setStepIndex(0); setOpen(true); }}
        title={t("button")}
      >
        <BookOpen className="h-4 w-4" />
        <span className="hidden lg:inline">{t("button")}</span>
      </Button>

      {open && (
        <div className="fixed inset-0 z-[100] pointer-events-none">
          {rect ? (
            <div
              className="fixed rounded-lg border-2 border-cyan-300"
              style={{
                left: rect.left - 6,
                top: rect.top - 6,
                width: rect.width + 12,
                height: rect.height + 12,
                boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.62)",
              }}
            />
          ) : (
            <div className="fixed inset-0 bg-black/62" />
          )}

          <div
            className="pointer-events-auto fixed w-[min(360px,calc(100vw-32px))] rounded-xl border border-cyan-300/30 bg-[#171717] p-4 text-white shadow-2xl"
            style={rect ? {
              left: Math.min(Math.max(16, rect.left), window.innerWidth - 376),
              top: rect.bottom + 16 > window.innerHeight - 190 ? Math.max(16, rect.top - 190) : rect.bottom + 16,
            } : { left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}
          >
            <div className="flex items-start gap-3">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-cyan-400/10 text-cyan-200">
                <BookOpen className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-cyan-300">{stepIndex + 1} / {STEPS.length}</p>
                <h2 className="mt-0.5 text-sm font-semibold">{t(`steps.${step.key}.title`)}</h2>
                <p className="mt-1.5 text-xs leading-5 text-zinc-400">{t(`steps.${step.key}.body`)}</p>
              </div>
              <button type="button" onClick={finish} className="text-zinc-500 hover:text-white" aria-label={t("skip")}>
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <button type="button" onClick={finish} className="text-xs text-zinc-500 hover:text-zinc-200">{t("skip")}</button>
              <div className="flex gap-2">
                {stepIndex > 0 && <Button variant="ghost" size="sm" onClick={() => setStepIndex((current) => current - 1)} className="h-8 text-zinc-300"><ChevronLeft className="mr-1 h-3.5 w-3.5" />{t("back")}</Button>}
                <Button size="sm" onClick={next} className="h-8">{stepIndex === STEPS.length - 1 ? t("done") : t("next")}<ChevronRight className="ml-1 h-3.5 w-3.5" /></Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
