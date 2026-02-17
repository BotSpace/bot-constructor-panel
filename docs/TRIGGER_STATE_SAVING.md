# Trigger State Saving - Triggerlarda Ma'lumotlarni Saqlash

## Umumiy Ma'lumot

Endi triggerlar o'zida ma'lumotlarni saqlash imkoniyatiga ega. Avval ma'lumotlarni saqlash uchun alohida `StateNode` qo'yish kerak edi, ammo hozir trigger o'zida kerakli ma'lumotlarni avtomatik ravishda saqlashi mumkin.

## Qo'llab-quvvatlanadigan Triggerlar

Quyidagi triggerlar state saving ni qo'llab-quvvatlaydi:

1. **MessageTriggerNode** - Xabarlardan ma'lumot saqlash
2. **CallbackQueryTriggerNode** - Callback querylardan ma'lumot saqlash
3. **CommandTriggerNode** - Komandalardan ma'lumot saqlash
4. **ReplyButtonTriggerNode** - Reply buttonlardan ma'lumot saqlash

## Foydalanish

### Asosiy Struktura

Har qanday triggerga `state` obyekti qo'shish mumkin:

```json
{
  "id": "my_trigger",
  "type": "MessageTriggerNode",
  "data": {
    "type": "text",
    "filter": "any",
    "state": {
      "key": "user_message",
      "type": "text"
    }
  }
}
```

### State Parametrlari

#### `key` (majburiy)
Ma'lumotni saqlash uchun kalit nomi. Ma'lumot `state_{key}` formatida saqlanadi.

**Misol:**
```json
"state": {
  "key": "user_name"
}
```
Natijada: `state_user_name` ga qiymat saqlanadi

#### `type` (majburiy)
Qaysi turdagi ma'lumotni saqlash kerakligi.

## Qo'llab-quvvatlanadigan Type'lar

### Xabar Ma'lumotlari

#### `text`
Xabar matni

```json
"state": {
  "key": "user_message",
  "type": "text"
}
```

#### `caption`
Media caption

```json
"state": {
  "key": "photo_caption",
  "type": "caption"
}
```

### Callback Ma'lumotlari

#### `callback`
Callback data

```json
"state": {
  "key": "button_data",
  "type": "callback"
}
```

#### `data`
Callback datadan qiymatni ajratib olish (collection format uchun)

```json
"state": {
  "key": "selected_id",
  "type": "data"
}
```

#### `collection_id`
Dynamic inline button (collection)dan ID ni ajratib olish
Format: `collection:collection_name:id`

```json
"state": {
  "key": "item_id",
  "type": "collection_id"
}
```

Misol: Agar callback data `collection:products:12345` bo'lsa, `state_item_id` ga `12345` saqlanadi.

### File Ma'lumotlari

#### `file_id`
Barcha media turlarining file ID'sini saqlaydi (photo, video, document, audio, voice, video_note, animation, sticker)

```json
"state": {
  "key": "uploaded_file",
  "type": "file_id"
}
```

### Kontakt Ma'lumotlari

#### `phone_number` yoki `contact_phone_number`
Telefon raqam

```json
"state": {
  "key": "user_phone",
  "type": "phone_number"
}
```

#### `contact_first_name`
Kontakt ismi

```json
"state": {
  "key": "contact_name",
  "type": "contact_first_name"
}
```

#### `contact_last_name`
Kontakt familiyasi

```json
"state": {
  "key": "contact_surname",
  "type": "contact_last_name"
}
```

### Joylashuv Ma'lumotlari

#### `location`, `latitude`, yoki `location_latitude`
Latitude (kenglik)

```json
"state": {
  "key": "user_lat",
  "type": "latitude"
}
```

#### `longitude` yoki `location_longitude`
Longitude (uzunlik)

```json
"state": {
  "key": "user_lon",
  "type": "longitude"
}
```

## To'liq Misollar

### 1. Text Xabarni Saqlash

```json
{
  "id": "text_trigger",
  "type": "MessageTriggerNode",
  "data": {
    "type": "text",
    "filter": "any",
    "state": {
      "key": "user_input",
      "type": "text"
    }
  }
}
```

Keyinchalik ishlatish:
```json
{
  "type": "SendTextMessageNode",
  "data": {
    "messageText": "Siz yozgan: {{state_user_input}}"
  }
}
```

### 2. Photo File ID ni Saqlash

