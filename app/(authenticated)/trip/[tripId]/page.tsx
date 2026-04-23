'use client';

import React, { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { 
  Calendar, 
  MapPin, 
  QrCode, 
  Copy, 
  CheckCircle2, 
  Users, 
  Clock,
  ArrowLeft,
  Share2,
  Star,
  Eye,
  MessageSquare,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function TripDetailsPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = use(params);
  const { user, loading: authLoading } = useAuth();
  const [copying, setCopying] = useState(false);
  const [qrSize, setQrSize] = useState(180);
  const router = useRouter();

  // Set QR size on client side only to avoid hydration mismatch
  React.useEffect(() => {
    const updateSize = () => {
      setQrSize(window.innerWidth < 640 ? 150 : 180);
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Optimized query - fetch all data separately for reliability
  const { data, isLoading: queryLoading, error } = useQuery({
    queryKey: ['event-details', tripId, user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      
      console.log('Fetching event:', tripId, 'for user:', user.id);
      
      // Get singleton Supabase client
      const supabase = createClient();
      
      // Fetch event, QR code, and reviews in parallel
      const [eventResult, qrResult, reviewsResult] = await Promise.all([
        supabase
          .from('events')
          .select('*')
          .eq('id', tripId)
          .eq('operator_id', user.id)
          .single(),
        supabase
          .from('qr_codes')
          .select('*')
          .eq('event_id', tripId)
          .maybeSingle(),
        supabase
          .from('reviews')
          .select('*')
          .eq('event_id', tripId)
          .order('created_at', { ascending: false })
      ]);

      if (eventResult.error) {
        console.error('Event fetch error:', eventResult.error);
        throw new Error(eventResult.error.message || 'Failed to load event');
      }
      
      if (reviewsResult.error) {
        console.error('Reviews fetch error:', reviewsResult.error);
      }
      
      console.log('Event loaded:', eventResult.data);
      console.log('QR code loaded:', qrResult.data);
      console.log('Reviews loaded:', reviewsResult.data?.length || 0);
      
      return {
        event: eventResult.data,
        qrCode: qrResult.data,
        reviews: reviewsResult.data || [],
      };
    },
    enabled: !authLoading && !!tripId && !!user?.id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
  });
  
  const isLoading = authLoading || queryLoading;

  const event = data?.event;
  const qrCode = data?.qrCode;
  const reviews = data?.reviews || [];

  // Show error state
  if (error) {
    return (
      <div className="flex-1 p-6 lg:p-12 flex flex-col items-center justify-center min-h-screen">
        <div className="text-6xl mb-6">⚠️</div>
        <h2 className="text-2xl font-bold text-forest mb-2">Error Loading Event</h2>
        <p className="text-stone mb-8 text-center max-w-md">
          {error instanceof Error ? error.message : 'Failed to load event details'}
        </p>
        <Button onClick={() => router.push('/trips')} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Events
        </Button>
      </div>
    );
  }

  const handleCopyLink = () => {
    const linkToCopy = qrCode?.code_url || event?.review_link;
    if (linkToCopy) {
      navigator.clipboard.writeText(linkToCopy);
      setCopying(true);
      setTimeout(() => setCopying(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 p-6 lg:p-12 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="inline-block mb-4"
          >
            <MapPin className="w-8 h-8 text-forest" />
          </motion.div>
          <p className="text-stone font-semibold">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex-1 p-6 lg:p-12 flex flex-col items-center justify-center min-h-screen">
        <div className="text-6xl mb-6">🗺️</div>
        <h2 className="text-2xl font-bold text-forest mb-2">Event Not Found</h2>
        <p className="text-stone mb-8">The event you're looking for doesn't exist.</p>
        <Button onClick={() => router.push('/trips')} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Events
        </Button>
      </div>
    );
  }

  const destinationNames = event.metadata?.destination_names || [];
  const tourLocations = event.metadata?.tour_locations || [];
  const locations = destinationNames.length > 0 ? destinationNames : tourLocations;

  return (
    <div className="flex-1 w-full max-w-full overflow-x-hidden p-3 sm:p-4 md:p-6 lg:p-8 xl:p-12 bg-parchment min-h-screen">
      {/* Header */}
      <div className="mb-4 sm:mb-6 lg:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <Button 
          variant="ghost"
          onClick={() => router.push('/trips')}
          className="self-start text-sm sm:text-base"
        >
          <ArrowLeft className="w-4 h-4 mr-2 flex-shrink-0" />
          <span className="truncate">Back to Events</span>
        </Button>

        <Badge className={
          event.status === 'completed' 
            ? 'bg-gray-100 text-gray-700' 
            : 'bg-blue-100 text-blue-700'
        }>
          {event.status === 'completed' ? 'Completed' : 'Upcoming'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-full">
        {/* Left Column: Event Info & QR */}
        <div className="xl:col-span-1 space-y-4 sm:space-y-6 w-full max-w-full">
          {/* Event Info Card */}
          <Card className="w-full overflow-hidden">
            <CardContent className="p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-forest mb-4 sm:mb-6 break-words">
                {event.title}
              </h2>
              
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-start gap-2 sm:gap-3">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-forest mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-stone uppercase">Schedule</p>
                    <p className="font-semibold text-ink text-sm sm:text-base break-words">
                      {format(new Date(event.start_date), 'MMM dd')} — {format(new Date(event.end_date), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>

                {locations.length > 0 && (
                  <div className="flex items-start gap-2 sm:gap-3">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-forest mt-0.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-stone uppercase">
                        {event.type === 'tour' ? 'Locations' : 'Destinations'}
                      </p>
                      <p className="font-semibold text-ink text-sm sm:text-base break-words">
                        {locations.join(', ')}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-2 sm:gap-3">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-forest mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-stone uppercase">Reviews</p>
                    <p className="font-semibold text-ink text-sm sm:text-base">
                      {reviews.length} Guest{reviews.length !== 1 ? 's' : ''} Recorded
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* QR Code Card */}
          <Card className="bg-gradient-to-br from-forest to-forest-light text-white w-full overflow-hidden">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col items-center">
                {/* QR Code Display */}
                <div className="bg-white p-3 sm:p-4 rounded-2xl mb-3 sm:mb-4 shadow-lg">
                  <QRCodeSVG 
                    value={qrCode?.code_url || event.review_link || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/review/${event.id}`}
                    size={qrSize}
                    level="H"
                    includeMargin={true}
                    imageSettings={{
                      src: "/logo.png",
                      height: qrSize > 150 ? 40 : 32,
                      width: qrSize > 150 ? 40 : 32,
                      excavate: true,
                    }}
                  />
                </div>
                
                {/* QR Analytics */}
                {qrCode && (
                  <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mb-3 sm:mb-4 px-3 sm:px-4 py-2 bg-white/10 rounded-xl max-w-full">
                    <div className="flex items-center gap-1.5">
                      <Eye className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="text-xs sm:text-sm font-semibold whitespace-nowrap">
                        {qrCode.scans_count} scans
                      </span>
                    </div>
                    {qrCode.short_code && (
                      <div className="text-xs font-mono bg-white/10 px-2 py-1 rounded truncate max-w-[120px]">
                        {qrCode.short_code}
                      </div>
                    )}
                  </div>
                )}
                
                {/* QR Code Info */}
                <h3 className="text-base sm:text-lg font-bold mb-2">Review Link</h3>
                <p className="text-xs sm:text-sm text-white/80 text-center mb-2 px-2 sm:px-4 max-w-full break-all">
                  {qrCode?.code_url || event.review_link || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/review/${event.id}`}
                </p>
                <p className="text-xs text-white/60 text-center mb-4 sm:mb-6 px-2 sm:px-4 max-w-full">
                  Share this QR code with guests to collect reviews
                </p>
                
                {/* Action Buttons */}
                <div className="flex w-full gap-2 max-w-full">
                  <Button 
                    onClick={handleCopyLink}
                    variant="secondary"
                    className="flex-1 min-w-0 text-xs sm:text-sm"
                  >
                    {copying ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                        <span className="truncate">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                        <span className="truncate">Copy Link</span>
                      </>
                    )}
                  </Button>
                  <Button variant="secondary" size="icon" className="flex-shrink-0">
                    <Share2 className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Reviews Feed */}
        <div className="xl:col-span-2 space-y-4 sm:space-y-6 w-full max-w-full">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-forest flex items-center gap-2 sm:gap-3">
              <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
              <span className="truncate">Guest Reviews</span>
              <Badge variant="secondary" className="flex-shrink-0">{reviews.length}</Badge>
            </h3>
          </div>

          {reviews.length > 0 ? (
            <div className="space-y-3 sm:space-y-4 w-full max-w-full">
              {reviews.map((review: any) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={review.id}
                  className="w-full"
                >
                  <Card className="w-full overflow-hidden">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-start gap-3 sm:gap-4 w-full">
                        {/* Guest Avatar */}
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-forest to-forest-light flex items-center justify-center text-white font-bold text-base sm:text-lg flex-shrink-0">
                          {review.guest_name.charAt(0).toUpperCase()}
                        </div>

                        <div className="flex-1 min-w-0 w-full">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="min-w-0 flex-1">
                              <h4 className="font-bold text-ink text-sm sm:text-base truncate">
                                {review.guest_name}
                              </h4>
                              <div className="flex items-center text-stone text-xs mt-1">
                                <Clock className="w-3 h-3 mr-1 flex-shrink-0" />
                                <span className="truncate">
                                  {format(new Date(review.created_at), 'MMMM dd, yyyy')}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 bg-accent/10 px-2 py-1 rounded-lg flex-shrink-0">
                              <Star className="w-3 h-3 sm:w-4 sm:h-4 text-accent fill-accent" />
                              <span className="text-xs sm:text-sm font-bold text-accent">
                                {review.star_rating}
                              </span>
                            </div>
                          </div>
                          
                          {review.review_text && (
                            <p className="text-ink leading-relaxed italic mb-3 sm:mb-4 text-sm sm:text-base break-words">
                              "{review.review_text}"
                            </p>
                          )}

                          {/* Safari-specific: Big Five */}
                          {review.metadata?.big_five_seen && (
                            <div className="flex flex-wrap gap-1.5 sm:gap-2">
                              {review.metadata.big_five_seen.split(',').map((animal: string, idx: number) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {animal.trim()}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="w-full overflow-hidden">
              <CardContent className="p-8 sm:p-12 text-center">
                <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">🏜️</div>
                <h4 className="text-lg sm:text-xl font-bold text-ink mb-2">No reviews yet</h4>
                <p className="text-stone text-sm sm:text-base max-w-md mx-auto px-4">
                  Share the review link with your guests to start collecting their feedback!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
