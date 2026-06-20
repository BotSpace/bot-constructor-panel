# Node System — To'liq Dokumentatsiya

> Mavjud docs bilan aloqa: [ARCHITECTURE.md](./ARCHITECTURE.md) | [node_types.md](./node_types.md) | [AI_AGENT_ARCHITECTURE.md](./AI_AGENT_ARCHITECTURE.md)

---

## 1. Node Render Pipeline

Bitta node canvas'da qanday paydo bo'lib ishlashi — bosqichma-bosqich.

### 1.1 Manifest (ma'lumot manbai)

**Fayl:** `src/features/bot-constructor/nodes/manifests/runtime-node-registry.json`

JSON massiv — har bir element bitta node turini to'liq tavsiflaydi:

```
type            — React Flow nodeTypes kaliti (masalan "SendTextMessageNode")
status          — "runtime" (yagona qiymat)
category        — node tarkibiy guruhi (triggers / actions / ...)
sidebar.groupId — sidebar panelida ko'rsatiladigan guruh
handles[]       — ulanish nuqtalari presetlari yoki inline tavsiflari
content[]       — maydon sxemalari (FieldManifest[])
footer[]        — pastki panel elementi (handlersList | actionPanel)
defaults        — yangi node qo'shilganda standart qiymatlar
accessory       — true bo'lsa n8n uslubidagi aylana node (AI provider/tool)
accessoryPorts  — parent node'ning pastki attachment portlari (AIAgentNode)
producesState   — node ishga tushganda avtomatik hosil qilinadigan state kalitlari
```

**Fayl:** `src/features/bot-constructor/nodes/registry/manifestStore.ts`

```ts
export const runtimeNodeRegistry = registryJson as NodeManifest[];
const nodeManifestMap = new Map(...); // O(1) qidirish uchun
export function getNodeManifestByType(type: string) { ... }
```

### 1.2 Node Registry va Component Yaratish

**Fayl:** `src/features/bot-constructor/nodes/registry/index.ts`

```ts
// Barcha runtime node'lar uchun avtomatik component yaratadi:
export const genericNodeTypes = runtimeNodeRegistry
  .filter(entry => entry.status === "runtime")
  .reduce((acc, entry) => {
    acc[entry.type] = createGenericNodeComponent(entry.type);
    return acc;
  }, {});
```

**Fayl:** `src/features/bot-constructor/nodes/generic/createGenericNodeComponent.tsx`

```ts
// Har bir node turi uchun manifest → GenericNodeRenderer wrapper:
export function createGenericNodeComponent(type: string) {
  const Component = (props: NodeProps) => {
    const manifest = getNodeManifestByType(type);
    return <GenericNodeRenderer {...props} manifest={manifest} />;
  };
  return memo(Component);
}
```

Bu `genericNodeTypes` map `constructor.tsx`ga uzatiladi va React Flow `nodeTypes` propiga beriladi.

### 1.3 GenericNodeRenderer — Asosiy Render Komponenti

**Fayl:** `src/features/bot-constructor/nodes/generic/GenericNodeRenderer.tsx` (316 qator)

Ikki xil render yo'li mavjud:

#### A) Accessory Node (AI provider/tool — aylana forma)

`manifest.accessory === true` bo'lsa `AccessoryNodeCard` render qilinadi:

```
AccessoryNodeCard
  ├── handles (renderHandleFromManifest)
  ├── .acc-node-circle (icon markazida)
  │     debug-status CSS ring via [data-debug-status]
  │     selected ring via [data-accessory-selected]
  └── label area (title + "tool"/"provider" badge)
```

#### B) Oddiy Flow Node (Card forma)

```
Card (shadow-lg, selected ring-2, trigger nodes → asimmetrik border-radius)
  ├── cardHandles (renderHandleFromManifest × N)
  ├── NodeHeader
  │     ├── icon (64×64 rangli blok)
  │     ├── title (manifest.titleTemplate || custom label || i18n)
  │     ├── category badge
  │     └── handleSlot (handlersList bo'lgan node'larda source-default bu yerga ko'chadi)
  ├── CardContent (isCollapsed=false bo'lsa ko'rinadi)
  │     └── FieldWidget × N  ← canvas'dagi inline maydonlar
  ├── CardFooter (actionPanel footer bo'lsa)
  │     └── ActionPanel
  └── HandlersList (handlersList footer bo'lsa, collapse'dan tashqarida)
```

**Muhim:** `hasHandlersList` bo'lsa `source-default` handle NodeHeader'ga ko'chiriladi — aks holda u katta CardFooter ichiga siljib qoladi.

**Debug status:** `useDebugStatusStore(s => s.statuses[id])` orqali olinadi. `data-debug-status` attributi qo'yiladi va CSS globals.css'da ring'ni boshqaradi.

