'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface ExplosionParticlesProps {
  gameName: string;
}

export default function ExplosionParticles({ gameName }: ExplosionParticlesProps) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);

  useEffect(() => {
    // Generate random particles
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 0.5,
    }));
    setParticles(newParticles);
  }, []);

  const colors = ['#6c5ce7', '#a29bfe', '#c9c5ff', '#ff6b6b', '#4ecdc4', '#ffe66d'];

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      {/* Explosion Circle */}
      <motion.div
        className="absolute w-96 h-96 rounded-full"
        initial={{ scale: 0, opacity: 1 }}
        animate={{ scale: 4, opacity: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        style={{
          background: 'radial-gradient(circle, rgba(108, 92, 231, 0.8) 0%, transparent 70%)',
        }}
      />

      {/* Particles */}
      {particles.map((particle) => {
        const color = colors[Math.floor(Math.random() * colors.length)];
        const angle = Math.random() * Math.PI * 2;
        const distance = 200 + Math.random() * 300;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;

        return (
          <motion.div
            key={particle.id}
            className="absolute w-3 h-3 rounded-full"
            style={{
              backgroundColor: color,
              boxShadow: `0 0 10px ${color}`,
              left: '50%',
              top: '50%',
            }}
            initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
            animate={{
              x,
              y,
              scale: [1, 1.5, 0],
              opacity: [1, 1, 0],
            }}
            transition={{
              duration: 1,
              delay: particle.delay,
              ease: 'easeOut',
            }}
          />
        );
      })}

      {/* Game Name */}
      <motion.div
        className="relative z-10 text-center"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5, type: 'spring', stiffness: 200 }}
      >
        <motion.h2
          className="text-5xl md:text-7xl font-bold glow-text mb-4"
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 0.5,
            repeat: 2,
          }}
        >
          {gameName}
        </motion.h2>
        <motion.p
          className="text-2xl md:text-3xl text-text-secondary"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          برای شما انتخاب شد! 🎉
        </motion.p>
      </motion.div>
    </div>
  );
}

