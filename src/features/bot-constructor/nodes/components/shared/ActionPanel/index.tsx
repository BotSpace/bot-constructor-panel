
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
import ActionNodeSettings from "../../../actions/shared/ActionNodeSettings"
import { useFlowStore } from "@/features/bot-constructor/store";
import { ParseMode } from "../../../actions/shared/types";
import { ButtonGenerator, KeyboardConfig } from "@/features/bot-constructor/components";
import { HandlerBuilder } from "../../../actions/shared/HandlerBuilder";
import { RecipientsManager } from "../../../actions/shared/RecipientSelector";
import { Separator } from "@/components/ui/separator";

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
  // handlers: Handler
}

export function ActionPanel({ disableNotification, parseMode, protectContent, id, keyboard, recipients }: ActionPanelTypes) {

  const updateNodeData = useFlowStore((state) => state.updateNodeData);

  // Ma'lumotlarni global store'da yangilash uchun markaziy funksiya
  const handleUpdate = (update: Partial<any>) => {
    updateNodeData(id, update);
  };

  return (
    <Drawer direction="right">
      <DrawerTrigger asChild>
        <Button className="w-full" variant="outline">Sozlash</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Sozlamalar</DrawerTitle>
          <DrawerDescription>Tugmalar va xabar sozlamalarini boshqaring</DrawerDescription>
        </DrawerHeader>
        <div className="no-scrollbar overflow-y-auto px-4 flex flex-col gap-3">

          {/* Qabul qiluvchi */}
          {recipients !== undefined && (
            <RecipientsManager
              recipients={recipients}
              onUpdate={handleUpdate}
            />
          )}

          {/* handler builder */}
          <HandlerBuilder sourceNodeId={id} />

          {/* Buttonlar generate qilish */}
          {keyboard !== undefined && (
            <ButtonGenerator initialKeyboard={keyboard} node_id={id} />
          )}

          <Separator />

          {/* Sozlamalar */}
          <ActionNodeSettings
            notificationDisabled={disableNotification}
            contentProtected={protectContent}
            parseMode={parseMode}
            handleUpdate={handleUpdate}
          />
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button className="w-full">Yopish</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
