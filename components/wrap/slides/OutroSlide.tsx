'use client';

import { motion } from 'framer-motion';
import { WrapData } from '@/lib/wrap-engine';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface OutroSlideProps {
  wrapData: WrapData;
}

export default function OutroSlide({ wrapData }: OutroSlideProps) {
  const handleShare = async () => {
    const shareUrl = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${wrapData.guest_name}'s ${wrapData.event_title} Wrap`,
          text: 'Check out my safari experience!',
          url: shareUrl,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="w-full bg-parchment py-12 px-6">
      <div className="max-w-2xl mx-auto text-center">
        {/* Operator Logo */}
        {wrapData.operator.logo_url && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="relative w-20 h-20 mx-auto">
              <Image
                src={wrapData.operator.logo_url}
                alt={wrapData.operator.business_name}
                fill
                className="object-contain"
              />
            </div>
          </motion.div>
        )}

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-6"
        >
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
            AUTHENTIC EXPEDITION LOG
          </p>
        </motion.div>

        {/* Main Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Keep the safari soul alive.
          </h2>
        </motion.div>

        {/* Share Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-8"
        >
          <Button
            onClick={handleShare}
            size="lg"
            className="bg-forest hover:bg-forest-light text-white px-8"
          >
            Share Story
          </Button>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-xs text-gray-400 uppercase tracking-wider"
        >
          POWERED BY SAFARIWRAP
        </motion.div>
      </div>
    </div>
  );
}
