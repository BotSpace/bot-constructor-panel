import { AppButton } from "./types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Trash2, X } from "lucide-react";

interface ConfigSidebarProps {
  selectedButton: AppButton | null;
  onUpdateButton: (button: AppButton) => void;
  onDeleteButton: (buttonId: string) => void;
  onClearSelection: () => void;
}

export function ConfigSidebar({
  selectedButton,
  onUpdateButton,
  onDeleteButton,
  onClearSelection,
}: ConfigSidebarProps) {
  if (!selectedButton) {
    return (
      <Card className="h-full flex flex-col items-center justify-center text-center">
        <CardHeader>
          <CardTitle>Tugma tanlanmagan</CardTitle>
          <CardDescription>
            Tahrirlash uchun previewdan biror tugmani tanlang.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const handleUpdate = (field: keyof AppButton, value: any) => {
    onUpdateButton({ ...selectedButton, [field]: value });
  };

  return (
    <Card className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2"
        onClick={onClearSelection}
      >
        <X className="h-4 w-4" />
      </Button>
      <CardHeader>
        <CardTitle>Tugma sozlamalari</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="btn-text">Tugma matni</Label>
          <Input
            id="btn-text"
            value={selectedButton.text}
            onChange={(e) => handleUpdate("text", e.target.value)}
          />
        </div>
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <Label htmlFor="req-contact">Kontakt so'rash</Label>
          <Switch
            id="req-contact"
            checked={selectedButton.request_contact}
            onCheckedChange={(checked) =>
              handleUpdate("request_contact", checked)
            }
          />
        </div>
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <Label htmlFor="req-location">Lokatsiya so'rash</Label>
          <Switch
            id="req-location"
            checked={selectedButton.request_location}
            onCheckedChange={(checked) =>
              handleUpdate("request_location", checked)
            }
          />
        </div>
        <Button
          variant="destructive"
          className="w-full"
          onClick={() => onDeleteButton(selectedButton.id)}
        >
          <Trash2 className="w-4 h-4 mr-2" /> O'chirish
        </Button>
      </CardContent>
    </Card>
  );
}