**Title resolution zanjiri:**
1. `data.node_label` (foydalanuvchi yozgan)
2. `manifest.titleTemplate` (`{{command}}` kabi interpolatsiya)
3. i18n `manifest.titleKey` → fallback `manifest.titleFallback`

### 1.4 NodeHeader

**Fayl:** `src/features/bot-constructor/nodes/actions/shared/NodeHeader.tsx` (147 qator)

- 64×64 rangli icon bloki (`colorToken` → `NODE_COLOR_CLASS_REGISTRY`)
- Title (kichik, uppercase, tracking)
- Category badge (trigger/action/logic/integration/ai/tool/provider)
- `handleSlot` prop: source-default handle anchor
- `useIsInNodePanel()` — panel ichida render bo'lsa `null` qaytaradi (canvas'ga xos)
- Click → `onToggleCollapse` (node yig'iladi/yoyiladi)

### 1.5 Field Widget'lar (Inline Canvas)

**Fayl:** `src/features/bot-constructor/nodes/registry/fieldWidgetRegistry.tsx` (333 qator)

Canvas'da `manifest.content[]` maydonlarini render qiladi.

`PANEL_ONLY_FIELD_TYPES` to'plami — bu maydonlar canvas'da **ko'rsatilmaydi**, faqat NodeEditPanel'da:

```
nested-rows, action-keyboard, action-recipients, code-editor,
collection-select, condition-list, cron-editor, trigger-config,
dynamic-params, array-editor, state-type-select, collection-binding,
credential, dynamic_select, dynamic_inputs
```

Canvas'da ko'rsatiladigan maydon turlari: `text`, `number`, `textarea`, `select`, `checkbox`, `switch`, `description`, `richTextMessage`, `mediaMessage`, `stateConfig`, `stringArray`, `widget`.

Eksport: `FieldWidget` (memo'd), `isFieldVisible()`, `getContentClassName()`.

### 1.6 NodeEditPanel — Yon Panel (To'liq Tahrirlash)

**Fayl:** `src/features/bot-constructor/components/NodeEditPanel/index.tsx`

Node tanlanganida ochiladi (Sheet yoki Dialog). Uchta bo'lim:

| Komponent | Fayl | Rol |
|---|---|---|
| `ModalNodeFormRenderer` | `NodeEditPanel/ModalNodeFormRenderer.tsx` | Manifest'dan maydonlarni render qiladi |
| `NodeOverviewPanel` | `NodeEditPanel/NodeOverviewPanel.tsx` | Node haqida umumiy ma'lumot |
| `NodeVariablePanel` | `NodeEditPanel/NodeVariablePanel.tsx` | State kalitlari va o'zgaruvchilar |

`ModalNodeFormRenderer` optional fields boshqaruvini amalga oshiradi: `activeOptionalFields` node data'sida saqlanadi, "Qo'shimcha maydon qo'shish" dropdown orqali faollashtiriladi.

### 1.7 ModalFieldWidget — Panel Maydon Widget'lari

**Fayl:** `src/features/bot-constructor/components/NodeEditPanel/modal-field-widgets.tsx`

Barcha murakkab field turlari shu fayldan chaqiriladi:

```
ArrayEditorField      — generic-fields/ArrayEditorField.tsx
CodeEditorField       — generic-fields/CodeEditorField.tsx
ToolParamsField       — generic-fields/ToolParamsField.tsx
CollectionSelectField — generic-fields/CollectionSelectField.tsx
CredentialSelectField — generic-fields/CredentialSelectField.tsx
DynamicSelectField    — generic-fields/DynamicSelectField.tsx
DynamicInputsField    — generic-fields/DynamicInputsField.tsx
StateTypeSelectField  — generic-fields/StateTypeSelectField.tsx
ConditionListField    — generic-fields/ConditionListField.tsx
CronEditorField       — generic-fields/CronEditorField.tsx
TriggerConfigField    — generic-fields/TriggerConfigField.tsx
DynamicParamsField    — generic-fields/DynamicParamsField.tsx
NestedRowsField       — generic-fields/NestedRowsField.tsx
RichTextMessageField  — widgets/shared-message-fields.tsx
MediaMessageField     — widgets/shared-message-fields.tsx
```

Bundan tashqari `widgetRegistry.tsx`'dagi maxsus widget'lar (`widgetKey` bilan):

```
messageTrigger           → MessageTriggerWidget
callbackQueryTrigger     → CallbackQueryTriggerWidget
replyButtonTrigger       → ReplyButtonTriggerWidget
cronTrigger              → CronTriggerWidget
buttonGenerator          → ButtonGeneratorWidget
downloadFile             → DownloadFileWidget
httpRequest              → HTTPRequestWidget
editMessage              → EditMessageWidget
ifCondition              → IfConditionWidget (legacy)
elseIf                   → ElseIfWidget (legacy)
checkMembership          → CheckMembershipWidget
poll                     → PollWidget
mediaGroup               → MediaGroupWidget
state                    → StateWidget
customCode               → CustomCodeWidget
form                     → FormWidget
collection               → CollectionWidget
aiCollectionToolConfig   → (widget key)
aiKnowledgeToolConfig    → (widget key)
```

### 1.8 Handle'lar — Ulanish Nuqtalari

**Fayl:** `src/features/bot-constructor/nodes/registry/handlePresetRegistry.tsx` (222 qator)

`renderHandleFromManifest(handle, nodeId, key, accessoryPorts)` — manifest handle tavsifini React Flow Handle komponentiga aylantiradi.

Preset'lar:

| Preset | Natija |
|---|---|
| `target-default` | `<TargetHandles />` — chapdan kiruvchi |
| `source-default` | `<SourceHandles nodeId={...} />` — o'ngdan chiquvchi |
| `source-bottom` | Pastdan chiquvchi |
| `source-top` | Yuqoridan chiquvchi (accessory) |
| `else-source` | `<ElseMessageSource />` |
| `selected-message-target` | `<SelectedMessageTarget />` |
| `edit-message-source` | `<EditMessageSource />` |
| `delete-message-source` | `<DeleteMessageSource />` |
| `subflow-dynamic-sources` | `<DynamicOutputsSources />` — outputs massividan dinamik |
| `dynamic-outputs-sources` | `<DynamicOutputsSources />` — CustomCodeNode |
| `accessory-ports` | `<AccessoryPortHandles ports={...} />` — AIAgentNode pastki portlari |

Inline handle (preset yo'q): `kind + side + id + offsetClass + styleVariant` → `<PillHandle />`.

**PillHandle** — `src/features/bot-constructor/nodes/components/shared/ReactFlowHandles/PillHandle.tsx` — asosiy handle komponenti. Tone: `neutral | success | warning | danger | accent`.

**AccessoryPortHandles** — AIAgentNode'ning `ai_model` va `ai_tool` portlari (pastki chiziq bo'ylab joylashadi).

**DynamicOutputsSources** — `CustomCodeNode` va `SubFlowNode` uchun: `data.outputs[]` massividan dinamik handle'lar yaratadi.

**NodePanelContext** — panel ichida handle'lar `null` qaytaradi (`useIsInNodePanel()` orqali).

### 1.9 Edge'lar

**Fayl:** `src/features/bot-constructor/edges/`

| Komponent/Fayl | Rol |
|---|---|
| `FloatingEdge.tsx` | Asosiy edge komponenti — floating path, renkli |
| `SelectableEdge.tsx` | Tanlanadigan edge wrapper |
| `FloatingConnectionLine.tsx` | Drag qilayotgan vaqtdagi connection vizualizatsiyasi |
| `useEdgeColor.ts` | Handle styleVariant → edge rangi (success=yashil, danger=qizil...) |
| `EdgeContextMenu.tsx` | O'ng tugma menyusi (o'chirish va h.k.) |
| `utils.ts` | Floating path hisoblash |

### 1.10 WS/Debug

**Fayl:** `src/wss/web-socket-provider.tsx`

WebSocket orqali engine'dan node execution statusini oladi → `useDebugStatusStore`ga yozadi. GenericNodeRenderer shu store'dan `data-debug-status` attributi uchun o'qiydi (CSS ring'lar orqali canvas'da ko'rinadi).

