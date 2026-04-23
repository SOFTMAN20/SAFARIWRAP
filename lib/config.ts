/**
 * Application Configuration
 * Centralized configuration for app-wide settings
 */

/**
 * Get the base app URL
 * - Production: https://app.safariwrap.com
 * - Development: http://localhost:3000
 */
export function getAppUrl(): string {
  // Use environment variable if set
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  
  // Fallback to localhost in development
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }
  
  // Default production URL
  return 'https://app.safariwrap.com';
}

/**
 * Get the review URL for a given short code
 */
export function getReviewUrl(shortCode: string): string {
  return `${getAppUrl()}/review/${shortCode}`;
}

/**
 * Get the wrap URL for a given wrap ID
 */
export function getWrapUrl(wrapId: string): string {
  return `${getAppUrl()}/wrap/${wrapId}`;
}

/**
 * App configuration constants
 */
export const APP_CONFIG = {
  name: 'SafariWrap',
  domain: 'app.safariwrap.com',
  supportEmail: 'support@safariwrap.com',
  maxPhotosPerReview: 3,
  maxReviewLength: 500,
  qrCodeSize: 256,
  qrCodeDownloadSize: 512,
} as const;
