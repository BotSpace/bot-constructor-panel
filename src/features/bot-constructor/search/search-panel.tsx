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
import { useSearchStore } from "@/features/bot-constructor/search/search-store";
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";

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
      if (!!value) return false;
      return value.toLowerCase().includes(search.toLowerCase());
    });
  }, [search, nodes, searchPanelIsOpen]);

  return (
    <Drawer direction="right" open={searchPanelIsOpen} onOpenChange={toggleSearchPanel}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Search</DrawerTitle>
        </DrawerHeader>
        <div
          className="px-4"
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
                className="p-3 rounded-xl bg-card shadow-sm border hover:bg-accent hover:text-accent-foreground transition cursor-pointer"
              >
                <p className="text-sm font-medium line-clamp-2">
                  {getItemTextConten(item)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export default SearchPanel;
