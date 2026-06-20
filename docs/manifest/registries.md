# Registrylar — Reference

---

## manifestStore.ts

**Maqsad**: `runtime-node-registry.json` ni yuklaydi va `Map` ga tushiradi. Type bo'yicha manifest tezkor izlash imkonini beradi.

```typescript
import registryJson from "./runtime-node-registry.json";
const runtimeNodeRegistry = registryJson as NodeManifest[];

const nodeManifestMap = new Map(
  runtimeNodeRegistry.map((entry) => [entry.type, entry])
);

export function getNodeManifestByType(type: string): NodeManifest | undefined
```

**Eksport**:
- `runtimeNodeRegistry` — barcha manifest'larning massivi
- `getNodeManifestByType(type)` — O(1) qidirish

---

## index.ts

**Maqsad**: `genericNodeTypes` map'ini yaratadi. React Flow'ga node type'larni ro'yxatdan o'tkazadi. Development'da validatsiya qiladi.

### genericNodeTypes

```typescript
export const genericNodeTypes = runtimeNodeRegistry
  .filter((entry) => entry.status === "runtime")
  .reduce((acc, entry) => {
    acc[entry.type] = createGenericNodeComponent(entry.type);
    return acc;
  }, {});
```

Natija: `{ "SendTextMessageNode": MemoComponent, "AIAgentNode": MemoComponent, ... }` — React Flow'ning `nodeTypes` prop'iga uzatiladi.

### validateNodeRegistryCoverage

Development mode'da (`NODE_ENV !== "production"`) avtomatik ishga tushadi:

- Har bir `status: "runtime"` node uchun `genericNodeTypes`'da komponent borligini tekshiradi.
- `sidebar.enabled = true` bo'lgan har bir node uchun manifest yozuvining mavjudligini tekshiradi.
- Ikkala tekshiruv ham muvaffaqiyatsiz bo'lsa `Error` throw qiladi — bu development'da darhol xatolikni ko'rsatadi.

**Qachon ishlaydi**: `next dev` start bo'lganda import chain bo'ylab module yuklanishi vaqtida.

### runtimeNodeComponents

```typescript
export const runtimeNodeComponents: Record<string, unknown> = {
  ...genericNodeTypes,
};
```

Kelajakda custom komponentlarni qo'shish uchun kengaytiriladigan export.

---

## fieldWidgetRegistry.tsx

**Maqsad**: Canvas node karta ichida field'larni render qilish. Edit panelga nisbatan **soddalashtirilgan** version — faqat canvas'da ko'rinadigan field type'larni qo'llab-quvvatlaydi.

### FieldWidget komponenti

```typescript
export const FieldWidget = memo(DefaultFieldWidget);
```

`DefaultFieldWidget` quyidagi field type'larni render qiladi (canvas uchun):

| Field type | Canvas widget |
|---|---|
| `description` | `<div>textFallback</div>` |
| `widget` | `renderCustomWidget()` |
| `richTextMessage` | `RichTextMessageField` |
| `mediaMessage` | `MediaMessageField` |
| `stateConfig` | `StateConfigField` (faqat `commandTrigger` variant) |
| `stringArray` | `StringArrayField` |
| `select` | Shadcn `<Select>` |
| `checkbox` | Shadcn `<Checkbox>` |
| `switch` | Shadcn `<Switch>` |
| `textarea` | Shadcn `<Textarea>` |
| `text` / `number` | Shadcn `<Input>` |
| PANEL_ONLY turlar | `null` (ko'rinmaydi) |

### PANEL_ONLY_FIELD_TYPES

```typescript
const PANEL_ONLY_FIELD_TYPES = new Set([
  "nested-rows", "action-keyboard", "action-recipients",
  "code-editor", "collection-select", "condition-list",
  "cron-editor", "trigger-config", "dynamic-params",
  "array-editor", "state-type-select", "collection-binding",
  "credential", "dynamic_select", "dynamic_inputs",
]);
```

Bu to'plamdagi type'lar canvas'da `null` qaytaradi — ular faqat edit panelida to'liq render qilinadi.

### isFieldVisible yordamchi funksiyasi

```typescript
export function isFieldVisible(data, field): boolean
```

`visibleWhen` qoidasini baholaydi: `equals`, `notEquals` qo'llab-quvvatlanadi (canvas'da). Faqat `nodeManifest.visibleWhen` mavjud bo'lganda baholaydi, aks holda `true` qaytaradi.

