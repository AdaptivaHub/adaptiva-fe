# Design System Refactoring Plan

> **Goal**: Remove application and business logic from the design system and move it into the appropriate layers of the existing project without changing user-facing behavior.

## ✅ REFACTORING COMPLETE (December 2024)

All phases have been implemented. The design system is now purely presentational.

### Completed Phases

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 1 | ✅ Done | Created stores (`chartStore`, `predictionStore`, `qualityStore`), moved types and utils |
| Phase 2 | ✅ Done | Refactored `EmptyState`, `DataQualityBanner`, `ChartCard` |
| Phase 3 | ✅ Done | Refactored `UploadZone`, `ChartCreator`, `ModelCreator` |
| Phase 4 | ✅ Done | Refactored `ChartGallery`, `PredictionsView`, `DashboardLayout` |
| Phase 5 | ✅ Done | Updated exports, documentation, verified success criteria |

### Success Criteria Verified ✅

All automated checks pass:
- ❌ No `react-router` imports in design system
- ❌ No `fetch`/`axios` calls in design system
- ❌ No store imports in design system
- ❌ No `navigate()` calls in design system
- ❌ No `confirm()` dialogs in design system
- ❌ No `setTimeout` mock API calls in design system

---

## Executive Summary

This plan outlines the systematic extraction of application and business logic from the design system (`/src/design-system`) into the appropriate application layers. The goal is to make the design system consist of **purely presentational, framework-agnostic UI primitives** that can be reused across applications.

**Key Principle**: Logic must be placed in the correct layer based on its nature:
- **Backend** → Security, business rules, data integrity, heavy computation
- **Frontend (App Layer)** → UI orchestration, navigation, local state
- **Design System** → Pure presentation only

---

## Table of Contents

