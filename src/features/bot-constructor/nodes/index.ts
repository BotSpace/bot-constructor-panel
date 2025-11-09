import {
  SendTextMessageNode,
  SendPhotoNode,
  SendVideoNode,
  SendAudioNode,
  SendFileNode,
  EditMessageNode,
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
  EditMessageNode,
  CustomCodeNode,
  CommandTriggerNode,
  StateNode,
  CollectionNode,
};
