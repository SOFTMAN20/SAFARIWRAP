'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SafariFieldsProps {
  metadata: any;
  onChange: (metadata: any) => void;
}

export default function SafariFields({ metadata, onChange }: SafariFieldsProps) {
  const updateField = (field: string, value: any) => {
    onChange({ ...metadata, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="safari_type">Safari Type</Label>
        <Select
          value={metadata.safari_type || 'game_drive'}
          onValueChange={(value) => updateField('safari_type', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select safari type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="game_drive">Game Drive</SelectItem>
            <SelectItem value="walking">Walking Safari</SelectItem>
            <SelectItem value="balloon">Hot Air Balloon</SelectItem>
            <SelectItem value="night_safari">Night Safari</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="accommodation">Accommodation</Label>
        <Input
          id="accommodation"
          placeholder="e.g., Luxury Lodge, Tented Camp"
          value={metadata.accommodation || ''}
          onChange={(e) => updateField('accommodation', e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="conservation_partner">Conservation Partner</Label>
        <Input
          id="conservation_partner"
          placeholder="e.g., Kilimanjaro Project"
          value={metadata.conservation_partner || ''}
          onChange={(e) => updateField('conservation_partner', e.target.value)}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="big_five_tracking"
          checked={metadata.big_five_tracking || false}
          onCheckedChange={(checked) => updateField('big_five_tracking', checked)}
        />
        <Label htmlFor="big_five_tracking" className="cursor-pointer">
          Enable Big Five tracking
        </Label>
      </div>
    </div>
  );
}