> Eslatma: `oneOf` sharti faqat `ModalNodeFormRenderer` da ishlaydi — canvas'dagi `isFieldVisible` ko'rsatilmaydi.

### getContentClassName yordamchi funksiyasi

```typescript
export function getContentClassName(fieldType): string
```

Birinchi content field turiga qarab `CardContent` ga Tailwind class qo'shadi:
- `"description"` → `"pt-0"` (yuqori padding yo'q)
- `"richTextMessage"` yoki `"mediaMessage"` → `"grid gap-3"`
- `"checkbox"` → `"grid gap-3 pt-1"`
- Qolganlari → `"grid gap-3"`

### Kengaytirish

Canvas'da yangi field type qo'shish kerak bo'lsa:
1. `PANEL_ONLY_FIELD_TYPES` dan olib tashlash (agar canvas'da ham kerak bo'lsa).
2. `DefaultFieldWidget` ichiga yangi `if (field.type === "...")` blok qo'shish.

---

## handlePresetRegistry.tsx

**Maqsad**: `NodeHandleManifest` → React node (Handle komponentlari). `GenericNodeRenderer`'da `manifest.handles` ni render qilishda ishlatiladi.

### renderHandleFromManifest funksiyasi

```typescript
export function renderHandleFromManifest(
  handle: NodeHandleManifest,
  nodeId: string,
  key: string,
  accessoryPorts?: NodeAccessoryPortManifest[]
): ReactNode
```

`GenericNodeRenderer`'dan chaqiriladi:
```typescript
manifest.handles?.map((handle, index) =>
  renderHandleFromManifest(handle, id, `${manifest.type}-${index}`, manifest.accessoryPorts)
)
```

### GenericHandleRenderer

Node panel ichida (`useIsInNodePanel()` true bo'lsa) — hech narsa render qilmaydi. Faqat canvas'da handle'lar ko'rsatiladi.

### PillHandle

Barcha oddiy handle'lar `PillHandle` orqali render qilinadi:
```typescript
<PillHandle
  id={handle.id ?? `${handle.kind}-${handle.side}`}
  type={handle.kind}
  position={HANDLE_SIDE_TO_POSITION[handle.side]}
  tone={HANDLE_VARIANT_TONE[handle.styleVariant || "default"]}
  isConnectableStart={handle.kind !== "target"}
  showPlus={handle.kind === "source"}
  className={handle.offsetClass}
/>
```

### Kengaytirish

Yangi preset qo'shish:
1. `types.ts`'da `NodeHandleManifest.preset` union'ga yangi string qo'shing.
2. `handlePresetRegistry.tsx`'da `GenericHandleRenderer` ichiga yangi `if (handle.preset === "...")` blok qo'shing.

---

## iconRegistry.tsx

**Maqsad**: `iconName` string → `ReactNode` (Lucide ikona) yoki emoji string.

### resolveNodeIcon funksiyasi

```typescript
export function resolveNodeIcon(iconName: string): ReactNode | string
```

1. Avval `EMOJI_ICONS` da qidiradi → emoji string qaytaradi.
2. Keyin `LUCIDE_ICONS` da qidiradi → `<LucideIcon />` ReactNode qaytaradi.
3. Topilmasa — fallback: `<Sparkles />`.

### EMOJI_ICONS

```typescript
const EMOJI_ICONS: Record<string, string> = {
  sticker: "🎭",
  dice: "🎲",
  poll: "📊",
};
```

### LUCIDE_ICONS (asosiy kalit'lar)

| iconName | Lucide komponenti | Node'lar |
|---|---|---|
| `keyboard` | `Zap` | CommandTriggerNode |
| `clock` | `CalendarClock` | CronTriggerNode |
| `message` | `MessageCircle` | MessageTriggerNode, SendTextMessageNode |
| `mouse-pointer` | `MousePointerClick` | CallbackQueryTriggerNode |
| `globe` | `Globe` | ExternalWebhookTriggerNode |
| `arrow-right` | `Send` | SendTextMessageNode |
| `photo` | `Image` | SendPhotoNode |
| `video` | `Video` | SendVideoNode |
| `split` | `SplitSquareHorizontal` | IfConditionNode |
| `brain-circuit` | `BrainCircuit` | AIAgentNode |
| `settings-2` | `Sparkles` | AI Provider node'lar |
| `wrench` | `Wrench` | AI Tool node'lar |
| `code` | `Code2` | CustomCodeNode |
| `http` | `Webhook` | HTTPRequestNode |
| `key` | `KeyRound` | Credential node'lar |
| `database` | `Database` | StateNode |
| `collection` | `LayoutList` | CollectionNode |
| `table` | `Table2` | GoogleSheetsNode |
| `folder` | `FolderOpen` | GoogleDriveNode |

**Eslatma**: barcha ikonalar `className="text-primary"` bilan render qilinadi — bu theme'ga mos rang beradi.

### Kengaytirish

Yangi icon qo'shish:
1. Lucide'dan import qiling (agar mavjud bo'lsa).
2. `LUCIDE_ICONS` ob'ektiga `"yangi-kalit": <YangiIkona className="text-primary" strokeWidth={2} />` qo'shing.
3. Registry JSON'da `"iconName": "yangi-kalit"` yozing.

---

## colorRegistry.ts

**Maqsad**: `colorToken` → Tailwind CSS class. Ikki xil kontekst uchun alohida registry.

### NODE_COLOR_CLASS_REGISTRY

Node header'idagi rang strip uchun to'liq rang (opacity yo'q):

```typescript
export const NODE_COLOR_CLASS_REGISTRY: Record<string, string> = {
  "trigger-blue": "bg-blue-500",
  "action-amber": "bg-slate-500",
  "ai-violet": "bg-violet-600",
  // ...
};
```

`GenericNodeRenderer`'da ishlatiladi:
```typescript
const colorClass = NODE_COLOR_CLASS_REGISTRY[manifest.colorToken] || "bg-zinc-600";
```

### SIDEBAR_COLOR_CLASS_REGISTRY

Sidebar element badge'lari uchun — opacity 10% background, to'q rang text va border:

```typescript
export const SIDEBAR_COLOR_CLASS_REGISTRY: Record<string, string> = {
  "trigger-blue": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "ai-violet": "bg-violet-500/10 text-violet-400 border-violet-500/20",
  // ...
};
```

### Mavjud color token'lar

| Token | Node header rangi | Kategoriya |
|---|---|---|
| `trigger-blue` | `bg-blue-500` | Trigger node'lar |
| `action-amber` | `bg-slate-500` | Action node'lar (xabar) |
| `action-purple` | `bg-purple-400` | Rasm/video node'lar |
| `action-red` | `bg-red-500` | Video node'lar |
| `action-pink` | `bg-pink-500` | Audio node'lar |
| `action-gray` | `bg-gray-500` | File/animation node'lar |
| `message-op-slate` | `bg-slate-600` | Xabar operatsiyalari |
| `message-op-teal` | `bg-teal-500` | Teal xabar op'lar |
| `message-op-indigo` | `bg-indigo-500` | Indigo xabar op'lar |
| `custom-yellow` | `bg-yellow-500` | Custom logic node'lar |
| `flow-violet` | `bg-violet-500` | Flow control (If/ElseIf) |
| `flow-indigo` | `bg-indigo-500` | Flow control |
| `flow-purple` | `bg-purple-600` | Else node |
| `flow-green` | `bg-green-500` | Loop/Form node'lar |
| `integration-indigo` | `bg-indigo-600` | Integratsiya node'lar |
| `integration-green` | `bg-green-500` | HTTP/Google node'lar |
| `ai-violet` | `bg-violet-600` | AIAgentNode |
| `ai-indigo` | `bg-indigo-500` | AI provider node'lar |
| `ai-sky` | `bg-sky-500` | AI tool node'lar |
| `ai-teal` | `bg-teal-500` | AI tool node'lar |
| `ai-emerald` | `bg-emerald-500` | AI tool node'lar |

### Kengaytirish

Yangi rang qo'shish:
1. `colorRegistry.ts`'da `NODE_COLOR_CLASS_REGISTRY` va `SIDEBAR_COLOR_CLASS_REGISTRY` ga yangi kalit qo'shing (ikkisida ham).
2. Registry JSON'da `"colorToken": "yangi-token"` yozing.
