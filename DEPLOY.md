# 🚀 راهنمای کامل استقرار روی Vercel

این راهنما به شما کمک می‌کند پروژه را به صورت کامل روی Vercel استقرار دهید.

---

## 📋 پیش‌نیازها

1. ✅ حساب کاربری Vercel (رایگان)
2. ✅ حساب کاربری GitHub (برای push کردن کد)
3. ✅ Git نصب شده روی سیستم شما

---

## 🔧 مرحله ۱: آماده‌سازی پروژه محلی

### ۱.۱. اطمینان از Commit شدن تغییرات

```bash
# بررسی وضعیت فایل‌ها
git status

# اضافه کردن تمام فایل‌ها
git add .

# Commit کردن تغییرات
git commit -m "آماده‌سازی برای استقرار روی Vercel"
```

### ۱.۲. Push به GitHub

```bash
# اگر repository از قبل وجود دارد
git push origin main

# یا اگر repository جدید است
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

---

## 🗄️ مرحله ۲: راه‌اندازی دیتابیس PostgreSQL

### گزینه ۱: استفاده از Prisma Postgres (پیشنهادی ⭐)

**چرا Prisma Postgres؟**
- ✅ بهینه‌شده برای Prisma (یکپارچگی بهتر)
- ✅ Instant Serverless (راه‌اندازی سریع‌تر)
- ✅ بدون نیاز به تنظیمات اضافی
- ✅ مناسب برای پروژه‌های Prisma

**مراحل:**

1. وارد [Vercel Dashboard](https://vercel.com/dashboard) شوید
2. روی پروژه خود کلیک کنید (یا یک پروژه جدید بسازید)
3. به بخش **Storage** بروید
4. روی **Create Database** کلیک کنید
5. **Prisma Postgres** را انتخاب کنید (گزینه "Instant Serverless Postgres")
6. یک نام برای دیتابیس انتخاب کنید (مثلاً `mystery-full-db`)
7. Region را انتخاب کنید (پیشنهاد: `Washington, D.C. (US East)` برای سرعت بهتر)
8. روی **Create** کلیک کنید

**نکته مهم:** بعد از ایجاد دیتابیس، Vercel به صورت خودکار متغیر محیطی `DATABASE_URL` را تنظیم می‌کند. نیازی به تنظیم دستی نیست!

**گزینه جایگزین:** اگر "Prisma Postgres" در دسترس نبود، می‌توانید از **Postgres** معمولی هم استفاده کنید (همان کار را می‌کند).

### گزینه ۲: استفاده از سرویس‌های دیگر (Neon, Supabase)

اگر می‌خواهید از سرویس دیگری استفاده کنید:

1. یک حساب کاربری در [Neon](https://neon.tech) یا [Supabase](https://supabase.com) بسازید
2. یک دیتابیس PostgreSQL جدید ایجاد کنید
3. Connection String را کپی کنید
4. در مرحله بعد (تنظیم Environment Variables) از این URL استفاده کنید

---

## 🌐 مرحله ۳: استقرار روی Vercel

### ۳.۱. Import پروژه

1. وارد [Vercel Dashboard](https://vercel.com/dashboard) شوید
2. روی **Add New...** → **Project** کلیک کنید
3. Repository خود را از GitHub انتخاب کنید
4. روی **Import** کلیک کنید

### ۳.۲. تنظیمات Build

Vercel به صورت خودکار تنظیمات زیر را تشخیص می‌دهد:
- **Framework Preset:** Next.js
- **Build Command:** `prisma generate && prisma migrate deploy && next build` (از `vercel.json` خوانده می‌شود)
- **Output Directory:** `.next` (خودکار)
- **Install Command:** `npm install` (خودکار)

**نکته:** اگر تنظیمات به درستی تشخیص داده نشد، به صورت دستی وارد کنید:
- Build Command: `prisma generate && prisma migrate deploy && next build`

### ۳.۳. تنظیم Environment Variables

اگر از **Prisma Postgres** استفاده می‌کنید:
- ✅ `PRISMA_DATABASE_URL` به صورت خودکار تنظیم می‌شود (بعد از Connect کردن دیتابیس)
- ✅ `DATABASE_URL` و `POSTGRES_URL` هم ممکن است تنظیم شوند
- پروژه از `PRISMA_DATABASE_URL` استفاده می‌کند (بهینه‌تر برای Prisma Accelerate)

**مهم:** بعد از Connect کردن دیتابیس، بررسی کنید که `PRISMA_DATABASE_URL` در Environment Variables وجود دارد:
1. پروژه → Settings → Environment Variables
2. باید `PRISMA_DATABASE_URL` را ببینید
3. اگر وجود ندارد، دستی اضافه کنید:
   - **Name:** `PRISMA_DATABASE_URL`
   - **Value:** Connection String از Prisma Dashboard (شروع می‌شود با `prisma+postgres://`)
   - **Environment:** Production, Preview, Development (همه را انتخاب کنید)

**نکته:** اگر `PRISMA_DATABASE_URL` وجود ندارد، می‌توانید از `DATABASE_URL` یا `POSTGRES_URL` هم استفاده کنید (اما `PRISMA_DATABASE_URL` بهینه‌تر است).

### ۳.۴. Deploy

1. روی **Deploy** کلیک کنید
2. منتظر بمانید تا Build کامل شود (معمولاً ۲-۵ دقیقه)

---

## 🎯 مرحله ۴: اجرای Migration و Seed

بعد از اولین Deploy موفق، باید Migration ها را اجرا کنید و دیتابیس را Seed کنید.