1. [Architectural Principles](#1-architectural-principles)
2. [Frontend vs Backend Logic Decision](#2-frontend-vs-backend-logic-decision)
3. [Current State Analysis](#3-current-state-analysis)
4. [Violation Inventory](#4-violation-inventory)
5. [Target Architecture](#5-target-architecture)
6. [Refactoring Strategy](#6-refactoring-strategy)
7. [Component-by-Component Plan](#7-component-by-component-plan)
8. [New Files to Create](#8-new-files-to-create)
9. [Implementation Order](#9-implementation-order)
10. [Success Criteria](#10-success-criteria)

---

## 1. Architectural Principles

### Non-Negotiable Rules

#### ❌ Design System (`/design-system`) MUST NOT:

| Violation | Example |
|-----------|---------|
| Import react-router | `import { useNavigate } from 'react-router-dom'` |
| Call APIs | `fetch('/api/upload')`, `axios.post()` |
| Mutate Zustand stores | `useFileStore.getState().setFile()` |
| Contain auth logic | `if (user.isAuthenticated)` |
| Perform navigation | `navigate('/dashboard')` |
| Reference domain concepts | `UploadedFile`, `TrainedModel`, `DataQualityReport` |
| Contain business decisions | Pricing logic, feature flags, validation rules |

#### ✅ Design System MAY:

| Allowed | Example |
|---------|---------|
| Accept callbacks | `onClick`, `onSubmit`, `onChange` |
| Manage visual state | `hover`, `focus`, `loading`, `open/closed` |
| Handle accessibility | ARIA attributes, keyboard navigation |
| Emit events upward | `onFileSelect(file)`, `onDismiss()` |
| Contain presentational state | `isExpanded`, `currentPage`, `sortDirection` |

### Where Logic Should Go

| Logic Type | New Location |
|------------|--------------|
| Navigation | Route/page components (`/app/routes/`) |
| API calls | Services (`/services/`) |
| Async UI orchestration | Hooks (`/hooks/`) |
| Global state & actions | Stores (`/stores/`) |
| Feature-specific behavior | Feature components (`/app/features/`) |
| Pure helpers | Utils (`/utils/`) |
| **Security/Auth enforcement** | **Backend (`adaptiva-be`)** |
| **Business rule validation** | **Backend (`adaptiva-be`)** |
| **Heavy computation** | **Backend (`adaptiva-be`)** |
| **Data integrity checks** | **Backend (`adaptiva-be`)** |

### Required Layered Architecture

```
┌─────────────────────────────────────────────┐
│         App (routes, pages, layouts)        │
│  - Orchestrates features                    │
│  - Handles navigation                       │
│  - Connects stores to UI                    │
└─────────────────────┬───────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────┐
│         Hooks (logic orchestration)         │
│  - API call management                      │
│  - Loading/error states                     │
│  - Data transformation                      │
└─────────────────────┬───────────────────────┘
                      │
          ┌───────────┴───────────┐
          ▼                       ▼
┌─────────────────────┐ ┌─────────────────────┐
│  Stores (Zustand)   │ │  Services (API)     │
│  - Global state     │ │  - HTTP clients     │
│  - Actions          │ │  - Request/response │
└─────────────────────┘ └─────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────┐
│         Design System (UI only)             │
│  - Presentational components                │
│  - No business logic                        │
│  - Framework agnostic                       │
└─────────────────────────────────────────────┘
```

> **Rule**: No upward dependencies are allowed.

---

## 2. Frontend vs Backend Logic Decision

### Decision Framework

When extracting logic from the design system, use this framework to determine where it belongs:

```
┌─────────────────────────────────────────────────────────────────┐
│                    LOGIC PLACEMENT DECISION                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Does logic involve...                                          │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Security, Auth, Business Rules, Data Integrity,        │   │
│  │ Heavy Computation, Sensitive Data, Rate Limiting?      │   │
│  └────────────────────────┬────────────────────────────────┘   │
│                           │                                     │
│              ┌────────────┴────────────┐                       │
│              ▼                         ▼                        │
│         YES → BACKEND            NO → Continue                  │
│                                        │                        │
│  ┌─────────────────────────────────────┴───────────────────┐   │
│  │ Is logic UI-focused, responsive, local-only,           │   │
│  │ purely visual, or optimistic UI?                       │   │
│  └────────────────────────┬────────────────────────────────┘   │
│                           │                                     │
│              ┌────────────┴────────────┐                       │
│              ▼                         ▼                        │
│         YES → FRONTEND           MIXED → BOTH                   │
│         (App Layer)              FE orchestrates,               │
│                                  BE enforces                    │
└─────────────────────────────────────────────────────────────────┘
```

### Logic Placement Matrix

| Logic Type | Backend | Frontend | Example |
|------------|:-------:|:--------:|---------|
| **User Authentication** | ✅ | ❌ | Token validation, session management |
| **Authorization/Permissions** | ✅ | 🟡 Display only | "Can user export?" - BE decides, FE hides button |
| **File Upload Processing** | ✅ | ❌ | Parsing CSV/Excel, storing data |
| **File Validation (security)** | ✅ | 🟡 Basic check | File type, size - FE warns, BE rejects |
| **Data Cleaning** | ✅ | ❌ | Missing value imputation, deduplication |
| **Data Quality Analysis** | ✅ | 🟡 Display | Calculate quality score, find issues |
| **ML Model Training** | ✅ | ❌ | Train regression, decision tree models |
| **ML Predictions** | ✅ | ❌ | Run inference on trained models |
| **Chart Data Aggregation** | ✅ | ❌ | GROUP BY, SUM, AVG on large datasets |
| **AI Chart Generation** | ✅ | ❌ | LLM calls, code execution |
| **Export Generation** | ✅ | 🟡 Trigger | PDF/Excel generation |
| **Rate Limiting** | ✅ | 🟡 Display | Enforce limits, show user feedback |
| **Pricing/Plan Logic** | ✅ | 🟡 Display | Check limits, show upgrade prompts |
| **Navigation** | ❌ | ✅ | Route changes |
| **Form Validation (UX)** | 🟡 Final check | ✅ | Required fields, format hints |
| **Loading/Error States** | ❌ | ✅ | Spinners, error messages |
| **Pagination (UI)** | 🟡 Data fetch | ✅ | Page state, display |
| **Sorting/Filtering (small data)** | ❌ | ✅ | Client-side table operations |
| **Sorting/Filtering (large data)** | ✅ | 🟡 Trigger | Server-side operations |
| **Drag & Drop** | ❌ | ✅ | Visual feedback |
| **Modal/Dialog State** | ❌ | ✅ | Open/close state |

**Legend**: ✅ = Primary location | 🟡 = Secondary/Display only | ❌ = Not here

### Existing Backend Services (adaptiva-be)

The backend already provides these services that the frontend should use:

| Backend Service | Endpoint | Purpose |
|-----------------|----------|---------|
| `upload_service` | `POST /api/upload` | File upload & parsing |
| `preview_service` | `GET /api/preview/{file_id}` | Get data preview |
| `cleaning_service` | `POST /api/clean` | Data cleaning operations |
| `insights_service` | `POST /api/insights` | Data analysis & insights |
| `chart_service` | `POST /api/charts/generate` | Manual chart generation |
| `ai_chart_service` | `POST /api/charts/ai-generate` | AI-powered chart generation |
| `ml_service` | `POST /api/ml/train` | ML model training |
| `ml_service` | `POST /api/ml/predict` | Run predictions |
| `export_service` | `POST /api/export` | Export to PDF/Excel/CSV |
| `auth_service` | `POST /api/auth/*` | Authentication |
| `rate_limit_service` | (middleware) | Rate limiting enforcement |

### Logic Currently in Design System → Correct Destination

| Current Logic | In Component | Should Go To |
|---------------|--------------|--------------|
| Mock file processing | `UploadZone.tsx` | **Backend**: `upload_service` |
| Mock data generation | `UploadZone.tsx` | **Remove**: Use real API |
| File validation | `UploadZone.tsx` | **Backend**: Validate, **FE**: Warn |
| Data quality analysis | `utils/dataQuality.ts` | **Backend**: New endpoint |
| Quality score calculation | `DataQualityBanner.tsx` | **Backend**: `insights_service` |
| Chart state management | `ChartGallery.tsx` | **Frontend**: `chartStore` |
| Mock AI chart generation | `ChartCreator.tsx` | **Backend**: `ai_chart_service` |
| Mock model training | `ModelCreator.tsx` | **Backend**: `ml_service` |
| Model state management | `PredictionsView.tsx` | **Frontend**: `predictionStore` |
| Sample CSV download | `EmptyState.tsx` | **Backend**: Static file or endpoint |
| User profile data | `DashboardLayout.tsx` | **Backend**: `auth_service` |
| Pricing/plan info | `DashboardLayout.tsx` | **Backend**: New `billing` endpoint |
| Scroll to element | `EmptyState.tsx` | **Frontend**: Page component |
| Navigation | (various) | **Frontend**: Route components |

### Backend Endpoints to Add

Based on analysis, these new backend endpoints are needed:

| Endpoint | Method | Purpose | Request | Response |
|----------|--------|---------|---------|----------|
| `/api/quality/analyze` | POST | Analyze data quality | `{ file_id, sheet_name? }` | `DataQualityReport` |
| `/api/quality/clean` | POST | Auto-clean data issues | `{ file_id, operations[] }` | `CleaningResult` |
| `/api/user/profile` | GET | Get current user profile | - | `UserProfile` |
| `/api/billing/plans` | GET | Get available plans | - | `Plan[]` |
| `/api/billing/usage` | GET | Get usage stats | - | `UsageStats` |
| `/api/samples/download` | GET | Download sample dataset | `?type=sales` | CSV file |
| `/api/charts` | GET | List user's saved charts | - | `ChartConfig[]` |
| `/api/charts` | POST | Save a chart | `ChartConfig` | `{ id }` |
| `/api/charts/{id}` | DELETE | Delete a chart | - | `{ success }` |
| `/api/models` | GET | List user's trained models | - | `TrainedModel[]` |
| `/api/models/{id}` | DELETE | Delete a model | - | `{ success }` |

---

## 3. Current State Analysis

### Design System Structure

```
design-system/
├── index.ts              # Public exports
├── types.ts              # ⚠️ Contains domain types
├── components/
│   ├── ui/               # ✅ Base UI primitives (clean)
│   ├── charts/           # ⚠️ Contains state management
│   ├── predictions/      # ⚠️ Contains mock API calls
│   ├── DashboardLayout.tsx   # ⚠️ Contains user data, pricing
│   ├── DataPreview.tsx       # 🟡 References domain types
│   ├── DataQualityBanner.tsx # 🟡 References domain types
│   ├── EmptyState.tsx        # ⚠️ Contains DOM manipulation
│   └── UploadZone.tsx        # ⚠️ Contains mock API simulation
└── utils/
    └── dataQuality.ts    # 🟡 Pure algorithm, but domain-specific
```

### What's Already Clean ✅

| Component | Status |
|-----------|--------|
| `components/ui/*` | ✅ Pure presentational primitives |
| `ChartPreview.tsx` | ✅ Renders charts from props |
| `ChartTypeSelector.tsx` | ✅ Pure selection UI |
| `FeatureSelector.tsx` | ✅ Pure multi-select UI |
| `ModelTypeSelector.tsx` | ✅ Pure selection UI |
| `DataValidationWarning.tsx` | ✅ Pure display component |
| `ChartSuggestions.tsx` | ✅ Pure algorithm + display |

---

## 4. Violation Inventory

### Critical Violations (🔴 High Priority)

| Component | Violation | Details |
|-----------|-----------|---------|
| `DashboardLayout.tsx` | Hardcoded user data | "John Doe", "Free Plan" hardcoded |
| `DashboardLayout.tsx` | Pricing/feature content | Upgrade modal with plan details |
| `DashboardLayout.tsx` | Domain types | References `UploadedFile`, `DataQualityReport` |
| `UploadZone.tsx` | Mock API simulation | Contains `setTimeout` simulating upload |
| `UploadZone.tsx` | Mock data generation | Generates fake data with quality issues |
| `EmptyState.tsx` | DOM manipulation | `scrollToUpload()` with `getElementById` |
| `EmptyState.tsx` | File generation | `downloadSample()` creates and downloads CSV |
| `ChartGallery.tsx` | Internal state | Manages `charts[]` with `useState` |
| `ChartCreator.tsx` | Mock API call | Simulates AI chart generation |
| `PredictionsView.tsx` | Internal state | Manages `models[]` with `useState` |
| `ModelCreator.tsx` | Mock training | Simulates model training with `setTimeout` |

### Medium Violations (🟡 Medium Priority)

| Component | Violation | Details |
|-----------|-----------|---------|
| `DataPreview.tsx` | Domain type reference | Uses `UploadedFile` type |
| `DataQualityBanner.tsx` | Domain type reference | Uses `DataQualityReport` type |
| `ChartCard.tsx` | Browser dialog | Uses `confirm()` for delete |
| `ChartCard.tsx` | TODO stubs | Export/duplicate have console.log only |

### Low Priority (🟢 Move Later)

| Item | Issue | Details |
|------|-------|---------|
| `types.ts` | Domain types in design system | Should live in `/src/types` |
| `utils/dataQuality.ts` | Domain utility | Pure function, but domain-specific |

---

## 5. Target Architecture

### Design System After Refactoring

```
design-system/
├── index.ts              # UI component exports only
├── components/
│   ├── ui/               # Base UI primitives (unchanged)
│   ├── AppShell.tsx      # Generic app layout (renamed from DashboardLayout)
│   ├── UploadZone.tsx    # Pure file drop zone
│   ├── EmptyState.tsx    # Generic empty state
│   ├── DataTable.tsx     # Generic data table (renamed from DataPreview)
│   ├── AlertBanner.tsx   # Generic alert banner (renamed from DataQualityBanner)
│   ├── charts/
│   │   ├── ChartCard.tsx      # Stateless chart display
│   │   ├── ChartCreator.tsx   # Stateless chart form
│   │   ├── ChartGallery.tsx   # Stateless chart grid
│   │   └── ...
│   └── predictions/
│       ├── ModelCard.tsx      # Stateless model display
│       ├── ModelCreator.tsx   # Stateless model form
│       └── ...
└── styles/               # Unchanged
```

### Application Layer After Refactoring

```
src/
├── app/
│   ├── layouts/
│   │   └── MainLayout.tsx    # Uses AppShell, handles navigation
│   ├── routes/
│   │   ├── UploadPage.tsx    # Orchestrates upload flow
│   │   ├── ChartsPage.tsx    # Connects to chartStore
│   │   ├── PredictionsPage.tsx
│   │   └── ...
│   └── features/             # NEW: Connected feature components
│       ├── upload/
│       │   └── UploadContainer.tsx
│       ├── charts/
│       │   ├── ChartGalleryContainer.tsx
│       │   └── ChartCreatorContainer.tsx
│       └── predictions/
│           ├── PredictionsContainer.tsx
│           └── ModelCreatorContainer.tsx
├── stores/
│   ├── fileStore.ts          # Existing
│   ├── authStore.ts          # Existing
│   ├── chartStore.ts         # NEW
│   ├── predictionStore.ts    # NEW
│   └── qualityStore.ts       # NEW
├── types/
│   ├── file.ts               # UploadedFile type
│   ├── chart.ts              # ChartConfig type
│   ├── model.ts              # TrainedModel type
│   └── quality.ts            # DataQualityReport type
└── utils/
    └── dataQuality.ts        # Moved from design-system
```

---

## 6. Refactoring Strategy

### Pattern: Extract → Replace → Wire

For each component with violations:

```
1. EXTRACT the logic
   - Identify business logic
   - Create hook, store, or service
   - Move logic there

2. REPLACE logic with props
   - Replace hardcoded behavior with callbacks
   - Replace internal state with props
   - Keep only visual state internal

3. WIRE at application layer
   - Page/feature component supplies callbacks
   - Connects store state to props
   - Design component remains unaware of meaning
```

### Example Transformation

```tsx
// ❌ BEFORE (invalid - in design system)
function UploadButton() {
  const navigate = useNavigate();
  return (
    <Button onClick={() => navigate('/upload')}>
      Upload
    </Button>
  );
}

// ✅ AFTER (valid - in design system)
function UploadButton({ onClick }: { onClick: () => void }) {
  return (
    <Button onClick={onClick}>
      Upload
    </Button>
  );
}

// ✅ WIRING (in app layer)
function UploadPage() {
  const navigate = useNavigate();
  return <UploadButton onClick={() => navigate('/upload')} />;
}
```

---

## 7. Component-by-Component Plan

### 7.1 `DashboardLayout.tsx` → `AppShell.tsx`

**Current Issues:**
- Hardcoded user data ("John Doe", "Free Plan")
- Contains upgrade modal with pricing
- References domain types (`UploadedFile`, `DataQualityReport`)

**Target Props:**
```typescript
interface AppShellProps {
  children: ReactNode;
  
  // Navigation
  navigationItems: Array<{
    icon: LucideIcon;
    label: string;
    id: string;
    active?: boolean;
    disabled?: boolean;
    badge?: { type: 'warning' | 'info'; text?: string };
  }>;
  onNavigationItemClick?: (id: string) => void;
  
  // Sidebar content
  sidebarFooter?: ReactNode;
  sidebarCollapsible?: boolean;
  
  // Header
  headerTitle: string;
  headerSubtitle?: string;
  headerActions?: ReactNode;
  
  // User menu (render prop)
  userMenu?: ReactNode;
  
  // Branding
  brandName?: string;
  brandIcon?: ReactNode;
}
```

**Changes Required:**
1. Rename file to `AppShell.tsx`
2. Remove `uploadedFile` and `qualityReport` props
3. Make navigation items fully configurable via props
4. Extract upgrade modal to separate component in `/app/features/billing/`
5. Remove user info - pass via `userMenu` render prop
6. Remove quality badge logic - pass via `navigationItems[].badge`

**New Wrapper Location:** `/src/app/layouts/MainLayout.tsx`
- Constructs navigation items from current route
- Handles `onNavigationItemClick` → `navigate()`
- Renders user menu from `useAuthStore`
- Computes navigation badges from file/quality stores

---

### 7.2 `UploadZone.tsx`

**Current Issues:**
- Contains mock data generation (150 rows of fake data)
- Contains file processing simulation with `setTimeout`
- Has internal upload progress state that should be external

**Target Props:**
```typescript
interface UploadZoneProps {
  // File selection (required)
  onFileSelect: (file: File) => void;
  
  // Configuration
  acceptedFormats?: string[];  // Default: ['.csv', '.xlsx', '.xls']
  maxFileSize?: number;        // Default: 10MB
  
  // External state
  isLoading?: boolean;
  uploadProgress?: number;     // 0-100
  error?: string | null;
  uploadedFileName?: string | null;
  
  // Actions
  onClearError?: () => void;
  
  // Optional: Sample datasets
  sampleDatasets?: Array<{
    icon: LucideIcon;
    name: string;
    description: string;
    onClick: () => void;
  }>;
}
```

**Changes Required:**
1. Remove `processFile()` function entirely
2. Remove mock data generation
3. Remove internal `isUploading`, `uploadProgress` state
4. Keep only drag state (`isDragging`) as internal visual state
5. Call `onFileSelect(file)` immediately when file is dropped/selected

**Move to Hook:** `/src/hooks/useFileUpload.ts`
- File validation logic
- Upload progress tracking via API
- Error handling

---

### 7.3 `EmptyState.tsx`

**Current Issues:**
- Contains `scrollToUpload()` with DOM `getElementById`
- Contains `downloadSample()` that creates Blob and triggers download

**Target Props:**
```typescript
interface EmptyStateProps {
  // Content
  icon?: ReactNode;
  title?: string;
  description?: string;
  
  // Actions (callbacks, not implementations)
  primaryAction?: {
    label: string;
    icon?: ReactNode;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    icon?: ReactNode;
    onClick: () => void;
  };
  
  // Features grid
  features?: Array<{
    icon: LucideIcon;
    title: string;
    description: string;
    color: string;  // Tailwind gradient class
  }>;
  showFeatures?: boolean;
}
```

**Changes Required:**
1. Remove `scrollToUpload()` function
2. Remove `downloadSample()` function
3. Replace hardcoded buttons with `primaryAction`/`secondaryAction` props
4. Keep features configurable but provide defaults

**Move to Page:** `/src/app/routes/UploadPage.tsx`
```typescript
const handleScrollToUpload = () => {
  document.getElementById('upload-zone')?.scrollIntoView({ behavior: 'smooth' });
};

const handleDownloadSample = () => {
  // CSV generation logic
};

<EmptyState
  primaryAction={{ label: 'Upload Your Data', onClick: handleScrollToUpload }}
  secondaryAction={{ label: 'Download Sample', onClick: handleDownloadSample }}
/>
```

---

### 7.4 `DataPreview.tsx` → `DataTable.tsx`

**Current Issues:**
- References `UploadedFile` type
- Tightly coupled to file concept

**Target Props:**
```typescript
interface DataTableProps {
  // File info (generic naming)
  title: string;
  subtitle?: string;
  
  // Data
  data: Record<string, unknown>[];
  headers: string[];
  
  // Stats (optional)
  stats?: Array<{ label: string; value: string | number }>;
  
  // Sheets (optional)
  sheets?: string[];
  activeSheet?: string;
  onSheetChange?: (sheet: string) => void;
  
  // Actions
  actions?: ReactNode;  // Slot for action buttons
  
  // Pagination (internal but configurable)
  defaultRowsPerPage?: number;
  rowsPerPageOptions?: number[];
}
```

**Changes Required:**
1. Rename to `DataTable.tsx`
2. Replace `file: UploadedFile` with individual props
3. Move file-specific rendering to wrapper component
4. Keep pagination, sorting, search as internal visual state

---

### 7.5 `DataQualityBanner.tsx` → `AlertBanner.tsx`

**Current Issues:**
- Tightly coupled to `DataQualityReport` type
- Contains quality-specific logic

**Target Props:**
```typescript
interface AlertBannerProps {
  // Icon
  icon?: ReactNode;
  
  // Content
  title: string;
  description: string;
  
  // Score/progress (optional)
  score?: {
    value: number;      // 0-100
    label?: string;
  };
  
  // Tags/badges
  tags?: Array<{
    icon?: ReactNode;
    label: string;
  }>;
  
  // CTA
  cta?: {
    title: string;
    description?: string;
    buttonLabel: string;
    onClick: () => void;
  };
  
  // Dismissible
  onDismiss?: () => void;
  
  // Styling
  variant?: 'info' | 'warning' | 'success' | 'error';
}
```

**Changes Required:**
1. Rename to `AlertBanner.tsx`
2. Remove `DataQualityReport` dependency
3. Make fully generic with props
4. Keep dismiss state internal

**Wrapper Location:** `/src/app/features/quality/DataQualityBanner.tsx`
- Transforms `DataQualityReport` to `AlertBannerProps`

---

### 7.6 `ChartGallery.tsx`

**Current Issues:**
- Manages `charts[]` array internally with `useState`
- Should receive charts from store

**Target Props:**
```typescript
interface ChartGalleryProps {
  // Data
  charts: ChartConfig[];
  headers: string[];
  data: Record<string, unknown>[];
  
  // State flags
  isCreating: boolean;
  editingChart: ChartConfig | null;
  viewMode: 'grid' | 'list';
  
  // Actions
  onCreateChart: () => void;
  onEditChart: (chart: ChartConfig) => void;
  onDeleteChart: (id: string) => void;
  onChartCreated: (chart: ChartConfig) => void;
  onCancelCreate: () => void;
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onExportAll: () => void;
}
```

**Changes Required:**
1. Remove `useState` for charts
2. Remove internal `showCreator`, `editingChart` state
3. All state passed via props
4. All actions via callbacks

**Wire in:** `/src/app/routes/ChartsPage.tsx` using `useChartStore`

---

### 7.7 `ChartCreator.tsx`

**Current Issues:**
- Contains mock AI generation with `setTimeout`
- Manages form state internally (acceptable)

**Target Props:**
```typescript
interface ChartCreatorProps {
  // Data
  headers: string[];
  data: Record<string, unknown>[];
  
  // Callbacks
  onChartCreated: (chart: ChartConfig) => void;
  onClose?: () => void;
  
  // AI generation (external)
  onAIGenerate?: (prompt: string) => Promise<ChartConfig | null>;
  isGenerating?: boolean;
}
```

**Changes Required:**
1. Remove mock `handleAIGenerate()` implementation
2. Call `onAIGenerate?.(prompt)` and wait for result
3. Keep form state (chartType, xAxis, yAxis, etc.) internal

**Move to Hook:** `/src/hooks/useChartAI.ts`
- API call to chart generation endpoint
- Loading state management

---

### 7.8 `ChartCard.tsx`

**Current Issues:**
- Uses `confirm()` browser dialog for delete
- Has TODO stubs for export/duplicate

**Target Props:**
```typescript
interface ChartCardProps {
  chart: ChartConfig;
  viewMode?: 'grid' | 'list';
  
  // Actions (caller handles confirmation)
  onEdit: (chart: ChartConfig) => void;
  onDelete: (id: string) => void;
  onExport?: (chart: ChartConfig) => void;
  onDuplicate?: (chart: ChartConfig) => void;
  onFullscreen?: (chart: ChartConfig) => void;
}
```

**Changes Required:**
1. Remove `confirm()` call - just call `onDelete(id)`
2. Remove TODO implementations
3. Call optional callbacks if provided

---

### 7.9 `PredictionsView.tsx`

**Current Issues:**
- Manages `models[]` array internally with `useState`

**Target Props:**
```typescript
interface PredictionsViewProps {
  // Data
  models: TrainedModel[];
  headers: string[];
  data: Record<string, unknown>[];
  
  // State
  isCreating: boolean;
  
  // Actions
  onCreateModel: () => void;
  onModelCreated: (model: TrainedModel) => void;
  onDeleteModel: (id: string) => void;
  onCancelCreate: () => void;
}
```

**Changes Required:**
1. Remove `useState` for models
2. Remove internal `isCreating` state
3. All via props/callbacks

---

### 7.10 `ModelCreator.tsx`

**Current Issues:**
- Contains mock model training with `setTimeout`

**Target Props:**
```typescript
interface ModelCreatorProps {
  headers: string[];
  data: Record<string, unknown>[];
  
  onModelCreated: (model: TrainedModel) => void;
  onCancel: () => void;
  
  // External training handler
  onTrain?: (config: ModelTrainingConfig) => Promise<TrainedModel>;
  isTraining?: boolean;
}
```

**Changes Required:**
1. Remove mock training implementation
2. Call `onTrain?.(config)` with form values
3. Keep form state internal

**Move to Hook:** `/src/hooks/useModelTraining.ts`

---

## 8. New Files to Create

### Stores

| File | Purpose |
|------|---------|
| `/src/stores/chartStore.ts` | Zustand store for charts |
| `/src/stores/predictionStore.ts` | Zustand store for ML models |
| `/src/stores/qualityStore.ts` | Zustand store for data quality |

#### `chartStore.ts` Template
```typescript
import { create } from 'zustand';

interface ChartConfig {
  id: string;
  title: string;
  type: 'bar' | 'line' | 'pie' | 'scatter' | 'area' | 'composed';
  xAxis?: string;
  yAxis?: string | string[];
  data: Record<string, unknown>[];
  colors?: string[];
  prompt?: string;
  createdAt: Date;
}

interface ChartState {
  charts: ChartConfig[];
  isCreating: boolean;
  editingChart: ChartConfig | null;
  viewMode: 'grid' | 'list';
  
  // Actions
  addChart: (chart: ChartConfig) => void;
  updateChart: (chart: ChartConfig) => void;
  deleteChart: (id: string) => void;
  setEditing: (chart: ChartConfig | null) => void;
  setCreating: (creating: boolean) => void;
  setViewMode: (mode: 'grid' | 'list') => void;
}

export const useChartStore = create<ChartState>((set) => ({
  charts: [],
  isCreating: false,
  editingChart: null,
  viewMode: 'grid',
  
  addChart: (chart) => set((state) => ({ 
    charts: [...state.charts, chart],
    isCreating: false,
  })),
  updateChart: (chart) => set((state) => ({
    charts: state.charts.map((c) => c.id === chart.id ? chart : c),
    editingChart: null,
  })),
  deleteChart: (id) => set((state) => ({
    charts: state.charts.filter((c) => c.id !== id),
  })),
  setEditing: (chart) => set({ editingChart: chart, isCreating: !!chart }),
  setCreating: (creating) => set({ isCreating: creating }),
  setViewMode: (mode) => set({ viewMode: mode }),
}));
```

### Types

| File | Types |
|------|-------|
| `/src/types/chart.ts` | `ChartConfig` |
| `/src/types/model.ts` | `TrainedModel`, `ModelTrainingConfig` |
| `/src/types/quality.ts` | `DataQualityReport`, `DataQualityIssue`, `ColumnIssue` |

### Hooks

| File | Purpose |
|------|---------|
| `/src/hooks/useChartAI.ts` | AI chart generation |
| `/src/hooks/useModelTraining.ts` | ML model training |
| `/src/hooks/useDataQuality.ts` | Data quality analysis |

### Feature Containers

| File | Purpose |
|------|---------|
| `/src/app/features/charts/ChartGalleryContainer.tsx` | Connects ChartGallery to store |
| `/src/app/features/predictions/PredictionsContainer.tsx` | Connects PredictionsView to store |
| `/src/app/features/billing/UpgradeModal.tsx` | Upgrade modal extracted from DashboardLayout |

### Utils

| File | Purpose |
|------|---------|
| `/src/utils/dataQuality.ts` | Moved from design-system |
| `/src/utils/sampleData.ts` | Sample CSV generation |

---

## 8. Implementation Order

### Phase 1: Preparation (Non-Breaking)

| Step | Task | Files |
|------|------|-------|
| 1.1 | Create new stores | `chartStore.ts`, `predictionStore.ts`, `qualityStore.ts` |
| 1.2 | Move types to `/src/types` | `chart.ts`, `model.ts`, `quality.ts` |
| 1.3 | Move utils to `/src/utils` | `dataQuality.ts` |
| 1.4 | Update imports in existing files | Various |

### Phase 2: Low-Risk Components

| Step | Task | Risk |
|------|------|------|
| 2.1 | Refactor `EmptyState.tsx` | 🟢 Low |
| 2.2 | Refactor `DataQualityBanner.tsx` | 🟢 Low |
| 2.3 | Refactor `ChartCard.tsx` | 🟢 Low |

### Phase 3: Medium-Risk Components

| Step | Task | Risk |
|------|------|------|
| 3.1 | Refactor `DataPreview.tsx` | 🟡 Medium |
| 3.2 | Refactor `UploadZone.tsx` | 🟡 Medium |
| 3.3 | Refactor `ChartCreator.tsx` | 🟡 Medium |
| 3.4 | Refactor `ModelCreator.tsx` | 🟡 Medium |

### Phase 4: High-Risk Components

| Step | Task | Risk |
|------|------|------|
| 4.1 | Refactor `ChartGallery.tsx` | 🔴 High |
| 4.2 | Refactor `PredictionsView.tsx` | 🔴 High |
| 4.3 | Refactor `DashboardLayout.tsx` → `AppShell.tsx` | 🔴 High |

### Phase 5: Cleanup

| Step | Task |
|------|------|
| 5.1 | Update design-system `index.ts` exports |
| 5.2 | Update design-system `README.md` |
| 5.3 | Remove dead code |
| 5.4 | Add deprecation notices if needed |

---

## 9. Success Criteria

After refactoring, the design system must pass these checks:

### Automated Checks

```bash
# No react-router imports
grep -r "react-router" src/design-system/
# Should return: (no matches)

# No fetch/axios calls
grep -r "fetch\|axios" src/design-system/
# Should return: (no matches)

# No store imports
grep -r "useFileStore\|useAuthStore\|useChartStore" src/design-system/
# Should return: (no matches)

# No navigate calls
grep -r "useNavigate\|navigate(" src/design-system/
# Should return: (no matches)
```

