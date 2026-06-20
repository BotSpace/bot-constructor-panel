# NodeManifest — Schema Reference

Barcha interfeyslari `src/features/bot-constructor/manifest/types.ts` da joylashgan.

---

## NodeManifest (asosiy interfeys)

Har bir node registry'da bitta `NodeManifest` obyekti sifatida ifodalanadi.

| Maydon | Tur | Majburiy | Tavsif |
|---|---|---|---|
| `type` | `string` | Ha | Node'ning unikal identifikatori. React Flow'da `nodeType` sifatida ishlatiladi. Misol: `"SendTextMessageNode"` |
| `status` | `"runtime"` | Ha | Hozircha faqat `"runtime"` qiymati bor. Kelajakda `"beta"` qo'shilinishi mumkin. |
| `category` | `string` | Ha | Node'ning ichki kategoriyasi. Asosan `"triggers"`, `"actions"`, `"flowControl"`, `"integrations"`, `"customLogic"`, `"ai"`. Sidebar groupId bilan bir xil bo'lishi shart emas. |
| `titleKey` | `string` | Ha | i18n kaliti. `next-intl` orqali tarjimasi olinadi. Misol: `"constructor.actions.textMessage.name"` |
| `descriptionKey` | `string` | Ha | i18n kaliti — node tavsifi. |
| `titleFallback` | `string` | Ha | i18n kaliti topilmasa ishlatiladigan matn. Doim to'ldiring. |
| `descriptionFallback` | `string` | Ha | Tavsif uchun fallback matn. |
| `titleTemplate` | `string \| undefined` | Yo'q | `{{key}}` placeholder bilan dinamik sarlavha. Misol: `"HTTP: {{method}}"`. `data[key]` bo'sh bo'lsa `"default"` chiqadi. Agar node'da `data.node_label` mavjud bo'lsa, template e'tiborga olinmaydi (foydalanuvchi yozgan label ustunlik qiladi). |
| `iconName` | `string` | Ha | `iconRegistry.tsx` da ro'yxatlangan kalit. Misol: `"arrow-right"`, `"brain-circuit"`. |
| `colorToken` | `string` | Ha | `colorRegistry.ts` da ro'yxatlangan kalit. Misol: `"trigger-blue"`, `"ai-violet"`. |
| `size` | `{ width, minHeight?, height? }` | Ha | Canvas'dagi node kartasining o'lchami (px). `width` majburiy. |
| `sidebar` | `SidebarConfig \| undefined` | Yo'q | Sidebar'da ko'rsatish sozlamasi. |
| `handles` | `NodeHandleManifest[]` | Yo'q | Node'ga ulangan React Flow handle'lar ro'yxati. |
| `content` | `NodeFieldManifest[]` | Yo'q | Canvas va edit panelida ko'rsatiladigan field'lar ro'yxati. |
| `footer` | `NodeFooterManifest[]` | Yo'q | Node karta pastidagi qo'shimcha bo'limlar. |
| `defaults` | `Record<string, unknown>` | Yo'q | Node yangi qo'shilganda `data` ga o'rnatiladigan boshlang'ich qiymatlar. |
| `producesState` | `string[]` | Yo'q | Bu node bajarilganda flow context'ga qo'shadigan state kalit nomlari. Misol: `["http_response", "http_success"]`. Variable panelda ko'rinadi. |
| `accessory` | `boolean` | Yo'q | `true` bo'lsa — bu node yordamchi (sub-node), masalan AI provider yoki tool. Canvas'da doira shaklida chiziladi, sidebar'da "ai" uslubida ko'rinadi. Flow step sifatida o'tkazilmaydi. |
| `accessoryPorts` | `NodeAccessoryPortManifest[]` | Yo'q | Faqat asosiy flow node'larida (masalan `AIAgentNode`). Bu port'lar orqali accessory node'lar ulanadi. |
| `accessoryAttachesTo` | `string[]` | Yo'q | Faqat accessory node'larda. Bu node qaysi port type'ga ulanishi mumkinligini bildiradi. Misol: `["ai_model"]` yoki `["ai_tool"]`. |
| `configFields` | `NodeFieldManifest[]` | Yo'q | Provider/tool node'lar uchun yon panel field'lari. Ko'pchilik node'lar `content` ni ishlatadi; `configFields` — qo'shimcha, kam ishlatiladi. |

