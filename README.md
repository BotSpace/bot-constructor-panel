# Telegram Bot Constructor

Vizual drag-and-drop interfeysi bilan Telegram botlarini yaratish uchun professional constructor dasturi.

## 🚀 Xususiyatlar

- **Vizual Bot Builder**: React Flow yordamida drag-and-drop interfeysi
- **Node-based Architecture**: Triggerlar, amallar va maxsus mantiq bloklari
- **Real-time Preview**: Bot logikasini real vaqtda ko'rish
- **Multi-language Support**: O'zbek, Rus, Ingliz va Yapon tillari
- **Modern Tech Stack**: Next.js 15, React 19, TypeScript, Tailwind CSS

## 🏗️ Loyiha Strukturasi

```
src/
├── components/          # Qayta ishlatiladigan komponentlar
│   ├── ui/             # Shadcn/ui komponentlari
│   ├── common/         # Umumiy komponentlar
│   ├── forms/          # Form komponentlari
│   └── layout/         # Layout komponentlari
├── features/           # Feature-based modullar
│   ├── auth/           # Autentifikatsiya
│   ├── bot-constructor/ # Bot constructor
│   ├── projects/       # Loyiha boshqaruvi
│   └── collections/    # Kolleksiyalar
├── lib/                # Utility funksiyalar
├── hooks/              # Custom React hook'lar
├── services/           # API xizmatlari
├── types/              # TypeScript tiplari
└── styles/             # CSS stillari
```

## 🛠️ Texnologiyalar

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Shadcn/ui
- **State Management**: Zustand
- **Flow Builder**: React Flow
- **Authentication**: NextAuth.js
- **Internationalization**: next-intl
- **Code Editor**: Monaco Editor

## 📦 O'rnatish

```bash
# Dependencies o'rnatish
npm install

# Development server ishga tushirish
npm run dev

# Production build
npm run build
```

## 🎯 Asosiy Komponentlar

### Bot Constructor

- **Trigger Nodes**: Xabar, buyruq, tugma bosish hodisalari
- **Action Nodes**: Matn, rasm, video, audio, fayl yuborish
- **Custom Code**: Python kodi yozish imkoniyati

### Node Types

- **MessageTriggerNode**: Xabar kelganda
- **CommandTriggerNode**: Buyruq kelganda
- **ReplyButtonTriggerNode**: Javob tugmasi bosilganda
- **CallbackQueryTriggerNode**: Inline tugma bosilganda

## 🔧 Development

```bash
# Linting
npm run lint

# Type checking
npm run type-check

# Project analysis
node scripts/analyze-project.js
```

## 📝 Best Practices

1. **Feature-based Architecture**: Har bir feature o'z papkasida
2. **Component Composition**: Kichik, qayta ishlatiladigan komponentlar
3. **Type Safety**: Barcha joyda TypeScript ishlatish
4. **Consistent Naming**: PascalCase komponentlar, camelCase funksiyalar
5. **Clean Imports**: Absolute path'lar ishlatish

## 🤝 Contributing

1. Fork qiling
2. Feature branch yarating (`git checkout -b feature/amazing-feature`)
3. O'zgarishlarni commit qiling (`git commit -m 'Add amazing feature'`)
4. Branch'ni push qiling (`git push origin feature/amazing-feature`)
5. Pull Request yarating

## 📄 License

Bu loyiha MIT litsenziyasi ostida tarqatiladi.
