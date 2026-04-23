'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Map, 
  Settings, 
  LogOut, 
  BarChart3,
  X,
  Camera,
  Users,
  Compass,
  Sparkles,
  ChevronRight,
  Crown,
  TreePine,
  CreditCard,
} from 'lucide-react';
import { Operator } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  operator: Operator | null;
  onSignOut: () => void;
  activePath: string;
}

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', badge: null },
  { href: '/trips', icon: Map, label: 'Events', badge: null },
  { href: '/wraps', icon: Sparkles, label: 'Wraps', badge: null },
  // { href: '/payments', icon: CreditCard, label: 'Payments', badge: null },
  { href: '/impact', icon: TreePine, label: 'Impact', badge: null },
  { href: '/achievements', icon: BarChart3, label: 'Analytics', badge: null },
  { href: '/settings', icon: Settings, label: 'Settings', badge: null },
];

export const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  setIsOpen, 
  operator, 
  onSignOut,
  activePath 
}) => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const sidebarContent = (onClose?: () => void) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6">
        <Link href="/" className="flex items-center gap-3 group" onClick={onClose}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-savanna to-savanna-dark flex items-center justify-center shadow-lg">
            <img src="/logo.png" alt="SafariWrap" className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xl font-extrabold text-white">SafariWrap</span>
            <p className="text-[10px] text-white/60 font-semibold uppercase tracking-wider">Operator Portal</p>
          </div>
        </Link>
      </div>

      <Separator className="bg-white/10" />

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto min-h-0">
        {navItems.map((item) => {
          const isActive = activePath === item.href || activePath.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`
                group flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all
                ${isActive 
                  ? 'bg-savanna text-forest shadow-lg' 
                  : 'text-white/70 hover:text-white hover:bg-white/10'
                }
              `}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'text-forest' : 'text-white/70 group-hover:text-white'}`} />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <Badge className={`${isActive ? 'bg-forest text-white' : 'bg-white/20 text-white'}`}>
                  {item.badge}
                </Badge>
              )}
              {isActive && (
                <motion.div
                  layoutId="active-pill"
                  className="w-1.5 h-1.5 rounded-full bg-forest"
                />
              )}
            </Link>
          );
        })}
      </nav>

      <Separator className="bg-white/10" />

      {/* Upgrade Card - Smaller and more compact */}
      <div className="p-3">
        <div className="bg-gradient-to-br from-savanna/20 to-savanna-dark/20 rounded-lg p-3 border border-savanna/30">
          <div className="flex items-center gap-2 mb-1">
            <Crown className="w-3.5 h-3.5 text-savanna" />
            <span className="text-xs font-bold text-white">Free Plan</span>
          </div>
          <p className="text-[10px] text-white/70 mb-2 leading-tight">
            Upgrade to Pro for unlimited events
          </p>
          <Button 
            size="sm" 
            className="w-full h-8 bg-savanna hover:bg-savanna-dark text-forest font-bold text-xs"
            onClick={() => router.push('/pricing')}
          >
            <Sparkles className="w-3 h-3 mr-1.5" />
            Upgrade Now
          </Button>
        </div>
      </div>

      <Separator className="bg-white/10" />

      {/* User Profile */}
      <div className="p-4">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
          <Avatar className="w-10 h-10 border-2 border-white/20">
            <AvatarImage src={operator?.logo_url} />
            <AvatarFallback className="bg-gradient-to-br from-forest to-forest-light text-white font-bold">
              {mounted && operator?.business_name ? operator.business_name.charAt(0).toUpperCase() : 'O'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">
              {mounted ? (operator?.business_name || 'Operator') : 'Operator'}
            </p>
            <p className="text-xs text-white/60 truncate">
              {mounted ? (operator?.email || 'Loading...') : 'Loading...'}
            </p>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="text-white/60 hover:text-white hover:bg-white/10"
            onClick={onSignOut}
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 bg-gradient-to-b from-forest via-forest to-forest-dark flex-col shadow-2xl z-50">
        {sidebarContent()}
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />
            
            {/* Drawer */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed inset-y-0 left-0 w-80 bg-gradient-to-b from-forest via-forest to-forest-dark z-[70] shadow-2xl"
            >
              {/* Close Button */}
              <div className="absolute top-4 right-4">
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-white/60 hover:text-white hover:bg-white/10"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              {sidebarContent(() => setIsOpen(false))}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
