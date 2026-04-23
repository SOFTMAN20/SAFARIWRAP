'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Animal {
  name: string;
  emoji: string;
}

interface AnimalChipSelectorProps {
  animals: Animal[];
  selectedAnimals: string[];
  onChange: (selected: string[]) => void;
  label?: string;
  maxSelection?: number;
}

export const AnimalChipSelector: React.FC<AnimalChipSelectorProps> = ({
  animals,
  selectedAnimals,
  onChange,
  label,
  maxSelection
}) => {
  const toggleAnimal = (name: string) => {
    if (selectedAnimals.includes(name)) {
      onChange(selectedAnimals.filter((a) => a !== name));
    } else {
      if (maxSelection && selectedAnimals.length >= maxSelection) return;
      onChange([...selectedAnimals, name]);
    }
  };

  return (
    <div className="space-y-3">
      {label && <label className="ml-1 text-sm font-bold text-ink-light uppercase tracking-wider">{label}</label>}
      <div className="flex flex-wrap gap-2">
        {animals.map((animal) => {
          const isSelected = selectedAnimals.includes(animal.name);
          return (
            <motion.button
              key={animal.name}
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleAnimal(animal.name)}
              className={cn(
                'flex items-center space-x-2 px-4 py-2.5 rounded-2xl border-2 transition-all font-bold',
                isSelected 
                  ? 'bg-forest border-forest text-white shadow-md shadow-forest/20' 
                  : 'bg-white border-dust text-ink hover:border-forest/30'
              )}
            >
              <span className="text-xl">{animal.emoji}</span>
              <span>{animal.name}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
