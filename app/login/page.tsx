'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, ShieldCheck, Zap, Compass } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { PoweredByFooter } from '../_components/PoweredByFooter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { signIn } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await signIn(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-parchment relative overflow-x-hidden">
      {/* Background Decorative Elements */}
      <div className="lg:hidden absolute -top-24 -right-24 h-96 w-96 rounded-full gradient-safari opacity-20 blur-3xl pointer-events-none" />
      <div className="lg:hidden absolute -bottom-24 -left-24 h-96 w-96 rounded-full gradient-sunrise opacity-20 blur-3xl pointer-events-none" />

      {/* Desktop Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 gradient-safari relative overflow-hidden flex-col justify-between p-16 text-white shrink-0">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] opacity-10" />
        
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10"
        >
          <Link href="/" className="flex items-center space-x-3 mb-12 group">
            <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:scale-105 transition-transform">
              <img src="/logo.png" alt="SafariWrap" className="h-8 w-8" />
            </div>
            <span className="text-3xl font-black tracking-tighter">SafariWrap</span>
          </Link>
          
          <h2 className="text-6xl font-black leading-tight mb-6">
            Preserve the <br /> 
            <span className="text-savanna">Safari Magic.</span>
          </h2>
          <p className="text-xl text-white/80 font-medium max-w-md leading-relaxed">
            The platform for tour operators to turn guest reviews into personalized, shareable memories.
          </p>
        </motion.div>

        <div className="relative z-10 grid grid-cols-2 gap-8">
          <Feature icon={Zap} title="Real-time Wraps" desc="Guests get their wrap instantly." />
          <Feature icon={ShieldCheck} title="Operator Verified" desc="Premium branding for your agency." />
        </div>
        
        {/* Animated background element */}
        <motion.div 
          animate={{ 
            rotate: [0, 10, 0],
            scale: [1, 1.05, 1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-20 -left-20 h-96 w-96 rounded-full bg-savanna/10 blur-3xl" 
        />
      </div>

      {/* Form Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 lg:px-20 py-12 overflow-y-auto relative z-10 min-h-screen">
        <div className="w-full max-w-md py-8">
          {/* Mobile Header */}
          <div className="lg:hidden mb-10 text-center">
            <div className="h-16 w-16 rounded-2xl gradient-safari flex items-center justify-center mx-auto shadow-lg mb-4">
              <img src="/logo.png" alt="SafariWrap" className="h-10 w-10" />
            </div>
            <h1 className="text-3xl font-black text-forest">SafariWrap</h1>
            <p className="text-stone font-bold uppercase tracking-widest text-[10px] mt-2">Operator Portal</p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="lg:border-none lg:shadow-none lg:bg-transparent">
              <CardHeader className="space-y-1 pb-8">
                <CardTitle className="text-3xl">Welcome back</CardTitle>
                <CardDescription className="text-base">
                  Access your safari dashboard
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-3.5 h-5 w-5 text-stone/50" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="jane@operator.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                        className="pl-12 bg-white/50"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-3.5 h-5 w-5 text-stone/50" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                        className="pl-12 bg-white/50"
                        required
                      />
                    </div>
                  </div>

                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="rounded-2xl bg-error/10 p-4 border border-error/20"
                    >
                      <p className="text-sm font-bold text-error text-center">{error}</p>
                    </motion.div>
                  )}

                  <Button
                    className="w-full h-14 text-lg gap-2"
                    disabled={isLoading}
                    type="submit"
                    size="lg"
                  >
                    {isLoading ? 'Signing in...' : 'Sign In'}
                    {!isLoading && <ArrowRight className="h-5 w-5" />}
                  </Button>
                </form>

                <div className="mt-10 text-center">
                  <p className="text-sm font-bold text-stone">
                    New to the platform?{' '}
                    <Link href="/signup" className="text-forest hover:underline decoration-2 underline-offset-4">
                      Register your agency
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
        
        <div className="mt-auto pt-12">
          <PoweredByFooter />
        </div>
      </div>
    </div>
  );
}

function Feature({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="space-y-2">
      <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center mb-3">
        <Icon className="h-5 w-5" />
      </div>
      <h4 className="font-black text-lg text-white">{title}</h4>
      <p className="text-sm text-white/60 leading-relaxed font-bold">{desc}</p>
    </div>
  );
}
