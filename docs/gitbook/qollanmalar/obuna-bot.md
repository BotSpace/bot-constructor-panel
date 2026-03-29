# Kanal obuna tekshirish

**Daraja:** 🟡 O'rta
**Vaqt:** 15 daqiqa

## Natija

Bot foydalanuvchining kanalga obuna bo'lganini tekshiradi. Obuna bo'lmagan foydalanuvchilarga kontent ko'rsatilmaydi.

## Kerakli node'lar

- Command Trigger
- Check Membership
- If node
- Text Message (tugmalar bilan)
- Callback Query Trigger

## Qadam 1: /start

**Command Trigger:**
- Command: `start`
- Global: ✅

## Qadam 2: Obuna tekshirish

**Check Membership** node:

- **Chat ID**: `@your_channel` yoki `-1001234567890`
- **User ID**: `{{user.id}}`

Bu node ikki chiqishga ega:
- **Member** — obuna bo'lgan
- **Not Member** — obuna bo'lmagan

## Qadam 3: Obuna bo'lmagan

**Text Message** (Not Member yo'lida):

```
⚠️ Avval kanalimizga obuna bo'ling!

👇 Obuna bo'lgandan keyin "Tekshirish" tugmasini bosing.
```

**Inline Keyboard:**
| Matn | Callback/URL |
|------|--------------|
| 📢 Kanalga o'tish | URL: `https://t.me/your_channel` |
| ✅ Tekshirish | Callback: `check_sub` |

## Qadam 4: Qayta tekshirish

**Callback Query Trigger:**
- Filter: `equals`
- Value: `check_sub`

→ **Callback Answer** (bo'sh)

→ **Check Membership** (qayta tekshirish)

**If Member:**
→ **Edit Message**:
```
✅ Rahmat! Endi botdan foydalanishingiz mumkin.
```
→ Asosiy menu

**If Not Member:**
→ **Callback Answer**:
- Text: "Siz hali obuna bo'lmagansiz!"
- Show alert: ✅

(Xabar o'zgarmaydi)

## Qadam 5: Obuna bo'lgan

**Text Message** (Member yo'lida):

```
Salom, {{user.first_name}}! 👋

Botga xush kelibsiz!
```

(Asosiy menu tugmalari)

## Oqim sxemasi

```
       /start
          │
          ▼
  ┌───────────────┐
  │Check Membership│
  │ @your_channel │
  └───────┬───────┘
          │
    ┌─────┴─────┐
    │           │
 Member    Not Member
    │           │
    ▼           ▼
┌───────┐  ┌────────────┐
│Salom! │  │"Obuna bo'l"│
│Menu...│  │[Kanal]     │
└───────┘  │[Tekshirish]│
           └─────┬──────┘
                 │
                 ▼ check_sub
           ┌────────────┐
           │Check again │
           └─────┬──────┘
                 │
           ┌─────┴─────┐
           │           │
        Member    Not Member
           │           │
           ▼           ▼
       ┌───────┐  ┌───────┐
       │"OK!"  │  │Alert: │
       │Menu...│  │"Hali  │
       └───────┘  │ yo'q" │
                  └───────┘
```

## Bir nechta kanal

Bir nechta kanalga obunani tekshirish:

### Custom Code bilan

```python
import requests

BOT_TOKEN = get_var("bot.token")
user_id = get_var("user.id")
channels = ["@channel1", "@channel2", "@channel3"]

all_subscribed = True
not_subscribed = []

for channel in channels:
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/getChatMember"
    data = {"chat_id": channel, "user_id": user_id}
    response = requests.post(url, json=data).json()
    
    if response.get("ok"):
        status = response["result"]["status"]
        if status not in ["member", "administrator", "creator"]:
            all_subscribed = False
            not_subscribed.append(channel)
    else:
        all_subscribed = False
        not_subscribed.append(channel)

set_var("all_subscribed", all_subscribed)
set_var("not_subscribed", not_subscribed)
```

### If node

```
If: var.all_subscribed == true
```

## Eslatmalar

{% hint style="warning" %}
Bot kanalda **admin** bo'lishi kerak (kamida "See members" huquqi bilan).
{% endhint %}

{% hint style="info" %}
Foydalanuvchi guruhga qo'shilganda "left" status bo'lishi mumkin — "member" yoki "administrator" tekshiring.
{% endhint %}

## Keyingi

{% content-ref url="http-bot.md" %}
[http-bot.md](http-bot.md)
{% endcontent-ref %}
