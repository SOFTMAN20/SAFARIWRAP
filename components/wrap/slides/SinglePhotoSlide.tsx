'use client';

import { motion } from 'framer-motion';
import { Camera } from 'lucide-react';
import Image from 'next/image';

interface SinglePhotoSlideProps {
  photoUrl: string;
  photoNumber: number;
  totalPhotos: number;
  guestName: string;
}

export default function SinglePhotoSlide({ 
  photoUrl, 
  photoNumber, 
  totalPhotos,
  guestName
}: SinglePhotoSlideProps) {
  // Show header only for first photo
  const showHeader = photoNumber === 1;

  return (
    <div className="w-full bg-parchment py-6 px-6">
      {/* Header Section (only for first photo) */}
      {showHeader && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-4 mb-8 max-w-2xl mx-auto"
        >
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
            <Camera className="w-6 h-6 text-gray-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Moments Captured</h2>
            <p className="text-sm text-gray-500 uppercase tracking-wider">
              {totalPhotos} UNFORGOTTEN MOMENTS
            </p>
          </div>
        </motion.div>
      )}

      {/* Photo Container */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          duration: 0.6, 
          delay: showHeader ? 0.3 : 0,
          type: 'spring',
          stiffness: 200,
        }}
        className="w-full max-w-2xl mx-auto mb-6"
      >
        <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-lg bg-gray-100">
          <Image
            src={photoUrl}
            alt={`Photo ${photoNumber} by ${guestName}`}
            fill
            className="object-cover"
            priority={photoNumber === 1}
            unoptimized={photoUrl.startsWith('https://images.unsplash.com')}
          />
        </div>
      </motion.div>
    </div>
  );
}
