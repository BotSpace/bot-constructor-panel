import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { SearchIcon } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useFlowStore } from "../store";
import { useReactFlow } from "reactflow";
import { useSearchStore } from "./search-store";
import { cn } from "@/lib/utils";
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut";
import { Kbd, KbdGroup } from "@/components/ui/kbd";

type Props = {};

function SearchPanel({}: Props) {
  const { setCenter } = useReactFlow();
  const { nodes } = useFlowStore();
  const { searchPanelIsOpen, toggleSearchPanel } = useSearchStore();
  const [search, setSearch] = useState<string>("");

  useKeyboardShortcut(
    ["Control", "f"],
    () => {
      toggleSearchPanel();
    },
    { preventDefault: true },
  );

  // 👉 Best practice: useMemo bilan filterni optimallashtiramiz
  const filteredNodes = useMemo(() => {
    if (!search.trim()) return nodes; // bo‘sh bo‘lsa hamma node qaytadi

    return nodes.filter((item: any) => {
      const value = item.data.messageText || item.data.caption || "";

      return value.toLowerCase().includes(search.toLowerCase());
    });
  }, [search, nodes, searchPanelIsOpen]);

  return (
    <div
      className={cn("h-[calc(100vh-56px)] bg-secondary p-3", {
        "col-span-3 flex flex-col": searchPanelIsOpen,
        "hidden col-end-0": !searchPanelIsOpen,
      })}
    >
      {/* Header */}
      <InputGroup>
        <InputGroupInput
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

      <div className="mt-3 space-y-2 h-full overflow-y-auto overflow-x-hidden">
        {filteredNodes.map((item: any) => (
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
              {item.data.messageText || item.data.caption || "No text"}
            </p>

            <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
              <span>ID: {item.id}</span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                Node
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SearchPanel;
