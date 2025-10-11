import { StateCreator } from "zustand";
import { toast } from "sonner";
import { Node } from "reactflow";
import { FlowStoreState, Actions } from "./types";

// Node yaratilganda unga to'g'ri default ma'lumot beruvchi funksiya
const getDefaultNodeData = (nodeType: string) => {
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

  saveFlow: async () => {
    const { nodes, edges } = get();
    set({ isLoading: true });
    toast.loading("Saqlanmoqda...");

    try {
      const flowData = { nodes, edges };
      const response = await fetch("flow/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(flowData),
      });

      if (!response.ok) {
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
