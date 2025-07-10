// FAYL: constructor/components/ButtonGenerator/components/LoginUrlForm.tsx (YANGI)
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { LoginUrlConfig } from "../types";

interface LoginUrlFormProps {
  config: Partial<LoginUrlConfig>;
  onConfigChange: (newConfig: Partial<LoginUrlConfig>) => void;
}

export const LoginUrlForm = ({ config, onConfigChange }: LoginUrlFormProps) => {
  const handleChange = (field: keyof LoginUrlConfig, value: any) => {
    onConfigChange({ ...config, [field]: value });
  };

  return (
    <div className="space-y-3 p-3 border rounded-md bg-muted/50">
      <div className="grid gap-2">
        <Label htmlFor="login-url">Login URL</Label>
        <Input
          id="login-url"
          placeholder="https://auth.example.com/login"
          value={config.url || ""}
          onChange={(e) => handleChange("url", e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="forward-text">Forward matni (ixtiyoriy)</Label>
        <Input
          id="forward-text"
          placeholder="Kirish uchun bosing"
          value={config.forward_text || ""}
          onChange={(e) => handleChange("forward_text", e.target.value)}
        />
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="write-access"
          checked={!!config.request_write_access}
          onCheckedChange={(checked) =>
            handleChange("request_write_access", checked)
          }
        />
        <Label htmlFor="write-access" className="font-normal cursor-pointer">
          Botga yozish uchun ruxsat so'rash
        </Label>
      </div>
    </div>
  );
};
