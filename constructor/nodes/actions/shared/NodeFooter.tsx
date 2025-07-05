import { CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LayoutGrid } from "lucide-react";
import {
  ButtonGenerator,
  ButtonConfig,
} from "@/constructor/components/ButtonGenerator";

interface NodeFooterProps {
  nodeId: string;
  buttons?: ButtonConfig[][];
  disableNotification?: boolean;
  protectContent?: boolean;
  onUpdate: (
    update: Partial<{
      buttons: ButtonConfig[][];
      disableNotification: boolean;
      protectContent: boolean;
    }>
  ) => void;
}

export const NodeFooter = ({
  nodeId,
  buttons,
  disableNotification,
  protectContent,
  onUpdate,
}: NodeFooterProps) => {
  const buttonCount = buttons?.flat().length || 0;

  const handleSaveButtons = (newButtons: ButtonConfig[][]) => {
    onUpdate({ buttons: newButtons });
  };

  return (
    <CardFooter className="flex flex-col items-center gap-4 pt-4 border-t">
      <div className="flex w-full justify-around">
        <div className="flex items-center space-x-2">
          <Checkbox
            id={`disable-notification-${nodeId}`}
            checked={!!disableNotification}
            onCheckedChange={(checked) =>
              onUpdate({ disableNotification: !!checked })
            }
          />
          <Label
            htmlFor={`disable-notification-${nodeId}`}
            className="text-sm font-normal cursor-pointer"
          >
            Ovozsiz
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id={`protect-content-${nodeId}`}
            checked={!!protectContent}
            onCheckedChange={(checked) =>
              onUpdate({ protectContent: !!checked })
            }
          />
          <Label
            htmlFor={`protect-content-${nodeId}`}
            className="text-sm font-normal cursor-pointer"
          >
            Himoyalangan
          </Label>
        </div>
      </div>

      <ButtonGenerator initialButtons={buttons} onSave={handleSaveButtons}>
        <div className="relative w-full">
          <Button variant="outline" className="w-full">
            <LayoutGrid className="mr-2 h-4 w-4" />
            Tugmalarni Sozlash
          </Button>
          {buttonCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 px-1.5"
            >
              {buttonCount}
            </Badge>
          )}
        </div>
      </ButtonGenerator>
    </CardFooter>
  );
};
