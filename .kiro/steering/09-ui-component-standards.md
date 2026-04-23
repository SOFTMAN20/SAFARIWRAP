---
title: UI Component Standards - SafariWrap
inclusion: always
---

# UI Component Standards

## 🎯 CRITICAL RULES - ALWAYS FOLLOW

### Component Library: Shadcn/ui
**ALWAYS use Shadcn/ui components when building UI elements.**

#### Available Shadcn Components
When the user asks for any of these UI elements, use Shadcn/ui:

- **Buttons** → `npx shadcn@latest add button`
- **Cards** → `npx shadcn@latest add card`
- **Forms** → `npx shadcn@latest add form input label`
- **Dialogs/Modals** → `npx shadcn@latest add dialog`
- **Dropdowns** → `npx shadcn@latest add dropdown-menu`
- **Selects** → `npx shadcn@latest add select`
- **Tabs** → `npx shadcn@latest add tabs`
- **Alerts** → `npx shadcn@latest add alert`
- **Badges** → `npx shadcn@latest add badge`
- **Avatars** → `npx shadcn@latest add avatar`
- **Toasts** → `npx shadcn@latest add toast`
- **Skeletons** → `npx shadcn@latest add skeleton`
- **Tables** → `npx shadcn@latest add table`
- **Sheets** → `npx shadcn@latest add sheet`
- **Popovers** → `npx shadcn@latest add popover`
- **Tooltips** → `npx shadcn@latest add tooltip`
- **Accordions** → `npx shadcn@latest add accordion`
- **Checkboxes** → `npx shadcn@latest add checkbox`
- **Radio Groups** → `npx shadcn@latest add radio-group`
- **Switches** → `npx shadcn@latest add switch`
- **Sliders** → `npx shadcn@latest add slider`
- **Progress** → `npx shadcn@latest add progress`
- **Calendars** → `npx shadcn@latest add calendar`
- **Date Pickers** → `npx shadcn@latest add date-picker`

#### Shadcn Usage Pattern
```tsx
// 1. First, add the component if not already added
// npx shadcn@latest add button

// 2. Then import and use
import { Button } from '@/components/ui/button'

export function MyComponent() {
  return (
    <Button variant="default" size="lg">
      Click Me
    </Button>
  )
}
```

#### When to Add Shadcn Components
- **Before creating a component**, check if Shadcn has it
- **If Shadcn has it**, add it with `npx shadcn@latest add [component]`
- **If Shadcn doesn't have it**, create a custom component in `components/`

### Icon Library: Lucide React
**ALWAYS use Lucide React for ALL icons. NEVER use other icon libraries.**

#### Lucide React Usage
```tsx
// Import icons from lucide-react
import { Heart, Star, MapPin, Camera, Plus, Edit, Trash } from 'lucide-react'

// Use with className for styling
<Heart className="w-6 h-6 text-red-500" />
<Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
<MapPin className="w-4 h-4" />

// Common sizes
<Icon className="w-4 h-4" />  // Small (16px)
<Icon className="w-5 h-5" />  // Medium (20px)
<Icon className="w-6 h-6" />  // Large (24px)
<Icon className="w-8 h-8" />  // Extra Large (32px)

// With custom stroke width
<Icon className="w-6 h-6" strokeWidth={2.5} />

// Filled icons
<Heart className="fill-red-500 text-red-500" />
```

#### Safari-Themed Icons (Use These Often)
```tsx
import {
  Compass,      // Navigation, exploration
  Camera,       // Photos, memories
  MapPin,       // Locations, destinations
  Binoculars,   // Wildlife viewing
  Mountain,     // Landscapes
  Trees,        // Nature, environment
  Sun,          // Safari, outdoors
  Moon,         // Night safari
  Footprints,   // Tracking, journey
  Leaf,         // Environmental impact
  Heart,        // Favorites, likes
  Star,         // Ratings, reviews
  Award,        // Achievements
  Trophy,       // Accomplishments
  Share2,       // Sharing wraps
  Download,     // Download wraps
  QrCode,       // QR codes
  Users,        // Guests, groups
  Calendar,     // Dates, scheduling
  Clock,        // Time, duration
} from 'lucide-react'
```

#### Finding Icons
- **Search**: https://lucide.dev/icons
- **Categories**: Animals, Nature, Travel, UI, etc.
- **Already Installed**: v0.577.0 (no installation needed)

### Component Creation Workflow

#### Step 1: Check if Shadcn Has It
```bash
# Visit https://ui.shadcn.com/docs/components
# Or check the list above
```

#### Step 2: Add Shadcn Component
```bash
npx shadcn@latest add [component-name]
```

#### Step 3: Import and Use
```tsx
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Heart } from 'lucide-react'

export function TripCard() {
  return (
    <Card>
      <Button>
        <Heart className="w-4 h-4 mr-2" />
        Like
      </Button>
    </Card>
  )
}
```

## 🎨 SafariWrap Design System Integration

### Colors with Shadcn
```tsx
// Use SafariWrap colors with Shadcn components
<Button className="bg-primary hover:bg-primary/90">
  Primary Action
</Button>

<Card className="border-accent">
  <div className="bg-background p-4">
    Content
  </div>
</Card>
```

