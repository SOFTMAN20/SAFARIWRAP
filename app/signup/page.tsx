'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Building, Mail, Lock, ArrowRight, ArrowLeft, Paintbrush, Upload, Check, Sparkles, Layout, Globe, Camera } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PoweredByFooter } from '../_components/PoweredByFooter';
import { ColorPresets } from '@/lib/constants';

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    businessName: '',
    email: '',
    password: '',
  });

  const [branding, setBranding] = useState({
    primaryColor: '#1B4D3E',
    accentColor: '#F4C542',
    logo: null as File | null,
    logoUrl: null as string | null,
  });

  const { signUp } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleNext = () => setStep(2);
  const handleBack = () => setStep(1);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBranding({
        ...branding,
        logo: file,
        logoUrl: URL.createObjectURL(file),
      });
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await signUp({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        businessName: formData.businessName,
        brandColor1: branding.primaryColor,
        brandColor2: branding.accentColor,
        logoFile: branding.logo,
      });
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Failed to create account.');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-parchment relative overflow-x-hidden">
      {/* Background Decorative Element for Mobile */}
      <div className="lg:hidden absolute -top-24 -right-24 h-96 w-96 rounded-full gradient-safari opacity-20 blur-3xl pointer-events-none" />
      <div className="lg:hidden absolute -bottom-24 -left-24 h-96 w-96 rounded-full gradient-sunrise opacity-20 blur-3xl pointer-events-none" />

      {/* Desktop Hero Section */}
      <div className="hidden lg:flex lg:w-1/3 gradient-safari relative overflow-hidden flex-col justify-between p-16 text-white border-r border-white/10 shrink-0">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] opacity-10" />
        
        <div className="relative z-10">
          <Link href="/" className="flex items-center space-x-3 mb-12 group">
            <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center transition-transform group-hover:scale-110">
              <img src="/logo.png" alt="SafariWrap" className="h-6 w-6" />
            </div>
            <span className="text-2xl font-black tracking-tighter">SafariWrap</span>
          </Link>
          
          <h2 className="text-4xl font-black leading-tight mb-6">
            Build your <br /> 
            <span className="text-savanna">digital lodge.</span>
          </h2>
          <p className="text-lg text-white/70 font-bold leading-relaxed">
            Setup your operator identity and branding colors in seconds.
          </p>
        </div>

        <div className="relative z-10 space-y-8">
           <StepIndicator current={step} />
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col px-6 lg:px-20 py-12 items-center lg:items-start overflow-y-auto relative z-10 min-h-screen">
        <div className="w-full max-w-2xl py-8">
           <div className="lg:hidden mb-12 text-center">
             <div className="h-16 w-16 rounded-2xl gradient-safari flex items-center justify-center mx-auto shadow-lg mb-4">
              <img src="/logo.png" alt="SafariWrap" className="h-10 w-10" />
            </div>
            <h1 className="text-3xl font-black text-forest">SafariWrap</h1>
            <p className="text-stone font-bold uppercase tracking-widest text-[10px] mt-2">Operator Portal</p>
          </div>

          {/* Header */}
          <header className="mb-12">
            <h1 className="text-3xl lg:text-5xl font-black text-forest">
              {step === 1 ? 'About your agency' : 'Design your identity'}
            </h1>
            <p className="text-stone font-bold mt-2">
              {step === 1 ? 'Tell us who you are and how to reach you.' : 'How should your guests see your brand?'}
            </p>
          </header>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-[40px] border border-dust bg-white/80 backdrop-blur-lg p-8 lg:p-12 shadow-xl lg:shadow-none"
          >
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Your Name</Label>
                      <div className="relative">
                        <User className="absolute left-4 top-3.5 h-5 w-5 text-stone/50" />
                        <Input
                          id="name"
                          placeholder="Jane Safari"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="pl-12 bg-white/50"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="businessName">Agency Name</Label>
                      <div className="relative">
                        <Building className="absolute left-4 top-3.5 h-5 w-5 text-stone/50" />
                        <Input
                          id="businessName"
                          placeholder="Serengeti Soul Expeditions"
                          value={formData.businessName}
                          onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                          className="pl-12 bg-white/50"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Business Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-3.5 h-5 w-5 text-stone/50" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="jane@serengetisoul.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="pl-12 bg-white/50"
                        autoComplete="email"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Secure Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-3.5 h-5 w-5 text-stone/50" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="pl-12 bg-white/50"
                        autoComplete="new-password"
                        required
                      />
                    </div>
                  </div>
                  
                  <Button
                    className="w-full h-14 text-lg gap-2 mt-8"
                    onClick={handleNext}
                    disabled={!formData.email || !formData.password || !formData.name || !formData.businessName}
                    size="lg"
                  >
                    Continue to Branding
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  {/* Header Section */}
                  <div className="mb-8 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-forest/10 to-savanna/10 border border-forest/20 mb-4">
                      <Sparkles className="w-4 h-4 text-forest" />
                      <span className="text-xs font-bold text-forest uppercase tracking-wider">Customize Your Brand</span>
                    </div>
                    <p className="text-sm text-stone max-w-md mx-auto">
                      Choose colors and upload your logo to create a unique brand experience for your guests
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column - Controls */}
                    <div className="space-y-6">
                       {/* Color Pickers Section */}
                       <motion.div 
                         className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-6 border border-gray-200 shadow-sm"
                         initial={{ opacity: 0, y: 20 }}
                         animate={{ opacity: 1, y: 0 }}
                         transition={{ delay: 0.1 }}
                       >
                         <div className="flex items-center gap-2 mb-5">
                           <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-forest to-forest-light flex items-center justify-center">
                             <Paintbrush className="w-4 h-4 text-white" />
                           </div>
                           <h3 className="font-black text-forest">Brand Colors</h3>
                         </div>
                         
                         <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-3">
                             <Label htmlFor="primaryColor" className="text-xs font-bold text-stone uppercase tracking-wider">
                               Primary Color
                             </Label>
                             <div className="relative group">
                               <Input
                                 id="primaryColor"
                                 type="color"
                                 value={branding.primaryColor}
                                 onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                                 className="h-20 bg-white cursor-pointer border-2 border-gray-200 hover:border-forest/50 transition-all"
                               />
                               <div 
                                 className="absolute inset-3 rounded-xl pointer-events-none border-4 border-white shadow-lg transition-transform group-hover:scale-95"
                                 style={{ backgroundColor: branding.primaryColor }}
                               />
                             </div>
                             <div className="flex items-center justify-between px-3 py-2 bg-gray-100 rounded-lg">
                               <span className="text-[10px] font-bold text-stone uppercase">Hex</span>
                               <code className="text-xs font-mono font-bold text-forest">{branding.primaryColor}</code>
                             </div>
                           </div>
                           
                           <div className="space-y-3">
                             <Label htmlFor="accentColor" className="text-xs font-bold text-stone uppercase tracking-wider">
                               Accent Color
                             </Label>
                             <div className="relative group">
                               <Input
                                 id="accentColor"
                                 type="color"
                                 value={branding.accentColor}
                                 onChange={(e) => setBranding({ ...branding, accentColor: e.target.value })}
                                 className="h-20 bg-white cursor-pointer border-2 border-gray-200 hover:border-savanna/50 transition-all"
                               />
                               <div 
                                 className="absolute inset-3 rounded-xl pointer-events-none border-4 border-white shadow-lg transition-transform group-hover:scale-95"
                                 style={{ backgroundColor: branding.accentColor }}
                               />
                             </div>
                             <div className="flex items-center justify-between px-3 py-2 bg-gray-100 rounded-lg">
                               <span className="text-[10px] font-bold text-stone uppercase">Hex</span>
                               <code className="text-xs font-mono font-bold text-savanna">{branding.accentColor}</code>
                             </div>
                           </div>
                         </div>
                       </motion.div>

                       {/* Color Presets Section */}
                       <motion.div 
                         className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-6 border border-gray-200 shadow-sm"
                         initial={{ opacity: 0, y: 20 }}
                         animate={{ opacity: 1, y: 0 }}
                         transition={{ delay: 0.2 }}
                       >
                         <div className="flex items-center gap-2 mb-5">
                           <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-savanna to-amber-500 flex items-center justify-center">
                             <Sparkles className="w-4 h-4 text-white" />
                           </div>
                           <h3 className="font-black text-forest">Quick Presets</h3>
                         </div>
                         
                         <div className="grid grid-cols-6 gap-3">
                           {ColorPresets.map((preset, idx) => {
                             const isActive = branding.primaryColor === preset.primary && branding.accentColor === preset.accent;
                             return (
                               <motion.button
                                 key={idx}
                                 type="button"
                                 onClick={() => setBranding({ ...branding, primaryColor: preset.primary, accentColor: preset.accent })}
                                 className={`relative h-14 rounded-xl transition-all ${
                                   isActive
                                     ? 'scale-110 shadow-xl ring-4 ring-forest/30' 
                                     : 'hover:scale-105 hover:shadow-lg'
                                 }`}
                                 style={{ background: `linear-gradient(135deg, ${preset.primary} 0%, ${preset.accent} 100%)` }}
                                 whileHover={{ y: -2 }}
                                 whileTap={{ scale: 0.95 }}
                               >
                                 {isActive && (
                                   <motion.div
                                     initial={{ scale: 0 }}
                                     animate={{ scale: 1 }}
                                     className="absolute -top-1 -right-1 w-5 h-5 bg-forest rounded-full flex items-center justify-center shadow-lg"
                                   >
                                     <Check className="w-3 h-3 text-white" />
                                   </motion.div>
                                 )}
                               </motion.button>
                             );
                           })}
                         </div>
                       </motion.div>

                       {/* Logo Upload Section */}
                       <motion.div 
                         className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-6 border border-gray-200 shadow-sm"
                         initial={{ opacity: 0, y: 20 }}
                         animate={{ opacity: 1, y: 0 }}
                         transition={{ delay: 0.3 }}
                       >
                         <div className="flex items-center gap-2 mb-5">
                           <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                             <Upload className="w-4 h-4 text-white" />
                           </div>
                           <h3 className="font-black text-forest">Agency Logo</h3>
                         </div>
                         
                         <div 
                           className="relative flex items-center gap-4 p-5 rounded-2xl border-2 border-dashed transition-all cursor-pointer group overflow-hidden"
                           style={{
                             borderColor: branding.logoUrl ? branding.primaryColor + '60' : '#D1D5DB',
                             backgroundColor: branding.logoUrl ? branding.primaryColor + '08' : '#F9FAFB'
                           }}
                           onClick={() => fileInputRef.current?.click()}
                         >
                           {/* Background Pattern */}
                           <div className="absolute inset-0 opacity-5" style={{
                             backgroundImage: `radial-gradient(circle, ${branding.primaryColor} 1px, transparent 1px)`,
                             backgroundSize: '20px 20px'
                           }} />
                           
                           <div 
                             className="relative z-10 h-24 w-24 rounded-2xl flex items-center justify-center overflow-hidden border-2 transition-all group-hover:scale-105 shadow-md"
                             style={{
                               backgroundColor: branding.logoUrl ? 'white' : branding.primaryColor + '15',
                               borderColor: branding.logoUrl ? branding.primaryColor + '40' : '#E5E7EB'
                             }}
                           >
                             {branding.logoUrl ? (
                               <img src={branding.logoUrl} alt="Logo" className="h-full w-full object-contain p-2" />
                             ) : (
                               <div className="text-center">
                                 <Upload size={32} className="text-stone mx-auto mb-1" />
                                 <span className="text-[9px] font-bold text-stone uppercase">Upload</span>
                               </div>
                             )}
                           </div>
                           
                           <div className="relative z-10 flex-1">
                             <p className="font-black text-sm uppercase tracking-wider flex items-center gap-2 mb-1" style={{ color: branding.primaryColor }}>
                               {branding.logoUrl ? (
                                 <>
                                   <Check className="w-4 h-4" />
                                   Logo Uploaded
                                 </>
                               ) : (
                                 <>
                                   <Sparkles size={14} />
                                   Upload Your Logo
                                 </>
                               )}
                             </p>
                             <p className="text-xs font-semibold text-stone">
                               {branding.logoUrl ? 'Click to change your logo' : 'PNG, JPG or SVG • Max 2MB'}
                             </p>
                             {branding.logo && (
                               <div className="mt-2 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-lg inline-block">
                                 <p className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                                   <Check className="w-3 h-3" />
                                   {branding.logo.name}
                                 </p>
                               </div>
                             )}
                           </div>
                           
                           <ArrowRight className="relative z-10 w-6 h-6 text-stone group-hover:text-forest group-hover:translate-x-1 transition-all" />
                           <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleLogoChange} />
                         </div>
                       </motion.div>
                    </div>

                    {/* Right Column - Live Preview */}
                    <div className="space-y-6">
                       <motion.div
                         initial={{ opacity: 0, x: 20 }}
                         animate={{ opacity: 1, x: 0 }}
                         transition={{ delay: 0.2 }}
                       >
                         <div className="flex items-center gap-2 mb-5">
                           <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                             <Layout className="w-4 h-4 text-white" />
                           </div>
                           <h3 className="font-black text-forest">Live Preview</h3>
                           <div className="ml-auto">
                             <div className="flex items-center gap-1">
                               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                               <span className="text-[10px] font-bold text-emerald-600 uppercase">Live</span>
                             </div>
                           </div>
                         </div>
                         
                         {/* Main Preview Card */}
                         <motion.div 
                           className="rounded-3xl p-8 border-2 flex flex-col justify-center items-center text-center space-y-6 min-h-[450px] transition-all duration-500 shadow-xl"
                           style={{ 
                             background: `linear-gradient(135deg, ${branding.primaryColor}12 0%, ${branding.accentColor}12 100%)`,
                             borderColor: branding.primaryColor + '40'
                           }}
                           animate={{
                             borderColor: [branding.primaryColor + '40', branding.accentColor + '40', branding.primaryColor + '40'],
                           }}
                           transition={{ duration: 3, repeat: Infinity }}
                         >
                            {/* Logo Display */}
                            <motion.div 
                              className="relative"
                              whileHover={{ scale: 1.05 }}
                            >
                              <motion.div
                                className="absolute inset-0 rounded-[45px] blur-2xl opacity-30"
                                style={{ backgroundColor: branding.primaryColor }}
                                animate={{
                                  scale: [1, 1.1, 1],
                                  opacity: [0.3, 0.5, 0.3]
                                }}
                                transition={{ duration: 2, repeat: Infinity }}
                              />
                              <motion.div 
                                className="relative h-32 w-32 rounded-[45px] shadow-2xl flex items-center justify-center transition-all duration-500"
                                style={{ backgroundColor: branding.primaryColor }}
                                whileHover={{ rotate: 0 }}
                                animate={{ rotate: [3, -3, 3] }}
                                transition={{ duration: 4, repeat: Infinity }}
                              >
                                 {branding.logoUrl ? (
                                   <img src={branding.logoUrl} className="h-20 w-20 object-contain rounded-[45px] p-2" alt="Logo" />
                                 ) : (
                                   <Building className="h-16 w-16 text-white" />
                                 )}
                              </motion.div>
                            </motion.div>
                            
                            {/* Business Name */}
                            <div>
                              <h4 className="text-3xl font-black text-ink mb-3">{formData.businessName || 'Your Agency'}</h4>
                              <motion.div 
                                className="h-2 w-20 rounded-full mx-auto transition-all duration-500 shadow-sm" 
                                style={{ backgroundColor: branding.accentColor }}
                                animate={{ width: ['60px', '80px', '60px'] }}
                                transition={{ duration: 2, repeat: Infinity }}
                              />
                            </div>
                            
                            {/* Sample Buttons */}
                            <div className="flex flex-col gap-3 w-full max-w-xs">
                              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                <Button 
                                  variant="default" 
                                  size="lg" 
                                  className="w-full pointer-events-none transition-all duration-500 shadow-lg font-bold" 
                                  style={{ 
                                    backgroundColor: branding.primaryColor,
                                    color: 'white'
                                  }}
                                >
                                  <Sparkles className="w-4 h-4 mr-2" />
                                  Create Safari Wrap
                                </Button>
                              </motion.div>
                              
                              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                <Button 
                                  variant="outline" 
                                  size="lg" 
                                  className="w-full pointer-events-none border-2 transition-all duration-500 font-bold" 
                                  style={{ 
                                    borderColor: branding.primaryColor, 
                                    color: branding.primaryColor 
                                  }}
                                >
                                  <Camera className="w-4 h-4 mr-2" />
                                  View Gallery
                                </Button>
                              </motion.div>
                            </div>
                            
                            {/* Color Swatches */}
                            <div className="flex gap-4 pt-4">
                              <motion.div 
                                className="text-center"
                                whileHover={{ y: -4 }}
                              >
                                <div 
                                  className="w-14 h-14 rounded-2xl shadow-lg border-4 border-white transition-all duration-500" 
                                  style={{ backgroundColor: branding.primaryColor }}
                                />
                                <p className="text-[9px] font-bold text-stone mt-2 uppercase tracking-wider">Primary</p>
                              </motion.div>
                              <motion.div 
                                className="text-center"
                                whileHover={{ y: -4 }}
                              >
                                <div 
                                  className="w-14 h-14 rounded-2xl shadow-lg border-4 border-white transition-all duration-500" 
                                  style={{ backgroundColor: branding.accentColor }}
                                />
                                <p className="text-[9px] font-bold text-stone mt-2 uppercase tracking-wider">Accent</p>
                              </motion.div>
                            </div>
                         </motion.div>
                         
                         {/* Mini Preview Cards */}
                         <div className="grid grid-cols-3 gap-3">
                           {/* QR Code Preview */}
                           <motion.div 
                             className="bg-white rounded-2xl p-4 border-2 border-gray-200 text-center hover:shadow-lg transition-all"
                             whileHover={{ y: -4 }}
                           >
                             <div 
                               className="w-14 h-14 rounded-xl mx-auto mb-2 flex items-center justify-center shadow-md"
                               style={{ backgroundColor: branding.primaryColor }}
                             >
                               <div className="w-10 h-10 bg-white rounded-lg grid grid-cols-3 gap-[2px] p-1">
                                 {[...Array(9)].map((_, i) => (
                                   <div key={i} className="bg-gray-800 rounded-[1px]" />
                                 ))}
                               </div>
                             </div>
                             <p className="text-[9px] font-bold text-stone uppercase tracking-wider">QR Code</p>
                           </motion.div>
                           
                           {/* Badge Preview */}
                           <motion.div 
                             className="bg-white rounded-2xl p-4 border-2 border-gray-200 text-center hover:shadow-lg transition-all"
                             whileHover={{ y: -4 }}
                           >
                             <div 
                               className="px-3 py-2 rounded-full mx-auto mb-2 inline-block text-[10px] font-bold shadow-sm"
                               style={{ 
                                 backgroundColor: branding.accentColor + '25',
                                 color: branding.primaryColor
                               }}
                             >
                               Safari
                             </div>
                             <p className="text-[9px] font-bold text-stone uppercase tracking-wider">Badge</p>
                           </motion.div>
                           
                           {/* Card Preview */}
                           <motion.div 
                             className="bg-white rounded-2xl p-4 border-2 border-gray-200 text-center hover:shadow-lg transition-all"
                             whileHover={{ y: -4 }}
                           >
                             <div 
                               className="w-14 h-14 rounded-xl mx-auto mb-2 flex items-center justify-center shadow-md"
                               style={{ 
                                 background: `linear-gradient(135deg, ${branding.primaryColor} 0%, ${branding.accentColor} 100%)`
                               }}
                             >
                               <Sparkles className="w-6 h-6 text-white" />
                             </div>
                             <p className="text-[9px] font-bold text-stone uppercase tracking-wider">Card</p>
                           </motion.div>
                         </div>
                       </motion.div>
                    </div>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-2xl bg-red-50 p-5 border-2 border-red-200 my-8"
                    >
                      <p className="text-sm font-bold text-red-600 text-center flex items-center justify-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs">!</span>
                        {error}
                      </p>
                    </motion.div>
                  )}

                  <div className="flex space-x-4 mt-12 pt-8 border-t-2 border-gray-200">
                    <Button
                      variant="ghost"
                      className="px-8 gap-2 hover:bg-gray-100"
                      onClick={handleBack}
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back
                    </Button>
                    <Button
                      className="flex-1 h-16 text-lg gap-2 font-bold shadow-xl transition-all hover:scale-105"
                      disabled={isLoading}
                      onClick={handleSignup}
                      style={{
                        background: `linear-gradient(135deg, ${branding.primaryColor} 0%, ${branding.accentColor} 100%)`,
                        color: 'white'
                      }}
                    >
                      {isLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Creating Your Platform...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-5 w-5" />
                          Launch My Platform
                          <ArrowRight className="h-5 w-5" />
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {step === 1 && (
            <div className="mt-12 text-center lg:text-left ml-4">
              <p className="text-sm font-bold text-stone">
                Already part of the safari?{' '}
                <Link href="/login" className="text-forest hover:underline decoration-2 underline-offset-4">
                  Sign In
                </Link>
              </p>
            </div>
          )}
        </div>
        
        <div className="mt-auto pt-16 w-full max-w-2xl">
           <PoweredByFooter />
        </div>
      </main>
    </div>
  );
}

function StepIndicator({ current }: { current: number }) {
  const steps = [
    { n: 1, title: 'Identity', icon: <User size={18}/> },
    { n: 2, title: 'Branding', icon: <Paintbrush size={18}/> }
  ];
  
  return (
    <div className="space-y-6">
      {steps.map((s) => (
        <div key={s.n} className={`flex items-center space-x-4 transition-opacity ${current === s.n ? 'opacity-100' : 'opacity-40'}`}>
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-black ${current === s.n ? 'bg-savanna text-forest' : 'bg-white/10 text-white'}`}>
             {s.icon}
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/50">Step 0{s.n}</p>
            <p className="font-extrabold text-white">{s.title}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
