# Charts Implementation Plan

**Goal:** Migrate the chart components from the design-system prototype into the main `ChartsPage.tsx`, adding full API integration and removing business logic from the design-system components.

---

## Current State Analysis

### Design-System Chart Components (Prototype)

The following components exist in `src/design-system/components/charts/`:

| Component | Purpose | Current Logic |
|-----------|---------|---------------|
| `ChartGallery` | Gallery view with grid/list modes, CRUD operations | View mode state, conditional rendering |
| `ChartCreator` | Form for creating charts (AI + manual) | Form state, validation, callback coordination |
| `ChartCard` | Individual chart card with actions | Action handlers, date formatting |
| `ChartPreview` | ~~Recharts-based~~ **DELETE** - Replace with Plotly | Chart type switching, config generation |
| `ChartTypeSelector` | Visual chart type picker | None (pure presentational) |
| `ChartSuggestions` | Smart AI suggestions based on data | Data analysis for suggestions |

### Main App ChartsPage (Current)

- Simple single-chart generation with AI
- Uses `react-plotly.js` for rendering API-generated charts
- No gallery, no manual chart creation, no persistence

### Existing API Support

| Endpoint | Purpose | Notes |
|----------|---------|-------|
| `POST /charts/ai` | AI-powered chart generation | Returns Plotly JSON |
| `POST /charts/` | Manual chart generation | Accepts x_column, y_column, chart_type, etc. |

---

## Component Functionality Summary

### 1. ChartGallery

**Purpose:** Main container for viewing and managing multiple saved charts.

**Features:**
- Grid and list view modes (toggle button)
- "Create Chart" button to open creator
- "Export All" button for batch export
- Empty state with CTA
- Chart count display

**User Interactions:**
- Toggle between grid/list view
- Click "Create Chart" → opens `ChartCreator`
- Click "Export All" → triggers bulk export
- Charts are rendered via `ChartCard`

**Props (currently controlled):**
- `charts: ChartConfig[]` - List of saved charts
- `viewMode: 'grid' | 'list'`
- `showCreator: boolean`
- `editingChart: ChartConfig | null`
- `isGenerating: boolean`
- Callbacks: `onViewModeChange`, `onCreateClick`, `onChartCreated`, `onAIGenerate`, `onDeleteChart`, `onEditChart`, `onExportChart`, `onDuplicateChart`, `onFullscreenChart`, `onCloseCreator`, `onExportAll`

---

### 2. ChartCreator

**Purpose:** Form interface for creating charts via AI or manual configuration.

**Features:**
- AI prompt input with "Generate" button (Enter key support)
- Manual configuration: title, chart type, X-axis, Y-axis dropdowns
- Live preview via `ChartPreview`
- Smart suggestions via `ChartSuggestions`
- Two-column layout (controls + preview)

**User Interactions:**
- Type AI prompt → press Enter or click "Generate" → triggers AI chart generation
- Select chart type (bar/line/area/pie/scatter/composed)
- Select X-axis and Y-axis from data headers
- Enter chart title
- Click "Create Chart" for manual creation
- Preview updates live as configuration changes

**Props:**
- `headers: string[]` - Column names from data
- `data: Record<string, unknown>[]` - Data for preview
- `onChartCreated: (config, data) => void` - Manual creation callback
- `onAIGenerate?: (prompt, config) => void` - AI generation callback
- `isGenerating?: boolean` - Loading state for AI
- `onClose?: () => void`

**Logic to Move to App Layer:**
- AI generation API call
- Chart persistence (add to gallery)
- Error handling and toast notifications

---

### 3. ChartCard

**Purpose:** Display a single chart with preview and action buttons.

**Features:**
- Chart preview thumbnail
- Title, type badge, AI-generated badge, date
- Dropdown menu: Edit, Export, Duplicate, Fullscreen, Delete
- Quick action buttons on hover (Edit, Export)
- Grid and list view layouts

**User Interactions:**
- Hover → reveal quick action buttons
- Click dropdown → menu with actions
- Click Edit → opens creator in edit mode
- Click Delete → triggers delete callback (app handles confirmation)
- Click Export → downloads chart
- Click Duplicate → creates copy
- Click Fullscreen → opens fullscreen modal

**Props:**
- `chart: ChartConfig` - Chart data and configuration
- `onEdit`, `onDelete`, `onExport`, `onDuplicate`, `onFullscreen` callbacks
- `viewMode: 'grid' | 'list'`

---

### 4. ChartPreview → **DELETE (Replace with PlotlyChart)**

**Status:** ⚠️ **TO BE DELETED** - This component uses Recharts and will be replaced.

**Current Purpose:** Live Recharts-based preview of chart configuration.

