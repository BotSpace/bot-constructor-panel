import { createGenericNodeComponent } from "../generic/createGenericNodeComponent";
import { getNodeManifestByType, runtimeNodeRegistry } from "./manifestStore";
import {
  explicitLegacyComponentTypes,
  explicitRendererGeneratedTypes,
  legacyComponentRegistry,
} from "./componentRegistry";

export const genericNodeTypes = runtimeNodeRegistry
  .filter(
    (entry) =>
      entry.status === "runtime" &&
      explicitRendererGeneratedTypes.has(entry.type)
  )
  .reduce<Record<string, ReturnType<typeof createGenericNodeComponent>>>(
    (accumulator, entry) => {
      accumulator[entry.type] = createGenericNodeComponent(entry.type);
      return accumulator;
    },
    {}
  );

export const legacyNodeTypes = runtimeNodeRegistry.filter(
  (entry) => entry.status === "non-runtime-audit"
);

export function getRuntimeNodeRegistry() {
  return runtimeNodeRegistry;
}

export { getNodeManifestByType };

function validateNodeRegistryCoverage() {
  const runtimeTypes = runtimeNodeRegistry
    .filter((entry) => entry.status === "runtime")
    .map((entry) => entry.type);

  const missingLegacyComponentTypes = runtimeNodeRegistry
    .filter(
      (entry) =>
        entry.status === "runtime" &&
        !explicitRendererGeneratedTypes.has(entry.type)
    )
    .map((entry) => entry.type)
    .filter((type) => !explicitLegacyComponentTypes.has(type));

  const statusConflicts = runtimeTypes.filter((type) => {
    const manifest = getNodeManifestByType(type);
    if (!manifest) {
      return true;
    }

    if (
      explicitRendererGeneratedTypes.has(type) &&
      !genericNodeTypes[type]
    ) {
      return true;
    }

    return false;
  });

  const sidebarMissingRegistry = runtimeNodeRegistry
    .filter((entry) => entry.sidebar?.enabled)
    .map((entry) => entry.type)
    .filter((type) => !getNodeManifestByType(type));

  if (
    missingLegacyComponentTypes.length ||
    statusConflicts.length ||
    sidebarMissingRegistry.length
  ) {
    throw new Error(
      [
        missingLegacyComponentTypes.length
          ? `Missing runtime component registry entries: ${missingLegacyComponentTypes.join(", ")}`
          : "",
        statusConflicts.length
          ? `Conflicting node registry statuses: ${statusConflicts.join(", ")}`
          : "",
        sidebarMissingRegistry.length
          ? `Sidebar entries missing registry records: ${sidebarMissingRegistry.join(", ")}`
          : "",
      ]
        .filter(Boolean)
        .join(" | ")
    );
  }
}

if (process.env.NODE_ENV !== "production") {
  validateNodeRegistryCoverage();
}

export const runtimeNodeComponents: Record<string, unknown> = {
  ...legacyComponentRegistry,
  ...genericNodeTypes,
};
