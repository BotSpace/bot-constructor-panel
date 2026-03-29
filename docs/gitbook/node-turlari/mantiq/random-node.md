# Random (Tasodifiy)

Tasodifiy qiymat tanlaydi yoki tasodifiy yo'lga yo'naltiradi.

## Asosiy ma'lumot

| Xususiyat | Qiymat |
|-----------|--------|
| **Kategoriya** | Mantiq |
| **Node nomi** | Random |
| **Fayl** | `RandomNode/RandomNode.tsx` |

## Ko'rinishi

```
       ○ Target
┌─────────────────┐
│   🎲 Random     │
│   3 ta variant  │
└──┬──────┬────┬──┘
   ○      ○    ○
  Out1  Out2  Out3
```

## Ish rejimi

### 1. Tasodifiy yo'l

Bir nechta chiqishdan birini tasodifiy tanlaydi:

```
       ○ Target
┌─────────────────┐
│     Random      │
│   3 outputs     │
└──┬──────┬────┬──┘
   │      │    │
   ▼      ▼    ▼
┌─────┐ ┌─────┐ ┌─────┐
│Msg 1│ │Msg 2│ │Msg 3│
└─────┘ └─────┘ └─────┘
```

### 2. Tasodifiy qiymat

Variable'ga tasodifiy qiymat beradi.

## Xususiyatlar

### Mode (Rejim)

| Rejim | Tavsif |
|-------|--------|
| Path | Tasodifiy yo'l |
| Value | Tasodifiy qiymat |

### Outputs (Chiqishlar)

Tasodifiy yo'llar soni (2-10).

### Range (Oraliq)

Tasodifiy raqam uchun min va max:
- Min: `1`
- Max: `100`

### Variable Name

Natija saqlanadigan o'zgaruvchi nomi.

## Misollar

### Tasodifiy salom

```
       Random
    ┌────┬────┐
    │    │    │
    ▼    ▼    ▼
"Salom!" "Assalomu" "Hayrli
           alaykum!"  kun!"
```

### Tasodifiy raqam

**Mode:** Value
**Min:** 1
**Max:** 6
**Variable:** `dice`

Natija: `{{var.dice}}` → 1 dan 6 gacha

### O'yin

```
Random (1-100)
    │
    ▼
┌─────────────────┐
│       If        │
│ var.number > 50 │
└────┬───────┬────┘
     │       │
   True    False
     │       │
     ▼       ▼
"Yutdingiz!"  "Yutqazdingiz"
```

### A/B test

Foydalanuvchilarning yarmiga yangi xususiyat ko'rsatish:

```
       Random
      ┌────┐
      │    │
      ▼    ▼
   Group A  Group B
      │       │
      ▼       ▼
  New UI   Old UI
```

## O'zgaruvchilar

| O'zgaruvchi | Tavsif |
|-------------|--------|
| `{{var.random_number}}` | Tasodifiy raqam |
| `{{var.random_choice}}` | Tanlangan variant |

## Eng yaxshi amaliyotlar

### ✅ To'g'ri

- O'yin mexanikalari
- A/B testing
- Xilma-xillik qo'shish

### ❌ Noto'g'ri

- Muhim qarorlar uchun
- Xavfsizlik uchun tasodifiylik

## Keyingi

{% content-ref url="http-request.md" %}
[http-request.md](http-request.md)
{% endcontent-ref %}