**Replacement:** Create a new `PlotlyChart` component that:
- Accepts Plotly JSON from API responses
- Uses `react-plotly.js` for rendering
- Supports responsive sizing
- Provides loading and empty states

**New PlotlyChart Props:**
```typescript
interface PlotlyChartProps {
  /** Plotly JSON data and layout from API */
  chartJson?: {
    data: Plotly.Data[];
    layout?: Partial<Plotly.Layout>;
  };
  /** Chart title (used if not in layout) */
  title?: string;
  /** Height of the chart */
  height?: number | string;
  /** Whether chart is loading */
  loading?: boolean;
  /** Plotly config options */
  config?: Partial<Plotly.Config>;
}
```

**User Interactions:**
- Hover on data points shows Plotly tooltip
- Zoom, pan, and other Plotly interactivity
- Download chart as PNG via Plotly toolbar

---

### 5. ChartTypeSelector

**Purpose:** Visual grid of chart type options.

**Features:**
- 3x2 grid of chart type buttons
- Icon + label for each type
- Selected state highlight

**User Interactions:**
- Click chart type → selects that type

**Props:**
- `value: ChartType`
- `onChange: (type: ChartType) => void`

**Status:** ✅ Purely presentational - no logic to remove.

---

### 6. ChartSuggestions

**Purpose:** Smart suggestions based on data analysis.

**Features:**
- Analyzes column types (numeric, text, date)
- Suggests relevant chart types and prompts
- Clickable suggestion pills

**User Interactions:**
- Click suggestion → populates AI prompt and sets chart type

**Props:**
- `headers: string[]`
- `data: Record<string, unknown>[]`
- `onSuggestionClick: (suggestion) => void`

