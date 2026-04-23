'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Compass, 
  Camera, 
  Sparkles, 
  Users, 
  Heart, 
  Share2,
  ArrowRight,
  Star,
  MapPin,
  Zap,
  Shield,
  TrendingUp,
  Award,
  Globe,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-parchment">
      {/* Navigation */}
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 bg-parchment/95 backdrop-blur-lg border-b border-dust"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <img src="/logo.png" alt="SafariWrap" className="w-8 h-8" />
              <span className="text-xl sm:text-2xl font-extrabold text-forest">
                Safari<span className="text-yellow-500">Wrap</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-3 lg:gap-4">
              <Link href="/track-safari">
                <Button variant="ghost" className="text-forest hover:bg-forest/10" size="sm">
                  <MapPin className="w-4 h-4 mr-2" />
                  Track Safari
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="ghost" className="text-forest hover:bg-forest/10" size="sm">
                  Pricing
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="ghost" className="text-forest hover:bg-forest/10" size="sm">
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-forest hover:bg-forest-light text-white" size="sm">
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-forest hover:bg-forest/10 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-dust bg-parchment"
            >
              <div className="px-4 py-4 space-y-3">
                <Link href="/track-safari" className="block" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start text-forest hover:bg-forest/10">
                    <MapPin className="w-4 h-4 mr-2" />
                    Track Safari
                  </Button>
                </Link>
                <Link href="/pricing" className="block" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start text-forest hover:bg-forest/10">
                    Pricing
                  </Button>
                </Link>
                <Link href="/login" className="block" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start text-forest hover:bg-forest/10">
                    Login
                  </Button>
                </Link>
                <Link href="/signup" className="block" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-forest hover:bg-forest-light text-white">
                    Get Started
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-forest/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-savanna/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center lg:text-left"
            >
              <Badge className="mb-4 sm:mb-6 bg-savanna/20 text-forest border-savanna/30 inline-flex">
                <Sparkles className="w-3 h-3 mr-1" />
                Transform Safari Memories
              </Badge>
              
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-forest mb-4 sm:mb-6 leading-tight">
                Your Safari,
                <span className="block bg-gradient-to-r from-forest via-forest-light to-savanna bg-clip-text text-transparent">
                  Wrapped
                </span>
              </h1>
              
              <p className="text-lg sm:text-xl text-ink-light mb-6 sm:mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Create stunning visual stories from your safari experiences. 
                Collect guest reviews, generate beautiful wraps, and share unforgettable memories.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 sm:mb-12 justify-center lg:justify-start">
                <Link href="/signup" className="w-full sm:w-auto">
                  <Button size="lg" className="bg-forest hover:bg-forest-light text-white w-full">
                    <Compass className="w-5 h-5 mr-2" />
                    Start Free Trial
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="border-forest text-forest hover:bg-forest hover:text-white w-full sm:w-auto">
                  <Camera className="w-5 h-5 mr-2" />
                  Watch Demo
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 sm:gap-6 max-w-lg mx-auto lg:mx-0">
                {[
                  { value: '500+', label: 'Safari Operators' },
                  { value: '10K+', label: 'Wraps Created' },
                  { value: '50K+', label: 'Happy Guests' }
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="text-center lg:text-left"
                  >
                    <div className="text-2xl sm:text-3xl font-extrabold text-forest">{stat.value}</div>
                    <div className="text-xs sm:text-sm text-stone font-semibold">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right Content - Feature Cards */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative mt-8 lg:mt-0"
            >
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {/* Card 1 */}
                <motion.div
                  whileHover={{ y: -8, rotate: -2 }}
                  className="col-span-2"
                >
                  <Card className="bg-gradient-to-br from-forest to-forest-light text-white border-0 shadow-2xl">
                    <CardContent className="p-4 sm:p-6">
                      <Camera className="w-8 sm:w-10 h-8 sm:h-10 mb-3 sm:mb-4 opacity-90" />
                      <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">Beautiful Wraps</h3>
                      <p className="text-xs sm:text-sm opacity-90">Auto-generate stunning visual stories</p>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Card 2 */}
                <motion.div whileHover={{ y: -8, rotate: 2 }}>
                  <Card className="bg-white shadow-lg hover:shadow-2xl transition-shadow">
                    <CardContent className="p-4 sm:p-6">
                      <Users className="w-6 sm:w-8 h-6 sm:h-8 text-savanna mb-2 sm:mb-3" />
                      <h3 className="text-sm sm:text-base font-bold text-forest mb-1">Guest Reviews</h3>
                      <p className="text-xs text-stone">Collect feedback easily</p>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Card 3 */}
                <motion.div whileHover={{ y: -8, rotate: -2 }}>
                  <Card className="bg-white shadow-lg hover:shadow-2xl transition-shadow">
                    <CardContent className="p-4 sm:p-6">
                      <Share2 className="w-6 sm:w-8 h-6 sm:h-8 text-forest mb-2 sm:mb-3" />
                      <h3 className="text-sm sm:text-base font-bold text-forest mb-1">Easy Sharing</h3>
                      <p className="text-xs text-stone">Share on social media</p>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Card 4 */}
                <motion.div
                  whileHover={{ y: -8, rotate: 2 }}
                  className="col-span-2"
                >
                  <Card className="bg-gradient-to-br from-savanna to-savanna-dark text-forest border-0 shadow-2xl">
                    <CardContent className="p-4 sm:p-6">
                      <Sparkles className="w-8 sm:w-10 h-8 sm:h-10 mb-3 sm:mb-4" />
                      <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">QR Code Magic</h3>
                      <p className="text-xs sm:text-sm opacity-90">Guests scan & review instantly</p>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <Badge className="mb-4 bg-forest/10 text-forest border-forest/20">
              <Zap className="w-3 h-3 mr-1" />
              Powerful Features
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-forest mb-3 sm:mb-4 px-4">
              Everything You Need
            </h2>
            <p className="text-lg sm:text-xl text-stone max-w-2xl mx-auto px-4">
              Built for safari operators who want to create memorable experiences
            </p>
          </motion.div>

          {/* Feature Showcase with Images */}
          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 mb-12 sm:mb-16">
            {/* Feature 1 - Visual Storytelling */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative group"
            >
              <div className="relative h-64 sm:h-80 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1549366021-9f761d450615?q=80&w=2070&auto=format&fit=crop"
                  alt="Safari photography"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-forest/90 via-forest/50 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 lg:p-8 text-white">
                  <Camera className="w-10 sm:w-12 h-10 sm:h-12 mb-3 sm:mb-4" />
                  <h3 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">Visual Storytelling</h3>
                  <p className="text-sm sm:text-base text-white/90">Auto-generate beautiful wraps from safari photos and guest reviews</p>
                </div>
              </div>
            </motion.div>

            {/* Feature 2 - Guest Management */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative group"
            >
              <div className="relative h-64 sm:h-80 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1523805009345-7448845a9e53?q=80&w=2072&auto=format&fit=crop"
                  alt="Safari guests"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-savanna/90 via-savanna/50 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 lg:p-8 text-white">
                  <Users className="w-10 sm:w-12 h-10 sm:h-12 mb-3 sm:mb-4" />
                  <h3 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">Guest Management</h3>
                  <p className="text-sm sm:text-base text-white/90">Collect reviews and feedback with QR codes and mobile-friendly forms</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Feature Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {[
              {
                icon: Share2,
                title: 'Social Sharing',
                description: 'Share wraps on WhatsApp, Instagram, and other platforms instantly',
                color: 'text-forest'
              },
              {
                icon: MapPin,
                title: 'Multi-Destination',
                description: 'Track visits to multiple parks and destinations in one trip',
                color: 'text-savanna'
              },
              {
                icon: Shield,
                title: 'Secure & Private',
                description: 'Your data is encrypted and protected with enterprise-grade security',
                color: 'text-forest'
              },
              {
                icon: TrendingUp,
                title: 'Analytics Dashboard',
                description: 'Track reviews, wraps, and guest engagement with detailed insights',
                color: 'text-savanna'
              }
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full hover:shadow-xl transition-all hover:-translate-y-2 border-2 border-transparent hover:border-forest/20">
                  <CardContent className="p-4 sm:p-6">
                    <div className={`w-10 sm:w-12 h-10 sm:h-12 rounded-xl sm:rounded-2xl bg-${feature.color === 'text-forest' ? 'forest' : 'savanna'}/10 flex items-center justify-center mb-3 sm:mb-4`}>
                      <feature.icon className={`w-5 sm:w-6 h-5 sm:h-6 ${feature.color}`} />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-forest mb-2">{feature.title}</h3>
                    <p className="text-sm sm:text-base text-stone">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* Social Proof */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <Badge className="mb-4 bg-forest/10 text-forest border-forest/20">
              <Heart className="w-3 h-3 mr-1" />
              Loved by Operators
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-forest mb-3 sm:mb-4 px-4">
              What Operators Say
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                name: 'John Mwangi',
                role: 'Safari Operator, Kenya',
                content: 'SafariWrap transformed how we collect guest feedback. The wraps are stunning and our guests love sharing them!',
                rating: 5
              },
              {
                name: 'Sarah Kimani',
                role: 'Tour Guide, Tanzania',
                content: 'The QR code system is genius! Guests can review instantly, and we get beautiful wraps automatically.',
                rating: 5
              },
              {
                name: 'David Omondi',
                role: 'Lodge Manager, Kenya',
                content: 'Best investment for our safari business. The wraps help us stand out and guests remember us forever.',
                rating: 5
              }
            ].map((testimonial, i) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full hover:shadow-xl transition-shadow">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex gap-1 mb-3 sm:mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 sm:w-5 h-4 sm:h-5 fill-savanna text-savanna" />
                      ))}
                    </div>
                    <p className="text-sm sm:text-base text-ink mb-4 sm:mb-6 italic">"{testimonial.content}"</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-full bg-gradient-to-br from-forest to-savanna flex items-center justify-center text-white font-bold text-sm sm:text-base">
                        {testimonial.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-forest text-sm sm:text-base">{testimonial.name}</div>
                        <div className="text-xs sm:text-sm text-stone">{testimonial.role}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-forest via-forest-light to-savanna-dark text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/patterns/topography.svg')] opacity-10" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Award className="w-12 sm:w-16 h-12 sm:h-16 mx-auto mb-4 sm:mb-6 opacity-90" />
            <h2 className="text-3xl sm:text-4xl lg:text-6xl font-extrabold mb-4 sm:mb-6 px-4">
              Ready to Transform Your Safari Experience?
            </h2>
            <p className="text-base sm:text-lg lg:text-xl opacity-90 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
              Join hundreds of safari operators creating unforgettable memories with SafariWrap
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
              <Link href="/signup" className="w-full sm:w-auto">
                <Button size="lg" className="bg-white text-forest hover:bg-parchment w-full">
                  <Compass className="w-5 h-5 mr-2" />
                  Start Free Trial
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 w-full sm:w-auto">
                <Globe className="w-5 h-5 mr-2" />
                Contact Sales
              </Button>
            </div>
            <p className="text-xs sm:text-sm opacity-75 mt-4 sm:mt-6 px-4">
              No credit card required • Free 14-day trial • Cancel anytime
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-forest-dark text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <img src="/logo.png" alt="SafariWrap" className="w-5 sm:w-6 h-5 sm:h-6" />
                <span className="text-lg sm:text-xl font-extrabold">
                  Safari<span className="text-yellow-500">Wrap</span>
                </span>
              </div>
              <p className="text-xs sm:text-sm opacity-75">
                Transform safari memories into beautiful visual stories.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-3 sm:mb-4 text-sm sm:text-base">Product</h4>
              <ul className="space-y-2 text-xs sm:text-sm opacity-75">
                <li><Link href="#" className="hover:opacity-100">Features</Link></li>
                <li><Link href="/pricing" className="hover:opacity-100">Pricing</Link></li>
                <li><Link href="#" className="hover:opacity-100">Demo</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-3 sm:mb-4 text-sm sm:text-base">Company</h4>
              <ul className="space-y-2 text-xs sm:text-sm opacity-75">
                <li><Link href="#" className="hover:opacity-100">About</Link></li>
                <li><Link href="#" className="hover:opacity-100">Blog</Link></li>
                <li><Link href="#" className="hover:opacity-100">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-3 sm:mb-4 text-sm sm:text-base">Legal</h4>
              <ul className="space-y-2 text-xs sm:text-sm opacity-75">
                <li><Link href="/privacy" className="hover:opacity-100">Privacy</Link></li>
                <li><Link href="#" className="hover:opacity-100">Terms</Link></li>
              </ul>
            </div>
          </div>
          <Separator className="bg-white/10 mb-6 sm:mb-8" />
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-xs sm:text-sm opacity-75">
            <p>© 2026 SafariWrap. All rights reserved.</p>
            <p className="flex items-center gap-1">
              Made with <Heart className="w-3 sm:w-4 h-3 sm:h-4 inline fill-red-500 text-red-500" /> in East Africa
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
