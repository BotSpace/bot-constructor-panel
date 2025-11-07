import { callbackProperties, callbackSendMethods } from "./context";

export const callbackMethods = (monaco: any) => ({
  suggestions: [...callbackProperties(monaco), ...callbackSendMethods(monaco)],
});
