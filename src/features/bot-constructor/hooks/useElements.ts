import { useTranslations } from "next-intl";
import { ElementItemType, ElementTypes } from "@/types/element-types";
import { useQuery } from "@tanstack/react-query";
import { getActiveSubFlows, getPluginCategories } from "@/services/requests/plugin";
import { getRuntimeNodeRegistry } from "@/features/bot-constructor/manifest";
import { SIDEBAR_COLOR_CLASS_REGISTRY } from "@/features/bot-constructor/manifest/colorRegistry";
import { resolveNodeIcon } from "@/features/bot-constructor/manifest/iconRegistry";
import { useModuleManifestStore } from "@/features/bot-constructor/manifest/moduleManifestStore";

const SIDEBAR_GROUP_META = {
  triggers: {
    titleKey: "constructor.triggers.title",
    titleFallback: "🚀 Triggerlar (Boshlovchilar)",
  },
  actions: {
    titleKey: "constructor.actions.title",
    titleFallback: "⚙️ Amallar",
  },
  messageOperations: {
    titleKey: "constructor.messageOperations.title",
    titleFallback: "📨 Xabar Operatsiyalari",
  },
  flowControl: {
    titleKey: "constructor.flowControl.title",
    titleFallback: "🔀 Mantiq Oqimi",
  },
  integrations: {
    titleKey: "constructor.integrations.title",
    titleFallback: "🌐 Integratsiyalar",
  },
  customLogic: {
    titleKey: "constructor.customLogic.title",
    titleFallback: "🧩 Maxsus Mantiq",
  },
  ai: {
    titleKey: "constructor.ai.title",
    titleFallback: "🤖 AI",
  },
  ai_tools: {
    titleKey: "constructor.aiTools.title",
    titleFallback: "🛠️ AI Tools",
  },
} as const;

function translate(
  t: ReturnType<typeof useTranslations>,
  key: string,
  fallback: string
) {
  return typeof t.has === "function" && t.has(key) ? t(key) : fallback;
}

