'use client';

import { motion } from 'framer-motion';
import { WrapData } from '@/lib/wrap-engine';

interface HighlightsSlideProps {
  wrapData: WrapData;
}

export default function HighlightsSlide({ wrapData }: HighlightsSlideProps) {
  return (
    <div className="w-full bg-parchment py-12 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-3xl">🦁</span>
            <h2 className="text-2xl font-bold text-gray-800">HIGHLIGHT STORY</h2>
          </div>
        </motion.div>

        {/* Guest Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center"
        >
          {/* Guest Name */}
          <div className="mb-4">
            <h3 className="text-2xl font-bold text-gray-800 mb-1">
              {wrapData.guest_name}
            </h3>
            <p className="text-sm text-gray-500 uppercase tracking-wider">
              GUEST EXPLORER
            </p>
          </div>

          {/* Memorable Moment */}
          {wrapData.highlights.memorable_moment && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-6 pt-6 border-t border-gray-100"
            >
              <p className="text-lg text-gray-700 leading-relaxed italic">
                "{wrapData.highlights.memorable_moment}"
              </p>
            </motion.div>
          )}

          {/* Review Text */}
          {wrapData.guest_review && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-6 pt-6 border-t border-gray-100"
            >
              <p className="text-base text-gray-600 leading-relaxed">
                {wrapData.guest_review}
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
