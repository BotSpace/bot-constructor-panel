// FAYL: constructor/nodes/triggers/CommandTrigger/types.ts

export interface CommandTriggerNodeData {
  /** Foydalanuvchi kiritgan buyruq (masalan, "start", "help"). "/" belgisisiz saqlanadi. */
  command?: string;
  /** Buyruq bilan birga keladigan qo'shimcha ma'lumotlarni (deep linking) ushlash uchun ixtiyoriy maydon */
  withArgs?: boolean;
}