```json
{
  "id": "photo_trigger",
  "type": "MessageTriggerNode",
  "data": {
    "type": "photo",
    "filter": "any",
    "state": {
      "key": "photo_id",
      "type": "file_id"
    }
  }
}
```

### 3. Callback Data ni Saqlash

```json
{
  "id": "callback_trigger",
  "type": "CallbackQueryTriggerNode",
  "data": {
    "filter": "any",
    "state": {
      "key": "selected_option",
      "type": "callback"
    }
  }
}
```

### 4. Telefon Raqamni Saqlash

```json
{
  "id": "contact_trigger",
  "type": "MessageTriggerNode",
  "data": {
    "type": "contact",
    "filter": "any",
    "state": {
      "key": "phone",
      "type": "phone_number"
    }
  }
}
```

### 5. Joylashuvni Saqlash

```json
{
  "id": "location_trigger",
  "type": "MessageTriggerNode",
  "data": {
    "type": "location",
    "filter": "any",
    "state": {
      "key": "lat",
      "type": "latitude"
    }
  }
}
```

## StateNode bilan Farqi

### Eski usul (StateNode bilan):
```
MessageTrigger → StateNode → ResponseNode
```

Trigger triggerlangandan keyin, alohida StateNode orqali ma'lumotni saqlash kerak edi.

### Yangi usul (Trigger bilan to'g'ridan-to'g'ri):
```
MessageTrigger (state bilan) → ResponseNode
```

Trigger o'zida ma'lumotni saqlaydi, alohida node kerak emas.

## Afzalliklari

1. **Kamroq Node'lar**: StateNode kerak emas
2. **Soddaroq Flow**: Kamroq bog'lanishlar
3. **Tezroq Ishlash**: Bir node kamroq bajariladi
4. **Osonroq Tushinish**: Trigger o'zida qaysi ma'lumot saqlanishini ko'rsatadi

## Eslatmalar

- State configuration ixtiyoriy. Agar `state` bo'lmasa, trigger oddiy ishlaydi
- `key` va `type` majburiy parametrlar
- Ma'lumot `state_{key}` formatida contextga saqlanadi
- Barcha StateNode type'lari qo'llab-quvvatlanmaydi, faqat asosiy type'lar
- Murakkab type'lar uchun StateNode ishlatish kerak

## UI Foydalanish

Trigger node'ni ochganingizda, pastki qismida "Ma'lumotni saqlash" checkboxi ko'rinadi:

1. Checkboxni belgilang
2. "State Key" ga kalit nomini kiriting (masalan: `user_message`)
3. "Ma'lumot Turi" dan kerakli turni tanlang (masalan: `text`)
4. Ma'lumot avtomatik ravishda `state_user_message` ga saqlanadi

## Muammolarni Hal Qilish

### Ma'lumot Saqlanmayapti

1. `state` obyekti to'g'ri formatdaligini tekshiring
2. `key` va `type` parametrlari mavjudligini tekshiring
3. Trigger type'i va state type'i mos kelishini tekshiring (masalan, `phone_number` faqat contact uchun)

### Noto'g'ri Ma'lumot Saqlanmoqda

1. State `type` to'g'ri tanlanganligini tekshiring
2. Trigger filter'i to'g'ri ishlayotganini tekshiring
3. Log'larni tekshiring (DEBUG darajasida)

## Implementation Details

### TypeScript Types

```typescript
export type StateType =
  | "text"
  | "caption"
  | "callback"
  | "data"
  | "collection_id"
  | "file_id"
  | "phone_number"
  | "contact_phone_number"
  | "contact_first_name"
  | "contact_last_name"
  | "location"
  | "latitude"
  | "longitude"
  | "location_latitude"
  | "location_longitude";

export interface StateConfig {
  key: string;
  type: StateType;
}
```

### Usage in Trigger Data

```typescript
export interface MessageTriggerNodeData {
  type: MessageTriggerValueTypes;
  filter?: "any" | string;
  global: boolean;
  context?: { ... };
  state?: StateConfig; // Optional state configuration
}
```

## Kelajakda Qo'shilishi Mumkin

- User ma'lumotlarini saqlash (first_name, last_name, username)
- Chat ma'lumotlarini saqlash (chat_id, chat_type)
- Message ID ni saqlash
- Poll ma'lumotlarini saqlash
- Venue ma'lumotlarini saqlash
