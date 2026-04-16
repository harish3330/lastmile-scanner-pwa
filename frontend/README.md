# Frontend Configuration

This folder contains the React + Vite PWA application.

## Quick Start

```bash
npm install
npm run dev
```

## Structure

- `src/core/` - Core configuration (routes, theme)
- `src/pages/` - Page components (Home, Dashboard)
- `src/components/` - Reusable components (Navbar, Sidebar)
- `src/modules/` - 10 independent feature modules
- `src/services/` - API service layer
- `src/hooks/` - Custom React hooks
- `src/utils/` - Utility functions
- `public/` - Static assets (manifest, service worker)

## Development

- **Port:** 3000
- **Framework:** React 18 + Vite 4
- **Router:** React Router v6
- **Styling:** CSS (no framework yet)

## Build

```bash
npm run build
npm run preview
```

## Module Development

Each module has:
- `index.js` - Exports
- `ModulePage.jsx` - UI component
- `moduleService.js` - Business logic (placeholder)

Just add your implementation inside each module folder!
