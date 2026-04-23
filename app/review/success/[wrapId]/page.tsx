'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Share2, 
  Eye, 
  Heart,
  TreePine,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function ReviewSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const wrapId = params.wrapId as string;
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    // Countdown timer and auto-redirect
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push(`/wrap/guest/${wrapId}`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [wrapId, router]);

  const handleViewWrap = () => {
    router.push(`/wrap/guest/${wrapId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-forest via-forest-light to-savanna flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Success Animation */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="text-center mb-8"
        >
          <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl md:text-5xl font-extrabold text-white mb-4"
          >
            Thank You! 🎉
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-white/90"
          >
            Your safari review has been submitted successfully!
          </motion.p>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="shadow-2xl">
            <CardContent className="p-8">
              {/* Wrap Ready Message */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-forest to-savanna mb-4">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-forest mb-2">
                  Your Personal Wrap is Ready!
                </h2>
                <p className="text-stone">
                  We've created a beautiful visual story of your safari experience
                </p>
              </div>

              {/* Features Grid */}
              <div className="grid md:grid-cols-3 gap-4 mb-8">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 }}
                  className="text-center p-4 bg-forest/5 rounded-xl"
                >
                  <Heart className="w-8 h-8 text-red-500 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-forest">Your Photos</p>
                  <p className="text-xs text-stone">Beautifully displayed</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 }}
                  className="text-center p-4 bg-savanna/5 rounded-xl"
                >
                  <Sparkles className="w-8 h-8 text-savanna mx-auto mb-2" />
                  <p className="text-sm font-semibold text-forest">Your Story</p>
                  <p className="text-xs text-stone">Personalized for you</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.9 }}
                  className="text-center p-4 bg-green-50 rounded-xl"
                >
                  <TreePine className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-forest">Tree Planted</p>
                  <p className="text-xs text-stone">For the environment</p>
                </motion.div>
              </div>

              {/* Environmental Impact */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 mb-8">
                <div className="flex items-start gap-3">
                  <TreePine className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-green-900 mb-1">
                      🌍 You're Making a Difference!
                    </p>
                    <p className="text-sm text-green-800">
                      Your review helps plant trees in Tanzania through our partnership 
                      with The Kilimanjaro Project. Together, we're restoring natural habitats!
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={handleViewWrap}
                  className="w-full bg-gradient-to-r from-forest to-forest-light hover:from-forest-light hover:to-forest text-white text-lg py-6"
                  size="lg"
                >
                  <Eye className="w-5 h-5 mr-2" />
                  View Your Wrap Now
                  {countdown > 0 && (
                    <Badge className="ml-2 bg-white/20 text-white border-0">
                      {countdown}s
                    </Badge>
                  )}
                </Button>

                <Link href={`/wrap/guest/${wrapId}`} className="block">
                  <Button
                    variant="outline"
                    className="w-full border-forest text-forest hover:bg-forest hover:text-white"
                    size="lg"
                  >
                    <Share2 className="w-5 h-5 mr-2" />
                    Share on Social Media
                  </Button>
                </Link>
              </div>

              {/* Auto-redirect message */}
              {countdown > 0 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-sm text-stone mt-4"
                >
                  Redirecting to your wrap in {countdown} second{countdown !== 1 ? 's' : ''}...
                </motion.p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mt-6 text-white/80 text-sm"
        >
          <p>
            Your wrap link has been saved. You can access it anytime to share with friends and family! 🦁✨
          </p>
        </motion.div>
      </div>
    </div>
  );
}