---

## SidebarConfig (sidebar maydoni ichida)

| Maydon | Tur | Tavsif |
|---|---|---|
| `enabled` | `boolean` | `true` bo'lsa sidebar'da ko'rinadi. |
| `groupId` | `NodeSidebarGroupId` | Sidebar'dagi guruh: `"triggers"`, `"actions"`, `"messageOperations"`, `"flowControl"`, `"integrations"`, `"customLogic"`, `"ai"`. |
| `sortOrder` | `number` | Guruh ichidagi tartiblash raqami. Kichik raqam = yuqorida. |
| `elementType` | `string` | Sidebar element identifikatori. Drag-and-drop'da yangi node'ni qo'shishda ishlatiladi. |

---

## NodeHandleManifest

React Flow Handle'larini ifodalaydi. `preset` yoki qo'lda `kind`+`side` kombinatsiyasi ishlatiladi.

| Maydon | Tur | Tavsif |
|---|---|---|
| `preset` | `string \| undefined` | Oldindan belgilangan preset nomi (ro'yxat quyida). Preset ishlatilganda qolgan maydonlar e'tiborga olinmaydi. |
| `kind` | `"source" \| "target"` | Preset yo'q bo'lganda: handle turi. |
| `side` | `"left" \| "right" \| "top" \| "bottom"` | Preset yo'q bo'lganda: handle joylashgan tomon. |
| `id` | `string` | Handle ID — edge'ni aniq handle'ga ulash uchun ishlatiladi. Misol: `"true"`, `"false"`, `"next"`. |
| `offsetClass` | `string` | Tailwind `translate-y-*` class — bir tomonda bir nechta handle bo'lganda vertikal siljitish. Misol: `"translate-y-[-200%]"`. |
| `styleVariant` | `"default" \| "success" \| "warning" \| "danger" \| "accent"` | Handle pill rangini belgilaydi. |

---

## NodeAccessoryPortManifest

`accessoryPorts` massivi ichidagi har bir element. AIAgentNode kabi asosiy node'larda ishlatiladi.

| Maydon | Tur | Tavsif |
|---|---|---|
| `portType` | `string` | Port unikal identifikatori. Engine'da `acc:<portType>` sifatida ishlatiladi. Qiymatlar: `"ai_model"`, `"ai_tool"`. |
| `labelFallback` | `string` | Canvas'da handle ostida ko'rsatiladigan matn. |
| `labelKey` | `string \| undefined` | i18n kaliti (ixtiyoriy). |
| `accepts` | `string[]` | Bu port qabul qila oladigan node `type` nomlari. Drag validatsiyasida ishlatiladi. |
| `maxConnections` | `number \| undefined` | `1` = faqat bitta ulanish (ai_model). `undefined`/`0` = cheksiz (ai_tool). |
| `styleVariant` | `"default" \| "success" \| "warning" \| "danger" \| "accent"` | Port handle rangi. |

---

## NodeVisibilityRule

Field'ning `visibleWhen` maydoni uchun qoida. Faqat bir shart turi ishlatiladi.

| Maydon | Tur | Tavsif |
|---|---|---|
| `key` | `string` | Kuzatiladigan field kaliti. |
| `equals` | `unknown` | `data[key] === equals` bo'lsa field ko'rinadi. |
| `notEquals` | `unknown` | `data[key] !== notEquals` bo'lsa field ko'rinadi. |
| `oneOf` | `unknown[]` | `data[key]` massivdagi qiymatlardan birida bo'lsa field ko'rinadi. |

Faqat bitta shart (equals / notEquals / oneOf) ishlatilishi kerak.

---

## NodeFieldManifest (umumiy)

`content` va `configFields` massivlaridagi har bir element.

| Maydon | Tur | Tavsif |
|---|---|---|
| `type` | `FieldType` | Field widget turi (to'liq ro'yxat `field-types.md`da). |
| `key` | `string \| undefined` | `data` obyektidagi kalit nomi. Ko'pchilik field'lar uchun majburiy. |
| `widgetKey` | `string \| undefined` | Custom widget'da `key` o'rnida ishlatiladi. |
| `label` | `string` | Field ustidagi yorliq matn. |
| `placeholder` | `string \| undefined` | Input placeholder. |
| `helpText` | `string \| undefined` | Field ostidagi izoh matn. |
| `textKey` | `string \| undefined` | `description` type uchun i18n kaliti. |
| `textFallback` | `string \| undefined` | `description` type uchun fallback matn. |
| `rows` | `number \| undefined` | `textarea` uchun qator soni. |
| `min` | `number \| undefined` | `number` input uchun minimal qiymat. |
| `max` | `number \| undefined` | `number` input uchun maksimal qiymat. |
| `step` | `number \| undefined` | `number` input uchun qadam. |
| `options` | `NodeFieldOptionManifest[]` | `select` uchun variantlar ro'yxati. |
| `itemPlaceholder` | `string \| undefined` | `stringArray` ichidagi har bir input uchun placeholder. |
| `addButtonLabel` | `string \| undefined` | `stringArray` "qo'shish" tugmasi matni. |
| `visibleWhen` | `NodeVisibilityRule \| undefined` | Ko'rsatish shartlari. |
| `optional` | `boolean` | `true` = field boshlang'ichda yashirilgan, foydalanuvchi qo'l bilan qo'shadi. |
| `required` | `boolean` | `true` = majburiy belgi ko'rsatiladi (hozircha `credential` type'da ishlatiladi). |
| `defaultVisible` | `boolean \| undefined` | Optional field uchun ko'rsatish mantiqi: `true` = doim ko'rinadi; `false` = qiymat bo'lsa ham yashiriladi (standart bo'lmagan qiymatda ko'rinadi); `undefined` = qiymat asosida avtomatik. |
| `variant` | `"commandTrigger" \| "tabs"` | `select`'da `"tabs"` — segmented control (4 yoki undan kam variantda). `stateConfig`'da `"commandTrigger"`. |
| `is_state` | `boolean \| undefined` | `true` = bu field qiymati flow context'ga `state_<key>` sifatida saqlanadi va variable panelda ko'rsatiladi. |
| `intro` | `string \| undefined` | `richTextMessage` type'da editor ustidagi kirish matni. |
| `mediaKind` | `"photo" \| "video" \| "audio" \| "file"` | `mediaMessage` type'da media turi. |

