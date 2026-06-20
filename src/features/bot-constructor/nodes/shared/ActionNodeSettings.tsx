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

type Props = {
  notificationDisabled?: boolean;
  contentProtected?: boolean;
  parseMode?: "None" | "HTML";
  handleUpdate: (update: Record<string, unknown>) => void;
};

function ActionNodeSettings({
  contentProtected,
  notificationDisabled,
  parseMode,
  handleUpdate,
}: Props) {
  return (
    <div className="flex flex-col gap-4 text-balance">
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
          Yuklab olishni taqiqlash
        </label>
      </div>

      {/* Parse Mode */}
      <div className="flex flex-col">
        <label htmlFor="parse-mode" className="mb-1 select-none">
          Matn formatlash (parse_mode)
        </label>
        <Select
          onValueChange={(e) => handleUpdate({ parseMode: e as any })}
          value={parseMode || "None"}
        >
          <SelectTrigger>
            <SelectValue placeholder="Matn formatlash turini tanlang" />
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
    </div>
  );
}

export default ActionNodeSettings;
