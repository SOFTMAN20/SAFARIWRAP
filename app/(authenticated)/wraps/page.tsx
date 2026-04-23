'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Search,
  Filter,
  Eye,
  Download,
  Share2,
  Calendar,
  User,
  Star,
  ExternalLink,
  Image as ImageIcon,
  X,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { format } from 'date-fns';

const supabase = createClient();

interface Wrap {
  id: string;
  guest_name: string;
  created_at: string;
  event_id: string;
  events: {
    title: string;
    type: string;
  };
}

export default function WrapsPage() {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'safari' | 'marathon' | 'tour'>('all');

  // Prevent hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch all wraps for operator's events
  const { data: wraps, isLoading } = useQuery({
    queryKey: ['operator-wraps', user?.id, filterType],
    queryFn: async () => {
      if (!user?.id) return [];

      // Get operator's event IDs
      const { data: events } = await supabase
        .from('events')
        .select('id, type')
        .eq('operator_id', user.id);

      const eventIds = events?.map(e => e.id) || [];
      if (eventIds.length === 0) return [];

      // Build query
      let query = supabase
        .from('wraps')
        .select('id, guest_name, created_at, event_id, events!inner(title, type)')
        .in('event_id', eventIds)
        .order('created_at', { ascending: false });

      // Apply type filter
      if (filterType !== 'all') {
        query = query.eq('events.type', filterType);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Wrap[];
    },
    enabled: !!user?.id && mounted,
    staleTime: 2 * 60 * 1000,
  });

  // Filter by search query
  const filteredWraps = wraps?.filter(wrap =>
    wrap.guest_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    wrap.events.title.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleShare = async (wrapId: string) => {
    const url = `${window.location.origin}/wrap/${wrapId}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Safari Wrap',
          url: url,
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  // Show loading state until mounted
  if (!mounted) {
    return (
      <div className="flex-1 p-4 sm:p-6 lg:p-12 bg-gradient-to-br from-parchment to-white min-h-screen">
        <div className="animate-pulse space-y-8">
          <div className="h-12 bg-gray-200 rounded w-1/3" />
          <div className="h-10 bg-gray-200 rounded w-full max-w-md" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="h-24 bg-gray-200 rounded" />
            <div className="h-24 bg-gray-200 rounded" />
            <div className="h-24 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-12 bg-gradient-to-br from-parchment to-white min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-savanna to-savanna-dark flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl lg:text-5xl font-extrabold text-forest">
              Guest Wraps
            </h1>
            <p className="text-stone font-semibold">
              View and manage all generated wraps
            </p>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6 flex flex-col sm:flex-row gap-4"
      >
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone pointer-events-none" />
          <Input
            type="text"
            placeholder="Search by guest name or event..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10 bg-white border-dust focus:border-forest"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone hover:text-forest transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Type Filter */}
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={filterType === 'all' ? 'default' : 'outline'}
            onClick={() => setFilterType('all')}
            className={filterType === 'all' ? 'bg-forest hover:bg-forest-light' : ''}
          >
            All
          </Button>
          <Button
            variant={filterType === 'safari' ? 'default' : 'outline'}
            onClick={() => setFilterType('safari')}
            className={filterType === 'safari' ? 'bg-forest hover:bg-forest-light' : ''}
          >
            Safari
          </Button>
          <Button
            variant={filterType === 'marathon' ? 'default' : 'outline'}
            onClick={() => setFilterType('marathon')}
            className={filterType === 'marathon' ? 'bg-forest hover:bg-forest-light' : ''}
          >
            Marathon
          </Button>
          <Button
            variant={filterType === 'tour' ? 'default' : 'outline'}
            onClick={() => setFilterType('tour')}
            className={filterType === 'tour' ? 'bg-forest hover:bg-forest-light' : ''}
          >
            Tour
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8"
      >
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-savanna/10 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-savanna" />
              </div>
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-extrabold text-forest truncate">
                  {filteredWraps.length}
                </p>
                <p className="text-xs sm:text-sm text-stone font-semibold truncate">
                  {searchQuery || filterType !== 'all' ? 'Filtered Wraps' : 'Total Wraps'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
              </div>
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-extrabold text-forest truncate">
                  {new Set(filteredWraps.map(w => w.guest_name)).size}
                </p>
                <p className="text-xs sm:text-sm text-stone font-semibold truncate">Unique Guests</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
              </div>
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-extrabold text-forest truncate">
                  {filteredWraps.filter(w => {
                    const date = new Date(w.created_at);
                    const now = new Date();
                    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
                    return diffDays <= 7;
                  }).length}
                </p>
                <p className="text-xs sm:text-sm text-stone font-semibold truncate">This Week</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Wraps Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6 space-y-4">
                <div className="h-6 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="flex gap-2">
                  <div className="h-9 bg-gray-200 rounded flex-1" />
                  <div className="h-9 bg-gray-200 rounded w-9" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredWraps.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
        >
          {filteredWraps.map((wrap, i) => (
            <motion.div
              key={wrap.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="w-full"
            >
              <Card className="hover:shadow-xl transition-all hover:-translate-y-1 h-full flex flex-col">
                <CardContent className="p-4 sm:p-6 flex flex-col flex-1">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2 mb-3 sm:mb-4 min-w-0">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-base sm:text-lg text-forest mb-1 truncate">
                        {wrap.guest_name}
                      </h3>
                      <p className="text-xs sm:text-sm text-stone font-semibold truncate">
                        {wrap.events.title}
                      </p>
                    </div>
                    <Badge variant="secondary" className="flex-shrink-0 text-xs">
                      {wrap.events.type}
                    </Badge>
                  </div>

                  {/* Date */}
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-stone mb-3 sm:mb-4">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="truncate">{format(new Date(wrap.created_at), 'MMM d, yyyy')}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-auto">
                    <Link href={`/wrap/${wrap.id}`} className="flex-1 min-w-0">
                      <Button className="w-full bg-forest hover:bg-forest-light text-white text-sm">
                        <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                        <span className="truncate">View</span>
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleShare(wrap.id)}
                      title="Share wrap"
                      className="flex-shrink-0 h-9 w-9 sm:h-10 sm:w-10"
                    >
                      <Share2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-savanna/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-savanna/40" />
              </div>
              <h3 className="text-xl font-bold text-forest mb-2">No Wraps Yet</h3>
              <p className="text-stone mb-6">
                {searchQuery
                  ? `No wraps found matching "${searchQuery}"`
                  : 'Wraps will appear here as guests submit reviews'}
              </p>
              {!searchQuery && (
                <Link href="/create-trip">
                  <Button className="bg-forest hover:bg-forest-light text-white">
                    Create Your First Event
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