**Fayl:** `src/features/bot-constructor/store/debug-status.ts`

```ts
// { statuses: Record<nodeId, "running" | "success" | "error" | ...> }
export const useDebugStatusStore = create(...)
```

**Fayl:** `src/components/layout/components/debug-console/debug-context-store.ts`

Debug console'dagi xatolar va log'lar alohida Zustand store'da saqlanadi.

---

## 2. Komponentlar Inventarizatsiyasi

### 2.1 Render qatlami

| Komponent | Fayl (src/...dan) | Rol |
|---|---|---|
| `GenericNodeRenderer` | `nodes/generic/GenericNodeRenderer.tsx` | Asosiy node render — Card yoki AccessoryNodeCard |
| `AccessoryNodeCard` | `nodes/generic/GenericNodeRenderer.tsx` (ichida) | AI provider/tool uchun aylana forma |
| `createGenericNodeComponent` | `nodes/generic/createGenericNodeComponent.tsx` | Manifest → memoized React component factory |
| `NodeHeader` | `nodes/actions/shared/NodeHeader.tsx` | Node sarlavha bloki (icon + title + badge) |
| `FieldWidget` | `nodes/registry/fieldWidgetRegistry.tsx` | Canvas inline maydon (memo'd) |
| `ModalFieldWidget` | `components/NodeEditPanel/modal-field-widgets.tsx` | Panel maydon widget dispatcher |
| `ModalNodeFormRenderer` | `components/NodeEditPanel/ModalNodeFormRenderer.tsx` | Panel forma renderer (optional fields boshqaradi) |
| `NodeEditPanel` | `components/NodeEditPanel/index.tsx` | Yon panel Shell — Sheet/Dialog |
| `NodeOverviewPanel` | `components/NodeEditPanel/NodeOverviewPanel.tsx` | Node haqida umumiy ko'rinish |
| `NodeVariablePanel` | `components/NodeEditPanel/NodeVariablePanel.tsx` | State kalitlari va o'zgaruvchilar |

### 2.2 Generic Fields (modal-field-widgets orqali chaqiriladi)

| Komponent | Fayl | Ishlatilishi |
|---|---|---|
| `ArrayEditorField` | `nodes/widgets/generic-fields/ArrayEditorField.tsx` | SendPollNode (options), SendMediaGroupNode, FormNode, CheckMembershipNode, SendInvoiceNode |
| `CodeEditorField` | `nodes/widgets/generic-fields/CodeEditorField.tsx` | CustomCodeNode, AICustomCodeToolNode |
| `ToolParamsField` | `nodes/widgets/generic-fields/ToolParamsField.tsx` | AICustomCodeToolNode |
| `CollectionSelectField` | `nodes/widgets/generic-fields/CollectionSelectField.tsx` | CollectionNode, LoadCollectionItemNode, LoadCollectionListNode, UpdateCollectionNode, DeleteCollectionNode |
| `CredentialSelectField` | `nodes/widgets/generic-fields/CredentialSelectField.tsx` | AIOpenAIProviderNode, AIOllamaProviderNode, AIGeminiProviderNode, GoogleSheetsNode, GoogleDriveNode, AIGoogleSheetsToolNode, widgetRegistry (HTTPRequestWidget) |
| `DynamicSelectField` | `nodes/widgets/generic-fields/DynamicSelectField.tsx` | GoogleSheetsNode (spreadsheet_id, sheet), GoogleDriveNode (folder_id, file_id) |
| `DynamicInputsField` | `nodes/widgets/generic-fields/DynamicInputsField.tsx` | GoogleSheetsNode (values) |
| `StateTypeSelectField` | `nodes/widgets/generic-fields/StateTypeSelectField.tsx` | StateNode |
| `ConditionListField` | `nodes/widgets/generic-fields/ConditionListField.tsx` | IfConditionNode, ElseIfNode, GoogleSheetsNode (filter) |
| `CronEditorField` | `nodes/widgets/generic-fields/CronEditorField.tsx` | CronNode, CronTriggerNode |
| `TriggerConfigField` | `nodes/widgets/generic-fields/TriggerConfigField.tsx` | MessageTriggerNode, CallbackQueryTriggerNode, ReplyButtonTriggerNode, CallbackButtonTriggerNode |
| `DynamicParamsField` | `nodes/widgets/generic-fields/DynamicParamsField.tsx` | SubFlowNode |
| `NestedRowsField` | `nodes/widgets/generic-fields/NestedRowsField.tsx` | Barcha tugma bo'lgan node'lar (SendTextMessageNode, SendPhotoNode, ...) |
| `DynamicButtonForm` | `nodes/widgets/generic-fields/DynamicButtonForm.tsx` | Inline keyboard builder |
| `RichTextMessageField` | `nodes/widgets/shared-message-fields.tsx` | SendTextMessageNode, EditMessageNode, EditOrSendMessageNode |
| `MediaMessageField` | `nodes/widgets/shared-message-fields.tsx` | SendPhotoNode, SendVideoNode, SendAudioNode, SendFileNode |

### 2.3 Registry/Manifest qatlami

| Fayl | Rol | Ishlatilgan joylari |
|---|---|---|
| `nodes/manifests/runtime-node-registry.json` | 81 ta node manifesti — yagona haqiqat manbai | manifestStore.ts orqali |
| `nodes/registry/manifestStore.ts` | JSON → `NodeManifest[]` + `getNodeManifestByType()` Map | 11 ta fayl |
| `nodes/registry/types.ts` | TypeScript interfeyslari — `NodeManifest`, `NodeFieldManifest`, `NodeHandleManifest`, `NodeAccessoryPortManifest` | Barcha registry/widget fayllar |
| `nodes/registry/iconRegistry.tsx` | `iconName` → Lucide icon yoki emoji | GenericNodeRenderer, useElements |
| `nodes/registry/colorRegistry.ts` | `colorToken` → Tailwind class (canvas va sidebar uchun alohida registry) | GenericNodeRenderer, NodeEditPanel, useElements |
| `nodes/registry/handlePresetRegistry.tsx` | Preset → React Flow Handle komponenti | GenericNodeRenderer (4 marta) |
| `nodes/registry/fieldWidgetRegistry.tsx` | Canvas FieldWidget dispatcher | GenericNodeRenderer, shared-message-fields, modal-field-widgets, ModalNodeFormRenderer |
| `nodes/registry/index.ts` | `genericNodeTypes` map yaratadi + validatsiya | constructor.tsx |
| `nodes/widgets/widgetRegistry.tsx` | `widgetKey` → maxsus Widget komponenti | fieldWidgetRegistry.tsx, modal-field-widgets.tsx |

### 2.4 Node tanlash va qo'shish

| Komponent/Fayl | Rol |
|---|---|
| `NodeSelectionDialog.tsx` | Sheet dialog — node qidirish va tanlash UI |
| `data/useElements.ts` | Manifest → sidebar group elementlari (i18n, icon, color bilan) |
| `constructor.tsx` | NodeSelectionDialog → onAddNode → Zustand `actions.addNode` |

### 2.5 Store

| Fayl | Rol |
|---|---|
| `store/index.ts` | `useFlowStore` assembly (flowSlice + clipboardSlice + historySlice + actions) |
| `store/flowSlice.ts` | nodes[], edges[], updateNodeData, setNodes, setEdges |
| `store/actions.ts` | addNode, deleteNode, save, load — yuksek darajali operatsiyalar |
| `store/historySlice.ts` | undo/redo stacks, `isDirty` flag |
| `store/clipboardSlice.ts` | Copy/paste buffer |
| `store/debug-status.ts` | `{ statuses: Record<nodeId, string> }` — WS'dan keladi |

`useFlowStore` — **39 ta faylda** ishlatiladi (barcha node widget, panel, hook, edge komponenti).

### 2.6 Edge komponentlari

| Fayl | Rol |
|---|---|
| `edges/FloatingEdge.tsx` | Asosiy edge — floating bezier path + PillHandle |
| `edges/SelectableEdge.tsx` | Tanlanadigan edge wrapper |
| `edges/FloatingConnectionLine.tsx` | Drag connection vizualizatsiyasi |
| `edges/useEdgeColor.ts` | Handle styleVariant → rang klass |
| `edges/EdgeContextMenu.tsx` | Context menu (o'chirish) |
| `edges/utils.ts` | Floating path hisoblash yordamchi |

### 2.7 WS/Debug

| Fayl | Rol |
|---|---|
| `wss/web-socket-provider.tsx` | WS → `useDebugStatusStore` → canvas status ring |
| `store/debug-status.ts` | Node execution statuses store |
| `components/layout/components/debug-console/debug-context-store.ts` | Debug console xatoliklari store |
| `components/layout/components/debug-console/debug-console.tsx` | Debug console UI |

---

## 3. Ishlatilish Soni (Usage Counts)

| Komponent | Fayl | Import/Ishlatilish soni | Qayerda |
|---|---|---|---|
| `useFlowStore` | `store/index.ts` | **39 ta fayl** | Barcha node widget, panel, hook, edge, constructor |
| `getNodeManifestByType` / `runtimeNodeRegistry` | `registry/manifestStore.ts` | **11 ta fayl** | constructor, registry/index, createGenericNode, utils, actions, format-flow, store, findNearestParentAction, useElements, get-state-keys, wss |
| `FieldWidget` | `fieldWidgetRegistry.tsx` | **5 ta fayl** | GenericNodeRenderer (asosiy), shared-message-fields, modal-field-widgets, ModalNodeFormRenderer |
| `ModalFieldWidget` | `modal-field-widgets.tsx` | **2 ta fayl** (7 marta JSX) | modal-field-widgets.tsx (4 ta re-export yoki chaqiruv), ModalNodeFormRenderer.tsx (3 marta) |
| `renderHandleFromManifest` | `handlePresetRegistry.tsx` | **2 ta fayl, 4 marta JSX** | GenericNodeRenderer (4 call: cardHandles, headerHandles, AccessoryNodeCard handles) |
| `PillHandle` | `ReactFlowHandles/PillHandle.tsx` | **9 ta fayl** | SourceHandles, TargetHandles, EditMessageSource, ElseMessageSource, DeleteMessageSource, SelectedMessageTarget, HandlersList, handlePresetRegistry, FloatingEdge |
| `GenericNodeRenderer` | `nodes/generic/GenericNodeRenderer.tsx` | **2 ta fayl** | createGenericNodeComponent (runtime), o'zi |
| `NodeHeader` | `nodes/actions/shared/NodeHeader.tsx` | **2 ta fayl** | GenericNodeRenderer (1 marta), o'zi |
| `resolveNodeIcon` | `registry/iconRegistry.tsx` | **2 ta fayl** | GenericNodeRenderer, useElements |
| `NODE_COLOR_CLASS_REGISTRY` | `registry/colorRegistry.ts` | **2 ta fayl** | GenericNodeRenderer, NodeEditPanel/index |
| `SIDEBAR_COLOR_CLASS_REGISTRY` | `registry/colorRegistry.ts` | **2 ta fayl** | NodeEditPanel/index, useElements |
| `createGenericNodeComponent` | `nodes/generic/createGenericNodeComponent.tsx` | **2 ta fayl** | registry/index (barcha node'lar uchun), o'zi |
| `CredentialSelectField` | `generic-fields/CredentialSelectField.tsx` | **3 ta fayl** | modal-field-widgets, fieldWidgetRegistry, widgetRegistry (HTTPRequestWidget ichida) |
| `ConditionListField` | `generic-fields/ConditionListField.tsx` | **2 ta fayl** | modal-field-widgets, fieldWidgetRegistry |
| `NestedRowsField` | `generic-fields/NestedRowsField.tsx` | **2 ta fayl** | modal-field-widgets (asosiy chaqiruv), widget'lar |

### Eng ko'p ishlatilganlar (Top 5)

1. **`useFlowStore`** — 39 ta fayl — butun tizimning asosiy state'i
2. **`getNodeManifestByType` / `runtimeNodeRegistry`** — 11 ta fayl — manifest hamma joyda kerak
3. **`PillHandle`** — 9 ta fayl — barcha handle komponentlarining asosi
4. **`FieldWidget`** — 5 ta fayl — canvas maydon render
5. **`CredentialSelectField`** — 3 ta fayl — credential tanlash (panel + widgetRegistry)

### Eng kam ishlatilganlar

- **`AccessoryNodeCard`** — faqat `GenericNodeRenderer.tsx` ichida (inline component, eksport qilinmaydi)
- **`NodeOverviewPanel`** — faqat `NodeEditPanel/index.tsx`da
- **`NodeVariablePanel`** — faqat `NodeEditPanel/index.tsx`da
- **`FloatingConnectionLine`** — faqat `constructor.tsx`da
- **`EdgeContextMenu`** — faqat `FloatingEdge.tsx`da

---

## 4. Node Kategoriyalari (Sidebar Guruhlari)

`useElements.ts` → `SIDEBAR_GROUP_META` — 8 ta guruh:

| groupId | Sidebar ID | Sarlavha | Sidebar'da node soni | Manifest category soni |
|---|---|---|---|---|
| `triggers` | `sidebar-triggers` | Triggerlar | **12** | 12 |
| `actions` | `sidebar-actions` | Amallar | **18** | 16 |
| `messageOperations` | `sidebar-messageOperations` | Xabar Operatsiyalari | **9** | 11 |
| `flowControl` | `sidebar-flowControl` | Mantiq Oqimi | **11** | 11 |
| `integrations` | `sidebar-integrations` | Integratsiyalar | **10** | 13 |
| `customLogic` | `sidebar-customLogic` | Maxsus Mantiq | **7** | 7 |
| `ai` | `sidebar-ai` | AI | **5** (1 flow + 4 provider) | 11 |
| `ai_tools` | `sidebar-ai_tools` | AI Tools | **7** | 7 |

> **Izoh:** `actions` sidebar groupi 18 ta node ko'rsatadi, chunki `EditMessageNode` va `EditOrSendMessageNode` manifest'da `messageOperations` kategoriyasida bo'lsa ham `sidebar.groupId = "actions"` deb belgilangan. `SubFlowNode` va `SubFlowExitNode` esa `sidebar.enabled = false` — sidebar'da ko'rinmaydi, faqat plugin orqali qo'shiladi.

**Plugin Guruhlari:** `useElements.ts` backend `getActiveSubFlows()` va `getPluginCategories()` API'laridan dinamik qo'shimcha guruhlar oladi — bular runtime'da manifest'ga bog'liq emas.

---

## 5. Node Turlari To'liq Ro'yxati

**Jami: 81 ta node** (`runtime-node-registry.json`dagi elementlar soni)

Shundan:
- **11 ta accessory node** (`accessory: true` — AI provider va tool'lar)
- **70 ta oddiy flow node** (Card forma)
- **2 ta sidebar'da ko'rinmaydi** (`SubFlowNode`, `SubFlowExitNode`)

### 5.1 Triggers (12 ta)

| Type | Sidebar groupId | sortOrder | Tavsif |
|---|---|---|---|
| `CommandTriggerNode` | triggers | 10 | /start, /help kabi buyruqlar |
| `MessageTriggerNode` | triggers | 20 | Foydalanuvchidan xabar kelganda |
| `CronTriggerNode` | triggers | 30 | Belgilangan vaqtda (cron) |
| `CallbackQueryTriggerNode` | triggers | 25 | Inline tugma bosilganda |
| `ReplyButtonTriggerNode` | triggers | 22 | Reply tugmasi bosilganda |
| `CallbackButtonTriggerNode` | triggers | 26 | Maxsus inline button triggeri |
| `ExternalWebhookTriggerNode` | triggers | 27 | Tashqi webhook (stripe/payme/...) |
| `CronNode` | triggers | 28 | Cron (periodik) — CronTriggerNode'ning yangi versiyasi |
| `PreCheckoutTriggerNode` | triggers | 35 | To'lov tasdiqlashdan oldin |
| `SuccessfulPaymentTriggerNode` | triggers | 36 | Muvaffaqiyatli to'lov |
| `PaymentStatusTriggerNode` | triggers | 37 | Payment Link order statusi |
| `ChatJoinRequestTriggerNode` | triggers | 38 | Guruhga qo'shilish so'rovi |

### 5.2 Actions (16 ta, manifest category)

| Type | Sidebar groupId | sortOrder |
|---|---|---|
| `SendTextMessageNode` | actions | 10 |
| `SendPhotoNode` | actions | 20 |
| `SendVideoNode` | actions | 30 |
| `SendAudioNode` | actions | 40 |
| `SendFileNode` | actions | 50 |
| `SendAnimationNode` | actions | 60 |
| `SendVoiceNode` | actions | 70 |
| `SendVideoNoteNode` | actions | 80 |
| `SendLocationNode` | actions | 90 |
| `SendContactNode` | actions | 100 |
| `SendPollNode` | actions | 110 |
| `SendStickerNode` | actions | 120 |
| `SendMediaGroupNode` | actions | 130 |
| `SendDiceNode` | actions | 140 |
| `SendVenueNode` | actions | 91 |
| `SendInvoiceNode` | actions | 145 |

### 5.3 Message Operations (11 ta)

| Type | Sidebar groupId | sortOrder |
|---|---|---|
| `EditMessageNode` | **actions** | 150 |
| `EditOrSendMessageNode` | **actions** | 160 |
| `ForwardMessageNode` | messageOperations | 10 |
| `SendToAdminNode` | messageOperations | 20 |
| `CopyMessageNode` | messageOperations | 30 |
| `PinMessageNode` | messageOperations | 40 |
| `UnpinMessageNode` | messageOperations | 50 |
| `DeleteMessageNode` | messageOperations | 60 |
| `ChatActionNode` | messageOperations | 70 |
| `DownloadFileNode` | messageOperations | 80 |
| `UnpinAllMessagesNode` | messageOperations | 55 |

### 5.4 Flow Control (11 ta)

| Type | sidebar | Handles |
|---|---|---|
| `IfConditionNode` | flowControl | target-left, source-right (next=danger, true=success) |
| `ElseIfNode` | flowControl | target-left, source-right (next=accent, true=danger) |
| `ElseNode` | flowControl | target-left, source-right (true=accent) |
| `DelayNode` | flowControl | target-default, source-default |
| `RandomNode` | flowControl | target + handlersList footer |
| `VariableNode` | flowControl | target + source (set/increment/...) |
| `CheckMembershipNode` | flowControl | target + source (is-member=success, not-member=danger) |
| `FormNode` | flowControl | target + source |
| `ForLoopNode` | flowControl | target + source (loop-body=success, no-items=warning) |
| `ForLoopContinueNode` | flowControl | faqat target |
| `SchedulerNode` | flowControl | target + source |

### 5.5 Custom Logic (7 ta)

| Type | sidebar | Asosiy maydon turi |
|---|---|---|
| `CustomCodeNode` | customLogic | `code-editor` + `dynamic-outputs-sources` |
| `StateNode` | customLogic | `state-type-select` |
| `CollectionNode` | customLogic | `collection-select` (withFieldMapping) |
| `LoadCollectionItemNode` | customLogic | `collection-select` (withFilters) + found/not_found handles |
| `LoadCollectionListNode` | customLogic | `collection-select` + filter/sort/limit |
| `UpdateCollectionNode` | customLogic | `collection-select` + textarea filter/update |
| `DeleteCollectionNode` | customLogic | `collection-select` + textarea filter |

### 5.6 Integrations (13 ta)

| Type | sidebar | Ko'rinishi |
|---|---|---|
| `SubFlowNode` | **disabled** | `subflow-dynamic-sources` handle, `dynamic-params` |
| `SubFlowExitNode` | **disabled** | faqat target |
| `HTTPRequestNode` | integrations | Method/URL/headers/body |
| `CallbackQueryAnswerNode` | integrations | handlersList footer |
| `AIAgentNode` | **ai** | accessoryPorts (ai_model + ai_tool) |
| `DownloadNode` | integrations | fileId + saveAs |
| `AnswerInlineQueryNode` | integrations | results textarea |
| `PaymentNode` | integrations | paid/failed source handles |
| `ApproveChatJoinRequestNode` | integrations | chatId/userId (optional) |
| `DeclineChatJoinRequestNode` | integrations | chatId/userId (optional) |
| `CreateInviteLinkNode` | integrations | resultVar (is_state=true) |
| `GoogleSheetsNode` | integrations | credential + dynamic_select + dynamic_inputs + condition-list |
| `GoogleDriveNode` | integrations | credential + dynamic_select |

### 5.7 AI (11 ta — 1 flow + 10 accessory)

**Flow node:**

| Type | Rol | sidebar |
|---|---|---|
| `AIAgentNode` | LLM agent loop, tool-calling | ai |

**Accessory — Provider (ai_model port):**

| Type | Provider | colorToken |
|---|---|---|
| `AIOpenAIProviderNode` | OpenAI (GPT-4o...) | ai-indigo |
| `AIOllamaProviderNode` | Local Ollama | ai-teal |
| `AIGeminiProviderNode` | Google Gemini | ai-sky |
| `AIAnthropicProviderNode` | Anthropic Claude | ai-rose |

**Accessory — Tool (ai_tool port):**

| Type | Funksiya | sidebar groupId |
|---|---|---|
| `AIHTTPToolNode` | HTTP so'rov | ai_tools |
| `AICollectionToolNode` | Collection CRUD | ai_tools |
| `AICustomCodeToolNode` | JavaScript kodi | ai_tools |
| `AIKnowledgeToolNode` | RAG / vector search | ai_tools |
| `AIDateTimeToolNode` | Joriy sana/vaqt | ai_tools |
| `AIGoogleSheetsToolNode` | Google Sheets o'qish/yozish | ai_tools |
| `AIPaymentLinkToolNode` | To'lov havolasi | ai_tools |

---

## 6. Handle Preset'lar va Edge Ranglari

### Handle styleVariant → Edge rang

| styleVariant | CSS rang | Semantika |
|---|---|---|
| `default` / `neutral` | gray | Oddiy o'tish |
| `success` | yashil | Muvaffaqiyatli yo'l (is-member, found, loop-body) |
| `warning` | sariq | Ogoh (no-items) |
| `danger` | qizil | Xato yoki "yo'q" yo'li (not-member, not_found, false) |
| `accent` | ko'k/purple | Shartli yo'l (next, else, true) |

### Maxsus Handle Presetlar

- **`edit-message-source`** — `EditMessageSource.tsx`: `EditMessageNode`dan chiquvchi maxsus ulanish
- **`delete-message-source`** — `DeleteMessageSource.tsx`: `DeleteMessageNode`dan chiquvchi
- **`selected-message-target`** — `SelectedMessageTarget.tsx`: tahrirlash/o'chirish uchun target
- **`accessory-ports`** — `AIAgentNode` pastki portlari (model + tool), ACC_PORT_LEFT_POSITIONS bilan joylashadi

---

## 7. Zustand Store Arxitekturasi

**Ildiz:** `src/features/bot-constructor/store/index.ts`

```
useFlowStore
 ├── flowSlice      — nodes[], edges[], updateNodeData(), viewport
 ├── clipboardSlice — copy/paste buffer
 ├── historySlice   — undo/redo stacks, isDirty flag
 └── actions        — addNode(), deleteNode(), save(), load()
```

**isDirty** — har qanday flowSlice mutatsiyasida `true` bo'ladi. `save()` → `false`.

**addNode(type, position):**
1. `getNodeManifestByType(type)` → manifest oladi
2. `manifest.defaults` → boshlang'ich data
3. Yangi node Zustand `nodes` massiviga qo'shiladi
4. `isDirty = true`

---

## 8. Xulosa — Asosiy Raqamlar

| Ko'rsatkich | Qiymat |
|---|---|
| Jami node turlari | **81** |
| Accessory (AI) node'lar | **11** |
| Sidebar'da disabled | **2** (SubFlowNode, SubFlowExitNode) |
| Sidebar guruhlari | **8** |
| Manifest field turlari | **26** (NodeFieldManifest.type) |
| Handle preset turlari | **11** |
| Generic-fields widget'lar | **13** |
| widgetRegistry maxsus widget'lar | **~19** |
| useFlowStore ishlatgan fayllar | **39** |
| Node kategoriyalari | **7** (triggers/actions/messageOperations/flowControl/customLogic/integrations/ai) |
