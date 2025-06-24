"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, ChevronDown, ChevronRight } from "lucide-react";
import { ConstructorData } from "@/constructor/data";
import { Handle, Position } from "reactflow";

interface TextTriggerNodeProps {
  id?: string;
  data?: {
    label?: string;
  };
  selected?: boolean;
}

export function TextTriggerNode({ id, data, selected }: TextTriggerNodeProps) {
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedFilter, setSelectedFilter] = useState<string>("");
  const [filterContext, setFilterContext] = useState<string>("");
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const getFiltersForType = (type: string) => {
    switch (type) {
      case "text":
        return ConstructorData.Filters.textFilters;
      case "location":
        return ConstructorData.Filters.locationFilters;
      case "document":
      case "photo":
      case "video":
      case "audio":
        return ConstructorData.Filters.fileFilters;
      default:
        return [{ value: "any", label: "Har qanday" }];
    }
  };

  const renderContextInput = () => {
    if (!selectedFilter || selectedFilter === "any") return null;

    const inputClass =
      "h-8 text-xs bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-400";

    switch (selectedFilter) {
      case "regex":
        return (
          <Input
            placeholder="^[A-Za-z0-9]+$"
            value={filterContext}
            onChange={(e) => setFilterContext(e.target.value)}
            className={`${inputClass} font-mono`}
          />
        );

      case "command":
        return (
          <Input
            placeholder="start"
            value={filterContext}
            onChange={(e) => setFilterContext(e.target.value)}
            className={`${inputClass} font-mono`}
          />
        );

      case "radius":
        return (
          <div className="grid grid-cols-3 gap-1">
            <Input placeholder="Lat" className={`${inputClass} font-mono`} />
            <Input placeholder="Lng" className={`${inputClass} font-mono`} />
            <Input placeholder="Km" className={`${inputClass} font-mono`} />
          </div>
        );

      case "extension":
        return (
          <Input
            placeholder="pdf,jpg,png"
            value={filterContext}
            onChange={(e) => setFilterContext(e.target.value)}
            className={inputClass}
          />
        );

      case "size":
        return (
          <div className="grid grid-cols-2 gap-1">
            <Input placeholder="Min MB" className={`${inputClass} font-mono`} />
            <Input placeholder="Max MB" className={`${inputClass} font-mono`} />
          </div>
        );

      default:
        return (
          <Input
            placeholder="Qidiruv matni..."
            value={filterContext}
            onChange={(e) => setFilterContext(e.target.value)}
            className={inputClass}
          />
        );
    }
  };

  const selectedTypeData = ConstructorData.MessageTypes.find(
    (type) => type.value === selectedType
  );
  const selectedFilterData = getFiltersForType(selectedType).find(
    (filter) => filter.value === selectedFilter
  );

  return (
    <Card
      className={`w-80 bg-gray-900 border-gray-700 text-gray-100 ${
        selected ? "ring-2 ring-blue-500" : ""
      }`}
    >
      <CardHeader className="pb-2">
        <CardTitle
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm flex items-center justify-between cursor-pointer group transition-all duration-200 hover:bg-gray-800/50 rounded-lg p-2 -m-2"
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-md bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors duration-200">
                <Settings className="h-4 w-4 text-blue-400 group-hover:text-blue-300 transition-colors duration-200" />
              </div>
              <span className="font-medium text-gray-100 group-hover:text-white transition-colors duration-200">
                Handler
              </span>
            </div>

            {selectedTypeData && (
              <div className="flex items-center gap-1 ml-1">
                <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                <Badge
                  variant="secondary"
                  className="text-xs bg-gray-800/80 text-gray-300 border-gray-600/50 px-2 py-0.5 font-medium group-hover:bg-gray-700/80 group-hover:text-gray-200 transition-all duration-200"
                >
                  <selectedTypeData.icon className="h-3 w-3 mr-1" />
                  {selectedTypeData.label}
                </Badge>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 ml-2">
            {/* Status indicator */}
            <div className="flex items-center gap-1">
              <div
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  selectedType && selectedFilter
                    ? "bg-green-500 shadow-sm shadow-green-500/50"
                    : "bg-gray-600"
                }`}
              ></div>
            </div>

            {/* Expand/Collapse button */}
            <div className="p-1 rounded-md hover:bg-gray-700/50 transition-colors duration-200">
              <div
                className={`transform transition-transform duration-200 ${
                  isExpanded ? "rotate-0" : "-rotate-90"
                }`}
              >
                <ChevronDown className="h-3 w-3 text-gray-400 group-hover:text-gray-300" />
              </div>
            </div>
          </div>
        </CardTitle>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0 space-y-3">
          {/* Xabar turi */}
          <div className="space-y-1">
            <Label className="text-xs text-gray-300">Xabar turi</Label>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="h-8 bg-gray-800 border-gray-700 text-gray-100 w-full">
                <SelectValue placeholder="Tanlang..." />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {ConstructorData.MessageTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <SelectItem
                      key={type.value}
                      value={type.value}
                      className="text-gray-100 focus:bg-gray-700 focus:text-gray-100"
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-3 w-3 text-gray-400" />
                        <span className="text-xs">{type.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Filter */}
          {selectedType && (
            <div className="space-y-1">
              <Label className="text-xs text-gray-300">Filter</Label>
              <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                <SelectTrigger className="h-8 bg-gray-800 w-full border-gray-700 text-gray-100">
                  <SelectValue placeholder="Tanlang..." />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {getFiltersForType(selectedType).map((filter) => (
                    <SelectItem
                      key={filter.value}
                      value={filter.value}
                      className="text-gray-100 focus:bg-gray-700 focus:text-gray-100"
                    >
                      <span className="text-xs">{filter.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Context */}
          {selectedFilter && selectedFilter !== "any" && (
            <div className="space-y-1">
              <Label className="text-xs text-gray-300">Parametr</Label>
              {renderContextInput()}
            </div>
          )}

          {/* Status */}
          {selectedType && selectedFilter && (
            <div className="pt-2 border-t border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-gray-300">Tayyor</span>
                </div>
                {selectedFilterData && (
                  <Badge
                    variant="outline"
                    className="text-xs border-gray-600 text-gray-400"
                  >
                    {selectedFilterData.label}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      )}

      {/* Collapsed view */}
      {!isExpanded && selectedType && (
        <CardContent className="pt-0 pb-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              {selectedTypeData && (
                <selectedTypeData.icon className="h-3 w-3 text-gray-400" />
              )}
              <span className="text-gray-300">{selectedTypeData?.label}</span>
            </div>
            {selectedFilter && (
              <Badge
                variant="outline"
                className="text-xs border-gray-600 text-gray-400 px-1 py-0"
              >
                {selectedFilterData?.label}
              </Badge>
            )}
          </div>
        </CardContent>
      )}

      {/* Input handle */}
      <Handle
        type="source"
        position={Position.Top}
        style={{ background: "blue" }}
      />

      {/* Output handle */}
      <Handle
        type="target"
        position={Position.Bottom}
        style={{ background: "green" }}
      />
    </Card>
  );
}
