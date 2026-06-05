import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppWindow } from "lucide-react";
import { cn } from "@/lib/utils";

interface WebAppFormProps {
  url: string;
  onUrlChange: (url: string) => void;
}

export const WebAppForm = ({ url, onUrlChange }: WebAppFormProps) => {
  const isInvalid = url.length > 0 && !url.startsWith("https://");

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 rounded-md border border-blue-500/20 bg-blue-500/10 px-2.5 py-2 text-xs text-blue-600 dark:text-blue-400">
        <AppWindow className="h-3.5 w-3.5 shrink-0" />
        <span>Telegram Mini App uchun faqat <b>https://</b> URL qabul qilinadi</span>
      </div>
      <div>
        <Label htmlFor="webapp-url" className="text-xs mb-1.5 block">
          Web App URL
        </Label>
        <Input
          id="webapp-url"
          placeholder="https://app.example.com"
          value={url}
          onChange={(e) => onUrlChange(e.target.value)}
          className={cn(
            "h-8 text-sm",
            isInvalid && "border-destructive focus-visible:ring-destructive"
          )}
        />
        {isInvalid && (
          <p className="mt-1 text-[11px] text-destructive">
            URL https:// bilan boshlanishi shart
          </p>
        )}
      </div>
    </div>
  );
};
