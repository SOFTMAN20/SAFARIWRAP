'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  TreePine, 
  Heart, 
  Share2, 
  Download,
  ArrowRight,
  Sparkles,
  Camera
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PoweredByFooter } from '../../_components/PoweredByFooter';

// Wrapper component with Suspense boundary
export default function ReviewSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-parchment flex items-center justify-center">Loading...</div>}>
      <ReviewSuccessContent />
    </Suspense>
  );
}

function ReviewSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get('event');
  
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEventData = async () => {
      if (!eventId) {
        setLoading(false);
        return;
      }
      
      try {
        // In a real app, this would fetch the event data
        // For demo, we'll use mock data
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockEvent = {
          id: eventId,
          title: 'Serengeti Migration Safari',
          type: 'safari',
          location: 'Serengeti National Park',
          operator: {
            business_name: 'Safari Adventures Co.',
            brand_color_1: '#1B4D3E',
            brand_color_2: '#F4C542',
            logo_url: null,
          }
        };
        
        setEvent(mockEvent);
      } catch (error) {
        console.error('Failed to load event:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEventData();
  }, [eventId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-parchment flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="h-8 w-8 text-forest" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-parchment">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-dust">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-3">
            <div 
              className="h-10 w-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: event?.operator.brand_color_1 || '#1B4D3E' }}
            >
              {event?.operator.logo_url ? (
                <img 
                  src={event.operator.logo_url} 
                  alt="Logo" 
                  className="h-8 w-8 rounded-lg object-cover"
                />
              ) : (
                <Heart className="h-5 w-5 text-white" />
              )}
            </div>
            <div>
              <h1 className="font-black text-forest">{event?.operator.business_name || 'Safari Operator'}</h1>
              <p className="text-xs text-stone font-bold uppercase tracking-wider">Review Complete</p>
            </div>
          </div>
        </div>
      </div>

      {/* Success Content */}
      <div className="max-w-2xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6"
          >
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </motion.div>
          
          <h1 className="text-3xl lg:text-4xl font-black text-forest mb-4">
            Thank You for Your Review!
          </h1>
          <p className="text-lg text-stone leading-relaxed">
            Your feedback helps us improve and creates lasting memories for future adventurers.
          </p>
        </motion.div>

        {/* What Happens Next */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="mb-8">
            <CardContent className="p-8">
              <h2 className="text-xl font-black text-forest mb-6 flex items-center">
                <Sparkles className="h-5 w-5 mr-2" />
                What happens next?
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-forest text-white flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <div>
                    <h3 className="font-bold text-forest mb-1">Wrap Generation</h3>
                    <p className="text-stone text-sm">
                      We're creating your personalized safari wrap with your photos and memories. 
                      This usually takes a few minutes.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-forest text-white flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <div>
                    <h3 className="font-bold text-forest mb-1">Environmental Impact</h3>
                    <p className="text-stone text-sm">
                      Based on your review, we'll plant 1-3 trees in Tanzania through our partnership 
                      with the Kilimanjaro Project.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-forest text-white flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <div>
                    <h3 className="font-bold text-forest mb-1">Share Your Story</h3>
                    <p className="text-stone text-sm">
                      Once ready, you'll receive a link to view and share your personalized wrap 
                      with friends and family.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Environmental Impact Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="mb-8 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <CardContent className="p-8">
              <div className="flex items-center space-x-4 mb-4">
                <TreePine className="h-8 w-8 text-green-600" />
                <div>
                  <h3 className="font-black text-green-800">Your Environmental Impact</h3>
                  <p className="text-green-600">Making a difference, one review at a time</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-2xl font-black text-green-800">1-3</p>
                  <p className="text-sm text-green-600">Trees to be planted</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black text-green-800">22kg</p>
                  <p className="text-sm text-green-600">CO₂ offset per tree/year</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black text-green-800">GPS</p>
                  <p className="text-sm text-green-600">Tracked location</p>
                </div>
              </div>
              
              <p className="text-sm text-green-700 leading-relaxed">
                You'll receive a certificate with GPS coordinates of your trees and can track 
                their growth through our conservation dashboard.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => router.push('/')}
          >
            Return Home
          </Button>
          <Button 
            className="flex-1"
            style={{ backgroundColor: event?.operator.brand_color_1 || '#1B4D3E' }}
            onClick={() => {
              // In a real app, this would check for wrap completion
              alert('Your wrap is still being generated. You\'ll receive a notification when it\'s ready!');
            }}
          >
            Check Wrap Status
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-12 text-center"
        >
          <div className="bg-white/50 rounded-xl p-6 border border-dust">
            <h4 className="font-bold text-forest mb-2">Questions or Issues?</h4>
            <p className="text-sm text-stone mb-4">
              If you have any questions about your review or wrap, feel free to contact the operator directly.
            </p>
            <Badge variant="outline" className="text-xs">
              Review ID: {eventId?.slice(-8).toUpperCase() || 'UNKNOWN'}
            </Badge>
          </div>
        </motion.div>
      </div>

      <div className="pb-16">
        <PoweredByFooter />
      </div>
    </div>
  );
}