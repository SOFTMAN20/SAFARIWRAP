'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Share2, 
  Copy, 
  Check, 
  MessageCircle,
  Facebook,
  Twitter,
  Linkedin,
  Download,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  shareOnWhatsApp,
  shareOnFacebook,
  shareOnTwitter,
  shareOnLinkedIn,
  copyToClipboard,
  shareNative,
  canUseWebShare,
  trackShare,
  getWrapUrl,
  generateShareMessage,
} from '@/lib/share-utils';
import { toast } from 'sonner';

interface ShareButtonsProps {
  wrapId: string;
  wrapData?: {
    guestName?: string;
    eventTitle?: string;
    rating?: number;
    treesPlanted?: number;
  };
  variant?: 'default' | 'compact';
}

export default function ShareButtons({ wrapId, wrapData, variant = 'default' }: ShareButtonsProps) {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const wrapUrl = getWrapUrl(wrapId);
  const shareMessage = wrapData ? generateShareMessage(wrapData) : undefined;

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
    setShowShareMenu(false);
  };

  const handleFacebookShare = () => {
    shareOnFacebook(wrapUrl);
    trackShare('facebook', wrapId);
    setShowShareMenu(false);
  };

  const handleTwitterShare = () => {
    shareOnTwitter(wrapUrl, shareMessage);
    trackShare('twitter', wrapId);
    setShowShareMenu(false);
  };

  const handleLinkedInShare = () => {
    shareOnLinkedIn(wrapUrl);
    trackShare('linkedin', wrapId);
    setShowShareMenu(false);
  };

  const handleNativeShare = async () => {
    const success = await shareNative({
      title: 'My Safari Wrap',
      text: shareMessage,
      url: wrapUrl,
    });
    
    if (success) {
      trackShare('native', wrapId);
      setShowShareMenu(false);
    }
  };

  if (variant === 'compact') {
    return (
      <div className="relative">
        <Button
          onClick={() => setShowShareMenu(!showShareMenu)}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Share2 className="w-4 h-4" />
          Share
        </Button>

        <AnimatePresence>
          {showShareMenu && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/20 z-40"
                onClick={() => setShowShareMenu(false)}
              />

              {/* Share Menu */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute right-0 top-full mt-2 z-50"
              >
                <Card className="w-64 shadow-2xl">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-forest">Share Wrap</h3>
                      <button
                        onClick={() => setShowShareMenu(false)}
                        className="text-stone hover:text-forest"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      {canUseWebShare() && (
                        <Button
                          onClick={handleNativeShare}
                          variant="outline"
                          className="w-full justify-start gap-3"
                        >
                          <Share2 className="w-4 h-4" />
                          Share...
                        </Button>
                      )}

                      <Button
                        onClick={handleWhatsAppShare}
                        variant="outline"
                        className="w-full justify-start gap-3 hover:bg-green-50"
                      >
                        <MessageCircle className="w-4 h-4 text-green-600" />
                        WhatsApp
                      </Button>

                      <Button
                        onClick={handleFacebookShare}
                        variant="outline"
                        className="w-full justify-start gap-3 hover:bg-blue-50"
                      >
                        <Facebook className="w-4 h-4 text-blue-600" />
                        Facebook
                      </Button>

                      <Button
                        onClick={handleTwitterShare}
                        variant="outline"
                        className="w-full justify-start gap-3 hover:bg-sky-50"
                      >
                        <Twitter className="w-4 h-4 text-sky-500" />
                        Twitter
                      </Button>

                      <Button
                        onClick={handleLinkedInShare}
                        variant="outline"
                        className="w-full justify-start gap-3 hover:bg-blue-50"
                      >
                        <Linkedin className="w-4 h-4 text-blue-700" />
                        LinkedIn
                      </Button>

                      <div className="border-t pt-2 mt-2">
                        <Button
                          onClick={handleCopyLink}
                          variant="outline"
                          className="w-full justify-start gap-3"
                        >
                          {copied ? (
                            <>
                              <Check className="w-4 h-4 text-green-600" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              Copy Link
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Default variant - Full buttons
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-forest mb-4">Share Your Wrap</h3>
      
      <div className="grid grid-cols-2 gap-3">
        {/* WhatsApp */}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={handleWhatsAppShare}
            className="w-full bg-green-600 hover:bg-green-700 text-white gap-2"
          >
            <MessageCircle className="w-5 h-5" />
            WhatsApp
          </Button>
        </motion.div>

        {/* Facebook */}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={handleFacebookShare}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2"
          >
            <Facebook className="w-5 h-5" />
            Facebook
          </Button>
        </motion.div>

        {/* Twitter */}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={handleTwitterShare}
            className="w-full bg-sky-500 hover:bg-sky-600 text-white gap-2"
          >
            <Twitter className="w-5 h-5" />
            Twitter
          </Button>
        </motion.div>

        {/* LinkedIn */}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={handleLinkedInShare}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white gap-2"
          >
            <Linkedin className="w-5 h-5" />
            LinkedIn
          </Button>
        </motion.div>
      </div>

      {/* Copy Link */}
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          onClick={handleCopyLink}
          variant="outline"
          className="w-full gap-2 border-2"
        >
          {copied ? (
            <>
              <Check className="w-5 h-5 text-green-600" />
              Link Copied!
            </>
          ) : (
            <>
              <Copy className="w-5 h-5" />
              Copy Link
            </>
          )}
        </Button>
      </motion.div>

      {/* Native Share (Mobile) */}
      {canUseWebShare() && (
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={handleNativeShare}
            variant="outline"
            className="w-full gap-2 border-2"
          >
            <Share2 className="w-5 h-5" />
            More Options...
          </Button>
        </motion.div>
      )}
    </div>
  );
}
