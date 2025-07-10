"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Settings, Palette, Type, Sliders } from "lucide-react";
import { EditorTheme, useEditorSettings } from "../store";

type Props = {};

export default function EditorSettings({}: Props) {
  const {
    folding,
    theme,
    fontFamily,
    fontSize,
    minimap,
    wordWrap,
    lineNumbers,
    setWordWrap,
    setTheme,
    setFontFamily,
    setFontSize,
    setMinimap,
    setLineNumbers,
    setFolding,
  } = useEditorSettings();

  const [renderWhitespace, setRenderWhitespace] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const themes = [
    { value: "botfather", label: "BotFather", icon: "🤖" }, // RO'YXATNING BOSHIGA QO'SHAMIZ
    { value: "ayu-mirage", label: "Ayu Mirage", icon: "🌌" }, // YANGI MAVZUNI RO'YXATGA QO'SHAMIZ
    { value: "vs-dark", label: "Dark", icon: "🌙" },
    { value: "monokai", label: "Monokai", icon: "🎨" }, // Yangi mavzu
    { value: "vs-light", label: "Light", icon: "☀️" },
    { value: "hc-black", label: "High Contrast", icon: "⚡" },
  ];

  const fontFamilies = [
    {
      value: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
      label: "JetBrains Mono",
    },
    { value: "'Fira Code', 'Consolas', monospace", label: "Fira Code" },
    { value: "'Consolas', 'Monaco', monospace", label: "Consolas" },
    { value: "'Source Code Pro', monospace", label: "Source Code Pro" },
    { value: "'Ubuntu Mono', monospace", label: "Ubuntu Mono" },
    { value: "'Courier New', monospace", label: "Courier New" },
  ];

  return (
    <>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Palette className="h-4 w-4" />
            <span>Tema:</span>
          </Label>
          <Select
            value={theme}
            onValueChange={(value) => setTheme(value as EditorTheme)}
          >
            <SelectTrigger className="w-[180px] h-8 text-xs">
              <SelectValue placeholder="Temani tanlang" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(themes).map(([key, value]) => (
                <SelectItem key={key} value={value.value} className="text-xs">
                  {value.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" className="gap-2">
            <Settings className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Editor Settings
            </DialogTitle>
            <DialogDescription>
              Customize your editor appearance and behavior
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Theme Settings */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                <Label className="text-sm font-medium">Theme</Label>
              </div>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {themes.map((themeOption) => (
                    <SelectItem
                      key={themeOption.value}
                      value={themeOption.value}
                    >
                      <div className="flex items-center gap-2">
                        <span>{themeOption.icon}</span>
                        {themeOption.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Font Settings */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Type className="h-4 w-4" />
                <Label className="text-sm font-medium">Font Settings</Label>
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="text-sm">Font Family</Label>
                  <Select value={fontFamily} onValueChange={setFontFamily}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fontFamilies.map((font) => (
                        <SelectItem key={font.value} value={font.value}>
                          <span style={{ fontFamily: font.value }}>
                            {font.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm">Font Size: {fontSize}px</Label>
                  <Slider
                    value={[fontSize]}
                    onValueChange={(value) => setFontSize(value[0])}
                    max={24}
                    min={10}
                    step={1}
                    className="mt-2"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Editor Features */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sliders className="h-4 w-4" />
                <Label className="text-sm font-medium">Editor Features</Label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="minimap" className="text-sm">
                    Minimap
                  </Label>
                  <Switch
                    id="minimap"
                    checked={minimap}
                    onCheckedChange={setMinimap}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="wordWrap" className="text-sm">
                    Word Wrap
                  </Label>
                  <Switch
                    id="wordWrap"
                    checked={wordWrap}
                    onCheckedChange={setWordWrap}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="lineNumbers" className="text-sm">
                    Line Numbers
                  </Label>
                  <Switch
                    id="lineNumbers"
                    checked={lineNumbers}
                    onCheckedChange={setLineNumbers}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="folding" className="text-sm">
                    Code Folding
                  </Label>
                  <Switch
                    id="folding"
                    checked={folding}
                    onCheckedChange={setFolding}
                  />
                </div>

                <div className="flex items-center justify-between col-span-2">
                  <Label htmlFor="whitespace" className="text-sm">
                    Show Whitespace
                  </Label>
                  <Switch
                    id="whitespace"
                    checked={renderWhitespace}
                    onCheckedChange={setRenderWhitespace}
                  />
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
