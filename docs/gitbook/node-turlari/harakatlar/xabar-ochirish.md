# Xabar o'chirish

Xabarni o'chiradi.

## Asosiy ma'lumot

| Xususiyat | Qiymat |
|-----------|--------|
| **Kategoriya** | Harakat |
| **Node nomi** | Delete Message |
| **Fayl** | `DeleteMessageNode/DeleteMessageNode.tsx` |

## Ko'rinishi

```
       ○ Target
┌─────────────────┐
│   🗑️ O'chirish  │
│ Delete Message  │
└────────┬────────┘
         ○ Source
```

## Xususiyatlar

### Message ID

O'chiriladigan xabar ID:

| Qiymat | Ma'no |
|--------|-------|
| `{{message.id}}` | Foydalanuvchi xabari |
| `{{callback.message_id}}` | Callback xabari |
| Raqam | Aniq xabar ID |
| `{{var.message_id}}` | Saqlangan ID |

### Chat ID

Xabar joylashgan chat (odatda bo'sh — joriy chat).

## Misollar

### Foydalanuvchi xabarini o'chirish

```
┌─────────────────┐
│ Message Trigger │
│   type: text    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Delete Message  │
│ {{message.id}}  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Text Message   │
│ "Xabar qabul    │
│  qilindi"       │
└─────────────────┘
```

### Bot xabarini o'chirish

```
┌─────────────────┐
│ Callback Query  │
│ data: "close"   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Delete Message  │
│{{callback.      │
│ message_id}}    │
└─────────────────┘
```

### Vaqtinchalik xabarni o'chirish

```
1. Text Message: "Yuklanmoqda..."
   → message_id saqlash

2. Delay: 5 soniya

3. Delete Message
   → oldingi xabar o'chiriladi
```

## Cheklovlar

| Bot bajara oladi | Bot bajara olmaydi |
|------------------|-------------------|
| O'z xabarlarini o'chirish | Boshqa foydalanuvchi xabarlarini (admin bo'lmasa) |
| 48 soat ichida | 48 soatdan keyin |
| Private chat'da | Boshqa botlar xabarlarini |

{% hint style="warning" %}
Guruhda foydalanuvchi xabarlarini o'chirish uchun botda **Delete messages** huquqi bo'lishi kerak.
{% endhint %}

## O'zgaruvchilar

| O'zgaruvchi | Tavsif |
|-------------|--------|
| `{{message.id}}` | Kelgan xabar ID |
| `{{callback.message_id}}` | Callback xabari ID |

## Keyingi

{% content-ref url="boshqa-harakatlar.md" %}
[boshqa-harakatlar.md](boshqa-harakatlar.md)
{% endcontent-ref %}
