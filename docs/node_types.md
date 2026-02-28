# Node Turlari — Bot Constructor Panel

> **Manzil:** `src/features/bot-constructor/nodes/`
> **Texnologiya:** React Flow (ReactFlow) — har bir node `NodeProps` interfeysi orqali ishlaydi.

---

## Umumiy tushunchalar: Source va Target Handle'lar

ReactFlow'da node'lar bir-biriga **edge** (chiziq) orqali ulanadi. Ulanish nuqtalari **handle** deyiladi:

| Handle turi                  | Joylashuvi                  | Vazifasi                                                   |
| ---------------------------- | --------------------------- | ---------------------------------------------------------- |
| **Target** (`type="target"`) | Node tepasida (top)         | Kiruvchi ulanish — bu node boshqa node'dan signal _oladi_  |
| **Source** (`type="source"`) | Node pastasida yoki o'ngida | Chiquvchi ulanish — bu node boshqa node'ga signal _beradi_ |

**Qoida:** Ko'pchilik node'larda:

- 1 ta **Target** → yuqori qismida (biror node'dan keyin ishga tushadi)
- 1 ta **Source** → quyi qismida (keyingi node'ga o'tadi)

Maxsus node'larda (If, CheckMembership va h.k.) bir nechta **Source** bo'ladi — har bir shart uchun alohida chiqish yo'li.

---

## 1. TRIGGERS (Triggerlar)

> **Manzil:** `nodes/triggers/`
>
> Triggerlar **xabar oqimini boshlovchi** node'lardir. Ular foydalanuvchi yoki tizimning harakatiga reaksiya sifatida botning ssenariyini ishga tushiradi.
>
> **Handles pattern:** `Target` (tepada) + `Source` (pastda)
>
> **Nima uchun shunday?** Triggerlar ham biror oldingi holat (masalan, `State` node) orqali kelishi mumkin. Shuning uchun ularda ham **Target** handle mavjud. Triggerdan keyin keyingi harakatga o'tish uchun esa **Source** handle kerak.

---

### 1.1 `CommandTriggerNode` — Buyruq Triggeri

**Fayl:** `triggers/CommandTrigger/CommandTriggerNode.tsx`

**Nima qiladi?**
Foydalanuvchi botga `/start`, `/help` yoki boshqa buyruq yozganida ishlaydi. Buyruq matni `/` belgisisiz saqlanadi.

**Konfiguratsiya:**

- `command` — buyruq matni (masalan: `start`, `menu`)
- `withArgs` — deep linking argumentlarini ushlash (masalan: `/start ref123`)
- `global` — har qanday holatda ham ishlashini bildiradi

**Handles:**

| Handle | Turi     | Pozitsiya | ID               | Nima uchun?                                      |
| ------ | -------- | --------- | ---------------- | ------------------------------------------------ |
| Target | `target` | Top       | `target-handler` | Oldingi node'dan keyin ham ishlatilishi mumkin   |
| Source | `source` | Bottom    | `source-handler` | Buyruq qabul qilinganda keyingi action'ga o'tadi |

---

### 1.2 `MessageTriggerNode` — Xabar Triggeri

**Fayl:** `triggers/MessageTrigger/MessageTrigger.tsx`

**Nima qiladi?**
Foydalanuvchi har xil turdagi xabar yuborganda ishlaydi: matn, rasm, video, hujjat, joylashuv, kontakt, ovoz va h.k. Tur va filtr tanlash orqali aniq xabar turini tutish mumkin.

**Konfiguratsiya:**

- `type` — xabar turi (`text`, `photo`, `video`, `audio`, `document`, `location`, `contact`, `voice`, `video_note`, `sticker`, va h.k. yoki `any`)
- `filter` — qo'shimcha filtr (masalan: `equals`, `contains`, `regex`)
- `context.value` / `context.radius` / `context.size` — filtr uchun parametrlar
- `global` — har qanday holatda ham ishlashini bildiradi

**Handles:**

| Handle            | Turi     | Pozitsiya | ID                    | Nima uchun?                                          |
| ----------------- | -------- | --------- | --------------------- | ---------------------------------------------------- |
| Target            | `target` | Top       | `target-handler`      | Oldingi node'dan keyin ham kelib tushishi mumkin     |
| ElseMessageSource | `source` | Right     | `else-message-source` | Xabar shart bilan mos kelmasa, "else" yo'lga chiqadi |
| Source            | `source` | Bottom    | `source-handler`      | Xabar shart bilan mos kelsa, keyingi node'ga o'tadi  |

---

### 1.3 `CallbackQueryTriggerNode` — Callback Tugma Triggeri

**Fayl:** `triggers/CallbackQueryTrigger/CallbackQueryTrigger.tsx`

**Nima qiladi?**
Foydalanuvchi inline (callback) tugmani bosganda ishlaydi. Oldingi node'dagi inline keyboard'dagi tugmalarni "aqlli" tarzda aniqlaydi — ulanish bo'lsa tugmalar ro'yxatidan tanlanadi, bo'lmasa qo'lda kiritiladi. Collection (dinamik) tugmalarni ham qo'llab-quvvatlaydi.

**Konfiguratsiya:**

- `filter` — `any`, `equals`, `regex`, `collection`
- `context.value` — filtr qiymati yoki callback data
- `global` — global handler

**Handles:**

| Handle            | Turi     | Pozitsiya | ID                    | Nima uchun?                                                                |
| ----------------- | -------- | --------- | --------------------- | -------------------------------------------------------------------------- |
| Target            | `target` | Top       | `target-handler`      | Oldingi node'dan keyin (masalan xabar yuborgandan so'ng callback kutiladi) |
| ElseMessageSource | `source` | Right     | `else-message-source` | Callback mos kelmasa, "else" yo'lga chiqadi                                |
| Source            | `source` | Bottom    | `source-handler`      | Callback mos kelsa, keyingi node'ga o'tadi                                 |

