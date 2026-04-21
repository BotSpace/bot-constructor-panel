// constructor/store/index.ts

import { create } from "zustand";
import { FlowStoreState } from "./types";
import { createFlowSlice } from "./flowSlice";
import { createClipboardSlice } from "./clipboardSlice";
import { createHistorySlice } from "./historySlice";
import { createActions } from "./actions";
import { Connection, addEdge } from "reactflow";
import { KeyboardConfig } from "@/features/bot-constructor/components";
import { DynamicMessage, ParseMode } from "@/features/bot-constructor/nodes/types";

// EditMessage node uchun ma'lumotlarni nusxalash uchun interface
interface EditMessageDataUpdate {
  newText?: string;
  newCaption?: string;
  parseMode?: ParseMode;
  keyboard?: KeyboardConfig;
  dynamicMessages?: DynamicMessage[];
}

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

    // Barcha nodelarni collapse qilish
    collapseAllSignal: 0,
    collapseAllNodes: () => {
      set((state) => ({ collapseAllSignal: state.collapseAllSignal + 1 }));
    },

    // Barcha nodelarni expand qilish
    expandAllSignal: 0,
    expandAllNodes: () => {
      set((state) => ({ expandAllSignal: state.expandAllSignal + 1 }));
    },

    // Right-panel editing
    editingNodeId: null,
    setEditingNodeId: (id: string | null) => set({ editingNodeId: id }),

    // Edge visibility toggle
    edgesVisible: true,
    toggleEdgesVisibility: () => set((state) => ({ edgesVisible: !state.edgesVisible })),

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

      // Handler handle'dan chiqqan edge'ni aniqlash (keyboard tugmalari)
      const isHandlerEdge =
        connection.sourceHandle?.startsWith("target-handler-") ||
        connection.sourceHandle?.startsWith("source-handler-");

      // Edge rangini aniqlash
      let edgeColor = "#495057"; // Default kulrang
      if (isEditMessageEdge) {
        edgeColor = "#f97316"; // Orange
      } else if (isDeleteMessageEdge) {
        edgeColor = "#ef4444"; // Red
      }

      const newEdge = {
        ...connection,
        // type: isHandlerEdge ? "step" : "floating",
        type: "floating",
        markerEnd: {
          type: "arrow",
          width: 30,
          height: 30,
          color: edgeColor,
        },
        // React Flow'ning default edge'ini ishlatamiz
        // Rasmga mos stil
        style: {
          strokeWidth: 4,
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
        const editMessageNode = nodes.find((n) => n.id === connection.source);
        const messageNode = nodes.find((n) => n.id === connection.target);

        // Agar source EditMessageNode bo'lsa va bu birinchi ulanish bo'lsa
        if (editMessageNode && editMessageNode.type === "EditMessageNode" && messageNode) {
          // Yangi qo'shilgan edge bilan birga EditMessageNode'dan chiqqan barcha edit-message-source edgelarni sanash
          const editEdgesCount = newEdges.filter(
            (e) =>
              e.source === connection.source &&
              e.sourceHandle === "edit-message-source"
          ).length;

          // Agar bu birinchi ulanish bo'lsa (faqat yangi edge bor)
          if (editEdgesCount === 1) {
            // Message nodening ma'lumotlarini nusxalash
            const messageData = messageNode.data;

            // Ma'lumotlarni nusxalash uchun yangilanish obyekti
            const dataUpdate: EditMessageDataUpdate = {};

            // SendTextMessageNode uchun
            if (messageNode.type === "SendTextMessageNode") {
              if (messageData.messageText) {
                dataUpdate.newText = messageData.messageText;
              }
            }
            // SendPhotoNode, SendVideoNode, SendFileNode, SendAudioNode uchun
            else if (
              messageNode.type === "SendPhotoNode" ||
              messageNode.type === "SendVideoNode" ||
              messageNode.type === "SendFileNode" ||
              messageNode.type === "SendAudioNode"
            ) {
              if (messageData.caption) {
                dataUpdate.newCaption = messageData.caption;
              }
            }

            // Barcha xabar turlari uchun umumiy ma'lumotlar
            if (messageData.parseMode) {
              dataUpdate.parseMode = messageData.parseMode;
            }
            if (messageData.keyboard) {
              dataUpdate.keyboard = structuredClone(messageData.keyboard);
            }
            if (messageData.dynamicMessages) {
              dataUpdate.dynamicMessages = structuredClone(messageData.dynamicMessages);
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