### Array-editor uchun maxsus maydonlar

| Maydon | Tur | Tavsif |
|---|---|---|
| `addLabel` | `string` | "Qo'shish" tugmasi matni. |
| `maxItems` | `number` | Maksimal element soni. |
| `defaultItem` | `Record<string, unknown>` | Yangi element qo'shilganda boshlang'ich qiymat. |
| `itemFields` | `ArrayEditorItemFieldSpec[]` | Har bir element ichidagi sub-field'lar. |

### Code-editor uchun maxsus maydonlar

| Maydon | Tur | Tavsif |
|---|---|---|
| `outputsKey` | `string` | Kod natijasi yoziladigan data kaliti. |
| `language` | `"javascript" \| "python"` | Kod tili. |

### Collection-select uchun maxsus maydonlar

| Maydon | Tur | Tavsif |
|---|---|---|
| `withFieldMapping` | `boolean` | `true` = field mapping UI ko'rsatiladi. |
| `withFilters` | `boolean` | `true` = filter sozlamalar ko'rsatiladi. |
| `contextKeyField` | `string` | Natija saqlanadigan context kalitini ko'rsatadigan field nomi. |

### State-type-select uchun maxsus maydonlar

| Maydon | Tur | Tavsif |
|---|---|---|
| `keyField` | `string` | State kaliti saqlanadigan field nomi. |
| `typeField` | `string` | State turi saqlanadigan field nomi. |

### Condition-list uchun maxsus maydonlar

