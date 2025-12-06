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
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const sizeConfig = {
    sm: { wheel: 300, button: 60 },
    md: { wheel: 400, button: 80 },
    lg: { wheel: 500, button: 100 },
  };

  const config = sizeConfig[size];
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
      ctx.font = 'bold 16px Arial';
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
  }, [items, wheelSize, radius, centerX, centerY]);

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
    <div className={`flex flex-col items-center gap-6 ${className}`}>
      {/* نشانگر بالا */}
      <div
        className="relative z-20"
        style={{
          width: 0,
          height: 0,
          borderLeft: '20px solid transparent',
          borderRight: '20px solid transparent',
          borderTop: '40px solid var(--accent)',
          marginBottom: '0px',
        }}
      />

      {/* کانتینر چرخ */}
      <div
        className="relative"
        style={{ width: wheelSize, height: wheelSize }}
      >
        {/* چرخ */}
        <div
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
            style={{
              borderRadius: '50%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
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
              className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
            />
          ) : (
            <span className="text-2xl">🎯</span>
          )}
        </button>
      </div>

      {/* نمایش نتیجه */}
      <AnimatePresence>
        {selectedItem && !isSpinning && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="text-center"
          >
            <div className="px-6 py-3 bg-accent/20 border border-accent/50 rounded-xl backdrop-blur-sm">
              <p className="text-sm text-text-secondary mb-1">نتیجه:</p>
              <p className="text-lg font-bold text-accent glow-text">
                {selectedItem}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
