'use client';

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { createClient } from '../lib/supabase/client';
import { Profile, Operator } from '../lib/types';
import { authApi } from '../lib/api';

const supabase = createClient();

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  operator: Operator | null;
  loading: boolean;
  isAdmin: boolean;
  isOperator: boolean;
  isGuest: boolean;
  signIn: typeof authApi.signIn;
  signUp: typeof authApi.signUp;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [operator, setOperator] = useState<Operator | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Role-based access flags
  const isAdmin = profile?.role === 'admin';
  const isOperator = profile?.role === 'operator';
  const isGuest = !profile || profile?.role === 'guest';

  async function loadProfile(userId: string) {
    try {
      // Get profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      setProfile(profileData ?? null);
      
      // If operator or admin, get operator data
      if (profileData?.role === 'operator' || profileData?.role === 'admin') {
        const { data: operatorData } = await supabase
          .from('operators')
          .select('*')
          .eq('id', userId)
          .maybeSingle();
        
        setOperator(operatorData ?? null);
      } else {
        setOperator(null);
      }
    } catch (error) {
      // Silent error - only log in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error loading profile:', error);
      }
    }
  }

  useEffect(() => {
    let mounted = true;
    
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        loadProfile(session.user.id);
      }
      
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Only reload profile if user changed
          if (session.user.id !== user?.id) {
            await loadProfile(session.user.id);
          }
        } else {
          setProfile(null);
          setOperator(null);
          if (event === 'SIGNED_OUT') {
            window.location.href = '/';
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []); // Empty dependency array - only run once

  const refreshProfile = async () => {
    if (user) await loadProfile(user.id);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{
      user, session, profile, operator, loading,
      isAdmin, isOperator, isGuest,
      signIn: authApi.signIn,
      signUp: authApi.signUp,
      signOut,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
