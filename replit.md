# Inventory Management System

## Overview

This is a full-stack inventory management system built with React, Express, and TypeScript. The application features a modern Arabic-first interface for managing inventory items with support for categories, versions, statuses, and image attachments. The system uses Drizzle ORM for database operations and shadcn/ui for the component library.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom Arabic font support (Noto Sans Arabic)
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Style**: RESTful API endpoints
- **Middleware**: Custom logging and error handling middleware
- **Development**: Hot reload with tsx for TypeScript execution

### Data Layer
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL with DatabaseStorage implementation
- **Schema Validation**: Zod schemas for runtime type checking
- **Migrations**: Drizzle Kit for database schema management
- **Connection**: Neon serverless PostgreSQL with connection pooling

## Key Components

### Database Schema
- **Users Table**: Basic user authentication structure
- **Inventory Items Table**: Core inventory management with fields:
  - Category (الفئة)
  - Version (الإصدار) 
  - Year (السنة)
  - Color (اللون)
  - Status (الحالة)
  - Engineer (المهنشي)
  - Chassis Number (رقم الهيكل)
  - Images array for attachments

### API Endpoints
- `GET /api/inventory` - Retrieve all inventory items
- `POST /api/inventory` - Create new inventory item
- `PUT /api/inventory/:id` - Update existing item
- `DELETE /api/inventory/:id` - Remove inventory item
- `GET /api/inventory/stats` - Get inventory statistics
- `GET /api/inventory/search` - Search inventory items
- `GET /api/inventory/filter` - Filter items by category/status/year

### UI Components
- **InventoryStats**: Dashboard statistics display
- **InventoryTable**: Data table with sorting and filtering
- **InventoryForm**: Modal form for CRUD operations
- **Custom UI Components**: Complete shadcn/ui component library

## Data Flow

1. **Client Request**: React components make API calls using TanStack Query
2. **API Processing**: Express routes handle requests and validate data
3. **Data Storage**: PostgreSQL database accessed through DatabaseStorage class
4. **Response**: JSON responses sent back to client
5. **UI Update**: Query client automatically updates UI state

The application supports real-time updates through query invalidation and provides optimistic updates for better user experience. Database operations are handled through Drizzle ORM with proper connection pooling.

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Neon PostgreSQL driver
- **drizzle-orm**: Modern TypeScript ORM
- **@tanstack/react-query**: Server state management
- **react-hook-form**: Form handling and validation
- **zod**: Schema validation library

