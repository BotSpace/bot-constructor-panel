import type { CSSProperties } from "react";
import { StateCreator } from "zustand";
import type { Edge, Node } from "reactflow";
import { FlowStoreState, Actions } from "@/features/bot-constructor/store/types";
import { ElementItemType } from "@/types/element-types";
import { instanceAuth } from "@/services/instance";
import { getFormatFlow } from "@/features/bot-constructor/lib/format-flow";
import { generateId } from "@/lib/utils";
import { getNodeManifestByType } from "@/features/bot-constructor/manifest";

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
      };
    case "SendPhotoNode":
      return {
        ...baseMessageData,
        photoSourceType: "url",
        caption: "",
      };
    case "SendVideoNode":
      return {
        ...baseMessageData,
        videoSourceType: "url",
        caption: "",
      };
    case "SendAudioNode":
      return {
        ...baseMessageData,
        audioSourceType: "url",
        caption: "",
      };
    case "SendFileNode":
      return {
        ...baseMessageData,
        fileSourceType: "url",
        caption: "",
      };
    case "EditMessageNode":
      return {
        ...baseMessageData,
        messageIdSource: "this_message",
        messageId: null,
        newText: "",
        parseMode: "HTML",
        newCaption: "",
      };
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
      }; // Custom code uchun alohida sozlamalar
    case "CallbackQueryAnswerNode":
      return {
        ...baseMessageData,
      };

    case "FormNode":
      return { items: [] };

    case "SubFlowNode":
      return {
        slug: "",
        pluginName: "",
        pluginDescription: "",
        params: {},
        paramsSchema: {},
        outputs: [],
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

/**
 * Normalize a single edge to the canonical "smart-edge" format used by the
 * constructor.  This ensures legacy flows saved with type:"floating" or
 * targetHandle:null render identically to AI-generated edges.
 *
 * Rules:
 *  - type "floating" → "smart-edge"  (FloatingEdge is registered for both)
 *  - targetHandle null → "target-handler"  (left-side entry handle)
 *  - strokeWidth > 2 in style → reduced to 2  (match AI edge weight)
 *
 * Accessory edges (targetHandle starts with "acc:") are intentionally left
 * untouched because they route to specific sub-node ports, not the main
 * target-handler.
 */
const normalizeEdge = (edge: Edge): Edge => {
  const isAccessory =
    typeof edge.targetHandle === "string" && edge.targetHandle.startsWith("acc:");

  if (isAccessory) return edge;

  const type =
    edge.type === "floating" || edge.type === "smart-edge" || !edge.type
      ? "smart-edge"
      : edge.type;

  const targetHandle = edge.targetHandle ?? "target-handler";

  // Thin down any legacy strokeWidth > 2 that was stored in style.
  // Cast through CSSProperties so the spread keeps the correct type.
  const existingStyle = (edge.style ?? {}) as CSSProperties;
  const needsThinner =
    typeof existingStyle.strokeWidth === "number" &&
    (existingStyle.strokeWidth as number) > 2;
  const style: CSSProperties = needsThinner
    ? { ...existingStyle, strokeWidth: 2 }
    : existingStyle;

  return { ...edge, type, targetHandle, style };
};

/**
 * Migrate a node's legacy keyboard ({active, inline, reply}) to the new
 * {keyboard_kind, rows:[{columns:[btn]}]} shape consumed by NestedRowsField
 * and the engine loader shim.  Button objects (incl. collectionData) are
 * preserved verbatim inside columns.  The legacy `keyboard` key is removed so
 * the engine doesn't prefer it over `rows`.
 */
const migrateNodeKeyboard = (node: Node): Node => {
  const data = node.data as Record<string, unknown> | undefined;
  if (!data || typeof data !== "object") return node;

  // Already migrated
  if (Array.isArray(data.rows) && typeof data.keyboard_kind === "string") {
    return node;
  }

  const kb = data.keyboard as
    | { active?: string; inline?: unknown[]; reply?: unknown[] }
    | undefined;
  if (!kb || typeof kb !== "object") return node;

  const kind = kb.active === "reply" ? "reply" : "inline";
  const arr = Array.isArray(kb[kind]) ? (kb[kind] as unknown[]) : [];
  const rows = arr.map((row) => ({
    columns: Array.isArray(row) ? row : [],
  }));

  const nextData = { ...data };
  delete nextData.keyboard;
  nextData.keyboard_kind = kind;
  nextData.rows = rows;

  return { ...node, data: nextData };
};

/**
 * Eski format (data.state = {key, type}) bo'lsa, flat formatga o'tkaz.
 * State keyning mavjudligi saqlashni yoqadi; alohida save_state switchi yo'q.
 */
const migrateTriggerState = (node: Node): Node => {
  const data = node.data as Record<string, unknown> | undefined;
  if (!data || typeof data !== "object") return node;

  const state = data.state as Record<string, unknown> | undefined;
  if (
    state &&
    typeof state === "object" &&
    typeof state.key === "string" &&
    data.state_key === undefined
  ) {
    const nextData = { ...data };
    nextData.state_key = state.key;
    nextData.state_type = typeof state.type === "string"
      ? state.type
      : node.type === "CallbackQueryTriggerNode"
        ? "callback"
        : "text";
    delete nextData.state;
    delete nextData.save_state;
    return { ...node, data: nextData };
  }

  // The engine has treated state_key as the source of truth since the enable
  // switch was removed. Do not keep serializing the obsolete flag.
  if ("save_state" in data) {
    const nextData = { ...data };
    delete nextData.save_state;
    return { ...node, data: nextData };
  }

  return node;
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

  const rawEdges = Array.isArray(flowObject.edges)
    ? (flowObject.edges as Edge[])
    : [];

  return {
    nodes: Array.isArray(flowObject.nodes)
      ? (flowObject.nodes as Node[]).map(migrateNodeKeyboard).map(migrateTriggerState)
      : [],
    // Normalize every edge on load so legacy flows look identical to new flows
    edges: rawEdges.map(normalizeEdge),
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

    // Collab: broadcast the new node (full object) to other editors.
    get().emitCollabOp({ t: "na", node: newNode });

  },

  saveFlow: async (project_id: string) => {
    const { nodes, edges, languages, defaultLanguage } = get();
    set({ isLoading: true });

    try {
      // Go backend's UpdateRequest only accepts a raw `flow` (json.RawMessage) —
      // it has no flow_gz field, so the old gzip+base64 compression trick is a
      // silent no-op against it (unknown JSON keys are ignored). Always send
      // plain flow. languages/defaultLanguage stay at the flow top-level
      // (engine reads them from there).
      const flowPayload = { nodes, edges, languages, defaultLanguage };
      const payload = { flow: flowPayload };

      const response = await instanceAuth.patch(`/projects/${project_id}`, payload);
      if (response.status !== 200) {
        throw new Error("Serverda saqlashda xatolik.");
      }

      set({
        isDirty: false, // O'zgarishlar saqlandi
        initialState: { nodes, edges }, // Boshlang'ich holatni yangilaymiz
        lastSavedTime: new Date(), // Saqlash vaqtini yangilaymiz
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
    const { nodes, edges, emitCollabOp } = get();
    const formated = getFormatFlow(nodes, edges);

    set({ nodes: formated.nodes, edges: formated.edges, isDirty: true });

    // Format barcha node pozitsiyalarini qayta joylashtiradi — bu o'zgarish
    // chokepoint'lardan o'tmaydi, shuning uchun har bir yangi pozitsiyani WS
    // orqali QO'LDA tarqatamiz (nm). Shunda boshqa klientlar ham, server
    // (collab-worker) ham yangilanadi. Yuborilsa emitCollabOp isDirty'ni tozalaydi.
    for (const node of formated.nodes) {
      emitCollabOp({ t: "nm", id: node.id, position: node.position });
    }
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

      // Extract i18n language settings from the top-level flow object.
      // Legacy flows without these fields default to single-language mode.
      const parsedFlow = parseFlowInput(flow);
      const flowObj =
        parsedFlow && typeof parsedFlow === "object"
          ? (parsedFlow as Record<string, unknown>)
          : {};
      const loadedLanguages = Array.isArray(flowObj.languages)
        ? (flowObj.languages as string[])
        : ["en"];
      const loadedDefault =
        typeof flowObj.defaultLanguage === "string"
          ? (flowObj.defaultLanguage as string)
          : loadedLanguages[0] || "en";

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
        languages: loadedLanguages,
        defaultLanguage: loadedDefault,
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
