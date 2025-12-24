# Frontend Restructure Plan: Align with Design System

**Created:** December 23, 2025  
**Status:** Ready for Implementation  
**Goal:** Make `adaptiva-fe` look exactly like `adaptiva-design` while improving code structure

---

## Decisions Summary

Based on the answers to open questions, here are the key decisions:

| Decision | Choice |
|----------|--------|
| **Routing** | Multi-page with React Router (`/`, `/upload`, `/charts`, `/predictions`, `/settings`, `/login`, `/register`) |
| **State Management** | Zustand (minimal, hooks-based) |
| **Auth Flow** | Extract to `authStore` + `useAuth` hook |
| **Migration Strategy** | Big-bang (all at once) |
| **Design System** | Frozen - edit directly in `adaptiva-fe/src/design-system/` |
| **File State** | Global store (`fileStore.ts`) |
| **Auth UX** | Dedicated pages (`/login`, `/register`) |
| **Error Handling** | Layered (toasts + inline + boundaries) |
| **Loading States** | Combination (skeletons for content, spinners for actions) |

---

## Implementation Decisions (Resolved During Implementation)

| Question | Decision |
|----------|----------|
| **Token Storage** | Separate utility file (`utils/tokenStorage.ts`) - both auth store and API service import from here to avoid circular dependencies |
| **Type Systems** | Keep design-system types (`UploadedFile`, etc.) and app types (`UploadedData`, etc.) separate with clear boundaries |
| **DashboardLayout Navigation** | Create `MainLayout.tsx` wrapper that passes navigation callbacks to `DashboardLayout` (keeps design-system generic) |
| **File State Persistence** | Hybrid: persist `fileId`, `sheets`, `activeSheet` to localStorage, but refetch data rows on mount |

---

## Current State Analysis

### `adaptiva-design` (Design System)
```
src/app/
├── components/          # All components in one place
│   ├── ui/              # 48 shadcn/ui primitives
│   ├── charts/          # Chart-specific components
│   ├── predictions/     # ML/prediction components
│   ├── DashboardLayout.tsx
│   ├── DataPreview.tsx
│   └── ...
├── utils/
│   └── dataQuality.ts
└── App.tsx              # Single demo app
```

### `adaptiva-fe` (Current Frontend)
```
src/
├── components/          # Legacy components (Upload, ChartEditor, etc.)
├── context/             # AuthContext
├── hooks/               # useFileUpload, useChartGeneration, etc.
├── types/               # (empty or minimal)
├── utils/               # api.ts, storage.ts
├── design-system/       # Synced from adaptiva-design
└── App.tsx
```

---

## Proposed New Structure

