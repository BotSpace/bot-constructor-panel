"use client";

import { useState, memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import TextareaAutosize from "react-textarea-autosize";
import { FiFileText } from "react-icons/fi";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useFlowStore } from "@/constructor/store/flowStore";
import { SendFileNodeData, RecipientType, FileSourceType } from "./types";
import { ChevronDown } from "lucide-react";

// Bizning andoza uchun yangi importlar
import { LayoutGrid } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonGenerator } from "@/constructor/components/ButtonGenerator";
import { ButtonConfig } from "@/constructor/components/ButtonGenerator";

const SendFileNodeComponent = ({
  id,
  data,
  selected,
}: NodeProps<SendFileNodeData>) => {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleUpdate = (update: Partial<SendFileNodeData>) => {
    updateNodeData(id, update);
  };

  // ButtonGenerator'dan qaytgan natijani saqlash uchun funksiya
  const handleSaveButtons = (buttons: ButtonConfig[][]) => {
    updateNodeData(id, { buttons });
  };

  const captionLength = data.caption?.length || 0;
  // Tugmalar sonini hisoblaymiz
  const buttonCount = data.buttons?.flat().length || 0;

  return (
    <Card className={cn("w-80 shadow-lg", selected && "ring-2 ring-primary")}>
      <Handle type="target" position={Position.Top} className="!bg-sky-500" />

      <CardHeader
        className="flex flex-row items-center justify-between space-y-0 p-3 cursor-pointer"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <FiFileText className="text-primary" />
          Fayl Yuborish
        </CardTitle>
        <div className="flex items-center gap-2">
          {/* Tugmalar sonini ko'rsatuvchi Badge */}
          {buttonCount > 0 && (
            <Badge variant="secondary" className="font-normal">
              <LayoutGrid className="w-3 h-3 mr-1" />
              {buttonCount}
            </Badge>
          )}
          <div className="text-muted-foreground">
            {isCollapsed ? (
              <ChevronDown />
            ) : (
              <ChevronDown className="rotate-180" />
            )}
          </div>
        </div>
      </CardHeader>

      {!isCollapsed && (
        <>
          <CardContent className="p-4 pt-0 flex flex-col gap-4">
            {/* Qabul qiluvchi */}
            <div className="grid gap-2">
              <Label>Qabul qiluvchi</Label>
              <ToggleGroup
                type="single"
                value={data.recipientType}
                onValueChange={(value: RecipientType) =>
                  value && handleUpdate({ recipientType: value })
                }
                className="w-full grid grid-cols-2"
              >
                <ToggleGroupItem value="sender">Yuboruvchiga</ToggleGroupItem>
                <ToggleGroupItem value="custom_id">ID bo'yicha</ToggleGroupItem>
              </ToggleGroup>
              {data.recipientType === "custom_id" && (
                <Input
                  placeholder="Chat yoki foydalanuvchi ID"
                  value={data.chatId || ""}
                  onChange={(e) => handleUpdate({ chatId: e.target.value })}
                />
              )}
            </div>

            {/* Fayl manbasi */}
            <div className="grid gap-2">
              <Label>Fayl manbasi</Label>
              <Select
                value={data.fileSourceType}
                onValueChange={(value: FileSourceType) =>
                  handleUpdate({ fileSourceType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Manbani tanlang..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="file_id">Mavjud File ID</SelectItem>
                  <SelectItem value="url">Internet (URL)</SelectItem>
                  <SelectItem value="upload">Kompyuterdan yuklash</SelectItem>
                </SelectContent>
              </Select>
              {data.fileSourceType === "file_id" && (
                <Input
                  placeholder="fayl_idsi..."
                  value={data.fileId || ""}
                  onChange={(e) => handleUpdate({ fileId: e.target.value })}
                />
              )}
              {data.fileSourceType === "url" && (
                <Input
                  placeholder="https://example.com/document.pdf"
                  value={data.fileUrl || ""}
                  onChange={(e) => handleUpdate({ fileUrl: e.target.value })}
                />
              )}
            </div>

            {/* Maxsus muqova */}
            <div className="flex items-center justify-between space-y-0 rounded-lg border p-3">
              <div className="space-y-0.5">
                <Label htmlFor={`custom-thumb-${id}`}>Maxsus muqova</Label>
                <p className="text-xs text-muted-foreground">
                  Fayl uchun rasmli muqova.
                </p>
              </div>
              <Switch
                id={`custom-thumb-${id}`}
                checked={!!data.hasCustomThumbnail}
                onCheckedChange={(checked) =>
                  handleUpdate({ hasCustomThumbnail: checked })
                }
              />
            </div>
            {data.hasCustomThumbnail && (
              <Input
                placeholder="Muqova uchun File ID"
                value={data.thumbnailFileId || ""}
                onChange={(e) =>
                  handleUpdate({ thumbnailFileId: e.target.value })
                }
                className="animate-in fade-in-50"
              />
            )}

            {/* Caption */}
            <div className="grid gap-2">
              <Label>Izoh (Caption)</Label>
              <TextareaAutosize
                className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Fayl uchun izoh..."
                value={data.caption || ""}
                onChange={(e) => handleUpdate({ caption: e.target.value })}
                maxLength={1024}
              />
              <div
                className={cn(
                  "text-right text-xs",
                  captionLength > 1024
                    ? "text-destructive"
                    : "text-muted-foreground"
                )}
              >
                {captionLength}/1024
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-wrap justify-around items-center gap-4 pt-4 border-t">
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`disable-notification-${id}`}
                checked={!!data.disableNotification}
                onCheckedChange={(checked) =>
                  handleUpdate({ disableNotification: !!checked })
                }
              />
              <Label
                htmlFor={`disable-notification-${id}`}
                className="text-sm font-normal cursor-pointer"
              >
                Ovozsiz
              </Label>
            </div>

            {/* --- BUTTON GENERATOR INTEGRATSIYASI --- */}
            <ButtonGenerator
              initialButtons={data.buttons}
              onSave={handleSaveButtons}
            >
              <div className="relative">
                <Button variant="outline">
                  <LayoutGrid className="mr-2 h-4 w-4" />
                  Buttons
                </Button>
                {buttonCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 rounded-full"
                  >
                    {buttonCount}
                  </Badge>
                )}
              </div>
            </ButtonGenerator>
          </CardFooter>
        </>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-teal-500"
      />
    </Card>
  );
};

export const SendFileNode = memo(SendFileNodeComponent);

// "use client";

// import { useState, memo } from "react";
// import { Handle, Position, NodeProps } from "reactflow";
// import TextareaAutosize from "react-textarea-autosize";
// import { FiFileText, FiChevronDown, FiHelpCircle } from "react-icons/fi";
// import {
//   Card,
//   CardHeader,
//   CardTitle,
//   CardContent,
//   CardFooter,
// } from "@/components/ui/card";
// import { Label } from "@/components/ui/label";
// import { Input } from "@/components/ui/input";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Switch } from "@/components/ui/switch";
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipProvider,
//   TooltipTrigger,
// } from "@/components/ui/tooltip";
// import { cn } from "@/lib/utils";
// import { useFlowStore } from "@/constructor/store/flowStore";
// import { SendFileNodeData, RecipientType, FileSourceType } from "./types";
// import { ChevronDown } from "lucide-react";

// const SendFileNodeComponent = ({
//   id,
//   data,
//   selected,
// }: NodeProps<SendFileNodeData>) => {
//   const updateNodeData = useFlowStore((state) => state.updateNodeData);
//   const [isCollapsed, setIsCollapsed] = useState(false);

//   const handleUpdate = (update: Partial<SendFileNodeData>) => {
//     updateNodeData(id, update);
//   };

//   const captionLength = data.caption?.length || 0;

//   return (
//     <Card className={cn("w-80 shadow-lg", selected && "ring-2 ring-primary")}>
//       <Handle type="target" position={Position.Top} className="!bg-sky-500" />

//       <CardHeader
//         className="flex flex-row items-center justify-between space-y-0 p-3 cursor-pointer"
//         onClick={() => setIsCollapsed(!isCollapsed)}
//       >
//         <CardTitle className="flex items-center gap-2 text-base font-semibold">
//           <FiFileText className="text-primary" />
//           Fayl Yuborish
//         </CardTitle>
//         <div className="text-muted-foreground">
//           {isCollapsed ? (
//             <ChevronDown />
//           ) : (
//             <ChevronDown className="rotate-180" />
//           )}
//         </div>
//       </CardHeader>

//       {!isCollapsed && (
//         <>
//           <CardContent className="p-4 pt-0 flex flex-col gap-4">
//             {/* Qabul qiluvchi */}
//             <div className="grid gap-2">
//               <Label>Qabul qiluvchi</Label>
//               <ToggleGroup
//                 type="single"
//                 value={data.recipientType}
//                 onValueChange={(value: RecipientType) =>
//                   value && handleUpdate({ recipientType: value })
//                 }
//                 className="w-full grid grid-cols-2"
//               >
//                 <ToggleGroupItem value="sender">Yuboruvchiga</ToggleGroupItem>
//                 <ToggleGroupItem value="custom_id">ID bo'yicha</ToggleGroupItem>
//               </ToggleGroup>
//               {data.recipientType === "custom_id" && (
//                 <Input
//                   placeholder="Chat yoki foydalanuvchi ID"
//                   value={data.chatId || ""}
//                   onChange={(e) => handleUpdate({ chatId: e.target.value })}
//                 />
//               )}
//             </div>

//             {/* Fayl manbasi */}
//             <div className="grid gap-2">
//               <Label>Fayl manbasi</Label>
//               <Select
//                 value={data.fileSourceType}
//                 onValueChange={(value: FileSourceType) =>
//                   handleUpdate({ fileSourceType: value })
//                 }
//               >
//                 <SelectTrigger>
//                   <SelectValue placeholder="Manbani tanlang..." />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="file_id">Mavjud File ID</SelectItem>
//                   <SelectItem value="url">Internet (URL)</SelectItem>
//                   <SelectItem value="upload">Kompyuterdan yuklash</SelectItem>
//                 </SelectContent>
//               </Select>
//               {data.fileSourceType === "file_id" && (
//                 <Input
//                   placeholder="fayl_idsi..."
//                   value={data.fileId || ""}
//                   onChange={(e) => handleUpdate({ fileId: e.target.value })}
//                 />
//               )}
//               {data.fileSourceType === "url" && (
//                 <Input
//                   placeholder="https://example.com/document.pdf"
//                   value={data.fileUrl || ""}
//                   onChange={(e) => handleUpdate({ fileUrl: e.target.value })}
//                 />
//               )}
//             </div>

//             {/* Maxsus muqova */}
//             <div className="flex items-center justify-between space-y-0 rounded-lg border p-3">
//               <div className="space-y-0.5">
//                 <Label htmlFor={`custom-thumb-${id}`}>Maxsus muqova</Label>
//                 <p className="text-xs text-muted-foreground">
//                   Fayl uchun rasmli muqova.
//                 </p>
//               </div>
//               <Switch
//                 id={`custom-thumb-${id}`}
//                 checked={!!data.hasCustomThumbnail}
//                 onCheckedChange={(checked) =>
//                   handleUpdate({ hasCustomThumbnail: checked })
//                 }
//               />
//             </div>
//             {data.hasCustomThumbnail && (
//               <Input
//                 placeholder="Muqova uchun File ID"
//                 value={data.thumbnailFileId || ""}
//                 onChange={(e) =>
//                   handleUpdate({ thumbnailFileId: e.target.value })
//                 }
//                 className="animate-in fade-in-50"
//               />
//             )}

//             {/* Caption */}
//             <div className="grid gap-2">
//               <Label>Izoh (Caption)</Label>
//               <TextareaAutosize
//                 className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
//                 placeholder="Fayl uchun izoh..."
//                 value={data.caption || ""}
//                 onChange={(e) => handleUpdate({ caption: e.target.value })}
//                 maxLength={1024}
//               />
//               <div
//                 className={cn(
//                   "text-right text-xs",
//                   captionLength > 1024
//                     ? "text-destructive"
//                     : "text-muted-foreground"
//                 )}
//               >
//                 {captionLength}/1024
//               </div>
//             </div>
//           </CardContent>

//           <CardFooter className="flex flex-wrap justify-around gap-y-4">
//             <div className="flex items-center space-x-2">
//               <Checkbox
//                 id={`disable-notification-${id}`}
//                 checked={!!data.disableNotification}
//                 onCheckedChange={(checked) =>
//                   handleUpdate({ disableNotification: !!checked })
//                 }
//               />
//               <Label
//                 htmlFor={`disable-notification-${id}`}
//                 className="text-sm font-normal cursor-pointer"
//               >
//                 Ovozsiz
//               </Label>
//             </div>
//             <div className="flex items-center space-x-2">
//               <Checkbox
//                 id={`protect-content-${id}`}
//                 checked={!!data.protectContent}
//                 onCheckedChange={(checked) =>
//                   handleUpdate({ protectContent: !!checked })
//                 }
//               />
//               <Label
//                 htmlFor={`protect-content-${id}`}
//                 className="text-sm font-normal cursor-pointer"
//               >
//                 Himoyalangan
//               </Label>
//             </div>
//             <div className="flex items-center space-x-2">
//               <TooltipProvider delayDuration={100}>
//                 <Tooltip>
//                   <TooltipTrigger asChild>
//                     <div className="flex items-center gap-2">
//                       <Checkbox
//                         id={`disable-mime-${id}`}
//                         checked={!!data.disableContentTypeDetection}
//                         onCheckedChange={(checked) =>
//                           handleUpdate({
//                             disableContentTypeDetection: !!checked,
//                           })
//                         }
//                       />
//                       <Label
//                         htmlFor={`disable-mime-${id}`}
//                         className="text-sm font-normal cursor-pointer"
//                       >
//                         MIME-turini o'chirish
//                       </Label>
//                       <FiHelpCircle className="text-muted-foreground" />
//                     </div>
//                   </TooltipTrigger>
//                   <TooltipContent>
//                     <p>Telegram fayl turini aniqlashga urinmaydi.</p>
//                   </TooltipContent>
//                 </Tooltip>
//               </TooltipProvider>
//             </div>
//           </CardFooter>
//         </>
//       )}

//       <Handle
//         type="source"
//         position={Position.Bottom}
//         className="!bg-teal-500"
//       />
//     </Card>
//   );
// };

// export const SendFileNode = memo(SendFileNodeComponent);
