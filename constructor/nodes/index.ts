import {
  SendTextMessageNode,
  SendPhotoNode,
  SendVideoNode,
  SendAudioNode,
  SendFileNode,
} from "./actions";
import {
  CallbackButtonTriggerNode,
  MessageTriggerNode,
  ReplyButtonTriggerNode,
  CallbackQueryTriggerNode,
} from "./triggers";

import { CustomCodeNode } from "./custom";

export const CustomNodes = {
  ReplyButtonTriggerNode,
  MessageTriggerNode,
  CallbackButtonTriggerNode,
  CallbackQueryTriggerNode,
  SendTextMessageNode,
  SendPhotoNode,
  SendVideoNode,
  SendAudioNode,
  SendFileNode,
  CustomCodeNode,
};
