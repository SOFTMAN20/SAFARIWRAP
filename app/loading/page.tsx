'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { wrapsApi } from '@/lib/api';

const LOADING_STEPS = [
  { emoji: '🦁', text: 'Tracking your sightings...' },
  { emoji: '🌿', text: 'Curating your moments...' },
  { emoji: '✨', text: 'Unlocking achievements...' },
  { emoji: '🌍', text: 'Preparing your SafariWrap...' },
];

function LoadingPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const wrapId = searchParams.get('wrap');
  
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [wrap, setWrap] = useState<any>(null);

  useEffect(() => {
    if (!wrapId) {
      router.push('/');
      return;
    }

    // Fetch wrap data in background
    wrapsApi.getSafariWrap(wrapId)
      .then(setWrap)
      .catch(console.error);

    // Animation sequence
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < LOADING_STEPS.length - 1) return prev + 1;
        return prev;
      });
    }, 1500);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 100) return prev + 1;
        return prev;
      });
    }, 60);

    return () => {
      clearInterval(interval);
      clearInterval(progressInterval);
    };
  }, [wrapId, router]);

  useEffect(() => {
    if (progress === 100 && wrap) {
      setTimeout(() => {
        router.push(`/wrap/${wrapId}`);
      }, 500);
    }
  }, [progress, wrap, wrapId, router]);

  const brandPrimary = wrap?.trips?.operators?.brand_color_1 || '#1B4D3E';
  const brandAccent = wrap?.trips?.operators?.brand_color_2 || '#F4C542';

  return (
    <div 
      className="flex min-h-screen flex-col items-center justify-center p-6 transition-colors duration-1000"
      style={{ background: `linear-gradient(135deg, ${brandPrimary} 0%, ${brandAccent} 100%)` }}
    >
      <div className="w-full max-w-sm flex flex-col items-center">
        <div className="relative h-40 w-40 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-xl border border-white/30 shadow-2xl mb-12">
          <AnimatePresence mode="wait">
            <motion.span
              key={currentStep}
              initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 1.5, opacity: 0, rotate: 20 }}
              className="text-7xl"
            >
              {LOADING_STEPS[currentStep].emoji}
            </motion.span>
          </AnimatePresence>
          
          {/* Animated rings */}
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-0 rounded-full border border-white/40" 
          />
        </div>

        <div className="text-center space-y-2 mb-12">
          <motion.h2 
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-black text-white"
          >
            {LOADING_STEPS[currentStep].text}
          </motion.h2>
          <p className="text-white/60 font-bold tracking-widest uppercase text-[10px]">
            Please wait a moment
          </p>
        </div>

        {/* Localized Progress Bar */}
        <div className="w-full h-2 bg-black/10 rounded-full overflow-hidden backdrop-blur-md border border-white/10">
          <motion.div 
            className="h-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)]"
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-2 text-white/40 font-black text-xs">{progress}%</p>
      </div>

      <div className="absolute bottom-10 left-0 right-0 text-center">
        <p className="text-white/20 text-[10px] font-bold uppercase tracking-[0.3em]">SAFARIWRAP BY {wrap?.trips?.operators?.business_name?.toUpperCase() || 'SAFARIWRAP'}</p>
      </div>
    </div>
  );
}

export default function LoadingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-forest" />}>
      <LoadingPageContent />
    </Suspense>
  );
}
