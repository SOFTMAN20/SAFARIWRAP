'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Camera, 
  Star, 
  MapPin, 
  Calendar,
  Clock,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Upload,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import Image from 'next/image';

export default function ReviewPage() {
  const params = useParams();
  const router = useRouter();
  const shortCode = params?.shortCode as string;
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [event, setEvent] = useState<any>(null);
  const [operator, setOperator] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    guest_name: '',
    email: '',
    star_rating: 5,
    review_text: '',
    // Safari-specific (checkboxes)
    big_five_seen: [] as string[], // ✅ Array for checkboxes
    other_animals: [] as string[], // ✅ Array for checkboxes
    safari_duration: '',
    best_time: '',
    // Marathon-specific
    finish_time: '',
    pace_per_km: '',
    difficulty_rating: 3,
    weather_conditions: '',
    // Tour-specific
    favorite_location: '',
    guide_rating: 5,
    group_size_feedback: '',
    // Common
    memorable_moment: '',
    data_consent: false,
    marketing_consent: false,
  });
  
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreview, setPhotoPreview] = useState<string[]>([]);

  // ✅ Animal lists for checkboxes
  const BIG_FIVE = [
    { id: 'lion', name: 'Lion', emoji: '🦁' },
    { id: 'elephant', name: 'Elephant', emoji: '🐘' },
    { id: 'buffalo', name: 'Buffalo', emoji: '🐃' },
    { id: 'leopard', name: 'Leopard', emoji: '🐆' },
    { id: 'rhino', name: 'Rhino', emoji: '🦏' },
  ];

  const OTHER_ANIMALS = [
    { id: 'giraffe', name: 'Giraffe', emoji: '🦒' },
    { id: 'zebra', name: 'Zebra', emoji: '🦓' },
    { id: 'hippo', name: 'Hippo', emoji: '🦛' },
    { id: 'cheetah', name: 'Cheetah', emoji: '🐆' },
    { id: 'hyena', name: 'Hyena', emoji: '🐺' },
    { id: 'wildebeest', name: 'Wildebeest', emoji: '🦌' },
    { id: 'gazelle', name: 'Gazelle', emoji: '🦌' },
    { id: 'impala', name: 'Impala', emoji: '🦌' },
    { id: 'warthog', name: 'Warthog', emoji: '🐗' },
    { id: 'baboon', name: 'Baboon', emoji: '🐵' },
    { id: 'monkey', name: 'Monkey', emoji: '🐒' },
    { id: 'crocodile', name: 'Crocodile', emoji: '🐊' },
  ];

  // ✅ Checkbox handlers
  const toggleBigFive = (animal: string) => {
    setFormData(prev => ({
      ...prev,
      big_five_seen: prev.big_five_seen.includes(animal)
        ? prev.big_five_seen.filter(a => a !== animal)
        : [...prev.big_five_seen, animal]
    }));
  };

  const toggleOtherAnimal = (animal: string) => {
    setFormData(prev => ({
      ...prev,
      other_animals: prev.other_animals.includes(animal)
        ? prev.other_animals.filter(a => a !== animal)
        : [...prev.other_animals, animal]
    }));
  };

  useEffect(() => {
    if (shortCode) {
      fetchEventData();
    }
  }, [shortCode]);

  const fetchEventData = async () => {
    try {
      console.log('Fetching event for short code:', shortCode);
      
      // Get singleton Supabase client
      const supabase = createClient();
      
      // Fetch QR code first (public access)
      const { data: qrCode, error: qrError } = await supabase
        .from('qr_codes')
        .select('*')
        .eq('short_code', shortCode)
        .single();
      
      if (qrError || !qrCode) {
        console.error('QR code not found:', qrError);
        setError('Invalid QR code. Please check the link and try again.');
        setLoading(false);
        return;
      }
      
      console.log('QR code found:', qrCode);
      
      // Fetch event data (public access needed for reviews)
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', qrCode.event_id)
        .single();
      
      if (eventError || !eventData) {
        console.error('Event not found:', eventError);
        setError('Event not found. Please contact the tour operator.');
        setLoading(false);
        return;
      }
      
      console.log('Event found:', eventData);
      
      // Fetch operator data (public access for branding)
      const { data: operatorData, error: operatorError } = await supabase
        .from('operators')
        .select('*')
        .eq('id', eventData.operator_id)
        .single();
      
      if (operatorError) {
        console.error('Operator not found:', operatorError);
        // Continue without operator data
      }
      
      console.log('Operator found:', operatorData);
      
      // Update scan count
      await supabase
        .from('qr_codes')
        .update({ scans_count: (qrCode.scans_count || 0) + 1 })
        .eq('id', qrCode.id);
      
      setEvent(eventData);
      setOperator(operatorData);
      setLoading(false);
    } catch (err: any) {
      console.error('Error fetching event:', err);
      setError('Failed to load event details. Please try again.');
      setLoading(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (photos.length + files.length > 5) {
      alert('You can only upload up to 5 photos');
      return;
    }
    
    setPhotos([...photos, ...files]);
    
    // Create preview URLs
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPhotoPreview([...photoPreview, ...newPreviews]);
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    const newPreviews = photoPreview.filter((_, i) => i !== index);
    setPhotos(newPhotos);
    setPhotoPreview(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.guest_name || !formData.star_rating) {
      alert('Please fill in all required fields');
      return;
    }
    
    if (!formData.data_consent) {
      alert('Please consent to data usage to submit your review');
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Get singleton Supabase client
      const supabase = createClient();
      
      // Upload photos
      const photoUrls: string[] = [];
      const uploadErrors: string[] = [];
      
      for (let i = 0; i < photos.length; i++) {
        const file = photos[i];
        const ext = file.name.split('.').pop();
        const timestamp = Date.now();
        const path = `reviews/${event.id}_${timestamp}_${i}.${ext}`;
        
        console.log(`Uploading photo ${i + 1}/${photos.length}:`, {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          path,
        });
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('safariwrap-assets')
          .upload(path, file, {
            contentType: file.type,
            cacheControl: '3600',
            upsert: false,
          });
        
        if (uploadError) {
          console.error(`❌ Photo ${i + 1} upload failed:`, uploadError);
          uploadErrors.push(`Photo ${i + 1}: ${uploadError.message}`);
        } else {
          console.log(`✅ Photo ${i + 1} uploaded successfully:`, uploadData);
          
          const { data: urlData } = supabase.storage
            .from('safariwrap-assets')
            .getPublicUrl(path);
          
          photoUrls.push(urlData.publicUrl);
          console.log(`📎 Photo ${i + 1} URL:`, urlData.publicUrl);
        }
      }
      
      // Show warning if some photos failed but continue
      if (uploadErrors.length > 0 && uploadErrors.length < photos.length) {
        console.warn('⚠️ Some photos failed to upload:', uploadErrors);
        alert(`Warning: ${uploadErrors.length} photo(s) failed to upload. Continuing with ${photoUrls.length} photo(s).`);
      } else if (uploadErrors.length === photos.length && photos.length > 0) {
        throw new Error(`All photos failed to upload. Please check your internet connection and try again.`);
      }
      
      console.log(`✅ Photo upload complete: ${photoUrls.length}/${photos.length} successful`);
      
      // Prepare type-specific metadata
      let typeSpecificData: any = {};
      
      if (event.type === 'safari') {
        typeSpecificData = {
          safari_duration: formData.safari_duration || null,
          big_five_seen: formData.big_five_seen.join(', '), // ✅ Convert array to string
          other_animals: formData.other_animals.join(', '), // ✅ Convert array to string
          best_time: formData.best_time || null,
        };
      } else if (event.type === 'marathon') {
        typeSpecificData = {
          metadata: {
            finish_time: formData.finish_time,
            pace_per_km: formData.pace_per_km,
            difficulty_rating: formData.difficulty_rating,
            weather_conditions: formData.weather_conditions,
          }
        };
      } else if (event.type === 'tour') {
        typeSpecificData = {
          metadata: {
            favorite_location: formData.favorite_location,
            guide_rating: formData.guide_rating,
            group_size_feedback: formData.group_size_feedback,
          }
        };
      }

      // Submit review using simplified schema
      console.log('Submitting review with data:', {
        event_id: event.id,
        guest_name: formData.guest_name,
        rating: formData.star_rating, // ✅ Simplified column name
        data_consent: formData.data_consent,
        typeSpecificData,
      });
      
      const reviewPayload = {
        // ✅ NEW SIMPLIFIED SCHEMA
        event_id: event.id,
        guest_name: formData.guest_name,
        email: formData.email || null,
        rating: formData.star_rating, // ✅ Simplified from star_rating
        photo_urls: photoUrls, // ✅ Array of photo URLs
        comment: formData.review_text || null, // ✅ Simplified from review_text
        memorable_moment: formData.memorable_moment || null,
        data_consent: formData.data_consent,
        marketing_consent: formData.marketing_consent,
        
        // ⚠️ BACKWARD COMPATIBILITY (old columns still populated)
        star_rating: formData.star_rating, // Old column
        review_text: formData.review_text || null, // Old column
        trip_id: event.id, // Old column (same as event_id)
        ...typeSpecificData,
      };
      
      console.log('Full review payload:', JSON.stringify(reviewPayload, null, 2));
      
      // Validate required fields before submission
      if (!reviewPayload.event_id) {
        throw new Error('Event ID is missing. Please refresh the page and try again.');
      }
      if (!reviewPayload.guest_name) {
        throw new Error('Guest name is required.');
      }
      if (!reviewPayload.star_rating) {
        throw new Error('Rating is required.');
      }
      
      const { data: reviewData, error: reviewError } = await supabase
        .from('reviews')
        .insert(reviewPayload)
        .select();
      
      console.log('Supabase response:', { data: reviewData, error: reviewError });
      
      if (reviewError) {
        console.error('❌ Review submission error:', reviewError);
        console.error('Error code:', reviewError.code);
        console.error('Error message:', reviewError.message);
        console.error('Error details:', reviewError.details);
        console.error('Error hint:', reviewError.hint);
        console.error('Full error object:', JSON.stringify(reviewError, null, 2));
        
        // Provide more helpful error message
        const errorMsg = reviewError.message || reviewError.hint || 'Failed to submit review. Please try again.';
        throw new Error(errorMsg);
      }
      
      if (!reviewData || reviewData.length === 0) {
        throw new Error('Review was not created. Please try again.');
      }
      
      console.log('✅ Review submitted successfully:', reviewData);
      
      // Automatically generate wrap for this guest
      console.log('🎨 Generating personal wrap...');
      
      // Show generating message
      setSuccess(true); // This will show "Generating your wrap..." message
      
      const wrapResponse = await fetch('/api/wraps/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ review_id: reviewData[0].id }),
      });

      const wrapResult = await wrapResponse.json();
      
      if (wrapResponse.ok && wrapResult.data) {
        console.log('✅ Wrap generated:', wrapResult.data.id);
        // Redirect to wrap page with Next.js router
        router.push(`/wrap/${wrapResult.data.id}`);
      } else {
        console.error('⚠️ Wrap generation failed:', wrapResult);
        // Still show success but without redirect
        alert('Review submitted! Your wrap will be available soon.');
        setSuccess(false);
      }
    } catch (err: any) {
      console.error('❌ Catch block error:', err);
      console.error('Error type:', typeof err);
      console.error('Error keys:', Object.keys(err || {}));
      console.error('Error stringified:', JSON.stringify(err, null, 2));
      
      const errorMessage = err?.message || err?.error_description || 'Failed to submit review. Please try again.';
      alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-parchment to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-forest animate-spin mx-auto mb-4" />
          <p className="text-stone text-lg">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-parchment to-white flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-ink mb-2">Oops!</h2>
            <p className="text-stone mb-6">{error}</p>
            <Button onClick={() => router.push('/')}>
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-parchment to-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <Card>
            <CardContent className="p-8 text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 mx-auto mb-4"
              >
                <Loader2 className="w-16 h-16 text-forest" />
              </motion.div>
              <h2 className="text-2xl font-bold text-ink mb-2">Creating Your Wrap...</h2>
              <p className="text-stone mb-4">
                Thank you for your review! We're generating your personalized Safari<span className="text-yellow-500">Wrap</span> right now.
              </p>
              <div className="space-y-2 text-sm text-stone/80">
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  ✨ Analyzing your photos...
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  🌍 Calculating environmental impact...
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5 }}
                >
                  🎨 Designing your story...
                </motion.p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-parchment to-white">
      {/* Header */}
      <div className="bg-forest text-white py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center gap-4 mb-4">
            <Image 
              src="/logo.png" 
              alt="SafariWrap" 
              width={48} 
              height={48}
              className="rounded-lg"
            />
            <div>
              <h1 className="text-3xl font-black">
                Safari<span className="text-yellow-500">Wrap</span>
              </h1>
              <p className="text-white/80">
                {event?.type === 'safari' && 'Share Your Safari Experience'}
                {event?.type === 'marathon' && 'Share Your Marathon Experience'}
                {event?.type === 'tour' && 'Share Your Tour Experience'}
              </p>
            </div>
          </div>
          
          {operator && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-white/60">Hosted by</span>
              <span className="font-bold">{operator.business_name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Event Info */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-forest mb-4">{event.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2 text-stone">
                <MapPin className="w-4 h-4" />
                <span>{event.metadata?.destination_names?.join(', ') || event.location}</span>
              </div>
              <div className="flex items-center gap-2 text-stone">
                <Calendar className="w-4 h-4" />
                <span>{new Date(event.start_date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 text-stone">
                <Clock className="w-4 h-4" />
                <span>{event.metadata?.duration_days || 7} days</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Review Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Your Information</CardTitle>
              <CardDescription>Tell us about yourself</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="guest_name">Name *</Label>
                <Input
                  id="guest_name"
                  value={formData.guest_name}
                  onChange={(e) => setFormData({ ...formData, guest_name: e.target.value })}
                  placeholder="John Doe"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                />
              </div>
            </CardContent>
          </Card>

          {/* Rating */}
          <Card>
            <CardHeader>
              <CardTitle>Rate Your Experience</CardTitle>
              <CardDescription>
                {event.type === 'safari' && 'How was your safari?'}
                {event.type === 'marathon' && 'How was your marathon?'}
                {event.type === 'tour' && 'How was your tour?'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 justify-center">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setFormData({ ...formData, star_rating: rating })}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-12 h-12 ${
                        rating <= formData.star_rating
                          ? 'fill-yellow-500 text-yellow-500'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Review Text */}
          <Card>
            <CardHeader>
              <CardTitle>Share Your Story</CardTitle>
              <CardDescription>Tell us about your experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="review_text">Your Review</Label>
                <Textarea
                  id="review_text"
                  value={formData.review_text}
                  onChange={(e) => setFormData({ ...formData, review_text: e.target.value })}
                  placeholder="Share your amazing safari experience..."
                  rows={4}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="memorable_moment">Most Memorable Moment</Label>
                <Textarea
                  id="memorable_moment"
                  value={formData.memorable_moment}
                  onChange={(e) => setFormData({ ...formData, memorable_moment: e.target.value })}
                  placeholder="What was the highlight of your safari?"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Type-Specific Details */}
          {event.type === 'safari' && (
            <Card>
              <CardHeader>
                <CardTitle>🦁 Safari Details</CardTitle>
                <CardDescription>Help us understand your wildlife experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Big Five Checkboxes */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Big Five Seen</Label>
                  <p className="text-xs text-stone mb-3">Select all the Big Five animals you spotted</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {BIG_FIVE.map((animal) => (
                      <div
                        key={animal.id}
                        onClick={() => toggleBigFive(animal.name)}
                        className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          formData.big_five_seen.includes(animal.name)
                            ? 'border-forest bg-forest/5 shadow-md'
                            : 'border-dust hover:border-forest/50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.big_five_seen.includes(animal.name)}
                          onChange={() => toggleBigFive(animal.name)}
                          className="w-5 h-5 text-forest rounded cursor-pointer"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span className="text-2xl">{animal.emoji}</span>
                        <span className="font-medium text-ink">{animal.name}</span>
                      </div>
                    ))}
                  </div>
                  {formData.big_five_seen.length > 0 && (
                    <p className="text-sm text-forest font-medium mt-2">
                      ✓ {formData.big_five_seen.length} of the Big Five spotted!
                    </p>
                  )}
                </div>

                {/* Other Animals Checkboxes */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Other Animals Seen</Label>
                  <p className="text-xs text-stone mb-3">Select all other animals you spotted</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {OTHER_ANIMALS.map((animal) => (
                      <div
                        key={animal.id}
                        onClick={() => toggleOtherAnimal(animal.name)}
                        className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          formData.other_animals.includes(animal.name)
                            ? 'border-forest bg-forest/5 shadow-md'
                            : 'border-dust hover:border-forest/50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.other_animals.includes(animal.name)}
                          onChange={() => toggleOtherAnimal(animal.name)}
                          className="w-4 h-4 text-forest rounded cursor-pointer"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span className="text-xl">{animal.emoji}</span>
                        <span className="text-sm font-medium text-ink">{animal.name}</span>
                      </div>
                    ))}
                  </div>
                  {formData.other_animals.length > 0 && (
                    <p className="text-sm text-forest font-medium mt-2">
                      ✓ {formData.other_animals.length} other animals spotted!
                    </p>
                  )}
                </div>
                
                {/* Best Time for Wildlife Viewing */}
                <div className="space-y-2">
                  <Label htmlFor="best_time">Best Time for Wildlife Viewing</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { value: 'Early morning (5-8am)', label: '🌅 Early Morning', time: '5-8am' },
                      { value: 'Mid-morning (8-11am)', label: '☀️ Mid Morning', time: '8-11am' },
                      { value: 'Afternoon (2-5pm)', label: '🌤️ Afternoon', time: '2-5pm' },
                      { value: 'Evening (5-7pm)', label: '🌆 Evening', time: '5-7pm' },
                    ].map((timeSlot) => (
                      <button
                        key={timeSlot.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, best_time: timeSlot.value })}
                        className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                          formData.best_time === timeSlot.value
                            ? 'border-forest bg-forest text-white'
                            : 'border-dust hover:border-forest text-ink'
                        }`}
                      >
                        <div>{timeSlot.label.split(' ')[0]}</div>
                        <div className="text-xs opacity-80">{timeSlot.time}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {event.type === 'marathon' && (
            <Card>
              <CardHeader>
                <CardTitle>🏃 Marathon Details</CardTitle>
                <CardDescription>Share your running experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="finish_time">Finish Time</Label>
                  <Input
                    id="finish_time"
                    value={formData.finish_time}
                    onChange={(e) => setFormData({ ...formData, finish_time: e.target.value })}
                    placeholder="e.g., 04:32:15"
                  />
                  <p className="text-xs text-stone">Format: HH:MM:SS</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="pace_per_km">Average Pace (min/km)</Label>
                  <Input
                    id="pace_per_km"
                    value={formData.pace_per_km}
                    onChange={(e) => setFormData({ ...formData, pace_per_km: e.target.value })}
                    placeholder="e.g., 06:27"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="difficulty_rating">Difficulty Rating</Label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => setFormData({ ...formData, difficulty_rating: rating })}
                        className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                          rating === formData.difficulty_rating
                            ? 'border-forest bg-forest text-white'
                            : 'border-dust hover:border-forest'
                        }`}
                      >
                        {rating}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-stone">1 = Easy, 5 = Very Challenging</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="weather_conditions">Weather Conditions</Label>
                  <Input
                    id="weather_conditions"
                    value={formData.weather_conditions}
                    onChange={(e) => setFormData({ ...formData, weather_conditions: e.target.value })}
                    placeholder="e.g., Sunny, 25°C"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {event.type === 'tour' && (
            <Card>
              <CardHeader>
                <CardTitle>🗺️ Tour Details</CardTitle>
                <CardDescription>Share your tour experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="favorite_location">Favorite Location</Label>
                  <Input
                    id="favorite_location"
                    value={formData.favorite_location}
                    onChange={(e) => setFormData({ ...formData, favorite_location: e.target.value })}
                    placeholder="Which location did you enjoy most?"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="guide_rating">Guide Rating</Label>
                  <div className="flex gap-2 justify-center">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => setFormData({ ...formData, guide_rating: rating })}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-10 h-10 ${
                            rating <= formData.guide_rating
                              ? 'fill-yellow-500 text-yellow-500'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="group_size_feedback">Group Size Feedback</Label>
                  <Textarea
                    id="group_size_feedback"
                    value={formData.group_size_feedback}
                    onChange={(e) => setFormData({ ...formData, group_size_feedback: e.target.value })}
                    placeholder="Was the group size comfortable?"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Photos */}
          <Card>
            <CardHeader>
              <CardTitle>Share Your Photos</CardTitle>
              <CardDescription>
                {event.type === 'safari' && 'Upload up to 5 photos from your safari'}
                {event.type === 'marathon' && 'Upload up to 5 photos from your marathon'}
                {event.type === 'tour' && 'Upload up to 5 photos from your tour'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {photoPreview.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                  {photoPreview.map((preview, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden border-2 border-dust">
                      <img src={preview} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {photos.length < 5 && (
                <div>
                  <Label htmlFor="photos" className="cursor-pointer">
                    <div className="border-2 border-dashed border-dust rounded-lg p-8 text-center hover:border-forest transition-colors">
                      <Upload className="w-12 h-12 text-stone mx-auto mb-2" />
                      <p className="text-stone font-semibold">Click to upload photos</p>
                      <p className="text-sm text-stone/60">Up to {5 - photos.length} more photo(s)</p>
                    </div>
                  </Label>
                  <Input
                    id="photos"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Consent */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="data_consent"
                  checked={formData.data_consent}
                  onChange={(e) => setFormData({ ...formData, data_consent: e.target.checked })}
                  className="mt-1"
                  required
                />
                <Label htmlFor="data_consent" className="cursor-pointer text-sm">
                  I consent to my review and photos being used to create a Safari<span className="text-yellow-500">Wrap</span> and shared with the tour operator. *
                </Label>
              </div>
              
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="marketing_consent"
                  checked={formData.marketing_consent}
                  onChange={(e) => setFormData({ ...formData, marketing_consent: e.target.checked })}
                  className="mt-1"
                />
                <Label htmlFor="marketing_consent" className="cursor-pointer text-sm">
                  I'd like to receive updates about Safari<span className="text-yellow-500">Wrap</span> and future safari opportunities.
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <Button
            type="submit"
            size="lg"
            className="w-full bg-forest hover:bg-forest/90 text-white"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Submit Review
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
