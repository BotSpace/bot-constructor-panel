import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { SearchIcon } from "lucide-react";
import React, { useMemo, useState } from "react";
import { useFlowStore } from "@/features/bot-constructor/store";
import { useReactFlow } from "reactflow";
import { useSearchStore } from "@/features/bot-constructor/panels/search/search-store";
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

type Props = {};

function SearchPanel({ }: Props) {
  const { setCenter } = useReactFlow();
  const { nodes } = useFlowStore();
  const { searchPanelIsOpen, toggleSearchPanel } = useSearchStore();
  const [search, setSearch] = useState<string>("");

  useKeyboardShortcut(
    ["Control", "f"],
    () => {
      toggleSearchPanel();
    },
    { preventDefault: true }
  );

  function getItemTextConten(item: any) {
    const value = item.data.messageText || item.data.caption || item.data.command || item.data?.context?.value || item.data.newText || "";
    return value
  }

  // 👉 Best practice: useMemo bilan filterni optimallashtiramiz
  const filteredNodes = useMemo(() => {
    if (!search.trim()) return nodes; // bo‘sh bo‘lsa hamma node qaytadi

    return nodes.filter((item) => {
      const value = getItemTextConten(item);
      if (!value) return false;
      return value.toLowerCase().includes(search.toLowerCase());
    });
  }, [search, nodes]);

  return (
    <Sheet
      open={searchPanelIsOpen}
      onOpenChange={(open) => {
        if (open !== searchPanelIsOpen) toggleSearchPanel();
      }}
      modal={false}
    >
      <SheetContent
        side="right"
        showOverlay={false}
        showCloseButton={false}
        onInteractOutside={() => toggleSearchPanel()}
        className="w-full gap-0 overflow-hidden border-l border-white/10 bg-[#141414] p-0 text-white shadow-2xl sm:max-w-[420px]"
      >
        <SheetHeader className="shrink-0 gap-0 space-y-0 border-b border-white/10 bg-[#171717] px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
              <SearchIcon className="h-4 w-4 text-zinc-400" />
            </div>
            <div className="min-w-0 flex-1">
              <SheetTitle className="text-base font-semibold leading-tight text-white">
                Search
              </SheetTitle>
              <SheetDescription className="mt-0.5 text-xs text-zinc-500">
                Flow ichidagi node va matnlarni toping
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>
        <div
          className="flex-1 overflow-y-auto px-4 py-3"
        >
          {/* Header */}
          <InputGroup>
            <InputGroupInput
              autoFocus={true}
              onChange={(e) => setSearch(e.currentTarget.value)}
              placeholder="Search..."
            />
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
            <InputGroupButton>
              <KbdGroup>
                <Kbd>⌘</Kbd>
                <Kbd>f</Kbd>
              </KbdGroup>
            </InputGroupButton>
          </InputGroup>
          <div className="mt-3 space-y-2">
            {search && filteredNodes.map((item) => (
              <div
                onClick={() => {
                  console.log(item);
                  // @ts-ignore
                  const x = item.position.x + item.width / 2;
                  // @ts-ignore
                  const y = item.position.y + item.height / 2;
                  const zoom = 0.8;

                  setCenter(x, y, { zoom, duration: 1000 }); // 1 soniya davomida silliq boradi
                }}
                key={item.id}
                className="cursor-pointer rounded-xl border border-white/10 bg-white/3 p-3 text-zinc-200 transition-colors hover:bg-white/5"
              >
                <p className="text-sm font-medium line-clamp-2">
                  {getItemTextConten(item)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default SearchPanel;
