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
import { SourceHandler, TargetHandler } from "../../components";
import { CustomCodeNodeData } from "./types";
import { CodeEditorDialog } from "./components/CodeEditorDialog";

const DEFAULT_CODE = `# Ushbu kod sxema shu nuqtaga yetganda ishga tushadi.
# Sizga quyidagi o'zgaruvchilar taqdim etiladi:
#
# bot: aiogram.Bot              - Bot obyekti
# chat_id: int                  - Hozirgi chat ID'si
# message: aiogram.types.Message - Trigger bo'lgan xabar (mavjud bo'lsa)
# callback: aiogram.types.CallbackQuery - Trigger bo'lgan callback (mavjud bo'lsa)
# context: dict                 - Sxema konteksti, o'zgaruvchilarni saqlaydi
#
# Siz 'context' lug'atiga yangi qiymatlar qo'shishingiz mumkin,
# ular keyingi node'larda ishlatiladi.

# Misol: Foydalanuvchi nomini 'user_name' o'zgaruvchisiga saqlash
if message:
    context['user_name'] = message.from_user.first_name
    print(f"Foydalanuvchi {context['user_name']} kodni ishga tushirdi.")

# Misol: Bot orqali javob yuborish
# await bot.send_message(chat_id, f"Salom, {context.get('user_name', 'Noma'lum')}!")
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
    updateNodeData(id, { pythonCode: newCode });
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateNodeData(id, { nodeTitle: e.target.value });
  };

  const hasCode = data.pythonCode && data.pythonCode.trim() !== "";
  const codePreview = generateCodePreview(data.pythonCode);

  return (
    <Card className={cn("w-80 shadow-lg", selected && "ring-2 ring-primary")}>
      <TargetHandler />

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
            initialCode={data.pythonCode || DEFAULT_CODE}
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
      <SourceHandler />
    </Card>
  );
};

export const CustomCodeNode = memo(CustomCodeNodeComponent);
