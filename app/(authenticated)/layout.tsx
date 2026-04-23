'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from '../_components/Sidebar';
import { DashboardHeader } from '../_components/DashboardHeader';

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { operator, signOut } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-parchment overflow-hidden">
      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        operator={operator}
        onSignOut={signOut}
        activePath={pathname}
      />
      <main className="flex-1 flex flex-col overflow-y-auto w-full">
        <DashboardHeader onMenuClick={() => setIsSidebarOpen(true)} />
        {children}
      </main>
    </div>
  );
}
