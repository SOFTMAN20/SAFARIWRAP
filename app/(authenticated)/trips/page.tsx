'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Map, 
  Plus, 
  Search,
  Calendar as CalendarIcon,
  Grid3x3,
  List,
  MapPin,
  Users,
  Clock,
  MoreVertical,
  Edit,
  Trash,
  Eye,
  Share2,
  CheckCircle2,
  XCircle,
  QrCode,
  Copy,
  X,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

const statusConfig = {
  upcoming: { label: 'Upcoming', color: 'bg-blue-100 text-blue-700', icon: Clock },
  completed: { label: 'Completed', color: 'bg-gray-100 text-gray-700', icon: CheckCircle2 },
};

export default function EventsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [qrData, setQrData] = useState<any>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Fix hydration issue
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check for success message
  useEffect(() => {
    if (searchParams?.get('success') === 'created') {
      setShowSuccessMessage(true);
      // Clear the URL parameter
      router.replace('/trips');
      // Hide message after 5 seconds
      setTimeout(() => setShowSuccessMessage(false), 5000);
    }
  }, [searchParams, router]);

  // Fetch events with QR codes from database
  const { data: events = [], isLoading, refetch } = useQuery({
    queryKey: ['events', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          qr_codes (
            id,
            short_code,
            code_url,
            scans_count,
            unique_scans_count
          )
        `)
        .eq('operator_id', user.id)
        .order('start_date', { ascending: false });
      
      if (error) {
        console.error('Error fetching events:', error);
        throw error;
      }
      
      return data || [];
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const handleShowQR = async (event: any) => {
    setSelectedEvent(event);
    setQrLoading(true);
    
    // Open modal immediately
    setQrModalOpen(true);
    
    try {
      // Check if QR code is already loaded with event
      if (event.qr_codes && event.qr_codes.length > 0) {
        const qrCode = event.qr_codes[0];
        setQrData({
          qrCode: qrCode,
          reviewUrl: qrCode.code_url,
        });
        setQrLoading(false);
        return;
      }
      
      console.log('Fetching QR code for event:', event.id);
      
      // Fallback: Fetch QR code from database if not preloaded
      const { data: qrCode, error } = await supabase
        .from('qr_codes')
        .select('*')
        .eq('event_id', event.id)
        .single();
      
      if (error) {
        console.error('Error fetching QR code:', error);
        throw error;
      }
      
      console.log('QR code data:', qrCode);
      
      if (qrCode) {
        setQrData({
          qrCode: qrCode,
          reviewUrl: qrCode.code_url,
        });
      } else {
        throw new Error('QR code not found for this event');
      }
    } catch (error) {
      console.error('Failed to load QR code:', error);
      setQrData(null);
    } finally {
      setQrLoading(false);
    }
  };

  const handleCreateEvent = () => {
    router.push('/create-trip');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const downloadQRCode = () => {
    if (!qrData) return;
    
    // Get the SVG element
    const svg = document.querySelector('#qr-code-svg') as SVGElement;
    if (!svg) return;
    
    // Create a canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size
    canvas.width = 512;
    canvas.height = 512;
    
    // Convert SVG to data URL
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    
    // Create image and draw to canvas
    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Download
      canvas.toBlob((blob) => {
        if (blob) {
          const link = document.createElement('a');
          link.download = `qr-code-${selectedEvent?.title || 'event'}.png`;
          link.href = URL.createObjectURL(blob);
          link.click();
        }
      });
      
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const filteredEvents = Array.isArray(events) ? events.filter(event => {
    const destinationNames = event.metadata?.destination_names || [];
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         destinationNames.some((dest: string) => 
                           dest.toLowerCase().includes(searchQuery.toLowerCase())
                         );
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  }) : [];

  const stats = {
    total: Array.isArray(events) ? events.length : 0,
    upcoming: Array.isArray(events) ? events.filter(e => e.status === 'upcoming').length : 0,
    completed: Array.isArray(events) ? events.filter(e => e.status === 'completed').length : 0,
  };

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 bg-parchment min-h-screen">
      {/* Header */}
      <div className="mb-8">
        {/* Success Message */}
        {showSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 flex items-center gap-3"
          >
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <div className="flex-1">
              <p className="font-bold text-green-900">Event Created Successfully!</p>
              <p className="text-sm text-green-700">Your safari event has been created and is ready for guests.</p>
            </div>
            <button
              onClick={() => setShowSuccessMessage(false)}
              className="text-green-600 hover:text-green-800"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl lg:text-4xl font-extrabold text-forest">
                Event Management
              </h1>
            </div>
            <p className="text-stone font-semibold">
              Manage all your safari events and expeditions
            </p>
          </div>
          <Button 
            size="lg"
            onClick={handleCreateEvent}
            className="bg-forest hover:bg-forest-light text-white"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Event
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: 'Total Events', value: stats.total, color: 'from-forest to-forest-light' },
            { label: 'Upcoming', value: stats.upcoming, color: 'from-blue-500 to-blue-600' },
            { label: 'Completed', value: stats.completed, color: 'from-gray-500 to-gray-600' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-stone font-semibold mb-1">{stat.label}</p>
                  <p className="text-3xl font-extrabold text-forest">{stat.value}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Filters & Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone" />
                <Input
                  placeholder="Search events by name or destination..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode */}
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('grid')}
                className={viewMode === 'grid' ? 'bg-forest hover:bg-forest-light' : ''}
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('list')}
                className={viewMode === 'list' ? 'bg-forest hover:bg-forest-light' : ''}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Events Grid/List */}
      {!mounted || isLoading ? (
        <div className="text-center py-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="inline-block"
          >
            <Map className="w-8 h-8 text-forest" />
          </motion.div>
          <p className="mt-4 text-stone">Loading events...</p>
        </div>
      ) : filteredEvents.length > 0 ? (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
          : 'space-y-4'
        }>
          {filteredEvents.map((event, i) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              {viewMode === 'grid' ? (
                <Card className="hover:shadow-lg transition-all hover:-translate-y-1">
                  <CardContent className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <Badge className={statusConfig[event.status as keyof typeof statusConfig].color}>
                        {statusConfig[event.status as keyof typeof statusConfig].label}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => router.push(`/trip/${event.id}`)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Event
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleShowQR(event)}>
                            <QrCode className="w-4 h-4 mr-2" />
                            QR Code
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Share2 className="w-4 h-4 mr-2" />
                            Share
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Content */}
                    <h3 className="font-bold text-forest text-lg mb-3 line-clamp-2">
                      {event.title}
                    </h3>

                    <div className="space-y-2 text-sm text-stone mb-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">
                          {event.metadata?.destination_names?.join(', ') || event.location}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 flex-shrink-0" />
                        <span>
                          {new Date(event.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(event.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 pt-4 border-t border-dust">
                      <div className="text-center">
                        <p className="text-xs text-stone">Reviews</p>
                        <p className="font-bold text-forest">0</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-stone">Wraps</p>
                        <p className="font-bold text-forest">0</p>
                      </div>
                      <div className="ml-auto flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleShowQR(event)}
                          className="bg-forest hover:bg-forest-light text-white"
                        >
                          <QrCode className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="border-forest text-forest hover:bg-forest/10"
                          onClick={() => router.push(`/trip/${event.id}`)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-forest truncate">{event.title}</h3>
                          <Badge className={statusConfig[event.status as keyof typeof statusConfig].color}>
                            {statusConfig[event.status as keyof typeof statusConfig].label}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-stone">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{event.metadata?.destination_names?.join(', ') || event.location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="w-4 h-4" />
                            <span>{new Date(event.start_date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span>0 reviews</span>
                            <span>0 wraps</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleShowQR(event)}
                          className="bg-forest hover:bg-forest-light text-white"
                        >
                          <QrCode className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="border-forest text-forest hover:bg-forest/10"
                          onClick={() => router.push(`/trip/${event.id}`)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/trip/${event.id}`)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleShowQR(event)}>
                              <QrCode className="w-4 h-4 mr-2" />
                              QR Code
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Share2 className="w-4 h-4 mr-2" />
                              Share
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-forest/10 flex items-center justify-center mx-auto mb-4">
              <Map className="w-8 h-8 text-forest/40" />
            </div>
            <h3 className="text-xl font-bold text-ink mb-2">No events found</h3>
            <p className="text-stone mb-6">
              {searchQuery || statusFilter !== 'all' 
                ? 'Try adjusting your filters or search query'
                : 'Create your first safari event to get started'
              }
            </p>
            {!searchQuery && statusFilter === 'all' && !isLoading && (
              <Button 
                onClick={handleCreateEvent}
                className="bg-forest hover:bg-forest-light text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* QR Code Modal */}
      <Dialog open={qrModalOpen} onOpenChange={setQrModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              QR Code for Guest Access
            </DialogTitle>
          </DialogHeader>
          
          {selectedEvent && (
            <div className="space-y-6">
              {/* Event Info */}
              <div className="text-center">
                <h3 className="font-bold text-forest mb-1">{selectedEvent.title}</h3>
                <p className="text-sm text-stone">{selectedEvent.metadata?.destination_names?.join(', ') || selectedEvent.location}</p>
              </div>
              
              {qrLoading ? (
                <div className="flex items-center justify-center py-12">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <QrCode className="h-8 w-8 text-forest" />
                  </motion.div>
                </div>
              ) : qrData ? (
                <>
                  {/* QR Code Image */}
                  <div className="flex justify-center">
                    <div className="p-6 bg-white rounded-xl border-2 border-dust shadow-sm">
                      <QRCodeSVG 
                        id="qr-code-svg"
                        value={qrData.reviewUrl}
                        size={256}
                        level="H"
                        includeMargin={true}
                        imageSettings={{
                          src: "/logo.png",
                          height: 40,
                          width: 40,
                          excavate: true,
                        }}
                      />
                    </div>
                  </div>
                  
                  {/* QR Info */}
                  <div className="space-y-4">
                    <div className="bg-parchment rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-stone">Short Code</span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => copyToClipboard(qrData.qrCode.short_code)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="font-mono text-forest font-bold">{qrData.qrCode.short_code}</p>
                    </div>
                    
                    <div className="bg-parchment rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-stone">Review Link</span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => copyToClipboard(qrData.reviewUrl)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-forest break-all">{qrData.reviewUrl}</p>
                    </div>
                    
                    <div className="text-center text-sm text-stone">
                      <p>Scanned {qrData.qrCode.scans_count} times</p>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={downloadQRCode}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download QR
                    </Button>
                    <Button 
                      className="flex-1 bg-forest hover:bg-forest-light"
                      onClick={() => copyToClipboard(qrData.reviewUrl)}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Link
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-stone">Failed to load QR code</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => handleShowQR(selectedEvent)}
                  >
                    Try Again
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
