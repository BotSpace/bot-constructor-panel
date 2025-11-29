"use client";

import { memo, useState } from "react";
import { NodeProps } from "reactflow";
import { useFlowStore } from "@/features/bot-constructor/store";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Code2, PenLine } from "lucide-react";
import { NodeHeader } from "@/features/bot-constructor/nodes/actions/shared/NodeHeader";
import { SourceHandles, TargetHandles } from "../../components";
import { CustomCodeNodeData } from "./types";
import { CodeEditorDialog } from "./components/CodeEditorDialog";

const DEFAULT_CODE = `
// Ushbu kod handler ichida ishlaydi.
// Sizga quyidagi o'zgaruvchilar taqdim etiladi:
//
// bot      - bot obyekti
// ctx      - Telegraf/Aiogram.js konteksti (message yoki callback)
// context  - Sxema konteksti (o'zgaruvchilarni saqlaydi)
//
// context ichiga yangi qiymatlar qo'shish mumkin.

// Agar xabar bo'lsa
if (ctx.message) {
    context.user_name = ctx.message.from.first_name;
    console.log(\`Foydalanuvchi \${context.user_name} kodni ishga tushirdi.\`);
}

// Bot orqali javob yuborish
await bot.telegram.sendMessage(
    ctx.chat.id,
    \`Salom, \${context.user_name || 'Nomaʼlum'} !\`
);
`;

// Kod prevyusini yaratuvchi yordamchi funksiya
const generateCodePreview = (code: string | undefined): string => {
  if (!code || code.trim() === "") {
    return "";
  }
  // Kodni qatorlarga bo'lib, bo'sh va izohli qatorlarni olib tashlaymiz
  const lines = code
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));
  // Birinchi 3-4 qatorni olamiz
  return lines.slice(0, 4).join("\n");
};

const CustomCodeNodeComponent = ({
  id,
  data,
  selected,
}: NodeProps<CustomCodeNodeData>) => {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleSave = (newCode: string) => {
    updateNodeData(id, { jsCode: newCode });
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateNodeData(id, { nodeTitle: e.target.value });
  };

  const hasCode = data.jsCode && data.jsCode.trim() !== "";
  const codePreview = generateCodePreview(data.jsCode);

  return (
    <Card className={cn("w-80 shadow-lg", selected && "ring-2 ring-primary")}>
      <TargetHandles />

      <NodeHeader
        icon={<Code2 className="text-yellow-400" />}
        title={data.nodeTitle || "Custom Code"}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {isCollapsed ? (
        <CardContent className="p-3 text-xs text-muted-foreground">
          <pre className="font-mono bg-muted/50 p-2 rounded-md overflow-hidden max-h-24">
            <code>{codePreview || "Kod mavjud emas..."}</code>
          </pre>
        </CardContent>
      ) : (
        <CardContent className="p-4 pt-0 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor={`node-title-${id}`}>Node nomi</Label>
            <Input
              id={`node-title-${id}`}
              placeholder="Masalan, Foydalanuvchini tekshirish"
              value={data.nodeTitle || ""}
              onChange={handleTitleChange}
            />
          </div>

          <CodeEditorDialog
            initialCode={data.jsCode || DEFAULT_CODE}
            onSave={handleSave}
            contextType={"message"}
          >
            {/* --- ASOSIY O'ZGARISH SHU YERDA --- */}
            {hasCode ? (
              // Agar kod mavjud bo'lsa, uning prevyusini ko'rsatamiz
              <div className="p-3 border border-dashed rounded-lg hover:bg-muted cursor-pointer transition-colors text-left">
                <p className="text-xs text-muted-foreground mb-2">
                  Kod prevyusi (tahrirlash uchun bosing):
                </p>
                <pre className="font-mono text-xs bg-black/20 p-2 rounded-md overflow-hidden max-h-24">
                  <code>{codePreview}</code>
                </pre>
              </div>
            ) : (
              // Agar kod mavjud bo'lmasa, tahrirlashga taklif qilamiz
              <div className="flex flex-col items-center justify-center text-center p-4 border border-dashed rounded-lg hover:bg-muted cursor-pointer transition-colors">
                <PenLine className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="font-semibold">
                  Python kodeni tahrirlash uchun bosing
                </p>
              </div>
            )}
            {/* --- O'ZGARISH TUGADI --- */}
          </CodeEditorDialog>
        </CardContent>
      )}
      <SourceHandles />
    </Card>
  );
};

export const CustomCodeNode = memo(CustomCodeNodeComponent);
