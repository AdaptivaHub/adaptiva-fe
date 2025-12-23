# Design System

Adaptiva's UI component library - reusable components, styles, and utilities.

## Structure

```
design-system/
├── index.ts              # Public exports
├── types.ts              # Shared TypeScript types
├── components/
│   ├── ui/               # Base UI primitives (shadcn/ui based)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── progress.tsx
│   │   ├── badge.tsx
│   │   ├── tabs.tsx
│   │   └── ...
│   ├── DashboardLayout.tsx   # Main app layout with sidebar
│   ├── DataPreview.tsx       # Data table with pagination
│   ├── DataQualityBanner.tsx # Quality issues banner
│   ├── EmptyState.tsx        # Empty/placeholder states
│   └── UploadZone.tsx        # File upload dropzone
├── styles/
│   ├── index.css         # Main stylesheet
│   ├── tailwind.css      # Tailwind imports
│   ├── theme.css         # CSS variables & theming
│   └── fonts.css         # Font definitions
└── utils/
    └── dataQuality.ts    # Data quality analysis utilities
```

## Components

### UI Primitives (`components/ui/`)

Base components built on shadcn/ui and Radix UI:

| Component | Description |
|-----------|-------------|
| `Button` | Primary, secondary, ghost, destructive variants |
| `Card` | Container with header, content, footer |
| `Input` | Text input with label support |
| `Select` | Dropdown select |
| `Tabs` | Tab navigation |
| `Progress` | Progress bar |
| `Badge` | Status badges |
| `Dialog` | Modal dialogs |
| `Tooltip` | Hover tooltips |

### Feature Components

| Component | Description | Key Props |
|-----------|-------------|-----------|
| `DashboardLayout` | App shell with sidebar nav | `children` |
| `DataPreview` | Paginated data table | `file`, `data`, `headers`, `onSheetChange` |
| `DataQualityBanner` | Shows quality issues | `report` or `issues`+`qualityScore`, `onClean` |
| `EmptyState` | Empty/welcome states | `icon`, `title`, `description`, `action` |
| `UploadZone` | File upload dropzone | `onFileSelect`, `isLoading`, `isDragActive` |

## Usage

### Import from index (recommended)
```typescript
import { Button, Card, EmptyState } from '@design/components/EmptyState';
// or
import { Button } from '@/design-system';
```

### Direct imports
```typescript
import { Button } from '@design/components/ui/button';
import { DashboardLayout } from '@design/components/DashboardLayout';
```

## Types

Defined in `types.ts`:

```typescript
interface UploadedFile {
  fileName: string;
  rowCount: number;
  columnCount: number;
  sheets?: string[];
  activeSheet?: string;
}

interface ChartConfig {
  type: string;
  data: unknown;
  layout?: unknown;
}

interface TrainedModel {
  modelId: string;
  targetColumn: string;
  features: string[];
  accuracy?: number;
}
```

## Styling

### Tailwind CSS
All components use Tailwind CSS utility classes. Theme colors are defined as CSS variables in `styles/theme.css`.

### Key Design Tokens
- Primary: Indigo/Purple gradient (`from-indigo-500 to-purple-600`)
- Background: Slate-50
- Card backgrounds: White with subtle shadows
- Text: Slate-900 (headings), Slate-600 (body)

## Adding Components

1. Create component in appropriate folder:
   - `components/ui/` for base primitives
   - `components/` for feature components

2. Follow the pattern:
```typescript
// components/NewComponent.tsx
import { Card } from './ui/card';

export interface NewComponentProps {
  title: string;
  children: React.ReactNode;
}

export function NewComponent({ title, children }: NewComponentProps) {
  return (
    <Card>
      <h2>{title}</h2>
      {children}
    </Card>
  );
}
```

3. Export from `index.ts`:
```typescript
export { NewComponent } from './components/NewComponent';
export type { NewComponentProps } from './components/NewComponent';
```

## Origin

This design system was originally developed in `adaptiva-design` and has been integrated directly into `adaptiva-fe`. Components can be modified directly in this folder.
