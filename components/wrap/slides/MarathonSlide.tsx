'use client';

import { motion } from 'framer-motion';
import { WrapData } from '@/lib/wrap-engine';
import { Trophy, Timer, TrendingUp, MapPin } from 'lucide-react';

interface MarathonSlideProps {
  wrapData: WrapData;
}

export default function MarathonSlide({ wrapData }: MarathonSlideProps) {
  // Marathon data would come from wrapData.metadata or similar
  const marathonData = {
    distance: '42.2 km',
    finishTime: '04:32:15',
    pace: '6:27 /km',
    elevation: '1,250 m',
  };

  return (
    <div 
      className="w-full h-full flex flex-col items-center justify-center p-8 text-white overflow-y-auto"
      style={{
        background: `linear-gradient(135deg, #C62828 0%, #E53935 100%)`,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-6"
      >
        <Trophy className="w-16 h-16 mx-auto mb-4" />
        <h2 className="text-3xl md:text-5xl font-bold mb-2">Your Marathon</h2>
        <p className="text-lg opacity-80">Performance highlights</p>
      </motion.div>

      {/* Distance */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2, type: 'spring' }}
        className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6 text-center max-w-md w-full"
      >
        <div className="text-6xl mb-3">🏃</div>
        <div className="text-xl font-semibold mb-1">Distance</div>
        <div className="text-4xl font-bold">{marathonData.distance}</div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="grid grid-cols-2 gap-4 mb-6 max-w-md w-full"
      >
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
          <Timer className="w-8 h-8 mx-auto mb-2 opacity-80" />
          <div className="text-2xl font-bold mb-1">{marathonData.finishTime}</div>
          <div className="text-sm opacity-80">Finish Time</div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
          <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-80" />
          <div className="text-2xl font-bold mb-1">{marathonData.pace}</div>
          <div className="text-sm opacity-80">Avg Pace</div>
        </div>
      </motion.div>

      {/* Elevation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 max-w-md w-full"
      >
        <div className="flex items-center gap-4">
          <MapPin className="w-12 h-12 flex-shrink-0 text-yellow-300" />
          <div>
            <div className="text-3xl font-bold mb-1">{marathonData.elevation}</div>
            <div className="text-sm opacity-80">Total Elevation Gain</div>
          </div>
        </div>
      </motion.div>

      {/* Achievement Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="mt-6 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-sm rounded-xl p-4 border border-yellow-500/30 max-w-md w-full"
      >
        <div className="text-center">
          <div className="text-4xl mb-2">🏆</div>
          <div className="text-lg font-semibold">Marathon Finisher!</div>
          <div className="text-sm opacity-90 mt-1">
            You conquered the challenge
          </div>
        </div>
      </motion.div>
    </div>
  );
}
