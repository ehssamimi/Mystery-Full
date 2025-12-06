'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import TinderCard from 'react-tinder-card';
import { motion } from 'framer-motion';

/**
 * کامپوننت QuestionSwiper - چرخش سوالات به سبک Tinder
 * 
 * این کامپوننت از کتابخانه react-tinder-card استفاده می‌کند
 * برای نمایش کارت‌های سوال که کاربر می‌تواند swipe کند
 */

interface Question {
  id?: string;
  text: string;
}

interface QuestionSwiperProps {
  // آرایه سوالات - می‌تواند string[] یا Array<{id: string, text: string}> باشد
  questions: string[] | Question[];
  // Callback وقتی کاربر swipe می‌کند
  // direction: "left" برای رد کردن، "right" برای قبول کردن
  onSwipe?: (question: string | Question, direction: 'left' | 'right') => void;
  // Callback وقتی تمام سوالات تمام می‌شوند
  onFinished?: () => void;
  // کلاس‌های اضافی برای container
  className?: string;
}

export default function QuestionSwiper({
  questions,
  onSwipe,
  onFinished,
  className = '',
}: QuestionSwiperProps) {
  const [currentIndex, setCurrentIndex] = useState(questions.length - 1);
  
  // استفاده از useRef برای دسترسی به متدهای TinderCard
  const childRefs = useRef<{ [key: number]: any }>({});
  const containerRef = useRef<HTMLDivElement>(null);

  // به‌روزرسانی currentIndex وقتی questions تغییر می‌کنه
  useEffect(() => {
    setCurrentIndex(questions.length - 1);
  }, [questions.length]);


  // جلوگیری از scroll شدن صفحه هنگام swipe در موبایل
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // فقط برای موبایل
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    if (!isMobile) return;

    let touchStartX = 0;
    let touchStartY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStartX || !touchStartY) return;

      const touch = e.touches[0];
      const diffX = Math.abs(touch.clientX - touchStartX);
      const diffY = Math.abs(touch.clientY - touchStartY);

      // اگر حرکت افقی بیشتر از عمودی باشه (با threshold 10px)
      if (diffX > diffY && diffX > 10) {
        // جلوگیری از scroll صفحه فقط وقتی swipe افقی هست
        e.preventDefault();
      }
    };

    const handleTouchEnd = () => {
      touchStartX = 0;
      touchStartY = 0;
    };

    // اضافه کردن event listeners فقط روی container کارت‌ها
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [currentIndex]);

  // تبدیل جهت swipe به 'left' یا 'right'
  const getSwipeDirection = (direction: string): 'left' | 'right' => {
    if (direction === 'left' || direction === 'down') return 'left';
    return 'right';
  };

  // هندل کردن swipe
  const swiped = useCallback(
    (direction: string, questionIndex: number, question: string | Question) => {
      const swipeDir = getSwipeDirection(direction);
      
      if (onSwipe) {
        onSwipe(question, swipeDir);
      }
    },
    [onSwipe]
  );

  // هندل کردن زمانی که کارت از view خارج می‌شه
  const outOfFrame = useCallback(
    (questionIndex: number) => {
      setCurrentIndex((prevIndex) => {
        const newIndex = prevIndex - 1;
        
        // اگر آخرین کارت بود
        if (newIndex < 0 && onFinished) {
          setTimeout(() => {
            onFinished();
          }, 300);
        }
        
        return newIndex;
      });
    },
    [onFinished]
  );

  // اگر سوالی باقی نمانده
  if (currentIndex < 0 || questions.length === 0) {
    return (
      <div className={`flex items-center justify-center min-h-[300px] sm:min-h-[400px] ${className}`}>
        <div className="text-center px-4">
          <p className="text-lg sm:text-xl text-text-secondary">تمام سوالات تمام شد!</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`flex flex-col items-center justify-center w-full px-4 sm:px-6 ${className}`}
    >
      {/* Container برای کارت‌های stack */}
      <div 
        ref={containerRef}
        className="relative w-full max-w-md sm:max-w-lg md:max-w-2xl h-[380px] sm:h-[450px] md:h-[500px] flex items-center justify-center mb-6 sm:mb-8"
      >
        {/* نمایش کارت‌ها (از آخر به اول برای stack effect) */}
        {questions.map((question, index) => {
          const questionText = typeof question === 'string' ? question : question.text;
          const isTopCard = index === currentIndex;
          
          return (
            <TinderCard
              ref={(el) => {
                if (el) {
                  childRefs.current[index] = el;
                }
              }}
              key={index}
              className={`absolute w-[calc(100%-32px)] sm:w-[calc(100%-48px)] md:w-[500px] h-[350px] sm:h-[420px] md:h-[450px] ${
                isTopCard ? 'cursor-grab active:cursor-grabbing' : 'pointer-events-none'
              }`}
              onSwipe={(dir) => swiped(dir, index, question)}
              onCardLeftScreen={() => outOfFrame(index)}
              preventSwipe={['up', 'down']}
              swipeRequirementType="position"
            >
              <motion.div
                className={`
                  relative w-full h-full
                  border-2 rounded-xl sm:rounded-2xl 
                  p-4 sm:p-6 md:p-8 lg:p-10
                  shadow-2xl
                  select-none
                  bg-[var(--bg-secondary)]
                  backdrop-blur-[8px]
                  border-[rgba(108,92,231,0.3)]
                  flex items-center justify-center
                `}
                style={{
                  touchAction: 'none',
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                }}
                whileHover={isTopCard ? { scale: 1.02 } : {}}
                transition={{ duration: 0.2 }}
              >
                {/* افکت glow برای کارت */}
                <div className="absolute inset-0 rounded-xl sm:rounded-2xl glow-sm opacity-50 pointer-events-none" />

                {/* متن سوال */}
                <div className="relative z-10 text-center px-2 sm:px-4">
                  <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-text-primary leading-relaxed">
                    {questionText}
                  </h2>
                </div>

                {/* نشانگر جهت swipe (فقط برای دسکتاپ و کارت اول) */}
                {isTopCard && (
                  <motion.div
                    className="hidden md:block absolute top-4 right-4 text-2xl opacity-0"
                    animate={{
                      opacity: [0, 0.3, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                  >
                    👈
                  </motion.div>
                )}
              </motion.div>
            </TinderCard>
          );
        })}
      </div>

      {/* نمایش ایندکس فعلی */}
      <div className="mb-4 sm:mb-6 text-center">
        <span className="text-base sm:text-lg text-text-secondary">
          {currentIndex + 1} / {questions.length}
        </span>
      </div>
    </div>
  );
}