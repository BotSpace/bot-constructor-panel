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
  CopyMessageNode,
  PinMessageNode,
  UnpinMessageNode,
  DeleteMessageNode,
  ChatActionNode,
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
  DownloadNode,
  IfConditionNode,
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
  CopyMessageNode,
  PinMessageNode,
  UnpinMessageNode,
  DeleteMessageNode,
  ChatActionNode,
  
  // Custom - Code and Data
  CustomCodeNode,
  StateNode,
  CollectionNode,
  LoadCollectionItemNode,
  DownloadNode,
  
  // Custom - Flow Control
  IfConditionNode,
  DelayNode,
  RandomNode,
  VariableNode,
  CheckMembershipNode,
  
  // Custom - Integration
  HTTPRequestNode,
  CallbackQueryAnswerNode,
};
