'use client';

import { motion } from 'framer-motion';
import { Camera, MapPin, Calendar, Star, Trees, Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShareButton } from '@/components/share/ShareButton';
import Image from 'next/image';

interface WrapViewerProps {
  wrap: any;
}

export function WrapViewer({ wrap }: WrapViewerProps) {
  const event = wrap.events;
  const operator = event?.operators;
  const wrapData = wrap.data || {};
  
  const primaryColor = operator?.brand_color_1 || '#1B4D3E';
  const accentColor = operator?.brand_color_2 || '#F4C542';

  const rating = wrapData.rating || 5;
  const treesPlanted = wrapData.trees_planted || 0;
  const photos = wrapData.photos || [];
  const highlights = wrapData.highlights || [];

  return (
    <div className="min-h-screen bg-parchment py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          {/* Operator Logo */}
          {operator?.logo_url && (
            <div className="mb-6">
              <div
                className="w-24 h-24 mx-auto rounded-3xl shadow-xl flex items-center justify-center overflow-hidden"
                style={{ backgroundColor: primaryColor }}
              >
                <Image
                  src={operator.logo_url}
                  alt={operator.business_name}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          <h1 className="text-4xl md:text-6xl font-extrabold text-forest mb-4">
            {wrap.guest_name}'s Safari Wrap
          </h1>
          
          <p className="text-xl text-stone font-semibold mb-6">
            {event?.title || 'Safari Adventure'}
          </p>

          {/* Share Button */}
          <div className="flex justify-center gap-4">
            <ShareButton
              wrapId={wrap.id}
              wrapData={{
                guestName: wrap.guest_name,
                eventTitle: event?.title,
                rating,
                treesPlanted,
              }}
              variant="default"
              size="lg"
            />
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Rating */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
              <CardContent className="p-6 text-center">
                <Star className="w-10 h-10 text-yellow-600 mx-auto mb-3 fill-yellow-600" />
                <div className="text-4xl font-extrabold text-yellow-700 mb-2">
                  {rating}/5
                </div>
                <div className="text-sm font-semibold text-yellow-600">
                  {'⭐'.repeat(rating)}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Trees Planted */}
          {treesPlanted > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="p-6 text-center">
                  <Trees className="w-10 h-10 text-green-600 mx-auto mb-3" />
                  <div className="text-4xl font-extrabold text-green-700 mb-2">
                    {treesPlanted}
                  </div>
                  <div className="text-sm font-semibold text-green-600">
                    Trees Planted
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Location */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-6 text-center">
                <MapPin className="w-10 h-10 text-blue-600 mx-auto mb-3" />
                <div className="text-lg font-extrabold text-blue-700 mb-2">
                  {event?.metadata?.destination_names?.[0] || event?.location || 'Tanzania'}
                </div>
                <div className="text-sm font-semibold text-blue-600">
                  Destination
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Photos Grid */}
        {photos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-12"
          >
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-forest mb-6 flex items-center gap-2">
                  <Camera className="w-6 h-6" />
                  Safari Memories
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {photos.map((photo: string, index: number) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                    >
                      <Image
                        src={photo}
                        alt={`Safari photo ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Highlights */}
        {highlights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-12"
          >
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-forest mb-6 flex items-center gap-2">
                  <Award className="w-6 h-6" />
                  Safari Highlights
                </h2>
                <div className="space-y-4">
                  {highlights.map((highlight: string, index: number) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-4 bg-parchment rounded-xl"
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                        style={{ backgroundColor: accentColor }}
                      >
                        <span className="text-white font-bold">{index + 1}</span>
                      </div>
                      <p className="text-stone font-semibold">{highlight}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <Card className="bg-gradient-to-br from-forest/5 to-savanna/5 border-forest/20">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-forest mb-4">
                Create Your Own Safari Wrap
              </h3>
              <p className="text-stone mb-6">
                Transform your safari experience into a beautiful digital story
              </p>
              <Button
                size="lg"
                className="bg-forest hover:bg-forest-light text-white"
                onClick={() => window.location.href = '/'}
              >
                Get Started
              </Button>
            </CardContent>
          </Card>

          {/* Operator Credit */}
          {operator && (
            <div className="mt-8 text-sm text-stone">
              <p>
                Safari organized by{' '}
                <span className="font-bold text-forest">
                  {operator.business_name}
                </span>
              </p>
              <p className="mt-2 text-xs">
                Powered by <span className="font-bold">SafariWrap</span> ✨
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
