'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { MapPin, Calendar, Users, ChevronRight, Compass } from 'lucide-react';
import { Trip } from '@/lib/types';
import { format } from 'date-fns';
import { tripsApi, reviewsApi } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface TripCardProps {
  trip: Trip;
}

export const TripCard: React.FC<TripCardProps> = ({ trip }) => {
  const queryClient = useQueryClient();
  const isCompleted = trip.status === 'Completed';

  // Prefetch trip data on hover for instant navigation
  const handleMouseEnter = () => {
    queryClient.prefetchQuery({
      queryKey: ['trip', trip.id],
      queryFn: () => tripsApi.getTripById(trip.id),
      staleTime: 1000 * 60 * 5,
    });
    queryClient.prefetchQuery({
      queryKey: ['trip-reviews', trip.id],
      queryFn: () => reviewsApi.getTripReviews(trip.id),
      staleTime: 1000 * 60 * 2,
    });
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'dd MMM yyyy');
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      onMouseEnter={handleMouseEnter}
      className="group"
    >
      <Card className="overflow-hidden hover:shadow-xl transition-all">
        <CardContent className="p-6 lg:p-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Date Badge - Desktop */}
            <div className="hidden lg:flex flex-col items-center justify-center p-4 bg-gradient-to-br from-forest/5 to-savanna/5 rounded-2xl border border-dust w-24 flex-shrink-0">
              <Compass className="h-6 w-6 text-forest mb-2" />
              <span className="text-[10px] font-black text-stone uppercase tracking-widest">
                {format(new Date(trip.start_date), 'MMM')}
              </span>
              <span className="text-2xl font-black text-forest leading-none my-1">
                {format(new Date(trip.start_date), 'dd')}
              </span>
              <div className="h-0.5 w-4 bg-savanna rounded-full" />
            </div>

            {/* Content */}
            <div className="flex-1 space-y-3 min-w-0">
              <div className="flex flex-col space-y-2">
                <Badge variant={isCompleted ? 'success' : 'secondary'} className="w-fit">
                  {trip.status}
                </Badge>
                <h3 className="text-xl lg:text-2xl font-black text-ink group-hover:text-forest transition-colors leading-tight">
                  {trip.trip_name}
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center text-stone text-sm font-bold">
                  <MapPin className="h-4 w-4 mr-2 text-forest" />
                  {trip.destination_names?.length > 0 ? (
                    <span className="truncate">
                      {trip.destination_names[0]}
                      {trip.destination_names.length > 1 && ` +${trip.destination_names.length - 1}`}
                    </span>
                  ) : (
                    'No destinations'
                  )}
                </div>
                <div className="flex items-center text-stone text-sm font-bold">
                  <Calendar className="h-4 w-4 mr-2 text-forest" />
                  <span className="hidden lg:inline">
                    {formatDate(trip.start_date)} — {formatDate(trip.end_date)}
                  </span>
                  <span className="lg:hidden">{formatDate(trip.start_date)}</span>
                </div>
              </div>

              {/* Guests & Action */}
              <div className="flex items-center justify-between pt-2 border-t border-dust/50">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    <Avatar className="h-8 w-8 border-2 border-white">
                      <AvatarFallback className="bg-forest text-white text-xs">4</AvatarFallback>
                    </Avatar>
                    <Avatar className="h-8 w-8 border-2 border-white">
                      <AvatarFallback className="bg-savanna text-forest text-xs">G</AvatarFallback>
                    </Avatar>
                    <Avatar className="h-8 w-8 border-2 border-white">
                      <AvatarFallback className="bg-dust text-stone text-xs">+</AvatarFallback>
                    </Avatar>
                  </div>
                  <span className="text-xs font-black text-stone/50 uppercase tracking-widest">
                    Guests
                  </span>
                </div>

                <Button asChild size="icon" variant="ghost" className="rounded-2xl hover:bg-forest hover:text-white">
                  <Link href={`/trip/${trip.id}`}>
                    <ChevronRight className="h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
