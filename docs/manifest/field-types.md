# Field Types — To'liq Reference

`NodeFieldManifest.type` qiymatlari va ular qanday ishlashi.

---

## Ko'rinish mantiqi (visibleWhen / optional / defaultVisible)

Field'ni ko'rsatish yoki yashirish uchun uch xil mexanizm mavjud:

### 1. visibleWhen — shartli ko'rsatish

Field faqat boshqa field ma'lum bir qiymatda bo'lganda ko'rinadi. Canvas va panelda bir xil ishlaydi.

```json
{
  "type": "textarea",
  "key": "body",
  "label": "Body (JSON)",
  "visibleWhen": { "key": "method", "notEquals": "GET" }
}
```

Qo'llab-quvvatlanadigan shartlar:
- `equals` — qiymat aynan shu bo'lsa
- `notEquals` — qiymat bu bo'lmasa
- `oneOf` — massivdagi qiymatlardan biri bo'lsa (faqat `ModalNodeFormRenderer`'da ishlaydi)

### 2. optional — qo'lda qo'shiladigan field

`optional: true` — field boshlang'ichda yashirilgan. Edit panelida "Qo'shimcha maydon qo'shish" tugmasi orqali foydalanuvchi qo'l bilan qo'shadi. Qo'shilgandan so'ng `data.activeOptionalFields` massivida saqlanadi.

