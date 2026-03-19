import {
  SendTextMessageNode,
  SendPhotoNode,
  SendVideoNode,
  SendAudioNode,
  SendFileNode,
  EditMessageNode,
  EditOrSendMessageNode,
  SendAnimationNode,
  SendVoiceNode,
  SendVideoNoteNode,
  SendLocationNode,
  SendContactNode,
  SendPollNode,
  SendStickerNode,
  SendMediaGroupNode,
  SendDiceNode,
  ForwardMessageNode,
  SendToAdminNode,
  CopyMessageNode,
  PinMessageNode,
  UnpinMessageNode,
  DeleteMessageNode,
  ChatActionNode,
  DownloadFileNode,
} from "./actions";

import {
  CommandTriggerNode,
  CronTriggerNode,
  MessageTriggerNode,
} from "./triggers";

import {
  CustomCodeNode,
  StateNode,
  CollectionNode,
  LoadCollectionItemNode,
  SubFlowNode,
  SubFlowExitNode,
  IfConditionNode,
  ElseIfNode,
  ElseNode,
  DelayNode,
  RandomNode,
  VariableNode,
  HTTPRequestNode,
  CallbackQueryAnswerNode,
  CheckMembershipNode,
  FormNode,
  ForLoopNode,
  ForLoopContinueNode,
} from "./custom";

export const Triggers = {
  CommandTriggerNode,
  CronTriggerNode,
  MessageTriggerNode,
};

export const ActionsTextAndMedia = {
  // Actions - Text and Media
  SendTextMessageNode,
  SendPhotoNode,
  SendVideoNode,
  SendAudioNode,
  SendFileNode,
  SendAnimationNode,
  SendVoiceNode,
  SendVideoNoteNode,
  SendLocationNode,
  SendContactNode,
  SendPollNode,
  SendStickerNode,
  SendMediaGroupNode,
  SendDiceNode,
};

export const ActionsMessageOperations = {
  EditMessageNode,
  EditOrSendMessageNode,
  ForwardMessageNode,
  SendToAdminNode,
  CopyMessageNode,
  PinMessageNode,
  UnpinMessageNode,
  DeleteMessageNode,
  ChatActionNode,
  DownloadFileNode,
};

export const CustomNodesCodeAndData = {
  CustomCodeNode,
  StateNode,
  CollectionNode,
  LoadCollectionItemNode,
};

export const CustomNodesFlowControl = {
  IfConditionNode,
  ElseIfNode,
  ElseNode,
  DelayNode,
  RandomNode,
  VariableNode,
  CheckMembershipNode,
  FormNode,
  ForLoopNode,
  ForLoopContinueNode,
};

export const CustomIntegration = {
  HTTPRequestNode,
  CallbackQueryAnswerNode,
  SubFlowNode,
  SubFlowExitNode,
};

export const CustomNodes = {
  // Triggers
  ...Triggers,

  // Actions - Text and Media
  ...ActionsTextAndMedia,

  // Actions - Message Operations
  ...ActionsMessageOperations,

  // Custom - Code and Data
  ...CustomNodesCodeAndData,

  // Custom - Flow Control
  ...CustomNodesFlowControl,

  // Custom - Integration
  ...CustomIntegration,
};
