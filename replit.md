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
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```