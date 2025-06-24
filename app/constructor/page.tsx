"use client";

import {
  Search,
  Play,
  Zap,
  Eye,
  Save,
  MoreHorizontal,
  ChevronDown,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import Constructor from "@/constructor/constructor";
import { Elements } from "@/constructor/data/elements";

export default function Page() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="border-b h-[56px] border-white/[0.08] bg-[#111111]/80 backdrop-blur-xl">
        <div className="flex h-14 items-center justify-between px-6">
          {/* Left section */}
          <div className="flex items-center gap-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <div className="h-6 w-px bg-white/10" />
            <div className="flex items-center gap-2">
              <Input
                placeholder="Untitled Project"
                className="h-8 w-48 border-0 bg-transparent px-2 text-sm font-medium text-white placeholder:text-white/40 focus-visible:ring-1 focus-visible:ring-white/20"
              />
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 text-white/40 hover:text-white/60"
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
              className="h-8 px-3 text-xs text-white/60 hover:text-white/80"
            >
              <Eye className="mr-1.5 h-3 w-3" />
              Preview
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 px-3 text-xs text-white/60 hover:text-white/80"
            >
              <Save className="mr-1.5 h-3 w-3" />
              Save
            </Button>
            <div className="h-4 w-px bg-white/10" />
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
              className="h-8 w-8 text-white/40 hover:text-white/60"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Components Panel */}
        <ScrollArea className="h-[calc(100vh-56px)] flex flex-col w-72 border-r border-white/[0.08] bg-[#0f0f0f]">
          {/* Panel Header */}
          <div className="border-b border-white/[0.08] p-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/40" />
              <Input
                placeholder="Search components..."
                className="h-8 border-white/[0.08] bg-white/[0.03] pl-9 text-sm text-white placeholder:text-white/40 focus-visible:border-white/20 focus-visible:ring-0"
              />
            </div>
          </div>

          {/* Components List */}
          <div className="p-3 overflow-y-auto">
            <div className="space-y-1">
              {Elements.map(({ title, elements }) => (
                <div key={title} className="mb-4">
                  <h3 className="text-xs font-semibold text-white/60 mb-2">
                    {title}
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {elements.map((element, index) => (
                      <div
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData(
                            "application/json",
                            JSON.stringify(element)
                          );
                        }}
                        key={index}
                        className="cursor-grab active:cursor-grabbing flex items-center gap-2 rounded-lg border border-transparent p-2.5 transition-all hover:border-white/[0.08] hover:bg-white/[0.02]"
                      >
                        <div
                          className={`flex h-7 w-7 items-center justify-center rounded-md border text-xs ${element.color}`}
                        >
                          {element.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-white/90 truncate">
                            {element.name}
                          </div>
                          <div className="text-xs text-white/40">
                            {element.description}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Load More */}
            <div className="mt-4 flex items-center justify-center">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-white/40 hover:text-white/60"
              >
                Load more components
              </Button>
            </div>
          </div>
        </ScrollArea>

        {/* Main Canvas Area */}
        <main className="flex-1 flex flex-col bg-[#0a0a0a]">
          <Constructor />
        </main>
      </div>
    </div>
  );
}
