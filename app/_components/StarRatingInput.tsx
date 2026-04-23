'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

interface StarRatingInputProps {
  value: number;
  onChange: (rating: number) => void;
  label?: string;
}

export const StarRatingInput: React.FC<StarRatingInputProps> = ({ value, onChange, label }) => {
  const [hover, setHover] = useState(0);

  return (
    <div className="space-y-3">
      {label && <label className="ml-1 text-sm font-bold text-ink-light uppercase tracking-wider">{label}</label>}
      <div className="flex space-x-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <motion.button
            key={star}
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="focus:outline-none"
          >
            <Star
              className={`h-10 w-10 transition-colors ${
                star <= (hover || value)
                  ? 'fill-savanna text-savanna'
                  : 'text-dust fill-none'
              }`}
            />
          </motion.button>
        ))}
      </div>
    </div>
  );
};
