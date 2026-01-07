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
import { Database, Key, Type } from "lucide-react";
import { StateConfig, StateType } from "./state-config-types";
import { Checkbox } from "@/components/ui/checkbox";

interface StateConfigComponentProps {
  state?: StateConfig;
  onStateChange: (state?: StateConfig) => void;
  availableTypes: StateType[];
  nodeId: string;
}

const StateConfigComponent = ({
  state,
  onStateChange,
  availableTypes,
  nodeId,
}: StateConfigComponentProps) => {
  const [enabled, setEnabled] = useMemo(
    () => [!!state, (val: boolean) => !val && onStateChange(undefined)],
    [state, onStateChange]
  );

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
      onStateChange({ ...state, type: type as StateType });
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

  return (
    <div className="space-y-3 pt-2 border-t border-gray-700/50">
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

      {enabled && state && (
        <div className="space-y-3 pl-6 animate-in fade-in-50 slide-in-from-top-1">
          <div className="space-y-1.5">
            <Label
              htmlFor={`state-key-${nodeId}`}
              className="text-xs text-gray-400 flex items-center gap-1.5 font-medium"
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
              className="w-full h-9 bg-gray-800/50 border-gray-600/50 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all text-sm"
            />
            <p className="text-xs text-gray-500">
              Ma'lumot <code className="text-purple-400">state_{state.key || "key"}</code> ga saqlanadi
            </p>
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor={`state-type-${nodeId}`}
              className="text-xs text-gray-400 flex items-center gap-1.5 font-medium"
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
        </div>
      )}
    </div>
  );
};

export const StateConfigUI = memo(StateConfigComponent);
