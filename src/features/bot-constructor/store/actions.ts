import { StateCreator } from "zustand";
import type { Edge, Node } from "reactflow";
import { FlowStoreState, Actions } from "./types";
import { ElementItemType } from "@/types/element-types";
import { instanceAuth } from "@/services/instance";
import {
  CallbackAnswerNodeData,
  CustomCodeNodeData,
  EditMessageNodeData,
  FormNodeData,
  SendAudioNodeData,
  SendFileNodeData,
  SendPhotoNodeData,
  SendTextMessageNodeData,
  StateNodeData,
  SubFlowNodeData,
} from "../nodes/types";
import { getFormatFlow } from "../lib/format-flow";
import { generateId } from "@/lib/utils";
import { getNodeManifestByType } from "../nodes/registry";

interface DownloadFileNodeData {
  messageType?: string;
}

interface DeleteMessageNodeData {
  deleteFromContext?: boolean;
  messageId?: string;
}

// Node yaratilganda unga to'g'ri default ma'lumot beruvchi funksiya
const getDefaultNodeData = (nodeType: ElementItemType["triggerId"]) => {
  const manifestDefaults = getNodeManifestByType(nodeType)?.defaults;
  if (manifestDefaults) {
    return manifestDefaults;
  }

  const baseMessageData = {
    recipients: { sendToSender: true, additionalIds: [] },
    keyboard: {
      active: "inline",
      inline: [],
      reply: [],
      replyOptions: {
        remove_after_use: true,
        resize_keyboard: true,
        one_time_keyboard: false,
        is_persistent: false,
      },
    },
  };

  switch (nodeType) {
    // Actions
    case "SendTextMessageNode":
      return {
        ...baseMessageData,
        messageText: "",
        parseMode: "HTML",
        disableNotification: false,
        protectContent: false,
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
        ...baseMessageData,
        messageIdSource: "this_message",
        messageId: null,
        newText: "",
        parseMode: "HTML",
        newCaption: "",
      } as EditMessageNodeData;
    case "DeleteMessageNode":
      return {
        deleteFromContext: false,
        messageId: undefined,
      } as DeleteMessageNodeData;
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
    case "CallbackQueryAnswerNode":
      return {
        ...baseMessageData,
      } as CallbackAnswerNodeData;

    case "FormNode":
      return { items: [] } as FormNodeData;

    case "SubFlowNode":
      return {
        slug: "",
        pluginName: "",
        pluginDescription: "",
        params: {},
        paramsSchema: {},
        outputs: [],
      } as SubFlowNodeData;

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

const describeValue = (value: unknown) => {
  if (Array.isArray(value)) return `array(length: ${value.length})`;
  if (value === null) return "null";
  return typeof value;
};

const parseFlowInput = (flow: unknown) => {
  if (typeof flow !== "string") return flow;

  try {
    return JSON.parse(flow);
  } catch (error) {
    throw new Error(
      `Flow JSON parse bo'lmadi: ${(error as Error).message}`,
    );
  }
};

const normalizeFlow = (flow: unknown) => {
  const parsedFlow = parseFlowInput(flow);
  const issues: string[] = [];

  if (!parsedFlow || typeof parsedFlow !== "object") {
    issues.push(`flow object bo'lishi kerak, hozir: ${describeValue(parsedFlow)}`);
  }

  const flowObject =
    parsedFlow && typeof parsedFlow === "object"
      ? (parsedFlow as { nodes?: unknown; edges?: unknown })
      : {};

  if (!Array.isArray(flowObject.nodes)) {
    issues.push(`flow.nodes array emas, hozir: ${describeValue(flowObject.nodes)}`);
  }

  if (!Array.isArray(flowObject.edges)) {
    issues.push(`flow.edges array emas, hozir: ${describeValue(flowObject.edges)}`);
  }

  return {
    nodes: Array.isArray(flowObject.nodes) ? (flowObject.nodes as Node[]) : [],
    edges: Array.isArray(flowObject.edges) ? (flowObject.edges as Edge[]) : [],
    issues,
  };
};

export const createActions: StateCreator<FlowStoreState, [], [], Actions> = (
  set,
  get,
) => ({
  addNode: (element, position) => {
    const { saveToHistory } = get();

    // History ga saqlash (undo/redo flag tekshiriladi ichida)
    saveToHistory();

    const newNode: Node = {
      id: generateNodeId(),
      type: element.triggerId,
      position,
      data: {
        ...getDefaultNodeData(element.triggerId || ""),
        ...(element.defaultData || {}),
      },
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

    try {
      const normalizedFlow = normalizeFlow(flow);

      if (normalizedFlow.issues.length > 0) {
        const message = `Flow strukturasi noto'g'ri: ${normalizedFlow.issues.join("; ")}`;
        console.error(message, {
          flow,
          normalizedFlow,
        });
        throw new Error(message);
      }

      // Avval initialState ni o'rnatamiz, keyin nodes va edges ni.
      // Bu orqali onNodesChange va onEdgesChange chaqirilganda
      // initialState allaqachon mavjud bo'ladi.
      set({
        initialState: {
          nodes: normalizedFlow.nodes,
          edges: normalizedFlow.edges,
        },
        isDirty: false,
        lastSavedTime: new Date(),
      });

      // Keyin nodes va edges ni o'rnatamiz.
      // Bu isLoading: true bo'lganda bo'ladi, shuning uchun
      // onNodesChange va onEdgesChange isDirty ni o'zgartirmaydi.
      set({
        nodes: normalizedFlow.nodes,
        edges: normalizedFlow.edges,
      });

      // History ni yangi flow bilan to'ldiramiz.
      clearHistory();
    } catch (error) {
      console.error("Flow yuklashda xatolik:", error, { flow });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
});