export function useElements(): ElementTypes[] {
  const t = useTranslations();
  const runtimeNodeRegistry = getRuntimeNodeRegistry();
  const moduleManifests = useModuleManifestStore((s) => s.manifests);

  const { data: pluginsData } = useQuery({
    queryKey: ["active-subflows"],
    queryFn: () => getActiveSubFlows(),
    staleTime: 1000 * 60 * 5,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["plugin-categories"],
    queryFn: () => getPluginCategories(),
    staleTime: 1000 * 60 * 5,
  });

  const manifestGroups = Object.entries(SIDEBAR_GROUP_META)
    .map(([groupId, groupMeta]) => {
      const elements = runtimeNodeRegistry
        .filter(
          (entry) => entry.sidebar?.enabled && entry.sidebar.groupId === groupId
        )
        .sort(
          (left, right) =>
            (left.sidebar?.sortOrder || 0) - (right.sidebar?.sortOrder || 0)
        )
        .map((entry) => ({
          type: entry.sidebar?.elementType || "message",
          name: translate(t, entry.titleKey, entry.titleFallback),
          description: translate(
            t,
            entry.descriptionKey,
            entry.descriptionFallback
          ),
          icon: resolveNodeIcon(entry.iconName),
          color: SIDEBAR_COLOR_CLASS_REGISTRY[entry.colorToken] || "",
          triggerId: entry.type,
          defaultData: entry.defaults,
        })) as ElementItemType[];

      return {
        title: translate(t, groupMeta.titleKey, groupMeta.titleFallback),
        id: `sidebar-${groupId}`,
        elements,
      };
    })
    .filter((group) => group.elements.length > 0);

  const pluginGroups: ElementTypes[] = [];
  if (pluginsData?.data && pluginsData.data.length > 0) {
    const categories = categoriesData?.data || [];
    const catMap = new Map(categories.map((category) => [category.slug, category]));
    const grouped = new Map<string, typeof pluginsData.data>();

    for (const plugin of pluginsData.data) {
      const key = plugin.category || "uncategorized";
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)?.push(plugin);
    }

    for (const [categorySlug, plugins] of grouped) {
      const category = catMap.get(categorySlug);
      pluginGroups.push({
        title: category?.name || categorySlug,
        id: `plugin-${categorySlug}`,
        elements: plugins.map((plugin) => ({
          type: "plugin" as const,
          name: plugin.name,
          description: plugin.description || "Plugin",
          icon: plugin.icon || category?.icon || "🔌",
          color:
            category?.color ||
            "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
          triggerId: "SubFlowNode",
          defaultData: {
            slug: plugin.slug,
            pluginName: plugin.name,
            pluginDescription: plugin.description,
            outputs: plugin.outputs || [],
            paramsSchema: plugin.params_schema || {},
            params: {},
          },
        })),
      });
    }
  }

  // Module groups — grouped by moduleSlug; each unique slug = one sidebar section.
  // Module AI tool accessories (accessory=true, accessoryAttachesTo includes "ai_tool")
  // are collected separately and merged into the static ai_tools group so they appear
  // alongside built-in tools in the NodeSelectionDialog.
  const moduleGroups: ElementTypes[] = [];
  const moduleToolElements: ElementItemType[] = [];

  if (moduleManifests.length > 0) {
    const bySlug = new Map<string, typeof moduleManifests>();
    for (const entry of moduleManifests) {
      // AI tool accessories go into the shared ai_tools group, not a module section.
      if (
        entry.accessory &&
        entry.accessoryAttachesTo?.includes("ai_tool") &&
        entry.sidebar?.enabled
      ) {
        moduleToolElements.push({
          type: (entry.sidebar?.elementType ?? entry.type) as ElementItemType["type"],
          name: translate(t, entry.titleKey, entry.titleFallback),
          description: translate(t, entry.descriptionKey, entry.descriptionFallback),
          icon: resolveNodeIcon(entry.iconName),
          color: SIDEBAR_COLOR_CLASS_REGISTRY[entry.colorToken] || "",
          triggerId: entry.type,
          defaultData: entry.defaults,
          role: "Tool",
        });
        continue;
      }
      if (!entry.sidebar?.enabled) continue;
      const slug = entry.moduleSlug ?? "module-unknown";
      if (!bySlug.has(slug)) bySlug.set(slug, []);
      bySlug.get(slug)!.push(entry);
    }

    for (const [slug, entries] of bySlug) {
      const moduleName = entries[0]?.moduleName ?? slug;
      const sorted = [...entries].sort(
        (a, b) => (a.sidebar?.sortOrder ?? 0) - (b.sidebar?.sortOrder ?? 0)
      );
      moduleGroups.push({
        title: moduleName,
        id: `module-${slug}`,
        elements: sorted.map((entry) => ({
          type: entry.sidebar?.elementType ?? entry.type,
          name: translate(t, entry.titleKey, entry.titleFallback),
          description: translate(t, entry.descriptionKey, entry.descriptionFallback),
          icon: resolveNodeIcon(entry.iconName),
          color: SIDEBAR_COLOR_CLASS_REGISTRY[entry.colorToken] || "",
          triggerId: entry.type,
          defaultData: entry.defaults,
          role:
            (entry as { trigger?: boolean }).trigger ||
            entry.category === "triggers"
              ? "Trigger"
              : entry.category === "integrations"
                ? "Integration"
                : "Action",
        })) as ElementItemType[],
      });
    }
  }

  // Merge module tool accessories into the ai_tools manifest group.
  // If no static ai_tools group exists yet (unlikely), create one on the fly.
  if (moduleToolElements.length > 0) {
    const aiToolsGroup = manifestGroups.find((g) => g.id === "sidebar-ai_tools");
    if (aiToolsGroup) {
      aiToolsGroup.elements = [...aiToolsGroup.elements, ...moduleToolElements];
    } else {
      manifestGroups.push({
        title: translate(
          t,
          SIDEBAR_GROUP_META.ai_tools.titleKey,
          SIDEBAR_GROUP_META.ai_tools.titleFallback
        ),
        id: "sidebar-ai_tools",
        elements: moduleToolElements,
      });
    }
  }

  return [...manifestGroups, ...pluginGroups, ...moduleGroups];
}
