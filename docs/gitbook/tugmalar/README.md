# Tugmalar

Telegram botlarida **tugmalar** — foydalanuvchi bilan muloqotning asosiy vositasi.

## Tugma turlari

### Inline tugmalar

Xabar ichida joylashgan tugmalar:

```
┌─────────────────────────┐
│     Xabar matni         │
├─────────────┬───────────┤
│  Tugma 1    │  Tugma 2  │
└─────────────┴───────────┘
```

**Xususiyatlari:**
- Xabar ostida ko'rinadi
- Callback data yuboradi
- URL ochishi mumkin
- Xabar bilan birga tahrir/o'chiriladi

### Reply tugmalar

Klaviatura o'rnida ko'rinadigan tugmalar:

```
┌───────────────────────────────┐
│         Tugma 1               │
├───────────────────────────────┤
│    Tugma 2    │    Tugma 3    │
└───────────────────────────────┘
```

**Xususiyatlari:**
- Klaviatura o'rnida
- Tugma matnini xabar sifatida yuboradi
- Kontakt/joylashuv so'rashi mumkin
- Alohida o'chiriladi

## Bo'lim tarkibi

| Sahifa | Tavsif |
|--------|--------|
| [Inline tugmalar](inline-tugmalar.md) | Callback tugmalar |
| [Reply tugmalar](reply-tugmalar.md) | Klaviatura tugmalar |
| [Dinamik tugmalar](dinamik-tugmalar.md) | Kolleksiyadan tugmalar |

## Qaysi tugmani tanlash?

| Vaziyat | Tugma turi |
|---------|------------|
| Menyu navigatsiya | Reply |
| Tanlov (bir martali) | Inline |
| URL havola | Inline |
| Kontakt so'rash | Reply |
| Joylashuv so'rash | Reply |
| Inline xabarni yangilash | Inline |
| Doimiy menyu | Reply |

## Keyingi

{% content-ref url="inline-tugmalar.md" %}
[inline-tugmalar.md](inline-tugmalar.md)
{% endcontent-ref %}