**Logic to Keep in Design System:**
- Suggestion generation logic is purely data-driven, no API calls
- Can remain as-is (it's deterministic based on data shape)

---

## Data Types

### ChartConfig (for saved charts)
```typescript
interface ChartConfig {
  id: string;
  title: string;
  type: 'bar' | 'line' | 'pie' | 'scatter' | 'area' | 'histogram' | 'box';
  xAxis?: string;
  yAxis?: string;
  /** Plotly JSON from API - required for rendering */
  chartJson: {
    data: Plotly.Data[];
    layout?: Partial<Plotly.Layout>;
  };
  prompt?: string;  // If AI-generated
  explanation?: string;  // AI explanation
  createdAt: Date;
}
```

### ChartCreationConfig (for creating)
```typescript
interface ChartCreationConfig {
  title: string;
  type: ChartConfig['type'];
  xAxis?: string;
  yAxis?: string;
  prompt?: string;
}
```

> **Note:** Unlike the Recharts-based prototype, we no longer store raw `data` on charts. All charts are rendered using Plotly JSON returned from the API. This simplifies the data model and ensures consistent rendering.

---

## Implementation Tasks

### Phase 1: Prepare Design-System Components

1. **Remove logic from ChartSuggestions** (optional - logic is pure/deterministic)
   - Keep as-is since it doesn't make API calls

2. **Ensure ChartCreator is fully controlled**
   - ✅ Already uses callbacks for all actions
   - Verify all state flows through props

3. **Export all chart components from design-system index**
   - Add to `src/design-system/components/index.ts`

### Phase 2: Create Charts Store

Create `src/stores/chartStore.ts`:

```typescript
interface ChartState {
  charts: ChartConfig[];
  viewMode: 'grid' | 'list';
  showCreator: boolean;
  editingChart: ChartConfig | null;
  
  // Actions
  addChart: (chart: ChartConfig) => void;
  updateChart: (id: string, updates: Partial<ChartConfig>) => void;
  deleteChart: (id: string) => void;
  duplicateChart: (id: string) => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  setShowCreator: (show: boolean) => void;
  setEditingChart: (chart: ChartConfig | null) => void;
}
```

### Phase 3: Update ChartsPage.tsx

Replace current implementation with:

```typescript
function ChartsPage() {
  const navigate = useNavigate();
  const metadata = useFileStore(state => state.metadata);
  const { data, headers } = useFileStore();
  const { generateChart, generateManualChart, loading } = useChart();
  
  // Chart store
  const { 
    charts, viewMode, showCreator, editingChart,
    addChart, deleteChart, duplicateChart,
    setViewMode, setShowCreator, setEditingChart 
  } = useChartStore();

  // No file uploaded - show empty state
  if (!metadata) {
    return <EmptyState ... />;
  }

  // Handle AI chart generation
  const handleAIGenerate = async (prompt: string, config: ChartCreationConfig) => {
    const result = await generateChart(metadata.fileId, prompt, metadata.activeSheet);
    if (result) {
      addChart({
        id: crypto.randomUUID(),
        title: config.title,
        type: config.type,
        xAxis: config.xAxis,
        yAxis: config.yAxis,
        prompt,
        chartJson: result.chartJson as { data: Plotly.Data[]; layout?: Partial<Plotly.Layout> },
        explanation: result.explanation,
        createdAt: new Date(),
      });
      setShowCreator(false);
      toast.success('Chart generated!');
    }
  };

  // Handle manual chart creation - still calls API to get Plotly JSON
  const handleManualCreate = async (config: ChartCreationConfig) => {
    const result = await generateManualChart(metadata.fileId, {
      chart_type: config.type,
      x_column: config.xAxis,
      y_column: config.yAxis,
      title: config.title,
    }, metadata.activeSheet);
    
    if (result) {
      addChart({
        id: crypto.randomUUID(),
        title: config.title,
        type: config.type,
        xAxis: config.xAxis,
        yAxis: config.yAxis,
        chartJson: result.chartJson as { data: Plotly.Data[]; layout?: Partial<Plotly.Layout> },
        createdAt: new Date(),
      });
      setShowCreator(false);
      toast.success('Chart created!');
    }
  };

  // Handle export using Plotly's built-in export
  const handleExportChart = async (chart: ChartConfig) => {
    // Plotly.downloadImage() can be called on the chart
    // Or use toImage() to get a blob for custom handling
  };

  return (
    <ChartGallery
      headers={headers}
      data={data}
      charts={charts}
      viewMode={viewMode}
      showCreator={showCreator}
      editingChart={editingChart}
      isGenerating={loading}
      onViewModeChange={setViewMode}
      onCreateClick={() => setShowCreator(true)}
      onChartCreated={handleManualCreate}
      onAIGenerate={handleAIGenerate}
      onDeleteChart={(id) => {
        if (confirm('Delete this chart?')) deleteChart(id);
      }}
      onEditChart={setEditingChart}
      onExportChart={handleExportChart}
      onDuplicateChart={(chart) => duplicateChart(chart.id)}
      onFullscreenChart={(chart) => {/* open modal */}}
      onCloseCreator={() => setShowCreator(false)}
      onExportAll={() => {/* bulk export */}}
    />
  );
}
```

> **Key Change:** Both AI and manual chart creation call the API to get Plotly JSON. There is no client-side chart rendering from raw data.

### Phase 4: Standardize on Plotly (Remove Recharts)

**Decision:** All chart rendering will use Plotly via `react-plotly.js`. Recharts will be completely removed.

#### 4.1 Delete ChartPreview Component

Delete `src/design-system/components/charts/ChartPreview.tsx` - this Recharts-based component is no longer needed.

#### 4.2 Create PlotlyChart Component

Create `src/design-system/components/charts/PlotlyChart.tsx`:

```typescript
import Plot from 'react-plotly.js';
import { Loader2 } from 'lucide-react';

interface PlotlyChartProps {
  chartJson?: {
    data: Plotly.Data[];
    layout?: Partial<Plotly.Layout>;
  };
  title?: string;
  height?: number | string;
  loading?: boolean;
  config?: Partial<Plotly.Config>;
  className?: string;
}

export function PlotlyChart({ 
  chartJson, 
  title, 
  height = 400, 
  loading = false,
  config,
  className 
}: PlotlyChartProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!chartJson?.data) {
    return (
      <div 
        className="flex items-center justify-center border-2 border-dashed border-slate-200 rounded-lg bg-slate-50"
        style={{ height }}
      >
        <p className="text-slate-500">No chart data available</p>
      </div>
    );
  }

  return (
    <div className={className} style={{ width: '100%', height }}>
      <Plot
        data={chartJson.data}
        layout={{
          ...chartJson.layout,
          title: title || chartJson.layout?.title,
          autosize: true,
        }}
        config={{
          responsive: true,
          displayModeBar: true,
          ...config,
        }}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}
```

#### 4.3 Update ChartCard to Use PlotlyChart

Replace `ChartPreview` import with `PlotlyChart` in `ChartCard.tsx`:

```typescript
// Before
import { ChartPreview } from './ChartPreview';

// After
import { PlotlyChart } from './PlotlyChart';
```

Update the chart rendering in both grid and list views:

```typescript
// Before
<ChartPreview
  type={chart.type}
  xAxis={chart.xAxis}
  yAxis={chart.yAxis}
  data={chart.data.slice(0, 10)}
  colors={chart.colors}
/>

// After
<PlotlyChart
  chartJson={chart.chartJson}
  title={chart.title}
  height={viewMode === 'list' ? 128 : 300}
  config={{ displayModeBar: false }} // Hide toolbar in thumbnails
/>
```

#### 4.4 Update ChartCreator - Remove Live Preview

Since we're standardizing on Plotly (which requires API calls), the "live preview" concept changes:

**Option A: Remove preview entirely until chart is generated**
- Simpler implementation
- Preview only shows after API call returns

**Option B: Add a "Preview" button that calls API**
- User configures chart → clicks "Preview" → API generates Plotly JSON → display in PlotlyChart
- More API calls but better UX

**Recommendation:** Option A for simplicity. The preview section becomes a placeholder until the chart is generated, then shows the Plotly chart.

Update `ChartCreator.tsx`:

```typescript
// Remove ChartPreview import
// import { ChartPreview } from './ChartPreview';

// Add PlotlyChart import  
import { PlotlyChart } from './PlotlyChart';

// Add new prop for preview chart
interface ChartCreatorProps {
  // ...existing props...
  /** Preview chart JSON (from last generation) */
  previewChartJson?: { data: Plotly.Data[]; layout?: Partial<Plotly.Layout> };
}

// Replace preview section
<Card className="p-6">
  <h3 className="text-lg font-semibold mb-4">Preview</h3>
  {isGenerating ? (
    <PlotlyChart loading height={400} />
  ) : previewChartJson ? (
    <PlotlyChart chartJson={previewChartJson} height={400} />
  ) : (
    <div className="h-[400px] flex items-center justify-center border-2 border-dashed border-slate-200 rounded-lg bg-slate-50">
      <div className="text-center space-y-2">
        <p className="text-slate-600">No preview available</p>
        <p className="text-sm text-slate-500">
          Configure your chart and click Generate to see a preview
        </p>
      </div>
    </div>
  )}
</Card>
```

#### 4.5 Remove Recharts Dependencies

After migration, remove Recharts from the project:

```bash
npm uninstall recharts @types/recharts
```

Also remove the shadcn chart components that wrap Recharts:
- `src/design-system/components/ui/chart.tsx` (if it only wraps Recharts)

#### 4.6 Update Exports

Update `src/design-system/components/charts/index.ts`:

```typescript
// Remove
export { ChartPreview } from './ChartPreview';

// Add
export { PlotlyChart } from './PlotlyChart';
```

---

## API Changes Required

### No API changes needed for basic functionality.

The existing endpoints support everything:
- `POST /charts/ai` - AI generation with prompt
- `POST /charts/` - Manual chart with x_column, y_column, chart_type

### Future API Enhancements (Optional)

| Endpoint | Purpose | Notes |
|----------|---------|-------|
| `POST /charts/save` | Persist chart to user account | Requires auth |
| `GET /charts/` | List saved charts | Requires auth |
| `DELETE /charts/{id}` | Delete saved chart | Requires auth |
| `POST /charts/export` | Export chart as image | Server-side rendering |

---

## Migration Checklist

### Design System Changes
- [ ] Delete `ChartPreview.tsx` (Recharts-based)
- [ ] Create `PlotlyChart.tsx` component
- [ ] Update `ChartCard.tsx` to use `PlotlyChart`
- [ ] Update `ChartCreator.tsx` to use `PlotlyChart` (or placeholder)
- [ ] Export chart components from `design-system/components/index.ts`
- [ ] Remove Recharts dependencies (`npm uninstall recharts`)
- [ ] Remove or update `design-system/components/ui/chart.tsx` if it depends on Recharts

### App Layer Implementation
- [ ] Create `src/stores/chartStore.ts`
- [ ] Rewrite `ChartsPage.tsx` using `ChartGallery`
- [ ] Add confirmation dialog for chart deletion
- [ ] Implement fullscreen modal for chart viewing
- [ ] Implement chart export (PNG/SVG)
- [ ] Add bulk export functionality

### Testing
- [ ] Test AI chart generation flow
- [ ] Test manual chart creation flow
- [ ] Test chart gallery CRUD operations
- [ ] Test persistence across page navigation
- [ ] Test empty states

---

## Component Dependency Diagram

```
ChartsPage (App Layer)
├── useFileStore (data, headers, metadata)
├── useChartStore (charts, UI state)
├── useChart (API calls)
└── ChartGallery (Design System)
    ├── ChartCreator
    │   ├── ChartSuggestions
    │   ├── ChartTypeSelector
    │   └── PlotlyChart (preview after generation)
    └── ChartCard
        └── PlotlyChart
```

---

## Summary

1. **Design-system components are already well-architected** - they use callbacks for all actions
2. **Main work is in the app layer** - creating the store and wiring up API calls
3. **No API changes required** - existing endpoints support all features
4. **Standardize on Plotly** - remove Recharts entirely, use `react-plotly.js` for all chart rendering
5. **Delete ChartPreview** - replace with new `PlotlyChart` component
6. **Future: Add chart persistence** - requires new backend endpoints

This plan enables the full chart gallery experience with Plotly as the single charting library.
