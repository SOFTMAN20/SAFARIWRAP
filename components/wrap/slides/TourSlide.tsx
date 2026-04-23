'use client';

import { motion } from 'framer-motion';
import { WrapData } from '@/lib/wrap-engine';
import { Map, MapPin, Users, Star } from 'lucide-react';

interface TourSlideProps {
  wrapData: WrapData;
}

export default function TourSlide({ wrapData }: TourSlideProps) {
  // Tour data would come from wrapData.metadata or similar
  const tourData = {
    locationsVisited: ['Stone Town', 'Spice Farms', 'Jozani Forest', 'Beach Resort'],
    totalLocations: 4,
    favoriteLocation: 'Spice Farms',
    guideRating: 5,
  };

  return (
    <div 
      className="w-full h-full flex flex-col items-center justify-center p-8 text-white overflow-y-auto"
      style={{
        background: `linear-gradient(135deg, #00695C 0%, #00897B 100%)`,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-6"
      >
        <Map className="w-16 h-16 mx-auto mb-4" />
        <h2 className="text-3xl md:text-5xl font-bold mb-2">Your Tour</h2>
        <p className="text-lg opacity-80">Places explored</p>
      </motion.div>

      {/* Total Locations */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2, type: 'spring' }}
        className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6 text-center max-w-md w-full"
      >
        <div className="text-6xl mb-3">🗺️</div>
        <div className="text-xl font-semibold mb-1">Locations Visited</div>
        <div className="text-5xl font-bold">{tourData.totalLocations}</div>
      </motion.div>

      {/* Locations List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 max-w-md w-full mb-6"
      >
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <MapPin className="w-6 h-6" />
          Tour Highlights
        </h3>
        
        <div className="space-y-3">
          {tourData.locationsVisited.map((location, index) => (
            <motion.div
              key={location}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
              className={`flex items-center gap-3 p-3 rounded-lg ${
                location === tourData.favoriteLocation
                  ? 'bg-yellow-500/20 border border-yellow-500/30'
                  : 'bg-white/5'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold">
                {index + 1}
              </div>
              <span className="flex-1">{location}</span>
              {location === tourData.favoriteLocation && (
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Guide Rating */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1 }}
        className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 max-w-md w-full"
      >
        <div className="flex items-center gap-4">
          <Users className="w-12 h-12 flex-shrink-0 text-blue-300" />
          <div className="flex-1">
            <div className="text-sm opacity-80 mb-2">Tour Guide Rating</div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-6 h-6 ${
                    star <= tourData.guideRating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-white/30'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Cultural Experience Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 1.2 }}
        className="mt-6 bg-gradient-to-r from-blue-500/20 to-teal-500/20 backdrop-blur-sm rounded-xl p-4 border border-blue-500/30 max-w-md w-full"
      >
        <div className="text-center">
          <div className="text-4xl mb-2">🌍</div>
          <div className="text-lg font-semibold">Cultural Explorer!</div>
          <div className="text-sm opacity-90 mt-1">
            You discovered amazing places
          </div>
        </div>
      </motion.div>
    </div>
  );
}
