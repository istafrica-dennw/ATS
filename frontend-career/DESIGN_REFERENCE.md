# Design Reference - IST Career Portal

## Reference Site

This career portal is inspired by: **https://career.ist.com/**

## Design Elements Implemented

### 1. Hero Section
- Large, bold headline with impact
- Clear call-to-action buttons
- Gradient background with subtle patterns
- Modern typography
- Professional color scheme

### 2. Culture Section
- Value propositions in grid layout
- Icon-based visual hierarchy
- Clear, concise messaging
- Hover effects on cards

### 3. Color Scheme
- **Primary**: Blue (#0ea5e9) - Professional and trustworthy
- **Secondary**: Various shades of gray
- **Accents**: Gradient overlays
- **Dark Mode**: Automatic system detection

### 4. Typography
- **Font**: Inter (Google Fonts)
- **Headings**: Bold, large size (3xl-6xl)
- **Body**: Regular weight, readable size
- **Hierarchy**: Clear size differences

### 5. Layout
- **Max Width**: 7xl (1280px)
- **Spacing**: Consistent padding/margins
- **Sections**: Clear separation with backgrounds
- **Grid**: Responsive columns (1-2-4)

### 6. Components

#### Navigation
- Simple header with logo and CTA
- Sticky positioning
- Clean, minimal design

#### Job Cards
- Shadow on hover
- Clear job information
- Status badges
- Location and salary prominently displayed

#### Buttons
- Primary: Gradient background
- Secondary: Outlined style
- Hover effects: Scale and shadow
- Clear visual hierarchy

#### Forms
- Large input fields
- Clear labels
- File upload with drag-and-drop
- Validation messages
- Accessible design

### 7. Animations
- **Framer Motion** for smooth transitions
- Fade-in on scroll (viewport detection)
- Hover effects on interactive elements
- Page transitions
- Stagger animations for lists

### 8. Responsive Design
- Mobile-first approach
- Breakpoints:
  - Mobile: < 640px (sm)
  - Tablet: 640px - 1024px (md)
  - Desktop: > 1024px (lg)
- Touch-friendly on mobile
- Optimized images

## Key Differences from Reference

### Our Enhancements
1. **Dark Mode**: Full dark mode support (IST doesn't have this)
2. **Animations**: More advanced animations with Framer Motion
3. **Search**: Real-time job search and filtering
4. **Modern Stack**: React + TypeScript + Tailwind CSS

### Simplified
1. **Navigation**: Simpler nav (no multi-level menus yet)
2. **Footer**: Minimal footer (can be enhanced)
3. **Content**: Focused on core job application flow

## Design Principles Applied

1. **Clarity**: Clear messaging and simple navigation
2. **Professionalism**: Corporate, trustworthy design
3. **Accessibility**: WCAG compliant, keyboard navigation
4. **Performance**: Optimized images and code
5. **Consistency**: Unified design language throughout
6. **Mobile-First**: Works great on all devices

## Color Palette

```css
/* Primary Colors */
--primary-50: #f0f9ff;
--primary-100: #e0f2fe;
--primary-500: #0ea5e9;
--primary-600: #0284c7;
--primary-700: #0369a1;

/* Neutral Colors */
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-800: #1f2937;
--gray-900: #111827;
```

## Typography Scale

```css
/* Headings */
h1: 3.75rem (60px) - font-bold
h2: 3rem (48px) - font-bold
h3: 2.25rem (36px) - font-bold
h4: 1.5rem (24px) - font-semibold

/* Body */
p: 1rem (16px) - font-normal
small: 0.875rem (14px) - font-normal
```

## Spacing System

Using Tailwind's spacing scale:
- **xs**: 0.5rem (8px)
- **sm**: 1rem (16px)
- **md**: 1.5rem (24px)
- **lg**: 2rem (32px)
- **xl**: 3rem (48px)

## Shadow System

```css
/* Cards */
shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1)

/* Hover */
shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1)

/* Dark Mode */
dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3)]
```

## Future Enhancements

1. **Locations Page**: Show all office locations
2. **Team Page**: Meet the team members
3. **Blog**: Company blog integration
4. **Testimonials**: Employee testimonials
5. **Video**: Company culture videos
6. **Interactive Elements**: More engaging interactions

## Credits

- **Design Inspiration**: IST Career Portal (career.ist.com)
- **UI Framework**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Heroicons
- **Fonts**: Inter (Google Fonts)
