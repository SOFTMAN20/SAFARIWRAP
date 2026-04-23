'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type WrapData } from '@/lib/wrap-engine';
import { type EventType } from '@/lib/types/events';
import IntroSlide from './slides/IntroSlide';
import StatsSlide from './slides/StatsSlide';
import SafariSlide from './slides/SafariSlide';
import MarathonSlide from './slides/MarathonSlide';
import TourSlide from './slides/TourSlide';
import SinglePhotoSlide from './slides/SinglePhotoSlide';
import HighlightsSlide from './slides/HighlightsSlide';
import ImpactSlide from './slides/ImpactSlide';
import OutroSlide from './slides/OutroSlide';

interface WrapContainerProps {
  wrapData: any;
}

export default function WrapContainer({ wrapData }: WrapContainerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);

  // Transform the data to match the expected format
  const transformedData: WrapData = {
    // Event Info
    event_id: wrapData.data?.event?.id || wrapData.event_id || '',
    event_type: (wrapData.data?.event?.type || 'safari') as EventType,
    event_title: wrapData.data?.event?.title || 'Safari Adventure',
    event_location: wrapData.data?.event?.location || 'Tanzania',
    event_dates: {
      start: wrapData.data?.event?.start_date || new Date().toISOString(),
      end: wrapData.data?.event?.end_date || new Date().toISOString(),
    },
    
    // Guest Info (for individual wraps) - use aggregated data if available
    guest_name: wrapData.guest_name || 'Guest',
    guest_rating: wrapData.data?.statistics?.average_rating || wrapData.data?.guest?.rating || 5,
    guest_review: wrapData.data?.guest?.review_text || '',
    // Use all photos from the event - ensure we filter out nulls
    guest_photos: Array.isArray(wrapData.data?.photos?.all_photos) 
      ? wrapData.data.photos.all_photos.filter((p: any) => p !== null && p !== undefined && p !== '')
      : [],
    
    // Aggregated Stats (from all reviews)
    stats: {
      total_reviews: wrapData.data?.statistics?.total_reviews || 1,
      average_rating: wrapData.data?.statistics?.average_rating || 5,
      total_photos: wrapData.data?.photos?.total_photos || 0,
      total_guests: wrapData.data?.statistics?.total_reviews || 1,
    },
    
    // Safari Data (aggregated from all reviews)
    safari_data: wrapData.data?.safari_data ? {
      top_animal: wrapData.data.safari_data.most_seen_animal || 'Lion',
      total_species: wrapData.data.safari_data.animal_sightings?.length || 0,
      big_five_count: (() => {
        // Count Big Five from aggregated animal sightings
        const bigFive = ['Lion', 'Elephant', 'Buffalo', 'Leopard', 'Rhino'];
        const sightings = wrapData.data.safari_data.animal_sightings || [];
        return sightings.filter((s: any) => bigFive.includes(s.animal)).length;
      })(),
      big_five_seen: (() => {
        // Extract Big Five animals that were seen
        const bigFive = ['Lion', 'Elephant', 'Buffalo', 'Leopard', 'Rhino'];
        const sightings = wrapData.data.safari_data.animal_sightings || [];
        return sightings
          .filter((s: any) => bigFive.includes(s.animal))
          .map((s: any) => s.animal);
      })(),
      other_animals: (() => {
        // Extract non-Big Five animals
        const bigFive = ['Lion', 'Elephant', 'Buffalo', 'Leopard', 'Rhino'];
        const sightings = wrapData.data.safari_data.animal_sightings || [];
        return sightings
          .filter((s: any) => !bigFive.includes(s.animal))
          .map((s: any) => s.animal);
      })(),
      species_breakdown: wrapData.data.safari_data.animal_sightings || [],
    } : {
      top_animal: 'Lion',
      total_species: 0,
      big_five_count: 0,
      big_five_seen: [],
      other_animals: [],
      species_breakdown: [],
    },
    
    // Highlights
    highlights: {
      best_photo: wrapData.data?.photos?.highlight_photo || 
                  (Array.isArray(wrapData.data?.photos?.all_photos) && wrapData.data.photos.all_photos.length > 0
                    ? wrapData.data.photos.all_photos[0] 
                    : null),
      memorable_moment: wrapData.data?.guest?.memorable_moment || null,
      top_rated_aspect: 'Wildlife viewing',
    },
    
    // Operator Branding (from events.operators join)
    operator: {
      business_name: Array.isArray(wrapData.events) 
        ? wrapData.events[0]?.operators?.business_name || 'Safari Operator'
        : wrapData.events?.operators?.business_name || 'Safari Operator',
      brand_color_1: Array.isArray(wrapData.events)
        ? wrapData.events[0]?.operators?.brand_color_1 || '#1B4D3E'
        : wrapData.events?.operators?.brand_color_1 || '#1B4D3E',
      brand_color_2: Array.isArray(wrapData.events)
        ? wrapData.events[0]?.operators?.brand_color_2 || '#F4C542'
        : wrapData.events?.operators?.brand_color_2 || '#F4C542',
      logo_url: Array.isArray(wrapData.events)
        ? wrapData.events[0]?.operators?.logo_url || null
        : wrapData.events?.operators?.logo_url || null,
    },
    
    // Environmental Impact (from database)
    environmental_impact: {
      trees_planted: wrapData.data?.environmental_impact?.trees_planted || 1,
      co2_offset_kg: wrapData.data?.environmental_impact?.co2_offset_kg || 22,
    },
  };

  // Create individual photo slides (maximum 5 photos)
  const photoSlides = transformedData.guest_photos
    .slice(0, 5) // Take only first 5 photos
    .map((photoUrl, index) => (
      <SinglePhotoSlide
        key={`photo-${index}`}
        photoUrl={photoUrl}
        photoNumber={index + 1}
        totalPhotos={Math.min(transformedData.guest_photos.length, 5)}
        guestName={transformedData.guest_name}
      />
    ));

  const slides = [
    <IntroSlide key="intro" wrapData={transformedData} />,
    <StatsSlide key="stats" wrapData={transformedData} />,
    // Show event-type specific slide
    ...(transformedData.event_type === 'safari' ? [<SafariSlide key="safari" wrapData={transformedData} />] : []),
    ...(transformedData.event_type === 'marathon' ? [<MarathonSlide key="marathon" wrapData={transformedData} />] : []),
    ...(transformedData.event_type === 'tour' ? [<TourSlide key="tour" wrapData={transformedData} />] : []),
    // Individual photo slides
    ...photoSlides,
    <HighlightsSlide key="highlights" wrapData={transformedData} />,
    <ImpactSlide key="impact" wrapData={transformedData} />,
    <OutroSlide key="outro" wrapData={transformedData} />,
  ];

  const nextSlide = useCallback(() => {
    if (currentSlide < slides.length - 1) {
      setDirection(1);
      setCurrentSlide((prev) => prev + 1);
    }
  }, [currentSlide, slides.length]);

  const prevSlide = useCallback(() => {
    if (currentSlide > 0) {
      setDirection(-1);
      setCurrentSlide((prev) => prev - 1);
    }
  }, [currentSlide]);

  const goToSlide = useCallback((index: number) => {
    setDirection(index > currentSlide ? 1 : -1);
    setCurrentSlide(index);
  }, [currentSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        prevSlide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide]);

  // Swipe handler with optimized threshold
  const handleDragEnd = useCallback((e: any, info: PanInfo) => {
    const swipeThreshold = 50;
    const swipeVelocity = 300; // Reduced for more responsive swipes
    
    if (info.offset.x > swipeThreshold || info.velocity.x > swipeVelocity) {
      prevSlide();
    } else if (info.offset.x < -swipeThreshold || info.velocity.x < -swipeVelocity) {
      nextSlide();
    }
  }, [nextSlide, prevSlide]);

  // Animation variants for better performance
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0,
    }),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-forest via-forest-light to-savanna flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Mobile: Slide Container with swipe */}
        <div className="md:hidden relative aspect-[9/16] bg-parchment rounded-3xl shadow-2xl overflow-hidden">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentSlide}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 400, damping: 35 },
                opacity: { duration: 0.15 },
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={handleDragEnd}
              className="absolute inset-0 cursor-grab active:cursor-grabbing"
            >
              {slides[currentSlide]}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-lg transition-opacity disabled:opacity-30"
            onClick={prevSlide}
            disabled={currentSlide === 0}
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-lg transition-opacity disabled:opacity-30"
            onClick={nextSlide}
            disabled={currentSlide === slides.length - 1}
          >
            <ChevronRight className="w-6 h-6" />
          </Button>

          {/* Slide Indicators */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentSlide
                    ? 'bg-forest w-8'
                    : 'bg-forest/30 hover:bg-forest/50 w-2'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Desktop: Page Layout with vertical scroll */}
        <div className="hidden md:block space-y-0 bg-parchment rounded-3xl shadow-2xl overflow-hidden">
          {slides.map((slide, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="min-h-screen"
            >
              {slide}
            </motion.div>
          ))}
        </div>

        {/* Instructions - Mobile only */}
        <p className="md:hidden text-center text-white/60 text-sm mt-4">
          Swipe, use arrows, or keyboard • {currentSlide + 1} / {slides.length}
        </p>
      </div>
    </div>
  );
}
