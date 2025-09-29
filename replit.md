# Smart Education Platform

## Overview

This is a full-stack Smart Education platform designed to connect students, teachers, and parents in a comprehensive learning ecosystem. The platform features role-based dashboards, real-time communication, assignment management, emotional wellness monitoring, and interactive course delivery. Built with modern web technologies, it provides a futuristic user interface with glassmorphism design and smooth animations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 19 with TypeScript 5 for type safety and modern React features
- **Build Tool**: Vite for fast development and optimized production builds
- **UI Framework**: TailwindCSS 4 with custom design system featuring glassmorphism effects
- **Animation Library**: Framer Motion for smooth transitions and interactive animations
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state and React Context API for global client state
- **Component Library**: Radix UI primitives with custom shadcn/ui components

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful APIs with structured route organization
- **Real-time Communication**: WebSocket integration for live updates and notifications
- **Session Management**: Express sessions with PostgreSQL store for persistence

### Authentication & Authorization
- **Strategy**: Passport.js with local authentication strategy
- **Password Security**: Scrypt-based password hashing with salt
- **Session Storage**: PostgreSQL-backed session store using connect-pg-simple
- **Role-based Access**: Three distinct user roles (student, teacher, parent) with differentiated permissions

### Database Architecture
- **Primary Database**: PostgreSQL with Neon serverless hosting
- **ORM**: Drizzle ORM for type-safe database queries and migrations
- **Schema Design**: Relational model supporting users, courses, assignments, announcements, emotions, and timetables
- **Connection Management**: Connection pooling with @neondatabase/serverless

### Real-time Features
- **WebSocket Server**: Native WebSocket implementation for real-time updates
- **Event Broadcasting**: Live notifications for new assignments, announcements, and emotional state changes
- **Client Synchronization**: Automatic UI updates when data changes occur

### UI/UX Design System
- **Design Philosophy**: Futuristic aesthetic with glassmorphism and neon glow effects
- **Color Scheme**: Dark theme with cyan primary, purple secondary, and pink accent colors
- **Typography**: Inter font family with multiple weights
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Animation Strategy**: Micro-interactions and page transitions using Framer Motion

### Development Workflow
- **Type Safety**: Full TypeScript coverage across frontend, backend, and shared schemas
- **Code Organization**: Monorepo structure with shared types between client and server
- **Build Process**: Separate builds for client (Vite) and server (esbuild)
- **Development Server**: Hot module replacement with Vite dev server

## External Dependencies

### Database & Hosting
- **Neon Database**: Serverless PostgreSQL hosting with built-in connection pooling
- **WebSocket Support**: Native WebSocket constructor for Neon compatibility

### UI Components & Styling
- **Radix UI**: Accessible primitive components for complex UI patterns
- **TailwindCSS**: Utility-first CSS framework for rapid styling
- **Framer Motion**: Production-ready motion library for React animations

### Development Tools
- **Drizzle Kit**: Database migration and schema management
- **ESBuild**: Fast JavaScript bundler for server builds
- **Vite**: Next-generation frontend build tool with HMR

### Authentication & Security
- **Passport.js**: Flexible authentication middleware
- **Connect-PG-Simple**: PostgreSQL session store for Express
- **Crypto Module**: Node.js built-in cryptography for password hashing

### State Management
- **TanStack Query**: Server state management with caching and synchronization
- **Date-fns**: Modern date utility library for time formatting

### Monitoring & Wellness
- **Emotion Tracking**: Placeholder infrastructure for AI-powered emotion detection
- **Performance Analytics**: Framework for tracking student progress and engagement
- **Real-time Notifications**: WebSocket-based instant messaging system

## Parent Dashboard Features (Enhanced)

The parent dashboard has been significantly enhanced with comprehensive communication and scheduling capabilities:

### Communication Features
- **Direct Messaging**: Parents can send messages directly to teachers through modal dialogs
- **Message History**: View recent messages with read/unread status indicators
- **Teacher Selection**: Dropdown to select teachers based on enrolled courses

### Meeting Management
- **Meeting Scheduler**: Schedule parent-teacher meetings with date/time picker
- **Meeting Status**: View upcoming meetings with status badges (scheduled/completed/cancelled)
- **Meeting Details**: Add meeting titles, duration, and optional notes/descriptions

### Calendar & Events
- **Visual Calendar**: Displays upcoming events and assignment deadlines in chronological order
- **Event Types**: Categorized events (assignment, exam, holiday, activity, meeting) with color-coded badges
- **Deadline Tracking**: Shows all upcoming assignment due dates integrated with event calendar

### Timetable View
- **Weekly Schedule**: Displays student's class schedule organized by day (Monday-Friday)
- **Time Slots**: Shows start and end times for each class
- **Location Information**: Displays classroom or location for each scheduled class

### Database Schema Additions
New tables to support parent features:
- **messages**: Stores parent-teacher communications with read status tracking
- **meetings**: Manages parent-teacher meeting schedules and status
- **events**: School-wide events and activities calendar
- **parent_children**: Links parent accounts to their children (student accounts)

### Technical Implementation
- Uses React Query for efficient data fetching and caching
- Implements controlled forms with proper state management
- WebSocket integration for real-time message and meeting notifications
- Proper error handling with toast notifications
- Safety checks for null/undefined date values to prevent crashes