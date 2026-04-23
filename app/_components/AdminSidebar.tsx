'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Calendar,
  MessageSquare,
  Globe,
  LogOut,
  X,
  ShieldAlert,
  Activity,
  ChevronRight,
  BarChart3,
  Sparkles,
  CreditCard,
  FileText,
  QrCode,
  Trees,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface AdminSidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onSignOut: () => void;
  activePath: string;
  adminEmail?: string;
}

const NAV_SECTIONS = [
  {
    label: 'Overview',
    items: [
      { href: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
      { href: '/admin/analytics', icon: BarChart3, label: 'Analytics', exact: true },
      { href: '/admin/system', icon: Activity, label: 'System Health', exact: true },
    ],
  },
  {
    label: 'Revenue',
    items: [
      { href: '/admin/subscriptions', icon: CreditCard, label: 'Subscriptions', exact: true },
    ],
  },
  {
    label: 'Management',
    items: [
      { href: '/admin/operators', icon: Users, label: 'Operators', exact: false },
      { href: '/admin/events', icon: Calendar, label: 'Events', exact: true },
      { href: '/admin/reviews', icon: MessageSquare, label: 'Reviews', exact: true },
      { href: '/admin/destinations', icon: Globe, label: 'Destinations', exact: true },
    ],
  },
  {
    label: 'Content',
    items: [
      { href: '/admin/wraps', icon: FileText, label: 'Wraps', exact: true },
      { href: '/admin/qr-codes', icon: QrCode, label: 'QR Codes', exact: true },
    ],
  },
  {
    label: 'Environmental',
    items: [
      { href: '/admin/environmental', icon: Trees, label: 'Tree Planting', exact: true },
    ],
  },
  {
    label: 'System',
    items: [
      { href: '/admin/activity', icon: Activity, label: 'Activity Logs', exact: true },
    ],
  },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  isOpen,
  setIsOpen,
  onSignOut,
  activePath,
  adminEmail,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const sidebar = (onClose?: () => void) => (
    <div className="flex flex-col h-full bg-gradient-to-b from-forest-dark via-forest-dark to-[#0F3A2E]">
      {/* Logo + Badge */}
      <div className="px-5 pt-6 pb-5">
        <Link href="/" className="flex items-center gap-3 mb-5 group" onClick={onClose}>
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-savanna to-amber-500 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            <img src="/logo.png" alt="SafariWrap" className="w-7 h-7" />
          </div>
          <div>
            <p className="text-white font-black text-base leading-tight">SafariWrap</p>
            <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest leading-tight">Admin Panel</p>
          </div>
          {onClose && (
            <button onClick={(e) => { e.preventDefault(); onClose(); }} className="ml-auto p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-all">
              <X className="w-4 h-4" />
            </button>
          )}
        </Link>

        <Badge variant="destructive" className="bg-red-500/20 text-red-300 border-red-500/30 hover:bg-red-500/30 font-black text-[10px] uppercase tracking-wider">
          <ShieldAlert className="w-3 h-3 mr-1.5" />
          Superadmin
        </Badge>
      </div>

      <Separator className="bg-white/10" />

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {NAV_SECTIONS.map((section, sectionIndex) => (
          <div key={section.label}>
            <div className="flex items-center gap-2 px-3 mb-3">
              <Sparkles className="w-3 h-3 text-savanna" />
              <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">
                {section.label}
              </p>
            </div>
            <div className="space-y-1">
              {section.items.map(({ href, icon: Icon, label, exact }) => {
                const active = exact ? activePath === href : activePath.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-3 py-3 rounded-2xl text-sm font-bold transition-all group relative overflow-hidden ${
                      active
                        ? 'bg-gradient-to-r from-savanna to-amber-500 text-slate-900 shadow-lg shadow-savanna/30'
                        : 'text-white/60 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {active && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-gradient-to-r from-savanna to-amber-500 rounded-2xl"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <Icon className={`w-5 h-5 flex-shrink-0 relative z-10 ${active ? 'drop-shadow-sm' : ''}`} />
                    <span className="flex-1 relative z-10">{label}</span>
                    {active && <ChevronRight className="w-4 h-4 opacity-70 relative z-10" />}
                  </Link>
                );
              })}
            </div>
            {sectionIndex < NAV_SECTIONS.length - 1 && (
              <Separator className="bg-white/5 my-4" />
            )}
          </div>
        ))}
      </nav>

      <Separator className="bg-white/10" />

      {/* Admin user info */}
      <div className="px-3 py-5">
        <div className="flex items-center gap-3 mb-3 px-3 py-2 rounded-2xl bg-white/5 border border-white/10">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-savanna/30 to-amber-500/30 border border-savanna/40 flex items-center justify-center flex-shrink-0">
            <ShieldAlert className="w-5 h-5 text-savanna" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-black truncate">Platform Admin</p>
            <p className="text-white/50 text-[10px] font-semibold truncate">
              {mounted ? (adminEmail ?? 'admin@safariwrap.com') : 'admin@safariwrap.com'}
            </p>
          </div>
        </div>
        <button
          onClick={onSignOut}
          className="flex items-center gap-3 w-full px-3 py-3 rounded-2xl text-white/60 hover:text-white hover:bg-red-500/20 border border-transparent hover:border-red-500/30 font-bold text-sm transition-all group"
        >
          <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex w-72 flex-col text-white shadow-2xl z-50 flex-shrink-0 border-r border-white/10">
        {sidebar()}
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-[60]"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed inset-y-0 left-0 w-80 text-white z-[70] shadow-2xl"
            >
              {sidebar(() => setIsOpen(false))}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
