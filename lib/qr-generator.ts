/**
 * QR Code Generation Utilities
 * 
 * Generates branded QR codes with analytics tracking for SafariWrap events.
 */

import { customAlphabet } from 'nanoid';

// Generate short codes (8 characters, alphanumeric, no confusing chars)
const nanoid = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 8);

/**
 * Generate a unique short code for QR codes
 * Format: 8 alphanumeric characters (e.g., "A7K9M2X5")
 */
export function generateShortCode(): string {
  return nanoid();
}

/**
 * Generate review URL from short code
 */
export function generateReviewUrl(shortCode: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${baseUrl}/r/${shortCode}`;
}

/**
 * QR Code generation options
 */
export interface QRCodeOptions {
  size?: number;
  margin?: number;
  darkColor?: string;
  lightColor?: string;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

/**
 * Default QR code options with SafariWrap branding
 */
export const DEFAULT_QR_OPTIONS: QRCodeOptions = {
  size: 512,
  margin: 2,
  darkColor: '#1B4D3E', // Forest Green
  lightColor: '#FCFAF5', // Parchment
  errorCorrectionLevel: 'M',
};

/**
 * Generate QR code data URL (for display or download)
 * Note: Actual QR generation happens client-side or via API
 */
export function getQRCodeUrl(shortCode: string, options: QRCodeOptions = {}): string {
  const reviewUrl = generateReviewUrl(shortCode);
  const opts = { ...DEFAULT_QR_OPTIONS, ...options };
  
  // Return URL for QR code API (we'll use qrcode library in API route)
  return `/api/qr/generate?url=${encodeURIComponent(reviewUrl)}&size=${opts.size}&margin=${opts.margin}&dark=${encodeURIComponent(opts.darkColor!)}&light=${encodeURIComponent(opts.lightColor!)}`;
}

/**
 * QR Code analytics data
 */
export interface QRAnalytics {
  total_scans: number;
  unique_scans: number;
  conversion_rate: number;
  reviews_submitted: number;
  last_scanned_at: string | null;
  created_at: string;
}

/**
 * Calculate conversion rate from scans to reviews
 */
export function calculateConversionRate(scans: number, reviews: number): number {
  if (scans === 0) return 0;
  return Math.round((reviews / scans) * 100);
}

/**
 * Format scan count for display
 */
export function formatScanCount(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return count.toString();
}

/**
 * Get QR code status based on activity
 */
export function getQRStatus(lastScannedAt: string | null, createdAt: string): 'active' | 'inactive' | 'new' {
  if (!lastScannedAt) return 'new';
  
  const lastScan = new Date(lastScannedAt);
  const daysSinceLastScan = Math.floor((Date.now() - lastScan.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysSinceLastScan > 30) return 'inactive';
  return 'active';
}
