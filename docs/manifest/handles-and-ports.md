# Handle'lar va Accessory Port'lar

---

## Handle preset'lari

`NodeHandleManifest.preset` maydoni orqali oldindan belgilangan handle turlari ishlatiladi. Preset ko'rsatilganda `kind`, `side`, `id` maydonlarini yozish shart emas.

`handlePresetRegistry.tsx` — bu preset'larni React komponetlariga aylantiradi.

| Preset | Tavsif | Qo'llaniladigan joy |
|---|---|---|
| `target-default` | Standart kirish handle'i. `<TargetHandles />` komponenti. | Deyarli barcha node'larda — kirish oqimi. |
| `source-default` | Standart chiqish handle'i. `<SourceHandles nodeId={...} />`. | Deyarli barcha node'larda — chiqish oqimi. |
| `source-bottom` | Pastda joylashgan chiqish handle'i. `<SourceHandles position={Position.Bottom} />`. | Maxsus yo'nalishlarda. |
| `source-top` | Tepada joylashgan chiqish handle'i. Accessory node'larda (masalan AI provider) parent'ga ulanish uchun. | `AIOpenAIProviderNode` va boshqa accessory node'lar. |
| `else-source` | "Else" (aks holda) oqimi uchun maxsus handle. `<ElseMessageSource />`. | ElseNode. |
| `selected-message-target` | Tanlangan xabar uchun kirish. `<SelectedMessageTarget />`. | EditMessageNode, DeleteMessageNode. |
| `edit-message-source` | Tahrirlangan xabar chiqishi. `<EditMessageSource />`. | EditMessageNode. |
| `delete-message-source` | O'chirilgan xabar chiqishi. `<DeleteMessageSource />`. | DeleteMessageNode. |
| `subflow-dynamic-sources` | SubFlow dinamik chiqish handle'lari. `<DynamicOutputsSources />`. | SubFlowNode. |
| `dynamic-outputs-sources` | Dinamik chiqish handle'lari (`outputs` data massividan). `<DynamicOutputsSources />`. | CustomCodeNode va boshqalar. |
| `accessory-ports` | `accessoryPorts` massiviga ko'ra pastki handle'larni chizadi. `<AccessoryPortHandles />`. | AIAgentNode. |

---

## Qo'lda belgilangan handle'lar (preset'siz)

Preset o'rniga `kind`, `side`, `id`, `offsetClass`, `styleVariant` maydonlari to'g'ridan-to'g'ri yoziladi. Bu IfConditionNode kabi bir tomonda bir nechta chiqish handle'i bo'lgan node'lar uchun ishlatiladi.

**Namuna — IfConditionNode handle'lari**:
```json
"handles": [
  {
    "kind": "target",
    "side": "left",
    "id": "target-handler",
    "styleVariant": "accent"
  },
  {
    "kind": "source",
    "side": "right",
    "id": "next",
    "offsetClass": "translate-y-[-200%]",
    "styleVariant": "danger"
  },
  {
    "kind": "source",
    "side": "right",
    "id": "true",
    "offsetClass": "translate-y-[200%]",
    "styleVariant": "success"
  }
]
```

Bu yerda bir tomonda (`right`) ikkita handle bor: `next` (yuqorida) va `true` (pastda). `offsetClass` Tailwind `translate-y-*` class bilan vertikal siljitish ta'minlaydi.

**LoadCollectionItemNode namunasi** (found/not_found):
```json
"handles": [
  { "preset": "target-default" },
  { "kind": "source", "side": "right", "id": "not_found", "offsetClass": "translate-y-[-200%]", "styleVariant": "danger" },
  { "kind": "source", "side": "right", "id": "found", "offsetClass": "translate-y-[200%]", "styleVariant": "accent" }
]
```

---

## Handle style variant'lari

`styleVariant` → React Flow Handle'dagi `PillHandle` rang toni:

| styleVariant | PillHandleTone | Vizual rang |
|---|---|---|
| `default` | `neutral` | Kulrang / neytral |
| `success` | `success` | Yashil |
| `warning` | `warning` | Sariq/to'q sariq |
| `danger` | `danger` | Qizil |
| `accent` | `accent` | Ko'k/binafsha |

