'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, QrCode, Loader2 } from 'lucide-react';
import Link from 'next/link';

const supabase = createClient();

export default function TestReviewPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('qr_codes')
        .select(`
          *,
          events!inner (
            id,
            title,
            location,
            start_date,
            metadata
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching events:', error);
      } else {
        setEvents(data || []);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-parchment to-white flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-forest animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-parchment to-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-forest mb-2">
            Test Review Pages
          </h1>
          <p className="text-stone">
            Click on any event below to test the guest review submission flow
          </p>
        </div>

        {events.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-stone">No events with QR codes found. Create an event first!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {events.map((qrCode) => {
              const event = Array.isArray(qrCode.events) ? qrCode.events[0] : qrCode.events;
              return (
                <Card key={qrCode.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{event?.title || 'Untitled Event'}</span>
                      <QrCode className="w-6 h-6 text-forest" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-stone/60">Location:</span>
                          <p className="font-semibold text-ink">{event?.location}</p>
                        </div>
                        <div>
                          <span className="text-stone/60">Start Date:</span>
                          <p className="font-semibold text-ink">
                            {event?.start_date ? new Date(event.start_date).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <span className="text-stone/60">Short Code:</span>
                          <p className="font-mono font-semibold text-forest">{qrCode.short_code}</p>
                        </div>
                        <div>
                          <span className="text-stone/60">Scans:</span>
                          <p className="font-semibold text-ink">{qrCode.scans_count || 0}</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Link href={`/review/${qrCode.short_code}`} className="flex-1">
                          <Button className="w-full bg-forest hover:bg-forest/90">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Open Review Page
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/review/${qrCode.short_code}`);
                            alert('Review URL copied to clipboard!');
                          }}
                        >
                          Copy URL
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
