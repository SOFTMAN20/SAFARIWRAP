'use client';

import { motion } from 'framer-motion';
import { WrapData } from '@/lib/wrap-engine';
import { Star } from 'lucide-react';

interface StatsSlideProps {
  wrapData: WrapData;
}

export default function StatsSlide({ wrapData }: StatsSlideProps) {
  return (
    <div className="w-full bg-parchment py-12 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Rating Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="text-6xl font-bold text-gray-800 mb-2">
            {wrapData.guest_rating}/5
          </div>
          <div className="text-sm text-gray-500 uppercase tracking-wider mb-4">
            OVERALL SATISFACTION
          </div>
          
          {/* Star Rating */}
          <div className="flex items-center justify-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-6 h-6 ${
                  star <= wrapData.guest_rating
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'fill-gray-200 text-gray-200'
                }`}
              />
            ))}
          </div>
        </motion.div>

        {/* Species Count (Safari only) */}
        {wrapData.event_type === 'safari' && wrapData.safari_data && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center"
          >
            <div className="text-2xl mb-2">🐾</div>
            <div className="text-6xl font-bold text-gray-800 mb-2">
              {wrapData.safari_data.total_species}
            </div>
            <div className="text-sm text-gray-500 uppercase tracking-wider">
              SPECIES SPOTTED
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
