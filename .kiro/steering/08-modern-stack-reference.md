---
title: Modern Stack Reference Guide
inclusion: always

---

# Modern Stack Reference - SafariWrap

This guide provides quick references for the modern web stack used in SafariWrap.

## 🚀 Tech Stack Overview

### Core Framework
- **Next.js 16** (App Router, React 19, Server Components)
- **TypeScript 5**
- **TailwindCSS 4**

### UI & Design
- **Lucide React** (v0.577.0) - Modern icon library
- **Framer Motion** (v12.38.0) - Animations
- **Shadcn/ui** - Component patterns (not installed yet)
- **clsx + tailwind-merge** - Conditional styling

### Backend & Data
- **Supabase** (Auth, Database, Storage)
- **TanStack Query v5** (React Query) - Server state management
- **Supabase SSR** - Server-side auth

## 📚 Documentation Sources

### Next.js 16 (App Router)
**Key Changes from Next.js 13/14:**
- React 19 with Server Components by default
- Improved caching strategies
- Enhanced middleware
- Turbopack stable

**Essential Docs:**
- App Router: https://nextjs.org/docs/app
- Server Components: https://nextjs.org/docs/app/building-your-application/rendering/server-components
- Data Fetching: https://nextjs.org/docs/app/building-your-application/data-fetching
- Route Handlers: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
- Metadata API: https://nextjs.org/docs/app/building-your-application/optimizing/metadata

### React 19
**New Features:**
- Server Components (default in Next.js 16)
- Server Actions
- use() hook for promises
- Improved Suspense

**Docs:**
- React 19 Docs: https://react.dev
- Server Components: https://react.dev/reference/rsc/server-components
- Server Actions: https://react.dev/reference/rsc/server-actions

### TailwindCSS 4
**Breaking Changes:**
- New configuration format
- CSS-first approach
- Improved performance

**Docs:**
- TailwindCSS 4: https://tailwindcss.com/docs
- Migration Guide: https://tailwindcss.com/docs/upgrade-guide

### Lucide React
**Icon Library:**
```tsx
import { Heart, Star, MapPin, Camera } from 'lucide-react'

<Heart className="w-6 h-6 text-red-500" />
<Star className="w-5 h-5" strokeWidth={2.5} />
```

**Docs:**
- Icon Search: https://lucide.dev/icons
- React Guide: https://lucide.dev/guide/packages/lucide-react

### Shadcn/ui
**Component Library (Copy-Paste):**
- Not a package dependency
- Copy components into your project
- Full customization control

**Installation:**
```bash
npx shadcn@latest init
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dialog
```

**Docs:**
- Components: https://ui.shadcn.com/docs/components
- Installation: https://ui.shadcn.com/docs/installation/next
- Themes: https://ui.shadcn.com/themes

### TanStack Query v5 (React Query)
**Server State Management:**
```tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Fetch data
const { data, isLoading } = useQuery({
  queryKey: ['trips'],
  queryFn: fetchTrips
})

// Mutate data
const mutation = useMutation({
  mutationFn: createTrip,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['trips'] })
  }
})
```

**Docs:**
- Quick Start: https://tanstack.com/query/latest/docs/framework/react/quick-start
- Guides: https://tanstack.com/query/latest/docs/framework/react/guides
- Examples: https://tanstack.com/query/latest/docs/framework/react/examples

### Supabase
**Backend as a Service:**
- Auth: https://supabase.com/docs/guides/auth
- Database: https://supabase.com/docs/guides/database
- Storage: https://supabase.com/docs/guides/storage
- Realtime: https://supabase.com/docs/guides/realtime
- RLS: https://supabase.com/docs/guides/auth/row-level-security

**With Next.js:**
- SSR Guide: https://supabase.com/docs/guides/auth/server-side/nextjs

## 🎨 Modern Design Patterns

### Component Structure
```tsx
// Modern Server Component (default)
export default async function Page() {
  const data = await fetchData() // Direct async/await
  return <div>{data}</div>
}

// Client Component (when needed)
'use client'
import { useState } from 'react'

export function InteractiveComponent() {
  const [state, setState] = useState()
  return <button onClick={() => setState(...)}>Click</button>
}
```

