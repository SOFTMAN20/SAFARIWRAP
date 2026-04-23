'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, X } from 'lucide-react';

interface TourFieldsProps {
  metadata: any;
  onChange: (metadata: any) => void;
}

export default function TourFields({ metadata, onChange }: TourFieldsProps) {
  const [newLocation, setNewLocation] = useState('');

  const updateField = (field: string, value: any) => {
    onChange({ ...metadata, [field]: value });
  };

  const addLocation = () => {
    if (newLocation.trim()) {
      const locations = metadata.locations || [];
      updateField('locations', [...locations, newLocation.trim()]);
      setNewLocation('');
    }
  };

  const removeLocation = (index: number) => {
    const locations = [...(metadata.locations || [])];
    locations.splice(index, 1);
    updateField('locations', locations);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="tour_type">Tour Type *</Label>
        <Select
          value={metadata.tour_type || 'walking'}
          onValueChange={(value) => updateField('tour_type', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select tour type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="walking">Walking Tour</SelectItem>
            <SelectItem value="bus">Bus Tour</SelectItem>
            <SelectItem value="bike">Bike Tour</SelectItem>
            <SelectItem value="boat">Boat Tour</SelectItem>
            <SelectItem value="mixed">Mixed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="duration_hours">Duration (hours) *</Label>
        <Input
          id="duration_hours"
          type="number"
          step="0.5"
          placeholder="e.g., 3.5"
          value={metadata.duration_hours || ''}
          onChange={(e) => updateField('duration_hours', parseFloat(e.target.value) || 0)}
          required
        />
      </div>

      <div>
        <Label>Locations *</Label>
        <div className="space-y-2">
          {(metadata.locations || []).map((location: string, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <Input value={location} disabled className="flex-1" />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeLocation(index)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
          
          <div className="flex gap-2">
            <Input
              placeholder="Add location (e.g., Stone Town)"
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLocation())}
            />
            <Button type="button" onClick={addLocation} variant="outline">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="language">Language *</Label>
        <Input
          id="language"
          placeholder="e.g., English, Swahili"
          value={metadata.language || ''}
          onChange={(e) => updateField('language', e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="max_group_size">Maximum Group Size</Label>
        <Input
          id="max_group_size"
          type="number"
          placeholder="e.g., 15"
          value={metadata.max_group_size || ''}
          onChange={(e) => updateField('max_group_size', parseInt(e.target.value) || 0)}
        />
      </div>

      <div>
        <Label htmlFor="difficulty">Difficulty Level</Label>
        <Select
          value={metadata.difficulty || 'moderate'}
          onValueChange={(value) => updateField('difficulty', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="moderate">Moderate</SelectItem>
            <SelectItem value="challenging">Challenging</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="includes_meals"
          checked={metadata.includes_meals || false}
          onCheckedChange={(checked) => updateField('includes_meals', checked)}
        />
        <Label htmlFor="includes_meals" className="cursor-pointer">
          Includes meals
        </Label>
      </div>
    </div>
  );
}