import { useTranslations } from "next-intl";
import { ElementItemType, ElementTypes } from "@/types/element-types";
import { useQuery } from "@tanstack/react-query";
import { getActiveSubFlows, getPluginCategories } from "@/services/requests/plugin";
import { getRuntimeNodeRegistry } from "@/features/bot-constructor/nodes/registry";
import { SIDEBAR_COLOR_CLASS_REGISTRY } from "@/features/bot-constructor/nodes/registry/colorRegistry";
import { resolveNodeIcon } from "@/features/bot-constructor/nodes/registry/iconRegistry";

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

  return [...manifestGroups, ...pluginGroups];
}
