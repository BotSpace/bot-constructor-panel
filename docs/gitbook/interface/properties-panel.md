# Properties panel

O'ng paneldagi xususiyatlar paneli — tanlangan node'ni sozlash joyi.

## Panelni ochish

1. Canvas'da biror node'ni tanlang
2. O'ng panel avtomatik ochiladi
3. Yoki `]` tugmasini bosing

{% hint style="info" %}
Hech narsa tanlanmagan bo'lsa, panel yashirin yoki bo'sh bo'ladi.
{% endhint %}

## Panel tuzilishi

```
┌─────────────────────────┐
│  Node turi va ikonkasi  │
├─────────────────────────┤
│  Umumiy sozlamalar      │
│  - Nom                  │
│  - Izoh                 │
├─────────────────────────┤
│  Node-ga xos sozlamalar │
│  - Matn                 │
│  - Tugmalar             │
│  - va h.k.              │
├─────────────────────────┤
│  Kengaytirilgan         │
│  - Parse mode           │
│  - Reply settings       │
└─────────────────────────┘
```

## Umumiy xususiyatlar

Barcha node'larda mavjud:

### Nom (Name)

Node'ning identifikatori. Boshqa joylarda havola qilish uchun ishlatiladi.

```
Masalan: my_welcome_message
```

{% hint style="tip" %}
Nom **inglizcha** va **pastki chiziq** bilan yozilsa yaxshi: `user_greeting`, `check_subscription`
{% endhint %}

### Izoh (Note)

Shaxsiy eslatma. Faqat constructor'da ko'rinadi, botda ishlatilmaydi.

```
Masalan: Bu xabar foydalanuvchi birinchi marta kelganda ko'rinadi
```

## Node-ga xos xususiyatlar

Har bir node turining o'ziga xos sozlamalari bor.

### Text Message misoli

| Xususiyat | Tavsif |
|-----------|--------|
| **Text** | Yuboriladigan matn |
| **Parse mode** | `HTML`, `Markdown`, `MarkdownV2` |
| **Disable web preview** | Havola oldindan ko'rinishini o'chirish |
| **Disable notification** | Ovozli bildirishnomani o'chirish |
| **Reply to message** | Qaysi xabarga javob sifatida |
| **Keyboard** | Tugmalar qo'shish |

### Command Trigger misoli

| Xususiyat | Tavsif |
|-----------|--------|
| **Command** | Buyruq matni (`start`, `help`) |
| **With args** | Argumentlarni qabul qilish |
| **Global** | Har qanday holatda ishlash |

### If Node misoli

| Xususiyat | Tavsif |
|-----------|--------|
| **Condition** | Shart ifodasi |
| **Variable** | Tekshiriladigan o'zgaruvchi |
| **Operator** | `==`, `!=`, `>`, `<`, `contains` |
| **Value** | Taqqoslanadigan qiymat |

## Dinamik qiymatlar

Ko'pchilik matn maydonlarida **o'zgaruvchilarni** ishlatishingiz mumkin:

```
Salom, {{user.first_name}}!
Sizning ID: {{user.id}}
```

### Mavjud o'zgaruvchilar

| O'zgaruvchi | Tavsif |
|-------------|--------|
| `{{user.id}}` | Foydalanuvchi ID |
| `{{user.first_name}}` | Ism |
| `{{user.last_name}}` | Familiya |
| `{{user.username}}` | Username |
| `{{message.text}}` | Xabar matni |
| `{{message.id}}` | Xabar ID |
| `{{chat.id}}` | Chat ID |

{% hint style="info" %}
To'liq ro'yxat: [O'zgaruvchilar](../custom-code/ozgaruvchilar.md)
{% endhint %}

## Tugmalar sozlash

Aksariyat xabar node'larida tugmalar qo'shish mumkin:

### Inline tugmalar

```
┌─────────┬─────────┐
│ Tugma 1 │ Tugma 2 │
└─────────┴─────────┘
```

- Xabar ichida ko'rinadi
- Callback data bilan ishlaydi
- URL havola ochishi mumkin

### Reply tugmalar

```
┌─────────────────────┐
│      Tugma 1        │
├─────────────────────┤
│      Tugma 2        │
└─────────────────────┘
```

- Klaviatura o'rnida ko'rinadi
- Foydalanuvchi bosganda matn yuboriladi

## Kengaytirilgan sozlamalar

Ba'zi node'larda **"Advanced"** yoki **"Kengaytirilgan"** bo'limi bor:

- **Protect content** — xabarni nusxalashni taqiqlash
- **Message thread ID** — forum mavzusiga yuborish
- **Business connection ID** — biznes hisob uchun

## Keyingi

{% content-ref url="klaviatura.md" %}
[klaviatura.md](klaviatura.md)
{% endcontent-ref %}
