'use client';

import { useState } from 'react';
import { Share2, Link2, MessageCircle, Check, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  shareOnWhatsApp,
  copyToClipboard,
  shareNative,
  canUseWebShare,
  generateShareMessage,
  trackShare,
  getWrapUrl,
} from '@/lib/share-utils';

interface ShareButtonProps {
  wrapId: string;
  wrapData?: {
    guestName?: string;
    eventTitle?: string;
    rating?: number;
    treesPlanted?: number;
  };
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showLabel?: boolean;
}

export function ShareButton({
  wrapId,
  wrapData,
  variant = 'default',
  size = 'default',
  showLabel = true,
}: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const wrapUrl = getWrapUrl(wrapId);
  const shareMessage = generateShareMessage(wrapData || {});

  const handleCopyLink = async () => {
    const success = await copyToClipboard(wrapUrl);
    if (success) {
      setCopied(true);
      toast.success('Link copied to clipboard!');
      trackShare('copy_link', wrapId);
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error('Failed to copy link');
    }
  };

  const handleWhatsAppShare = () => {
    shareOnWhatsApp(wrapUrl, shareMessage);
    trackShare('whatsapp', wrapId);
    toast.success('Opening WhatsApp...');
  };

  const handleNativeShare = async () => {
    const success = await shareNative({
      title: 'My Safari Wrap',
      text: shareMessage,
      url: wrapUrl,
    });
    
    if (success) {
      trackShare('native', wrapId);
    } else {
      // Fallback to dialog if native share fails
      setOpen(true);
    }
  };

  // If native share is available, use it directly
  if (canUseWebShare() && size === 'icon') {
    return (
      <Button
        variant={variant}
        size={size}
        onClick={handleNativeShare}
        className="gap-2"
      >
        <Share2 className="w-4 h-4" />
        {showLabel && 'Share'}
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className="gap-2">
          <Share2 className="w-4 h-4" />
          {showLabel && 'Share'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-forest" />
            Share Your Safari Wrap
          </DialogTitle>
          <DialogDescription>
            Share your amazing safari experience with friends and family
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* WhatsApp Share */}
          <button
            onClick={handleWhatsAppShare}
            className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-green-500 hover:bg-green-50 transition-all group"
          >
            <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 text-left">
              <h4 className="font-bold text-forest">Share on WhatsApp</h4>
              <p className="text-sm text-stone">Send to friends and groups</p>
            </div>
          </button>

          {/* Copy Link */}
          <button
            onClick={handleCopyLink}
            className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-forest hover:bg-forest/5 transition-all group"
          >
            <div className="w-12 h-12 rounded-full bg-forest flex items-center justify-center group-hover:scale-110 transition-transform">
              {copied ? (
                <Check className="w-6 h-6 text-white" />
              ) : (
                <Link2 className="w-6 h-6 text-white" />
              )}
            </div>
            <div className="flex-1 text-left">
              <h4 className="font-bold text-forest">
                {copied ? 'Link Copied!' : 'Copy Link'}
              </h4>
              <p className="text-sm text-stone">
                {copied ? 'Ready to paste anywhere' : 'Share anywhere you want'}
              </p>
            </div>
          </button>

          {/* Native Share (Mobile) */}
          {canUseWebShare() && (
            <button
              onClick={handleNativeShare}
              className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
            >
              <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Share2 className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 text-left">
                <h4 className="font-bold text-forest">More Options</h4>
                <p className="text-sm text-stone">Share via other apps</p>
              </div>
            </button>
          )}

          {/* Link Preview */}
          <div className="mt-6 p-4 bg-parchment rounded-xl border border-dust">
            <p className="text-xs font-bold text-stone uppercase mb-2">
              Share Link
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-sm text-forest font-mono bg-white px-3 py-2 rounded-lg border border-gray-200 truncate">
                {wrapUrl}
              </code>
              <Button
                size="icon"
                variant="outline"
                onClick={handleCopyLink}
                className="shrink-0"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Link2 className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
