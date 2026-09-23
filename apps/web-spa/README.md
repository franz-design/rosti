# SPA (Single Page Application)

This application is a SPA (Single Page Application) built with React and Vite.
[Frontend Guidelines](../documentation/src/content/docs/references/frontend.mdx)

## Overview

This is the web frontend application of our project, built with modern React and a robust set of tools for an optimal development experience.

## Tech Stack

- [React 19](https://react.dev/) - A JavaScript library for building user interfaces
- [TypeScript](https://www.typescriptlang.org/) - JavaScript with syntax for types
- [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework
- [Shadcn UI](https://ui.shadcn.com/) - Re-usable components built with Radix UI and Tailwind CSS
- [React Router v8](https://reactrouter.com/) - Declarative routing for React
- [TanStack Query](https://tanstack.com/query/latest) - Powerful asynchronous state management
- [TanStack Table](https://tanstack.com/table/latest) - Headless UI for building powerful tables
- [TanStack Form](https://tanstack.com/form/latest) - Powerful and type-safe form builder
- [Better Auth](https://github.com/better-auth-io/better-auth) - Authentication and authorization solution

## Prerequisites

Before you begin, ensure you have installed:
- [Node.js](https://nodejs.org/) (version 24.13.0)
- [pnpm](https://pnpm.io/) (version 10.28.2)

## Getting Started

1. Install dependencies:
```bash
pnpm install
```

2. Set up environment variables
```bash
cp .env.example .env
```

3. Start the development server:
```bash
pnpm dev
```

The application will be available at `http://localhost:5173`

## Available Scripts

- `pnpm dev` - Start the development server
- `pnpm build` - Build the application for production
- `pnpm preview` - Preview the production build locally

## Project Structure

```
app/
├── features/      # Feature-specific components and logic
├── hooks/         # Custom React hooks
├── lib/           # Utility functions and configurations
├── root.tsx       # Application root
└── routes.ts      # Route table
```

## Environment Variables

### Environment Variables Management in a SPA

In a SPA, environment variables must be defined at build time as they are integrated into the JavaScript bundle. This means you cannot simply change these variables after the build without rebuilding the application.

### Available Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `VITE_API_URL` | Backend API URL | Yes | - |

> **Note**: All environment variables used in the application must start with `VITE_` to be accessible in the client code.

## Building with Docker

### Building the Image

```bash
# At the project root — defaults bake `__VITE_*__` placeholders for runtime injection
docker build -t lonestone/web-spa -f apps/web-spa/Dockerfile .

# Optional: bake a fixed URL instead of a placeholder (no runtime override)
docker build -t lonestone/web-spa \
  --build-arg VITE_API_URL=https://api.example.com \
  -f apps/web-spa/Dockerfile .
```

### Running the Container

Set `VITE_*` at **runtime** (Dokploy Environment, `-e`, compose). The entrypoint replaces `__VITE_*__` placeholders in the built JS:

```bash
docker run -p 80:80 \
  -e VITE_API_URL=https://api-staging.example.com \
  lonestone/web-spa
```

> **Important**: CI images embed `__VITE_API_URL__` (and store URL placeholders). Do **not** use `%VITE_*%` — Vite treats that as HTML env syntax and can corrupt the string in the bundle. Setting runtime env on an image built **without** placeholders has no effect. App code uses `import.meta.env.VITE_*`; Vite inlines the build-arg value into the bundle.
