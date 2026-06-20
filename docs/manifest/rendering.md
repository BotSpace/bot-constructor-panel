# Rendering — Canvas va Edit Panel

---

## Canvas rendering: GenericNodeRenderer

`src/features/bot-constructor/canvas/GenericNodeRenderer.tsx`

### Umumiy oqim

1. `createGenericNodeComponent(type)` → `getNodeManifestByType(type)` → manifest topiladi.
2. `GenericNodeRenderer` props'ga `manifest` oladi.
3. `manifest.accessory === true` → `AccessoryNodeCard` render qilinadi.
4. Aks holda — oddiy `Card` asosidagi render.

### Ikki xil node ko'rinishi

#### 1. AccessoryNodeCard (doira shakl)

`manifest.accessory === true` bo'lgan node'lar (AI provider, AI tool):

```
[transparent wrapper: ACCESSORY_W x ACCESSORY_H]
  ├── manifest.handles → renderHandleFromManifest (source-top)
  ├── .acc-node-circle (76x76px doira)
  │     └── resolveNodeIcon(manifest.iconName)
  └── .label-area
        ├── title (2 qator)
        └── badge ("tool" yoki "provider")
```

- `CIRCLE_SIZE = 76px`, `ACCESSORY_W = 100px`, `ACCESSORY_H = 140px`
- Debug holat: `data-debug-status` attr → CSS orqali status ring chiziladi (`globals.css`)
- Tanlangan holat: `data-accessory-selected` attr → CSS ring

#### 2. Oddiy Card node

```
<Card style={sizeStyle}>
  ├── cardHandles → renderHandleFromManifest (target-default va boshqalar)
  ├── <NodeHeader>
  │     ├── icon (resolveNodeIcon)
  │     ├── title (resolveTitle)
  │     ├── isCollapsed toggle
  │     ├── color (NODE_COLOR_CLASS_REGISTRY[colorToken])
  │     └── handleSlot (handlersList bo'lsa source-default bu yerda)
  ├── (isCollapsed === false bo'lsa:)
  │   ├── <CardContent>
  │   │     └── manifest.content.filter(isFieldVisible).map(FieldWidget)
  │   └── <CardFooter> (actionPanel footer bo'lsa)
  │         └── <ActionPanel>
  └── manifest.footer.handlersList → <HandlersList>
```

### Sarlavha (title) hal qilinishi

`resolveTitle(manifest, data, translatedTitle)` funksiyasi:

1. `data.node_label` — foydalanuvchi yozgan custom label → **eng yuqori ustunlik**.
2. `manifest.titleTemplate` mavjud bo'lsa — `{{key}}` placeholder'larni data qiymatlariga almashtiradi. Misol: `"HTTP: {{method}}"` + `data.method = "POST"` → `"HTTP: POST"`.
3. Aks holda — `translatedTitle` (i18n yoki fallback).

### Tarjima (i18n) hal qilinishi

```typescript
function resolveTranslation(t, key, fallback) {
  return typeof t.has === "function" && t.has(key) ? t(key) : fallback;
}
```

`t.has(key)` qaytarsa `true` — i18n tarjimasi, aks holda `fallback`. Bu qo'lda yozilgan fallback'lar doim ishlashini kafolatlaydi.

### handlersList footer uchun maxsus handle logika

`handlersList` footer bo'lgan node'larda (`SendTextMessageNode` kabi) karta balandligi dinamik o'sadi. Standart `source-default` handle `top: 50%` hisoblansa, katta kartada noto'g'ri joyga tushadi. Shuning uchun:

```typescript
const hasHandlersList = manifest.footer?.some(f => f.type === "handlersList") ?? false;
const headerHandles = hasHandlersList
  ? manifest.handles?.filter(h => h.preset === "source-default") ?? []
  : [];
const cardHandles = hasHandlersList
  ? manifest.handles?.filter(h => h.preset !== "source-default") ?? []
  : manifest.handles ?? [];
```

`source-default` handle NodeHeader'dagi `handleSlot` prop'iga ko'chiriladi — u header balandligiga nisbatan to'g'ri joylashadi.

### Trigger node vizual farqi

```typescript
const isTrigger = manifest.category === "triggers";
<Card className={cn(
  isTrigger && "rounded-tl-[2.5rem] rounded-bl-[2.5rem] rounded-tr-xl rounded-br-xl",
)}>
```

Trigger node'lar chap tomoni kuchliroq yaxlitlangan — ularni vizual ajratib ko'rsatish uchun.

### isCollapsed holati

`useNodeCollapsed()` hooki yordamida. Yig'ilganda `CardContent` va `CardFooter (actionPanel)` ko'rsatilmaydi. `HandlersList` doim ko'rinadi (handle tugmalar har doim mavjud bo'lishi kerak).

### Debug holati

`useDebugStatusStore(s => s.statuses[id])` — node bajarilishi vaqtida status o'rnatiladi: `"running"`, `"success"`, `"error"` va h.k. `data-debug-status` attr orqali CSS'da status ko'rsatiladi.

---

## createGenericNodeComponent

`src/features/bot-constructor/canvas/createGenericNodeComponent.tsx`

```typescript
export function createGenericNodeComponent(type: string) {
  const Component = (props: NodeProps) => {
    const manifest = getNodeManifestByType(type);
    if (!manifest) return null;
    return <GenericNodeRenderer {...props} manifest={manifest} />;
  };
  Component.displayName = `${type}GenericNode`;
  return memo(Component);
}
```

Har bir node type uchun bitta `memo` komponent yaratiladi. React DevTools'da `displayName` `"SendTextMessageNodeGenericNode"` ko'rinadi.

