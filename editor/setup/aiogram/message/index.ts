import { messageProperties } from "./context";
import { messageSendMethods } from "./send";
// edit.ts va boshqalardan ham import qilib qo'shishingiz mumkin

export const messageMethods = (monaco: any) => ({
  suggestions: [...messageProperties(monaco), ...messageSendMethods(monaco)],
});
