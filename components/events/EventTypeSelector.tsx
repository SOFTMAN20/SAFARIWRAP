'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { type EventType, EVENT_TYPES, type EventTypeConfig } from '@/lib/types/events';

interface EventTypeSelectorProps {
  selected: EventType;
  onSelect: (type: EventType) => void;
  disabled?: boolean;
}

export default function EventTypeSelector({ 
  selected, 
  onSelect, 
  disabled = false 
}: EventTypeSelectorProps) {
  const enabledTypes = EVENT_TYPES.filter(t => t.enabled);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-forest mb-2">Select Event Type</h3>
        <p className="text-sm text-stone">
          Choose the type of experience you want to create
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {enabledTypes.map((type, index) => (
          <motion.div
            key={type.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selected === type.id
                  ? 'ring-2 ring-forest shadow-lg'
                  : 'hover:ring-1 hover:ring-forest/30'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => !disabled && onSelect(type.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="text-4xl"
                    style={{ color: type.color }}
                  >
                    {type.icon}
                  </div>
                  {selected === type.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-6 h-6 bg-forest rounded-full flex items-center justify-center"
                    >
                      <Check className="w-4 h-4 text-white" />
                    </motion.div>
                  )}
                </div>

                <h4 className="text-xl font-bold text-forest mb-2">
                  {type.name}
                </h4>
                <p className="text-sm text-stone">
                  {type.description}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}