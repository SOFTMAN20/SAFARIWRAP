'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  FileText,
  Save,
  ArrowLeft,
  Plus,
  X,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import UpgradePrompt from '@/components/subscription/UpgradePrompt';

const supabase = createClient();

// Query keys for better cache management
const queryKeys = {
  destinations: ['destinations'] as const,
  events: ['events'] as const,
  createEvent: (userId: string) => [...queryKeys.events, 'create', userId] as const,
};

// Animation presets
const animationPresets = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.2 },
  },
  slideUp: {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

export default function CreateTripPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { permissions, loading: subscriptionLoading, subscription } = useSubscription();
  const [step, setStep] = useState(0); // 0 = type selection, 1-4 = form steps
  const [mounted, setMounted] = useState(false);
  
  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Optimized destinations query with caching
  const { data: destinations, isLoading: destinationsLoading } = useQuery({
    queryKey: queryKeys.destinations,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('destinations')
        .select('id, name, country, emoji')
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
  
  const [formData, setFormData] = useState({
    // Event Type
    type: 'safari' as 'safari' | 'marathon' | 'tour',
    
    // Basic Info
    trip_name: '',
    description: '',
    destination_ids: [] as string[],
    destination_names: [] as string[],
    
    // Schedule
    start_date: '',
    end_date: '',
    duration_days: 7,
    difficulty_level: 'moderate',
    
    // Capacity & Pricing
    max_guests: 10,
    price_per_person: '',
    includes: [] as string[],
    excludes: [] as string[],
    requirements: [] as string[],
    
    // Safari-specific
    safari_type: 'game_drive' as 'game_drive' | 'walking' | 'balloon' | 'night_safari',
    accommodation: '',
    conservation_partner: '',
    big_five_tracking: false,
    
    // Marathon-specific
    marathon_category: 'full' as 'full' | 'half' | '10k' | '5k',
    distance_km: '',
    route_name: '',
    route_description: '',
    checkpoints: '',
    elevation_gain: '',
    terrain: 'road' as 'road' | 'trail' | 'mixed',
    start_time: '',
    
    // Tour-specific
    tour_type: 'walking' as 'walking' | 'bus' | 'bike' | 'boat' | 'mixed',
    duration_hours: '',
    tour_locations: [] as string[],
    language: 'English',
    max_group_size: '',
    tour_difficulty: 'moderate' as 'easy' | 'moderate' | 'challenging',
    includes_meals: false,
    
    // Status
    status: 'upcoming' as 'upcoming' | 'completed',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Optimized form handlers with useCallback
  const updateFormData = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  // Memoized duration calculation
  const calculatedDuration = useMemo(() => {
    if (formData.start_date && formData.end_date) {
      const start = new Date(formData.start_date);
      const end = new Date(formData.end_date);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    }
    return formData.duration_days;
  }, [formData.start_date, formData.end_date, formData.duration_days]);

  // Update duration when dates change
  useEffect(() => {
    if (calculatedDuration !== formData.duration_days) {
      setFormData(prev => ({ ...prev, duration_days: calculatedDuration }));
    }
  }, [calculatedDuration, formData.duration_days]);

  // Optimized create event mutation
  const createEventMutation = useMutation({
    mutationFn: async (eventData: any) => {
      const { data, error } = await supabase
        .from('events')
        .insert([{
          operator_id: user?.id,
          type: eventData.type,
          title: eventData.trip_name,
          location: eventData.destination_names?.[0] || eventData.tour_locations?.[0] || eventData.trip_name || 'Event Location',
          start_date: eventData.start_date,
          end_date: eventData.end_date,
          status: eventData.status.toLowerCase(),
          metadata: {
            // Common fields
            destination_ids: eventData.destination_ids || [],
            destination_names: eventData.destination_names || [],
            description: eventData.description || '',
            max_guests: parseInt(eventData.max_guests) || 10,
            difficulty_level: eventData.difficulty_level || 'moderate',
            price_per_person: parseFloat(eventData.price_per_person) || 0,
            duration_days: parseInt(eventData.duration_days) || 1,
            includes: eventData.includes || [],
            excludes: eventData.excludes || [],
            requirements: eventData.requirements || [],
            
            // Safari-specific metadata
            ...(eventData.type === 'safari' && {
              safari_type: eventData.safari_type || 'game_drive',
              accommodation: eventData.accommodation || '',
              conservation_partner: eventData.conservation_partner || '',
              big_five_tracking: eventData.big_five_tracking || false,
            }),
            
            // Marathon-specific metadata
            ...(eventData.type === 'marathon' && {
              marathon_category: eventData.marathon_category || 'full',
              distance_km: parseFloat(eventData.distance_km) || 0,
              route_name: eventData.route_name || '',
              route_description: eventData.route_description || '',
              checkpoints: parseInt(eventData.checkpoints) || 0,
              elevation_gain: parseInt(eventData.elevation_gain) || 0,
              terrain: eventData.terrain || 'road',
              start_time: eventData.start_time || '',
            }),
            
            // Tour-specific metadata
            ...(eventData.type === 'tour' && {
              tour_type: eventData.tour_type || 'walking',
              duration_hours: parseFloat(eventData.duration_hours) || 0,
              tour_locations: eventData.tour_locations || [],
              language: eventData.language || 'English',
              max_group_size: parseInt(eventData.max_group_size) || 0,
              tour_difficulty: eventData.tour_difficulty || 'moderate',
              includes_meals: eventData.includes_meals || false,
            }),
          }
        }])
        .select()
        .single();
      
      if (error) {
        throw new Error(error.message || 'Failed to create event');
      }
      
      if (!data) {
        throw new Error('No data returned from database');
      }
      
      return data;
    },
    onSuccess: (newEvent) => {
      // Invalidate queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ['events', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-events', user?.id] });
      
      // Navigate with success message
      router.push('/trips?success=created');
    },
    onError: (error: any) => {
      console.error('Failed to create event:', error);
      setErrors({ submit: error.message || 'Failed to create event' });
    },
  });

  // Calculate duration between two dates
  const calculateDuration = (startDate: string, endDate: string): number => {
    if (!startDate || !endDate) return formData.duration_days;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  };

  // Handle date changes with automatic duration calculation
  const handleDateChange = (field: 'start_date' | 'end_date', value: string) => {
    const newFormData = { ...formData, [field]: value };
    
    // Calculate duration if both dates are set
    if (field === 'start_date' && formData.end_date) {
      newFormData.duration_days = calculateDuration(value, formData.end_date);
    } else if (field === 'end_date' && formData.start_date) {
      newFormData.duration_days = calculateDuration(formData.start_date, value);
    }
    
    setFormData(newFormData);
  };

  const validateStep = (stepNumber: number) => {
    const newErrors: Record<string, string> = {};
    
    if (stepNumber === 1) {
      if (!formData.trip_name.trim()) newErrors.trip_name = 'Event name is required';
      if (!formData.description.trim()) newErrors.description = 'Description is required';
      
      // Destinations required for safari only
      if (formData.type === 'safari' && formData.destination_ids.length === 0) {
        newErrors.destinations = 'At least one destination is required';
      }
      
      // Tour locations required for tour
      if (formData.type === 'tour' && formData.tour_locations.length === 0) {
        newErrors.tour_locations = 'At least one location is required';
      }
      
      // Marathon-specific validation
      if (formData.type === 'marathon') {
        if (!formData.distance_km) newErrors.distance_km = 'Distance is required for marathon events';
        if (!formData.route_name) newErrors.route_name = 'Route name is required for marathon events';
      }
      
      // Tour-specific validation
      if (formData.type === 'tour') {
        if (!formData.duration_hours) newErrors.duration_hours = 'Duration is required for tour events';
      }
    }
    
    if (stepNumber === 2) {
      if (!formData.start_date) newErrors.start_date = 'Start date is required';
      if (!formData.end_date) newErrors.end_date = 'End date is required';
      if (formData.start_date && formData.end_date && new Date(formData.start_date) >= new Date(formData.end_date)) {
        newErrors.end_date = 'End date must be after start date';
      }
    }
    
    if (stepNumber === 3) {
      if (!formData.max_guests || formData.max_guests < 1) newErrors.max_guests = 'Maximum guests is required';
      if (!formData.price_per_person || parseFloat(formData.price_per_person) <= 0) newErrors.price_per_person = 'Price per person is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (step === 0) {
      // From type selection to step 1
      setStep(1);
    } else if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleTypeSelect = (type: 'safari' | 'marathon' | 'tour') => {
    setFormData({ ...formData, type });
    setStep(1); // Move to first form step
  };

  const handleSubmit = async () => {
    // Validate all required steps
    const step1Valid = validateStep(1);
    const step2Valid = validateStep(2);
    const step3Valid = validateStep(3);
    
    if (!step1Valid || !step2Valid || !step3Valid) {
      setErrors({ submit: 'Please complete all required fields in previous steps' });
      return;
    }
    
    if (!user?.id) {
      setErrors({ submit: 'You must be logged in to create an event' });
      return;
    }
    
    // Check subscription limits
    if (!permissions.canCreateEvent.allowed) {
      setErrors({ 
        submit: permissions.canCreateEvent.reason || 'You have reached your event limit. Please upgrade your plan to create more events.' 
      });
      return;
    }
    
    // Use the mutation to create the event
    createEventMutation.mutate(formData);
  };

  const addDestination = (destinationId: string) => {
    const destination = destinations?.find((d: any) => d.id === destinationId);
    if (destination && !formData.destination_ids.includes(destinationId)) {
      setFormData({
        ...formData,
        destination_ids: [...formData.destination_ids, destinationId],
        destination_names: [...formData.destination_names, destination.name],
      });
    }
  };

  const removeDestination = (destinationId: string) => {
    const index = formData.destination_ids.indexOf(destinationId);
    if (index > -1) {
      const newIds = [...formData.destination_ids];
      const newNames = [...formData.destination_names];
      newIds.splice(index, 1);
      newNames.splice(index, 1);
      setFormData({
        ...formData,
        destination_ids: newIds,
        destination_names: newNames,
      });
    }
  };

  const addInclude = (item: string) => {
    if (item.trim() && !formData.includes.includes(item.trim())) {
      setFormData({
        ...formData,
        includes: [...formData.includes, item.trim()],
      });
    }
  };

  const removeInclude = (item: string) => {
    setFormData({
      ...formData,
      includes: formData.includes.filter(i => i !== item),
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-parchment to-white pb-20">
      <div className="max-w-4xl mx-auto p-3 sm:p-4 md:p-8 space-y-4 sm:space-y-6 md:space-y-8">
        {/* Paywall Check */}
        {!subscriptionLoading && !permissions.canCreateEvent.allowed && (
          <UpgradePrompt
            title="Event Limit Reached"
            message={permissions.canCreateEvent.reason || "You've reached your event limit. Upgrade to Pro for unlimited events."}
            feature="Unlimited Events"
            variant="banner"
          />
        )}
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 sm:gap-4"
        >
          <Button
            variant="ghost"
            size="icon"
            className="flex-shrink-0 mt-1"
            onClick={() => step === 0 ? router.back() : prevStep()}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-forest leading-tight">
              Create New Event
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-stone mt-1 sm:mt-2">
              {step === 0 
                ? 'Choose the type of experience you want to create'
                : 'Set up your event details for guests'
              }
            </p>
          </div>
        </motion.div>

        {/* Step 0: Event Type Selection */}
        {step === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 sm:space-y-6"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {/* Safari Card */}
              <Card
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  formData.type === 'safari'
                    ? 'ring-2 ring-forest shadow-lg'
                    : 'hover:ring-1 hover:ring-forest/30'
                }`}
                onClick={() => handleTypeSelect('safari')}
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className="text-3xl sm:text-4xl">🦁</div>
                    {formData.type === 'safari' && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-5 h-5 sm:w-6 sm:h-6 bg-forest rounded-full flex items-center justify-center"
                      >
                        <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                      </motion.div>
                    )}
                  </div>
                  <h4 className="text-lg sm:text-xl font-bold text-forest mb-1 sm:mb-2">Safari</h4>
                  <p className="text-xs sm:text-sm text-stone">
                    Wildlife & nature experiences with animal sightings and destinations
                  </p>
                </CardContent>
              </Card>

              {/* Marathon Card */}
              <Card
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  formData.type === 'marathon'
                    ? 'ring-2 ring-forest shadow-lg'
                    : 'hover:ring-1 hover:ring-forest/30'
                }`}
                onClick={() => handleTypeSelect('marathon')}
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className="text-3xl sm:text-4xl">🏃</div>
                    {formData.type === 'marathon' && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-5 h-5 sm:w-6 sm:h-6 bg-forest rounded-full flex items-center justify-center"
                      >
                        <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                      </motion.div>
                    )}
                  </div>
                  <h4 className="text-lg sm:text-xl font-bold text-forest mb-1 sm:mb-2">Marathon</h4>
                  <p className="text-xs sm:text-sm text-stone">
                    Running events with distance tracking, pace metrics, and checkpoints
                  </p>
                </CardContent>
              </Card>

              {/* Tour Card */}
              <Card
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  formData.type === 'tour'
                    ? 'ring-2 ring-forest shadow-lg'
                    : 'hover:ring-1 hover:ring-forest/30'
                }`}
                onClick={() => handleTypeSelect('tour')}
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className="text-3xl sm:text-4xl">🗺️</div>
                    {formData.type === 'tour' && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-5 h-5 sm:w-6 sm:h-6 bg-forest rounded-full flex items-center justify-center"
                      >
                        <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                      </motion.div>
                    )}
                  </div>
                  <h4 className="text-lg sm:text-xl font-bold text-forest mb-1 sm:mb-2">Tour</h4>
                  <p className="text-xs sm:text-sm text-stone">
                    Cultural & sightseeing experiences with locations and highlights
                  </p>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {/* Progress Steps - Only show when step > 0 */}
        {step > 0 && (
          <div className="flex items-center justify-center space-x-2 sm:space-x-4 mb-6 sm:mb-8 overflow-x-auto px-4">
            {[1, 2, 3, 4].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center flex-shrink-0">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm ${
                  stepNumber <= step 
                    ? 'bg-forest text-white' 
                    : 'bg-dust text-stone'
                }`}>
                  {stepNumber < step ? <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" /> : stepNumber}
                </div>
                {stepNumber < 4 && (
                  <div className={`w-8 sm:w-12 md:w-16 h-1 mx-1 sm:mx-2 ${
                    stepNumber < step ? 'bg-forest' : 'bg-dust'
                  }`} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Step Content - Only show when step > 0 */}
        {step > 0 && (
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-forest" />
                  Basic Information
                </CardTitle>
                <CardDescription>
                  {formData.type === 'safari' && 'Tell us about your safari event'}
                  {formData.type === 'marathon' && 'Tell us about your marathon event'}
                  {formData.type === 'tour' && 'Tell us about your tour event'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="trip-name">Event Name *</Label>
                  <Input
                    id="trip-name"
                    value={formData.trip_name}
                    onChange={(e) => setFormData({ ...formData, trip_name: e.target.value })}
                    placeholder="Serengeti Wildlife Safari"
                    className={errors.trip_name ? 'border-red-500' : ''}
                  />
                  {errors.trip_name && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.trip_name}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Experience the breathtaking wildlife of the Serengeti..."
                    rows={4}
                    className={errors.description ? 'border-red-500' : ''}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.description}
                    </p>
                  )}
                </div>

                {/* Destinations - Only for Safari */}
                {formData.type === 'safari' && (
                  <div className="space-y-3">
                    <Label>Destinations *</Label>
                  {destinationsLoading ? (
                    <p className="text-sm text-stone">Loading destinations...</p>
                  ) : (
                    <>
                      <Select onValueChange={addDestination}>
                        <SelectTrigger>
                          <SelectValue placeholder="Add destinations" />
                        </SelectTrigger>
                        <SelectContent>
                          {destinations?.map((destination: any) => (
                            <SelectItem 
                              key={destination.id} 
                              value={destination.id}
                              disabled={formData.destination_ids.includes(destination.id)}
                            >
                              {destination.name} ({destination.country})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      {formData.destination_ids.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {formData.destination_ids.map((destId, index) => (
                            <Badge key={destId} variant="secondary" className="gap-1">
                              <MapPin className="w-3 h-3" />
                              {formData.destination_names[index]}
                              <button
                                onClick={() => removeDestination(destId)}
                                className="ml-1 hover:text-red-600"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      {errors.destinations && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.destinations}
                        </p>
                      )}
                    </>
                  )}
                </div>
                )}

                {/* Safari-Specific Fields */}
                {formData.type === 'safari' && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      <h3 className="font-semibold text-forest flex items-center gap-2">
                        <span>🦁</span> Safari Details
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="safari-type">Safari Type</Label>
                          <Select 
                            value={formData.safari_type} 
                            onValueChange={(value: 'game_drive' | 'walking' | 'balloon' | 'night_safari') => 
                              setFormData({ ...formData, safari_type: value })
                            }
                          >
                            <SelectTrigger id="safari-type">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="game_drive">🚙 Game Drive</SelectItem>
                              <SelectItem value="walking">🚶 Walking Safari</SelectItem>
                              <SelectItem value="balloon">🎈 Hot Air Balloon</SelectItem>
                              <SelectItem value="night_safari">🌙 Night Safari</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="accommodation">Accommodation</Label>
                          <Input
                            id="accommodation"
                            value={formData.accommodation}
                            onChange={(e) => setFormData({ ...formData, accommodation: e.target.value })}
                            placeholder="e.g., Luxury Lodge, Tented Camp"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="conservation-partner">Conservation Partner</Label>
                        <Input
                          id="conservation-partner"
                          value={formData.conservation_partner}
                          onChange={(e) => setFormData({ ...formData, conservation_partner: e.target.value })}
                          placeholder="e.g., Kilimanjaro Project"
                        />
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="big-five-tracking"
                          checked={formData.big_five_tracking}
                          onChange={(e) => setFormData({ ...formData, big_five_tracking: e.target.checked })}
                          className="w-4 h-4 rounded border-gray-300"
                        />
                        <Label htmlFor="big-five-tracking" className="cursor-pointer">
                          Enable Big Five tracking
                        </Label>
                      </div>
                    </div>
                  </>
                )}

                {/* Marathon-Specific Fields */}
                {formData.type === 'marathon' && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      <h3 className="font-semibold text-forest flex items-center gap-2">
                        <span>🏃</span> Marathon Details
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="marathon-category">Category *</Label>
                          <Select 
                            value={formData.marathon_category} 
                            onValueChange={(value: 'full' | 'half' | '10k' | '5k') => 
                              setFormData({ ...formData, marathon_category: value })
                            }
                          >
                            <SelectTrigger id="marathon-category">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="full">Full Marathon (42.2 km)</SelectItem>
                              <SelectItem value="half">Half Marathon (21.1 km)</SelectItem>
                              <SelectItem value="10k">10K Run</SelectItem>
                              <SelectItem value="5k">5K Run</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="distance">Distance (km) *</Label>
                          <Input
                            id="distance"
                            type="number"
                            value={formData.distance_km}
                            onChange={(e) => setFormData({ ...formData, distance_km: e.target.value })}
                            placeholder="42.195"
                            step="0.1"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="route-name">Route Name *</Label>
                        <Input
                          id="route-name"
                          value={formData.route_name}
                          onChange={(e) => setFormData({ ...formData, route_name: e.target.value })}
                          placeholder="e.g., City Center Loop"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="route">Route Description</Label>
                        <Textarea
                          id="route"
                          value={formData.route_description}
                          onChange={(e) => setFormData({ ...formData, route_description: e.target.value })}
                          placeholder="Starting from City Center, through the park..."
                          rows={3}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="checkpoints">Checkpoints *</Label>
                          <Input
                            id="checkpoints"
                            type="number"
                            value={formData.checkpoints}
                            onChange={(e) => setFormData({ ...formData, checkpoints: e.target.value })}
                            placeholder="8"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="elevation">Elevation Gain (m)</Label>
                          <Input
                            id="elevation"
                            type="number"
                            value={formData.elevation_gain}
                            onChange={(e) => setFormData({ ...formData, elevation_gain: e.target.value })}
                            placeholder="450"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="terrain">Terrain Type</Label>
                          <Select 
                            value={formData.terrain} 
                            onValueChange={(value: 'road' | 'trail' | 'mixed') => 
                              setFormData({ ...formData, terrain: value })
                            }
                          >
                            <SelectTrigger id="terrain">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="road">Road</SelectItem>
                              <SelectItem value="trail">Trail</SelectItem>
                              <SelectItem value="mixed">Mixed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="start-time">Start Time</Label>
                        <Input
                          id="start-time"
                          type="time"
                          value={formData.start_time}
                          onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Tour-Specific Fields */}
                {formData.type === 'tour' && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      <h3 className="font-semibold text-forest flex items-center gap-2">
                        <span>🗺️</span> Tour Details
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="tour-type">Tour Type *</Label>
                          <Select 
                            value={formData.tour_type} 
                            onValueChange={(value: 'walking' | 'bus' | 'bike' | 'boat' | 'mixed') => 
                              setFormData({ ...formData, tour_type: value })
                            }
                          >
                            <SelectTrigger id="tour-type">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="walking">🚶 Walking Tour</SelectItem>
                              <SelectItem value="bus">🚌 Bus Tour</SelectItem>
                              <SelectItem value="bike">🚴 Bike Tour</SelectItem>
                              <SelectItem value="boat">⛵ Boat Tour</SelectItem>
                              <SelectItem value="mixed">🔀 Mixed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="duration-hours">Duration (hours) *</Label>
                          <Input
                            id="duration-hours"
                            type="number"
                            value={formData.duration_hours}
                            onChange={(e) => setFormData({ ...formData, duration_hours: e.target.value })}
                            placeholder="4"
                            step="0.5"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <Label>Tour Locations *</Label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Add location (e.g., Stone Town)"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const value = e.currentTarget.value.trim();
                                if (value && !formData.tour_locations.includes(value)) {
                                  setFormData({
                                    ...formData,
                                    tour_locations: [...formData.tour_locations, value]
                                  });
                                  e.currentTarget.value = '';
                                }
                              }
                            }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={(e) => {
                              const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                              const value = input.value.trim();
                              if (value && !formData.tour_locations.includes(value)) {
                                setFormData({
                                  ...formData,
                                  tour_locations: [...formData.tour_locations, value]
                                });
                                input.value = '';
                              }
                            }}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        {formData.tour_locations.length > 0 && (
                          <div className="space-y-2">
                            {formData.tour_locations.map((location, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <Input value={location} disabled className="flex-1 bg-gray-50" />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    const newLocations = [...formData.tour_locations];
                                    newLocations.splice(index, 1);
                                    setFormData({ ...formData, tour_locations: newLocations });
                                  }}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="language">Language *</Label>
                          <Input
                            id="language"
                            value={formData.language}
                            onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                            placeholder="English, Swahili"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="max-group-size">Maximum Group Size</Label>
                          <Input
                            id="max-group-size"
                            type="number"
                            value={formData.max_group_size}
                            onChange={(e) => setFormData({ ...formData, max_group_size: e.target.value })}
                            placeholder="15"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="tour-difficulty">Difficulty Level</Label>
                        <Select 
                          value={formData.tour_difficulty} 
                          onValueChange={(value: 'easy' | 'moderate' | 'challenging') => 
                            setFormData({ ...formData, tour_difficulty: value })
                          }
                        >
                          <SelectTrigger id="tour-difficulty">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="easy">Easy</SelectItem>
                            <SelectItem value="moderate">Moderate</SelectItem>
                            <SelectItem value="challenging">Challenging</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="includes-meals"
                          checked={formData.includes_meals}
                          onChange={(e) => setFormData({ ...formData, includes_meals: e.target.checked })}
                          className="w-4 h-4 rounded border-gray-300"
                        />
                        <Label htmlFor="includes-meals" className="cursor-pointer">
                          Includes meals
                        </Label>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Calendar className="w-6 h-6 text-forest" />
                  Schedule & Duration
                </CardTitle>
                <CardDescription>
                  Set the dates and duration for your event
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-date">Start Date *</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => handleDateChange('start_date', e.target.value)}
                      className={errors.start_date ? 'border-red-500' : ''}
                    />
                    {errors.start_date && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.start_date}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end-date">End Date *</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => handleDateChange('end_date', e.target.value)}
                      className={errors.end_date ? 'border-red-500' : ''}
                    />
                    {errors.end_date && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.end_date}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (Days) - Auto-calculated</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    value={formData.duration_days}
                    readOnly
                    className="bg-gray-50 cursor-not-allowed"
                  />
                  <p className="text-xs text-stone">
                    Duration is automatically calculated from start and end dates
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty Level</Label>
                  <Select value={formData.difficulty_level} onValueChange={(value) => setFormData({ ...formData, difficulty_level: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy - Suitable for all ages</SelectItem>
                      <SelectItem value="moderate">Moderate - Some walking required</SelectItem>
                      <SelectItem value="challenging">Challenging - Good fitness required</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Users className="w-6 h-6 text-forest" />
                  Capacity & Pricing
                </CardTitle>
                <CardDescription>
                  Set guest limits and pricing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="max-guests">Maximum Guests *</Label>
                    <Input
                      id="max-guests"
                      type="number"
                      min="1"
                      value={formData.max_guests}
                      onChange={(e) => setFormData({ ...formData, max_guests: parseInt(e.target.value) || 1 })}
                      className={errors.max_guests ? 'border-red-500' : ''}
                    />
                    {errors.max_guests && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.max_guests}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Price per Person (TZS) *</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-stone">TZS</span>
                      <Input
                        id="price"
                        type="number"
                        min="0"
                        step="1"
                        value={formData.price_per_person}
                        onChange={(e) => setFormData({ ...formData, price_per_person: e.target.value })}
                        className={`pl-12 ${errors.price_per_person ? 'border-red-500' : ''}`}
                        placeholder="150000"
                      />
                    </div>
                    {errors.price_per_person && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.price_per_person}
                      </p>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label>What's Included</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g., All meals, Transportation"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addInclude(e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                        addInclude(input.value);
                        input.value = '';
                      }}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {formData.includes.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.includes.map((item, index) => (
                        <Badge key={index} variant="secondary" className="gap-1">
                          {item}
                          <button
                            onClick={() => removeInclude(item)}
                            className="ml-1 hover:text-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {step === 4 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-forest" />
                  Review & Create
                </CardTitle>
                <CardDescription>
                  Review your {formData.type} event details before creating
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Event Type Badge */}
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="text-sm">
                    {formData.type === 'safari' && '🦁 Safari'}
                    {formData.type === 'marathon' && '🏃 Marathon'}
                    {formData.type === 'tour' && '🗺️ Tour'}
                  </Badge>
                </div>

                <Separator />

                {/* Basic Information */}
                <div>
                  <h4 className="font-bold text-forest mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Basic Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                    <div>
                      <p className="text-xs text-stone uppercase mb-1">Event Name</p>
                      <p className="text-sm font-medium text-ink">{formData.trip_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-stone uppercase mb-1">Description</p>
                      <p className="text-sm text-ink line-clamp-2">{formData.description}</p>
                    </div>
                  </div>
                </div>

                {/* Safari-Specific Details */}
                {formData.type === 'safari' && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-bold text-forest mb-3 flex items-center gap-2">
                        <span>🦁</span>
                        Safari Details
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                        {formData.destination_names.length > 0 && (
                          <div>
                            <p className="text-xs text-stone uppercase mb-1">Destinations</p>
                            <div className="flex flex-wrap gap-1">
                              {formData.destination_names.map((dest) => (
                                <Badge key={dest} variant="secondary" className="text-xs">
                                  <MapPin className="w-3 h-3 mr-1" />
                                  {dest}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        <div>
                          <p className="text-xs text-stone uppercase mb-1">Safari Type</p>
                          <p className="text-sm text-ink capitalize">{formData.safari_type.replace('_', ' ')}</p>
                        </div>
                        {formData.accommodation && (
                          <div>
                            <p className="text-xs text-stone uppercase mb-1">Accommodation</p>
                            <p className="text-sm text-ink">{formData.accommodation}</p>
                          </div>
                        )}
                        {formData.conservation_partner && (
                          <div>
                            <p className="text-xs text-stone uppercase mb-1">Conservation Partner</p>
                            <p className="text-sm text-ink">{formData.conservation_partner}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-xs text-stone uppercase mb-1">Big Five Tracking</p>
                          <p className="text-sm text-ink">{formData.big_five_tracking ? '✅ Enabled' : '❌ Disabled'}</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Marathon-Specific Details */}
                {formData.type === 'marathon' && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-bold text-forest mb-3 flex items-center gap-2">
                        <span>🏃</span>
                        Marathon Details
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                        <div>
                          <p className="text-xs text-stone uppercase mb-1">Category</p>
                          <p className="text-sm text-ink">
                            {formData.marathon_category === 'full' && 'Full Marathon (42.2 km)'}
                            {formData.marathon_category === 'half' && 'Half Marathon (21.1 km)'}
                            {formData.marathon_category === '10k' && '10K Run'}
                            {formData.marathon_category === '5k' && '5K Run'}
                          </p>
                        </div>
                        {formData.distance_km && (
                          <div>
                            <p className="text-xs text-stone uppercase mb-1">Distance</p>
                            <p className="text-sm text-ink">{formData.distance_km} km</p>
                          </div>
                        )}
                        {formData.route_name && (
                          <div>
                            <p className="text-xs text-stone uppercase mb-1">Route Name</p>
                            <p className="text-sm text-ink">{formData.route_name}</p>
                          </div>
                        )}
                        {formData.checkpoints && (
                          <div>
                            <p className="text-xs text-stone uppercase mb-1">Checkpoints</p>
                            <p className="text-sm text-ink">{formData.checkpoints}</p>
                          </div>
                        )}
                        {formData.elevation_gain && (
                          <div>
                            <p className="text-xs text-stone uppercase mb-1">Elevation Gain</p>
                            <p className="text-sm text-ink">{formData.elevation_gain} meters</p>
                          </div>
                        )}
                        <div>
                          <p className="text-xs text-stone uppercase mb-1">Terrain</p>
                          <p className="text-sm text-ink capitalize">{formData.terrain}</p>
                        </div>
                        {formData.start_time && (
                          <div>
                            <p className="text-xs text-stone uppercase mb-1">Start Time</p>
                            <p className="text-sm text-ink">{formData.start_time}</p>
                          </div>
                        )}
                        {formData.route_description && (
                          <div className="md:col-span-2">
                            <p className="text-xs text-stone uppercase mb-1">Route Description</p>
                            <p className="text-sm text-ink">{formData.route_description}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* Tour-Specific Details */}
                {formData.type === 'tour' && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-bold text-forest mb-3 flex items-center gap-2">
                        <span>🗺️</span>
                        Tour Details
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                        <div>
                          <p className="text-xs text-stone uppercase mb-1">Tour Type</p>
                          <p className="text-sm text-ink capitalize">{formData.tour_type}</p>
                        </div>
                        {formData.duration_hours && (
                          <div>
                            <p className="text-xs text-stone uppercase mb-1">Duration</p>
                            <p className="text-sm text-ink">{formData.duration_hours} hours</p>
                          </div>
                        )}
                        {formData.tour_locations.length > 0 && (
                          <div className="md:col-span-2">
                            <p className="text-xs text-stone uppercase mb-1">Tour Locations</p>
                            <div className="flex flex-wrap gap-1">
                              {formData.tour_locations.map((location, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  <MapPin className="w-3 h-3 mr-1" />
                                  {location}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        <div>
                          <p className="text-xs text-stone uppercase mb-1">Language</p>
                          <p className="text-sm text-ink">{formData.language}</p>
                        </div>
                        {formData.max_group_size && (
                          <div>
                            <p className="text-xs text-stone uppercase mb-1">Max Group Size</p>
                            <p className="text-sm text-ink">{formData.max_group_size} people</p>
                          </div>
                        )}
                        <div>
                          <p className="text-xs text-stone uppercase mb-1">Difficulty</p>
                          <p className="text-sm text-ink capitalize">{formData.tour_difficulty}</p>
                        </div>
                        <div>
                          <p className="text-xs text-stone uppercase mb-1">Meals Included</p>
                          <p className="text-sm text-ink">{formData.includes_meals ? '✅ Yes' : '❌ No'}</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <Separator />

                {/* Schedule */}
                <div>
                  <h4 className="font-bold text-forest mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Schedule
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-6">
                    <div>
                      <p className="text-xs text-stone uppercase mb-1">Start Date</p>
                      <p className="text-sm text-ink">{formData.start_date}</p>
                    </div>
                    <div>
                      <p className="text-xs text-stone uppercase mb-1">End Date</p>
                      <p className="text-sm text-ink">{formData.end_date}</p>
                    </div>
                    <div>
                      <p className="text-xs text-stone uppercase mb-1">Duration</p>
                      <p className="text-sm text-ink">{formData.duration_days} days</p>
                    </div>
                    <div>
                      <p className="text-xs text-stone uppercase mb-1">Difficulty Level</p>
                      <p className="text-sm text-ink capitalize">{formData.difficulty_level}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Capacity & Pricing */}
                <div>
                  <h4 className="font-bold text-forest mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Capacity & Pricing
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                    <div>
                      <p className="text-xs text-stone uppercase mb-1">Maximum Guests</p>
                      <p className="text-sm text-ink">{formData.max_guests} people</p>
                    </div>
                    <div>
                      <p className="text-xs text-stone uppercase mb-1">Price per Person</p>
                      <p className="text-sm font-bold text-forest">TZS {Number(formData.price_per_person).toLocaleString('sw-TZ')}</p>
                    </div>
                  </div>
                </div>

                {formData.includes.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-bold text-forest mb-3">What's Included</h4>
                      <div className="flex flex-wrap gap-2 pl-6">
                        {formData.includes.map((item, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            ✓ {item}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {errors.submit && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                    <p className="text-sm text-red-600 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {errors.submit}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-6 sticky bottom-0 sm:static bg-white sm:bg-transparent p-4 sm:p-0 -mx-3 sm:mx-0 border-t sm:border-t-0 border-dust">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={step === 1}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Previous</span>
              <span className="sm:hidden">Back</span>
            </Button>
            
            <div className="flex gap-2 sm:gap-3 order-1 sm:order-2">
              {step < 4 ? (
                <Button 
                  onClick={nextStep}
                  className="flex-1 sm:flex-none"
                >
                  <span className="hidden sm:inline">Next Step</span>
                  <span className="sm:hidden">Next</span>
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={createEventMutation.isPending}
                  size="lg"
                  className="bg-forest hover:bg-forest/90 flex-1 sm:flex-none"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {createEventMutation.isPending ? 'Creating...' : 'Create Event'}
                </Button>
              )}
            </div>
          </div>
        </motion.div>
        )}
      </div>
    </div>
  );
}