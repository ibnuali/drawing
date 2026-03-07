# Excalidraw Clone

A collaborative online whiteboard application built with Next.js, Excalidraw, and Convex.

## Features

- **Drawing Canvas** - Infinite canvas powered by Excalidraw
- **Real-time Collaboration** - Work together with team members in real-time
- **User Authentication** - Secure sign-in/sign-up with Better Auth
- **Canvas Management** - Create, rename, and delete canvases
- **Categories** - Organize canvases into custom categories
- **Sharing** - Share canvases with customizable access levels (view/edit)
- **Dark Mode** - Full dark mode support

## Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS
- **Canvas**: Excalidraw
- **Backend**: Convex (real-time database)
- **Auth**: Better Auth
- **UI Components**: Shadcn/ui, Lucide icons

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun

### Installation

```bash
npm install
```

### Environment Setup

Create a `.env.local` file with your Convex and auth credentials:

```
CONVEX_DEPLOYMENT=your-deployment-name
NEXT_PUBLIC_CONVEX_URL=your-convex-url
BETTER_AUTH_SECRET=your-secret
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Build

```bash
npm run build
npm start
```

## Project Structure

```
app/
├── (auth)/          # Authentication pages (sign-in, sign-up)
├── canvas/          # Canvas view pages
├── workspace/       # Main workspace with canvas management
└── api/             # API routes
components/
├── excalidraw/      # Excalidraw wrapper and customizations
├── workspace/       # Workspace-specific components
└── ui/              # Reusable UI components
convex/
├── canvases.ts      # Canvas CRUD operations
├── categories.ts    # Category management
├── access.ts        # Sharing and permissions
└── presence.ts      # Real-time presence
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint