"use client";

import { memo } from "react";
import { NodeProps } from "reactflow";
import { getNodeManifestByType } from "../registry/manifestStore";
import { GenericNodeRenderer } from "./GenericNodeRenderer";

export function createGenericNodeComponent(type: string) {
  const Component = (props: NodeProps) => {
    const manifest = getNodeManifestByType(type);

    if (!manifest) {
      return null;
    }

    return <GenericNodeRenderer {...props} manifest={manifest} />;
  };

  Component.displayName = `${type}GenericNode`;

  return memo(Component);
}
