# Ko'p so'raladigan savollar

## Umumiy savollar

### Bot Constructor Panel nima?

Bot Constructor Panel — bu Telegram botlarini vizual tarzda, kodlamasdan yaratish imkonini beruvchi platforma. Tayyor bloklarni sudrab-tashlash orqali bot logikasini qurasiz.

### Bepulmi?

Asosiy funksiyalar bepul. Kengaytirilgan imkoniyatlar uchun pullik tariflar mavjud.

### Qaysi tillarni qo'llab-quvvatlaydi?

Interfeys 4 tilda mavjud: O'zbek, Rus, Ingliz, Yapon.

### Mobil qurilmada ishlash mumkinmi?

Hozircha faqat desktop va planshetlarda. Mobil qurilmalar qo'llab-quvvatlanmaydi.

---

## Bot yaratish

### Telegram bot tokenini qanday olaman?

1. Telegram'da [@BotFather](https://t.me/BotFather) ni oching
2. `/newbot` buyrug'ini yuboring
3. Bot nomi va username'ni kiriting
4. Token beriladi

### Bir nechta bot yarata olamanmi?

Ha, cheksiz bot yaratishingiz mumkin.

### Bot ishlamayapti. Nima qilishim kerak?

1. Tokenni tekshiring
2. Oqimni saqlang
3. Trigger mavjudligini tekshiring
4. Brauzer konsolida xatoliklarni ko'ring

---

## Node'lar

### Node qanday qo'shiladi?

Chap paneldan kerakli node'ni canvas'ga sudrab olib tashlang.

### Node'larni qanday ulash mumkin?

Source handle'dan (pastdagi nuqta) Target handle'ga (tepadagi nuqta) torting.

### Node'ni qanday o'chirish mumkin?

Node'ni tanlang va `Delete` yoki `Backspace` bosing.

### Node'ni nusxalash mumkinmi?

Ha, `Ctrl+C` → `Ctrl+V` yoki `Ctrl+D`.

---

## O'zgaruvchilar

### O'zgaruvchi qanday yaratiladi?

**Variable** node ishlatib:
- Name: o'zgaruvchi nomi
- Value: qiymati

### O'zgaruvchini qanday ishlataman?

`{{var.nom}}` formatida matn maydonlarida.

### O'zgaruvchilar qachongacha saqlanadi?

Session o'zgaruvchilari foydalanuvchi sessiyasi davomida.
Doimiy saqlash uchun State yoki Collection ishlating.

---

## Tugmalar

### Inline va Reply tugma orasidagi farq nima?

**Inline:** Xabar ichida, callback yuboradi
**Reply:** Klaviatura o'rnida, matn yuboradi

### Dinamik tugmalar qanday yaratiladi?

Keyboard sozlamalarida Source: Collection tanlang va shablonlarni belgilang.

---

## Kolleksiyalar

### Kolleksiya nima?

Bot ichidagi ma'lumotlar bazasi. Mahsulotlar, foydalanuvchilar kabi ma'lumotlarni saqlash uchun.

### Excel/CSV import qilsa bo'ladimi?

Ha, kolleksiya sahifasida Import funksiyasi mavjud.

---

## Custom Code

### Qaysi dasturlash tilini ishlatish mumkin?

Faqat Python 3.

### Qanday kutubxonalar mavjud?

`requests`, `json`, `datetime`, `re`, `random`, `math`, `hashlib` va boshqalar.

### Timeout bormi?

Ha, 30 soniya. Undan uzun kod ishlamaydi.

---

## Xatoliklar

### "Bot not found" xatosi

Token noto'g'ri yoki eskirgan. Yangi token oling.

### "Chat not found" xatosi

Foydalanuvchi botni bloklagan yoki chat mavjud emas.

### "Bad Request" xatosi

So'rov formati noto'g'ri. Ma'lumotlarni tekshiring.

### "Too Many Requests" xatosi

Telegram rate limit'iga urildi. Kamroq xabar yuboring.

---

## Boshqa

### Loyihani export qilsa bo'ladimi?

Ha, Sozlamalar → Export orqali JSON formatda.

### Bir nechta foydalanuvchi bitta loyihada ishlashi mumkinmi?

Hozircha yo'q. Keyingi versiyalarda rejalashtirilgan.

### API integratsiya qanday qilinadi?

**HTTP Request** node yoki **Custom Code** orqali.

### Webhook qo'llab-quvvatlanadimi?

Ha, HTTP Request node bilan webhook yuborishingiz mumkin.
