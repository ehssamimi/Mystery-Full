'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/lib/store/auth-store';
import { useLanguageStore } from '@/lib/store/language-store';
import { translations } from '@/lib/translations';

export default function LoginPage() {
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { login, user, isAuthenticated, checkAuth } = useAuthStore();
  const { language, isRTL } = useLanguageStore();
  const t = translations[language];
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // چک کردن اینکه آیا کاربر قبلاً لاگین کرده است
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/');
      }
    }
  }, [isAuthenticated, user, router]);

  // Focus on first input when step changes to code
  useEffect(() => {
    if (step === 'code') {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [step]);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();

      if (data.success) {
        setStep('code');
        setCode(['', '', '', '', '', '']); // Reset code boxes
      } else {
        setError(data.error || t.errorSendingCode);
      }
    } catch (err) {
      setError(t.errorServerConnection);
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    // فقط اعداد را قبول کن
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // اگر کاراکتر وارد شد و باکس بعدی وجود دارد، به آن focus کن
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // اگر کد کامل شد، submit کن
    if (newCode.every((c) => c !== '') && newCode.join('').length === 6) {
      handleCodeSubmit(newCode.join(''));
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // اگر backspace زده شد و باکس خالی است، به باکس قبلی برو
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleCodePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    
    if (pastedData.length > 0) {
      const newCode = [...code];
      for (let i = 0; i < 6; i++) {
        newCode[i] = pastedData[i] || '';
      }
      setCode(newCode);
      
      // Focus به آخرین باکس پر شده یا اولین باکس خالی
      const lastFilledIndex = Math.min(pastedData.length - 1, 5);
      inputRefs.current[lastFilledIndex]?.focus();
      
      // اگر کد کامل شد، submit کن
      if (pastedData.length === 6) {
        handleCodeSubmit(pastedData);
      }
    }
  };

  const handleCodeSubmit = async (codeValue?: string) => {
    const finalCode = codeValue || code.join('');
    
    if (finalCode.length !== 6) {
      setError(t.invalidCode);
      return;
    }

    setError('');
    setLoading(true);

    const result = await login(phone, finalCode);

    if (result.success) {
      // Redirect در useEffect انجام می‌شود
    } else {
      setError(result.error || t.invalidCode);
      setLoading(false);
    }
  };

  const handleCodeFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    handleCodeSubmit();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <div className="bg-bg-secondary/80 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-accent/20">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-3xl font-bold text-center mb-2 glow-text"
          >
            {t.login}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-center text-text-secondary mb-8"
          >
            {step === 'phone' ? t.enterPhoneNumber : t.enterVerificationCode}
          </motion.p>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm text-center"
            >
              {error}
            </motion.div>
          )}

          {step === 'phone' ? (
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              onSubmit={handlePhoneSubmit}
              className="space-y-6"
            >
              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-2 text-text-secondary">
                  {t.phone}
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="09123456789"
                  dir="ltr"
                  className="w-full px-4 py-3 bg-bg-tertiary border border-accent/30 rounded-lg focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/50 text-text-primary placeholder-text-muted transition-all duration-200"
                  required
                  pattern="09\d{9}"
                  maxLength={11}
                />
              </div>

              <motion.button
                type="submit"
                disabled={loading || phone.length !== 11}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 bg-accent hover:bg-accent-glow text-white font-semibold rounded-lg transition-all duration-200 glow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? t.sending : t.sendCode}
              </motion.button>
            </motion.form>
          ) : (
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              onSubmit={handleCodeFormSubmit}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-medium mb-4 text-text-secondary text-center">
                  {t.verificationCode}
                </label>
                
                {/* 6 Code Input Boxes */}
                <div className={`flex gap-2 md:gap-3 justify-center mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  {code.map((digit, index) => (
                    <motion.input
                      key={index}
                      ref={(el) => {
                        inputRefs.current[index] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      onKeyDown={(e) => handleCodeKeyDown(index, e)}
                      onPaste={index === 0 ? handleCodePaste : undefined}
                      dir="ltr"
                      className="w-12 h-14 md:w-14 md:h-16 bg-bg-tertiary border-2 border-accent/30 rounded-lg focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/50 text-text-primary transition-all duration-200 text-center text-2xl md:text-3xl font-bold tracking-widest"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      whileFocus={{ scale: 1.05 }}
                    />
                  ))}
                </div>
                
                <p className="text-xs text-text-muted mt-2 text-center">
                  {t.defaultCode}
                </p>
              </div>

              <div className="flex gap-3">
                <motion.button
                  type="button"
                  onClick={() => {
                    setStep('phone');
                    setCode(['', '', '', '', '', '']);
                    setError('');
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 py-3 bg-bg-tertiary hover:bg-bg-tertiary/80 text-text-primary font-semibold rounded-lg transition-all duration-200 border border-accent/20"
                >
                  {t.back}
                </motion.button>

                <motion.button
                  type="submit"
                  disabled={loading || code.join('').length !== 6}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 py-3 bg-accent hover:bg-accent-glow text-white font-semibold rounded-lg transition-all duration-200 glow disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? t.verifying : t.verify}
                </motion.button>
              </div>
            </motion.form>
          )}
        </div>
      </motion.div>
    </div>
  );
}

