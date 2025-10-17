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

  switch (nodeType) {
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
    case "CustomCodeNode":
      return {}; // Custom code uchun alohida sozlamalar
    case "ReplyButtonTriggerNode":
      return {
        global: true,
        context: {},
      };
    case "CommandTriggerNode":
      return {
        command: "/start",
        global: true,
      };
    case "CallbackQueryTriggerNode":
      return {
        filter: "",
        global: true,
        context: {
          value: "",
        },
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

    set({
      nodes: flow["nodes"],
      edges: flow["edges"],
      isDirty: false, // Yangi yuklandi, demak o'zgarishlar yo'q
      initialState: {
        nodes: flow["nodes"],
        edges: flow["edges"],
      },
    });
  },
});
