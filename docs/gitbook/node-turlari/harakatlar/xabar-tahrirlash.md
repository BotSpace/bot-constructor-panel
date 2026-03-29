# Xabar tahrirlash

Mavjud xabarni tahrirlaydi.

## Asosiy ma'lumot

| Xususiyat | Qiymat |
|-----------|--------|
| **Kategoriya** | Harakat |
| **Node nomi** | Edit Message |
| **Fayl** | `EditMessageNode/EditMessageNode.tsx` |

## Ko'rinishi

```
       ○ Target
┌─────────────────┐
│   ✏️ Tahrirlash │
│  Edit Message   │
└────────┬────────┘
         ○ Source
```

## Xususiyatlar

### Message ID

Tahrirlanadigan xabar ID:

| Qiymat | Ma'no |
|--------|-------|
| `{{message.id}}` | Joriy xabar |
| `{{callback.message_id}}` | Callback xabari |
| Raqam | Aniq xabar ID |

### Text (Yangi matn)

Xabarning yangi matni.

### Parse Mode

Formatlash rejimi.

### Keyboard

Yangi tugmalar:
- Mavjud tugmalarni o'zgartirish
- Tugmalarni o'chirish
- Yangi tugmalar qo'shish

### Chat ID

Xabar joylashgan chat (odatda bo'sh — joriy chat).

## Nima tahrirlanadi?

| Tahrirlanadi | Tahrirlanmaydi |
|--------------|----------------|
| Matn | Media (alohida metod) |
| Inline tugmalar | Reply keyboard |
| Parse mode | Xabar turi |

## Misollar

### Callback tugmadan keyin

Foydalanuvchi inline tugma bosganda xabarni yangilash:

```
┌─────────────────┐
│ Callback Query  │
│ data: "select"  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Callback Answer │
│ text: "OK"      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Edit Message   │
│ "Siz tanladingiz│
│    ✅"          │
└─────────────────┘
```

**Message ID:** `{{callback.message_id}}`

### Tugmalarni yangilash

Faqat tugmalarni o'zgartirish (matnni saqlab):

**Text:** `{{callback.message.text}}`
**Keyboard:** Yangi tugmalar

### Loading → Natija

```
1. Text Message: "Yuklanmoqda... ⏳"
   → message_id saqlanadi

2. HTTP Request (uzoq jarayon)

3. Edit Message: "Natija: ✅"
   → oldingi xabar tahrirlanadi
```

## O'zgaruvchilar

| O'zgaruvchi | Tavsif |
|-------------|--------|
| `{{message.id}}` | Joriy xabar ID |
| `{{callback.message_id}}` | Callback xabari ID |
| `{{callback.message.text}}` | Callback xabari matni |
| `{{var.message_id}}` | Saqlangan xabar ID |

## Cheklovlar

- Faqat bot yuborgan xabarlarni tahrirlash mumkin
- 48 soatdan keyin tahrirlash cheklangan
- Media xabarlarni tahrirlash uchun alohida metod kerak

## Keyingi

{% content-ref url="xabar-ochirish.md" %}
[xabar-ochirish.md](xabar-ochirish.md)
{% endcontent-ref %}