### ۴.۱. اجرای Migration

Migration ها به صورت خودکار در Build اجرا می‌شوند (`prisma migrate deploy` در Build Command).

اما اگر مشکلی پیش آمد، می‌توانید از Vercel CLI استفاده کنید:

```bash
# نصب Vercel CLI
npm i -g vercel

# Login
vercel login

# Link کردن پروژه
vercel link

# اجرای Migration
vercel env pull .env.local
npx prisma migrate deploy
```

### ۴.۲. Seed کردن دیتابیس (اضافه کردن بازی‌ها)

برای Seed کردن دیتابیس، می‌توانید از یکی از روش‌های زیر استفاده کنید:

#### روش ۱: استفاده از Vercel CLI

```bash
# دریافت Environment Variables
vercel env pull .env.local

# اجرای Seed
npm run prisma:seed
```

#### روش ۲: استفاده از Vercel Functions (پیشنهادی)

یک API Route موقت برای Seed ایجاد کنید:

```typescript
// app/api/admin/seed/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { gamesData } from '@/lib/games-data';

export async function POST(request: NextRequest) {
  // فقط در Development یا با Authentication
  if (process.env.NODE_ENV === 'production') {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.SEED_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    await prisma.game.deleteMany();
    
    for (const game of gamesData) {
      await prisma.game.create({ data: game });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Seeded ${gamesData.length} games` 
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
```

سپس در Vercel Environment Variables:
- `SEED_SECRET` را اضافه کنید (یک رشته تصادفی)

و از Postman یا curl استفاده کنید:
```bash
curl -X POST https://your-app.vercel.app/api/admin/seed \
  -H "Authorization: Bearer YOUR_SEED_SECRET"
```

### ۴.۳. ایجاد کاربر Admin

برای ایجاد کاربر Admin، از Script استفاده کنید:

```bash
# دریافت Environment Variables
vercel env pull .env.local

# اجرای Script
npm run create:admin
```

یا از API Route استفاده کنید (بعد از Seed).

---

## ✅ مرحله ۵: بررسی و تست

### ۵.۱. بررسی URL پروژه

بعد از Deploy موفق، Vercel یک URL به شما می‌دهد:
- Production: `https://your-project.vercel.app`
- Preview: برای هر Pull Request یک URL جداگانه

### ۵.۲. تست عملکرد

1. ✅ باز کردن صفحه اصلی
2. ✅ تست لاگین
3. ✅ تست انتخاب بازی
4. ✅ تست پنل Admin (اگر Admin هستید)
5. ✅ تست API Routes

### ۵.۳. بررسی Logs

در Vercel Dashboard:
1. به بخش **Deployments** بروید
2. روی آخرین Deployment کلیک کنید
3. به بخش **Functions** بروید
4. Logs را بررسی کنید

---

## 🔄 مرحله ۶: به‌روزرسانی‌های بعدی

هر بار که تغییراتی در کد ایجاد می‌کنید:

```bash
# Commit تغییرات
git add .
git commit -m "توضیح تغییرات"

# Push به GitHub
git push origin main
```

Vercel به صورت خودکار:
1. تغییرات را تشخیص می‌دهد
2. Build جدید می‌سازد
3. Deploy می‌کند

---

## 🛠️ عیب‌یابی (Troubleshooting)

### مشکل ۱: Build Fail می‌شود

**علت:** ممکن است Prisma Client Generate نشده باشد

**راه حل:**
- بررسی کنید که `postinstall` script در `package.json` وجود دارد
- بررسی کنید که `vercel.json` Build Command درست است

### مشکل ۲: دیتابیس Connect نمی‌شود

**علت:** `DATABASE_URL` تنظیم نشده یا اشتباه است

**راه حل:**
1. در Vercel Dashboard → Settings → Environment Variables
2. بررسی کنید `DATABASE_URL` وجود دارد
3. اگر از Vercel Postgres استفاده می‌کنید، مطمئن شوید Storage متصل است

### مشکل ۳: Migration اجرا نمی‌شود

**علت:** Migration ها در Build اجرا نمی‌شوند

**راه حل:**
- بررسی کنید Build Command شامل `prisma migrate deploy` است
- یا به صورت دستی از Vercel CLI اجرا کنید

### مشکل ۴: بازی‌ها نمایش داده نمی‌شوند

**علت:** دیتابیس Seed نشده

**راه حل:**
- Seed Script را اجرا کنید (مرحله ۴.۲)

---

## 📝 نکات مهم

1. **Environment Variables:**
   - همیشه `DATABASE_URL` را در Vercel تنظیم کنید
   - هرگز `.env` را به Git Commit نکنید

2. **Database:**
   - Vercel Postgres رایگان است اما محدودیت دارد
   - برای Production بزرگ، از Plan پولی استفاده کنید

3. **Build Time:**
   - اولین Build ممکن است ۵-۱۰ دقیقه طول بکشد
   - Build های بعدی سریع‌تر هستند

4. **Custom Domain:**
   - می‌توانید Domain خود را در Vercel تنظیم کنید
   - Settings → Domains → Add Domain

---

## 🎉 تبریک!

پروژه شما با موفقیت روی Vercel استقرار یافت! 🚀

اگر سوالی دارید یا مشکلی پیش آمد، می‌توانید:
- Logs را در Vercel Dashboard بررسی کنید
- از Vercel Support استفاده کنید
- یا با من تماس بگیرید

---

**آخرین به‌روزرسانی:** $(date)

