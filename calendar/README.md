Hair Care Journal Calendar

A responsive infinite-scroll calendar for tracking hair care journal entries with images, ratings, and categories.

HOW TO RUN

Prerequisites:
- Node.js 18+
- PNPM (recommended) or npm

Installation:
1. Clone the repository
2. Navigate to calendar directory: cd Calendar/calendar
3. Install dependencies: pnpm install
4. Start development server: pnpm dev
5. Open http://localhost:5173

ASSUMPTIONS

Data Structure:
- Journal entries are stored in JSON format with fixed schema (imgUrl, rating, categories, date, description)
- Dates follow DD/MM/YYYY format
- Images are hosted externally and accessible via URLs
- Rating system uses decimal values (1.0 to 5.0)

User Behavior:
- Users primarily scroll vertically to navigate months
- Mobile users prefer single-card modals over complex navigation
- Search functionality focuses on description text and category names
- Users expect immediate visual feedback for interactions

Performance:
- Calendar loads 24 months initially (2 years each direction)
- Additional months load in batches of 12 when approaching scroll boundaries
- Images load lazily to improve initial page performance
- Infinite scroll maintains smooth 60fps performance

DESIGN CHOICES

Architecture:
- Single-page application using React with TypeScript for type safety
- Custom hooks separate business logic from UI components
- Framer Motion provides smooth animations without performance impact
- Tailwind CSS with Shadcn components for consistent design system

Infinite Scroll Implementation:
- Uses requestAnimationFrame for smooth scroll handling
- Calculates visible area of each month to determine active header
- Loads months dynamically based on scroll position rather than user interaction
- Maintains scroll position when new months are added

Mobile-First Approach:
- Different modal experiences for desktop vs mobile (navigation vs single card)
- Touch-friendly button sizes and spacing
- Responsive grid that adapts to screen width
- Hidden scrollbars for cleaner mobile appearance

Visual Design:
- Purple-blue gradient theme for modern aesthetic
- Color-coded journal entries based on rating (green=high, red=low)
- Consistent spacing and typography across all screen sizes
- Subtle animations enhance user experience without distraction

Data Management:
- Client-side filtering for search functionality
- Immutable state updates for predictable behavior
- Efficient re-rendering using React hooks and memoization
- Static JSON data structure allows easy content updates

Accessibility:
- Keyboard navigation support (arrow keys for month navigation)
- Proper ARIA labels and semantic HTML structure
- High contrast ratios for text readability
- Touch targets meet minimum size requirements (44px)