import { StateCreator } from "zustand";
import { toast } from "sonner";
import { Node } from "reactflow";
import { FlowStoreState, Actions } from "./types";
import { instanceAuth } from "@/services/instance";
import { APIResponseType } from "@/types/http";
import { FlowData } from "@/types/http/flow";

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
const generateNodeId = () => `dndnode_${Date.now()}_${nodeIdCounter++}`;

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
      const response = await fetch("/api/flow/save", {
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

  loadFlow: async (flowId) => {
    set({ isLoading: true });
    try {
      const response = await instanceAuth<APIResponseType<FlowData>>(
        "/project/flow/" + flowId
      );
      if (response.status != 200) throw new Error("Sxemani yuklab bo'lmadi.");

      // Yuklangandan so'ng, ham joriy, ham boshlang'ich holatni o'rnatamiz.
      const json = response.data.data.data;

      set({
        nodes: json["nodes"] || [],
        edges: json["edges"] || [],
        isDirty: false, // Yangi yuklandi, demak o'zgarishlar yo'q
        initialState: {
          nodes: json["nodes"] || [],
          edges: json["edges"] || [],
        },
      });
    } catch (error) {
      console.error("Yuklashda xatolik:", error);
      toast.error("Sxemani yuklashda xatolik yuz berdi.");
    } finally {
      set({ isLoading: false });
    }
  },
});