`manifest`'ni runtime'da `getNodeManifestByType(type)` orqali O(1) izlaydi — `Map` tufayli tezkor.

---

## Edit panel rendering: ModalNodeFormRenderer

`src/features/bot-constructor/panels/NodeEditPanel/ModalNodeFormRenderer.tsx`

### Umumiy oqim

```
ModalNodeFormRenderer ({ nodeId, data, manifest })
  │
  ├── activeOptionalFields (node data'dan o'qiladi)
  │     └── storedActive === null → deriveActiveOptionalKeys() → persist
  │
  ├── Field'larni ajratish:
  │     ├── requiredFields     — optional'siz field'lar
  │     ├── autoRevealedFields — optional + visibleWhen (avtomatik)
  │     └── manuallyAddedFields — activeOptionalKeys bo'yicha
  │
  ├── shownFields = requiredFields + addedOptionalFields
  │
  ├── availableOptionalFields → AddOptionButton (dropdown)
  │
  └── shownFields.map(ModalFieldWidget)
        └── Optional field → animate-in + Trash2 button
```

### activeOptionalFields mexanizmi

Optional field'lar `data.activeOptionalFields: string[]` da saqlanadi. Bu node data'si ichida saqlanadi — panel yopilsa ham yo'qolmaydi.

**Backward compatibility**: Eski node'larda `activeOptionalFields` yo'q. Bunday holda `deriveActiveOptionalKeys()` qiymat-asosidagi heuristic bilan mavjud qiymatlarga qarab boshlang'ich ro'yxat yaratadi va bir marta persist qiladi.

### Field ajratish qoidalari

```typescript
const requiredFields   = allFields.filter(f => !f.optional);
const autoRevealedFields = allFields.filter(f => f.optional && f.visibleWhen);
const manuallyAddedFields = activeOptionalKeys
  .map(key => allFields.find(f => fieldKey(f) === key && !f.visibleWhen))
  .filter(Boolean);
```

- `required` field'lar har doim ko'rinadi.
- `optional && visibleWhen` field'lar shart bajarilganda avtomatik ochiladi — foydalanuvchi qo'l bilan qo'shishi shart emas va olib tashlash tugmasi ko'rsatilmaydi.
- `optional && !visibleWhen` field'lar — foydalanuvchi `+ Qo'shimcha maydon` orqali qo'shadi.

### Optional field olib tashlash

```typescript
function handleRemoveOptional(field) {
  const next = activeOptionalKeys.filter(k => k !== fieldKey(field));
  updateNodeData(nodeId, {
    activeOptionalFields: next,
    ...clearedFieldData(field),
  });
}
```

`clearedFieldData()` field turiga qarab `data`'ni tozalaydi:
- `keyboard_kind` olinsa → `rows: []` ham tozalanadi (keyboard inconsistency'ni oldini oladi)
- `action-keyboard` → `rows: [], keyboard_kind: "inline"`
- `action-recipients` → `recipients: { sendToSender: true, additionalIds: [] }`
- Boshqalar → `field.key: undefined`

### AddOptionButton

Hali qo'shilmagan optional field'larni dropdown'da ko'rsatadi. `availableOptionalFields` bo'sh bo'lsa ko'rsatilmaydi.

### Footer rendering

`manifest.footer?.some(f => f.type === "actionPanel")` → `ModalActionPanel` render qilinadi.

### NodePanelProvider

```typescript
<NodePanelProvider>
  {/* barcha content */}
</NodePanelProvider>
```

`useIsInNodePanel()` hooki panel kontekstida `true` qaytaradi — `handlePresetRegistry` bunga qarab handle'larni yashiradi (panelda handle'lar ko'rsatilmaydi).

---

## modal-field-widgets.tsx — ModalFieldWidget

`ModalFieldWidget` komponenti `field.type` bo'yicha mos widget komponentini tanlaydi.

### FieldShell wrapper

```typescript
<FieldShell label={field.label} helpText={field.helpText} compact={compact}>
  {/* widget content */}
</FieldShell>
```

`compact = true` bo'lsa — label va widget yonma-yon joylashadi (switch/checkbox uchun).

### Dispatch qoidasi (field.type → widget)

| field.type | ModalFieldWidget widget |
|---|---|
| `description` | `<p>` |
| `richTextMessage` | `RichTextMessageField` |
| `mediaMessage` | `MediaMessageField` |
| `array-editor` | `ArrayEditorField` |
| `code-editor` | `CodeEditorField` |
| `tool-params` | `ToolParamsField` |
| `collection-select` | `CollectionSelectField` |
| `state-type-select` | `StateTypeSelectField` |
| `condition-list` | `ConditionListField` |
| `cron-editor` | `CronEditorField` |
| `trigger-config` | `TriggerConfigField` |
| `dynamic-params` | `DynamicParamsField` |
| `credential` | `CredentialSelectField` |
| `dynamic_select` | `DynamicSelectField` |
| `dynamic_inputs` | `DynamicInputsField` |
| `nested-rows` | `NestedRowsField` |
| `action-recipients` | `RecipientsManager` |
| `action-keyboard` | `InlineKeyboardEditor` |
| `widget` | `renderCustomWidget()` |
| `stateConfig` | `StateConfigField` |
| `stringArray` | `StringArrayField` |
| `select` | Shadcn `<Select>` yoki segmented tabs |
| `checkbox` | Shadcn `<Checkbox>` |
| `switch` | Shadcn `<Switch>` |
| `textarea` | Shadcn `<Textarea>` |
| `text` | `<Input type="text">` |
| `number` | `<Input type="number">` |
