import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConstructorData } from "@/features/bot-constructor/data";

interface TypeSelectorProps {
  value: string;
  onValueChange: (newType: string) => void;
}

export const TypeSelector = ({ value, onValueChange }: TypeSelectorProps) => (
  <Select value={value || ""} onValueChange={onValueChange}>
    <SelectTrigger className="h-8 w-full text-xs">
      <SelectValue placeholder="Tanlang..." />
    </SelectTrigger>
    <SelectContent>
      {ConstructorData.MessageTypes.map((type) => (
        <SelectItem key={type.value} value={type.value}>
          <div className="flex items-center gap-2">
            <type.icon className="h-3 w-3" />
            <span>{type.label}</span>
          </div>
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);
