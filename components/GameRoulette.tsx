'use client';

/**
 * کامپوننت چرخ بازی (GameRoulette)
 * 
 * این کامپوننت می‌تواند با دو حالت کار کند:
 * 1. حالت بازی‌ها: لیست بازی‌ها را از props می‌گیرد و نمایش می‌دهد
 * 2. حالت استاتیک: لیست استاتیک (مثلاً حروف الفبا) را نمایش می‌دهد
 * 
 * TODO: برای داینامیک کردن این کامپوننت:
 * 
 * 1. دریافت داده از API:
 *    - می‌توانی یک API endpoint بسازی: /api/roulette-items
 *    - در useEffect داده‌ها رو fetch کن و در state ذخیره کن
 *    - مثال: const [items, setItems] = useState([]); useEffect(() => { fetch('/api/roulette-items').then(...) }, [])
 * 
 * 2. دریافت داده از Database:
 *    - می‌توانی یک جدول در Prisma بسازی برای ذخیره آیتم‌های چرخ
 *    - در API route داده‌ها رو از database بگیر و برگردون
 *    - مثال: const items = await prisma.rouletteItem.findMany({ where: { isActive: true } })
 * 
 * 3. دریافت داده از Context/Store:
 *    - می‌توانی از Zustand یا Context API استفاده کنی
 *    - مثال: const items = useRouletteStore(state => state.items)
 * 
 * 4. دریافت داده از Props (Parent Component):
 *    - می‌توانی داده‌ها رو از کامپوننت والد بگیر
 *    - مثال: <GameRoulette staticItems={parentItems} />
 * 
 * 5. ذخیره انتخاب‌ها:
 *    - می‌توانی انتخاب‌های کاربر رو در database ذخیره کنی
 *    - در onItemSelected می‌توانی یک API call بزنی برای ذخیره
 *    - مثال: await fetch('/api/selections', { method: 'POST', body: JSON.stringify({ item, userId }) })
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Game } from '@/types/game';
import ExplosionParticles from './ExplosionParticles';
import { useSound } from '@/hooks/useSound';
import { useLanguageStore } from '@/lib/store/language-store';
import { translations } from '@/lib/translations';

interface GameRouletteProps {
  games?: Game[];
  playerCount?: number;
  // لیست استاتیک (مثلاً حروف الفبا)
  // TODO: برای داینامیک کردن، می‌توانی از API یا props دیگه داده بگیر:
  // - از API: useEffect(() => { fetch('/api/items').then(...) }, [])
  // - از props: staticItems={dynamicItemsFromParent}
  // - از context/store: const items = useItemsStore()
  staticItems?: string[];
  // Callback برای وقتی که یک آیتم از لیست استاتیک انتخاب شد
  onItemSelected?: (item: string) => void;
}

// لیست حروف الفبای فارسی
// TODO: برای داینامیک کردن این لیست:
// 1. می‌توانی از API بگیر: const [alphabet, setAlphabet] = useState([]); useEffect(() => { fetch('/api/alphabet')... }, [])
// 2. می‌توانی از database بگیر: const alphabet = await prisma.alphabet.findMany()
// 3. می‌توانی از props بگیر: const PERSIAN_ALPHABET = props.alphabet || [...]
// 4. می‌توانی از environment variables بگیر: process.env.ALPHABET?.split(',')
const PERSIAN_ALPHABET = [
  'الف', 'ب', 'پ', 'ت', 'ث', 'ج', 'چ', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'ژ', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ک', 'گ', 'ل', 'م', 'ن', 'و', 'ه', 'ی'
];

export default function GameRoulette({ games = [], playerCount, staticItems, onItemSelected }: GameRouletteProps) {
  // TODO: برای داینامیک کردن داده‌ها، می‌توانی از این الگو استفاده کنی:
  // const [dynamicItems, setDynamicItems] = useState<string[]>([]);
  // useEffect(() => {
  //   const fetchItems = async () => {
  //     try {
  //       const response = await fetch('/api/items');
  //       const data = await response.json();
  //       setDynamicItems(data.items || []);
  //     } catch (error) {
  //       console.error('Error fetching items:', error);
  //     }
  //   };
  //   fetchItems();
  // }, []);
  // سپس: const itemsToUse = staticItems || dynamicItems || PERSIAN_ALPHABET;
  
  // اگر لیست استاتیک داده شده، از اون استفاده کن
  // اگر داده نشده، از حروف الفبا استفاده کن
  const itemsToUse = staticItems && staticItems.length > 0 ? staticItems : PERSIAN_ALPHABET;
  const isUsingStaticItems = !games || games.length === 0;
  
  // تبدیل لیست استاتیک به فرمت مشابه Game برای نمایش
  // TODO: اگر داده‌ها از API می‌آید، می‌توانی مستقیماً فرمت Game رو برگردونی:
  // const staticGames: Game[] = useMemo(() => {
  //   if (!isUsingStaticItems) return [];
  //   // اگر از API می‌آید و فرمت Game داره:
  //   // return itemsToUse; // بدون تبدیل
  //   // اگر string[] است:
  //   return itemsToUse.map((item, index) => ({ ... }));
  // }, [itemsToUse, isUsingStaticItems]);
  const staticGames: Game[] = useMemo(() => {
    if (!isUsingStaticItems) return [];
    return itemsToUse.map((item, index) => ({
      id: `static-${index}`,
      name: item,
      nameEn: item,
      description: '',
      minPlayers: 0,
      maxPlayers: 0,
      category: '',
      rules: '',
      difficulty: 'easy' as const,
      duration: 0,
    }));
  }, [itemsToUse, isUsingStaticItems]);

  // انتخاب لیست نهایی - فقط بازی‌های فعال را انتخاب کن
  const validGames = useMemo(() => {
    if (isUsingStaticItems) return staticGames;
    if (!Array.isArray(games)) return [];
    // فیلتر کردن فقط بازی‌های فعال (isActive === true)
    // این اطمینان می‌دهد که فقط بازی‌های فعال برای کاربر انتخاب می‌شوند
    return games.filter(game => game.isActive === true);
  }, [games, isUsingStaticItems, staticGames]);
  
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [isSpinning, setIsSpinning] = useState(true);
  const [isShaking, setIsShaking] = useState(false);
  const [showExplosion, setShowExplosion] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedOffset, setSelectedOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { playExplosion } = useSound();
  const { language, isRTL } = useLanguageStore();
  const t = translations[language];

  // Shuffle games for display and create more boxes for visual effect
  // If we don't have enough games, duplicate them to fill the display
  const finalDisplayGames = useMemo(() => {
    // Use validated games array
    if (validGames.length === 0) return [];
    
    const shuffledGames = [...validGames].sort(() => Math.random() - 0.5);
    const displayGames = shuffledGames.slice(0, Math.min(10, shuffledGames.length));
    
    // If we have fewer games than needed, duplicate them
    return displayGames.length > 0
      ? [...Array(10)].map((_, i) => displayGames[i % displayGames.length])
      : [];
  }, [validGames]);

  // Reset position when spinning stops - ensure smooth transition
  useEffect(() => {
    if (!isSpinning && scrollContainerRef.current) {
      // Get current animation progress and reset to 0
      scrollContainerRef.current.style.animation = 'none';
      // Force reflow
      scrollContainerRef.current.offsetHeight;
      // Reset position
      scrollContainerRef.current.style.transform = 'translateX(0px)';
    }
  }, [isSpinning]);

  useEffect(() => {
    // Spin for exactly 2 seconds
    const spinDuration = 2000;
    
    const spinTimer = setTimeout(() => {
      setIsSpinning(false);
      
      // Select a random game - this will be the one that "reaches" the center
      const randomIndex = Math.floor(Math.random() * finalDisplayGames.length);
      const randomGame = finalDisplayGames[randomIndex];
      setSelectedGame(randomGame);
      
      // Calculate offset to center the selected game
      const calculateOffset = () => {
        setTimeout(() => {
          if (boxRef.current && containerRef.current) {
            const boxRect = boxRef.current.getBoundingClientRect();
            const containerRect = containerRef.current.getBoundingClientRect();
            const boxWidth = boxRect.width;
            const gap = window.innerWidth >= 768 ? 24 : 16;
            
            // Calculate position in RTL layout
            const totalWidth = finalDisplayGames.length * (boxWidth + gap) - gap;
            const selectedBoxPositionFromRight = randomIndex * (boxWidth + gap);
            const selectedBoxPositionFromLeft = totalWidth - selectedBoxPositionFromRight - boxWidth;
            
            // Center the selected box
            const containerCenter = containerRect.width / 2;
            const boxCenter = selectedBoxPositionFromLeft + boxWidth / 2;
            const offsetNeeded = containerCenter - boxCenter;
            
            setSelectedOffset(offsetNeeded);
          } else {
            // Fallback calculation
            const boxWidth = window.innerWidth >= 768 ? 160 : 128;
            const gap = window.innerWidth >= 768 ? 24 : 16;
            const totalWidth = finalDisplayGames.length * (boxWidth + gap) - gap;
            const selectedBoxPositionFromRight = randomIndex * (boxWidth + gap);
            const selectedBoxPositionFromLeft = totalWidth - selectedBoxPositionFromRight - boxWidth;
            const containerWidth = Math.min(window.innerWidth - 32, 1152);
            const containerCenter = containerWidth / 2;
            const boxCenter = selectedBoxPositionFromLeft + boxWidth / 2;
            const offsetNeeded = containerCenter - boxCenter;
            setSelectedOffset(offsetNeeded);
          }
        }, 50);
      };
      
      requestAnimationFrame(calculateOffset);
      
      // Show explosion immediately when box reaches center
      setTimeout(() => {
        setShowExplosion(true);
        playExplosion();
        
        // Show details after explosion
        setTimeout(() => {
          setShowDetails(true);
          
          // اگر از لیست استاتیک استفاده می‌کنیم
          if (isUsingStaticItems && onItemSelected) {
            // TODO: برای ذخیره داده‌های انتخاب شده در database یا API:
            // const saveSelection = async () => {
            //   try {
            //     await fetch('/api/selections', {
            //       method: 'POST',
            //       headers: { 'Content-Type': 'application/json' },
            //       body: JSON.stringify({ 
            //         item: randomGame.name,
            //         timestamp: new Date(),
            //         userId: user?.id 
            //       })
            //     });
            //   } catch (error) {
            //     console.error('Error saving selection:', error);
            //   }
            // };
            // saveSelection();
            onItemSelected(randomGame.name);
          } else if (playerCount) {
            // اگر بازی انتخاب شده، به صفحه بازی برو
            setTimeout(() => {
              router.push(`/games/${randomGame.id}?players=${playerCount}`);
            }, 500);
          }
        }, 1000);
      }, 1200); // Wait for box to reach center (1.2s transition)
    }, spinDuration);

    return () => clearTimeout(spinTimer);
  }, [finalDisplayGames, playerCount, router, playExplosion, isUsingStaticItems, onItemSelected]);

  if (showDetails && selectedGame) {
    // اگر از لیست استاتیک استفاده می‌کنیم و callback داده شده، فقط نمایش بده
    if (isUsingStaticItems && onItemSelected) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="min-h-screen flex items-center justify-center p-4"
        >
          <div className="text-center">
            <motion.h2
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-4xl md:text-6xl font-bold glow-text mb-4"
            >
              {selectedGame.name}
            </motion.h2>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-text-secondary"
            >
              {t.selectedForYou}
            </motion.p>
          </div>
        </motion.div>
      );
    }
    
    // اگر بازی انتخاب شده، به صفحه بازی برو (مثل قبل)
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen flex items-center justify-center p-4"
      >
        <div className="text-center">
          <motion.h2
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-4xl md:text-6xl font-bold glow-text mb-4"
          >
            {selectedGame.name}
          </motion.h2>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-text-secondary"
          >
            {t.selectedForYou}
          </motion.p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center pt-20 md:pt-24 p-4 relative z-10">
      <AnimatePresence>
        {showExplosion && selectedGame && (
          <ExplosionParticles gameName={selectedGame.name} />
        )}
      </AnimatePresence>

      <motion.h2
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl md:text-5xl font-bold glow-text mb-8 text-center"
      >
        {t.selecting}
      </motion.h2>

      {/* Game Boxes Container */}
      <div ref={containerRef} className="w-full max-w-6xl overflow-hidden relative" style={{ minHeight: '200px', height: '200px' }}>
        {/* Center Highlight */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 md:w-40 md:h-40 border-4 border-accent rounded-xl glow-lg pointer-events-none z-10" />
        
        {finalDisplayGames.length > 0 ? (
          <motion.div
            ref={scrollContainerRef}
            className={`flex gap-4 md:gap-6 justify-start items-center ${isSpinning ? 'infinite-scroll' : ''}`}
            style={{ 
              width: '200%', 
              direction: isRTL ? 'rtl' : 'ltr',
              height: '100%',
              position: 'relative',
              ...(isSpinning ? {} : {
                animation: 'none',
                transform: selectedGame ? `translateX(${selectedOffset}px)` : 'translateX(0px)',
                transition: 'transform 1.2s cubic-bezier(0.25, 0.1, 0.25, 1)',
              }),
            }}
          >
            {/* Duplicate games for infinite scroll effect - Gift box style */}
            {[...finalDisplayGames, ...finalDisplayGames].map((game, index) => {
            const isSelected = selectedGame?.id === game.id && !isSpinning && index < finalDisplayGames.length;
            const actualIndex = index % finalDisplayGames.length;
            const isFirstBox = index === 0;
            
            // Different gift box colors for variety
            const boxColors = [
              'from-purple-500 to-pink-500',
              'from-blue-500 to-cyan-500',
              'from-green-500 to-emerald-500',
              'from-yellow-500 to-orange-500',
              'from-red-500 to-rose-500',
              'from-indigo-500 to-purple-500',
              'from-teal-500 to-blue-500',
              'from-pink-500 to-red-500',
              'from-amber-500 to-yellow-500',
              'from-violet-500 to-purple-500',
            ];
            const boxColor = boxColors[actualIndex % boxColors.length];
            
            return (
              <motion.div
                key={`${game.id}-${index}`}
                ref={isFirstBox ? boxRef : null}
                className={`flex-shrink-0 w-32 h-32 md:w-40 md:h-40 rounded-xl flex flex-col items-center justify-center relative overflow-hidden ${
                  isSelected ? 'glow-lg' : ''
                }`}
                style={{
                  background: isSelected 
                    ? `linear-gradient(135deg, var(--accent), var(--accent-glow))`
                    : `linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary))`,
                  border: `2px solid ${isSelected ? 'var(--accent-glow)' : 'rgba(108, 92, 231, 0.3)'}`,
                  boxShadow: isSelected 
                    ? '0 0 30px var(--glow-primary), 0 0 60px var(--glow-secondary)'
                    : '0 4px 15px rgba(0, 0, 0, 0.3)',
                }}
                animate={
                  isSelected
                    ? { scale: 1.15 }
                    : { scale: 1 }
                }
                transition={{ duration: 0.3 }}
              >
                {/* Gift box ribbon decoration */}
                <div 
                  className="absolute top-0 left-0 right-0 h-1/3"
                  style={{
                    background: `linear-gradient(135deg, var(--accent), var(--accent-glow))`,
                    opacity: isSelected ? 1 : 0.5,
                  }}
                />
                <div 
                  className="absolute bottom-0 left-0 right-0 h-1/3"
                  style={{
                    background: `linear-gradient(135deg, var(--accent), var(--accent-glow))`,
                    opacity: isSelected ? 1 : 0.5,
                  }}
                />
                <div 
                  className="absolute left-0 top-0 bottom-0 w-1/3"
                  style={{
                    background: `linear-gradient(135deg, var(--accent), var(--accent-glow))`,
                    opacity: isSelected ? 1 : 0.5,
                  }}
                />
                <div 
                  className="absolute right-0 top-0 bottom-0 w-1/3"
                  style={{
                    background: `linear-gradient(135deg, var(--accent), var(--accent-glow))`,
                    opacity: isSelected ? 1 : 0.5,
                  }}
                />
                
                {/* Gift box bow/center decoration */}
                <div 
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 md:w-16 md:h-16 rounded-full"
                  style={{
                    background: isSelected 
                      ? `radial-gradient(circle, var(--accent-glow), var(--accent))`
                      : `radial-gradient(circle, rgba(108, 92, 231, 0.4), rgba(108, 92, 231, 0.2))`,
                    boxShadow: isSelected 
                      ? '0 0 20px var(--glow-primary), inset 0 0 10px var(--accent-glow)'
                      : 'inset 0 0 10px rgba(108, 92, 231, 0.3)',
                  }}
                />
                
                {/* Sparkle effect for selected box */}
                {isSelected && (
                  <motion.div
                    className="absolute inset-0"
                    animate={{
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                    }}
                  >
                    <div className="absolute top-2 left-2 w-2 h-2 bg-accent-glow rounded-full glow-sm" />
                    <div className="absolute top-2 right-2 w-2 h-2 bg-accent-glow rounded-full glow-sm" />
                    <div className="absolute bottom-2 left-2 w-2 h-2 bg-accent-glow rounded-full glow-sm" />
                    <div className="absolute bottom-2 right-2 w-2 h-2 bg-accent-glow rounded-full glow-sm" />
                  </motion.div>
                )}
                
                {/* نمایش متن در وسط باکس */}
                <div className="relative z-10 text-center px-2">
                  <span className="text-2xl md:text-3xl font-bold text-text-primary">
                    {game.name}
                  </span>
                </div>
              </motion.div>
            );
          })}
          </motion.div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-text-secondary">{t.loadingBoxes}</p>
          </div>
        )}
      </div>

      {/* Loading Indicator */}
      {isSpinning && (
        <motion.div
          className="mt-8 flex gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-3 h-3 rounded-full bg-accent glow"
              animate={{
                scale: 1.2,
                opacity: 0.8,
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                repeatType: "reverse",
                delay: i * 0.2,
              }}
            />
          ))}
        </motion.div>
      )}
    </div>
  );
}

