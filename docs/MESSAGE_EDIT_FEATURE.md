# Message Edit Xususiyatini Qo'shish Rejasi

## 🎯 Maqsad

Telegram bot constructor'da yuborilgan xabarlarni tahrirlash (edit) qilish imkoniyatini qo'shish.

## 💡 G'oyalar va Yondashuvlar

### Variant 1: Yangi "EditMessageNode" Yaratish (Tavsiya etiladi) ⭐

**Afzalliklari:**

- ✅ Alohida node sifatida aniq va tushunarli
- ✅ Mavjud kodga minimal o'zgarish
- ✅ Har xil turdagi xabarlarni edit qilish (text, photo, video, audio, file)
- ✅ Qayta ishlatiladigan va modullashtirilgan

**Kamchiliklari:**

- ⚠️ Yangi node yaratish kerak
- ⚠️ UI'da yangi element qo'shish kerak

**Qanday ishlaydi:**

1. Foydalanuvchi "EditMessageNode" ni drag qiladi
2. Node'da quyidagilarni so'raydi:
   - Message ID (qayerdan olish kerak?)
   - Yangi matn/kontent
   - Edit qilish turi (text, caption, keyboard)
3. Node oldingi node'dan message_id ni oladi yoki context'dan

### Variant 2: Mavjud Message Node'larni Edit Qilish Imkoniyatini Qo'shish

**Afzalliklari:**

- ✅ Mavjud node'larni kengaytirish
- ✅ UI'da yangi element qo'shish shart emas
- ✅ Foydalanuvchi uchun sodda

**Kamchiliklari:**

- ⚠️ Har bir message node'ga edit funksiyasini qo'shish kerak
- ⚠️ Kod takrorlanishi mumkin
- ⚠️ Node'lar murakkablashadi

**Qanday ishlaydi:**

1. Har bir message node'da "Edit existing message" checkbox yoki toggle
2. Agar edit rejimida bo'lsa:
   - Message ID maydoni ko'rinadi
   - Send o'rniga Edit bo'ladi

### Variant 3: Hybrid Yondashuv (Eng Yaxshi) ⭐⭐⭐

**Afzalliklari:**

- ✅ Alohida EditMessageNode (asosiy)
- ✅ Mavjud node'larda ham edit rejimi (qo'shimcha)
- ✅ Eng moslashuvchan yechim

**Qanday ishlaydi:**

1. **EditMessageNode** - asosiy edit funksiyasi uchun
2. **Mavjud node'larda edit rejimi** - tezkor edit uchun
3. **Context'dan message_id** - oldingi node'dan avtomatik olish

## 📋 Batafsil Reja

### 1. EditMessageNode Yaratish

#### 1.1 Type Definition

```typescript
// src/features/bot-constructor/nodes/actions/EditMessageNode/types.ts

export type EditMessageType = "text" | "caption" | "keyboard" | "media";

export interface EditMessageNodeData {
  // Message ID ni qayerdan olish
  messageIdSource: "context" | "previous_node" | "manual";
  messageId?: string; // manual bo'lsa

  // Edit qilish turi
  editType: EditMessageType;

  // Text edit uchun
  newText?: string;
  parseMode?: ParseMode;

  // Caption edit uchun (media uchun)
  newCaption?: string;

  // Keyboard edit uchun
  keyboard?: KeyboardConfig;

  // Media edit uchun (photo, video, audio, file)
  mediaType?: "photo" | "video" | "audio" | "file";
  mediaSource?: string; // URL yoki file_id

  // Qo'shimcha sozlamalar
  disableWebPagePreview?: boolean;
}
```

#### 1.2 Node Component

```typescript
// src/features/bot-constructor/nodes/actions/EditMessageNode/EditMessageNode.tsx

// Asosiy funksiyalar:
// - Message ID manbasini tanlash (context, previous node, manual)
// - Edit turini tanlash (text, caption, keyboard, media)
// - Yangi kontentni kiritish
// - Preview ko'rsatish
```

#### 1.3 UI Komponentlari

