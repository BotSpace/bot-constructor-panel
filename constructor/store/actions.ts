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
      return { ...baseMessageData, messageText: "Yangi xabar", parseMode: "None" };
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


export const createActions: StateCreator<
  FlowStoreState,
  [],
  [],
  Actions
> = (set, get) => ({
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
      set({ isDirty: false });
    } catch (error) {
      console.error("Saqlashda xatolik:", error);
      toast.dismiss();
      toast.error("Saqlashda xatolik yuz berdi.");
    } finally {
      set({ isLoading: false });
    }
  },

  loadFlow: async () => {
    set({ isLoading: true });
    toast.loading("Sxema yuklanmoqda...");
    try {
      const response = await fetch("/api/flow/load");
      if (!response.ok) throw new Error("Sxemani yuklab bo'lmadi.");
      const data = await response.json();

      // ID counter'ni mavjud nodelardan kelib chiqib o'rnatamiz
      if (data.nodes && data.nodes.length > 0) {
        const maxId = Math.max(...data.nodes.map((n: Node) => {
          const parts = n.id.split('_');
          return parts.length > 1 ? parseInt(parts[1], 10) : 0;
        }));
        nodeIdCounter = data.nodes.length;
      }

      set({ nodes: data.nodes || [], edges: data.edges || [], isDirty: false });
      toast.dismiss();
      toast.success("Sxema yuklandi.");
    } catch (error) {
      console.error("Yuklashda xatolik:", error);
      toast.dismiss();
      toast.error("Sxemani yuklashda xatolik yuz berdi.");
    } finally {
      set({ isLoading: false });
    }
  },
});
