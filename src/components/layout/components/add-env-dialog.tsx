"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Globe, Smartphone, Monitor } from "lucide-react";

interface AddEnvDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId?: string;
}

export const AddEnvDialog: React.FC<AddEnvDialogProps> = ({
  open,
  onOpenChange,
  projectId,
}) => {
  const [envName, setEnvName] = useState("");
  const [envType, setEnvType] = useState<
    "development" | "staging" | "production"
  >("development");
  const [envVars, setEnvVars] = useState<Array<{ key: string; value: string }>>(
    [{ key: "", value: "" }]
  );

  const addEnvVar = () => {
    setEnvVars([...envVars, { key: "", value: "" }]);
  };

  const removeEnvVar = (index: number) => {
    setEnvVars(envVars.filter((_, i) => i !== index));
  };

  const updateEnvVar = (
    index: number,
    field: "key" | "value",
    value: string
  ) => {
    const updated = [...envVars];
    updated[index][field] = value;
    setEnvVars(updated);
  };

  const handleSubmit = () => {
    // Environment yaratish logikasi
    console.log("Creating environment:", {
      name: envName,
      type: envType,
      variables: envVars.filter((v) => v.key && v.value),
      projectId,
    });

    onOpenChange(false);
    // Reset form
    setEnvName("");
    setEnvType("development");
    setEnvVars([{ key: "", value: "" }]);
  };

  const getEnvIcon = (type: string) => {
    switch (type) {
      case "development":
        return <Monitor className="w-4 h-4" />;
      case "staging":
        return <Smartphone className="w-4 h-4" />;
      case "production":
        return <Globe className="w-4 h-4" />;
      default:
        return <Monitor className="w-4 h-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add New Environment
          </DialogTitle>
          <DialogDescription>
            Create a new environment for your bot project with custom
            configurations.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Environment Name */}
          <div className="space-y-2">
            <Label htmlFor="env-name">Environment Name</Label>
            <Input
              id="env-name"
              placeholder="e.g., Production, Staging, Development"
              value={envName}
              onChange={(e) => setEnvName(e.target.value)}
            />
          </div>

          {/* Environment Type */}
          <div className="space-y-2">
            <Label>Environment Type</Label>
            <Select
              value={envType}
              onValueChange={(value: any) => setEnvType(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="development">
                  <div className="flex items-center gap-2">
                    <Monitor className="w-4 h-4" />
                    Development
                  </div>
                </SelectItem>
                <SelectItem value="staging">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4" />
                    Staging
                  </div>
                </SelectItem>
                <SelectItem value="production">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Production
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Environment Variables */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Environment Variables</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addEnvVar}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Variable
              </Button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {envVars.map((envVar, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    placeholder="Variable name"
                    value={envVar.key}
                    onChange={(e) => updateEnvVar(index, "key", e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Variable value"
                    value={envVar.value}
                    onChange={(e) =>
                      updateEnvVar(index, "value", e.target.value)
                    }
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeEnvVar(index)}
                    disabled={envVars.length === 1}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Environment Preview */}
          <div className="space-y-2">
            <Label>Preview</Label>
            <div className="p-3 bg-muted rounded-md">
              <div className="flex items-center gap-2 mb-2">
                {getEnvIcon(envType)}
                <Badge variant="outline">{envType}</Badge>
                <span className="text-sm font-medium">
                  {envName || "New Environment"}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                {envVars.filter((v) => v.key && v.value).length} environment
                variables configured
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!envName.trim()}>
            Create Environment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
