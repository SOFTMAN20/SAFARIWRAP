'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Share2, Download, ArrowLeft, Facebook, Twitter, Instagram, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import GuestWrap from '@/components/wrap/GuestWrapPage';
import { createClient } from '@/lib/supabase/client';

export default function GuestWrapViewPage() {
  const params = useParams();
  const router = useRouter();
  const wrapId = params.wrapId as string;
  const [wrapData, setWrapData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadWrap();
  }, [wrapId]);

  const loadWrap = async () => {
    try {
      const supabase = createClient();
      
      // Fetch wrap data
      const { data: wrap, error: wrapError } = await supabase
        .from('wraps')
        .select(`
          id,
          guest_name,
          data,
          created_at,
          event_id,
          events!inner (
            id,
            title,
            location,
            start_date,
            end_date,
            type,
            operators!inner (
              business_name,
              brand_color_1,
              brand_color_2,
              logo_url
            )
          )
        `)
        .eq('id', wrapId)
        .single();

      if (wrapError) throw wrapError;

      setWrapData(wrap);
    } catch (err: any) {
      console.error('Error loading wrap:', err);
      setError(err.message || 'Failed to load wrap');
    } finally {
      setLoading(false);
    }
  };

  const shareToSocial = (platform: string) => {
    const url = window.location.href;
    const text = `Check out my ${wrapData?.data?.event?.title || 'safari'} experience! 🦁✨`;
    
    const shareUrls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
      instagram: url, // Instagram doesn't support direct sharing, just copy link
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `My ${wrapData?.data?.event?.title || 'Safari'} Experience`,
          text: `Check out my safari wrap! 🦁✨`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share cancelled or failed');
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-forest via-forest-light to-savanna flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg">Loading your safari wrap...</p>
        </div>
      </div>
    );
  }

  if (error || !wrapData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-forest via-forest-light to-savanna flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">😕</span>
            </div>
            <h2 className="text-2xl font-bold text-forest mb-2">Wrap Not Found</h2>
            <p className="text-stone mb-6">
              {error || "We couldn't find this wrap. It may have been removed or the link is incorrect."}
            </p>
            <Button onClick={() => router.push('/')} className="bg-forest hover:bg-forest-light">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-forest via-forest-light to-savanna pb-20 sm:pb-24">
      {/* Wrap Display - Full width, no floating elements */}
      <GuestWrap wrapData={wrapData} />
    </div>
  );
}
