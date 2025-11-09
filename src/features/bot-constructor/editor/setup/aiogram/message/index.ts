import { messageProperties } from "./context";
import { messageSendMethods } from "./send";
import { messageEditMethods } from "./edit";

export const messageMethods = (monaco: any) => ({
  suggestions: [
    ...messageProperties(monaco),
    ...messageSendMethods(monaco),
    ...messageEditMethods(monaco),
  ],
});
