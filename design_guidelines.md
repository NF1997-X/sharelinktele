# Design Guidelines: Telegram ShareLink Bot

## Design Approach
**Selected Approach:** Hybrid (Reference-based + Design System)
- **Primary References:** WeTransfer (upload experience), Dropbox (file management), Telegram (brand alignment)
- **Supporting System:** Modern utility design principles with visual richness
- **Key Principles:** Instant clarity, frictionless sharing, visual feedback, trust through simplicity

## Core Design Elements

### A. Color Palette

**Light Mode:**
- Primary: 215 80% 45% (Telegram-inspired blue)
- Surface: 0 0% 98% (near-white backgrounds)
- Surface Elevated: 0 0% 100% (cards, modals)
- Border: 220 13% 91%
- Text Primary: 222 47% 11%
- Text Secondary: 215 16% 47%
- Success: 142 76% 36%
- Error: 0 84% 60%

**Dark Mode:**
- Primary: 215 80% 55%
- Surface: 222 47% 11%
- Surface Elevated: 217 33% 17%
- Border: 217 19% 27%
- Text Primary: 210 40% 98%
- Text Secondary: 215 20% 65%
- Success: 142 71% 45%
- Error: 0 72% 51%

### B. Typography
- **Primary Font:** Inter (Google Fonts) - clean, modern, excellent readability
- **Headings:** 
  - H1: font-semibold text-4xl (landing hero)
  - H2: font-semibold text-2xl (section headers)
  - H3: font-medium text-lg (card titles)
- **Body:** font-normal text-base leading-relaxed
- **UI Elements:** font-medium text-sm (buttons, labels)

### C. Layout System
**Spacing Primitives:** Tailwind units of 2, 4, 6, 8, 12, 16
- Component padding: p-6 or p-8
- Section spacing: py-12 to py-20
- Grid gaps: gap-4 or gap-6
- Max container: max-w-6xl mx-auto

### D. Component Library

**Upload Zone:**
- Large drag-and-drop area (min-h-96) with dashed border (border-2 border-dashed)
- Icon: Large cloud upload icon (Heroicons) w-16 h-16
- Pulsing border animation on drag-over state
- File type indicators with icons
- Multi-file upload support with preview thumbnails

**Media Cards:**
- Rounded cards (rounded-xl) with subtle shadow
- Large preview thumbnail (aspect-video for videos, square for images)
- File metadata: name, size, upload date
- Share link display with copy button
- Quick actions: download, delete, copy link (icon buttons)

**Link Display Component:**
- Prominent input field with share URL
- Integrated "Copy" button with success feedback
- QR code generation option (collapsible)
- Social sharing quick actions (optional)

**Navigation:**
- Clean horizontal nav: Logo + Upload/Library/Settings tabs
- Sticky on scroll (sticky top-0 backdrop-blur)
- Mobile: Hamburger menu with slide-out drawer

**Forms & Inputs:**
- Consistent rounded-lg borders
- Focus ring: ring-2 ring-primary ring-offset-2
- Input height: h-12 for comfortable touch targets
- Clear error/success states with icons

**Buttons:**
- Primary: bg-primary with white text, hover:brightness-110
- Secondary: variant="outline" with subtle hover background
- Icon buttons: rounded-full p-3 for actions
- CTAs: Large (h-12 px-8), prominent placement

**Status Indicators:**
- Upload progress: Linear progress bar with percentage
- Success toast: Slide-in from top-right with check icon
- Loading states: Subtle skeleton screens, not spinners

### E. Page Layouts

**Landing/Home Page:**
1. **Hero Section** (py-20):
   - Centered layout with compelling headline
   - Subheadline explaining the service
   - Large primary CTA button ("Start Sharing" or "Upload Now")
   - Hero image/illustration showing upload flow or happy users sharing
   
2. **How It Works** (py-16):
   - Three-column grid (lg:grid-cols-3)
   - Step indicators (numbered or icon-based)
   - Simple descriptions with icons

3. **Features** (py-16):
   - Two-column layout alternating image/text
   - Feature highlights: Fast uploads, Secure links, Telegram integration
   - Supporting visuals for each feature

4. **CTA Section** (py-20):
   - Centered, impactful
   - Secondary supporting text
   - Trust indicators if applicable

**Upload Interface:**
- Full-width upload zone (centered, max-w-4xl)
- Recent uploads grid below (grid-cols-2 md:grid-cols-3 lg:grid-cols-4)
- Sidebar with upload statistics and quick links

**Library/Management Page:**
- Filter/search bar at top
- Grid layout of media cards (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
- Infinite scroll or pagination
- Bulk actions toolbar when items selected

**Share Link View:**
- Centered single-column layout (max-w-2xl)
- Large media preview
- Prominent download button
- File information metadata
- Powered by branding footer

## Images

**Hero Section Image:**
- Large, modern illustration showing upload flow or people sharing content
- Should convey ease, speed, and security
- Placement: Right side on desktop (50% width), full-width on mobile
- Style: Clean, colorful, professional illustration (not photo)

**Feature Section Images:**
- Icon-based illustrations for each feature
- Consistent style with hero image
- Small to medium size (w-48 to w-64)

**Upload Zone:**
- Optional: Light background pattern or subtle gradient
- Empty state illustration when no files uploaded

## Animations
**Minimal, purposeful animations only:**
- Upload progress: Smooth linear animation
- Copy button: Success checkmark micro-interaction (200ms)
- Card hover: Subtle lift (translateY -2px, 150ms ease)
- File drop: Scale bounce (scale-105 on drop)
- Toast notifications: Slide-in-out (300ms ease)

## Accessibility & Quality
- All interactive elements: min 44px touch target
- Dark mode throughout including form inputs
- ARIA labels on icon-only buttons
- Keyboard navigation support
- High contrast ratios (4.5:1 minimum)
- Focus indicators always visible