# Source Code Structure

This is the main source directory for the Adaptiva frontend application - an AI-powered data analysis platform.

## Architecture Overview

The application follows a layered architecture:

```
┌─────────────────────────────────────────────────┐
│                    App Layer                     │
│        (Routes, Layouts, Page Components)        │
├─────────────────────────────────────────────────┤
│                   Hooks Layer                    │
│         (API hooks, UI hooks, abstractions)      │
├──────────────────────┬──────────────────────────┤
│    Stores (Zustand)  │    Services (API calls)  │
│   - authStore        │    - authService         │
│   - fileStore        │    - uploadService       │
│                      │    - chartService, etc.  │
├──────────────────────┴──────────────────────────┤
│               Design System (UI)                 │
│     (Reusable components, styles, utilities)     │
└─────────────────────────────────────────────────┘
```

## Directory Structure

| Folder | Purpose |
|--------|---------|
| `/app` | React application - router, pages, layouts |
| `/design-system` | UI component library and styles |
| `/services` | API service layer (axios-based) |
| `/stores` | Zustand state management |
| `/hooks` | Custom React hooks |
| `/utils` | Standalone utility functions |
| `/types` | Shared TypeScript types |

## Key Patterns

### State Management (Zustand)
- **`authStore`** - Authentication state with persistence
- **`fileStore`** - Uploaded file state (metadata persisted, data refetched)

### API Layer
- Services are pure async functions (no React dependencies)
- Hooks wrap services and provide React integration
- Centralized axios instance with interceptors in `services/api.ts`

### Token Storage
- Tokens stored in `utils/tokenStorage.ts` (not in stores)
- Prevents circular dependencies between auth store and API services

### Routing
- React Router v6 with layout routes
- `MainLayout` - Protected routes with sidebar navigation
- `AuthLayout` - Public auth pages (login, register)

## Path Aliases

Configured in `tsconfig.app.json` and `vite.config.ts`:

| Alias | Path |
|-------|------|
| `@/*` | `src/*` |
| `@components/*` | `src/components/*` |
| `@hooks/*` | `src/hooks/*` |
| `@services/*` | `src/services/*` |
| `@stores/*` | `src/stores/*` |
| `@design/*` | `src/design-system/*` |

## Quick Links

- [App Layer](./app/README.md) - Routes and layouts
- [Services](./services/README.md) - API layer
- [Stores](./stores/README.md) - State management
- [Hooks](./hooks/README.md) - Custom hooks
- [Design System](./design-system/README.md) - UI components