```
src/
├── app/                          # App shell & routing
│   ├── App.tsx                   # Main app with React Router
│   ├── routes/                   # Route components (pages)
│   │   ├── DashboardPage.tsx     # / - Overview dashboard
│   │   ├── UploadPage.tsx        # /upload - Upload & preview
│   │   ├── ChartsPage.tsx        # /charts - Chart gallery
│   │   ├── PredictionsPage.tsx   # /predictions - ML models
│   │   ├── SettingsPage.tsx      # /settings - User settings
│   │   ├── LoginPage.tsx         # /login - Login form
│   │   └── RegisterPage.tsx      # /register - Registration form
│   └── layouts/                  # Layout wrappers
│       ├── MainLayout.tsx        # Uses DashboardLayout (authenticated)
│       └── AuthLayout.tsx        # Simple layout for login/register
│
├── components/                   # App-specific composed components
│   ├── features/                 # Feature-specific compositions
│   │   ├── upload/
│   │   │   └── UploadFlow.tsx    # Composes UploadZone + DataPreview + hooks
│   │   ├── charts/
│   │   │   └── ChartWorkspace.tsx
│   │   └── predictions/
│   │       └── PredictionWorkspace.tsx
│   └── shared/                   # App-specific shared components
│       ├── ErrorBoundary.tsx     # Crash recovery
│       ├── UserMenu.tsx          # Header user dropdown
│       └── RateLimitBanner.tsx   # Rate limit warning
│
├── hooks/                        # Custom React hooks
│   ├── api/                      # API-related hooks
│   │   ├── useFileUpload.ts
│   │   ├── useChart.ts
│   │   ├── useCleanData.ts
│   │   ├── usePredict.ts
│   │   ├── useInsights.ts
│   │   └── useExport.ts
│   └── ui/
│       └── useDragDrop.ts
│
├── services/                     # API service layer
│   ├── api.ts                    # Axios instance & interceptors
│   ├── uploadService.ts
│   ├── chartService.ts
│   ├── cleaningService.ts
│   ├── predictionService.ts
│   ├── insightsService.ts
│   ├── exportService.ts
│   └── authService.ts
│
├── stores/                       # Zustand stores
│   ├── authStore.ts              # Auth state + useAuth hook
│   └── fileStore.ts              # Uploaded file state
│
├── types/                        # TypeScript types
│   ├── api.ts                    # API request/response types
│   ├── models.ts                 # Domain models
│   └── index.ts                  # Re-exports
│
├── utils/                        # Pure utility functions
│   ├── storage.ts
│   ├── formatters.ts
│   └── validators.ts
│
├── design-system/                # FROM adaptiva-design (now editable)
│   ├── components/ui/            # shadcn primitives
│   ├── components/               # Feature components
│   ├── styles/                   # CSS/theme
│   └── index.ts                  # Exports
│
├── index.css                     # Imports design-system styles
└── main.tsx                      # Entry point
```

---

## Backend API Mapping (adaptiva-be)

The frontend uses these endpoints from `adaptiva-be`:

| Endpoint | Method | Service | Hook | Description |
|----------|--------|---------|------|-------------|
| `/api/upload` | POST | `uploadService` | `useFileUpload` | Upload CSV/XLSX file |
| `/api/preview` | POST | `uploadService` | `useFileUpload` | Get formatted data preview |
| `/api/cleaning` | POST | `cleaningService` | `useCleanData` | Clean/transform data |
| `/api/charts/ai` | POST | `chartService` | `useChart` | AI-generated chart |
| `/api/charts` | POST | `chartService` | `useChart` | Manual chart config |
| `/api/insights` | POST | `insightsService` | `useInsights` | AI data insights |
| `/api/predict` | POST | `predictionService` | `usePredict` | ML predictions |
| `/api/export` | POST | `exportService` | `useExport` | Export data (CSV/XLSX) |
| `/api/auth/register` | POST | `authService` | `useAuth` | User registration |
| `/api/auth/login` | POST | `authService` | `useAuth` | User login |
| `/api/auth/me` | GET | `authService` | `useAuth` | Get current user |

### Current `utils/api.ts` → Service Mapping

```
utils/api.ts (current)          →  services/ (proposed)
─────────────────────────────────────────────────────────
api.uploadFile()                →  uploadService.upload()
api.getFormattedPreview()       →  uploadService.getPreview()
api.cleanData()                 →  cleaningService.clean()
api.generateAIChart()           →  chartService.generateAI()
api.generateManualChart()       →  chartService.generateManual()
api.getInsights()               →  insightsService.analyze()
api.predict()                   →  predictionService.predict()
api.exportData()                →  exportService.export()
```

### Current Hooks (Keep, Just Reorganize)

```
hooks/                          →  hooks/api/
─────────────────────────────────────────────
useFileUpload.ts                →  useFileUpload.ts (same)
useChart.ts                     →  useChart.ts (same)
useCleanData.ts                 →  useCleanData.ts (same)
usePredict.ts                   →  usePredict.ts (same)
useInsights.ts                  →  useInsights.ts (same)
useExport.ts                    →  useExport.ts (same)
useDragDrop.ts                  →  hooks/ui/useDragDrop.ts
```

---

## Migration Plan

### Phase 1: Foundation (Day 1)

