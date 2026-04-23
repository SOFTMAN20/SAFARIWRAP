'use client';

import { MapPin, Star, Share2, Heart, Camera, Clock, Award, Compass, TreePine, CheckCircle2, Users, Binoculars, Trophy, Map, Twitter, Facebook, MessageCircle, Link2, Copy, Download, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useRef, useState } from 'react';
import { domToPng } from 'modern-screenshot';

interface GuestWrapPageProps {
  wrapData: any;
}

export default function GuestWrapPage({ wrapData }: GuestWrapPageProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [showImagePreview, setShowImagePreview] = useState(false);

  // Transform wrap data
  const transformedData = {
    guest_name: wrapData.guest_name || wrapData.reviews?.guest_name || 'Guest',
    event_title: wrapData.events?.title || 'Experience',
    event_location: wrapData.events?.location || 'Location',
    event_type: wrapData.events?.type || 'safari',
    guest_rating: wrapData.reviews?.rating || wrapData.reviews?.star_rating || 5,
    guest_review: wrapData.reviews?.comment || wrapData.reviews?.review_text || '',
    memorable_moment: wrapData.reviews?.memorable_moment || '',
    guest_photos: (() => {
      if (wrapData.reviews?.photo_urls && Array.isArray(wrapData.reviews.photo_urls)) {
        return wrapData.reviews.photo_urls.filter((p: string) => p !== null && p !== '');
      }
      const photos = [];
      if (wrapData.reviews?.photo_1_url) photos.push(wrapData.reviews.photo_1_url);
      if (wrapData.reviews?.photo_2_url) photos.push(wrapData.reviews.photo_2_url);
      if (wrapData.reviews?.photo_3_url) photos.push(wrapData.reviews.photo_3_url);
      return photos;
    })(),
    operator: {
      business_name: wrapData.events?.operators?.business_name || 'SafariWrap',
      logo_url: wrapData.events?.operators?.logo_url || null,
      brand_color_1: wrapData.events?.operators?.brand_color_1 || '#1B4D3E',
      brand_color_2: wrapData.events?.operators?.brand_color_2 || '#F4C542',
    },
    safari_data: wrapData.events?.type === 'safari' ? {
      big_five_seen: wrapData.reviews?.big_five_seen?.split(',').map((s: string) => s.trim()).filter(Boolean) || [],
      other_animals: wrapData.reviews?.other_animals?.split(',').map((s: string) => s.trim()).filter(Boolean) || [],
      total_species: (() => {
        const bigFive = wrapData.reviews?.big_five_seen?.split(',').filter(Boolean).length || 0;
        const others = wrapData.reviews?.other_animals?.split(',').filter(Boolean).length || 0;
        return bigFive + others;
      })(),
      best_time: wrapData.reviews?.best_time || '',
    } : null,
    marathon_data: wrapData.events?.type === 'marathon' ? {
      finish_time: wrapData.reviews?.metadata?.finish_time || '',
      pace_per_km: wrapData.reviews?.metadata?.pace_per_km || '',
      difficulty_rating: wrapData.reviews?.metadata?.difficulty_rating || 3,
    } : null,
    tour_data: wrapData.events?.type === 'tour' ? {
      favorite_location: wrapData.reviews?.metadata?.favorite_location || '',
      guide_rating: wrapData.reviews?.metadata?.guide_rating || 5,
    } : null,
    environmental_impact: {
      trees_planted: wrapData.data?.environmental_impact?.trees_planted || 1,
      co2_offset_kg: wrapData.data?.environmental_impact?.co2_offset_kg || 22,
      gps_location: wrapData.data?.environmental_impact?.gps_location || '1.2858° S, 36.8219° E',
    },
    stats: {
      total_photos: (() => {
        if (wrapData.reviews?.photo_urls && Array.isArray(wrapData.reviews.photo_urls)) {
          return wrapData.reviews.photo_urls.filter((p: string) => p !== null && p !== '').length;
        }
        let count = 0;
        if (wrapData.reviews?.photo_1_url) count++;
        if (wrapData.reviews?.photo_2_url) count++;
        if (wrapData.reviews?.photo_3_url) count++;
        return count;
      })(),
    },
  };

  const currentYear = new Date().getFullYear();
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${transformedData.guest_name}'s Explorer Wrap`,
          text: `Check out my ${transformedData.event_type} experience!`,
          url: shareUrl,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    }
  };

  const generateImageBlob = async (): Promise<Blob | null> => {
    if (!wrapRef.current) return null;
    
    try {
      // Capture the wrap content as PNG using modern-screenshot
      const dataUrl = await domToPng(wrapRef.current, {
        scale: 2,
        quality: 1,
        backgroundColor: '#FCFAF5',
        width: 1200,
        style: {
          maxWidth: '1200px',
          margin: '0 auto'
        }
      });
      
      // Convert data URL to blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      return blob;
    } catch (error) {
      console.error('Error generating image:', error);
      return null;
    }
  };

  const shareFromPreview = async (platform: 'twitter' | 'facebook' | 'whatsapp' | 'download') => {
    if (!generatedImageUrl) return;
    
    setIsGeneratingImage(true);
    
    try {
      // Convert data URL to blob
      const response = await fetch(generatedImageUrl);
      const blob = await response.blob();
      const file = new File([blob], `${transformedData.guest_name}-wrap.png`, { type: 'image/png' });
      
      if (platform === 'download') {
        // Download image
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${transformedData.guest_name.replace(/\s+/g, '-')}-${transformedData.event_type}-wrap.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        alert('Image downloaded successfully! 🎉');
        return;
      }
      
      // Try Web Share API on mobile
      if (isMobileDevice() && navigator.share) {
        try {
          await navigator.share({
            title: `${transformedData.guest_name}'s Explorer Wrap`,
            text: `Check out my ${transformedData.event_type} experience! 🌍✨`,
            files: [file]
          });
          return;
        } catch (shareError: any) {
          if (shareError.name === 'AbortError') {
            console.log('Share cancelled by user');
            return;
          }
          console.log('Web Share failed, falling back');
        }
      }
      
      // Fallback: Download + open platform
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${transformedData.guest_name.replace(/\s+/g, '-')}-wrap.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => {
        if (platform === 'twitter') {
          const text = `Check out my ${transformedData.event_type} experience with ${transformedData.operator.business_name}! 🌍✨`;
          window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
        } else if (platform === 'facebook') {
          window.open('https://www.facebook.com/', '_blank');
        } else if (platform === 'whatsapp') {
          window.open('https://web.whatsapp.com/', '_blank');
        }
        URL.revokeObjectURL(url);
      }, 500);
      
      alert(`Image downloaded! Now opening ${platform}... 📸`);
      
    } catch (error) {
      console.error('Error sharing:', error);
      alert('Failed to share. Please try again.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const closePreview = () => {
    if (generatedImageUrl) {
      URL.revokeObjectURL(generatedImageUrl);
    }
    setGeneratedImageUrl(null);
    setShowImagePreview(false);
  };

  // Helper function to detect mobile device
  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  const shareToTwitter = async () => {
    setIsGeneratingImage(true);
    
    try {
      const blob = await generateImageBlob();
      if (!blob) {
        alert('Failed to generate image. Please try again.');
        setIsGeneratingImage(false);
        return;
      }

      const file = new File([blob], `${transformedData.guest_name}-wrap.png`, { type: 'image/png' });
      const text = `Check out my ${transformedData.event_type} experience with ${transformedData.operator.business_name}! 🌍✨`;

      // Try Web Share API on mobile devices
      if (isMobileDevice() && navigator.share) {
        try {
          await navigator.share({
            title: `${transformedData.guest_name}'s Explorer Wrap`,
            text: text,
            files: [file]
          });
          setIsGeneratingImage(false);
          return; // Success! Exit early
        } catch (shareError: any) {
          // User cancelled or share failed
          if (shareError.name === 'AbortError') {
            console.log('Share cancelled by user');
            setIsGeneratingImage(false);
            return;
          }
          console.log('Web Share failed, falling back to download:', shareError);
        }
      }

      // Fallback: Download + open Twitter (desktop or if share failed)
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${transformedData.guest_name.replace(/\s+/g, '-')}-wrap.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Wait a moment for download to start, then open Twitter
      setTimeout(() => {
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
        window.open(twitterUrl, '_blank');
        URL.revokeObjectURL(url);
      }, 500);
      
      alert('Image downloaded! Now opening Twitter... 📸🐦');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to prepare image. Please try again.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const shareToFacebook = async () => {
    setIsGeneratingImage(true);
    
    try {
      const blob = await generateImageBlob();
      if (!blob) {
        alert('Failed to generate image. Please try again.');
        setIsGeneratingImage(false);
        return;
      }

      const file = new File([blob], `${transformedData.guest_name}-wrap.png`, { type: 'image/png' });

      // Try Web Share API on mobile devices
      if (isMobileDevice() && navigator.share) {
        try {
          await navigator.share({
            title: `${transformedData.guest_name}'s Explorer Wrap`,
            text: `Check out my ${transformedData.event_type} experience! 🌍✨`,
            files: [file]
          });
          setIsGeneratingImage(false);
          return; // Success! Exit early
        } catch (shareError: any) {
          // User cancelled or share failed
          if (shareError.name === 'AbortError') {
            console.log('Share cancelled by user');
            setIsGeneratingImage(false);
            return;
          }
          console.log('Web Share failed, falling back to download:', shareError);
        }
      }

      // Fallback: Download + open Facebook (desktop or if share failed)
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${transformedData.guest_name.replace(/\s+/g, '-')}-wrap.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Wait a moment for download to start, then open Facebook
      setTimeout(() => {
        window.open('https://www.facebook.com/', '_blank');
        URL.revokeObjectURL(url);
      }, 500);
      
      alert('Image downloaded! Now opening Facebook... 📸📘');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to prepare image. Please try again.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const shareToWhatsApp = async () => {
    setIsGeneratingImage(true);
    
    try {
      const blob = await generateImageBlob();
      if (!blob) {
        alert('Failed to generate image. Please try again.');
        setIsGeneratingImage(false);
        return;
      }

      const file = new File([blob], `${transformedData.guest_name}-wrap.png`, { type: 'image/png' });

      // Try Web Share API on mobile devices
      if (isMobileDevice() && navigator.share) {
        try {
          await navigator.share({
            title: `${transformedData.guest_name}'s Explorer Wrap`,
            text: `Check out my ${transformedData.event_type} experience! 🌍✨`,
            files: [file]
          });
          setIsGeneratingImage(false);
          return; // Success! Exit early
        } catch (shareError: any) {
          // User cancelled or share failed
          if (shareError.name === 'AbortError') {
            console.log('Share cancelled by user');
            setIsGeneratingImage(false);
            return;
          }
          console.log('Web Share failed, falling back to download:', shareError);
        }
      }

      // Fallback for desktop: Download image then open WhatsApp Web
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${transformedData.guest_name.replace(/\s+/g, '-')}-wrap.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Wait a moment for download to start, then open WhatsApp Web
      setTimeout(() => {
        window.open('https://web.whatsapp.com/', '_blank');
        URL.revokeObjectURL(url);
      }, 500);
      
      alert('Image downloaded! Now opening WhatsApp... 📸💬');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to prepare image. Please try again.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const copyLink = async () => {
    setIsGeneratingImage(true);
    try {
      const blob = await generateImageBlob();
      if (!blob) {
        alert('Failed to generate image. Please try again.');
        return;
      }

      // Try to copy image to clipboard
      if (navigator.clipboard && navigator.clipboard.write) {
        try {
          const item = new ClipboardItem({ 'image/png': blob });
          await navigator.clipboard.write([item]);
          alert('Image copied to clipboard! Paste it anywhere. 📋');
          return;
        } catch (clipboardError) {
          console.log('Clipboard API not supported, falling back to download');
        }
      }

      // Fallback: Download image
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${transformedData.guest_name.replace(/\s+/g, '-')}-wrap.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      alert('Image downloaded! You can now share it. 📸');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to prepare image. Please try again.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const downloadAsImage = async () => {
    if (!wrapRef.current) return;
    
    setIsGeneratingImage(true);
    
    try {
      // Capture the wrap content as PNG using modern-screenshot
      const dataUrl = await domToPng(wrapRef.current, {
        scale: 2, // Higher quality (2x)
        quality: 1, // Maximum quality
        backgroundColor: '#FCFAF5', // Parchment background
        width: 1200, // Fixed width for consistency
        style: {
          maxWidth: '1200px',
          margin: '0 auto'
        }
      });
      
      // Show preview
      setGeneratedImageUrl(dataUrl);
      setShowImagePreview(true);
      
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Failed to generate image. Please try again.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const shareAsImage = async () => {
    if (!wrapRef.current) return;
    
    setIsGeneratingImage(true);
    
    try {
      // Capture the wrap content as PNG using modern-screenshot
      const dataUrl = await domToPng(wrapRef.current, {
        scale: 2, // Higher quality (2x)
        quality: 1, // Maximum quality
        backgroundColor: '#FCFAF5', // Parchment background
        width: 1200, // Fixed width for consistency
        style: {
          maxWidth: '1200px',
          margin: '0 auto'
        }
      });
      
      // Show preview
      setGeneratedImageUrl(dataUrl);
      setShowImagePreview(true);
      
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Failed to generate image. Please try again.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FCFAF5]">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {transformedData.operator.logo_url ? (
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: transformedData.operator.brand_color_1 }}
                >
                  <Image src={transformedData.operator.logo_url} alt={transformedData.operator.business_name} width={32} height={32} className="object-contain" />
                </div>
              ) : (
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: transformedData.operator.brand_color_1 }}
                >
                  <span className="text-white font-bold text-xs">{transformedData.operator.business_name.split(' ').map((w: string) => w[0]).join('').slice(0, 2)}</span>
                </div>
              )}
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">PRESENTED BY</p>
                <p className="text-sm font-bold text-gray-900">{transformedData.operator.business_name}</p>
              </div>
            </div>
            <div className="text-right hidden md:block">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">AUTHENTIC {transformedData.event_type.toUpperCase()} LOG • VERIFIED IMPACT</p>
            </div>
          </div>
        </div>
      </header>

      <div ref={wrapRef} data-wrap-content className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Hero Section - Desktop Grid Layout */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-8">
          
          {/* Main Title Card - Left Side - Using Operator Brand Color */}
          <div 
            className="lg:col-span-5 rounded-3xl p-8 lg:p-10 text-white shadow-xl relative overflow-hidden min-h-[500px] flex flex-col justify-between"
            style={{ 
              background: `linear-gradient(135deg, ${transformedData.operator.brand_color_1} 0%, ${transformedData.operator.brand_color_1}dd 50%, ${transformedData.operator.brand_color_1}bb 100%)`
            }}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
            </div>

            {/* Logo Badge */}
            {transformedData.operator.logo_url ? (
              <div className="absolute top-6 left-6 w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg z-10">
                <Image src={transformedData.operator.logo_url} alt={transformedData.operator.business_name} width={40} height={40} className="object-contain" />
              </div>
            ) : (
              <div 
                className="absolute top-6 left-6 w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg z-10"
                style={{ backgroundColor: transformedData.operator.brand_color_2 }}
              >
                <span 
                  className="font-bold text-sm"
                  style={{ color: transformedData.operator.brand_color_1 }}
                >
                  {transformedData.operator.business_name.split(' ').map((w: string) => w[0]).join('').slice(0, 2)}
                </span>
              </div>
            )}

            {/* Content */}
            <div className="relative z-10 mt-20">
              <h1 className="text-5xl lg:text-6xl font-black leading-tight mb-6">
                {transformedData.guest_name}'s<br />
                <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Explorer Wrap</span>
              </h1>
              
              <div className="flex items-center gap-3 text-lg mb-8">
                <MapPin className="w-6 h-6 text-gray-300" />
                <span className="font-semibold text-gray-100">{transformedData.event_title}</span>
              </div>
              
              <p className="text-sm text-gray-400 uppercase tracking-wider font-semibold">EXPEDITION {currentYear}</p>
            </div>

            {/* Bottom Section */}
            <div className="relative z-10">
              <div className="flex items-center gap-2">
                {transformedData.event_type === 'safari' && (
                  <>
                    <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-lg">
                      <Binoculars className="w-7 h-7 text-white" strokeWidth={2} />
                    </div>
                    <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-lg">
                      <Camera className="w-7 h-7 text-white" strokeWidth={2} />
                    </div>
                    <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-lg">
                      <MapPin className="w-7 h-7 text-white" strokeWidth={2} />
                    </div>
                  </>
                )}
                {transformedData.event_type === 'marathon' && (
                  <>
                    <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-lg">
                      <Trophy className="w-7 h-7 text-white" strokeWidth={2} />
                    </div>
                    <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-lg">
                      <Award className="w-7 h-7 text-white" strokeWidth={2} />
                    </div>
                    <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-lg">
                      <Clock className="w-7 h-7 text-white" strokeWidth={2} />
                    </div>
                  </>
                )}
                {transformedData.event_type === 'tour' && (
                  <>
                    <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-lg">
                      <Map className="w-7 h-7 text-white" strokeWidth={2} />
                    </div>
                    <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-lg">
                      <Compass className="w-7 h-7 text-white" strokeWidth={2} />
                    </div>
                    <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-lg">
                      <Users className="w-7 h-7 text-white" strokeWidth={2} />
                    </div>
                  </>
                )}
                {transformedData.stats.total_photos > 3 && (
                  <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-sm font-bold border border-white/20 shadow-lg text-white">
                    +{Math.min(transformedData.stats.total_photos - 3, 99)}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Side - Stats Grid */}
          <div className="lg:col-span-7 grid grid-cols-2 gap-4">
            
            {/* Rating Card */}
            <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-lg border border-gray-100 flex flex-col items-center justify-center">
              <Heart className="w-8 h-8 text-red-500 mb-4" />
              <div className="text-6xl lg:text-7xl font-black text-gray-900 mb-2">{transformedData.guest_rating}/5</div>
              <div className="text-xs text-gray-500 uppercase tracking-wider font-bold text-center">OVERALL SATISFACTION</div>
              <div className="flex items-center gap-1 mt-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className={`w-5 h-5 ${star <= transformedData.guest_rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`} />
                ))}
              </div>
            </div>

            {/* Species/Metric Card */}
            {transformedData.event_type === 'safari' && transformedData.safari_data && (
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-6 lg:p-8 shadow-lg text-white flex flex-col items-center justify-center">
                <Binoculars className="w-12 h-12 mb-4" strokeWidth={2.5} />
                <div className="text-6xl lg:text-7xl font-black mb-2">{transformedData.safari_data.total_species}</div>
                <div className="text-xs uppercase tracking-wider font-bold text-center text-orange-100">SPECIES SPOTTED</div>
              </div>
            )}

            {transformedData.event_type === 'marathon' && transformedData.marathon_data && (
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-6 lg:p-8 shadow-lg text-white flex flex-col items-center justify-center">
                <Trophy className="w-12 h-12 mb-4" strokeWidth={2.5} />
                <div className="text-4xl lg:text-5xl font-black mb-2">{transformedData.marathon_data.finish_time}</div>
                <div className="text-xs uppercase tracking-wider font-bold text-center text-blue-100">FINISH TIME</div>
              </div>
            )}

            {transformedData.event_type === 'tour' && transformedData.tour_data && (
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl p-6 lg:p-8 shadow-lg text-white flex flex-col items-center justify-center">
                <Map className="w-12 h-12 mb-4" strokeWidth={2.5} />
                <div className="text-6xl lg:text-7xl font-black mb-2">{transformedData.tour_data.guide_rating}/5</div>
                <div className="text-xs uppercase tracking-wider font-bold text-center text-purple-100">GUIDE RATING</div>
              </div>
            )}

            {/* Territory/Destinations Card - Full Width */}
            <div className="col-span-2 bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl overflow-hidden shadow-lg relative min-h-[280px]">
              {/* Background Image (if available) */}
              {transformedData.guest_photos.length > 0 && (
                <div className="absolute inset-0">
                  <Image 
                    src={transformedData.guest_photos[0]} 
                    alt="Destination" 
                    fill 
                    className="object-cover opacity-40"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent"></div>
                </div>
              )}

              {/* Content */}
              <div className="relative z-10 p-6 lg:p-8 h-full flex flex-col justify-between">
                <div className="flex items-center gap-2 text-white/80">
                  <Compass className="w-5 h-5" />
                  <span className="text-sm font-bold uppercase tracking-wider">EXPLORED TERRITORY</span>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  {transformedData.event_type === 'safari' && (
                    <>
                      <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-4 py-2 text-sm font-semibold text-white">
                        Serengeti National Park
                      </div>
                      <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-4 py-2 text-sm font-semibold text-white">
                        Amboseli National Park
                      </div>
                      <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-4 py-2 text-sm font-semibold text-white">
                        Tsavo National Parks
                      </div>
                    </>
                  )}
                  {transformedData.event_type === 'marathon' && (
                    <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-4 py-2 text-sm font-semibold text-white">
                      {transformedData.event_location}
                    </div>
                  )}
                  {transformedData.event_type === 'tour' && (
                    <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-4 py-2 text-sm font-semibold text-white">
                      {transformedData.event_location}
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Photo Gallery Section */}
        {transformedData.guest_photos.length > 0 && (
          <section className="mb-8">
            <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: transformedData.operator.brand_color_1 }}
                  >
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 
                      className="text-2xl font-black"
                      style={{ color: transformedData.operator.brand_color_1 }}
                    >
                      {transformedData.event_type === 'safari' ? 'Safari' : transformedData.event_type === 'marathon' ? 'Marathon' : 'Tour'} Captured
                    </h2>
                    <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">{transformedData.guest_photos.length} UNFORGOTTEN MOMENTS</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {transformedData.guest_photos.map((photo: string, index: number) => (
                  <div key={index} className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 shadow-md hover:shadow-xl transition-shadow duration-300">
                    <Image src={photo} alt={`Photo ${index + 1}`} fill className="object-cover hover:scale-105 transition-transform duration-300" />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Memorable Moment Section */}
        {(transformedData.memorable_moment || transformedData.guest_review) && (
          <section className="mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              
              {/* Story Card */}
              <div className="lg:col-span-2 bg-white rounded-3xl p-8 lg:p-10 shadow-lg border border-gray-100">
                <div className="mb-6">
                  <div className="inline-block bg-gray-100 rounded-full px-4 py-1.5 mb-4">
                    <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">HIGHLIGHT STORY</span>
                  </div>
                  <h2 className="text-3xl lg:text-4xl font-black text-gray-900 italic leading-tight">
                    "{transformedData.memorable_moment || transformedData.guest_review}"
                  </h2>
                </div>

                {transformedData.memorable_moment && transformedData.guest_review && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <p className="text-base text-gray-600 leading-relaxed">{transformedData.guest_review}</p>
                  </div>
                )}
              </div>

              {/* Guest Info Card */}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-8 shadow-lg border border-gray-100 flex flex-col justify-center items-center text-center">
                {/* Icon based on event type - Using Operator Brand Colors */}
                {transformedData.event_type === 'safari' && (
                  <div 
                    className="w-20 h-20 rounded-full flex items-center justify-center mb-4 shadow-lg"
                    style={{ 
                      background: `linear-gradient(135deg, ${transformedData.operator.brand_color_1} 0%, ${transformedData.operator.brand_color_2} 100%)`
                    }}
                  >
                    <Binoculars className="w-10 h-10 text-white" strokeWidth={2.5} />
                  </div>
                )}
                {transformedData.event_type === 'marathon' && (
                  <div 
                    className="w-20 h-20 rounded-full flex items-center justify-center mb-4 shadow-lg"
                    style={{ 
                      background: `linear-gradient(135deg, ${transformedData.operator.brand_color_1} 0%, ${transformedData.operator.brand_color_2} 100%)`
                    }}
                  >
                    <Trophy className="w-10 h-10 text-white" strokeWidth={2.5} />
                  </div>
                )}
                {transformedData.event_type === 'tour' && (
                  <div 
                    className="w-20 h-20 rounded-full flex items-center justify-center mb-4 shadow-lg"
                    style={{ 
                      background: `linear-gradient(135deg, ${transformedData.operator.brand_color_1} 0%, ${transformedData.operator.brand_color_2} 100%)`
                    }}
                  >
                    <Map className="w-10 h-10 text-white" strokeWidth={2.5} />
                  </div>
                )}
                
                <h3 
                  className="text-2xl font-black mb-2"
                  style={{ color: transformedData.operator.brand_color_1 }}
                >
                  {transformedData.guest_name}
                </h3>
                <p className="text-sm text-gray-500 uppercase tracking-wider font-bold">GUEST EXPLORER</p>
              </div>

            </div>
          </section>
        )}

        {/* Conservation Impact Section - Enhanced Design */}
        <section className="mb-8">
          <div className="relative rounded-2xl lg:rounded-3xl overflow-hidden shadow-2xl">
            {/* Background with gradient and pattern */}
            <div 
              className="absolute inset-0"
              style={{
                background: `linear-gradient(135deg, ${transformedData.operator.brand_color_1} 0%, ${transformedData.operator.brand_color_1}dd 50%, #065f46 100%)`
              }}
            >
              {/* Animated background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{ 
                  backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px)',
                  backgroundSize: '50px 50px'
                }}></div>
              </div>
            </div>

            <div className="relative grid grid-cols-1 lg:grid-cols-5 gap-6 p-6 sm:p-8 lg:p-12">
              
              {/* Left Side - Impact Story (3 columns) */}
              <div className="lg:col-span-3 text-white space-y-4 sm:space-y-6">
                {/* Header with animated icon */}
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-md rounded-xl sm:rounded-2xl flex items-center justify-center border border-white/30 shadow-lg">
                      <TreePine className="w-6 h-6 sm:w-8 sm:h-8 text-green-300" strokeWidth={2.5} />
                    </div>
                    {/* Pulse animation */}
                    <div className="absolute inset-0 bg-green-400/30 rounded-xl sm:rounded-2xl animate-ping"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black leading-tight mb-1 sm:mb-2">
                      Your Conservation
                    </h2>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black leading-tight bg-gradient-to-r from-green-300 to-emerald-200 bg-clip-text text-transparent">
                      Legacy
                    </h2>
                  </div>
                </div>

                {/* Impact Description */}
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                  <p className="text-base sm:text-lg text-white/90 leading-relaxed">
                    In celebration of your journey, <span className="font-black text-white">{transformedData.operator.business_name}</span> has planted{' '}
                    <span className="font-black text-green-300 text-xl sm:text-2xl">{transformedData.environmental_impact.trees_planted}</span>{' '}
                    indigenous tree{transformedData.environmental_impact.trees_planted > 1 ? 's' : ''} in the <span className="font-bold text-white">Transmara region</span>.
                  </p>
                </div>

                {/* Impact Stats Grid */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {/* CO2 Offset Card */}
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center">
                    <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-green-300 mb-1 sm:mb-2">
                      {transformedData.environmental_impact.co2_offset_kg}
                    </div>
                    <div className="text-xs sm:text-sm text-white/80 font-semibold mb-0.5 sm:mb-1">kg CO₂</div>
                    <div className="text-[10px] sm:text-xs text-white/60 uppercase tracking-wider">Annual Offset</div>
                  </div>

                  {/* Trees Planted Card */}
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center">
                    <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-green-300 mb-1 sm:mb-2">
                      {transformedData.environmental_impact.trees_planted}
                    </div>
                    <div className="text-xs sm:text-sm text-white/80 font-semibold mb-0.5 sm:mb-1">
                      {transformedData.environmental_impact.trees_planted === 1 ? 'Tree' : 'Trees'}
                    </div>
                    <div className="text-[10px] sm:text-xs text-white/60 uppercase tracking-wider">Planted</div>
                  </div>
                </div>

                {/* Verified Badges - Responsive */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                  <div className="inline-flex items-center justify-center gap-2 bg-green-500/20 backdrop-blur-md border border-green-400/30 rounded-full px-4 sm:px-5 py-2 sm:py-2.5">
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-300 flex-shrink-0" strokeWidth={2.5} />
                    <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-green-200">Impact Verified</span>
                  </div>
                  <div className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 sm:px-5 py-2 sm:py-2.5">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-white/80 flex-shrink-0" strokeWidth={2.5} />
                    <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white/80">GPS Tracked</span>
                  </div>
                </div>
              </div>

              {/* Right Side - Certificate Card (2 columns) */}
              <div className="lg:col-span-2 flex items-center justify-center mt-6 lg:mt-0">
                <div className="w-full max-w-sm">
                  {/* Certificate Card */}
                  <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl border-2 sm:border-4 border-white/20">
                    {/* Certificate Header */}
                    <div className="text-center mb-4 sm:mb-6 pb-4 sm:pb-6 border-b-2 border-dashed border-gray-200">
                      <div className="inline-block bg-green-100 rounded-full px-3 sm:px-4 py-1 sm:py-1.5 mb-2 sm:mb-3">
                        <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-green-700">
                          Conservation Certificate
                        </span>
                      </div>
                      <p className="text-[9px] sm:text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                        CERT. #{Math.floor(Math.random() * 900000) + 100000}
                      </p>
                    </div>

                    {/* Tree Icon */}
                    <div className="flex justify-center mb-4 sm:mb-6">
                      <div 
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center shadow-lg"
                        style={{
                          background: `linear-gradient(135deg, ${transformedData.operator.brand_color_1} 0%, #10b981 100%)`
                        }}
                      >
                        <TreePine className="w-10 h-10 sm:w-12 sm:h-12 text-white" strokeWidth={2.5} />
                      </div>
                    </div>

                    {/* Trees Count */}
                    <div className="text-center mb-4 sm:mb-6">
                      <div 
                        className="text-5xl sm:text-6xl lg:text-7xl font-black mb-1 sm:mb-2"
                        style={{ color: transformedData.operator.brand_color_1 }}
                      >
                        {transformedData.environmental_impact.trees_planted}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600 font-bold uppercase tracking-wider mb-2 sm:mb-4">
                        {transformedData.environmental_impact.trees_planted === 1 ? 'Tree Planted' : 'Trees Planted'}
                      </div>
                      <div className="text-[10px] sm:text-xs text-gray-500 font-semibold">
                        in the Transmara Region
                      </div>
                    </div>

                    {/* GPS Location */}
                    <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6">
                      <div className="flex items-center justify-center gap-2 mb-1 sm:mb-2">
                        <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                        <span className="text-[10px] sm:text-xs text-gray-600 uppercase tracking-wider font-bold">
                          GPS Location
                        </span>
                      </div>
                      <div className="text-center">
                        <p className="text-base sm:text-lg font-mono font-black text-gray-800 break-all">
                          {transformedData.environmental_impact.gps_location.split(',')[0]},
                        </p>
                        <p className="text-base sm:text-lg font-mono font-black text-gray-800 break-all">
                          {transformedData.environmental_impact.gps_location.split(',')[1]}
                        </p>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="text-center pt-6 border-t-2 border-dashed border-gray-200">
                      <p className="text-xs text-gray-500 font-semibold mb-1">
                        Presented by
                      </p>
                      <p 
                        className="text-sm font-black uppercase tracking-wider"
                        style={{ color: transformedData.operator.brand_color_1 }}
                      >
                        {transformedData.operator.business_name}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

      </div>

      {/* Share Section - Outside wrap content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <section className="mb-8">
          <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-lg border border-gray-100 text-center">
            {transformedData.operator.logo_url && (
              <div className="mb-6">
                <div className="relative w-16 h-16 mx-auto">
                  <Image src={transformedData.operator.logo_url} alt={transformedData.operator.business_name} fill className="object-contain" />
                </div>
              </div>
            )}

            <div className="mb-6">
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-2 font-bold">AUTHENTIC EXPEDITION LOG</p>
            </div>

            <div className="mb-8">
              <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-4">Keep the {transformedData.event_type} soul alive.</h2>
              <p className="text-gray-600 text-lg">Share your experience with friends and family</p>
            </div>

            {/* Primary Share Buttons */}
            <div className="mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
              <Button 
                onClick={shareAsImage} 
                size="lg" 
                disabled={isGeneratingImage}
                className="text-white px-8 py-6 text-lg font-bold shadow-lg rounded-2xl hover:opacity-90 transition-opacity"
                style={{ 
                  backgroundColor: transformedData.operator.brand_color_1
                }}
              >
                {isGeneratingImage ? (
                  <>
                    <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-5 h-5 mr-2" />
                    Share as Image
                  </>
                )}
              </Button>

              <Button 
                onClick={downloadAsImage} 
                size="lg" 
                disabled={isGeneratingImage}
                variant="outline"
                className="border-2 px-8 py-6 text-lg font-bold shadow-lg rounded-2xl hover:opacity-90 transition-opacity"
                style={{ 
                  borderColor: transformedData.operator.brand_color_1,
                  color: transformedData.operator.brand_color_1
                }}
              >
                {isGeneratingImage ? (
                  <>
                    <div className="w-5 h-5 mr-2 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: transformedData.operator.brand_color_1 }}></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5 mr-2" />
                    Download Image
                  </>
                )}
              </Button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Share as image</span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            {/* Social Media Share Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
              <Button
                onClick={shareToTwitter}
                variant="outline"
                size="lg"
                disabled={isGeneratingImage}
                className="border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 rounded-xl px-6"
              >
                {isGeneratingImage ? (
                  <>
                    <div className="w-5 h-5 mr-2 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                    <span className="font-semibold">Generating...</span>
                  </>
                ) : (
                  <>
                    <Twitter className="w-5 h-5 mr-2 text-blue-400" />
                    <span className="font-semibold">Twitter</span>
                  </>
                )}
              </Button>

              <Button
                onClick={shareToFacebook}
                variant="outline"
                size="lg"
                disabled={isGeneratingImage}
                className="border-2 border-gray-200 hover:border-blue-600 hover:bg-blue-50 rounded-xl px-6"
              >
                {isGeneratingImage ? (
                  <>
                    <div className="w-5 h-5 mr-2 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="font-semibold">Generating...</span>
                  </>
                ) : (
                  <>
                    <Facebook className="w-5 h-5 mr-2 text-blue-600" />
                    <span className="font-semibold">Facebook</span>
                  </>
                )}
              </Button>

              <Button
                onClick={shareToWhatsApp}
                variant="outline"
                size="lg"
                disabled={isGeneratingImage}
                className="border-2 border-gray-200 hover:border-green-500 hover:bg-green-50 rounded-xl px-6"
              >
                {isGeneratingImage ? (
                  <>
                    <div className="w-5 h-5 mr-2 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="font-semibold">Generating...</span>
                  </>
                ) : (
                  <>
                    <MessageCircle className="w-5 h-5 mr-2 text-green-500" />
                    <span className="font-semibold">WhatsApp</span>
                  </>
                )}
              </Button>

              <Button
                onClick={copyLink}
                variant="outline"
                size="lg"
                disabled={isGeneratingImage}
                className="border-2 border-gray-200 hover:border-gray-400 hover:bg-gray-50 rounded-xl px-6"
              >
                {isGeneratingImage ? (
                  <>
                    <div className="w-5 h-5 mr-2 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="font-semibold">Generating...</span>
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-5 h-5 mr-2 text-gray-600" />
                    <span className="font-semibold">Copy Image</span>
                  </>
                )}
              </Button>
            </div>

            <div className="text-xs text-gray-400 uppercase tracking-widest font-bold">POWERED BY SAFARIWRAP</div>
          </div>
        </section>
      </div>

      {/* Image Preview Modal */}
      {showImagePreview && generatedImageUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-auto bg-white rounded-3xl shadow-2xl">
            {/* Close Button */}
            <button
              onClick={closePreview}
              className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
            >
              <span className="text-2xl text-gray-600">×</span>
            </button>

            {/* Image Preview */}
            <div className="p-6">
              <h2 className="text-2xl font-black text-gray-900 mb-4 text-center">Your Wrap is Ready! 🎉</h2>
              <p className="text-gray-600 mb-6 text-center">Share your experience with the world</p>
              
              {/* Image */}
              <div className="mb-6 rounded-2xl overflow-hidden shadow-lg">
                <img src={generatedImageUrl} alt="Generated Wrap" className="w-full h-auto" />
              </div>

              {/* Share Buttons */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Button
                    onClick={() => shareFromPreview('twitter')}
                    disabled={isGeneratingImage}
                    className="bg-blue-400 hover:bg-blue-500 text-white"
                  >
                    <Twitter className="w-5 h-5 mr-2" />
                    Twitter
                  </Button>

                  <Button
                    onClick={() => shareFromPreview('facebook')}
                    disabled={isGeneratingImage}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Facebook className="w-5 h-5 mr-2" />
                    Facebook
                  </Button>

                  <Button
                    onClick={() => shareFromPreview('whatsapp')}
                    disabled={isGeneratingImage}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    WhatsApp
                  </Button>

                  <Button
                    onClick={() => shareFromPreview('download')}
                    disabled={isGeneratingImage}
                    variant="outline"
                    className="border-2"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Download
                  </Button>
                </div>

                <p className="text-sm text-gray-500 text-center">
                  {isMobileDevice() 
                    ? 'Tap a button to share directly to your favorite app'
                    : 'Click to download and open the platform'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