---

### 1.4 `ReplyButtonTriggerNode` — Reply Tugma Triggeri

**Fayl:** `triggers/ReplyButtonTrigger/ReplyButtonTrigger.tsx`

**Nima qiladi?**
Foydalanuvchi reply keyboard tugmasini bosganda ishlaydi. Oldingi node'ning `keyboard.reply` maydonidagi tugmalar ro'yxatidan tanlanadi. Bir nechta tugmani bir vaqtda tinglash mumkin.

**Konfiguratsiya:**

- `selectedButtons` — tanlangan reply tugmalar ro'yxati
- `catchNoButton` — hech qanday tugma bosilmagan xabarni ham tutib olish
- `global` — global handler

**Handles:**

| Handle | Turi     | Pozitsiya | ID               | Nima uchun?                              |
| ------ | -------- | --------- | ---------------- | ---------------------------------------- |
| Target | `target` | Top       | `target-handler` | Oldingi xabar node'idan tugmalar olinadi |
| Source | `source` | Bottom    | `source-handler` | Tugma bosilganda keyingi node'ga o'tadi  |

---

### 1.5 `CronTriggerNode` — Jadval (Cron) Triggeri

**Fayl:** `triggers/CronTriggerNode/CronTriggerNode.tsx`

**Nima qiladi?**
Belgilangan vaqtda (daily, weekly, monthly, yearly) avtomatik ishga tushadi. Cron expression formatida saqlanadi (`min hour day month dayOfWeek`).

**Konfiguratsiya:**

- `schedule` — cron expression (masalan: `0 9 * * *` — har kuni ertalab soat 9:00)

**Handles:**

| Handle | Turi     | Pozitsiya | ID               | Nima uchun?                                               |
| ------ | -------- | --------- | ---------------- | --------------------------------------------------------- |
| Source | `source` | Bottom    | `source-handler` | Belgilangan vaqt kelganda keyingi node'ni ishga tushiradi |

> ⚠️ `CronTriggerNode`da **Target** handle yo'q — chunki u faqat vaqt bo'yicha mustaqil ishga tushadi, biror boshqa node'ga bog'liq emas.

---

## 2. ACTIONS — Matn va Media (Text & Media)

> **Manzil:** `nodes/actions/`
>
> Action node'lar **bot harakatlarini bajaradi** — foydalanuvchiga xabar yuborish, media jo'natish va h.k.
>
> **Handles pattern:** `Target` (tepada) + optionally `SelectedMessageTarget` + `Source` (pastda)
>
> **Nima uchun shunday?** Action node'lar ketma-ket ishlaydi: oldingi node'dan signal keladi (Target), amal bajariladi, keyingi node'ga o'tiladi (Source). `SelectedMessageTarget` — `EditMessageNode` yoki `DeleteMessageNode` kabi node'lar muayyan xabarni "nishonga olish" imkonini beradi.

---

### 2.1 `SendTextMessageNode` — Matn Xabari Yuborish

**Fayl:** `actions/TextMessageNode/TextMessageNode.tsx`

