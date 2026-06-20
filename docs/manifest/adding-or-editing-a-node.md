# Node qo'shish yoki o'zgartirish — Amaliy qo'llanma

---

## Asosiy qoida: Manifest > Renderer

**Field ko'rinishini yoki xatti-harakatini o'zgartirish kerak bo'lsa:**

`modal-field-widgets.tsx` yoki `GenericNodeRenderer.tsx` ga **tegmang**. Bu global fayllar — o'zgartirish boshqa barcha node'larga ta'sir qiladi va regressiya xavfi yaratadi.

O'rniga:
- `runtime-node-registry.json` da shu node'ning `content` massivida field `type` ni, `optional`, `defaultVisible`, `visibleWhen` va boshqa maydonlarni o'zgartiring.
- Yangi field type kerak bo'lsa — avval mavjud type'lar to'liq ro'yxatini `field-types.md` da ko'ring.

---

## Yangi node qo'shish — Bosqichma-bosqich

### 1-bosqich: registry JSON'ga entry yozish

`src/features/bot-constructor/manifest/runtime-node-registry.json` faylida massivning oxiriga yangi ob'ekt qo'shing.

**Minimal to'liq misol**:
```json
{
  "type": "MyNewNode",
  "status": "runtime",
  "category": "actions",
  "titleKey": "constructor.actions.myNew.name",
  "descriptionKey": "constructor.actions.myNew.description",
  "titleFallback": "Yangi amal",
  "descriptionFallback": "Yangi amal node'i.",
  "iconName": "arrow-right",
  "colorToken": "action-amber",
  "size": { "width": 200 },
  "sidebar": {
    "enabled": true,
    "groupId": "actions",
    "sortOrder": 100,
    "elementType": "my_new"
  },
  "handles": [
    { "preset": "target-default" },
    { "preset": "source-default" }
  ],
  "content": [
    {
      "type": "text",
      "key": "myField",
      "label": "Mening maydonim",
      "placeholder": "Qiymat kiriting"
    }
  ],
  "defaults": {
    "myField": ""
  }
}
```

### 2-bosqich: titleKey va descriptionKey

i18n kalitlari bo'yicha barcha til fayllariga tarjima qo'shing:

- `src/messages/uz.json`
- `src/messages/ru.json`
- `src/messages/en.json`
- `src/messages/jp.json`

```json
{
  "constructor": {
    "actions": {
      "myNew": {
        "name": "Yangi amal",
        "description": "Yangi amal node'i qiladi."
      }
    }
  }
}
```

**Muhim**: Agar tarjima qo'shilmasa, `titleFallback` / `descriptionFallback` qo'llaniladi — xato chiqmaydi, lekin localization ishlashini ta'minlash uchun tarjima qo'shing.

### 3-bosqich: iconName tanlash

`src/features/bot-constructor/manifest/iconRegistry.tsx` faylida `LUCIDE_ICONS` dan mavjud kalitni tanlang. Ro'yxat `registries.md` da.

Yangi icon kerak bo'lsa:
1. `iconRegistry.tsx` da `LUCIDE_ICONS`'ga qo'shing.
2. Registry JSON'da `"iconName": "yangi-kalit"` yozing.

### 4-bosqich: colorToken tanlash

`colorRegistry.ts` dagi mavjud token'lardan birini tanlang. Ro'yxat `registries.md` da.

Kategoriya bo'yicha tavsiya:
- Triggers → `"trigger-blue"`
- Xabar yuborish node'lari → `"action-amber"` yoki `"action-purple"`
- Flow control → `"flow-violet"` yoki `"flow-indigo"`
- Integratsiyalar → `"integration-green"` yoki `"integration-indigo"`
- AI node'lar → `"ai-violet"`, `"ai-indigo"`, `"ai-sky"` va h.k.

### 5-bosqich: Tekshirish

Dev server'ni qayta ishga tushirmang — Next.js `runtime-node-registry.json` o'zgarishini hot reload qiladi. Lekin `index.ts`'dagi `validateNodeRegistryCoverage()` modul yuklanishida ishlaydi, shuning uchun qayta yuklash kerak bo'lishi mumkin.

1. Sidebar'da yangi node paydo bo'lishini tekshiring.
2. Canvas'ga drag qiling — node chiqishini tekshiring.
3. Node'ni bosib edit panelini oching — field'lar to'g'ri ko'rinishini tekshiring.

---

## Mavjud node'ni o'zgartirish

### Field qo'shish

`content` massiviga yangi element qo'shing. Agar field ixtiyoriy bo'lsa `optional: true` qo'shing.

```json
{
  "type": "switch",
  "key": "newFeature",
  "label": "Yangi funksiya",
  "optional": true
}
```

`defaults` ga ham qo'shing:
```json
"defaults": {
  "newFeature": false
}
```

### Field ko'rinish shartini o'zgartirish

```json
{
  "type": "textarea",
  "key": "body",
  "visibleWhen": { "key": "method", "notEquals": "GET" }
}
```

### Checkbox'ni switch'ga o'zgartirish

**To'g'ri yo'l** (manifest > renderer qoidasi):
```json
// runtime-node-registry.json da:
{ "type": "switch", "key": "myKey", "label": "..." }
// Avval: { "type": "checkbox", ... }
```