### Data Fetching Patterns
```tsx
// Server Component (preferred)
async function getData() {
  const supabase = createServerClient()
  const { data } = await supabase.from('trips').select()
  return data
}

// Client Component with TanStack Query
function ClientComponent() {
  const { data } = useQuery({
    queryKey: ['trips'],
    queryFn: async () => {
      const res = await fetch('/api/trips')
      return res.json()
    }
  })
}
```

### Styling Patterns
```tsx
import { cn } from '@/lib/utils' // clsx + tailwind-merge

// Conditional classes
<div className={cn(
  "base-classes",
  isActive && "active-classes",
  variant === 'primary' && "primary-classes"
)} />

// Component variants
const buttonVariants = {
  primary: "bg-primary text-white",
  secondary: "bg-secondary text-gray-900"
}
```

### Animation Patterns (Framer Motion)
```tsx
import { motion } from 'framer-motion'

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>
```

## 🔧 Common Patterns

### Form Handling
```tsx
'use client'
import { useState } from 'react'

export function Form() {
  const [loading, setLoading] = useState(false)
  
  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await submitData()
    } finally {
      setLoading(false)
    }
  }
  
  return <form onSubmit={handleSubmit}>...</form>
}
```

### Error Handling
```tsx
// error.tsx (route segment)
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  )
}
```

### Loading States
```tsx
// loading.tsx (route segment)
export default function Loading() {
  return <div>Loading...</div>
}

// Or with Suspense
import { Suspense } from 'react'

<Suspense fallback={<Loading />}>
  <AsyncComponent />
</Suspense>
```

## 🎯 SafariWrap-Specific Patterns

### Theme Colors (TailwindCSS)
```tsx
// Primary: Forest Green (#1B4D3E)
<div className="bg-primary text-white" />

// Accent: Savanna Gold (#F4C542)
<div className="bg-accent text-gray-900" />

// Background: Parchment (#FCFAF5)
<div className="bg-background" />
```

### Icon Usage
```tsx
import { Compass, Camera, MapPin, Star } from 'lucide-react'

// Safari-themed icons
<Compass className="w-6 h-6 text-primary" />
<Camera className="w-5 h-5" />
<MapPin className="w-4 h-4 text-accent" />
<Star className="w-5 h-5 fill-accent text-accent" />
```

### Supabase Auth Pattern
```tsx
import { createServerClient } from '@/lib/supabase/server'

// Server Component
export default async function Page() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')
  
  return <div>Welcome {user.email}</div>
}
```

### TanStack Query Setup
```tsx
// app/providers.tsx
'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        refetchOnWindowFocus: false,
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
```

## 📱 Mobile-First Design

### Responsive Breakpoints
```tsx
// TailwindCSS breakpoints
<div className="
  w-full          // mobile
  md:w-1/2        // tablet (768px+)
  lg:w-1/3        // desktop (1024px+)
  xl:w-1/4        // large desktop (1280px+)
" />
```

### Touch-Friendly UI
```tsx
// Minimum touch target: 44x44px
<button className="min-h-[44px] min-w-[44px] p-3">
  <Icon className="w-6 h-6" />
</button>

// Spacing for mobile
<div className="space-y-4 md:space-y-6" />
```

## 🚀 Performance Best Practices

### Image Optimization
```tsx
import Image from 'next/image'

<Image
  src="/safari.jpg"
  alt="Safari"
  width={800}
  height={600}
  priority // for above-the-fold images
  placeholder="blur" // with blurDataURL
/>
```

### Code Splitting
```tsx
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Loading />,
  ssr: false // client-only if needed
})
```

### Metadata for SEO
```tsx
// app/layout.tsx or page.tsx
export const metadata = {
  title: 'SafariWrap - Experience Intelligence',
  description: 'Transform real-world experiences into shareable digital stories',
  openGraph: {
    images: ['/og-image.jpg'],
  },
}
```

## 🔗 Quick Links

- **Next.js Docs**: https://nextjs.org/docs
- **React Docs**: https://react.dev
- **TailwindCSS**: https://tailwindcss.com
- **Shadcn/ui**: https://ui.shadcn.com
- **Lucide Icons**: https://lucide.dev
- **TanStack Query**: https://tanstack.com/query
- **Supabase**: https://supabase.com/docs
- **Framer Motion**: https://www.framer.com/motion

---

**Last Updated**: 2026-04-15
**Version**: 1.0.0
**Status**: Active Reference
