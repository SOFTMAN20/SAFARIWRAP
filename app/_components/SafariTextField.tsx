'use client';

import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SafariTextFieldProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
  multiline?: boolean;
  rows?: number;
  prefixIcon?: React.ReactNode;
  suffixIcon?: React.ReactNode;
}

export const SafariTextField = React.forwardRef<HTMLInputElement | HTMLTextAreaElement, SafariTextFieldProps>(
  ({ className, label, hint, error, multiline, rows = 3, prefixIcon, suffixIcon, ...props }, ref) => {
    const inputClasses = cn(
      'w-full rounded-3xl border-2 border-dust bg-white px-5 py-3 text-ink transition-all placeholder:text-stone focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/20',
      error && 'border-error focus:border-error focus:ring-error/20',
      prefixIcon && 'pl-12',
      suffixIcon && 'pr-12',
      className
    );

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="ml-1 text-sm font-bold text-ink-light">
            {label}
          </label>
        )}
        <div className="relative">
          {prefixIcon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-stone">
              {prefixIcon}
            </div>
          )}
          {multiline ? (
            <textarea
              ref={ref as any}
              className={inputClasses}
              rows={rows}
              {...(props as any)}
            />
          ) : (
            <input
              ref={ref as any}
              className={inputClasses}
              {...(props as any)}
            />
          )}
          {suffixIcon && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-stone">
              {suffixIcon}
            </div>
          )}
        </div>
        {error ? (
          <p className="ml-1 text-xs font-medium text-error">{error}</p>
        ) : hint ? (
          <p className="ml-1 text-xs font-medium text-stone">{hint}</p>
        ) : null}
      </div>
    );
  }
);

SafariTextField.displayName = 'SafariTextField';
