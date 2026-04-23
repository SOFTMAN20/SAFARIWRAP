'use client';

import { motion } from 'framer-motion';
import { WrapData } from '@/lib/wrap-engine';

interface ImpactSlideProps {
  wrapData: WrapData;
}

export default function ImpactSlide({ wrapData }: ImpactSlideProps) {
  const { trees_planted, co2_offset_kg } = wrapData.environmental_impact;

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
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Conservation Legacy
          </h2>
          <p className="text-base text-gray-600 leading-relaxed">
            In celebration of your journey, {wrapData.operator.business_name} has planted {trees_planted === 1 ? 'a' : trees_planted} indigenous tree{trees_planted > 1 ? 's' : ''} in the Transmara region.
          </p>
        </motion.div>

        {/* Impact Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100"
        >
          {/* Certificate Number */}
          <div className="text-center mb-6">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-4">
              IMPACT VERIFIED CERT. #{Math.floor(Math.random() * 900000) + 100000}
            </p>
            
            {/* GPS Location */}
            <div className="mb-2">
              <p className="text-sm text-gray-500 uppercase tracking-wider mb-2">
                TREE GPS LOCATION
              </p>
              <p className="text-xl font-mono font-bold text-gray-800">
                1.2858° S, 36.8219° E
              </p>
            </div>
          </div>

          {/* Tree Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4, type: 'spring' }}
            className="text-center my-8"
          >
            <div className="text-6xl mb-4">🌳</div>
            <div className="text-4xl font-bold text-gray-800 mb-2">
              {trees_planted}
            </div>
            <div className="text-sm text-gray-500 uppercase tracking-wider">
              {trees_planted === 1 ? 'TREE PLANTED' : 'TREES PLANTED'}
            </div>
          </motion.div>

          {/* CO2 Offset */}
          <div className="text-center pt-6 border-t border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Annual CO₂ Offset</p>
            <p className="text-2xl font-bold text-gray-800">{co2_offset_kg} kg</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
