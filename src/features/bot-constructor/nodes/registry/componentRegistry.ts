import { CollectionNode } from "../custom/CollectionNode";
import { LoadCollectionItemNode } from "../custom/LoadCollectionItemNode";
import { SubFlowNode } from "../custom/SubFlowNode";

export const legacyComponentRegistry = {
  CollectionNode,
  LoadCollectionItemNode,
  SubFlowNode,
};

export const explicitLegacyComponentTypes = new Set(
  Object.keys(legacyComponentRegistry)
);

export const explicitRendererGeneratedTypes = new Set([
  "CommandTriggerNode",
  "CronTriggerNode",
  "MessageTriggerNode",
  "CallbackQueryTriggerNode",
  "ReplyButtonTriggerNode",
  "SendTextMessageNode",
  "SendPhotoNode",
  "SendVideoNode",
  "SendAudioNode",
  "SendFileNode",
  "SendPollNode",
  "SendAnimationNode",
  "SendVoiceNode",
  "SendVideoNoteNode",
  "SendLocationNode",
  "SendContactNode",
  "SendStickerNode",
  "SendMediaGroupNode",
  "SendDiceNode",
  "ForwardMessageNode",
  "SendToAdminNode",
  "CopyMessageNode",
  "PinMessageNode",
  "UnpinMessageNode",
  "ChatActionNode",
  "EditMessageNode",
  "EditOrSendMessageNode",
  "DeleteMessageNode",
  "DownloadFileNode",
  "DelayNode",
  "CustomCodeNode",
  "StateNode",
  "IfConditionNode",
  "ElseIfNode",
  "ElseNode",
  "CheckMembershipNode",
  "FormNode",
  "ForLoopNode",
  "ForLoopContinueNode",
  "SubFlowExitNode",
  "RandomNode",
  "VariableNode",
  "HTTPRequestNode",
  "CallbackQueryAnswerNode",
]);
