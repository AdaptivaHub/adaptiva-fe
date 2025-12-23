# Design System

Adaptiva's UI component library - **purely presentational** components, styles, and utilities.

> **Architecture Principle**: This design system contains NO business logic, API calls, navigation, or state management. All such logic belongs in the app layer (`/src/app`), stores (`/src/stores`), or backend.

## Design Principles

### ✅ Design System MAY:
- Accept callbacks (`onClick`, `onSubmit`, `onChange`)
- Manage visual state (`hover`, `focus`, `loading`, `open/closed`)
- Handle accessibility (ARIA attributes, keyboard navigation)
- Emit events upward (`onFileSelect(file)`, `onDismiss()`)

### ❌ Design System MUST NOT:
- Import react-router or call navigation
- Make API calls (fetch/axios)
- Import or mutate Zustand stores
- Contain business logic or domain rules
- Use browser dialogs (`confirm()`, `alert()`)

## Structure

```
design-system/
├── index.ts              # Public exports
├── types.ts              # Generic UI types (not domain types)
├── components/
│   ├── ui/               # Base UI primitives (shadcn/ui based)
│   ├── charts/           # Chart visualization components
│   ├── predictions/      # ML model UI components
│   ├── DashboardLayout.tsx   # App shell (generic layout)
│   ├── DataPreview.tsx       # Data table with pagination
│   ├── DataQualityBanner.tsx # Alert banner for issues
│   ├── EmptyState.tsx        # Empty/placeholder states
│   └── UploadZone.tsx        # File upload dropzone
├── styles/
│   └── ...
└── utils/
    └── dataQuality.ts    # Pure data analysis functions
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
| `DashboardLayout` | App shell with sidebar | `navigationItems`, `fileInfo`, `userInfo`, callbacks |
| `DataPreview` | Paginated data table | `file`, `data`, `headers`, `onSheetChange` |
| `DataQualityBanner` | Alert banner with score | `issues`, `qualityScore`, `onAction`, `onDismiss` |
| `EmptyState` | Empty/welcome states | `icon`, `title`, `description`, `onUploadClick`, `onDownloadSample` |
| `UploadZone` | File upload dropzone | `onFileSelect`, `isLoading`, `uploadProgress`, `error` |
| `ChartGallery` | Chart grid/list view | `charts`, `viewMode`, callbacks for CRUD |
| `ChartCreator` | Chart creation form | `headers`, `data`, `onChartCreated`, `onAIGenerate` |
| `ChartCard` | Individual chart display | `chart`, `onEdit`, `onDelete`, `onExport` |
| `PredictionsView` | ML models view | `models`, `isCreating`, `onTrainModel` |
| `ModelCreator` | Model training form | `headers`, `data`, `onTrainModel`, `isTraining` |

## Usage

### Import from index (recommended)
```typescript
import { 
  Button, 
  Card, 
  EmptyState, 
  DashboardLayout,
  ChartGallery,
  type ChartConfig 
} from '@/design-system';
```

### Controlled Components Pattern

All feature components are **controlled** - they receive state via props and emit events via callbacks:

```typescript
// App layer controls state
const [charts, setCharts] = useState<ChartConfig[]>([]);
const [showCreator, setShowCreator] = useState(false);

// Design system renders UI
<ChartGallery
  charts={charts}
  showCreator={showCreator}
  onCreateClick={() => setShowCreator(true)}
  onDeleteChart={(id) => setCharts(c => c.filter(x => x.id !== id))}
  onChartCreated={(config) => {
    // App layer calls API, updates store, etc.
  }}
/>
```

## Types

Key types exported from the design system:

```typescript
// Generic UI types
interface NavigationItem { icon, label, view, disabled?, hasWarning? }
interface UserInfo { name, initials, plan? }
interface FileInfo { fileName, rowCount, qualityScore?, qualityLabel? }
interface BannerIssue { type, count, severity? }
interface SampleDataset { id, name, description, colorScheme }

// Chart types
interface ChartConfig { id, title, type, xAxis?, yAxis?, data, colors?, prompt?, createdAt }
interface ChartCreationConfig { title, type, xAxis?, yAxis?, prompt? }

// Model types  
interface ModelTrainingRequest { name, type, targetVariable, features, trainSize, ... }
```

## Styling

Uses Tailwind CSS with custom theme variables defined in `/styles/theme.css`.
