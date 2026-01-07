// constructor/store/index.ts

import { create } from "zustand";
import { FlowStoreState } from "./types";
import { createFlowSlice } from "./flowSlice";
import { createClipboardSlice } from "./clipboardSlice";
import { createHistorySlice } from "./historySlice";
import { createActions } from "./actions";
import { Connection, addEdge } from "reactflow";
import { KeyboardConfig } from "@/features/bot-constructor/components";
import { DynamicMessage, ParseMode } from "@/features/bot-constructor/nodes/actions/shared/types";

// Keling, shu usulga o'tamiz.
export const useFlowStore = create<FlowStoreState>()((set, get) => {
  return {
    initialState: null, // Boshlang'ich qiymat null

    // UI holatlari uchun boshlang'ich qiymatlar
    isDirty: false,
    isLoading: false,
    lastSavedTime: null,
    countdownRemaining: null,
    countdownDuration: 2000, // 2 sekund

    startCountdown: () => {
      set({ countdownRemaining: get().countdownDuration });
    },

    stopCountdown: () => {
      set({ countdownRemaining: null });
    },

    // Barcha slice'larni birlashtiramiz
    // Har bir slice'ga (set, get) ni uzatamiz
    ...createFlowSlice(set, get, {} as any),
    ...createClipboardSlice(set, get, {} as any),
    ...createHistorySlice(set, get, {} as any),
    ...createActions(set, get, {} as any),

    onConnect: (connection: Connection) => {
      const { initialState, saveToHistory, nodes, edges, updateNodeData } = get();

      // History ga saqlash (undo/redo flag tekshiriladi ichida)
      saveToHistory();

      // EditMessageHandler'dan chiqqan edge'ni aniqlash
      const isEditMessageEdge =
        connection.sourceHandle === "edit-message-source";

      // DeleteMessageHandler'dan chiqqan edge'ni aniqlash
      const isDeleteMessageEdge =
        connection.sourceHandle === "delete-message-source";

      // Edge rangini aniqlash
      let edgeColor = "#495057"; // Default kulrang
      if (isEditMessageEdge) {
        edgeColor = "#f97316"; // Orange
      } else if (isDeleteMessageEdge) {
        edgeColor = "#ef4444"; // Red
      }

      const newEdge = {
        ...connection,
        type: "step",
        markerEnd: {
          type: "arrow",
          width: 30,
          height: 30,
          color: edgeColor,
        },
        // React Flow'ning default edge'ini ishlatamiz
        // Rasmga mos stil
        style: {
          strokeWidth: 1.5,
          stroke: edgeColor,
        },
        // EditMessageHandler va DeleteMessageHandler'dan chiqqan edge'lar uchun animated true
        animated: isEditMessageEdge || isDeleteMessageEdge ? true : false,
      };

      const newEdges = addEdge(newEdge, get().edges);

      // Haqiqiy o'zgarishlarni tekshirish
      const hasRealChanges =
        !initialState ||
        JSON.stringify(newEdges) !== JSON.stringify(initialState.edges);

      set({
        edges: newEdges,
        isDirty: hasRealChanges,
      });

      // EditMessage nodedan boshqa nodega ulanish holatini tekshirish
      if (isEditMessageEdge && connection.source && connection.target) {
        const sourceNode = nodes.find((n) => n.id === connection.source);
        const targetNode = nodes.find((n) => n.id === connection.target);

        // Agar source EditMessageNode bo'lsa va bu birinchi ulanish bo'lsa
        if (sourceNode && sourceNode.type === "EditMessageNode" && targetNode) {
          // Yangi qo'shilgan edge bilan birga EditMessageNode'dan chiqqan barcha edit-message-source edgelarni sanash
          const editEdgesCount = newEdges.filter(
            (e) =>
              e.source === connection.source &&
              e.sourceHandle === "edit-message-source"
          ).length;

          // Agar bu birinchi ulanish bo'lsa (faqat yangi edge bor)
          if (editEdgesCount === 1) {
            // Target nodening ma'lumotlarini nusxalash
            const targetData = targetNode.data;

            // Ma'lumotlarni nusxalash uchun yangilanish obyekti
            const dataUpdate: Partial<{
              newText: string;
              newCaption: string;
              parseMode: ParseMode;
              keyboard: KeyboardConfig;
              dynamicMessages: DynamicMessage[];
            }> = {};

            // SendTextMessageNode uchun
            if (targetNode.type === "SendTextMessageNode") {
              if (targetData.messageText) {
                dataUpdate.newText = targetData.messageText;
              }
            }
            // SendPhotoNode, SendVideoNode, SendFileNode, SendAudioNode uchun
            else if (
              targetNode.type === "SendPhotoNode" ||
              targetNode.type === "SendVideoNode" ||
              targetNode.type === "SendFileNode" ||
              targetNode.type === "SendAudioNode"
            ) {
              if (targetData.caption) {
                dataUpdate.newCaption = targetData.caption;
              }
            }

            // Barcha xabar turlari uchun umumiy ma'lumotlar
            if (targetData.parseMode) {
              dataUpdate.parseMode = targetData.parseMode;
            }
            if (targetData.keyboard) {
              dataUpdate.keyboard = structuredClone(targetData.keyboard);
            }
            if (targetData.dynamicMessages) {
              dataUpdate.dynamicMessages = structuredClone(targetData.dynamicMessages);
            }

            // Agar nusxalanishi kerak bo'lgan ma'lumotlar bo'lsa, yangilash
            if (Object.keys(dataUpdate).length > 0) {
              updateNodeData(connection.source, dataUpdate);
            }
          }
        }
      }
    },
  };
});
