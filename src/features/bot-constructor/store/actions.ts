import { StateCreator } from "zustand";
import { Node } from "reactflow";
import { FlowStoreState, Actions } from "./types";
import { ElementItemType } from "@/types/element-types";
import { instanceAuth } from "@/services/instance";
import toast from "react-hot-toast";

// Node yaratilganda unga to'g'ri default ma'lumot beruvchi funksiya
const getDefaultNodeData = (nodeType: ElementItemType["triggerId"]) => {
  const baseMessageData = {
    recipients: { sendToSender: true, additionalIds: [] },
    keyboard: {
      active: "inline",
      inline: [],
      reply: [],
    },
  };

  const baseTriggerData = {
    global: true,
    context: {},
    node_type: nodeType,
  };

  switch (nodeType) {
    // Actions
    case "SendTextMessageNode":
      return {
        ...baseMessageData,
        messageText: "Yangi xabar",
        parseMode: "None",
      };
    case "SendPhotoNode":
      return { ...baseMessageData, photoSourceType: "url", caption: "" };
    case "SendVideoNode":
      return { ...baseMessageData, videoSourceType: "url", caption: "" };
    case "SendAudioNode":
      return { ...baseMessageData, audioSourceType: "url", caption: "" };
    case "SendFileNode":
      return { ...baseMessageData, fileSourceType: "url", caption: "" };
    case "EditMessageNode":
      return {
        messageIdSource: "context",
        editType: "text",
        messageText: "",
        parseMode: "None",
        keyboard: {
          active: "inline",
          inline: [],
          reply: [],
        },
      };
    case "CustomCodeNode":
      return {}; // Custom code uchun alohida sozlamalar

    // Triggers
    case "MessageTriggerNode":
      return {
        ...baseTriggerData,
      };
    case "ReplyButtonTriggerNode":
      return {
        ...baseTriggerData,
      };
    case "CommandTriggerNode":
      return {
        ...baseTriggerData,
        command: "/start",
      };
    case "CallbackQueryTriggerNode":
      return {
        ...baseTriggerData,
        filter: "",
        context: {
          value: "",
        },
      };
    // Custom Nodes
    case "StateNode":
      return {
        key: "state_key",
        type: "user_id",
        node_type: nodeType,
      };

    default:
      return {};
  }
};

let nodeIdCounter = 0;
const generateNodeId = () => `node_${Date.now()}_${nodeIdCounter++}`;

export const createActions: StateCreator<FlowStoreState, [], [], Actions> = (
  set,
  get
) => ({
  addNode: (element, position) => {
    const newNode: Node = {
      id: generateNodeId(),
      type: element.triggerId,
      position,
      data: getDefaultNodeData(element.triggerId || ""),
    };
    set({ nodes: [...get().nodes, newNode], isDirty: true });
  },

  saveFlow: async (project_id: string) => {
    const { nodes, edges } = get();
    set({ isLoading: true });
    toast.loading("Saqlanmoqda...");

    try {
      const response = await instanceAuth.patch(`/project/${project_id}/`, {
        flow: {
          nodes: nodes,
          edges: edges,
        },
      });
      if (response.status !== 200) {
        throw new Error("Serverda saqlashda xatolik.");
      }

      toast.dismiss();
      toast.success("Sxema muvaffaqiyatli saqlandi!");
      set({
        isDirty: false, // O'zgarishlar saqlandi
        initialState: { nodes, edges }, // Boshlang'ich holatni yangilaymiz
      });
    } catch (error) {
      console.error("Saqlashda xatolik:", error);
      // Xatolikni yuqoriga uzatamiz, toast.promise uni ushlab oladi
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  loadFlow: async (flow) => {
    set({ isLoading: true });

    // Avval initialState ni o'rnatamiz, keyin nodes va edges ni
    // Bu orqali onNodesChange va onEdgesChange chaqirilganda
    // initialState allaqachon mavjud bo'ladi
    set({
      initialState: {
        nodes: flow["nodes"],
        edges: flow["edges"],
      },
      isDirty: false, // Yangi yuklandi, demak o'zgarishlar yo'q
    });

    // Keyin nodes va edges ni o'rnatamiz
    // Bu isLoading: true bo'lganda bo'ladi, shuning uchun
    // onNodesChange va onEdgesChange isDirty ni o'zgartirmaydi
    set({
      nodes: flow["nodes"],
      edges: flow["edges"],
      isLoading: false,
    });
  },
});
