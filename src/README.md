# Source Code Structure

This is the main source directory for the Adaptiva frontend application - an AI-powered data analysis platform.

## Architecture Overview

The application follows a **hybrid layered + feature-based architecture**:

```
┌─────────────────────────────────────────────────────────┐
│                       App Layer                         │
│           (Routes, Layouts, Page Components)            │
├───────────────────────────────────────────────────────┬─┤
│                    Features Layer                     │ │
│  ┌─────────┐  ┌─────────┐  ┌──────────────┐          │ │
│  │  auth   │  │ charts  │  │ predictions  │  + more  │ │
│  └─────────┘  └─────────┘  └──────────────┘          │ │
├───────────────────────────────────────────────────────┤ │
│                   Shared Hooks Layer                  │ │
│              (API hooks in /api, UI in /ui)           │ │
├──────────────────────┬────────────────────────────────┤ │
│    Stores (Zustand)  │      Services (API calls)      │ │
│   - authStore        │      - authService             │ │
│   - fileStore        │      - uploadService           │ │
│   - chartStore       │      - chartService            │ │
│   - predictionStore  │      - predictionService       │ │
│   - qualityStore     │      - insightsService, etc.   │ │
├──────────────────────┴────────────────────────────────┤ │
│                  Design System (UI)                   │ │
│       (shadcn/ui components, styles, utilities)       │ │
└───────────────────────────────────────────────────────┴─┘
```

## Directory Structure

```
src/
├── app/                    # Application shell
│   ├── layouts/            # Layout components
│   │   ├── MainLayout.tsx  # Protected routes with sidebar
│   │   └── AuthLayout.tsx  # Public auth pages
│   └── routes/             # Page components
│       ├── DashboardPage.tsx
│       ├── UploadPage.tsx
│       ├── PreviewPage.tsx
│       ├── ChartsPage.tsx
│       ├── PredictionsPage.tsx
│       ├── SettingsPage.tsx
│       ├── LoginPage.tsx
│       └── RegisterPage.tsx
│
├── features/               # Feature modules (vertical slices)
│   ├── auth/               # Authentication feature
│   │   ├── AuthModal.tsx
│   │   └── UserMenu.tsx
│   ├── charts/             # Charts feature
│   │   ├── components/     # ChartCard, ChartEditor, ChartGallery, etc.
│   │   └── hooks/          # useChartActions
│   └── predictions/        # ML predictions feature
│       └── components/     # ModelCard, ModelCreator, FeatureSelector, etc.
│
├── design-system/          # UI component library
│   ├── components/         # Reusable components
│   │   ├── ui/             # shadcn/ui primitives (button, card, dialog, etc.)
│   │   ├── BrandLogo.tsx
│   │   ├── DashboardLayout.tsx
│   │   ├── DataPreview.tsx
│   │   ├── DataQualityBanner.tsx
│   │   ├── EmptyState.tsx
│   │   └── UploadZone.tsx
│   ├── styles/             # CSS (tailwind, theme, fonts)
│   └── utils/              # Design system utilities
│
├── hooks/                  # Shared React hooks
│   ├── api/                # API integration hooks
│   │   ├── useChart.ts
│   │   ├── useCleanData.ts
│   │   ├── useExport.ts
│   │   ├── useFileUpload.ts
│   │   ├── useInsights.ts
│   │   ├── usePredict.ts
│   │   └── useTrainModel.ts
│   └── ui/                 # UI utility hooks
│       └── useDragDrop.ts
│
├── services/               # API service layer (axios-based)
│   ├── api.ts              # Centralized axios instance
│   ├── authService.ts
│   ├── uploadService.ts
│   ├── chartService.ts
│   ├── predictionService.ts
│   ├── cleaningService.ts
│   ├── exportService.ts
│   └── insightsService.ts
│
├── stores/                 # Zustand state management
│   ├── authStore.ts        # Authentication state
│   ├── fileStore.ts        # Uploaded file state
│   ├── chartStore.ts       # Chart configurations
│   ├── predictionStore.ts  # ML model state
│   └── qualityStore.ts     # Data quality state
│
├── types/                  # Shared TypeScript types
│   ├── chartSpec.ts
│   └── predictions.ts
│
├── utils/                  # Standalone utilities
│   ├── api.ts
│   ├── dataQuality.ts
│   ├── sampleData.ts
│   └── tokenStorage.ts
│
├── context/                # React contexts
│   └── AuthContext.tsx
│
└── assets/                 # Static assets (logos, images)
```

## Key Patterns

### Hybrid Architecture
- **Shared layers** (`/services`, `/hooks`, `/stores`) for cross-cutting concerns
- **Feature modules** (`/features/*`) for domain-specific code with their own components and hooks

### State Management (Zustand)
- **`authStore`** - Authentication state with persistence
- **`fileStore`** - Uploaded file state (metadata persisted, data refetched)
- **`chartStore`** - Chart configurations and state
- **`predictionStore`** - ML model training and predictions
- **`qualityStore`** - Data quality metrics

### API Layer
- Services are pure async functions (no React dependencies)
- Hooks in `/hooks/api/` wrap services and provide React integration
- Centralized axios instance with interceptors in `services/api.ts`

### Token Storage
- Tokens stored in `utils/tokenStorage.ts` (not in stores)
- Prevents circular dependencies between auth store and API services

### Routing
- React Router v6 with layout routes
- `MainLayout` - Protected routes with sidebar navigation
- `AuthLayout` - Public auth pages (login, register)

### Design System
- Built on shadcn/ui with Tailwind CSS
- 45+ UI primitives in `/design-system/components/ui/`
- Custom composite components (DataPreview, UploadZone, etc.)

## Path Aliases

Configured in `tsconfig.app.json` and `vite.config.ts`:

| Alias | Path |
|-------|------|
| `@/*` | `src/*` |
| `@design/*` | `src/design-system/*` |
| `@features/*` | `src/features/*` |
| `@hooks/*` | `src/hooks/*` |
| `@services/*` | `src/services/*` |
| `@stores/*` | `src/stores/*` |

## Quick Links

- [App Layer](./app/README.md) - Routes and layouts
- [Features](./features/README.md) - Feature modules
- [Design System](./design-system/README.md) - UI components
- [Hooks](./hooks/README.md) - Custom hooks
- [Services](./services/README.md) - API layer
- [Stores](./stores/README.md) - State management
