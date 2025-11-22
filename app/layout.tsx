import type { Metadata } from 'next';
import './globals.css';
import LanguageProvider from '@/components/LanguageProvider';

export const metadata: Metadata = {
  title: 'Mystery Full - بازی‌های دورهمی',
  description: 'انتخاب تصادفی بازی‌های دورهمی برای شما و دوستانتان',
  themeColor: '#6c5ce7',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Mystery Full',
  },
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/icon-192.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#6c5ce7" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="animated-bg min-h-screen" suppressHydrationWarning>
        <div className="particles" />
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
