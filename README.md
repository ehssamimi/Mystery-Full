# Mystery Full - بازی‌های دورهمی 🎮

یک PWA مدرن برای انتخاب تصادفی بازی‌های دورهمی با Next.js، Prisma و SQLite.

## ویژگی‌ها

- 🎲 انتخاب تصادفی بازی بر اساس تعداد بازیکن
- 🎨 دیزاین بازی‌گونه با تم سرمه تیره و افکت‌های glow
- ✨ انیمیشن‌های جذاب (چرخش، لرزش، انفجار)
- 📱 PWA - قابل نصب و استفاده آفلاین
- 💾 ذخیره بازی‌های موردعلاقه و تاریخچه
- 📊 35+ بازی با قوانین کامل

## نصب و راه‌اندازی

### 1. نصب وابستگی‌ها

```bash
npm install
```

### 2. Setup Prisma

```bash
# Generate Prisma Client
npm run prisma:generate

# Create database and run migrations
npm run prisma:migrate

# Seed database with games
npm run prisma:seed
```

### 3. اجرای پروژه

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

## ساختار پروژه

```
mystery-full/
├── app/                    # Next.js App Router
│   ├── page.tsx           # صفحه اصلی (انتخاب تعداد)
│   ├── games/             # صفحات بازی
│   └── api/               # API routes
├── components/            # کامپوننت‌های React
│   ├── PlayerCountSlider.tsx
│   ├── GameRoulette.tsx
│   ├── ExplosionParticles.tsx
│   └── GameDetails.tsx
├── lib/                   # Utilities
│   ├── games-data.ts      # لیست بازی‌ها
│   ├── prisma.ts
│   └── storage.ts
├── prisma/                # Prisma schema و seed
└── public/                # فایل‌های استاتیک
```

## تکنولوژی‌ها

- **Next.js 14** - React Framework
- **Prisma** - ORM
- **SQLite** - Database
- **Framer Motion** - Animations
- **Tailwind CSS** - Styling
- **TypeScript** - Type Safety

## ویژگی‌های PWA

- ✅ Manifest.json
- ✅ Service Worker (آفلاین)
- ✅ Responsive Design
- ✅ Installable

## توسعه

برای اضافه کردن بازی جدید، فایل `lib/games-data.ts` را ویرایش کنید.

## لایسنس

MIT