| Maydon | Tur | Tavsif |
|---|---|---|
| `operatorKey` | `string` | Asosiy operator (AND/OR) saqlanadigan data kaliti. |
| `conditionsKey` | `string` | Shartlar massivi saqlanadigan data kaliti. |
| `conditionFieldKey` | `string \| undefined` | Har bir shart ichida o'zgaruvchi nomini saqlovchi sub-field. Default: `"variable"`. |
| `conditionOpKey` | `string \| undefined` | Har bir shart ichida operator saqlovchi sub-field. Default: `"operator"`. |
| `operatorSet` | `"default" \| "engine"` | `"default"` = ichki flow operatorlari; `"engine"` = eq/ne/gt/lt/... |
| `fieldPlaceholder` | `string \| undefined` | Shart qatori ichidagi o'zgaruvchi nomiga placeholder. |

### Trigger-config uchun maxsus maydonlar

| Maydon | Tur | Tavsif |
|---|---|---|
| `kind` | `"message" \| "callback" \| "reply"` | Trigger turi — qaysi sozlamalar ko'rsatilishini belgilaydi. |
| `stateOptional` | `boolean` | `true` = state sozlamalari ixtiyoriy. |

### Dynamic-params uchun maxsus maydonlar

| Maydon | Tur | Tavsif |
|---|---|---|
| `schemaKey` | `string` | Dinamik schema saqlanadigan data kaliti. |
| `paramsKey` | `string` | Parametrlar saqlanadigan data kaliti. |
| `descriptionKey` | `string` | Tavsif kaliti. |

### Credential uchun maxsus maydonlar

| Maydon | Tur | Tavsif |
|---|---|---|
| `credentialType` | `string \| undefined` | Qaysi turdagi credential ko'rsatilsin. Misol: `"openai"`, `"google_drive"`. Bo'sh bo'lsa — barchasi ko'rinadi. |

### Dynamic-select va dynamic-inputs uchun maxsus maydonlar

| Maydon | Tur | Tavsif |
|---|---|---|
| `resource` | `string` | Backend endpoint nomi: `POST /v1/credentials/options/<resource>/`. |
| `credentialKey` | `string \| undefined` | Credential ID saqlovchi data kaliti. Default: `"credential_id"`. |
| `dependsOn` | `string[]` | Bu field bog'liq bo'lgan boshqa data kalit nomlari. Ular `params` sifatida backend'ga jo'natiladi. |

### Nested-rows uchun maxsus maydonlar

| Maydon | Tur | Tavsif |
|---|---|---|
| `addRowLabel` | `string` | Yangi qator qo'shish tugmasi matni. |
| `addColumnLabel` | `string` | Qatorga tugma qo'shish matni. |
| `maxColumns` | `number` | Bir qatordagi maksimal ustun (tugma) soni. |
| `defaultColumn` | `Record<string, unknown>` | Yangi tugma uchun boshlang'ich qiymat. |
| `columnFields` | `ColumnFieldSpec[]` | Har bir tugma uchun sub-field'lar ro'yxati. |

---

## NodeFooterManifest

| Maydon | Tur | Tavsif |
|---|---|---|
| `type` | `"actionPanel" \| "handlersList"` | Footer bo'lim turi. |
| `variant` | `"messageBasic" \| undefined` | `actionPanel` uchun qo'shimcha variant. |
| `hideHandlers` | `boolean \| undefined` | `handlersList`'da handle tugmalarini yashirish. |

### Footer turlari:
- **`actionPanel`**: Eski qo'lda yoziladigan action panel (inline keyboard, recipients). Ko'pchilik yangi node'larda `content` field'lari orqali o'chirilmoqda.
- **`handlersList`**: Node'da belgilangan callback handler tugmalarini canvas'da qator ko'rinishida chizadi. `SendTextMessageNode` kabi node'larda ishlatiladi.

---

## ArrayEditorItemFieldSpec

`array-editor` type'dagi field'ning `itemFields` massivi ichidagi har bir sub-field.

| Maydon | Tur | Tavsif |
|---|---|---|
| `key` | `string` | Sub-field kaliti. |
| `type` | `"text" \| "number" \| "select" \| "checkbox" \| "switch" \| "textarea"` | Sub-field turi. |
| `label` | `string \| undefined` | Yorliq. |
| `placeholder` | `string \| undefined` | Placeholder. |
| `options` | `NodeFieldOptionManifest[]` | `select` uchun. |
| `visibleWhen` | `NodeVisibilityRule \| undefined` | Ko'rinish sharti. |
