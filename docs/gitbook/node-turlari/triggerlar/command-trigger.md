# Command Trigger

Foydalanuvchi `/start`, `/help` yoki boshqa buyruq yuborganda ishlaydi.

## Asosiy ma'lumot

| Xususiyat | Qiymat |
|-----------|--------|
| **Kategoriya** | Trigger |
| **Fayl** | `CommandTrigger/CommandTriggerNode.tsx` |
| **Handle'lar** | Target (tepa), Source (past) |

## Ko'rinishi

```
       ○ Target
┌─────────────────┐
│    /command     │
│  Command Trigger│
└────────┬────────┘
         ○ Source
```

## Xususiyatlar

### Command (Buyruq)

Buyruq matni. `/` belgisisiz yoziladi.

| Qiymat | Ishlaydi |
|--------|----------|
| `start` | `/start` |
| `help` | `/help` |
| `menu` | `/menu` |

{% hint style="warning" %}
Buyruq faqat kichik lotin harflari, raqamlar va pastki chiziqdan iborat bo'lishi kerak.
{% endhint %}

### With Args (Argumentlar bilan)

Deep linking argumentlarini ushlash uchun.

```
/start ref123 → args = "ref123"
/start promo_code_ABC → args = "promo_code_ABC"
```

**Ishlatish:**
```
{{trigger.args}}
```

{% hint style="tip" %}
Bu reklama kampaniyalari va referral tizimlar uchun foydali.
{% endhint %}

### Global

| Qiymat | Ishlash |
|--------|---------|
| ❌ O'chirilgan | Faqat joriy State'da |
| ✅ Yoqilgan | Har qanday State'da |

**Global kerak bo'lganda:**
- `/cancel` — istalgan joyda bekor qilish
- `/help` — istalgan joyda yordam
- `/start` — istalgan joyda qayta boshlash

## Misollar

### Oddiy /start

```
┌─────────────────┐
│    /start       │
│  Command Trigger│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Salom! Men     │
│  botman 🤖      │
└─────────────────┘
```

**Sozlamalar:**
- Command: `start`
- Global: ✅

### Referral bilan /start

```
┌─────────────────┐
│    /start       │
│  (with args)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   If: args      │
│   not empty     │
├────────┬────────┤
   Yes      No
    │       │
    ▼       ▼
┌───────┐ ┌───────┐
│Referral│ │Oddiy  │
│ salom  │ │salom  │
└────────┘ └───────┘
```

**Sozlamalar:**
- Command: `start`
- With args: ✅

### Menu buyrug'i

```
┌─────────────────┐
│    /menu        │
│  Command Trigger│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Menu tanlang:  │
│  [Mahsulotlar]  │
│  [Buyurtmalar]  │
│  [Yordam]       │
└─────────────────┘
```

## O'zgaruvchilar

Command Trigger ishlaganda quyidagi o'zgaruvchilar mavjud:

| O'zgaruvchi | Tavsif |
|-------------|--------|
| `{{trigger.command}}` | Buyruq matni |
| `{{trigger.args}}` | Argumentlar (agar bor bo'lsa) |
| `{{user.id}}` | Foydalanuvchi ID |
| `{{user.first_name}}` | Foydalanuvchi ismi |
| `{{message.id}}` | Xabar ID |

## Eng yaxshi amaliyotlar

### ✅ To'g'ri

- `/start` — global qilib qo'ying
- `/cancel` — global qilib qo'ying
- `/help` — global qilib qo'ying
- Buyruqlarni qisqa va tushunarli qiling

### ❌ Noto'g'ri

- Juda ko'p buyruqlar yaratmang (foydalanuvchi eslay olmaydi)
- Murakkab so'zlar ishlatmang
- Bir xil nomli ikki buyruq yaratmang

## Keyingi

{% content-ref url="message-trigger.md" %}
[message-trigger.md](message-trigger.md)
{% endcontent-ref %}
