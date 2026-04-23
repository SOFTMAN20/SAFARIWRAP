'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, ExternalLink } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  wrapUrl: string;
  guestName: string;
}

const PLATFORMS = [
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    emoji: '💬',
    color: '#25D366',
    bg: '#dcfce7',
    description: 'Share directly in a chat',
    getUrl: (url: string, text: string) =>
      `https://wa.me/?text=${encodeURIComponent(`${text}\n\n${url}`)}`,
  },
  {
    id: 'instagram',
    name: 'Instagram',
    emoji: '📸',
    color: '#E1306C',
    bg: '#fce7f3',
    description: 'Copy link to share as story',
    getUrl: () => null, // handled separately
  },
  {
    id: 'snapchat',
    name: 'Snapchat',
    emoji: '👻',
    color: '#FFFC00',
    bg: '#fefce8',
    description: 'Share as a snap',
    getUrl: (url: string) =>
      `https://www.snapchat.com/scan?attachmentUrl=${encodeURIComponent(url)}`,
  },
];

export function ShareModal({ isOpen, onClose, wrapUrl, guestName }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [igCopied, setIgCopied] = useState(false);

  const shareText = `🦁 ${guestName}'s Safari Explorer Wrap is here! Check out the expedition highlights 🌍🐾`;

  async function copyToClipboard(text: string, setter: (v: boolean) => void) {
    try {
      await navigator.clipboard.writeText(text);
      setter(true);
      setTimeout(() => setter(false), 2000);
    } catch {
      // fallback
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setter(true);
      setTimeout(() => setter(false), 2000);
    }
  }

  function handlePlatformClick(platform: (typeof PLATFORMS)[0]) {
    if (platform.id === 'instagram') {
      // Use Web Share API on mobile, else copy link
      if (typeof navigator !== 'undefined' && navigator.share) {
        navigator.share({ title: `${guestName}'s Safari Explorer Wrap`, url: wrapUrl }).catch(() => {});
      } else {
        copyToClipboard(wrapUrl, setIgCopied);
      }
      return;
    }

    const url = platform.getUrl(wrapUrl, shareText);
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed inset-x-4 bottom-6 z-50 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[480px]"
          >
            <div className="bg-white rounded-[32px] shadow-2xl overflow-hidden border border-dust/40">
              {/* Header */}
              <div className="flex items-center justify-between px-7 pt-7 pb-5">
                <div>
                  <h2 className="text-xl font-black text-forest">Share Your Story</h2>
                  <p className="text-stone font-bold text-sm mt-0.5">Spread the safari spirit 🌍</p>
                </div>
                <button
                  onClick={onClose}
                  className="h-10 w-10 rounded-full bg-parchment hover:bg-dust flex items-center justify-center transition-colors"
                >
                  <X size={18} className="text-stone" />
                </button>
              </div>

              {/* Platform buttons */}
              <div className="px-7 space-y-3">
                {PLATFORMS.map((platform) => (
                  <motion.button
                    key={platform.id}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handlePlatformClick(platform)}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl border border-dust/60 hover:border-forest/20 hover:shadow-md transition-all group"
                  >
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 transition-transform group-hover:scale-110"
                      style={{ background: platform.bg }}
                    >
                      {platform.emoji}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-black text-forest text-base">{platform.name}</p>
                      <p className="text-stone font-medium text-xs">{platform.description}</p>
                    </div>
                    <div className="text-stone/40 group-hover:text-forest transition-colors">
                      {platform.id === 'instagram' && igCopied ? (
                        <Check size={18} className="text-green-500" />
                      ) : (
                        <ExternalLink size={16} />
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Copy link */}
              <div className="px-7 pt-4 pb-7">
                <div className="flex items-center gap-2 p-3 pl-4 bg-parchment rounded-2xl border border-dust">
                  <p className="flex-1 text-stone font-medium text-sm truncate">{wrapUrl}</p>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => copyToClipboard(wrapUrl, setCopied)}
                    className="flex items-center gap-2 px-4 py-2 bg-forest text-white rounded-xl font-black text-sm flex-shrink-0 transition-colors hover:bg-forest/90"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? 'Copied!' : 'Copy'}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
