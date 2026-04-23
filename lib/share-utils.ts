/**
 * Share Utilities
 * 
 * Utilities for sharing wraps on social media and messaging platforms.
 */

/**
 * Share wrap on WhatsApp
 */
export function shareOnWhatsApp(wrapUrl: string, message?: string): void {
  const text = message || 'Check out my Safari Wrap! 🦁✨';
  const url = `https://wa.me/?text=${encodeURIComponent(`${text}\n${wrapUrl}`)}`;
  window.open(url, '_blank');
}

/**
 * Share wrap on Facebook
 */
export function shareOnFacebook(wrapUrl: string): void {
  const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(wrapUrl)}`;
  window.open(url, '_blank', 'width=600,height=400');
}

/**
 * Share wrap on Twitter/X
 */
export function shareOnTwitter(wrapUrl: string, message?: string): void {
  const text = message || 'Check out my Safari Wrap! 🦁✨';
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(wrapUrl)}`;
  window.open(url, '_blank', 'width=600,height=400');
}

/**
 * Share wrap on LinkedIn
 */
export function shareOnLinkedIn(wrapUrl: string): void {
  const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(wrapUrl)}`;
  window.open(url, '_blank', 'width=600,height=400');
}

/**
 * Copy link to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const success = document.execCommand('copy');
      textArea.remove();
      return success;
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

/**
 * Check if Web Share API is available
 */
export function canUseWebShare(): boolean {
  return typeof navigator !== 'undefined' && 'share' in navigator;
}

/**
 * Share using native Web Share API (mobile)
 */
export async function shareNative(data: {
  title?: string;
  text?: string;
  url: string;
}): Promise<boolean> {
  try {
    if (canUseWebShare()) {
      await navigator.share(data);
      return true;
    }
    return false;
  } catch (error) {
    // User cancelled or error occurred
    console.error('Native share failed:', error);
    return false;
  }
}

/**
 * Generate share message for wrap
 */
export function generateShareMessage(wrapData: {
  guestName?: string;
  eventTitle?: string;
  rating?: number;
  treesPlanted?: number;
}): string {
  const { guestName, eventTitle, rating, treesPlanted } = wrapData;
  
  let message = '🦁 Check out my Safari Wrap!\n\n';
  
  if (guestName) {
    message += `Guest: ${guestName}\n`;
  }
  
  if (eventTitle) {
    message += `Safari: ${eventTitle}\n`;
  }
  
  if (rating) {
    message += `Rating: ${'⭐'.repeat(rating)}\n`;
  }
  
  if (treesPlanted) {
    message += `🌳 Trees Planted: ${treesPlanted}\n`;
  }
  
  message += '\nCreated with SafariWrap ✨';
  
  return message;
}

/**
 * Track share event (for analytics)
 */
export function trackShare(platform: string, wrapId: string): void {
  // This can be extended to send to analytics service
  console.log(`Share tracked: ${platform} - Wrap ${wrapId}`);
  
  // Example: Send to analytics
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'share', {
      method: platform,
      content_type: 'wrap',
      content_id: wrapId,
    });
  }
}

/**
 * Get full wrap URL
 */
export function getWrapUrl(wrapId: string): string {
  if (typeof window === 'undefined') {
    return `https://safariwrap.com/wrap/${wrapId}`;
  }
  return `${window.location.origin}/wrap/${wrapId}`;
}

/**
 * Download wrap as image (future feature)
 */
export async function downloadWrapImage(wrapId: string): Promise<void> {
  // This would capture the wrap as an image and download it
  // Implementation would use html2canvas or similar library
  console.log('Download wrap image:', wrapId);
  // TODO: Implement image download
}
