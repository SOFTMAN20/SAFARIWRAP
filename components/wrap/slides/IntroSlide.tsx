'use client';

import { motion } from 'framer-motion';
import { WrapData } from '@/lib/wrap-engine';
import { MapPin } from 'lucide-react';
import Image from 'next/image';

interface IntroSlideProps {
  wrapData: WrapData;
}

export default function IntroSlide({ wrapData }: IntroSlideProps) {
  // Get current year for expedition badge
  const currentYear = new Date().getFullYear();
  
  // Get animal icons based on event type
  const getAnimalIcons = () => {
    if (wrapData.event_type === 'safari') {
      return ['🦁', '🐘', '🦏', '🐆', '🐃']; // Big Five
    } else if (wrapData.event_type === 'marathon') {
      return ['🏃', '🏔️', '🌟', '🏆', '💪']; // Marathon icons
    } else {
      return ['🌍', '🎯', '✨', '🎉', '🌟']; // Tour icons
    }
  };

  const icons = getAnimalIcons();
  const totalPhotos = wrapData.guest_photos.length;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-parchment relative">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        {/* Operator Logo (Small) */}
        {wrapData.operator.logo_url ? (
          <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center mb-4 mx-auto">
            <Image
              src={wrapData.operator.logo_url}
              alt={wrapData.operator.business_name}
              width={40}
              height={40}
              className="object-contain"
            />
          </div>
        ) : (
          <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center mb-4 mx-auto">
            <span className="text-white font-bold text-sm">
              {wrapData.operator.business_name.split(' ').map(w => w[0]).join('').slice(0, 2)}
            </span>
          </div>
        )}

        <p className="text-sm text-gray-500 uppercase tracking-wider mb-2">
          PRESENTED BY
        </p>
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          {wrapData.operator.business_name}
        </h3>
        <p className="text-sm text-gray-500 uppercase tracking-wider">
          AUTHENTIC {wrapData.event_type.toUpperCase()} LOG • VERIFIED IMPACT
        </p>
      </motion.div>

      {/* Main Card */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="w-full max-w-sm rounded-3xl p-8 text-white relative overflow-hidden"
        style={{
          background: wrapData.operator.brand_color_1 || '#1B4D3E',
        }}
      >
        {/* Operator Logo in Card (Top Left) */}
        {wrapData.operator.logo_url ? (
          <div className="absolute top-6 left-6 w-12 h-12 bg-white rounded-xl flex items-center justify-center">
            <Image
              src={wrapData.operator.logo_url}
              alt={wrapData.operator.business_name}
              width={32}
              height={32}
              className="object-contain"
            />
          </div>
        ) : (
          <div className="absolute top-6 left-6 w-12 h-12 bg-white rounded-xl flex items-center justify-center">
            <span className="text-gray-800 font-bold text-xs">
              {wrapData.operator.business_name.split(' ').map(w => w[0]).join('').slice(0, 2)}
            </span>
          </div>
        )}

        {/* Main Title */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 mb-8"
        >
          <h1 className="text-3xl font-bold leading-tight mb-4">
            {wrapData.guest_name}'s<br />
            Explorer Wrap
          </h1>
          
          <div className="flex items-center gap-2 text-lg opacity-90">
            <MapPin className="w-5 h-5" />
            <span>{wrapData.event_location}</span>
          </div>
        </motion.div>

        {/* Expedition Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="inline-block bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-semibold mb-6"
        >
          EXPEDITION {currentYear}
        </motion.div>

        {/* Animal Icons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="flex items-center gap-2"
        >
          {icons.slice(0, 3).map((icon, index) => (
            <div
              key={index}
              className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-xl"
            >
              {icon}
            </div>
          ))}
          {totalPhotos > 3 && (
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-sm font-semibold">
              +{Math.min(totalPhotos - 3, 99)}
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Heart Icon at Bottom */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 1.2, type: 'spring' }}
        className="mt-8"
      >
        <div className="w-12 h-12 border-2 border-gray-300 rounded-full flex items-center justify-center">
          <span className="text-2xl">🤍</span>
        </div>
      </motion.div>
    </div>
  );
}
