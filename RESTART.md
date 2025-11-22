# راهنمای رفع مشکل 404

اگر با خطاهای 404 مواجه شدید، این مراحل را انجام دهید:

## 1. متوقف کردن سرور
در ترمینال که سرور در حال اجرا است، `Ctrl+C` را بزنید.

## 2. پاک کردن Cache
```bash
# در PowerShell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue

# یا در CMD
rmdir /s /q .next
```

## 3. Restart سرور
```bash
npm run dev
```

## 4. Hard Refresh مرورگر
- Windows/Linux: `Ctrl + Shift + R` یا `Ctrl + F5`
- Mac: `Cmd + Shift + R`

اگر هنوز مشکل دارید، مراحل زیر را انجام دهید:

## 5. پاک کردن node_modules و نصب مجدد (در صورت نیاز)
```bash
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm install
npm run dev
```

## نکته مهم
بعد از هر تغییر در ساختار فایل‌ها یا routing، حتماً:
1. سرور را restart کنید
2. Cache را پاک کنید
3. Hard refresh کنید

