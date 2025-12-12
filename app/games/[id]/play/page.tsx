'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import UserNavbar from '@/components/UserNavbar';
// import QuestionSwiper from '@/components/games/QuestionSwiper';
import WheelOfFortune from '@/components/games/WheelOfFortune';
import { useLanguageStore } from '@/lib/store/language-store';
import { translations } from '@/lib/translations';
import { Game } from '@/types/game';
import { motion } from 'framer-motion';

export default function GamePlayPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const playerCount = parseInt(searchParams.get('players') || '2', 10);
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguageStore();
  const t = translations[language];

  // لیست نمونه سوالات برای تست
  // TODO: می‌توانی این سوالات را از game data یا API بگیر
  // مثال: const questions = game.questions || sampleQuestions;
  // const sampleQuestions = [
  //   'آیا ترجیح می‌دهی یک شب در خانه بمانی یا به مهمانی بروی؟',
  //   'آیا ترجیح می‌دهی پیتزا بخوری یا سوشی؟',
  //   'آیا ترجیح می‌دهی فیلم ببینی یا کتاب بخوانی؟',
  //   'آیا ترجیح می‌دهی به ساحل بروی یا به کوه؟',
  //   'آیا ترجیح می‌دهی صبح زود بیدار شوی یا دیر بخوابی؟',
  //   'آیا ترجیح می‌دهی موسیقی کلاسیک گوش کنی یا راک؟',
  //   'آیا ترجیح می‌دهی قهوه بنوشی یا چای؟',
  //   'آیا ترجیح می‌دهی سفر به اروپا بروی یا آسیا؟',
  //   'آیا ترجیح می‌دهی ورزش کنی یا بازی ویدیویی بازی کنی؟',
  //   'آیا ترجیح می‌دهی حیوان خانگی داشته باشی یا نه؟',
  // ];

  // حروف الفبای فارسی
  const persianAlphabet = [
    'آ', 'ا', 'ب', 'پ', 'ت', 'ث', 'ج', 'چ', 'ح', 'خ',
    'د', 'ذ', 'ر', 'ز', 'ژ', 'س', 'ش', 'ص', 'ض', 'ط',
    'ظ', 'ع', 'غ', 'ف', 'ق', 'ک', 'گ', 'ل', 'م', 'ن',
    'و', 'ه', 'ی'
  ];

  useEffect(() => {
    const fetchGame = async () => {
      try {
        const response = await fetch('/api/games');
        const games: Game[] = await response.json();
        const foundGame = games.find((g) => g.id === params.id);
        setGame(foundGame || null);
      } catch (error) {
        console.error('Error fetching game:', error);
        setGame(null);
      } finally {
        setLoading(false);
      }
    };

    fetchGame();
  }, [params.id]);

  // جلوگیری از scroll افقی (overflow-x hidden) در موبایل
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isMobile = window.innerWidth < 768;
    if (!isMobile) return;

    // ذخیره مقادیر قبلی
    const originalBodyOverflowX = document.body.style.overflowX;
    const originalHtmlOverflowX = document.documentElement.style.overflowX;
    const originalBodyTouchAction = document.body.style.touchAction;
    const originalHtmlTouchAction = document.documentElement.style.touchAction;

    // غیرفعال کردن scroll افقی
    document.body.style.overflowX = 'hidden';
    document.documentElement.style.overflowX = 'hidden';
    document.body.style.touchAction = 'pan-y';
    document.documentElement.style.touchAction = 'pan-y';

    return () => {
      // بازگرداندن مقادیر قبلی
      document.body.style.overflowX = originalBodyOverflowX;
      document.documentElement.style.overflowX = originalHtmlOverflowX;
      document.body.style.touchAction = originalBodyTouchAction;
      document.documentElement.style.touchAction = originalHtmlTouchAction;
    };
  }, []);

  // // هندل کردن swipe سوال
  // const handleSwipe = (question: string | { id?: string; text: string }, direction: 'left' | 'right') => {
  //   const questionText = typeof question === 'string' ? question : question.text;
  //   console.log(`سوال ${direction === 'right' ? 'قبول' : 'رد'} شد:`, questionText);
    
  //   // TODO: اینجا می‌توانی منطق بازی را اضافه کنی:
  //   // - ذخیره انتخاب کاربر در database
  //   // - ارسال به API برای پردازش
  //   // - به‌روزرسانی state بازی
  //   // مثال:
  //   // await fetch('/api/game/swipe', {
  //   //   method: 'POST',
  //   //   body: JSON.stringify({ gameId: params.id, question, direction, playerCount })
  //   // });
  // };

  // // هندل کردن تمام شدن سوالات
  // const handleFinished = () => {
  //   console.log('تمام سوالات تمام شد!');
  //   // TODO: اینجا می‌توانی:
  //   // - نمایش نتیجه بازی
  //   // - redirect به صفحه نتیجه
  //   // - نمایش پیام تبریک
  //   // مثال:
  //   // router.push(`/games/${params.id}/result?players=${playerCount}`);
  // };

  // هندل کردن انتخاب آیتم از چرخ
  const handleItemSelect = (item: string, index: number) => {
    console.log('آیتم انتخاب شده:', item, 'شاخص:', index);
    // TODO: اینجا می‌توانی منطق بازی را اضافه کنی:
    // - ذخیره انتخاب کاربر در database
    // - ارسال به API برای پردازش
    // - به‌روزرسانی state بازی
  };

  if (loading) {
    return (
      <>
        <UserNavbar />
        <div className="min-h-screen flex items-center justify-center pt-20">
          <div className="text-2xl glow-text">{t.loading}</div>
        </div>
      </>
    );
  }

  if (!game) {
    return (
      <>
        <UserNavbar />
        <div className="min-h-screen flex flex-col items-center justify-center p-4 pt-20">
          <h2 className="text-3xl font-bold glow-text mb-4">{t.noGameFound}</h2>
          <motion.button
            onClick={() => router.push(`/games/${params.id}?players=${playerCount}`)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-primary mt-4"
          >
            {t.backToHome}
          </motion.button>
        </div>
      </>
    );
  }

  return (
    <>
      <UserNavbar />
      <div className="min-h-screen pt-20 md:pt-24 p-4 md:p-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold glow-text mb-2">{game.name}</h1>
            <p className="text-lg text-text-secondary">
              {playerCount} {t.players}
            </p>
          </motion.div>

          {/* Wheel of Fortune Component */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center mb-8"
          >
            <WheelOfFortune
              items={persianAlphabet}
              onSelect={handleItemSelect}
              size="lg"
            />
          </motion.div>

          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex justify-center"
          >
            <motion.button
              onClick={() => router.push(`/games/${params.id}?players=${playerCount}`)}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="btn-primary"
            >
              🏠 {t.backToHome}
            </motion.button>
          </motion.div>
        </div>
      </div>
    </>
  );
}


