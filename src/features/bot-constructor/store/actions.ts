import { StateCreator } from "zustand";
import { Node } from "reactflow";
import { FlowStoreState, Actions } from "./types";
import { ElementItemType } from "@/types/element-types";
import { instanceAuth } from "@/services/instance";
import { SendTextMessageNodeData } from "../nodes/actions/TextMessageNode/types";
import { SendPhotoNodeData } from "../nodes/actions/PhotoMessageNode/types";
import { SendAudioNodeData } from "../nodes/actions/AudioMessageNode/types";
import { SendFileNodeData } from "../nodes/actions/FileMessageNode/types";
import { EditMessageNodeData } from "../nodes/actions/EditMessageNode";
import { DeleteMessageNodeData } from "../nodes/actions/DeleteMessageNode/DeleteMessageNode";
import { ForwardMessageNodeData } from "../nodes/actions/ForwardMessageNode/ForwardMessageNode";
import { DownloadFileNodeData } from "../nodes/actions/DownloadFileNode/DownloadFileNode";
import { CustomCodeNodeData } from "../nodes/custom/CustomCodeNode/types";
import { StateNodeData } from "../nodes/custom/StateNode/types";
import { SendLocationNodeData } from "../nodes/actions/LocationNode/types";
import { CallbackAnswerNodeData } from "../nodes/custom/CallbackAnswerNode/types";
import { getFormatFlow } from "../lib/format-flow";
import { generateId } from "@/lib/utils";
import { FormNodeData } from "../nodes/custom/FormNode/types";
import { CommandTriggerNodeData } from "../nodes/triggers/CommandTrigger/types";
import { SubFlowNodeData } from "../nodes/custom/SubFlowNode/types";
import { SubFlowExitNodeData } from "../nodes/custom/SubFlowExitNode/types";

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
    // Triggers
    case "CommandTriggerNode":
      return {
        command: "",
        withArgs: false,
        global: true,
      } as CommandTriggerNodeData;
    
    // Actions
    case "SendTextMessageNode":
      return {
        ...baseMessageData,
        messageText: "",
        parseMode: "HTML",
        disableNotification: false,
        protectContent: false,
        keyboard: {
          active: "inline",
          inline: [],
          reply: [],
        },
      } as SendTextMessageNodeData;
    case "SendPhotoNode":
      return {
        ...baseMessageData,
        photoSourceType: "url",
        caption: "",
      } as SendPhotoNodeData;
    case "SendVideoNode":
      return {
        ...baseMessageData,
        videoSourceType: "url",
        caption: "",
      } as SendPhotoNodeData;
    case "SendAudioNode":
      return {
        ...baseMessageData,
        audioSourceType: "url",
        caption: "",
      } as SendAudioNodeData;
    case "SendFileNode":
      return {
        ...baseMessageData,
        fileSourceType: "url",
        caption: "",
      } as SendFileNodeData;
    case "EditMessageNode":
      return {
        messageIdSource: "this_message",
        messageId: null,
        newText: "",
        parseMode: "HTML",
        newCaption: "",
        keyboard: {
          active: "inline",
          inline: [],
          reply: [],
        },
      } as EditMessageNodeData;
    case "DeleteMessageNode":
      return {
        deleteFromContext: false,
        messageId: undefined,
      } as DeleteMessageNodeData;
    case "ForwardMessageNode":
      return {
        recipientIds: [""],
      } as ForwardMessageNodeData;
    case "SendToAdminNode":
      return {}; // Maxsus sozlamalar yo'q
    case "DownloadFileNode":
      return {
        messageType: undefined,
      } as DownloadFileNodeData;
    case "CustomCodeNode":
      return {
        nodeTitle: "Custom Code",
        jsCode: "// Your code here",
        label: "custom_code_node",
        language: "javascript",
      } as CustomCodeNodeData; // Custom code uchun alohida sozlamalar
    case "SendLocationNode":
      return {
        keyboard: {
          active: "inline",
          inline: [],
          reply: [],
        },
      } as SendLocationNodeData;
    case "CallbackQueryAnswerNode":
      return {
        keyboard: {
          active: "inline",
          inline: [],
          reply: [],
        },
      } as CallbackAnswerNodeData;

    
    case "FormNode":
      return { items: [] } as FormNodeData;

    case "SubFlowNode":
      return {
        slug: "",
        pluginName: "",
        pluginDescription: "",
        params: {},
        outputs: [],
      } as SubFlowNodeData;

    case "SubFlowExitNode":
      return {
        exitName: "success",
      } as SubFlowExitNodeData;

    // Custom Nodes
    case "StateNode":
      return {
        key: "state_key",
        type: "user_id",
        node_type: nodeType,
      } as StateNodeData;

    default:
      return {};
  }
};

const generateNodeId = () => `node_${generateId()}`;

export const createActions: StateCreator<FlowStoreState, [], [], Actions> = (
  set,
  get
) => ({
  addNode: (element, position) => {
    const { saveToHistory } = get();

    // History ga saqlash (undo/redo flag tekshiriladi ichida)
    saveToHistory();

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

      set({
        isDirty: false, // O'zgarishlar saqlandi
        initialState: { nodes, edges }, // Boshlang'ich holatni yangilaymiz
        lastSavedTime: new Date(), // Saqlash vaqtini yangilaymiz
        countdownRemaining: null, // Countdown ni to'xtatamiz
      });
    } catch (error) {
      console.error("Saqlashda xatolik:", error);
      // Xatolikni yuqoriga uzatamiz, toast.promise uni ushlab oladi
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  formatFlow: async () => {
    const { nodes, edges } = get();
    const formated = getFormatFlow(nodes, edges);

    set({ nodes: formated.nodes, edges: formated.edges }); // To avoid unused variable warning
  },

  loadFlow: async (flow) => {
    const { clearHistory } = get();

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
      lastSavedTime: new Date(), // Yuklangan vaqtni saqlaymiz
    });

    // Keyin nodes va edges ni o'rnatamiz
    // Bu isLoading: true bo'lganda bo'ladi, shuning uchun
    // onNodesChange va onEdgesChange isDirty ni o'zgartirmaydi
    set({
      nodes: flow["nodes"],
      edges: flow["edges"],
      isLoading: false,
    });

    // History ni yangi flow bilan to'ldiramiz
    clearHistory();
  },
});
