import { createBrowserClient } from '@supabase/ssr';

// Create a singleton instance to prevent multiple clients
let client: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  if (client) {
    return client;
  }

  client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        // Prevent lock contention issues
        flowType: 'pkce',
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      },
    }
  );

  return client;
}