`visibleWhen` va `optional` birga bo'lsa — bu "avtomatik ochiluvchi optional" bo'ladi (shart bajarilganda avtomatik ko'rinadi, qo'lda qo'shish shart emas).

### 3. defaultVisible — optional field uchun boshlang'ich holat

Faqat `optional: true` bilan birga ishlaydi:

| `defaultVisible` qiymati | Xatti-harakat |
|---|---|
| `true` | Doim ko'rinadi (qiymat bo'lmasa ham) |
| `false` | Standart bo'lmagan qiymatda ko'rinadi; aks holda "Add optional field" orqali qo'shiladi |
| `undefined` (ko'rsatilmasa) | Qiymat mavjud va standartdan farq qilsa ko'rinadi |

```json
{
  "type": "select",
  "key": "keyboard_kind",
  "label": "Klaviatura turi",
  "optional": true,
  "defaultVisible": false
}
```

---

## Field turlari

### `description`

Faqat matn ko'rsatadi. Hech qanday input yo'q. Node haqida izoh yoki yo'riqnoma uchun.

- **Canvas widget**: `DefaultFieldWidget` (matn paragraf)
- **Panel widget**: `<p>` tegi
- **Ishlatadigan maydonlar**: `textKey` (i18n), `textFallback`
- **Namuna**:
```json
{ "type": "description", "textFallback": "Bu node foydalanuvchiga matn yuboradi." }
```

---

### `widget`

Custom widget'larni chaqiradi. `fieldWidgetRegistry.tsx`'da `renderCustomWidget()` orqali topiladi. Node-specific UI uchun.

- **Canvas widget**: `renderCustomWidget({ nodeId, data, field })`
- **Panel widget**: `renderCustomWidget({ nodeId, data, field })`
- **Ishlatadigan maydonlar**: `widgetKey`

---

### `text`

Bir qatorli matn input.

- **Canvas widget**: `<Input type="text" />`
- **Panel widget**: `<Input />` + `FieldShell`
- **Ishlatadigan maydonlar**: `key`, `label`, `placeholder`, `helpText`
- **Namuna**:
```json
{ "type": "text", "key": "command", "label": "Buyruq matni", "placeholder": "/start" }
```

---

### `number`

Raqam input.

- **Canvas widget**: `<Input type="number" />`
- **Panel widget**: `<Input type="number" />`
- **Ishlatadigan maydonlar**: `key`, `label`, `placeholder`, `min`, `max`, `step`, `helpText`
- **Namuna**:
```json
{ "type": "number", "key": "timeout", "label": "Timeout (soniya)", "min": 1, "max": 300 }
```

---

### `textarea`

Ko'p qatorli matn input.

- **Canvas widget**: `<Textarea />`
- **Panel widget**: `<Textarea />`
- **Ishlatadigan maydonlar**: `key`, `label`, `placeholder`, `rows`, `helpText`
- **Namuna** (AIAgentNode'dan):
```json
{
  "type": "textarea",
  "key": "systemPrompt",
  "label": "System Prompt",
  "placeholder": "You are a helpful assistant...",
  "rows": 3
}
```

---

### `select`

Dropdown (yoki `variant: "tabs"` bo'lsa segmented control).

- **Canvas widget**: Shadcn `<Select>` yoki segmented tabs
- **Panel widget**: Shadcn `<Select>` yoki tabs
- **Ishlatadigan maydonlar**: `key`, `label`, `options`, `variant`, `helpText`
- `variant: "tabs"` — 4 va undan kam variantda ishlatish tavsiya etiladi

**Namuna (dropdown)**:
```json
{
  "type": "select",
  "key": "method",
  "label": "HTTP Metod",
  "options": [
    { "value": "GET", "label": "GET" },
    { "value": "POST", "label": "POST" }
  ]
}
```

**Namuna (tabs variant)**:
```json
{
  "type": "select",
  "key": "parseMode",
  "label": "Parse Mode",
  "variant": "tabs",
  "options": [
    { "value": "None", "label": "Yo'q" },
    { "value": "Markdown", "label": "Markdown" },
    { "value": "HTML", "label": "HTML" }
  ]
}
```

---

### `checkbox`

Belgilash katakchasi. Qiymat `boolean`.

- **Canvas widget**: `<Checkbox />`
- **Panel widget**: `<Checkbox />`
- **Ishlatadigan maydonlar**: `key`, `label`

---

### `switch`

Almashtirish tugmasi. Qiymat `boolean`. Checkbox'dan vizual farqi bor.

- **Canvas widget**: `<Switch />`
- **Panel widget**: `<Switch />`
- **Ishlatadigan maydonlar**: `key`, `label`
- **Namuna**:
```json
{ "type": "switch", "key": "withArgs", "label": "Argumentlarni ushlash" }
```

---

### `stringArray`

Dinamik ravishda qo'shiladigan string qiymatlar ro'yxati. `+` tugmasi bilan yangi qator qo'shiladi.

- **Canvas widget**: `StringArrayField` (fieldWidgetRegistry'dan)
- **Panel widget**: `StringArrayField` (modal-field-widgets'dan)
- **Ishlatadigan maydonlar**: `key`, `label`, `itemPlaceholder`, `addButtonLabel`
- Qiymat turi: `string[]`

---

### `stateConfig`

Faqat `variant: "commandTrigger"` bilan ishlatiladi. CommandTriggerNode'da foydalanuvchi state'ini sozlash uchun maxsus UI.

- **Canvas widget**: `StateConfigUI`
- **Panel widget**: `StateConfigUI`
- **Ishlatadigan maydonlar**: `variant: "commandTrigger"`

---

### `richTextMessage`

TipTap yoki Lexical rich text muharrir. `{{variable}}` template'larni qo'llab-quvvatlaydi. Bot xabari matnini yozish uchun.

- **Canvas widget**: `RichTextMessageField` (soddalashtirilgan)
- **Panel widget**: `RichTextMessageField` (to'liq muharrir)
- **Ishlatadigan maydonlar**: `key` (text kalit), `label`, `intro`
- Qo'shimcha dinamik xabarlar `dynamicMessages` kalitida saqlanadi

---

### `mediaMessage`

Rasm, video, audio yoki fayl yuklash widget'i. Fayl URL yoki yuklab olish kombinatsiyasi.

- **Canvas widget**: `MediaMessageField`
- **Panel widget**: `MediaMessageField`
- **Ishlatadigan maydonlar**: `mediaKind` — `"photo"`, `"video"`, `"audio"`, `"file"`
- **Namuna**:
```json
{ "type": "mediaMessage", "mediaKind": "photo" }
```

---

### `array-editor`

Tuzilmali ob'ektlar massivini tahrirlash uchun. Har bir element bir nechta sub-field'ga ega bo'ladi. Faqat edit panelida render qilinadi (canvas'da ko'rinmaydi).

- **Canvas widget**: ko'rinmaydi (`PANEL_ONLY_FIELD_TYPES` da)
- **Panel widget**: `ArrayEditorField`
- **Ishlatadigan maydonlar**: `key`, `itemFields`, `maxItems`, `addLabel`, `defaultItem`
- Sub-field turlari: `text`, `number`, `select`, `checkbox`, `switch`, `textarea`

---

### `code-editor`

CodeMirror 6 asosidagi kod muharrir. JavaScript yoki Python kodi yozish uchun. Faqat edit panelida.

- **Canvas widget**: ko'rinmaydi
- **Panel widget**: `CodeEditorField`
- **Ishlatadigan maydonlar**: `key`, `language`, `outputsKey`

---

### `collection-select`

Collection (MongoDB to'plam) tanlash uchun. Ixtiyoriy: field mapping va filter qo'shimchalari.

- **Canvas widget**: ko'rinmaydi
- **Panel widget**: `CollectionSelectField`
- **Ishlatadigan maydonlar**: `key`, `withFieldMapping`, `withFilters`, `contextKeyField`

**Namuna (CollectionNode'dan)**:
```json
{ "type": "collection-select", "key": "collection_name", "withFieldMapping": true }
```

**Namuna (LoadCollectionItemNode'dan)**:
```json
{ "type": "collection-select", "key": "collection", "withFilters": true, "contextKeyField": "contextKey" }
```

---

### `state-type-select`

StateNode'da foydalanuvchi state tipini tanlash uchun maxsus widget. Faqat edit panelida.

- **Canvas widget**: ko'rinmaydi
- **Panel widget**: `StateTypeSelectField`
- **Ishlatadigan maydonlar**: `keyField`, `typeField`

**Namuna (StateNode'dan)**:
```json
{ "type": "state-type-select" }
```

---

### `condition-list`

Shartlar ro'yxati muharriri. AND/OR operator bilan bir nechta shart qo'shiladi. IfConditionNode, ElseIfNode, va filtrlash uchun ishlatiladi.

- **Canvas widget**: ko'rinmaydi
- **Panel widget**: `ConditionListField`
- **Ishlatadigan maydonlar**: `operatorKey`, `conditionsKey`, `conditionFieldKey`, `conditionOpKey`, `operatorSet`, `fieldPlaceholder`

**Namuna (IfConditionNode'dan)**:
```json
{
  "type": "condition-list",
  "operatorKey": "operator",
  "conditionsKey": "conditions"
}
```

**Namuna (GoogleSheetsNode filtri)**:
```json
{
  "type": "condition-list",
  "operatorKey": "filterMatch",
  "conditionsKey": "filterConditions",
  "conditionFieldKey": "field",
  "conditionOpKey": "op",
  "operatorSet": "engine",
  "fieldPlaceholder": "Ustun nomi"
}
```

---

### `cron-editor`

Cron expression muharriri. Vaqt jadvalini qulay UI bilan sozlash imkonini beradi. Faqat edit panelida.

- **Canvas widget**: ko'rinmaydi
- **Panel widget**: `CronEditorField`
- **Ishlatadigan maydonlar**: `key`

**Namuna (CronTriggerNode'dan)**:
```json
{ "type": "cron-editor", "key": "schedule", "label": "Jadval" }
```

---

### `trigger-config`

Message, callback, yoki reply trigger'larining turi va filter sozlamasi uchun murakkab widget. Faqat edit panelida.

- **Canvas widget**: ko'rinmaydi
- **Panel widget**: `TriggerConfigField`
- **Ishlatadigan maydonlar**: `kind` (majburiy), `stateOptional`

**Namuna (MessageTriggerNode'dan)**:
```json
{ "type": "trigger-config", "kind": "message", "stateOptional": true }
```

---

### `dynamic-params`

Dinamik parametrlar (masalan tool schema asosida) uchun UI. Faqat edit panelida.

- **Canvas widget**: ko'rinmaydi
- **Panel widget**: `DynamicParamsField`
- **Ishlatadigan maydonlar**: `schemaKey`, `paramsKey`, `descriptionKey`

---

### `tool-params`

AI tool parametrlari uchun maxsus widget. AIHTTPToolNode kabi node'larda. Faqat edit panelida.

- **Canvas widget**: ko'rinmaydi
- **Panel widget**: `ToolParamsField`

---

### `action-recipients`

Xabar qabul qiluvchilarini boshqarish widget'i (kim ga yuborish: sender ga, qo'shimcha chat ID'lar). Faqat edit panelida.

- **Canvas widget**: ko'rinmaydi
- **Panel widget**: `RecipientsManager`
- Data kaliti: `recipients: { sendToSender: boolean, additionalIds: string[] }`

---

### `action-keyboard`

Inline klaviatura yaratish widget'i (eski `ActionPanel` asosidagi). Ko'pchilik yangi node'larda `nested-rows` bilan almashtirilmoqda. Faqat edit panelida.

- **Canvas widget**: ko'rinmaydi
- **Panel widget**: `InlineKeyboardEditor`

---

### `nested-rows`

Qator va ustun (tugmalar matritsasi) muharriri. `SendTextMessageNode` va `SendPhotoNode` da tugmalar yaratish uchun ishlatiladi. Faqat edit panelida.

- **Canvas widget**: ko'rinmaydi
- **Panel widget**: `NestedRowsField`
- **Ishlatadigan maydonlar**: `key`, `addRowLabel`, `addColumnLabel`, `maxColumns`, `defaultColumn`, `columnFields`

**Namuna (SendTextMessageNode'dan)**:
```json
{
  "type": "nested-rows",
  "key": "rows",
  "label": "Tugmalar",
  "addRowLabel": "Qator qo'shish",
  "addColumnLabel": "Tugma qo'shish",
  "maxColumns": 8,
  "defaultColumn": { "text": "", "type": "callback", "value": "" },
  "columnFields": [
    { "key": "text", "type": "text", "label": "Matn" },
    { "key": "type", "type": "select", "label": "Tur", "options": [...] },
    { "key": "value", "type": "text", "label": "Qiymat",
      "visibleWhen": { "key": "type", "notEquals": "request_contact" } }
  ]
}
```

---

### `collection-binding`

Collection, field mapping, filter va pagination'ni bir joyda boshqarish uchun umumiy widget. `nested-rows`'dan farqli — to'liq collection bog'lash uchun. Faqat edit panelida.

- **Canvas widget**: ko'rinmaydi
- **Panel widget**: collection binding UI

---

### `credential`

Credential (API kaliti, OAuth token) tanlash widget'i. Faqat shu turdagi credential'larni ko'rsatadi.

- **Canvas widget**: ko'rinmaydi
- **Panel widget**: `CredentialSelectField`
- **Ishlatadigan maydonlar**: `key`, `credentialType`, `required`

**Namuna (AIOpenAIProviderNode'dan)**:
```json
{
  "type": "credential",
  "key": "credential_id",
  "credentialType": "openai",
  "label": "Credential",
  "required": true
}
```

---

### `dynamic_inputs`

Backend'dan dinamik ravishda olinadigan input field'lari (masalan Google Sheets ustunlari). `dependsOn` da ko'rsatilgan boshqa field qiymatlari o'zgarganda qayta yuklanadi. Faqat edit panelida.

- **Canvas widget**: ko'rinmaydi
- **Panel widget**: `DynamicInputsField`
- **Ishlatadigan maydonlar**: `key`, `resource`, `credentialKey`, `dependsOn`

**Namuna (GoogleSheetsNode'dan)**:
```json
{
  "type": "dynamic_inputs",
  "key": "values",
  "label": "Qator qiymatlari (ustunlar bo'yicha)",
  "resource": "google_sheet_columns",
  "credentialKey": "credential_id",
  "dependsOn": ["spreadsheet_id", "sheet"],
  "visibleWhen": { "key": "operation", "oneOf": ["append", "update"] }
}
```

---

### `dynamic_select`

Backend'dan dinamik ravishda yuklanadigan select. Credential va `dependsOn` asosida options yuklanadi. Faqat edit panelida.

- **Canvas widget**: ko'rinmaydi
- **Panel widget**: `DynamicSelectField`
- **Ishlatadigan maydonlar**: `key`, `resource`, `credentialKey`, `dependsOn`, `label`

**Namuna (GoogleSheetsNode'dan)**:
```json
{
  "type": "dynamic_select",
  "key": "spreadsheet_id",
  "label": "Jadval (Spreadsheet)",
  "resource": "google_spreadsheets",
  "credentialKey": "credential_id"
}
```

```json
{
  "type": "dynamic_select",
  "key": "sheet",
  "label": "Varaq (Sheet)",
  "resource": "google_sheet_tabs",
  "credentialKey": "credential_id",
  "dependsOn": ["spreadsheet_id"]
}
```

---

## Canvas'da ko'rinmaydigan field turlari

Quyidagi type'lar faqat edit panelda render qilinadi. Canvas'da `null` qaytariladi (`PANEL_ONLY_FIELD_TYPES` to'plami):

```
nested-rows, action-keyboard, action-recipients, code-editor,
collection-select, condition-list, cron-editor, trigger-config,
dynamic-params, array-editor, state-type-select, collection-binding,
credential, dynamic_select, dynamic_inputs
```
