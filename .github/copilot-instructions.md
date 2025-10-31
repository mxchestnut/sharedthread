# Shared Thread - Copilot Instructions

This project is Shared Thread: a private, login-only web portal where creators draft structured works (Atelier), publish to a Library (cards/shelves), and host discussion/Q&A/ratings on each work.

## Tech Stack
- Next.js 14+ with App Router
- TypeScript
- Tailwind CSS
- Prisma ORM (to be added)
- Authentication with TOTP 2FA (to be added)

## Project Structure
- `/src/app/` - Next.js app router pages
- `/src/components/` - Reusable UI components organized by feature
- `/src/lib/` - Utilities, auth, database, validation (to be added)
- `/src/types/` - TypeScript definitions (to be added)
- `/src/styles/` - CSS tokens and global styles
- `/prisma/` - Database schema and migrations (to be added)
- `/docs/` - Architecture Decision Records (to be added)

## Current Implementation Status
✅ Next.js project scaffolded with TypeScript and Tailwind
✅ Basic UI structure matching mockup design
✅ Header component with sticky navigation
✅ Library page with card grid and placeholder content
✅ Design tokens for Shared Thread visual system
✅ Responsive two-column layout with sidebar
✅ README with getting started instructions

## Next Steps
- [ ] Add Prisma database schema
- [ ] Implement authentication system
- [ ] Create API routes for CRUD operations
- [ ] Add Atelier creation interface
- [ ] Build discussion/Q&A/rating components
- [ ] Implement Beta annotation system

## Key Features
- Authentication wall (no public pages except login)
- Library: card grid with filters for published works
- Atelier: structured creation workspace (Draft → Beta → Published)
- Work pages: Discussion/Q&A/Ratings tabs
- Beta mode: paragraph-level annotations
- User profiles with follow system
- Collections for organizing works
- Admin toggles and feature flags

## Development Guidelines
- Use semantic HTML and maintain accessibility standards
- Follow paper-like design aesthetic with warm off-white backgrounds
- Implement proper TypeScript types for all data models
- Use Prisma for database operations
- Maintain security-first approach with proper auth guards
- Create reusable components following atomic design principles

## Running the Project

1. Navigate to the work-shelf directory:
```bash
cd /Users/kit/Documents/work-shelf
```

2. Start the development server:
```bash
npm run dev
```

3. Open http://localhost:3000 (or the port shown in terminal)

The app will redirect to `/library` showing the Shared Thread interface with placeholder content.

## Completed Tasks
✅ Project requirements clarified
✅ Repository structure created
✅ Next.js scaffold with TypeScript + Tailwind
✅ Basic UI components and layout
✅ Library page with mockup content
✅ Design system tokens and styling