# API bilan ishlaydigan bot

**Daraja:** 🔴 Murakkab
**Vaqt:** 30 daqiqa

## Natija

Tashqi API'dan ma'lumot olib ko'rsatadigan bot (ob-havo misoli).

## Kerakli node'lar

- Command Trigger
- HTTP Request
- If node
- Text Message
- Custom Code (ixtiyoriy)

## Qadam 1: API tanlash

Bu misolda **OpenWeatherMap** API ishlatamiz.

1. https://openweathermap.org/api ga o'ting
2. Ro'yxatdan o'ting
3. API kalitini oling

## Qadam 2: /weather buyrug'i

**Command Trigger:**
- Command: `weather`
- With args: ✅ (shahar nomini olish uchun)

## Qadam 3: Argumentni tekshirish

**If** node:
- Variable: `{{trigger.args}}`
- Operator: `is_not_empty`

### Argument yo'q

**Text Message:**
```
❌ Shahar nomini kiriting!

Masalan: /weather Tashkent
```

## Qadam 4: HTTP Request

**True** yo'lida:

**HTTP Request** node:
- **URL**: `https://api.openweathermap.org/data/2.5/weather?q={{trigger.args}}&appid=YOUR_API_KEY&units=metric&lang=uz`
- **Method**: GET
- **Response Variable**: `weather_data`

## Qadam 5: Javobni tekshirish

**If** node:
- Variable: `{{var.weather_data.cod}}`
- Operator: `==`
- Value: `200`

### Muvaffaqiyatli

**Text Message:**
```
🌤️ {{var.weather_data.name}} ob-havosi

🌡️ Harorat: {{var.weather_data.main.temp}}°C
💨 Shamol: {{var.weather_data.wind.speed}} m/s
💧 Namlik: {{var.weather_data.main.humidity}}%
☁️ Holat: {{var.weather_data.weather.0.description}}
```

### Xatolik

**Text Message:**
```
❌ "{{trigger.args}}" shahri topilmadi.

Iltimos, boshqa nom bilan urinib ko'ring.
```

## Oqim sxemasi

```
    /weather {city}
          │
          ▼
    ┌───────────┐
    │ If: args  │
    │ not empty │
    └─────┬─────┘
          │
    ┌─────┴─────┐
    │           │
  True       False
    │           │
    ▼           ▼
┌─────────┐  ┌─────────┐
│HTTP Req │  │"Shahar  │
│OpenWeath│  │ kirit!" │
└────┬────┘  └─────────┘
     │
     ▼
┌─────────┐
│If: cod  │
│  ==200  │
└────┬────┘
     │
┌────┴────┐
│         │
True    False
│         │
▼         ▼
┌─────┐  ┌─────┐
│Ob-  │  │"Top- │
│havo │  │ilmadi"│
│info │  │     │
└─────┘  └─────┘
```

## Custom Code bilan

Murakkab ma'lumotlarni qayta ishlash:

```python
import requests

city = get_var("trigger.args")
api_key = "YOUR_API_KEY"

if not city:
    set_var("error", "Shahar kiritilmagan")
else:
    url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&appid={api_key}&units=metric&lang=uz"
    
    try:
        response = requests.get(url, timeout=10)
        data = response.json()
        
        if data.get("cod") == 200:
            weather_text = f"""
🌤️ {data['name']} ob-havosi

🌡️ Harorat: {data['main']['temp']}°C
🤒 His qilinadi: {data['main']['feels_like']}°C
💨 Shamol: {data['wind']['speed']} m/s
💧 Namlik: {data['main']['humidity']}%
☁️ Holat: {data['weather'][0]['description'].capitalize()}
🌅 Quyosh chiqishi: {datetime.fromtimestamp(data['sys']['sunrise']).strftime('%H:%M')}
🌇 Quyosh botishi: {datetime.fromtimestamp(data['sys']['sunset']).strftime('%H:%M')}
            """
            set_var("weather_text", weather_text.strip())
            set_var("success", True)
        else:
            set_var("error", f"'{city}' topilmadi")
            set_var("success", False)
    except Exception as e:
        set_var("error", str(e))
        set_var("success", False)
```

## Boshqa API misollar

### Valyuta kursi

```python
response = requests.get("https://cbu.uz/oz/arkhiv-kursov-valyut/json/")
data = response.json()

usd = next((c for c in data if c["Ccy"] == "USD"), None)
if usd:
    set_var("usd_rate", usd["Rate"])
```

### Random iqtibos

```python
response = requests.get("https://api.quotable.io/random")
data = response.json()

quote = f'"{data["content"]}"\n\n— {data["author"]}'
set_var("quote", quote)
```

### Rasm generatsiya (Unsplash)

```python
access_key = "YOUR_UNSPLASH_KEY"
query = get_var("var.search_query")

url = f"https://api.unsplash.com/photos/random?query={query}&client_id={access_key}"
response = requests.get(url)
data = response.json()

set_var("image_url", data["urls"]["regular"])
```

## Eng yaxshi amaliyotlar

### ✅ To'g'ri

- API kalitlarini xavfsiz saqlang
- Timeout o'rnating
- Xatoliklarni ushlang
- Rate limit'larga rioya qiling

### ❌ Noto'g'ri

- API kalitlarini ochiq yozmang
- Xatolik tekshirmasdan davom etish
- Juda ko'p so'rov yuborish
