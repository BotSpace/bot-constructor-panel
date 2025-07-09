import { memo } from "react";
import { NodeProps } from "reactflow";
import { cn } from "@/lib/utils";

// Bu node hech qanday data qabul qilmaydi
const HelperNodeComponent = ({ selected }: NodeProps) => {
  return (
    <>
      {/* Bu node ga chiziq ulab bo'lmasligi uchun Handle'larni qo'shmaymiz */}
      <div
        className={cn(
          "w-3 h-3 bg-gray-500/30 rounded-full backdrop-blur-sm border border-gray-400/50 transition-all duration-150",
          "hover:bg-primary/50 hover:border-primary",
          selected && "ring-2 ring-primary bg-primary/70 border-primary"
        )}
        title="Yordamchi Tugun: Chiziq yo'nalishini boshqarish uchun"
      />
    </>
  );
};

export const HelperNode = memo(HelperNodeComponent);