| Task | Description | Status |
|------|-------------|--------|
| 1.1 | Install dependencies: `react-router-dom`, `zustand` | ⬜ |
| 1.2 | Create new folder structure (`app/`, `services/`, `stores/`, `types/`) | ⬜ |
| 1.3 | Create `stores/authStore.ts` with Zustand (replace AuthContext) | ⬜ |
| 1.4 | Create `stores/fileStore.ts` with Zustand (global file state) | ⬜ |
| 1.5 | Move `utils/api.ts` → `services/api.ts` and refactor into service modules | ⬜ |
| 1.6 | Create `types/` with proper type definitions extracted from components | ⬜ |
| 1.7 | Ensure design-system styles are properly imported in `index.css` | ✅ |

### Phase 2: Services & Types (Day 1-2)

| Task | Description | Status |
|------|-------------|--------|
| 2.1 | Create `services/api.ts` - extract axios instance & interceptors | ⬜ |
| 2.2 | Create `services/uploadService.ts` - `/upload`, `/preview` | ⬜ |
| 2.3 | Create `services/chartService.ts` - `/charts/ai`, `/charts` | ⬜ |
| 2.4 | Create `services/cleaningService.ts` - `/cleaning` | ⬜ |
| 2.5 | Create `services/predictionService.ts` - `/predict` | ⬜ |
| 2.6 | Create `services/insightsService.ts` - `/insights` | ⬜ |
| 2.7 | Create `services/exportService.ts` - `/export` | ⬜ |
| 2.8 | Create `services/authService.ts` - `/auth/*` | ⬜ |
| 2.9 | Define types in `types/api.ts` and `types/models.ts` | ⬜ |
| 2.10 | Move hooks to `hooks/api/` and `hooks/ui/` subfolders | ⬜ |
| 2.11 | Update hooks to import from services instead of `utils/api.ts` | ⬜ |

### Phase 3: Component Migration (Day 2-3)

| Task | Description | Status |
|------|-------------|--------|
| 3.1 | Create `app/layouts/MainLayout.tsx` using `DashboardLayout` | ⬜ |
| 3.2 | Create `UploadFlow.tsx` - compose `UploadZone` + `DataPreview` + `useFileUpload` | ⬜ |
| 3.3 | Create `ChartWorkspace.tsx` - compose chart components + hooks | ⬜ |
| 3.4 | Move auth components to `components/shared/` | ⬜ |
| 3.5 | Delete legacy components as they're replaced | ⬜ |

### Phase 4: Routing & Pages (Day 3)

| Task | Description | Status |
|------|-------------|--------|
| 4.1 | Create `app/layouts/MainLayout.tsx` using `DashboardLayout` | ⬜ |
| 4.2 | Create `app/layouts/AuthLayout.tsx` for login/register pages | ⬜ |
| 4.3 | Create `app/routes/DashboardPage.tsx` - `/` | ⬜ |
| 4.4 | Create `app/routes/UploadPage.tsx` - `/upload` | ⬜ |
| 4.5 | Create `app/routes/ChartsPage.tsx` - `/charts` | ⬜ |
| 4.6 | Create `app/routes/PredictionsPage.tsx` - `/predictions` | ⬜ |
| 4.7 | Create `app/routes/SettingsPage.tsx` - `/settings` | ⬜ |
| 4.8 | Create `app/routes/LoginPage.tsx` - `/login` | ⬜ |
| 4.9 | Create `app/routes/RegisterPage.tsx` - `/register` | ⬜ |
| 4.10 | Create `app/App.tsx` with React Router configuration | ⬜ |
| 4.11 | Add protected route wrapper for authenticated pages | ⬜ |
| 4.12 | Implement navigation in `MainLayout` | ⬜ |

### Phase 5: Polish & Cleanup (Day 4)

| Task | Description | Status |
|------|-------------|--------|
| 5.1 | Remove all legacy component files | ⬜ |
| 5.2 | Remove legacy CSS files | ⬜ |
| 5.3 | Update all imports to use new paths | ⬜ |
| 5.4 | Test all features end-to-end | ⬜ |
| 5.5 | Delete `scripts/sync-design-system.ps1` (no longer needed) | ⬜ |
| 5.6 | Update `docs/DESIGN_SYSTEM_SYNC.md` to reflect frozen status | ⬜ |

---