`modal-field-widgets.tsx` ga tegmang — widget avtomatik `<Switch>` ga o'tadi.

### titleTemplate qo'shish

Node sarlavhasini dinamik qilish uchun:
```json
{
  "titleTemplate": "HTTP: {{method}}",
  "titleFallback": "HTTP So'rov"
}
```

`data.method = "POST"` bo'lsa canvas'da `"HTTP: POST"` ko'rinadi.

### producesState qo'shish

Node flow context'ga yangi o'zgaruvchi qo'shsa:
```json
"producesState": ["my_result", "my_success"]
```

Bu o'zgaruvchilar variable panelda ko'rinadi va keyingi node'larda `{{my_result}}` orqali ishlatiladi.

---

## Accessory node qo'shish (AI provider yoki tool)

### AI provider node namunasi

```json
{
  "type": "MyAIProviderNode",
  "status": "runtime",
  "category": "ai",
  "accessory": true,
  "accessoryAttachesTo": ["ai_model"],
  "titleKey": "constructor.ai.myprovider.name",
  "titleFallback": "My AI Provider",
  "descriptionKey": "constructor.ai.myprovider.description",
  "descriptionFallback": "My AI Provider node'i.",
  "iconName": "settings-2",
  "colorToken": "ai-indigo",
  "size": { "width": 180 },
  "sidebar": {
    "enabled": true,
    "groupId": "ai",
    "sortOrder": 50,
    "elementType": "ai_provider_my"
  },
  "handles": [
    { "preset": "source-top" }
  ],
  "content": [
    {
      "type": "credential",
      "key": "credential_id",
      "credentialType": "my_provider",
      "label": "Credential",
      "required": true
    },
    {
      "type": "text",
      "key": "model",
      "label": "Model",
      "placeholder": "my-model-v1"
    }
  ],
  "defaults": {
    "credential_id": null,
    "model": "my-model-v1"
  }
}
```

Keyin `AIAgentNode`'ning `accessoryPorts[0].accepts` ga `"MyAIProviderNode"` qo'shing:

```json
"accepts": [
  "AIOpenAIProviderNode",
  ...
  "MyAIProviderNode"
]
```

### AI tool node namunasi

```json
{
  "type": "MyToolNode",
  "accessory": true,
  "accessoryAttachesTo": ["ai_tool"],
  "handles": [{ "preset": "source-top" }],
  ...
}
```

`accessoryAttachesTo: ["ai_tool"]` → canvas'da `emerald` badgeli doira ko'rinadi.

---

## Condition handle'li node qo'shish (if/else pattern)

```json
{
  "type": "MyConditionNode",
  "handles": [
    { "kind": "target", "side": "left", "id": "target-handler", "styleVariant": "accent" },
    { "kind": "source", "side": "right", "id": "true", "offsetClass": "translate-y-[200%]", "styleVariant": "success" },
    { "kind": "source", "side": "right", "id": "false", "offsetClass": "translate-y-[-200%]", "styleVariant": "danger" }
  ],
  "content": [
    {
      "type": "condition-list",
      "operatorKey": "operator",
      "conditionsKey": "conditions"
    }
  ],
  "defaults": {
    "operator": "AND",
    "conditions": []
  }
}
```

---

## Dynamic outputs bilan node

```json
{
  "type": "MyRouterNode",
  "handles": [
    { "preset": "target-default" },
    { "preset": "dynamic-outputs-sources" }
  ],
  "content": [
    {
      "type": "array-editor",
      "key": "outputs",
      "label": "Chiqishlar",
      "itemFields": [
        { "key": "name", "type": "text", "label": "Nomi" }
      ]
    }
  ],
  "defaults": {
    "outputs": []
  }
}
```

`data.outputs = [{ name: "ha" }, { name: "yo'q" }]` bo'lganda canvas'da `output-ha` va `output-yo'q` handle'lari paydo bo'ladi.

---

## Xato holatlari va ularni tuzatish

### Validatsiya xatosi (dev mode)

```
Error: Conflicting node registry statuses: MyNewNode
```

**Sabab**: `status: "runtime"` deb e'lon qilingan, lekin `genericNodeTypes` da yo'q.
**Yechim**: Registry JSON'dagi `type` nomi to'g'ri yozilganini tekshiring. Dev server'ni qayta ishga tushiring.

### Node sidebar'da ko'rinmayapti

**Tekshiring**:
1. `"sidebar": { "enabled": true, ... }` bormi?
2. `"groupId"` `NodeSidebarGroupId` dan biri (`"triggers"`, `"actions"`, `"messageOperations"`, `"flowControl"`, `"integrations"`, `"customLogic"`, `"ai"`) ekanligini tekshiring.

### Canvas'da node chizilmayapti (bo'sh ko'rsatiladi)

**Tekshiring**:
1. `"status": "runtime"` bormi?
2. `"size": { "width": 200 }` ko'rsatilganmi?
3. `iconName` `iconRegistry.tsx` da mavjudmi?

### Optional field qiymati saqlanmayapti (olib tashlashda)

`defaults` da standart qiymat bor bo'lsa, `optionalFieldConfigured()` qiymatni "unconfigured" deb hisoblaydi. `defaultVisible: true` qo'shing yoki standart qiymatni `defaults` dan olib tashlang.
