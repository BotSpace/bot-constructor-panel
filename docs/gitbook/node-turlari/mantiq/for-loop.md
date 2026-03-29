# For Loop (Sikl)

Ro'yxat bo'ylab takrorlash (iteratsiya).

## Asosiy ma'lumot

| Xususiyat | Qiymat |
|-----------|--------|
| **Kategoriya** | Mantiq |
| **Node nomi** | For Loop |
| **Fayl** | `ForLoopNode/ForLoopNode.tsx` |

## Ko'rinishi

```
       ○ Target
┌─────────────────┐
│   🔁 For Loop   │
│  items: [...]   │
└────┬───────┬────┘
     ○       ○
   Body    Done
```

## Handle'lar

| Handle | Pozitsiya | Vazifa |
|--------|-----------|--------|
| Target | Tepa | Kirish |
| Body | Chap-past | Har bir element uchun |
| Done | O'ng-past | Tsikl tugaganda |

## Xususiyatlar

### Items (Elementlar)

Takrorlanadigan ro'yxat:
- Kolleksiya: `{{collection.users}}`
- Massiv: `{{var.items}}`
- Custom Code'dan: `{{var.my_array}}`

### Item Variable Name

Joriy element nomi (default: `item`):
```
{{loop.item}}
```

### Index Variable Name

Joriy indeks nomi (default: `index`):
```
{{loop.index}}  // 0, 1, 2, ...
```

## Misollar

### Foydalanuvchilarga xabar

Kolleksiyadagi barcha foydalanuvchilarga xabar yuborish:

```
┌─────────────────┐
│    For Loop     │
│ items: users    │
└────┬───────┬────┘
     │       │
   Body    Done
     │       │
     ▼       ▼
┌───────────┐ ┌───────────┐
│Text Msg   │ │"Yakunlandi"│
│to: item.id│ │           │
└───────────┘ └───────────┘
```

### Mahsulotlar ro'yxati

```
┌─────────────────┐
│    For Loop     │
│ items: products │
└────┬───────┬────┘
     │       │
   Body    Done
     │       │
     ▼       ▼
┌───────────┐ ┌───────────┐
│ "{{index}}│ │"Hammasi   │
│ {{item.   │ │ shu"      │
│  name}}"  │ │           │
└───────────┘ └───────────┘
```

### Raqamlar oralig'i

Custom Code bilan:

```python
# 1 dan 10 gacha
numbers = list(range(1, 11))
set_var("numbers", numbers)
```

Keyin For Loop:
```
items: {{var.numbers}}
```

## Loop ichida o'zgaruvchilar

| O'zgaruvchi | Tavsif |
|-------------|--------|
| `{{loop.item}}` | Joriy element |
| `{{loop.index}}` | Joriy indeks (0 dan) |
| `{{loop.item.field}}` | Element maydoni |

## For Loop Continue

Tsikldan erta chiqish yoki keyingi elementga o'tish:

```
┌─────────────────┐
│    For Loop     │
│ items: products │
└────┬───────┬────┘
     │       │
   Body    Done
     │
     ▼
┌─────────────────┐
│       If        │
│ item.stock == 0 │
└────┬───────┬────┘
     │       │
   True    False
     │       │
     ▼       ▼
┌───────────┐ ┌───────────┐
│For Loop   │ │Normal     │
│ Continue  │ │ action    │
│ (skip)    │ │           │
└───────────┘ └───────────┘
```

## Cheklovlar

{% hint style="warning" %}
Katta ro'yxatlarda ehtiyot bo'ling:
- Telegram rate limit'lari
- Timeout
- Xotira
{% endhint %}

**Tavsiya:** 
- Bir vaqtda 30+ xabar yuborish sekin
- Delay qo'shing
- Batch processing ishlating

## Eng yaxshi amaliyotlar

### ✅ To'g'ri

- Kichik ro'yxatlar uchun
- Delay bilan birga
- Done handle'ni to'ldiring

### ❌ Noto'g'ri

- Katta ro'yxatlarni bir vaqtda
- Ichma-ich ko'p loop
- Done'ni bo'sh qoldirish

## Keyingi

{% content-ref url="delay-node.md" %}
[delay-node.md](delay-node.md)
{% endcontent-ref %}