## Key Architectural Decisions

### 1. Design System = Now Editable

Since `adaptiva-design` is frozen, the `design-system/` folder in `adaptiva-fe` is now the canonical source. Future UI updates go directly here.

### 2. Hooks vs Services Separation

```
services/     → Pure API calls (no React, just async functions)
hooks/api/    → React hooks that use services + manage state
```

**Example:**

```typescript
// services/uploadService.ts
export async function uploadFile(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/upload', formData);
}

// hooks/api/useFileUpload.ts
export function useFileUpload() {
  const [state, setState] = useState<UploadState>({ ... });
  
  const upload = async (file: File) => {
    setState({ loading: true });
    const result = await uploadService.uploadFile(file);
    setState({ data: result, loading: false });
  };
  
  return { ...state, upload };
}
```

### 3. Feature Compositions

Each feature folder composes design-system components with app logic:

```typescript
// components/features/upload/UploadFlow.tsx
import { UploadZone, DataPreview, DataQualityBanner } from '@design/index';
import { useFileUpload } from '@/hooks/api/useFileUpload';

export function UploadFlow() {
  const { file, upload, loading, error } = useFileUpload();
  
  return (
    <div className="space-y-6">
      <UploadZone onUpload={upload} isLoading={loading} />
      {file && <DataQualityBanner report={file.qualityReport} />}
      {file && <DataPreview file={file} />}
    </div>
  );
}
```

### 4. Path Aliases

Update `tsconfig.app.json`:

```json
{
  "paths": {
    "@/*": ["./src/*"],
    "@design/*": ["./src/design-system/*"],
    "@features/*": ["./src/features/*"],
    "@hooks/*": ["./src/hooks/*"],
    "@services/*": ["./src/services/*"],
    "@stores/*": ["./src/stores/*"],
    "@types/*": ["./src/types/*"]
  }
}
```

### 5. Zustand Store Pattern

```typescript
// stores/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: async (email, password) => {
        const { user, token } = await authService.login(email, password);
        set({ user, token, isAuthenticated: true });
      },
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      register: async (email, password) => {
        const { user, token } = await authService.register(email, password);
        set({ user, token, isAuthenticated: true });
      },
    }),
    { name: 'auth-storage' }
  )
);

// Usage in components
const { user, isAuthenticated, login, logout } = useAuthStore();
```

### 6. Error Handling Strategy (Layered)

| Layer | Type | When to Use |
|-------|------|-------------|
| **Toast** | Non-blocking | API errors, success confirmations |
| **Inline** | Contextual | Form validation, field-specific errors |
| **Error Boundary** | Recovery | Component crashes, unexpected errors |

```typescript
// components/shared/ErrorBoundary.tsx
import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

export class ErrorBoundary extends Component<Props, { hasError: boolean }> {
  state = { hasError: false };
  
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  
  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div>Something went wrong.</div>;
    }
    return this.props.children;
  }
}

// Toast usage (via sonner)
import { toast } from 'sonner';
toast.success('File uploaded successfully');
toast.error('Failed to generate chart');
```

### 7. Loading State Patterns

| Content Type | Loading State |
|--------------|---------------|
| Page content | Skeleton loaders |
| Button actions | Spinner inside button |
| File uploads | Progress bar |
| Data tables | Table skeleton rows |

---

## Files to Delete (After Migration)

| File | Reason |
|------|--------|
| `components/Upload.tsx` | Replaced by `UploadFlow` + design-system |
| `components/Upload.css` | Using Tailwind from design-system |
| `components/ChartEditor.tsx` | Replaced by `ChartWorkspace` |
| `components/ChartEditor.css` | Using Tailwind |
| `components/Preview.tsx` | Using `DataPreview` from design-system |
| `components/Preview.css` | Using Tailwind |
| `components/Controls.tsx` | Integrated into feature compositions |
| `components/Controls.css` | Using Tailwind |
| `components/ResultsPanel.tsx` | Using design-system components |
| `components/ResultsPanel.css` | Using Tailwind |
| `components/ChartView.tsx` | Using `ChartPreview` from design-system |
| `components/ChartView.css` | Using Tailwind |
| `components/AuthModal.tsx` | Replaced by `/login` and `/register` pages |
| `components/AuthModal.css` | Using Tailwind |
| `context/AuthContext.tsx` | Replaced by `stores/authStore.ts` (Zustand) |
| `App.css` | Migrated to Tailwind |
| `utils/api.ts` | Split into `services/` modules |

