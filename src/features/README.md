# Features

Feature-level components that combine business logic with UI.

> **Architecture Principle**: These components wire together hooks, stores, services, and design-system UI components. They contain business logic, state management integration, and API calls.

## Distinction from Design System

| Layer | Location | Purpose |
|-------|----------|---------|
| **Features** | `src/features/` | Business logic + UI wiring |
| **Design System** | `src/design-system/components/` | Pure presentational UI |

## What Features MAY do:
- ✅ Import and use hooks (`useAuth`, `useFileUpload`, etc.)
- ✅ Import and use stores (Zustand)
- ✅ Make API calls (via services)
- ✅ Handle navigation (React Router)
- ✅ Compose design-system components

## What Features SHOULD do:
- 🎯 Wrap design-system components with business logic
- 🎯 Pass data from hooks/stores to presentational components
- 🎯 Handle user interactions that require API calls

## Components

| Component | Description |
|-----------|-------------|
| `AuthModal` | Login/register modal with auth context integration |
| `Upload` | File upload with `useFileUpload` hook |
| `Preview` | Data preview with pagination |
| `Controls` | User input controls for data operations |
| `ChartEditor` | Chart configuration with AI suggestion support |
| `ChartView` | Chart rendering with Plotly integration |
| `ResultsPanel` | Display cleaned data, insights, predictions |
| `RateLimitBanner` | Rate limit warning for unauthenticated users |
| `UserMenu` | User account dropdown menu |

## Migration Goal

Feature components should progressively adopt design-system components:

```tsx
// ❌ Before: Custom HTML/CSS
export function Upload() {
  return <div className="upload-zone">...</div>;
}

// ✅ After: Wraps design-system component
import { UploadZone } from '@design/components/UploadZone';

export function Upload() {
  const { uploadFile, isLoading } = useFileUpload();
  return <UploadZone onFileSelect={uploadFile} isLoading={isLoading} />;
}
```
