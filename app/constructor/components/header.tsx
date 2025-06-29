"use client";

import {
  Play,
  Zap,
  Eye,
  Save,
  MoreHorizontal,
  ChevronDown,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/theme/toggle-button";

type Props = {};

export function ConstructorPageHeader({}: Props) {
  return (
    <>
      <header className="border-b h-[56px] border-white/[0.08] backdrop-blur-xl">
        <div className="flex h-14 items-center justify-between px-6">
          {/* Left section */}
          <div className="flex items-center gap-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
              <Zap className="h-4 w-4 " />
            </div>
            <div className="h-6 w-px" />
            <div className="flex items-center gap-2">
              <Input
                placeholder="Untitled Project"
                className="h-8 w-48 border-0 bg-transparent px-2 text-sm font-medium  placeholder:/40 focus-visible:ring-1 focus-visible:ring-white/20"
              />
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 /40 hover:/60"
              >
                <ChevronDown className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="h-8 px-3 text-xs /60 hover:/80"
            >
              <Eye className="mr-1.5 h-3 w-3" />
              Preview
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 px-3 text-xs /60 hover:/80"
            >
              <Save className="mr-1.5 h-3 w-3" />
              Save
            </Button>
            <div className="h-4 w-px" />
            <Button
              size="sm"
              className="h-8 bg-blue-600 px-4 text-xs font-medium hover:bg-blue-700"
            >
              <Play className="mr-1.5 h-3 w-3" />
              Run
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 /40 hover:/60"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
            <ModeToggle />
          </div>
        </div>
      </header>
    </>
  );
}
