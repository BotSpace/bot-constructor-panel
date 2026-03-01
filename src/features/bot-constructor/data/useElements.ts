import { useTranslations } from "next-intl";
import { ElementTypes } from "@/types/element-types";
import { useQuery } from "@tanstack/react-query";
import { getActiveSubFlows, getPluginCategories } from "@/services/requests/plugin";

export function useElements(): ElementTypes[] {
  const t = useTranslations();

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

  // Group plugins by their API category into separate ElementTypes groups
  const pluginGroups: ElementTypes[] = [];
  if (pluginsData?.data && pluginsData.data.length > 0) {
    const categories = categoriesData?.data || [];
    const catMap = new Map(categories.map((c) => [c.slug, c]));

    // Group plugins by category slug
    const grouped = new Map<string, typeof pluginsData.data>();
    for (const plugin of pluginsData.data) {
      const key = plugin.category || "uncategorized";
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(plugin);
    }

    for (const [catSlug, plugins] of grouped) {
      const cat = catMap.get(catSlug);
      pluginGroups.push({
        title: cat?.name || catSlug,
        id: `plugin-${catSlug}`,
        elements: plugins.map((plugin) => ({
          type: "plugin" as const,
          name: plugin.name,
          description: plugin.description || "Plugin",
          icon: plugin.icon || cat?.icon || "🔌",
          color: cat?.color || "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
          triggerId: "SubFlowNode" as const,
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

  const baseElements: ElementTypes[] = [
    {
      title: "🧪 Test",
      id: "sidebar-test",
      elements: [
        {
          type: "command",
          name: "Command Trigger (test)",
          description: "Test uchun command trigger",
          icon: "⌘",
          color: "bg-rose-500/10 text-rose-400 border-rose-500/20",
          triggerId: "CommandTriggerNode",
        },
      ],
    },
    {
      title: t("constructor.triggers.title"),
      id: "sidebar-triggers",
      elements: [
        {
          type: "command",
          name: t("constructor.triggers.command.name"),
          description: t("constructor.triggers.command.description"),
          icon: "⌘",
          color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
          triggerId: "CommandTriggerNode",
        },
        {
          type: "message",
          name: "Xabar triggeri",
          description: "Kiruvchi xabarlar uchun handler.",
          icon: "💬",
          color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
          triggerId: "MessageTriggerNode",
        },
        {
          type: "cron",
          name: "Cron triggeri",
          description: "Belgilangan vaqtda bajariladigan ishlar.",
          icon: "⏰",
          color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
          triggerId: "CronTriggerNode",
        },
      ],
    },
    {
      title: t("constructor.actions.title"),
      id: "sidebar-actions",
      elements: [
        {
          type: "message",
          name: t("constructor.actions.textMessage.name"),
          description: t("constructor.actions.textMessage.description"),
          icon: "💬",
          color: "bg-amber-500/10 text-amber-400 border-amber-500/20",
          triggerId: "SendTextMessageNode",
        },
        {
          type: "photo",
          name: t("constructor.actions.photo.name"),
          description: t("constructor.actions.photo.description"),
          icon: "🖼️",
          color: "bg-purple-500/10 text-purple-400 border-purple-500/20",
          triggerId: "SendPhotoNode",
        },
        {
          type: "video",
          name: t("constructor.actions.video.name"),
          description: t("constructor.actions.video.description"),
          icon: "📹",
          color: "bg-red-500/10 text-red-400 border-red-500/20",
          triggerId: "SendVideoNode",
        },
        {
          type: "audio",
          name: t("constructor.actions.audio.name"),
          description: t("constructor.actions.audio.description"),
          icon: "🎵",
          color: "bg-pink-500/10 text-pink-400 border-pink-500/20",
          triggerId: "SendAudioNode",
        },
        {
          type: "file",
          name: t("constructor.actions.file.name"),
          description: t("constructor.actions.file.description"),
          icon: "📄",
          color: "bg-gray-500/10 text-gray-400 border-gray-500/20",
          triggerId: "SendFileNode",
        },
        {
          type: "animation",
          name: t("constructor.actions.animation.name"),
          description: t("constructor.actions.animation.description"),
          icon: "🎬",
          color: "bg-violet-500/10 text-violet-400 border-violet-500/20",
          triggerId: "SendAnimationNode",
        },
        {
          type: "voice",
          name: t("constructor.actions.voice.name"),
          description: t("constructor.actions.voice.description"),
          icon: "🎤",
          color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
          triggerId: "SendVoiceNode",
        },
        {
          type: "video_note",
          name: t("constructor.actions.videoNote.name"),
          description: t("constructor.actions.videoNote.description"),
          icon: "📹",
          color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
          triggerId: "SendVideoNoteNode",
        },
        {
          type: "location",
          name: t("constructor.actions.location.name"),
          description: t("constructor.actions.location.description"),
          icon: "📍",
          color: "bg-rose-500/10 text-rose-400 border-rose-500/20",
          triggerId: "SendLocationNode",
        },
        {
          type: "contact",
          name: t("constructor.actions.contact.name"),
          description: t("constructor.actions.contact.description"),
          icon: "👤",
          color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
          triggerId: "SendContactNode",
        },
        {
          type: "poll",
          name: t("constructor.actions.poll.name"),
          description: t("constructor.actions.poll.description"),
          icon: "📊",
          color: "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20",
          triggerId: "SendPollNode",
        },
        {
          type: "sticker",
          name: t("constructor.actions.sticker.name"),
          description: t("constructor.actions.sticker.description"),
          icon: "🎭",
          color: "bg-purple-500/10 text-purple-400 border-purple-500/20",
          triggerId: "SendStickerNode",
        },
        {
          type: "media_group",
          name: t("constructor.actions.mediaGroup.name"),
          description: t("constructor.actions.mediaGroup.description"),
          icon: "🖼️",
          color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
          triggerId: "SendMediaGroupNode",
        },
        {
          type: "dice",
          name: t("constructor.actions.dice.name"),
          description: t("constructor.actions.dice.description"),
          icon: "🎲",
          color: "bg-green-500/10 text-green-400 border-green-500/20",
          triggerId: "SendDiceNode",
        },
        {
          type: "edit_message",
          name: t("constructor.actions.editMessage.name"),
          description: t("constructor.actions.editMessage.description"),
          icon: "✏️",
          color: "bg-green-500/10 text-green-400 border-green-500/20",
          triggerId: "EditMessageNode",
        },
      ],
    },
    {
      title: t("constructor.messageOperations.title"),
      elements: [
        {
          type: "forward_message",
          name: t("constructor.messageOperations.forward.name"),
          description: t("constructor.messageOperations.forward.description"),
          icon: "➡️",
          color: "bg-sky-500/10 text-sky-400 border-sky-500/20",
          triggerId: "ForwardMessageNode",
        },
        {
          type: "send_to_admin",
          name: t("constructor.messageOperations.sendToAdmin.name"),
          description: t(
            "constructor.messageOperations.sendToAdmin.description"
          ),
          icon: "👤",
          color: "bg-purple-500/10 text-purple-400 border-purple-500/20",
          triggerId: "SendToAdminNode",
        },
        {
          type: "copy_message",
          name: t("constructor.messageOperations.copy.name"),
          description: t("constructor.messageOperations.copy.description"),
          icon: "📋",
          color: "bg-amber-500/10 text-amber-400 border-amber-500/20",
          triggerId: "CopyMessageNode",
        },
        {
          type: "pin_message",
          name: t("constructor.messageOperations.pin.name"),
          description: t("constructor.messageOperations.pin.description"),
          icon: "📌",
          color: "bg-lime-500/10 text-lime-400 border-lime-500/20",
          triggerId: "PinMessageNode",
        },
        {
          type: "unpin_message",
          name: t("constructor.messageOperations.unpin.name"),
          description: t("constructor.messageOperations.unpin.description"),
          icon: "📍",
          color: "bg-orange-500/10 text-orange-400 border-orange-500/20",
          triggerId: "UnpinMessageNode",
        },
        {
          type: "delete_message",
          name: t("constructor.messageOperations.delete.name"),
          description: t("constructor.messageOperations.delete.description"),
          icon: "🗑️",
          color: "bg-red-500/10 text-red-400 border-red-500/20",
          triggerId: "DeleteMessageNode",
        },
        {
          type: "chat_action",
          name: t("constructor.messageOperations.chatAction.name"),
          description: t(
            "constructor.messageOperations.chatAction.description"
          ),
          icon: "⌨️",
          color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
          triggerId: "ChatActionNode",
        },
        {
          type: "file",
          name: t("constructor.messageOperations.downloadFile.name"),
          description: t(
            "constructor.messageOperations.downloadFile.description"
          ),
          icon: "📥",
          color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
          triggerId: "DownloadFileNode",
        },
      ],
    },
    {
      title: t("constructor.flowControl.title"),
      elements: [
        {
          type: "condition",
          name: t("constructor.flowControl.if.name"),
          description: t("constructor.flowControl.if.description"),
          icon: "🔀",
          color: "bg-violet-500/10 text-violet-400 border-violet-500/20",
          triggerId: "IfConditionNode",
        },
        {
          type: "elseif",
          name: t("constructor.flowControl.elseif.name"),
          description: t("constructor.flowControl.elseif.description"),
          icon: "🔄",
          color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
          triggerId: "ElseIfNode",
        },
        {
          type: "else",
          name: t("constructor.flowControl.else.name"),
          description: t("constructor.flowControl.else.description"),
          icon: "➡️",
          color: "bg-purple-500/10 text-purple-400 border-purple-500/20",
          triggerId: "ElseNode",
        },
        {
          type: "delay",
          name: t("constructor.flowControl.delay.name"),
          description: t("constructor.flowControl.delay.description"),
          icon: "⏱️",
          color: "bg-pink-500/10 text-pink-400 border-pink-500/20",
          triggerId: "DelayNode",
        },
        {
          type: "random",
          name: t("constructor.flowControl.random.name"),
          description: t("constructor.flowControl.random.description"),
          icon: "🎲",
          color: "bg-teal-500/10 text-teal-400 border-teal-500/20",
          triggerId: "RandomNode",
        },
        {
          type: "variable",
          name: t("constructor.flowControl.variable.name"),
          description: t("constructor.flowControl.variable.description"),
          icon: "🔢",
          color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
          triggerId: "VariableNode",
        },
        {
          type: "check_membership",
          name: t("constructor.flowControl.checkMembership.name"),
          description: t("constructor.flowControl.checkMembership.description"),
          icon: "👥",
          color: "bg-purple-500/10 text-purple-400 border-purple-500/20",
          triggerId: "CheckMembershipNode",
        },
        {
          type: "form",
          name: t("constructor.flowControl.form.name"),
          description: t("constructor.flowControl.form.description"),
          icon: "📝",
          color: "bg-green-500/10 text-green-400 border-green-500/20",
          triggerId: "FormNode",
        },
      ],
    },
    {
      title: t("constructor.integrations.title"),
      elements: [
        {
          type: "http_request",
          name: t("constructor.integrations.httpRequest.name"),
          description: t("constructor.integrations.httpRequest.description"),
          icon: "🌐",
          color: "bg-purple-500/10 text-purple-400 border-purple-500/20",
          triggerId: "HTTPRequestNode",
        },
        {
          type: "callback_answer",
          name: t("constructor.integrations.callbackAnswer.name"),
          description: t("constructor.integrations.callbackAnswer.description"),
          icon: "↩️",
          color: "bg-sky-500/10 text-sky-400 border-sky-500/20",
          triggerId: "CallbackQueryAnswerNode",
        },
      ],
    },
    {
      title: t("constructor.customLogic.title"),
      elements: [
        {
          type: "code",
          name: t("constructor.customLogic.code.name"),
          description: t("constructor.customLogic.code.description"),
          icon: "🖥️",
          color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
          triggerId: "CustomCodeNode",
        },
        {
          type: "state",
          name: t("constructor.customLogic.state.name"),
          description: t("constructor.customLogic.state.description"),
          icon: "🗄",
          color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
          triggerId: "StateNode",
        },
        {
          type: "collection",
          name: t("constructor.customLogic.collection.name"),
          description: t("constructor.customLogic.collection.description"),
          icon: "📦",
          color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
          triggerId: "CollectionNode",
        },
        {
          type: "load_collection_item",
          name: t("constructor.customLogic.loadCollectionItem.name"),
          description: t(
            "constructor.customLogic.loadCollectionItem.description"
          ),
          icon: "📥",
          color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
          triggerId: "LoadCollectionItemNode",
        },
      ],
    },
  ];

  return [...baseElements, ...pluginGroups];
}
