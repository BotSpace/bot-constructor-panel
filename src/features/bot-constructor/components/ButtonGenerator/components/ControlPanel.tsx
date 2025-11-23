// FAYL: constructor/components/ButtonGenerator/components/ControlPanel.tsx (YANGI)
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle } from "lucide-react";
import { InlineForm } from "./InlineForm";
import { ReplyForm } from "./ReplyForm";
import { ButtonConfig } from "../types";
import { SendTextMessageNodeData } from "@/features/bot-constructor/nodes/actions/TextMessageNode/types";

interface ControlPanelProps {
  activeTab: "inline" | "reply";
  onTabChange: (tab: "inline" | "reply") => void;
  onAddButton: (button: ButtonConfig) => void;
  isCurrentRowFull: boolean;
  data?: SendTextMessageNodeData;
}

export const ControlPanel = ({
  activeTab,
  onTabChange,
  onAddButton,
  isCurrentRowFull,
  data,
}: ControlPanelProps) => {
  return (
    <div className="md:col-span-4 flex flex-col gap-6 sticky top-0">
      <Tabs
        value={activeTab}
        onValueChange={(v) => onTabChange(v as "inline" | "reply")}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="inline">Inline Keyboard</TabsTrigger>
          <TabsTrigger value="reply">Reply Keyboard</TabsTrigger>
        </TabsList>
        <TabsContent value="inline">
          <InlineForm
            onAdd={onAddButton}
            disabled={isCurrentRowFull}
            data={data}
          />
        </TabsContent>
        <TabsContent value="reply">
          <ReplyForm
            onAdd={onAddButton}
            disabled={isCurrentRowFull}
            data={data}
          />
        </TabsContent>
      </Tabs>
      {isCurrentRowFull && (
        <div className="p-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-md text-sm flex items-start gap-2">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>
            Tanlangan qator to'la. Yangi tugma qo'shish uchun boshqa qatorni
            tanlang yoki "Yangi Qator" tugmasini bosing.
          </span>
        </div>
      )}
    </div>
  );
};