---

## Open Questions (Resolved)

> All questions have been answered. Decisions are captured in the **Decisions Summary** at the top.

### 1. Routing
- [X] Multi-page routing with URLs (`/upload`, `/charts`, `/predictions`)
- [ ] Single-page with tab navigation (current approach)

### 2. State Management
- [ ] Keep React Context (AuthContext pattern)
- [X] Migrate to Zustand/Jotai for simpler global state

### 3. Auth Flow
- [ ] Keep `AuthContext` as-is
- [X] Extract to `authStore` + `useAuth` hook

### 4. Migration Strategy
- [X] Big-bang (migrate all at once, potential downtime)
- [ ] Incremental (run old + new side-by-side, gradual migration)

### 5. Design System Updates
~~When `adaptiva-design` updates, how should sync happen?~~
- ~~Manual with `npm run sync-design` command~~
- ~~Auto-run on `npm install` (postinstall script)~~
- ~~Git hooks (pre-commit or post-merge)~~

**Decision:** `adaptiva-design` is now frozen. The synced `design-system/` folder in `adaptiva-fe` becomes the canonical source going forward. Future UI updates will be made directly in `adaptiva-fe/src/design-system/`.

### 6. State Library Choice
- [X] **Zustand** - Minimal, hooks-based, no boilerplate
- [ ] **Jotai** - Atomic, React-centric, good for derived state

### 7. File/Data State Scope
Where should uploaded file data live?
- [X] **Global store** (`fileStore.ts`) - Accessible from any component
- [ ] **Route-level state** - Passed via props/context per route
- [ ] **URL state** - File ID in URL, fetch on mount

### 8. Navigation Structure
Which routes should exist?
- [X] `/` → Dashboard (overview)
- [X] `/upload` → Upload & preview data
- [X] `/charts` → Chart gallery & creation
- [X] `/predictions` → ML models & predictions
- [X] `/settings` → User settings (if needed)
- [ ] Other: _____________

### 9. Authentication UX
- [ ] **Modal-based** (current) - Login/register as overlay
- [X] **Dedicated pages** - `/login`, `/register` routes
- [ ] **Inline in header** - Collapsible form in navbar

### 10. Error Handling Strategy
- [ ] **Toast notifications** - Non-blocking, auto-dismiss
- [ ] **Inline errors** - Show errors in context (near the form/action)
- [ ] **Error boundaries** - Full-page error for crashes
- [X] **All of the above** - Layered approach

### 11. Loading States
- [ ] **Skeleton loaders** - Placeholder shapes (design-system has these)
- [ ] **Spinners** - Simple loading indicators
- [ ] **Progress bars** - For uploads/long operations
- [X] **Combination** - Skeletons for content, spinners for actions

---

## Success Criteria

- [ ] Frontend visually matches `adaptiva-design` exactly
- [ ] All existing functionality preserved
- [ ] No CSS files except Tailwind utilities
- [ ] Clear separation: design-system (UI) vs app (logic)
- [ ] Build passes with no TypeScript errors
- [ ] All hooks properly typed
- [ ] Path aliases working throughout codebase

---

## Notes

- Design system sync completed on December 23, 2025
- **`adaptiva-design` is now frozen** - No future updates expected
- Future UI changes will be made directly in `adaptiva-fe/src/design-system/`
- 48 shadcn/ui components available
- Chart and prediction components synced
- See `docs/DESIGN_SYSTEM_SYNC.md` for sync documentation
- **Toast notifications**: Use `sonner` (already installed) - import `{ toast }` from `sonner`
- **Backend API**: All endpoints served from `adaptiva-be` at `/api/*`
- **Existing hooks**: 7 hooks already exist, just need reorganization into subfolders
