import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React from "react";
import { SendTextMessageNodeData } from "../TextMessageNode/types";

type Props = {
  notificationDisabled?: boolean;
  contentProtected?: boolean;
  parseMode?: "None" | "HTML";
  handleUpdate: (update: Partial<SendTextMessageNodeData>) => void;
};

function ActionNodeSettings({
  contentProtected,
  notificationDisabled,
  parseMode,
  handleUpdate,
}: Props) {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger>Sozlamalar</AccordionTrigger>

        <AccordionContent className="flex flex-col gap-4 text-balance py-4">
          {/* Disable Notification */}
          <div className="flex items-center">
            <Checkbox
              checked={notificationDisabled}
              id="disable-notification"
              onCheckedChange={(e) =>
                handleUpdate({ disableNotification: e as boolean })
              }
            />
            <label htmlFor="disable-notification" className="ml-2 select-none">
              Ovozsiz yuborish
            </label>
          </div>

          {/* Protect Content */}
          <div className="flex items-center">
            <Checkbox
              checked={contentProtected}
              onCheckedChange={(e) =>
                handleUpdate({ protectContent: e as boolean })
              }
              id="protect-content"
            />
            <label htmlFor="protect-content" className="ml-2 select-none">
              Forward/copy/yuklab olish qilishni taqiqlash
            </label>
          </div>

          {/* Parse Mode */}
          <div className="flex flex-col">
            <label htmlFor="parse-mode" className="mb-1 select-none">
              Matn formatlash (parse_mode)
            </label>
            <Select
              onValueChange={(e) => handleUpdate({ parseMode: e as any })}
              value={parseMode}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a markdown type" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Markdown type</SelectLabel>
                  <SelectItem value="None">Yo'q</SelectItem>
                  <SelectItem value="HTML">HTML</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

export default ActionNodeSettings;