**Nima qiladi?**
Foydalanuvchiga yoki belgilangan chat'ga matnli xabar yuboradi. Dinamik xabarlar (kolleksiyadan ma'lumot), tugmalar (inline/reply keyboard) va parse mode qo'llab-quvvatlanadi.

**Konfiguratsiya:**

- `recipients` — qabul qiluvchi (jo'natuvchiga yoki custom ID'ga)
- `messageText` — xabar matni (template `{{variable}}` sintaksisini qo'llab-quvvatlaydi)
- `dynamicMessages` — kolleksiyadan dinamik ma'lumot
- `keyboard` — inline yoki reply keyboard konfiguratsiyasi
- `parseMode` — `HTML` yoki `None`
- `disableNotification`, `protectContent` — qo'shimcha sozlamalar

**Handles:**

| Handle                | Turi     | Pozitsiya | ID                        | Nima uchun?                                       |
| --------------------- | -------- | --------- | ------------------------- | ------------------------------------------------- |
| Target                | `target` | Top       | `target-handler`          | Oldingi node'dan keladi                           |
| SelectedMessageTarget | `target` | Top       | `selected-message-target` | `EditMessageNode`dan "nishonga" olinishi uchun    |
| Source                | `source` | Bottom    | `source-handler`          | Xabar jo'natilgandan keyin keyingi node'ga o'tadi |

---

### 2.2 `SendPhotoNode` — Rasm Yuborish

**Fayl:** `actions/PhotoMessageNode/PhotoMessageNode.tsx`

**Nima qiladi?**
Foydalanuvchiga rasm yuboradi. Manbasi: `file_id`, URL, yoki kompyuterdan yuklash (drag & drop qo'llab-quvvatlanadi).

**Konfiguratsiya:**

- `photoSourceType` — `file_id` | `url` | `upload`
- `photoFileId` / `photoUrl` / `uploadedFileUuid` — manba ma'lumoti
- `caption` — rasm sarlavhasi (maks. 1024 belgi)
- `keyboard`, `recipients`, `parseMode`, `disableNotification`, `protectContent`

**Handles:** `Target` (top) + `SelectedMessageTarget` (top) + `Source` (bottom)

---

### 2.3 `SendVideoNode` — Video Yuborish

**Fayl:** `actions/VideoMessageNode/`

**Nima qiladi?** Video yuboradi (`file_id`, URL yoki yuklash orqali). Caption, thumbnail va boshqa Telegram video parametrlari qo'llab-quvvatlanadi.

**Handles:** `Target` (top) + `SelectedMessageTarget` (top) + `Source` (bottom)

---

### 2.4 `SendAudioNode` — Audio Yuborish

**Fayl:** `actions/AudioMessageNode/`

**Nima qiladi?** Audio fayl (musiqa) yuboradi. Ijrochi, nomi va davomiylik belgilanishi mumkin.

**Handles:** `Target` (top) + `SelectedMessageTarget` (top) + `Source` (bottom)

---

### 2.5 `SendFileNode` — Fayl/Hujjat Yuborish

**Fayl:** `actions/FileMessageNode/`

**Nima qiladi?** Ixtiyoriy faylni (PDF, ZIP, DOCX va h.k.) hujjat sifatida yuboradi.

**Handles:** `Target` (top) + `SelectedMessageTarget` (top) + `Source` (bottom)

---

### 2.6 `SendAnimationNode` — Animatsiya (GIF) Yuborish

**Fayl:** `actions/AnimationNode/`

**Nima qiladi?** GIF animatsiyasini yuboradi.

**Handles:** `Target` (top) + `Source` (bottom)

---

### 2.7 `SendVoiceNode` — Ovozli Xabar Yuborish

**Fayl:** `actions/VoiceNode/`

**Nima qiladi?** Ovozli xabar `.ogg` formatida yuboradi.

**Handles:** `Target` (top) + `Source` (bottom)

---

### 2.8 `SendVideoNoteNode` — Dumaloq Video Yuborish

**Fayl:** `actions/VideoNoteNode/`

**Nima qiladi?** Telegram'ning dumaloq video xabarini (video note) yuboradi.

**Handles:** `Target` (top) + `Source` (bottom)

---

### 2.9 `SendLocationNode` — Joylashuv Yuborish

**Fayl:** `actions/LocationNode/`

**Nima qiladi?** Geografik joylashuvni (kenglik va uzunlik koordinatalari bilan) yuboradi.

**Handles:** `Target` (top) + `Source` (bottom)

---

### 2.10 `SendContactNode` — Kontakt Yuborish

**Fayl:** `actions/ContactNode/`

**Nima qiladi?** Telefon raqami va ismi bilan kontakt kartasini yuboradi.

**Handles:** `Target` (top) + `Source` (bottom)

---

### 2.11 `SendPollNode` — So'rovnoma Yuborish

**Fayl:** `actions/PollNode/`

**Nima qiladi?** Telegram so'rovnomasini (poll) yuboradi. Anonymous yoki ochiq, bir yoki ko'p javobli formatlar qo'llab-quvvatlanadi.

**Handles:** `Target` (top) + `Source` (bottom)

---

### 2.12 `SendStickerNode` — Stiker Yuborish

**Fayl:** `actions/StickerNode/`

**Nima qiladi?** Telegram stikerini `file_id` orqali yuboradi.

**Handles:** `Target` (top) + `Source` (bottom)

---

### 2.13 `SendMediaGroupNode` — Media Guruh Yuborish

**Fayl:** `actions/MediaGroupNode/`

**Nima qiladi?** Bir vaqtda bir nechta rasm yoki videodan iborat media albomini yuboradi.

**Handles:** `Target` (top) + `Source` (bottom)

---

### 2.14 `SendDiceNode` — Kubik (Dice) Yuborish

**Fayl:** `actions/DiceNode/`

**Nima qiladi?** Telegram'ning animatsiyali kubik yoki boshqa o'yin elementlarini (🎲, 🎯, 🏀, ⚽, 🎳, 🎰) yuboradi.

**Handles:** `Target` (top) + `Source` (bottom)

---

## 3. ACTIONS — Xabar Operatsiyalari (Message Operations)

> **Nima uchun alohida guruh?** Bu node'lar yangi xabar _yuborish_ emas, balki _mavjud_ xabarlar ustida — tahrirlash, o'chirish, pin qilish va boshqarish kabi amallar bajaradi.

---

### 3.1 `EditMessageNode` — Xabarni Tahrirlash

**Fayl:** `actions/EditMessageNode/EditMessageNode.tsx`

**Nima qiladi?** Botning avvalgi yuborgan xabarini tahrirlaydi. Ota-ona node turiga qarab (matn, rasm, video) mos shakl ko'rsatiladi.

**Konfiguratsiya:**

- `messageIdSource` — `this_message` | `connected_node` | `message_id`
- `messageId` — aniq xabar ID kiritish
- `keyboard` — yangi inline keyboard

**Handles:**

| Handle            | Turi     | Pozitsiya | ID                    | Nima uchun?                                                 |
| ----------------- | -------- | --------- | --------------------- | ----------------------------------------------------------- |
| Target            | `target` | Top       | `target-handler`      | Oldingi node'dan keladi                                     |
| Source            | `source` | Bottom    | `source-handler`      | Tahrirlash tugagach keyingi node'ga o'tadi                  |
| EditMessageSource | `source` | Right     | `edit-message-source` | Tahrirlash kerak bo'lgan xabar node'iga ko'rsatgich chiqadi |

---

### 3.2 `ForwardMessageNode` — Xabarni Yo'naltirish

**Fayl:** `actions/ForwardMessageNode/`

**Nima qiladi?** Kontekstdagi xabarni boshqa chat'ga forward qiladi.

**Handles:** `Target` (top) + `Source` (bottom)

---

### 3.3 `SendToAdminNode` — Adminga Yuborish

**Fayl:** `actions/SendToAdminNode/`

**Nima qiladi?** Foydalanuvchi xabarini yoki maxsus ma'lumotni bot administratoriga yuboradi. Foydalanuvchidan tushgan murojaat yoki shikoyatlarni qayta ishlash uchun ishlatiladi.

**Handles:** `Target` (top) + `Source` (bottom)

---

### 3.4 `CopyMessageNode` — Xabarni Nusxalash

**Fayl:** `actions/CopyMessageNode/`

**Nima qiladi?** Xabarni boshqa chat'ga _nusxalaydi_ (forward'dan farqi: "forwarded from" belgisi ko'rsatilmaydi).

**Handles:** `Target` (top) + `Source` (bottom)

---

### 3.5 `PinMessageNode` — Xabarni Pinlash

**Fayl:** `actions/PinMessageNode/`

**Nima qiladi?** Belgilangan xabarni chat'da pin qiladi.

**Handles:** `Target` (top) + `Source` (bottom)

---

### 3.6 `UnpinMessageNode` — Pinni Olib Tashlash

**Fayl:** `actions/UnpinMessageNode/`

**Nima qiladi?** Pinlangan xabarni yoki barcha pinlarni olib tashlaydi.

**Handles:** `Target` (top) + `Source` (bottom)

---

### 3.7 `DeleteMessageNode` — Xabarni O'chirish

**Fayl:** `actions/DeleteMessageNode/DeleteMessageNode.tsx`

**Nima qiladi?** Belgilangan xabarni o'chiradi. Ikkita rejim mavjud:

- `deleteFromContext` — kontekstdagi (oxirgi) xabarni o'chiradi
- Edge orqali aniq xabar node'iga ulanib o'chirish

**Handles:**

| Handle              | Turi     | Pozitsiya | ID                      | Nima uchun?                               |
| ------------------- | -------- | --------- | ----------------------- | ----------------------------------------- |
| Target              | `target` | Top       | `target-handler`        | Oldingi node'dan keladi                   |
| DeleteMessageSource | `source` | Right     | `delete-message-source` | O'chiriladigan xabar node'iga ko'rsatgich |
| Source              | `source` | Bottom    | `source-handler`        | O'chirishdan so'ng keyingi node'ga o'tadi |

---

### 3.8 `ChatActionNode` — Chat Harakati

**Fayl:** `actions/ChatActionNode/`

**Nima qiladi?** "Yozmoqda...", "Rasm yuklayapti..." kabi chat holat ko'rsatkichlarini yuboradi. Bot javob tayyorlayotganini bildirish uchun ishlatiladi.

**Handles:** `Target` (top) + `Source` (bottom)

---

### 3.9 `DownloadFileNode` — Faylni Yuklab Olish

**Fayl:** `actions/DownloadFileNode/`

**Nima qiladi?** Foydalanuvchi yuborgan faylni (hujjat, rasm va h.k.) bot serveriga yuklab oladi va fayl ma'lumotlarini kontekstga saqlaydi.

**Handles:** `Target` (top) + `Source` (bottom)

---

## 4. CUSTOM NODES — Kod va Ma'lumotlar

> **Manzil:** `nodes/custom/`
>
> Bu node'lar botning **ichki logikasi** uchun: ma'lumot saqlash, to'planma bilan ishlash va maxsus skriptlar.

---

### 4.1 `StateNode` — Holat (State) Saqlash

**Fayl:** `custom/StateNode/StateNode.tsx`

**Nima qiladi?** Foydalanuvchi yuborgan ma'lumotni (matn, fayl, joylashuv va h.k.) kalit-qiymat juftlik sifatida bot kontekstiga saqlaydi. Keyingi node'larda `{{state_key}}` orqali foydalaniladi. Ota-ona node turiga qarab mavjud `type`lar ro'yxati dinamik o'zgaradi.

**Konfiguratsiya:**

- `key` — state kaliti (masalan: `user_name`, `selected_item`)
- `type` — ma'lumot turi (ota-ona node'dan avtomatik aniqlanadi: `text`, `photo`, `location` va h.k.) yoki `Custom`

**Handles:** `Target` (top) + `Source` (bottom)

---

### 4.2 `CollectionNode` — To'planmaga Yozish

**Fayl:** `custom/CollectionNode/CollectionNode.tsx`

**Nima qiladi?** Foydalanuvchi ma'lumotlarini (state'lardan olingan) ma'lumotlar bazasidagi kolleksiyaga (jadval) yozadi. Har bir kolleksiya maydoni uchun qaysi state key'dan ma'lumot olish kerakligi belgilanadi.

