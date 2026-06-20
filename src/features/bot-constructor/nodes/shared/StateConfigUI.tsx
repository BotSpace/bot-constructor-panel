import { memo, useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Database, Key, Type, X } from "lucide-react";
import { StateConfig, StateType } from "@/features/bot-constructor/nodes/shared/state-config-types";
import { Checkbox } from "@/components/ui/checkbox";

interface StateConfigComponentProps {
  state?: StateConfig;
  onStateChange: (state?: StateConfig) => void;
  availableTypes: StateType[];
  nodeId: string;
  /** Optional ("+" bilan qo'shiladigan) oqim: enable-checkbox o'rniga
   *  to'g'ridan-to'g'ri fieldlar + "olib tashlash" tugmasi ko'rsatiladi. */
  hideToggle?: boolean;
  onRemove?: () => void;
}

const StateConfigComponent = ({
  state,
  onStateChange,
  availableTypes,
  nodeId,
  hideToggle,
  onRemove,
}: StateConfigComponentProps) => {
  const enabled = !!state;

  const handleKeyChange = (key: string) => {
    if (state) {
      onStateChange({ ...state, key });
    } else {
      // Default to first available type if enabling
      onStateChange({ key, type: availableTypes[0] || "text" });
    }
  };

  const handleTypeChange = (type: string) => {
    if (state) {
      if (type === "Custom") {
        onStateChange({ ...state, type: "Custom", customType: state.customType ?? "" });
      } else {
        onStateChange({ ...state, type: type as StateType, customType: undefined });
      }
    }
  };

  const handleCustomTypeChange = (customType: string) => {
    if (state) {
      onStateChange({ ...state, customType });
    }
  };

  const handleEnabledChange = (checked: boolean) => {
    if (checked) {
      // Enable with defaults
      onStateChange({ key: "", type: availableTypes[0] || "text" });
    } else {
      // Disable
      onStateChange(undefined);
    }
  };

  const fields = state ? (
    <div className="space-y-3 pl-6 animate-in fade-in-50 slide-in-from-top-1">
          <div className="space-y-1.5">
            <Label
              htmlFor={`state-key-${nodeId}`}
              className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium"
            >
              <Key className="h-3 w-3" />
              State Key
            </Label>
            <Input
              id={`state-key-${nodeId}`}
              type="text"
              placeholder="Masalan: user_message, phone, etc."
              value={state.key || ""}
              onChange={(e) => handleKeyChange(e.target.value)}
              className="w-full h-9 bg-muted/50 border-border focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Ma'lumot <code className="text-purple-400">state_{state.key || "key"}</code> ga saqlanadi
            </p>
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor={`state-type-${nodeId}`}
              className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium"
            >
              <Type className="h-3 w-3" />
              Ma'lumot Turi
            </Label>
            <Select
              value={state.type}
              onValueChange={handleTypeChange}
            >
              <SelectTrigger id={`state-type-${nodeId}`} className="w-full h-9 text-sm">
                <SelectValue placeholder="Type tanlang" />
              </SelectTrigger>
              <SelectContent>
                {availableTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {state.type === "Custom" && (
            <div className="space-y-1.5">
              <Label
                htmlFor={`state-customtype-${nodeId}`}
                className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium"
              >
                <Type className="h-3 w-3" />
                Custom type
              </Label>
              <Input
                id={`state-customtype-${nodeId}`}
                type="text"
                placeholder="Masalan: my_custom_state"
                value={state.customType ?? ""}
                onChange={(e) => handleCustomTypeChange(e.target.value)}
                className="w-full h-9 bg-muted/50 border-border focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all text-sm"
              />
            </div>
          )}
    </div>
  ) : null;

  // Optional "+" oqimi: checkbox o'rniga sarlavha + "olib tashlash" tugmasi,
  // fieldlar darhol ko'rinadi (state allaqachon parent tomonidan init qilingan).
  if (hideToggle) {
    return (
      <div className="space-y-3 pt-2 border-t border-border">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium flex items-center gap-1.5">
            <Database className="h-3.5 w-3.5 text-purple-400" />
            Ma'lumotni saqlash
          </Label>
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="flex items-center gap-1 text-xs text-zinc-500 transition-colors hover:text-red-400"
            >
              <X className="h-3.5 w-3.5" />
              Olib tashlash
            </button>
          )}
        </div>
        {fields}
      </div>
    );
  }

  return (
    <div className="space-y-3 pt-2 border-t border-border">
      <div className="flex items-center gap-2">
        <Checkbox
          id={`state-enabled-${nodeId}`}
          checked={enabled}
          onCheckedChange={handleEnabledChange}
        />
        <Label
          htmlFor={`state-enabled-${nodeId}`}
          className="text-sm font-medium cursor-pointer flex items-center gap-1.5"
        >
          <Database className="h-3.5 w-3.5 text-purple-400" />
          Ma'lumotni saqlash
        </Label>
      </div>

      {enabled && fields}
    </div>
  );
};

export const StateConfigUI = memo(StateConfigComponent);
