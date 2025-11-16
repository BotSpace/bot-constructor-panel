import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Status } from "@/types/http/project";
import React from "react";

type Props = {
  status: Status;
};

function StatusBadge({ status }: Props) {
  return (
    <Badge
      className={cn(
        "inline-block px-2.5 py-0.5 rounded-full text-xs font-medium",
        {
          "bg-yellow-100 text-yellow-800": status === "pending",
          "bg-blue-100 text-blue-800": status === "initializing",
          "bg-green-100 text-green-800": status === "running",
          "bg-gray-100 text-gray-800": status === "stopped",
          "bg-orange-100 text-orange-800": status === "stopping",
          "bg-red-100 text-red-800": status === "failed",
          "bg-purple-100 text-purple-800": status === "suspended",
        }
      )}
    >
      {status}
    </Badge>
  );
}

export default StatusBadge;
