'use client';

import { motion } from 'framer-motion';
import { WrapData } from '@/lib/wrap-engine';
import { MapPin } from 'lucide-react';

interface SafariSlideProps {
  wrapData: WrapData;
}

export default function SafariSlide({ wrapData }: SafariSlideProps) {
  const safariData = wrapData.safari_data;
  
  if (!safariData) return null;

  // Mock destinations - in production this would come from wrapData
  const destinations = [
    'Serengeti National Park',
    'Amboseli National Park',
    'Tsavo National Parks'
  ];

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
            <MapPin className="w-6 h-6 text-gray-600" />
            <h2 className="text-2xl font-bold text-gray-800">EXPLORED TERRITORY</h2>
          </div>
        </motion.div>

        {/* Destinations List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-4"
        >
          {destinations.map((destination, index) => (
            <motion.div
              key={destination}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-forest/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-forest" />
                </div>
                <div className="text-gray-800 font-medium">{destination}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
