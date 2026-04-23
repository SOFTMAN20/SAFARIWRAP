'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface MarathonFieldsProps {
  metadata: any;
  onChange: (metadata: any) => void;
}

export default function MarathonFields({ metadata, onChange }: MarathonFieldsProps) {
  const updateField = (field: string, value: any) => {
    onChange({ ...metadata, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="category">Marathon Category *</Label>
        <Select
          value={metadata.category || 'full'}
          onValueChange={(value) => updateField('category', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="full">Full Marathon (42.2 km)</SelectItem>
            <SelectItem value="half">Half Marathon (21.1 km)</SelectItem>
            <SelectItem value="10k">10K Run</SelectItem>
            <SelectItem value="5k">5K Run</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="distance">Distance (km) *</Label>
        <Input
          id="distance"
          type="number"
          step="0.1"
          placeholder="e.g., 42.2"
          value={metadata.distance || ''}
          onChange={(e) => updateField('distance', parseFloat(e.target.value) || 0)}
          required
        />
      </div>

      <div>
        <Label htmlFor="route">Route Name *</Label>
        <Input
          id="route"
          placeholder="e.g., City Center Loop"
          value={metadata.route || ''}
          onChange={(e) => updateField('route', e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="checkpoints">Number of Checkpoints *</Label>
        <Input
          id="checkpoints"
          type="number"
          placeholder="e.g., 8"
          value={metadata.checkpoints || ''}
          onChange={(e) => updateField('checkpoints', parseInt(e.target.value) || 0)}
          required
        />
      </div>

      <div>
        <Label htmlFor="elevation_gain">Elevation Gain (meters)</Label>
        <Input
          id="elevation_gain"
          type="number"
          placeholder="e.g., 450"
          value={metadata.elevation_gain || ''}
          onChange={(e) => updateField('elevation_gain', parseInt(e.target.value) || 0)}
        />
      </div>

      <div>
        <Label htmlFor="terrain">Terrain Type</Label>
        <Select
          value={metadata.terrain || 'road'}
          onValueChange={(value) => updateField('terrain', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select terrain" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="road">Road</SelectItem>
            <SelectItem value="trail">Trail</SelectItem>
            <SelectItem value="mixed">Mixed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="start_time">Start Time</Label>
        <Input
          id="start_time"
          type="time"
          value={metadata.start_time || ''}
          onChange={(e) => updateField('start_time', e.target.value)}
        />
      </div>
    </div>
  );
}