---

## Accessory Port tizimi

Accessory port tizimi — AI node'larini ("agent + provider + tool'lar") birlashtirishga imkon beruvchi mexanizm. n8n'dagi sub-node tushunchasiga o'xshash.

### Tushuncha

**Parent (asosiy) node** — masalan `AIAgentNode`. U `accessoryPorts` massivini e'lon qiladi.

**Accessory node** — masalan `AIOpenAIProviderNode` yoki `AIHTTPToolNode`. U `accessory: true` va `accessoryAttachesTo` ni belgilaydi.

### AIAgentNode accessoryPorts ta'rifi

```json
"accessoryPorts": [
  {
    "portType": "ai_model",
    "labelFallback": "Model",
    "accepts": [
      "AIOpenAIProviderNode",
      "AIOllamaProviderNode",
      "AIGeminiProviderNode",
      "AIAnthropicProviderNode"
    ],
    "maxConnections": 1,
    "styleVariant": "accent"
  },
  {
    "portType": "ai_tool",
    "labelFallback": "Tools",
    "accepts": [
      "AIHTTPToolNode",
      "AICollectionToolNode",
      "AICustomCodeToolNode",
      "AIKnowledgeToolNode",
      "AIDateTimeToolNode",
      "AIGoogleSheetsToolNode",
      "AIPaymentLinkToolNode"
    ],
    "styleVariant": "success"
  }
]
```

### Accessory node ta'rifi (AIOpenAIProviderNode)

```json
{
  "type": "AIOpenAIProviderNode",
  "accessory": true,
  "accessoryAttachesTo": ["ai_model"],
  "handles": [{ "preset": "source-top" }],
  ...
}
```

### Qanday bog'lanadi?

1. `AIAgentNode` canvas'da chizilganda `preset: "accessory-ports"` handle render qilinadi.
2. `AccessoryPortHandles` komponenti har bir port uchun `PillHandle` chizadi. Handle ID: `acc:ai_model`, `acc:ai_tool`.
3. `AIOpenAIProviderNode` yuqorisida `source-top` handle bor.
4. Foydalanuvchi `AIOpenAIProviderNode`'dan `AIAgentNode`'ga edge tortadi — bu edge `acc:ai_model` handle'iga ulanadi.
5. Engine'da bu edge'lar `targetHandle === "acc:ai_model"` orqali aniqlanadi va agent ushbu providerni ishlatadi.

### Canvas'dagi vizual tasvirlanishi

- Accessory node'lar (provider, tool) — **doira shaklida** chiziladi (`AccessoryNodeCard`).
- Provider node'lar — `sky` badgesi bilan.
- Tool node'lar — `emerald` badgesi bilan.
- `acc:ai_model` port bitta ulanishni qabul qiladi (`maxConnections: 1`).
- `acc:ai_tool` port cheksiz ulanishni qabul qiladi.
- Port handle'lari `AIAgentNode` kartasining **pastki** chegarasida joylashadi.

### Accessory port'lar pozitsiyalanishi

```typescript
const ACC_PORT_LEFT_POSITIONS: Record<number, string[]> = {
  1: ["50%"],
  2: ["30%", "70%"],
  3: ["20%", "50%", "80%"],
};
```

Port soni 3'dan ko'p bo'lsa, teng taqsimlash formulasi ishlatiladi: `((i + 1) / (ports.length + 1)) * 100%`.

---

## DynamicOutputsSources

`subflow-dynamic-sources` va `dynamic-outputs-sources` preset'lar uchun:

- Node'ning `data.outputs` massivini o'qiydi: `Array<{ name: string }>`.
- Har bir output uchun `output-<name>` ID'li handle chizadi.
- Outputs bo'sh bo'lsa — bitta `accent` rangli default handle chizadi.

**Namuna**: `data.outputs = [{ name: "yes" }, { name: "no" }]` → ikki chiqish handle'i: `output-yes`, `output-no`.
