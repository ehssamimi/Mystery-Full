# ⚡ راهنمای سریع استقرار روی Vercel

این یک راهنمای خلاصه برای استقرار سریع پروژه روی Vercel است. برای جزئیات بیشتر، به [DEPLOY.md](./DEPLOY.md) مراجعه کنید.

---

## 🚀 مراحل سریع (۵ دقیقه)

### ۱. Push به GitHub
```bash
git add .
git commit -m "آماده برای Vercel"
git push origin main
```

### ۲. ایجاد پروژه در Vercel
1. برو به [vercel.com](https://vercel.com)
2. **Add New Project** → Repository را انتخاب کن
3. **Import** کن

### ۳. اضافه کردن دیتابیس
1. در Vercel Dashboard → **Storage** → **Create Database**
2. **Postgres** را انتخاب کن
3. نام دیتابیس را وارد کن → **Create**
4. ✅ `DATABASE_URL` به صورت خودکار تنظیم می‌شود!

### ۴. Deploy
1. روی **Deploy** کلیک کن
2. منتظر بمان تا Build کامل شود (۲-۵ دقیقه)

### ۵. Seed کردن دیتابیس

بعد از Deploy موفق، یکی از این روش‌ها را استفاده کن:

#### روش ۱: از طریق API (پیشنهادی)

```bash
# ۱. Login کن به عنوان Admin
# ۲. به این URL برو:
https://your-app.vercel.app/api/admin/seed

# یا از curl استفاده کن (بعد از تنظیم SEED_SECRET):
curl -X POST https://your-app.vercel.app/api/admin/seed \
  -H "Authorization: Bearer YOUR_SEED_SECRET"
```

#### روش ۲: از طریق Vercel CLI

```bash
# نصب Vercel CLI
npm i -g vercel

# Login
vercel login

# Link پروژه
vercel link

# دریافت Environment Variables
vercel env pull .env.local

# Seed
npm run prisma:seed
```

### ۶. ایجاد کاربر Admin

```bash
# دریافت Environment Variables
vercel env pull .env.local

# اجرای Script
npm run create:admin
```

---

## ✅ بررسی نهایی

- [ ] پروژه Deploy شده است
- [ ] دیتابیس متصل است
- [ ] بازی‌ها Seed شده‌اند
- [ ] کاربر Admin ایجاد شده است
- [ ] می‌توانی Login کنی
- [ ] می‌توانی بازی انتخاب کنی

---

## 🆘 مشکل داری؟

1. **Build Fail می‌شود؟**
   - بررسی کن که `vercel.json` وجود دارد
   - بررسی کن که `package.json` شامل `postinstall` script است

2. **دیتابیس Connect نمی‌شود؟**
   - بررسی کن که Vercel Postgres متصل است
   - بررسی کن که `DATABASE_URL` در Environment Variables وجود دارد

3. **بازی‌ها نمایش داده نمی‌شوند؟**
   - Seed API را اجرا کن (`/api/admin/seed`)

---

**برای راهنمای کامل:** [DEPLOY.md](./DEPLOY.md)

