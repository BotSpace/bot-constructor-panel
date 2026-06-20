import { createGenericNodeComponent } from "@/features/bot-constructor/nodes/generic/createGenericNodeComponent";
import { getNodeManifestByType, runtimeNodeRegistry } from "@/features/bot-constructor/nodes/registry/manifestStore";

export const genericNodeTypes = runtimeNodeRegistry
  .filter((entry) => entry.status === "runtime")
  .reduce<Record<string, ReturnType<typeof createGenericNodeComponent>>>(
    (accumulator, entry) => {
      accumulator[entry.type] = createGenericNodeComponent(entry.type);
      return accumulator;
    },
    {}
  );

export function getRuntimeNodeRegistry() {
  return runtimeNodeRegistry;
}

export { getNodeManifestByType };

function validateNodeRegistryCoverage() {
  const runtimeTypes = runtimeNodeRegistry
    .filter((entry) => entry.status === "runtime")
    .map((entry) => entry.type);

  const statusConflicts = runtimeTypes.filter((type) => {
    const manifest = getNodeManifestByType(type);
    if (!manifest) {
      return true;
    }

    if (!genericNodeTypes[type]) {
      return true;
    }

    return false;
  });

  const sidebarMissingRegistry = runtimeNodeRegistry
    .filter((entry) => entry.sidebar?.enabled)
    .map((entry) => entry.type)
    .filter((type) => !getNodeManifestByType(type));

  if (
    statusConflicts.length ||
    sidebarMissingRegistry.length
  ) {
    throw new Error(
      [
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
  ...genericNodeTypes,
};
