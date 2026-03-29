import React from "react";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ListPlus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DynamicMessageConstructor } from "../../TextMessageNode/components/dynamic-message-constructor-modal";
import TextArea from "../../shared/text-area";
import { EditMessageNodeData } from "../types";
import TelegramRichTextEditor from "@/features/bot-constructor/components/TelegramRichTextEditor/TelegramRichTextEditor";

type Props = {
  handleUpdate: (update: Partial<EditMessageNodeData>) => void;
  data: EditMessageNodeData;
  id: string;
};

function ForTextMessageNode({ handleUpdate, data, id }: Props) {
  return (
    <div className="grid gap-2">
      <div className="flex justify-between items-center">
        <Label>Yangi caption...</Label>

        <DynamicMessageConstructor
          initialDynamicMessages={data.dynamicMessages}
          handleUpdate={handleUpdate}
          id={id}
        >
          <Button size={"icon-sm"} variant={"outline"}>
            <ListPlus />
          </Button>
        </DynamicMessageConstructor>
      </div>


      <TelegramRichTextEditor
        defaultValue={data.newText}
        onChange={(e) => handleUpdate({ newText: e })}
      />


      <div className="flex flex-col">
        <label htmlFor="parse-mode" className="mb-1 select-none">
          Matn formatlash (parse_mode)
        </label>
        <Select
          onValueChange={(e) => handleUpdate({ parseMode: e as any })}
          value={data.parseMode}
        >
          <SelectTrigger>
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
    </div>
  );
}

export default ForTextMessageNode;
