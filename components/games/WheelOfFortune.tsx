'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface WheelOfFortuneProps {
  items: string[];
  onSelect?: (item: string, index: number) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  spinDuration?: number;
  minSpins?: number;
}

const DEFAULT_COLORS = [
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#FFA07A',
  '#98D8C8',
  '#F7DC6F',
  '#BB8FCE',
  '#85C1E2',
  '#F8B88B',
  '#A8E6CF',
  '#FFD93D',
  '#6BCF7F',
];

export default function WheelOfFortune({
  items,
  onSelect,
  size = 'md',
  className = '',
  spinDuration = 5000,
  minSpins = 5,
}: WheelOfFortuneProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [windowWidth, setWindowWidth] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Detect window size for responsive design
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    handleResize(); // Set initial value
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Responsive size calculation
  const getResponsiveSize = () => {
    if (windowWidth === 0) {
      // Default to mobile size until we know the actual size
      return { wheel: 280, button: 50 };
    }
    
    if (windowWidth < 640) {
      // Mobile: small wheel
      return { wheel: 280, button: 50 };
    } else if (windowWidth < 1024) {
      // Tablet: medium wheel
      return { wheel: 350, button: 65 };
    } else {
      // Desktop: use size prop or default to medium
      const sizeConfig = {
        sm: { wheel: 300, button: 60 },
        md: { wheel: 400, button: 80 },
        lg: { wheel: 500, button: 100 },
      };
      return sizeConfig[size];
    }
  };

  const config = getResponsiveSize();
  const wheelSize = config.wheel;
  const centerX = wheelSize / 2;
  const centerY = wheelSize / 2;
  const radius = wheelSize / 2 - 10;

  // رسم چرخ روی Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, wheelSize, wheelSize);

    if (items.length === 0) return;

    const anglePerItem = (2 * Math.PI) / items.length;

    items.forEach((item, index) => {
      const startAngle = index * anglePerItem - Math.PI / 2;
      const endAngle = startAngle + anglePerItem;

      // رسم بخش
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.lineTo(centerX, centerY);
      ctx.fillStyle = DEFAULT_COLORS[index % DEFAULT_COLORS.length];
      ctx.fill();

      // رسم خط مرزی
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.stroke();

      // رسم متن
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + anglePerItem / 2);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#000';
      // اندازه فونت کوچکتر و ریسپانسیو
      let fontSize: number;
      if (windowWidth < 640) {
        // Mobile: فونت خیلی کوچک
        fontSize = 12;
      } else if (windowWidth < 1024) {
        // Tablet: فونت متوسط
        fontSize = 16;
      } else {
        // Desktop: فونت بر اساس size prop (کوچکتر از قبل)
        fontSize = size === 'lg' ? 20 : size === 'md' ? 16 : 14;
      }
      ctx.font = `bold ${fontSize}px Arial`;
      ctx.fillText(item, radius / 1.5, 0);
      ctx.restore();
    });

    // رسم دایره مرکز
    ctx.beginPath();
    ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 3;
    ctx.stroke();
  }, [items, wheelSize, radius, centerX, centerY, size, windowWidth]);

  const handleSpin = () => {
    if (isSpinning || items.length === 0) return;

    setIsSpinning(true);
    setSelectedItem(null);
    setSelectedIndex(null);

    // انتخاب تصادفی یک آیتم
    const randomIndex = Math.floor(Math.random() * items.length);
    const winner = items[randomIndex];

    // محاسبه زاویه مرکز بخش برنده
    const anglePerItem = 360 / items.length;
    const winnerCenterAngle = randomIndex * anglePerItem + anglePerItem / 2;

    // محاسبه زاویه هدف: نشانگر در بالا (0 درجه) است
    // می‌خواهیم مرکز بخش برنده به بالا برسه
    const targetAngle = 360 - winnerCenterAngle;

    // normalize کردن rotation فعلی
    const currentNormalizedRotation = ((rotation % 360) + 360) % 360;

    // محاسبه rotation نهایی: از rotation فعلی شروع می‌کنیم
    // normalize شده را کم می‌کنیم، سپس spins اضافه می‌کنیم و targetAngle را اضافه می‌کنیم
    const spins = minSpins * 360;
    const finalRotation =
      rotation - currentNormalizedRotation + spins + targetAngle;

    setRotation(finalRotation);
    setSelectedIndex(randomIndex);

    setTimeout(() => {
      setIsSpinning(false);
      setSelectedItem(winner);
      if (onSelect) {
        onSelect(winner, randomIndex);
      }
    }, spinDuration);
  };

  if (items.length === 0) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <p className="text-text-secondary">هیچ آیتمی برای نمایش وجود ندارد</p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center gap-3 sm:gap-4 md:gap-6 ${className}`}>
      {/* نشانگر بالا - ریسپانسیو */}
      <div
        className="relative z-20 w-0 h-0 border-l-[12px] sm:border-l-[16px] border-r-[12px] sm:border-r-[16px] border-t-[24px] sm:border-t-[32px] border-l-transparent border-r-transparent border-t-[var(--accent)] mb-0"
      />

      {/* کانتینر چرخ - ریسپانسیو */}
      <div
        className="relative w-full max-w-full flex items-center justify-center"
        style={{ 
          width: wheelSize, 
          height: wheelSize,
          maxWidth: '100%',
        }}
      >
        {/* چرخ */}
        <div
          className="w-full h-full"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: isSpinning
              ? `transform ${spinDuration}ms cubic-bezier(0.17, 0.67, 0.12, 0.99)`
              : 'none',
          }}
        >
          <canvas
            ref={canvasRef}
            width={wheelSize}
            height={wheelSize}
            className="w-full h-full max-w-full"
            style={{
              borderRadius: '50%',
              boxShadow: windowWidth < 640 
                ? '0 15px 30px -8px rgba(0, 0, 0, 0.25)' 
                : '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
          />
        </div>

        {/* دکمه وسط */}
        <button
          onClick={handleSpin}
          disabled={isSpinning}
          className="absolute z-30 rounded-full bg-accent hover:bg-accent-glow text-white font-bold shadow-2xl glow flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            width: config.button,
            height: config.button,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
          onMouseEnter={(e) => {
            if (!isSpinning) {
              e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.1)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)';
          }}
          onMouseDown={(e) => {
            if (!isSpinning) {
              e.currentTarget.style.transform = 'translate(-50%, -50%) scale(0.95)';
            }
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)';
          }}
        >
          {isSpinning ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-4 h-4 sm:w-6 sm:h-6 border sm:border-2 border-white border-t-transparent rounded-full"
            />
          ) : (
            <span className="text-lg sm:text-2xl">🎯</span>
          )}
        </button>
      </div>

      {/* نمایش نتیجه - ریسپانسیو */}
      <AnimatePresence>
        {selectedItem && !isSpinning && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="text-center w-full px-4 sm:px-0"
          >
            <div className="px-4 py-3 sm:px-8 sm:py-4 bg-accent/20 border border-accent/50 rounded-xl backdrop-blur-sm max-w-md mx-auto">
              <p className="text-sm sm:text-base text-text-secondary mb-1 sm:mb-2">نتیجه:</p>
              <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white break-words">
                {selectedItem}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