**Konfiguratsiya:**

- `collection_name` — maqsad kolleksiya
- `fieldMappings` — kolleksiya maydoni → state key xaritasi

**Handles:** `Target` (top) + `Source` (bottom)

---

### 4.3 `LoadCollectionItemNode` — To'planmadan Element Yuklash

**Fayl:** `custom/LoadCollectionItemNode/LoadCollectionItemNode.tsx`

**Nima qiladi?** Kolleksiyadan filtr asosida bir element topadi va uning ma'lumotlarini kontekstga yuklaydi. `{{collection_key_fieldname}}` sintaksisi orqali keyingi node'larda foydalaniladi.

**Konfiguratsiya:**

- `collection` — manbaa kolleksiya
- `contextKey` — kontekst uchun prefiks kalit
- `filters` — qidiruv filtrlari (state key'lar orqali)

**Handles:**

| Handle             | Turi     | Pozitsiya | ID               | Nima uchun?                                  |
| ------------------ | -------- | --------- | ---------------- | -------------------------------------------- |
| Target             | `target` | Top       | `target-handler` | Oldingi node'dan keladi                      |
| Source (found)     | `source` | Bottom    | `found`          | Element topilsa, bu yo'ldan ketadi (yashil)  |
| Source (not_found) | `source` | Bottom    | `not_found`      | Element topilmasa, bu yo'ldan ketadi (qizil) |

---

### 4.4 `CustomCodeNode` — Maxsus JavaScript Skript

**Fayl:** `custom/CustomCodeNode/CustomCodeNode.tsx`

**Nima qiladi?** JavaScript kodi yozish imkonini beradi. `message`, `user`, `state` global o'zgaruvchilariga kirish mumkin. Murakkab mantiqni amalga oshirish uchun ishlatiladi.

**Konfiguratsiya:**

- `jsCode` — JavaScript kodi matni

**Handles:**

| Handle | Turi     | Pozitsiya | ID         | Nima uchun?                               |
| ------ | -------- | --------- | ---------- | ----------------------------------------- |
| Target | `target` | Top       | (standart) | Oldingi node'dan keladi                   |
| Source | `source` | Bottom    | (standart) | Skript bajarilgach keyingi node'ga o'tadi |

---

## 5. CUSTOM NODES — Oqimni Boshqarish (Flow Control)

> Bu node'lar botning **qarorlar qabul qilishi va oqimini nazorat qilishi** uchun.

---

### 5.1 `IfConditionNode` — Shartli Tarmoqlanish (If)

**Fayl:** `custom/ConditionNode/ConditionNode.tsx`

**Nima qiladi?** Bir yoki bir nechta shartni tekshiradi va natijaga qarab ikki yo'ldan biri bo'yicha ketadi: shart bajarilsa `true`, bajarilmasa `next` (ElseIf/Else yo'li).

**Konfiguratsiya:**

- `operator` — `AND` (barcha shartlar) | `OR` (birorta shart)
- `conditions[]` — shart ro'yxati: `variable`, `operator` (`equals`, `contains`, `greater_than`, `exists` va h.k.), `value`
- `mode` — `simple` | `advanced` (bir nechta branch)

**Handles:**

| Handle        | Turi     | Pozitsiya | ID               | Nima uchun?                                      |
| ------------- | -------- | --------- | ---------------- | ------------------------------------------------ |
| Target        | `target` | Top       | `target-handler` | Shart tekshirishga keladi                        |
| Source (true) | `source` | Bottom    | `true`           | Shart bajarilsa, pastdan ketadi                  |
| Source (next) | `source` | Right     | `next`           | Shart bajarilmasa, o'ngdan ElseIf/Else ga o'tadi |

---

### 5.2 `ElseIfNode` — Qo'shimcha Shart (Else If)

**Fayl:** `custom/ElseIfNode/ElseIfNode.tsx`

**Nima qiladi?** `IfConditionNode`dan `next` yo'li orqali keladi va yangi shartni tekshiradi. `If → ElseIf → ElseIf → Else` zanjiri qurish imkonini beradi.

**Konfiguratsiya:** `IfConditionNode`ga o'xshash — `operator`, `conditions[]`

**Handles:**

| Handle        | Turi     | Pozitsiya | ID               | Nima uchun?                                              |
| ------------- | -------- | --------- | ---------------- | -------------------------------------------------------- |
| Target        | `target` | Left      | `target-handler` | `If` yoki oldingi `ElseIf`ning `next` chiqishidan keladi |
| Source (true) | `source` | Bottom    | `true`           | Bu shart bajarilsa, pastdan ketadi                       |
| Source (next) | `source` | Right     | `next`           | Bu shart ham bajarilmasa, o'ngdan keyingi ElseIf/Else ga |

> **Muhim:** `ElseIfNode`ning Target handle'i **chap tomonda (Left)** — bu `If` → `ElseIf` zanjirini gorizontal chizishni osonlashtiradi.

---

### 5.3 `ElseNode` — Asosiy Shart Bajarilmasa (Else)

**Fayl:** `custom/ElseNode/ElseNode.tsx`

**Nima qiladi?** Barcha `If` va `ElseIf` shartlari bajarilmagan holda doim ishga tushadi. Zanjirning so'nggi bo'g'ini.

**Handles:**

| Handle        | Turi     | Pozitsiya | ID               | Nima uchun?                                             |
| ------------- | -------- | --------- | ---------------- | ------------------------------------------------------- |
| Target        | `target` | Left      | `target-handler` | `If` yoki oxirgi `ElseIf`ning `next` chiqishidan keladi |
| Source (true) | `source` | Bottom    | `true`           | Doim bajariladi va pastdan ketadi                       |

---

### 5.4 `DelayNode` — Kutish (Delay)

**Fayl:** `custom/DelayNode/DelayNode.tsx`

**Nima qiladi?** Oqimni belgilangan vaqt (1–300 soniya) to'xtatadi. Masalan, xabar yuborishdan oldin "Yozmoqda..." ko'rsatish uchun.

**Konfiguratsiya:**

- `seconds` — kutish vaqti soniyalarda (maks. 300)

**Handles:** `Target` (top) + `Source` (bottom)

---

### 5.5 `RandomNode` — Tasodifiy Tarmoqlanish

**Fayl:** `custom/RandomNode/RandomNode.tsx`

**Nima qiladi?** Bir nechta chiqish yo'lidan birini tasodifiy tanlaydi. A/B testing yoki turli variantli javoblar uchun ishlatiladi. Tugmalar (keyboard) orqali variantlar soni belgilanadi.

**Handles:** `Target` (top) + bir nechta `Source` (bottom, keyboard callback'lar orqali)

---

### 5.6 `VariableNode` — O'zgaruvchi Boshqarish

**Fayl:** `custom/VariableNode/VariableNode.tsx`

**Nima qiladi?** Kontekstdagi o'zgaruvchi ustida amal bajaradi: o'rnatish, qo'shish, ayirish, ro'yxatga element qo'shish/olib tashlash, o'chirish, toggle qilish, JSON parse qilish.

**Konfiguratsiya:**

- `operation` — `set` | `increment` | `decrement` | `append` | `remove` | `delete` | `toggle` | `parse_json`
- `variableName` — o'zgaruvchi nomi
- `value` — yangi qiymat (ba'zi operatsiyalar uchun)

**Handles:** `Target` (top) + `Source` (bottom)

---

### 5.7 `CheckMembershipNode` — A'zolikni Tekshirish

**Fayl:** `custom/CheckMembershipNode/CheckMembershipNode.tsx`

**Nima qiladi?** Foydalanuvchi ko'rsatilgan kanal yoki guruhlarga a'zo ekanligini tekshiradi. Majburiy obuna tizimini qurish uchun ishlatiladi.

**Konfiguratsiya:**

- `channels[]` — kanal/guruh ro'yxati
- `inputType` — `username` | `id`

**Handles:**

| Handle              | Turi     | Pozitsiya | ID               | Nima uchun?                                      |
| ------------------- | -------- | --------- | ---------------- | ------------------------------------------------ |
| Target              | `target` | Top       | `target-handler` | Tekshirishga keladi                              |
| Source (is-member)  | `source` | Bottom    | `is-member`      | Barcha kanallarga a'zo bo'lsa (yashil)           |
| Source (not-member) | `source` | Bottom    | `not-member`     | Hech bo'lmasa bittasiga a'zo emas bo'lsa (qizil) |

---

### 5.8 `FormNode` — Forma (Anketа)

**Fayl:** `custom/FormNode/FormNode.tsx`

**Nima qiladi?** Foydalanuvchidan ketma-ket bir nechta ma'lumot to'playdi. Har bir element (maydon) tartib bo'yicha so'raladi va javobi state'ga saqlanadi. Drag & Drop orqali tartibni o'zgartirish mumkin.

**Konfiguratsiya:**

- `items[]` — forma elementlari ro'yxati (har birida: nomi, turi, tartibi, tugma matni va h.k.)

**Handles:** `Target` (top) + `Source` (bottom)

---

## 6. CUSTOM NODES — Integratsiyalar

> Tashqi tizimlar va Telegram API bilan to'g'ridan-to'g'ri ishlash uchun.

---

### 6.1 `HTTPRequestNode` — HTTP So'rov

**Fayl:** `custom/HTTPRequestNode/HTTPRequestNode.tsx`

**Nima qiladi?** Tashqi API'ga HTTP so'rov yuboradi va javobni kontekstga saqlaydi. REST API integratsiyalari uchun ishlatiladi.

**Konfiguratsiya:**

- `method` — `GET` | `POST` | `PUT` | `DELETE` | `PATCH`
- `url` — endpoint (template o'zgaruvchilarni qo'llab-quvvatlaydi)
- `headers` — JSON formatida header'lar (masalan: `Authorization`)
- `body` — so'rov tanasi (POST, PUT, PATCH uchun)
- `responseVariable` — javob saqlanadigan o'zgaruvchi nomi
- `timeout` — so'rov muddati (soniyalarda)
- `storeHeaders` — response header'larini ham saqlash

**Handles:** `Target` (top) + `Source` (bottom)

---

### 6.2 `CallbackQueryAnswerNode` — Callback Javob Berish

**Fayl:** `custom/CallbackAnswerNode/CallbackAnswerNode.tsx`

**Nima qiladi?** Foydalanuvchi inline tugmani bosgandan keyin Telegram'ga majburiy "answer" (javob) yuboradi. Bu tugmaning "loading" holatini to'xtatadi. Yangi keyboard ham sozlanishi mumkin.

**Konfiguratsiya:**

- `keyboard` — yangi inline keyboard (ixtiyoriy)

**Handles:** `Target` (top) + `Source` (bottom)

---

## Xulosa: Node'lar Kategoriyalari

```
nodes/
├── triggers/           # Bot oqimini boshlash
│   ├── CommandTrigger       → /start, /help, ...
│   ├── MessageTrigger       → xabar turlari
│   ├── CallbackQueryTrigger → inline tugma bosish
│   ├── ReplyButtonTrigger   → reply keyboard
│   └── CronTriggerNode      → vaqt jadval
│
├── actions/            # Bot harakatlari (yuborish)
│   ├── TextMessageNode      → matn
│   ├── PhotoMessageNode     → rasm
│   ├── VideoMessageNode     → video
│   ├── AudioMessageNode     → audio
│   ├── FileMessageNode      → fayl/hujjat
│   ├── AnimationNode        → GIF
│   ├── VoiceNode            → ovozli xabar
│   ├── VideoNoteNode        → dumaloq video
│   ├── LocationNode         → joylashuv
│   ├── ContactNode          → kontakt
│   ├── PollNode             → so'rovnoma
│   ├── StickerNode          → stiker
│   ├── MediaGroupNode       → media albom
│   ├── DiceNode             → kubik/o'yin
│   ├── EditMessageNode      → xabar tahrirlash
│   ├── ForwardMessageNode   → xabar yo'naltirish
│   ├── SendToAdminNode      → adminga yuborish
│   ├── CopyMessageNode      → xabar nusxalash
│   ├── PinMessageNode       → xabar pinlash
│   ├── UnpinMessageNode     → pin olib tashlash
│   ├── DeleteMessageNode    → xabar o'chirish
│   ├── ChatActionNode       → typing indicator
│   └── DownloadFileNode     → faylni serverga yuklash
│
└── custom/             # Ichki mantiq va integratsiya
    ├── StateNode            → ma'lumot saqlash
    ├── CollectionNode       → DB'ga yozish
    ├── LoadCollectionItemNode → DB'dan o'qish
    ├── CustomCodeNode       → JS skript
    ├── ConditionNode        → if shart
    ├── ElseIfNode           → else if
    ├── ElseNode             → else
    ├── DelayNode            → kutish
    ├── RandomNode           → tasodifiy tarmoq
    ├── VariableNode         → o'zgaruvchi boshqarish
    ├── CheckMembershipNode  → a'zolik tekshirish
    ├── FormNode             → anketa to'ldirish
    ├── HTTPRequestNode      → tashqi API
    └── CallbackAnswerNode   → callback javob
```

---

## Source/Target Handle'lar Umumiy Qoidasi

```
┌─────────────────────┐
│   ● Target (top)    │  ← Oldingi node'dan signal keladi
│                     │
│    NODE CONTENT     │
│                     │
│   ● Source (bot)    │  → Keyingi node'ga signal ketadi
└─────────────────────┘
```

**Maxsus handle'lar:**

- `ElseMessageSource` (o'ngda) — shart bajarilmagan holatda
- `EditMessageSource` (o'ngda) — tahrirlanadigan xabar node'iga ko'rsatgich
- `DeleteMessageSource` (o'ngda) — o'chiriladigan xabar node'iga ko'rsatgich
- `SelectedMessageTarget` (tepada) — `EditMessageNode` tomonidan nishonga olinuvchi xabar uchun
- Ko'p `Source` (pastda, turli ID'lar) — `CheckMembershipNode` (`is-member`/`not-member`), `LoadCollectionItemNode` (`found`/`not_found`), `IfConditionNode` (`true`/`next`)
