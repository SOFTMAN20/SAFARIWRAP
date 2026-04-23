'use client';

import { motion } from 'framer-motion';
import { WrapData } from '@/lib/wrap-engine';
import { Camera } from 'lucide-react';
import Image from 'next/image';

interface PhotosSlideProps {
  wrapData: WrapData;
}

export default function PhotosSlide({ wrapData }: PhotosSlideProps) {
  const photos = wrapData.guest_photos.filter(Boolean);
  
  // If no photos, use placeholder safari images
  const displayPhotos = photos.length > 0 ? photos : [
    'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&q=80', // Lion
    'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=800&q=80', // Elephant
    'https://images.unsplash.com/photo-1551969014-7d2c4cddf0b6?w=800&q=80', // Giraffe
  ];

  return (
    <div 
      className="w-full h-full flex flex-col items-center justify-center p-8 text-white"
      style={{
        background: `linear-gradient(135deg, #1A237E 0%, #283593 100%)`,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <Camera className="w-16 h-16 mx-auto mb-4" />
        <h2 className="text-3xl md:text-5xl font-bold mb-2">
          {photos.length > 0 ? 'Your Photos' : 'Safari Memories'}
        </h2>
        <p className="text-lg opacity-80">
          {photos.length > 0 ? 'Captured memories' : 'Wildlife encounters'}
        </p>
      </motion.div>

      <div className={`grid gap-3 max-w-4xl w-full ${
        displayPhotos.length === 1 ? 'grid-cols-1 max-w-md' : 
        displayPhotos.length === 2 ? 'grid-cols-2 max-w-2xl' : 
        displayPhotos.length === 3 ? 'grid-cols-2 md:grid-cols-3' :
        displayPhotos.length === 4 ? 'grid-cols-2' :
        'grid-cols-2 md:grid-cols-3'
      }`}>
        {displayPhotos.slice(0, 5).map((photo, index) => (
          <motion.div
            key={`${photo}-${index}`}
            initial={{ scale: 0, opacity: 0, rotate: -10 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ 
              duration: 0.5, 
              delay: 0.2 + index * 0.1,
              type: 'spring',
              stiffness: 200,
            }}
            className={`relative rounded-2xl overflow-hidden bg-white/10 backdrop-blur-sm ${
              displayPhotos.length === 1 ? 'aspect-[4/5]' :
              displayPhotos.length === 5 && index === 4 ? 'col-span-2 md:col-span-1 aspect-square' :
              'aspect-square'
            }`}
          >
            <Image
              src={photo}
              alt={`Photo ${index + 1}`}
              fill
              className="object-cover"
              unoptimized={photo.startsWith('https://images.unsplash.com')}
            />
          </motion.div>
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="mt-8 text-lg opacity-70"
      >
        {photos.length > 0 
          ? `${photos.length} ${photos.length === 1 ? 'photo' : 'photos'} shared`
          : 'Sample safari photos'
        }
      </motion.p>
    </div>
  );
}
