"use client";

import React, { useEffect, useState } from "react";
import { useFlowStore } from "@/constructor/store";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { shallow } from "zustand/shallow";
import { useParams } from "next/navigation";
import { BugPlay, PlusCircle } from "lucide-react";
import { useReactQueryAction } from "@/services/react-query";
import { APIResponseType } from "@/types/http";
import { Bot } from "@/types/http/bot";
import { Input } from "@/components/ui/input";

export default function HeaderActions() {
  const { bot }: { bot: string } = useParams();

  const { data } = useReactQueryAction<APIResponseType<Bot>>({
    url: `/project/bot/${bot}/`,
  });

  const [developedToken, setDevelopedToken] = useState<string>("");
  const [testModelIsOpen, setTestModelIsOpen] = useState(false);
  const [publishIsOpen, setPublishIsOpen] = useState(false);

  const { isDirty, loadFlow, saveFlow } = useFlowStore(
    (state) => ({
      isDirty: state.isDirty,
      loadFlow: state.loadFlow,
      saveFlow: state.saveFlow,
    }),
    shallow
  );

  useEffect(() => {
    loadFlow(bot);
  }, [loadFlow]);

  function ReloadBot() {
    // TODO: botni qayta ishga tushirish
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "r") {
        e.preventDefault();
        ReloadBot();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  function handleSaveFlow() {
    console.log(
      " LOG_ID: [9d9b04ba0b47] ~ 🚀 ~ file: actions.tsx:81 ~ handleSaveFlow ~  data:",
      data
    );
  }

  function handleRunBot() {}

  return (
    <TooltipProvider delayDuration={100}>
      <div className="flex items-center gap-3">
        {data && data.data.development_token ? (
          <Button
            onClick={handleRunBot}
            variant={"outline"}
            size="sm"
            className="relative"
          >
            <BugPlay />
            Test
          </Button>
        ) : (
          <Dialog open={testModelIsOpen} onOpenChange={setTestModelIsOpen}>
            <DialogTrigger asChild>
              <Button variant={"outline"} size="sm" className="relative">
                <BugPlay />
                Test
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  Botni test rejimda ishga tushirish uchun bot kiriting
                </DialogTitle>
                <DialogDescription>
                  Siz botni devmodeda test qilib olib uni productionda test
                  qilishingiz mumkin!
                </DialogDescription>
              </DialogHeader>

              <Input
                onChange={(e) => setDevelopedToken(e.currentTarget.value)}
                defaultValue={"12134345:NZJjnkcjsfks"}
              />

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setTestModelIsOpen(false)}
                >
                  Bekor qilish
                </Button>
                <Button
                  onClick={() => {
                    handleSaveFlow();
                  }}
                >
                  <PlusCircle />
                  Qo'shish
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Modal oynasi */}
        <Dialog open={publishIsOpen} onOpenChange={setPublishIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="relative">
              Publish
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Publish qilishga ishonchingiz komilmi?</DialogTitle>
              <DialogDescription>
                Bot foydalanuvchilarga ko‘rinadi. Davom etishdan oldin barcha
                o‘zgarishlar tekshirib chiqilganiga ishonch hosil qiling.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPublishIsOpen(false)}>
                Bekor qilish
              </Button>
              <Button
                onClick={() => {
                  handleSaveFlow();
                }}
              >
                Yes, publish
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
