'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import EventTypeSelector from '@/components/events/EventTypeSelector';
import SafariFields from '@/components/events/SafariFields';
import MarathonFields from '@/components/events/MarathonFields';
import TourFields from '@/components/events/TourFields';
import { type EventType } from '@/lib/types/events';
import { useAuth } from '@/contexts/AuthContext';

export default function CreateEventPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState<'type' | 'details'>('type');
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    type: 'safari' as EventType,
    title: '',
    location: '',
    start_date: '',
    end_date: '',
    status: 'upcoming' as const,
    metadata: {},
  });

  const handleTypeSelect = (type: EventType) => {
    setFormData({ ...formData, type, metadata: {} });
    setStep('details');
  };

  const handleMetadataChange = (metadata: any) => {
    setFormData({ ...formData, metadata });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      alert('You must be logged in to create an event');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          operator_id: user.id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create event');
      }

      const { data } = await response.json();
      
      // Redirect to trips page with success message
      router.push(`/trips?created=${data.id}`);
    } catch (error) {
      console.error('Failed to create event:', error);
      alert(error instanceof Error ? error.message : 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-parchment py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => step === 'details' ? setStep('type') : router.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl md:text-4xl font-extrabold text-forest mb-2">
              Create New Event
            </h1>
            <p className="text-stone">
              {step === 'type' 
                ? 'Choose the type of experience you want to create'
                : 'Fill in the event details'
              }
            </p>
          </motion.div>
        </div>

        {/* Step 1: Event Type Selection */}
        {step === 'type' && (
          <EventTypeSelector
            selected={formData.type}
            onSelect={handleTypeSelect}
          />
        )}

        {/* Step 2: Event Details */}
        {step === 'details' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <form onSubmit={handleSubmit}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">
                      {formData.type === 'safari' && '🦁'}
                      {formData.type === 'marathon' && '🏃'}
                      {formData.type === 'tour' && '🗺️'}
                    </span>
                    {formData.type.charAt(0).toUpperCase() + formData.type.slice(1)} Event Details
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Common Fields */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-forest">Basic Information</h3>
                    
                    <div>
                      <Label htmlFor="title">Event Title *</Label>
                      <Input
                        id="title"
                        placeholder="e.g., Serengeti Migration Safari"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="location">Location *</Label>
                      <Input
                        id="location"
                        placeholder="e.g., Serengeti National Park"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="start_date">Start Date *</Label>
                        <Input
                          id="start_date"
                          type="date"
                          value={formData.start_date}
                          onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="end_date">End Date *</Label>
                        <Input
                          id="end_date"
                          type="date"
                          value={formData.end_date}
                          onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="upcoming">Upcoming</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Type-Specific Fields */}
                  <div className="space-y-4 pt-6 border-t border-dust">
                    <h3 className="text-lg font-semibold text-forest">
                      {formData.type.charAt(0).toUpperCase() + formData.type.slice(1)}-Specific Details
                    </h3>
                    
                    {formData.type === 'safari' && (
                      <SafariFields
                        metadata={formData.metadata}
                        onChange={handleMetadataChange}
                      />
                    )}
                    
                    {formData.type === 'marathon' && (
                      <MarathonFields
                        metadata={formData.metadata}
                        onChange={handleMetadataChange}
                      />
                    )}
                    
                    {formData.type === 'tour' && (
                      <TourFields
                        metadata={formData.metadata}
                        onChange={handleMetadataChange}
                      />
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-4 pt-6 border-t border-dust">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep('type')}
                      disabled={loading}
                    >
                      Change Type
                    </Button>
                    
                    <Button
                      type="submit"
                      className="flex-1 bg-forest hover:bg-forest-light text-white"
                      disabled={loading}
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          Creating...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Save className="w-4 h-4" />
                          Create Event
                        </div>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
}