- Message ID source selector (dropdown)
- Edit type selector (radio buttons)
- Content input (text, caption, media)
- Keyboard editor (mavjud ButtonGenerator'dan foydalanish)
- Preview panel

### 2. Context System Kengaytirish

#### 2.1 Message ID ni Context'ga Saqlash

```typescript
// Mavjud message node'larda yuborilgan message_id ni context'ga saqlash
// CustomCodeNode'da ham message_id ni context'ga qo'shish imkoniyati

// Misol:
context["last_message_id"] = sent_message.message_id;
context["last_chat_id"] = sent_message.chat.id;
```

#### 2.2 Previous Node'dan Message ID Olish

```typescript
// Flow'da oldingi node'dan message_id ni olish
// Edge orqali ma'lumot o'tkazish
// Yoki node'lar orasida context sharing
```

### 3. Backend Integratsiya

#### 3.1 Aiogram Edit Methods

```python
# src/features/bot-constructor/editor/setup/aiogram/message/edit.ts

# Quyidagi metodlarni qo'shish:
# - edit_message_text()
# - edit_message_caption()
# - edit_message_reply_markup()
# - edit_message_media()
```

#### 3.2 Code Generation

```python
# EditMessageNode uchun Python kod generatsiyasi

# Misol:
if edit_type == "text":
    await bot.edit_message_text(
        chat_id=chat_id,
        message_id=message_id,
        text=new_text,
        parse_mode=parse_mode
    )
elif edit_type == "caption":
    await bot.edit_message_caption(
        chat_id=chat_id,
        message_id=message_id,
        caption=new_caption
    )
```

### 4. UI/UX Yaxshilashlar

#### 4.1 Message ID Selector

- **Context'dan** - `context['last_message_id']` dan olish
- **Previous Node'dan** - Oldingi message node'dan olish
- **Manual** - Foydalanuvchi o'zi kiritadi

#### 4.2 Edit Type Selector

- **Text** - Faqat matnni o'zgartirish
- **Caption** - Media uchun caption o'zgartirish
- **Keyboard** - Tugmalarni o'zgartirish
- **Media** - Media faylni o'zgartirish

#### 4.3 Preview

- Edit qilishdan oldin preview ko'rsatish
- Validation (message_id mavjudligini tekshirish)

### 5. Elements List'ga Qo'shish

```typescript
// src/features/bot-constructor/data/elements.ts

{
  type: "edit_message",
  name: "Xabarni tahrirlash",
  description: "Yuborilgan xabarni tahrirlash.",
  icon: "✏️",
  color: "bg-green-500/10 text-green-400 border-green-500/20",
  triggerId: "EditMessageNode",
}
```

## 🔧 Texnik Detallar

### Message ID Olish Usullari

#### 1. Context'dan

```python
# CustomCodeNode'da:
context['last_message_id'] = sent_message.message_id

# EditMessageNode'da:
message_id = context.get('last_message_id')
```

#### 2. Previous Node'dan

```typescript
// Flow'da oldingi node'dan message_id ni olish
// Edge orqali ma'lumot o'tkazish
// Yoki node'lar orasida context sharing
```

#### 3. Manual

```typescript
// Foydalanuvchi o'zi message_id ni kiritadi
// Yoki message link'dan parse qilish
```

### Edit Types

#### 1. Text Edit

```python
await bot.edit_message_text(
    chat_id=chat_id,
    message_id=message_id,
    text=new_text,
    parse_mode=parse_mode,
    disable_web_page_preview=disable_web_page_preview
)
```

#### 2. Caption Edit

```python
await bot.edit_message_caption(
    chat_id=chat_id,
    message_id=message_id,
    caption=new_caption,
    parse_mode=parse_mode
)
```

#### 3. Keyboard Edit

```python
await bot.edit_message_reply_markup(
    chat_id=chat_id,
    message_id=message_id,
    reply_markup=keyboard
)
```

#### 4. Media Edit

```python
await bot.edit_message_media(
    chat_id=chat_id,
    message_id=message_id,
    media=InputMediaPhoto(media=photo_url, caption=caption)
)
```

## 📝 Implementation Steps

### Step 1: Type Definitions

- [ ] `EditMessageNodeData` interface yaratish
- [ ] `EditMessageType` type yaratish
- [ ] Types faylini yaratish

### Step 2: Node Component

- [ ] `EditMessageNode.tsx` yaratish
- [ ] Message ID source selector
- [ ] Edit type selector
- [ ] Content input fields
- [ ] Preview panel

### Step 3: Backend Integration

- [ ] `edit.ts` faylini yaratish (aiogram methods)
- [ ] Code generation logic
- [ ] Validation logic

### Step 4: Context System

- [ ] Message ID ni context'ga saqlash
- [ ] Previous node'dan message ID olish
- [ ] Context sharing mechanism

### Step 5: UI Integration

- [ ] Elements list'ga qo'shish
- [ ] Node registration
- [ ] Default data setup

### Step 6: Testing

- [ ] Unit tests
- [ ] Integration tests
- [ ] Manual testing

## 🎨 UI Mockup

```
┌─────────────────────────────────────┐
│ ✏️ Xabarni tahrirlash          [−] │
├─────────────────────────────────────┤
│ Message ID manbasi:                 │
│ ○ Context'dan                       │
│ ● Oldingi node'dan                  │
│ ○ Manual                            │
│                                     │
│ Edit turi:                           │
│ ○ Text                              │
│ ○ Caption                           │
│ ● Keyboard                          │
│ ○ Media                             │
│                                     │
│ [Keyboard Editor]                   │
│ [Preview]                           │
└─────────────────────────────────────┘
```

## 🚀 Qo'shimcha G'oyalar

### 1. Batch Edit

- Bir nechta xabarni bir vaqtda edit qilish
- Mass edit funksiyasi

### 2. Edit History

- Edit qilingan xabarlar tarixi
- Undo/Redo funksiyasi

### 3. Smart Edit

- AI yordamida xabarni yaxshilash
- Auto-suggestions

### 4. Edit Templates

- Edit uchun shablonlar
- Tezkor edit variantlari

## ❓ Savollar va Yechimlar

### Q: Message ID ni qayerdan olish kerak?

**A:** 3 ta variant:

1. Context'dan - `context['last_message_id']`
2. Previous node'dan - Flow'da oldingi node'dan
3. Manual - Foydalanuvchi o'zi kiritadi

### Q: Qanday edit turlarini qo'llab-quvvatlash kerak?

**A:** 4 ta asosiy tur:

1. Text - Matnni o'zgartirish
2. Caption - Media uchun caption
3. Keyboard - Tugmalarni o'zgartirish
4. Media - Media faylni o'zgartirish

### Q: Validation qanday qilish kerak?

**A:**

- Message ID mavjudligini tekshirish
- Edit turiga mos ma'lumotlarni tekshirish
- Telegram API limitlarini hisobga olish

## 📚 Resurslar

- [Telegram Bot API - editMessageText](https://core.telegram.org/bots/api#editmessagetext)
- [Telegram Bot API - editMessageCaption](https://core.telegram.org/bots/api#editmessagecaption)
- [Telegram Bot API - editMessageReplyMarkup](https://core.telegram.org/bots/api#editmessagereplymarkup)
- [Telegram Bot API - editMessageMedia](https://core.telegram.org/bots/api#editmessagemedia)
- [Aiogram Documentation](https://docs.aiogram.dev/)
