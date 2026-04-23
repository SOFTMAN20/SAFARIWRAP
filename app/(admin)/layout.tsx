'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AdminSidebar } from '../_components/AdminSidebar';
import { Menu, Globe } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <AdminSidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        onSignOut={handleSignOut}
        activePath={pathname}
        adminEmail={user?.email}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile top bar */}
        <header className="lg:hidden bg-forest-dark text-white px-4 py-3 flex items-center space-x-3 z-40 flex-shrink-0">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/15 transition-colors"
          >
            <Menu size={18} />
          </button>
          <div className="h-7 w-7 rounded-lg bg-savanna flex items-center justify-center">
            <Globe className="h-4 w-4 text-white" />
          </div>
          <span className="font-black text-sm">SafariWrap Admin</span>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
