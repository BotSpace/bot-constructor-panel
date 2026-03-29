# Python asoslari

Custom Code'da Python tilining asosiy tushunchalarini o'rganamiz.

## O'zgaruvchilar

```python
# Matn (string)
name = "Jamshid"
greeting = 'Salom'

# Raqam (integer)
age = 25
count = 100

# O'nlik son (float)
price = 99.99
discount = 0.1

# Mantiqiy (boolean)
is_active = True
is_admin = False

# Ro'yxat (list)
fruits = ["olma", "nok", "uzum"]
numbers = [1, 2, 3, 4, 5]

# Lug'at (dictionary)
user = {
    "name": "Jamshid",
    "age": 25,
    "city": "Toshkent"
}
```

## Operatorlar

### Matematik

```python
a = 10
b = 3

print(a + b)   # 13 — qo'shish
print(a - b)   # 7 — ayirish
print(a * b)   # 30 — ko'paytirish
print(a / b)   # 3.33 — bo'lish
print(a // b)  # 3 — butun bo'lish
print(a % b)   # 1 — qoldiq
print(a ** b)  # 1000 — daraja
```

### Taqqoslash

```python
a = 10
b = 5

print(a == b)  # False — teng
print(a != b)  # True — teng emas
print(a > b)   # True — katta
print(a < b)   # False — kichik
print(a >= b)  # True — katta yoki teng
print(a <= b)  # False — kichik yoki teng
```

### Mantiqiy

```python
x = True
y = False

print(x and y)  # False — va
print(x or y)   # True — yoki
print(not x)    # False — emas
```

## Shartlar (if/else)

```python
age = 18

if age >= 18:
    print("Katta yoshli")
elif age >= 13:
    print("O'smir")
else:
    print("Bola")
```

## Tsikllar

### for tsikli

```python
# Ro'yxat bo'ylab
fruits = ["olma", "nok", "uzum"]
for fruit in fruits:
    print(fruit)

# Raqamlar oralig'i
for i in range(5):  # 0, 1, 2, 3, 4
    print(i)

# Boshlang'ich va oxirgi
for i in range(1, 6):  # 1, 2, 3, 4, 5
    print(i)
```

### while tsikli

```python
count = 0
while count < 5:
    print(count)
    count += 1
```

## Funksiyalar

```python
# Oddiy funksiya
def greet(name):
    return f"Salom, {name}!"

result = greet("Jamshid")  # "Salom, Jamshid!"

# Default parametr
def power(base, exp=2):
    return base ** exp

print(power(3))     # 9
print(power(3, 3))  # 27

# Ko'p qiymat qaytarish
def get_stats(numbers):
    total = sum(numbers)
    avg = total / len(numbers)
    return total, avg

s, a = get_stats([1, 2, 3, 4, 5])
```

## Matn (String) metodlari

```python
text = "Salom Dunyo"

# Uzunlik
print(len(text))  # 11

# Katta/kichik harf
print(text.upper())  # "SALOM DUNYO"
print(text.lower())  # "salom dunyo"

# Qidirish
print(text.find("Dunyo"))  # 6
print("Dunyo" in text)     # True

# Almashtirish
print(text.replace("Dunyo", "Python"))  # "Salom Python"

# Bo'lish
words = text.split()  # ["Salom", "Dunyo"]

# Birlashtirish
print("-".join(words))  # "Salom-Dunyo"

# Bosh/oxir bo'sh joy
text2 = "  salom  "
print(text2.strip())  # "salom"
```

## Ro'yxat (List) metodlari

```python
fruits = ["olma", "nok", "uzum"]

# Element qo'shish
fruits.append("anor")  # Oxiriga
fruits.insert(0, "banan")  # Boshiga

# Element o'chirish
fruits.remove("nok")  # Qiymat bo'yicha
del fruits[0]  # Indeks bo'yicha
last = fruits.pop()  # Oxirgisini olish va o'chirish

# Saralash
fruits.sort()  # Alifbo bo'yicha
fruits.reverse()  # Teskari

# Uzunlik
print(len(fruits))

# Tekshirish
print("olma" in fruits)  # True
```

## Lug'at (Dictionary) metodlari

```python
user = {
    "name": "Jamshid",
    "age": 25
}

# Qiymat olish
print(user["name"])  # "Jamshid"
print(user.get("email", "Yo'q"))  # "Yo'q" (default)

# Qiymat o'rnatish
user["email"] = "jamshid@example.com"
user["age"] = 26

# O'chirish
del user["age"]

# Kalitlar va qiymatlar
print(user.keys())    # dict_keys(['name', 'email'])
print(user.values())  # dict_values(['Jamshid', 'jamshid@example.com'])

# Tsikl
for key, value in user.items():
    print(f"{key}: {value}")
```

## Try/Except

```python
try:
    result = 10 / 0
except ZeroDivisionError:
    result = 0
    print("Nolga bo'lish mumkin emas!")
except Exception as e:
    print(f"Xatolik: {e}")
finally:
    print("Har doim bajariladi")
```

## Keyingi

{% content-ref url="bot-api.md" %}
[bot-api.md](bot-api.md)
{% endcontent-ref %}
