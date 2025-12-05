import {
  SendTextMessageNode,
  SendPhotoNode,
  SendVideoNode,
  SendAudioNode,
  SendFileNode,
  EditMessageNode,
  SendAnimationNode,
  SendVoiceNode,
  SendVideoNoteNode,
  SendLocationNode,
  SendContactNode,
  SendPollNode,
  SendStickerNode,
  SendMediaGroupNode,
  SendVenueNode,
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
  MessageTriggerNode,
  ReplyButtonTriggerNode,
  CallbackQueryTriggerNode,
  CommandTriggerNode,
} from "./triggers";

import {
  CustomCodeNode,
  StateNode,
  CollectionNode,
  LoadCollectionItemNode,
  IfConditionNode,
  ElseIfNode,
  ElseNode,
  DelayNode,
  RandomNode,
  VariableNode,
  HTTPRequestNode,
  CallbackQueryAnswerNode,
  CheckMembershipNode,
} from "./custom";

export const CustomNodes = {
  // Triggers
  ReplyButtonTriggerNode,
  MessageTriggerNode,
  CallbackQueryTriggerNode,
  CommandTriggerNode,

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
  SendVenueNode,
  SendDiceNode,

  // Actions - Message Operations
  EditMessageNode,
  ForwardMessageNode,
  SendToAdminNode,
  CopyMessageNode,
  PinMessageNode,
  UnpinMessageNode,
  DeleteMessageNode,
  ChatActionNode,
  DownloadFileNode,

  // Custom - Code and Data
  CustomCodeNode,
  StateNode,
  CollectionNode,
  LoadCollectionItemNode,

  // Custom - Flow Control
  IfConditionNode,
  ElseIfNode,
  ElseNode,
  DelayNode,
  RandomNode,
  VariableNode,
  CheckMembershipNode,

  // Custom - Integration
  HTTPRequestNode,
  CallbackQueryAnswerNode,
};
