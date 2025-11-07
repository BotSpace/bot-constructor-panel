// FAYL: constructor/components/ButtonGenerator/components/WebAppForm.tsx (YANGI)
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface WebAppFormProps {
  url: string;
  onUrlChange: (url: string) => void;
}

export const WebAppForm = ({ url, onUrlChange }: WebAppFormProps) => (
  <div className="grid gap-2">
    <Label htmlFor="webapp-url">Web App URL</Label>
    <Input
      id="webapp-url"
      placeholder="https://example.com/webapp"
      value={url}
      onChange={(e) => onUrlChange(e.target.value)}
    />
  </div>
);
