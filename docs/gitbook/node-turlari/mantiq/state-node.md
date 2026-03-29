# State (Holat)

Foydalanuvchi holatini saqlaydi va boshqaradi.

## Asosiy ma'lumot

| Xususiyat | Qiymat |
|-----------|--------|
| **Kategoriya** | Mantiq |
| **Node nomi** | State |
| **Fayl** | `StateNode/StateNode.tsx` |

## Ko'rinishi

```
       ○ Target
┌─────────────────┐
│   🔄 State      │
│  holat: main    │
└────────┬────────┘
         ○ Source
```

## State nima?

**State** — bu foydalanuvchining joriy holati. Bot foydalanuvchi qaysi bosqichda ekanini eslaydi.

**Misol:**
1. Foydalanuvchi `/start` bosdi → State: `main`
2. "Ism kiriting" so'raldi → State: `waiting_name`
3. Ism kiritildi → State: `waiting_phone`
4. Telefon kiritildi → State: `registered`

## Xususiyatlar

### State Name

Holat nomi:
- `main` — asosiy holat
- `waiting_name` — ism kutilmoqda
- `ordering` — buyurtma jarayoni
- va h.k.

### State Data

Holatga biriktirilgan ma'lumotlar (ixtiyoriy).

## State bilan ishlash

### 1. Holat o'rnatish

```
┌─────────────────┐
│     State       │
│  name: main     │
└─────────────────┘
```

### 2. Holatga qarab trigger

Trigger'lar faqat belgilangan holatda ishlaydi (global bo'lmasa):

```
┌─────────────────┐
│ Message Trigger │
│ state: waiting_name │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Variable      │
│ name = message  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│     State       │
│ waiting_phone   │
└─────────────────┘
```

## Misollar

### Ro'yxatdan o'tish oqimi

```
    /start
       │
       ▼
┌─────────────────┐
│  "Ismingizni    │
│   kiriting"     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│     State       │
│  waiting_name   │
└─────────────────┘

(Foydalanuvchi ism yozadi)

┌─────────────────┐
│ Message Trigger │
│ state: waiting_name│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Variable      │
│ name = {{msg}}  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  "Telefoningizni│
│   kiriting"     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│     State       │
│  waiting_phone  │
└─────────────────┘
```

### Menu holatlari

```
main
 ├── products (Mahsulotlar ko'rish)
 │    └── product_detail (Bitta mahsulot)
 ├── cart (Savat)
 │    └── checkout (Buyurtma berish)
 └── profile (Profil)
      └── edit_profile (Tahrirlash)
```

## Global trigger

Ba'zi trigger'lar har qanday holatda ishlashi kerak:

```
┌─────────────────┐
│ Command Trigger │
│  /cancel        │
│  global: ✅     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│     State       │
│     main        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ "Bekor qilindi" │
└─────────────────┘
```

## State Data

Holatga qo'shimcha ma'lumot biriktirish:

```
┌─────────────────┐
│     State       │
│ name: editing   │
│ data:           │
│  product_id: 123│
└─────────────────┘
```

Keyin:
```
{{state.data.product_id}}
```

## Eng yaxshi amaliyotlar

### ✅ To'g'ri

- Tushunarli holat nomlari (`waiting_name` vs `s1`)
- Global trigger'lar uchun `/cancel`, `/start`
- Holat diagrammasini oldindan rejalashtiring

### ❌ Noto'g'ri

- Juda ko'p holat yaratmang
- Holatni yangilashni unutmang
- Bo'sh holatda qoldirib qo'ymang

## State vs Variable

| State | Variable |
|-------|----------|
| Holat (bosqich) | Ma'lumot |
| Doimiy saqlanadi | Session davomida |
| Trigger'lar uchun | Hisoblash uchun |

## Keyingi

{% content-ref url="for-loop.md" %}
[for-loop.md](for-loop.md)
{% endcontent-ref %}