### Icons with SafariWrap Theme
```tsx
// Primary color icons
<Compass className="w-6 h-6 text-primary" />

// Accent color icons
<Star className="w-5 h-5 fill-accent text-accent" />

// Neutral icons
<MapPin className="w-4 h-4 text-gray-600" />
```

## 📋 Common Component Patterns

### Button with Icon
```tsx
import { Button } from '@/components/ui/button'
import { Plus, Edit, Trash } from 'lucide-react'

// Icon before text
<Button>
  <Plus className="w-4 h-4 mr-2" />
  Create Trip
</Button>

// Icon after text
<Button>
  View Details
  <ChevronRight className="w-4 h-4 ml-2" />
</Button>

// Icon only
<Button size="icon">
  <Edit className="w-4 h-4" />
</Button>
```

### Card with Icons
```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { MapPin, Calendar, Users } from 'lucide-react'

<Card>
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <Compass className="w-5 h-5" />
      Safari Details
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <MapPin className="w-4 h-4" />
        <span>Serengeti</span>
      </div>
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4" />
        <span>April 15, 2026</span>
      </div>
      <div className="flex items-center gap-2">
        <Users className="w-4 h-4" />
        <span>8 guests</span>
      </div>
    </div>
  </CardContent>
</Card>
```

### Form with Shadcn + Icons
```tsx
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Search, Filter } from 'lucide-react'

<form>
  <div className="space-y-4">
    <div>
      <Label htmlFor="search">Search Trips</Label>
      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
        <Input
          id="search"
          placeholder="Search..."
          className="pl-10"
        />
      </div>
    </div>
    
    <Button type="submit">
      <Filter className="w-4 h-4 mr-2" />
      Apply Filters
    </Button>
  </div>
</form>
```

### Dialog with Icons
```tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

<Dialog>
  <DialogTrigger asChild>
    <Button>
      <Plus className="w-4 h-4 mr-2" />
      Create Trip
    </Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>New Safari Trip</DialogTitle>
    </DialogHeader>
    {/* Form content */}
  </DialogContent>
</Dialog>
```

## 🚫 What NOT to Do

### ❌ DON'T Create Custom Buttons
```tsx
// ❌ WRONG - Don't create custom button components
export function CustomButton() {
  return <button className="...">Click</button>
}
```

### ✅ DO Use Shadcn Button
```tsx
// ✅ CORRECT - Use Shadcn button
import { Button } from '@/components/ui/button'

<Button variant="default">Click</Button>
```

### ❌ DON'T Use Other Icon Libraries
```tsx
// ❌ WRONG - Don't use react-icons, heroicons, etc.
import { FaHeart } from 'react-icons/fa'
import { HeartIcon } from '@heroicons/react/24/solid'
```

### ✅ DO Use Lucide React
```tsx
// ✅ CORRECT - Always use Lucide React
import { Heart } from 'lucide-react'

<Heart className="w-6 h-6" />
```

### ❌ DON'T Reinvent Common Components
```tsx
// ❌ WRONG - Don't create custom cards, dialogs, etc.
export function CustomCard() {
  return <div className="rounded-lg border p-4">...</div>
}
```

### ✅ DO Use Shadcn Components
```tsx
// ✅ CORRECT - Use Shadcn card
import { Card } from '@/components/ui/card'

<Card>...</Card>
```

## 📝 Checklist for Every Component

When creating or modifying components, ALWAYS:

- [ ] Check if Shadcn has the component
- [ ] Add Shadcn component if available: `npx shadcn@latest add [component]`
- [ ] Import from `@/components/ui/[component]`
- [ ] Use Lucide React for ALL icons
- [ ] Import icons from `lucide-react`
- [ ] Apply SafariWrap colors (primary, accent, background)
- [ ] Use `cn()` utility for conditional classes
- [ ] Follow mobile-first responsive design
- [ ] Add proper TypeScript types
- [ ] Include loading and error states

## 🔗 Quick Reference

### Shadcn Documentation
- **Components**: https://ui.shadcn.com/docs/components
- **Installation**: https://ui.shadcn.com/docs/installation/next
- **Themes**: https://ui.shadcn.com/themes

### Lucide React Documentation
- **Icon Search**: https://lucide.dev/icons
- **React Guide**: https://lucide.dev/guide/packages/lucide-react
- **GitHub**: https://github.com/lucide-icons/lucide

### Local Documentation
- **Component Patterns**: `docs/COMPONENT-PATTERNS.md`
- **Quick Start**: `docs/QUICK-START.md`
- **Stack Reference**: `.kiro/steering/08-modern-stack-reference.md`

## 🎯 Summary

**ALWAYS:**
1. Use Shadcn/ui for UI components
2. Use Lucide React for icons
3. Check Shadcn docs before creating custom components
4. Search Lucide icons before using generic names
5. Follow SafariWrap design system (colors, spacing)
6. Use `cn()` utility for conditional classes
7. Add proper TypeScript types
8. Include loading and error states

**NEVER:**
1. Create custom buttons, cards, dialogs if Shadcn has them
2. Use other icon libraries (react-icons, heroicons, etc.)
3. Hardcode colors (use design system)
4. Skip accessibility attributes
5. Forget mobile-first responsive design

---

**This steering file is ALWAYS active and will guide all component creation.**

**Last Updated**: 2026-04-15
**Version**: 1.0.0
**Status**: Auto-Included (Always Active)
