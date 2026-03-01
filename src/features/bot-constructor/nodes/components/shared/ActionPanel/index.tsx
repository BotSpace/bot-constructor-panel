
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { ScrollArea } from "@/components/ui/scroll-area"
import ActionNodeSettings from "../../../actions/shared/ActionNodeSettings"
import { useFlowStore } from "@/features/bot-constructor/store";
import { ParseMode } from "../../../actions/shared/types";
import { ButtonGenerator, KeyboardConfig } from "@/features/bot-constructor/components";
import { HandlerAdder } from "../../../actions/shared/HandlerBuilder";
import { RecipientsManager } from "../../../actions/shared/RecipientSelector";
import {
  Settings2,
  Users,
  Workflow,
  Keyboard,
  SlidersHorizontal,
  X,
} from "lucide-react";

interface ActionPanelTypes {
  keyboard?: KeyboardConfig,
  disableNotification?: boolean,
  protectContent?: boolean,
  parseMode?: ParseMode,
  id: string,
  recipients?: {
    sendToSender: boolean;
    additionalIds: string[];
  };
  hideHandlers?: boolean;
}

function SectionWrapper({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-card/50 p-4 space-y-3 transition-colors hover:bg-card/80">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold leading-tight">{title}</h3>
          {description && (
            <p className="text-xs text-muted-foreground leading-tight mt-0.5">{description}</p>
          )}
        </div>
      </div>
      <div>{children}</div>
    </div>
  );
}

export function ActionPanel({ disableNotification, parseMode, protectContent, id, keyboard, recipients, hideHandlers }: ActionPanelTypes) {

  const updateNodeData = useFlowStore((state) => state.updateNodeData);

  const handleUpdate = (update: Partial<any>) => {
    updateNodeData(id, update);
  };

  return (
    <Drawer direction="right">
      <DrawerTrigger asChild>
        <Button
          className="w-full gap-2 font-medium"
          variant="outline"
        >
          <Settings2 className="h-4 w-4" />
          Sozlash
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-full">
        {/* Header */}
        <DrawerHeader className="border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <SlidersHorizontal className="h-5 w-5" />
            </div>
            <div>
              <DrawerTitle className="text-lg">Sozlamalar</DrawerTitle>
              <DrawerDescription className="text-xs">
                Tugmalar va xabar sozlamalarini boshqaring
              </DrawerDescription>
            </div>
          </div>
        </DrawerHeader>

        {/* Scrollable content */}
        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="flex flex-col gap-3 p-4">

            {/* Qabul qiluvchilar */}
            {recipients !== undefined && (
              <SectionWrapper
                icon={Users}
                title="Qabul qiluvchilar"
                description="Xabar kimga yuborilishini tanlang"
              >
                <RecipientsManager
                  recipients={recipients}
                  onUpdate={handleUpdate}
                />
              </SectionWrapper>
            )}

            {/* Tugmalar */}
            {keyboard !== undefined && (
              <SectionWrapper
                icon={Keyboard}
                title="Tugmalar"
                description="Inline va reply tugmalarni boshqaring"
              >
                <ButtonGenerator initialKeyboard={keyboard} node_id={id} />
              </SectionWrapper>
            )}

            {/* Handler builder */}
            {!hideHandlers && (
              <SectionWrapper
                icon={Workflow}
                title="Handlerlar"
                description="Xabarga javob berish qoidalari"
              >
                <HandlerAdder sourceNodeId={id} />
              </SectionWrapper>
            )}

            {/* Sozlamalar */}
            <SectionWrapper
              icon={SlidersHorizontal}
              title="Qo'shimcha sozlamalar"
              description="Xabar yuborish parametrlari"
            >
              <ActionNodeSettings
                notificationDisabled={disableNotification}
                contentProtected={protectContent}
                parseMode={parseMode}
                handleUpdate={handleUpdate}
              />
            </SectionWrapper>

          </div>
        </ScrollArea>

        {/* Footer */}
        <DrawerFooter className="border-t pt-4">
          <DrawerClose asChild>
            <Button className="w-full gap-2" variant="outline">
              <X className="h-4 w-4" />
              Yopish
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
