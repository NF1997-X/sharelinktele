# ShareLink Bot - Telegram File Sharing Platform

## Overview

ShareLink Bot is a web application that enables users to upload media files and share them via Telegram. The application uploads files to a designated Telegram channel and generates shareable links for easy distribution. It provides a modern, user-friendly interface for managing and sharing images, videos, and documents.

## Recent Updates (October 2025)

### UI/UX Improvements
- Implemented system font stack for native appearance across all devices
- Added smooth 150ms transitions to all interactive elements
- Reduced text sizes globally for cleaner, more compact design
- Optimized mobile viewport with `user-scalable=no` for better touch experience
- Smaller navigation header and tighter spacing throughout

### Upload Performance Enhancements
- Increased file size limit to 1GB for large videos
- Added real-time upload speed indicator (MB/s)
- Implemented time remaining estimates during uploads
- Enhanced progress tracking with detailed upload statistics
- Optimized multer configuration for faster processing
- Support for all video formats (MP4, MKV, AVI, MOV, WebM, etc.)

### Full-Screen Media Viewer
- Complete redesign with full-page immersive viewing experience
- Auto-hiding controls (fade after 3 seconds of inactivity)
- Image zoom controls (50% to 300%) with smooth transitions
- Fullscreen mode toggle
- Keyboard shortcuts (ESC to close, +/- to zoom)
- Better video support with autoplay
- Improved loading states with animated spinner

### Share Link Improvements
- Shortened share link IDs from 10 to 6 characters
- Example: `https://yoursite.com/s/aBc123` (previously 10 chars)
- Maintains 68+ billion unique combinations

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System:**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server
- Wouter for lightweight client-side routing
- React Query (TanStack Query) for server state management and data fetching

**UI Component System:**
- shadcn/ui component library with Radix UI primitives
- Tailwind CSS for utility-first styling with custom design tokens
- Design system inspired by Telegram, WeTransfer, and Dropbox aesthetics
- Dark mode support with theme persistence in localStorage
- Custom color palette with light/dark mode variants defined in CSS variables

**State Management:**
- React Query for server state (file uploads, library data)
- Local component state with React hooks
- No global state management library (Redux/Zustand) - keeping it simple

**Key Frontend Features:**
- Drag-and-drop file upload with visual feedback
- Real-time upload progress tracking
- Responsive design for mobile and desktop
- File type detection and appropriate icon display
- Copy-to-clipboard functionality for share links
- Search and filter capabilities in the library view

### Backend Architecture

**Server Framework:**
- Express.js for HTTP server and API endpoints
- TypeScript throughout the entire codebase
- Node.js runtime environment

**File Upload Processing:**
- Multer middleware for multipart/form-data handling
- In-memory storage with 1GB file size limit
- File type detection based on MIME types (image, video, document, audio)
- Smart routing based on file size:
  - Images <10MB → sent as photos
  - Videos <50MB → sent as videos
  - Files >50MB → sent as documents (up to 2GB)
- Supports all video formats: MP4, MKV, AVI, MOV, WebM, FLV, WMV, and more

**API Design:**
- RESTful endpoints under `/api/*` prefix
- File upload: `POST /api/upload`
- File retrieval: `GET /api/files` and `GET /api/files/:id`
- Share link access: `GET /api/share/:linkId`
- File deletion: `DELETE /api/files/:id`

**Development Environment:**
- Hot module replacement (HMR) in development via Vite
- Separate build process for client and server
- Production build combines both into `dist/` directory

### Data Storage Solutions

**Database:**
- PostgreSQL as the primary database (via Neon serverless)
- Drizzle ORM for type-safe database operations
- WebSocket connection for serverless PostgreSQL

**Schema Design:**
- Single `uploaded_files` table storing:
  - File metadata (name, size, type, MIME type)
  - Telegram references (file ID, message ID)
  - Share link identifier (unique)
  - Upload timestamp
  - Optional object storage key (future enhancement)

**Data Access Layer:**
- Repository pattern with `IStorage` interface
- `DatabaseStorage` class implementing CRUD operations
- Drizzle schema validation with Zod for type safety

### External Dependencies

**Telegram Bot API:**
- `node-telegram-bot-api` library for bot integration
- Uploads files to a specified Telegram channel (configured via `TELEGRAM_CHANNEL_ID`)
- Stores file references (file_id, message_id) for retrieval
- Handles three file types differently:
  - Photos via `sendPhoto`
  - Videos via `sendVideo`
  - Documents via `sendDocument`
- Bot token required via `TELEGRAM_BOT_TOKEN` environment variable

**Database Service:**
- Neon serverless PostgreSQL hosting
- Connection via `@neondatabase/serverless` package
- WebSocket-based connection (uses `ws` package)
- Connection pooling for efficient resource usage
- Database URL required via `DATABASE_URL` environment variable

**UI Component Libraries:**
- Multiple Radix UI primitives (@radix-ui/react-*)
- Provides accessible, unstyled component primitives
- Includes: dialogs, dropdowns, popovers, tooltips, forms, etc.

**Utility Libraries:**
- `nanoid` for generating unique share link identifiers
- `date-fns` for date formatting and relative time display
- `class-variance-authority` and `clsx` for conditional CSS class management
- `zod` for runtime schema validation

**Development Tools:**
- Replit-specific plugins for development environment integration
- ESBuild for production server bundling
- Drizzle Kit for database migrations

### Authentication & Authorization

**Current State:**
- No authentication system implemented
- Public access to all uploaded files
- Anyone with a share link can access the file

**Security Considerations:**
- File size limits enforced at 50MB
- MIME type validation for file uploads
- Environment variables for sensitive credentials (bot token, database URL)

### Architectural Decisions

**Why Telegram for Storage:**
- Eliminates need for dedicated object storage (S3, etc.)
- Leverages Telegram's CDN for file delivery
- Reduces infrastructure complexity and costs
- Files remain accessible via Telegram's infrastructure

**Why Drizzle ORM:**
- Type-safe database queries with TypeScript
- Lightweight compared to Prisma or TypeORM
- Excellent integration with PostgreSQL
- Schema-first approach with code generation

**Why React Query:**
- Simplifies server state management
- Automatic caching and background refetching
- Reduces boilerplate for data fetching
- Built-in loading and error states

**Why Vite:**
- Fast development server with instant HMR
- Optimized production builds
- Better DX compared to Create React App
- Native ESM support

**Monorepo Structure:**
- `client/` - Frontend React application
- `server/` - Backend Express server
- `shared/` - Shared TypeScript types and schemas
- Enables code sharing between frontend and backend
- Single TypeScript configuration for consistency