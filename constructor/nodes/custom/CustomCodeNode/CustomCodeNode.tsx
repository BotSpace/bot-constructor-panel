import { memo, useState } from "react";
import { Handle, NodeProps, Position } from "reactflow";
import { useFlowStore } from "@/constructor/store";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Code2, PenLine } from "lucide-react";
import { CodeEditorDialog } from "./CodeEditorDialog";
import { NodeHeader } from "@/constructor/nodes/actions/shared/NodeHeader"; // <-- Bizning umumiy sarlavha
import { SourceHandler, TargetHandler } from "../../components";

interface CustomCodeNodeData {
  pythonCode?: string;
}

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

const CustomCodeNodeComponent = ({
  id,
  data,
  selected,
}: NodeProps<CustomCodeNodeData>) => {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const [isCollapsed, setIsCollapsed] = useState(true);

  // Standart kontekst turini 'message' deb belgilaymiz

  const handleSaveCode = (newCode: string) => {
    updateNodeData(id, { pythonCode: newCode });
  };

  const hasCode = !!data.pythonCode?.trim();

  return (
    <Card className={cn("w-80 shadow-lg", selected && "ring-2 ring-primary")}>
      <TargetHandler />

      <NodeHeader
        icon={<Code2 className="text-yellow-400" />}
        title="Custom Code"
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {!isCollapsed && (
        <CardContent className="p-4 pt-0">
          <CodeEditorDialog
            initialCode={data.pythonCode || DEFAULT_CODE}
            onSave={handleSaveCode}
            contextType={"message"}
          >
            <div className="flex flex-col items-center justify-center text-center p-4 border border-dashed rounded-lg hover:bg-muted cursor-pointer transition-colors">
              <PenLine className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="font-semibold">Kodni Tahrirlash</p>
              <p className="text-xs text-muted-foreground">
                {hasCode
                  ? "Kod mavjud. O'zgartirish uchun bosing."
                  : "Python kodi yozish uchun bosing."}
              </p>
            </div>
          </CodeEditorDialog>
        </CardContent>
      )}

      <SourceHandler />
    </Card>
  );
};

export const CustomCodeNode = memo(CustomCodeNodeComponent);
