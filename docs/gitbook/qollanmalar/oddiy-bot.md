# Oddiy savol-javob bot

**Daraja:** 🟢 Oson
**Vaqt:** 10 daqiqa

## Natija

Bot quyidagi buyruqlarga javob beradi:
- `/start` — Salomlashish
- `/help` — Yordam
- `/about` — Bot haqida

## Kerakli node'lar

- Command Trigger (3 ta)
- Text Message (3 ta)

## Qadam 1: /start

### Command Trigger qo'shish

1. Chap paneldan **Command Trigger** ni canvas'ga sudrang
2. O'ng panelda sozlang:
   - **Command**: `start`
   - **Global**: ✅

### Text Message qo'shish

1. **Text Message** node'ini qo'shing
2. Sozlamalar:
   - **Text**:
   ```
   Salom, {{user.first_name}}! 👋
   
   Men sizning yordamchingizman.
   
   /help — Yordam
   /about — Bot haqida
   ```

### Ulash

Command Trigger → Text Message

## Qadam 2: /help

### Command Trigger

- **Command**: `help`
- **Global**: ✅

### Text Message

```
📚 Yordam

Bu bot quyidagi imkoniyatlarga ega:

1. Savollarga javob berish
2. Ma'lumot berish
3. Yordam ko'rsatish

Savollaringiz bo'lsa, yozing!
```

### Ulash

Command Trigger → Text Message

## Qadam 3: /about

### Command Trigger

- **Command**: `about`
- **Global**: ✅

### Text Message

```
ℹ️ Bot haqida

Bu bot Bot Constructor Panel yordamida yaratilgan.

Versiya: 1.0
Yaratuvchi: @your_username

📧 Aloqa: support@example.com
```

## Oqim sxemasi

```
┌─────────────┐     ┌─────────────────────────┐
│   /start    │────▶│ Salom, {{user.name}}!   │
└─────────────┘     └─────────────────────────┘

┌─────────────┐     ┌─────────────────────────┐
│    /help    │────▶│ 📚 Yordam...            │
└─────────────┘     └─────────────────────────┘

┌─────────────┐     ┌─────────────────────────┐
│   /about    │────▶│ ℹ️ Bot haqida...        │
└─────────────┘     └─────────────────────────┘
```

## Qadam 4: Saqlash va sinash

1. **Ctrl+S** bosing (saqlash)
2. Telegram'da botingizni oching
3. `/start` yuboring

## Kengaytirish

### Inline tugmalar qo'shish

/start xabariga tugmalar:

```
┌───────────┬───────────┐
│   Yordam  │  Haqida   │
└───────────┴───────────┘
```

Keyin Callback Query Trigger qo'shing.

### Reply keyboard

Doimiy menyu:

```
┌───────────────────────────┐
│         📚 Yordam         │
├───────────────────────────┤
│        ℹ️ Haqida          │
└───────────────────────────┘
```

## Keyingi

{% content-ref url="menu-bot.md" %}
[menu-bot.md](menu-bot.md)
{% endcontent-ref %}
