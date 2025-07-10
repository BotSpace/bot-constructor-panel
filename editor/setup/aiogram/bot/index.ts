import { sendMethods } from "./send";

export const botMethods = (monaco: any) => ({
  suggestions: [...sendMethods(monaco)],
});