### UI Dependencies
- **@radix-ui/***: Accessible UI component primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon library

### Development Dependencies
- **vite**: Build tool and development server
- **tsx**: TypeScript execution for Node.js
- **@replit/vite-plugin-***: Replit-specific development tools

## Development Strategy

The system is designed with a clear separation of concerns:

- **Shared Schema**: Common TypeScript types and Zod schemas in `/shared`
- **Client Code**: React application in `/client` with component-based architecture  
- **Server Code**: Express API in `/server` with modular route handling
- **Database Layer**: PostgreSQL with Drizzle ORM and connection pooling
- **Configuration**: Centralized config files for build tools and frameworks

The application uses PostgreSQL for persistent data storage with proper database seeding. The Arabic-first design supports RTL layout and includes proper font loading for Arabic text.

## Deployment Strategy

### Development
- Uses Vite dev server with HMR for frontend
- Express server with tsx for TypeScript execution
- Concurrent development with both servers running

### Production Build
- Vite builds optimized static assets to `/dist/public`
- esbuild bundles server code to `/dist/index.js`
- Single Node.js process serves both API and static files

### Database Setup
- Drizzle migrations in `/migrations` directory
- Environment variable `DATABASE_URL` required for PostgreSQL connection
- `npm run db:push` command for schema deployment

## Changelog

```
Changelog:
- July 02, 2025: Initial setup with Arabic inventory management system
- July 02, 2025: Updated field structure - changed المهنشي to الاستيراد, added الصانع field, split colors into interior/exterior, changed الإصدار to سعة المحرك
- July 02, 2025: Added PostgreSQL database with DatabaseStorage implementation, seeded with sample data
- July 02, 2025: Restructured to hierarchical manufacturer → category system (مرسيدس → E200, C200, C300), auto-populated entry date, enhanced mobile responsiveness
- July 02, 2025: Implemented one-time manufacturer logo management system with dedicated manufacturers table and API endpoints
- July 02, 2025: Added 13 base manufacturers (مرسيدس، بي ام دبليو، رولز رويز، بنتلي، رنج روفر، دفندر، بورش، لكزس، لينكون، شوفولية، تويوتا، تسلا، لوسيد)
- July 02, 2025: Modified card view to exclude sold cars from display and calculations, replaced category counts with dropdown list
- July 02, 2025: Updated Excel import template with all new fields (manufacturer, category, engine capacity, colors, status, import type, location, chassis number, price, notes) and added comprehensive instructions with valid values for each field
- July 02, 2025: Redesigned navigation header with company logo placeholder, improved mobile responsiveness, and removed system title text for cleaner look
- July 02, 2025: Created comprehensive appearance management page with theme colors, company branding, manufacturer logos, and UI customization options
- July 02, 2025: Integrated ListManager component for better list options management with tabbed interface
- July 02, 2025: Added appearance management to admin navigation with back-to-home button for better user navigation
- July 02, 2025: Added admin dropdown menu next to logout button with options for appearance management, user management, and manufacturer settings
- July 02, 2025: Implemented sell vehicle functionality with status update to "مباع" and automatic sale date recording using Gregorian calendar
- July 02, 2025: Created CategoryManager component for managing manufacturer-linked categories with hierarchical organization
- July 02, 2025: Updated card view to display only manufacturer logo and count without "متوفر" text for cleaner appearance
- July 02, 2025: Implemented comprehensive appearance management system with database schema (appearance_settings table), API endpoints for settings and logo management, real-time theme application, and full UI controls for company branding, color schemes, manufacturer logos, and layout preferences
- July 02, 2025: Integrated global theme control across entire website with useTheme hook, ThemeProvider component, and CSS variables for real-time theme updates in all pages including inventory and card views
- July 02, 2025: Fixed dark mode system and added real-time color preview in appearance management with instant theme application, proper CSS variable handling for both light and dark modes, and immediate visual feedback for color changes
- July 02, 2025: Fixed manufacturer logo upload system in appearance management to apply directly to manufacturer database with updated API endpoints and manufacturer-stats integration for real-time logo display in card view
- July 03, 2025: Implemented comprehensive chassis number photo capture and OCR extraction system using OpenAI Vision API with camera support, image processing, and automatic text extraction integrated into inventory form with unique constraint validation
- July 03, 2025: Enhanced manufacturer logo upload system with improved visual design - expanded upload area, clearer instructions, better preview display, and integrated logo upload directly into manufacturer creation form with dedicated upload box
- July 03, 2025: Updated voice chat icon from message square to volume/speaker icon in floating action buttons across all pages, improved visual clarity for audio functionality, and ensured consistent use of uploaded manufacturer logos in aggregated data displays
- July 03, 2025: Upgraded voice assistant with comprehensive AI-powered inventory management - replaced basic voice chat with advanced VoiceAssistant component featuring natural language processing through OpenAI GPT-4o, complete vehicle management capabilities (add, edit, sell, delete), chassis number OCR extraction from photos, and intelligent command interpretation with Arabic language support
- July 03, 2025: Enhanced manufacturer management system integration - improved appearance management page with dedicated manufacturer logo section and instructions, enhanced manufacturer management page with better visual design and upload areas, integrated manufacturer filtering in card view with dropdown selector showing logos and counts, and linked appearance management directly to manufacturer logo management for seamless workflow
- July 03, 2025: Resolved manufacturer creation issue - removed standalone manufacturers management page and consolidated all manufacturer creation functionality into appearance page with dedicated "Add New Manufacturer" button, implemented duplicate name validation with clear error messages in Arabic, and enhanced API error handling for unique constraint violations with user-friendly messaging
- July 03, 2025: Implemented interactive manufacturer logo hover effects with smooth animations, scaling effects, pulse animations, ring effects, and enhanced visual feedback in both main card view and filter dropdown for improved user experience
- July 03, 2025: Added comprehensive search functionality to card view interface with real-time filtering across multiple fields (chassis number, category, colors, location, manufacturer, engine capacity, year, status, import type, notes), visual search results indicator with clear search button, and responsive search input with Arabic placeholder text
- July 03, 2025: Implemented comprehensive dark mode system with custom color palette - Black (#000000), Sooty (#141414), Dire Wolf (#282828), and deep purple accents (#230046, #320064), added dark mode toggle icons to all pages, enhanced useTheme hook with toggle functionality, and updated CSS variables for complete dark mode theming support
- July 05, 2025: Added smooth CSS animations for dark mode transitions with 0.3s ease transitions on all elements, implemented car reservation functionality with status change to "محجوز" and automatic reservation date tracking, added reservation button to action buttons with Calendar icon and appropriate styling, and enhanced database schema with reservationDate field for tracking reservation timestamps
- July 05, 2025: Fixed inventory statistics data accuracy - updated database storage to include "reserved" category in stats, reorganized statistics grid layout with proper 4+1 column arrangement (قيد الصيانة، متوفر، في الطريق، إجمالي العناصر in first row, محجوز in second row), and integrated real manufacturer logos from database instead of emoji placeholders in manufacturer statistics cards
- July 05, 2025: Removed "sold" box from dashboard and reorganized statistics layout into cleaner 4-column grid (Reserved + 3 import types), and redesigned action buttons in card view with improved two-row layout (Edit/Delete in first row, Reserve-Cancel/Sell in second row) with better visual styling and larger button sizes for improved usability
- July 05, 2025: Expanded seed data with comprehensive manufacturer categories including popular models (Mercedes S-Class/E-Class/C-Class, BMW 7/5/3 Series, Audi A8/A6/Q8, Toyota Land Cruiser/Camry, Lexus LX 600/ES 350, Range Rover Vogue/Sport, Porsche Cayenne/911, and luxury brands like Ferrari/Lamborghini/Maserati), added 25+ manufacturers total, and implemented reservation/cancel reservation buttons in main inventory table with proper API integration and visual indicators
- July 05, 2025: Implemented company logo display system - integrated company logo from appearance management to be displayed in website headers across inventory and card view pages, with fallback to default "ش" character when no logo is uploaded, enhanced logo container with proper sizing and overflow handling for optimal display
- July 05, 2025: Fixed vehicle reservation system - prevented reservation of sold vehicles by adding isSold condition to reservation buttons in both inventory table and card view, ensuring sold vehicles cannot be reserved while maintaining proper reservation functionality for available vehicles
- July 05, 2025: Fixed manufacturer statistics in homepage - updated getManufacturerStats to include sold vehicles in total count and prevent manufacturer cards from being hidden when all vehicles are sold, ensuring accurate inventory representation across all statuses
- July 05, 2025: Fixed manufacturer card display in homepage - updated card view to show total vehicle count including sold vehicles using allGroupedData instead of filtered data, ensuring accurate count display in manufacturer cards
- July 05, 2025: Updated manufacturer statistics to exclude sold vehicles - modified both frontend card display and backend getManufacturerStats to filter out sold vehicles from total counts, ensuring sold vehicles are removed from manufacturer card totals when sold
- July 05, 2025: Implemented "Show Sold Cars" toggle feature in card view - added showSoldCars state variable, conditional display logic for sold vehicles, dynamic manufacturer count calculation (includes sold cars when toggle is active), and toggle button in filter section for complete sold car visibility control
- July 05, 2025: Implemented role-based access control for admin-only features - restricted "Show Sold Cars" button and "Appearance Management" button to admin users only in both inventory table and card view interfaces, ensuring regular users cannot access these administrative functions while maintaining full functionality for admin users
- July 05, 2025: Streamlined authentication system - removed user registration functionality from login interface, fixed authentication for user "abdullah" with proper bcrypt password hashing, improved login button styling with blue color scheme and loading states, and removed "manufacturer management" button from admin dropdown menu to simplify interface
- July 05, 2025: Simplified admin interface - removed "user management" and "manufacturer management" buttons from both inventory table header and card view admin dropdown menus to streamline the interface and reduce administrative complexity
- July 05, 2025: Updated admin interface - replaced "location management" button with "user management" button in both inventory table and card view interfaces, restoring user management functionality while removing location management to simplify the admin workflow
- July 05, 2025: Fixed admin interface functionality - removed notification bell button from inventory page, created new simplified user management page (user-management-simple.tsx) with working CRUD operations, proper API integration, and clean Arabic interface to replace the broken user management page
- July 05, 2025: Changed date system from Hijri to Gregorian calendar - updated all date displays and reservation date recording throughout the system, modified entry date display in card view from 'ar-SA' to 'en-US' locale, updated reservation date display and recording in both card view and inventory table, and changed print date format in utils.ts to use Gregorian calendar for consistency across the entire application
- July 05, 2025: Enhanced voice assistant with dual input mode support - implemented comprehensive text and voice command interface using Tabs component, added text input field with Enter key support and Send button, integrated both voice recognition and text input processing through the same API endpoint, included example commands for user guidance, and improved accessibility with DialogTitle for screen readers
- July 05, 2025: Implemented comprehensive database integration for voice assistant - added complete CRUD operations support including vehicle search, addition, editing, deletion, selling, reservation and cancellation, integrated OpenAI GPT-4o for intelligent command interpretation with Arabic language support, developed dedicated action handlers for all vehicle operations with proper error handling and user feedback, and enhanced system prompt with detailed examples for accurate command recognition
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```