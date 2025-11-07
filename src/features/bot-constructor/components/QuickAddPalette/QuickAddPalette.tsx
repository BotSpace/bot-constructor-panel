"use client";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Elements } from "@/features/bot-constructor/data/elements";
import { ElementItemType } from "@/types/element-types";

interface QuickAddPaletteProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSelect: (element: ElementItemType) => void;
}

export function QuickAddPalette({
  isOpen,
  onOpenChange,
  onSelect,
}: QuickAddPaletteProps) {
  const handleSelect = (element: ElementItemType) => {
    onSelect(element);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 shadow-lg">
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          <CommandInput placeholder="Element qidirish..." />
          <CommandList>
            <CommandEmpty>Hech narsa topilmadi.</CommandEmpty>
            {Elements.map((group) => (
              <CommandGroup key={group.title} heading={group.title}>
                {group.elements.map((element) => (
                  <CommandItem
                    key={element.triggerId || element.name}
                    onSelect={() => handleSelect(element)}
                    className="cursor-pointer"
                  >
                    <span className="mr-2 text-lg">{element.icon}</span>
                    <span>{element.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
