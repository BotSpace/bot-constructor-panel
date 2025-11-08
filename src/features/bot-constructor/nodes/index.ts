import {
  SendTextMessageNode,
  SendPhotoNode,
  SendVideoNode,
  SendAudioNode,
  SendFileNode,
} from "./actions";
import {
  MessageTriggerNode,
  ReplyButtonTriggerNode,
  CallbackQueryTriggerNode,
  CommandTriggerNode,
} from "./triggers";

import { CustomCodeNode, StateNode, CollectionNode } from "./custom";

export const CustomNodes = {
  ReplyButtonTriggerNode,
  MessageTriggerNode,
  CallbackQueryTriggerNode,
  SendTextMessageNode,
  SendPhotoNode,
  SendVideoNode,
  SendAudioNode,
  SendFileNode,
  CustomCodeNode,
  CommandTriggerNode,
  StateNode,
  CollectionNode,
};
