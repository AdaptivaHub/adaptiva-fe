# Hooks

Custom React hooks for data fetching, UI utilities, and abstractions.

## Structure

```
hooks/
├── api/              # API/data fetching hooks
│   ├── useFileUpload.ts
│   ├── useChart.ts
│   ├── useCleanData.ts
│   ├── usePredict.ts
│   ├── useInsights.ts
│   ├── useExport.ts
│   └── index.ts
├── ui/               # UI utility hooks
│   ├── useDragDrop.ts
│   └── index.ts
└── index.ts          # Re-exports all hooks
```

## API Hooks

Wrap service layer functions with React state management (loading, error, data).

### useFileUpload
Upload files and store in fileStore.

```typescript
const { uploadFile, isUploading, error } = useFileUpload({
  onSuccess: () => toast.success('Uploaded!'),
});

// Usage
await uploadFile(file);
```

### useChart
Generate charts via AI.

```typescript
const { generateChart, isGenerating, chart, error } = useChart();

// Usage
await generateChart(fileId, 'Create a bar chart of sales by region');
```

### useCleanData
Apply data cleaning operations.

```typescript
const { cleanData, isCleaning, error } = useCleanData();

// Usage
await cleanData(fileId, { removeDuplicates: true, fillMissing: 'mean' });
```

### usePredict
Generate ML predictions.

```typescript
const { predict, isPredicting, prediction, error } = usePredict();

// Usage
await predict(fileId, 'Predict next month sales');
```

### useInsights
Get AI-generated insights.

```typescript
const { getInsights, isLoading, insights, error } = useInsights();

// Usage
await getInsights(fileId);
```

### useExport
Export data in various formats.

```typescript
const { exportData, isExporting, error } = useExport();

// Usage
await exportData(fileId, 'csv'); // or 'excel', 'json'
```

## UI Hooks

### useDragDrop
Handle drag-and-drop file uploads.

```typescript
const { isDragActive, dragProps } = useDragDrop({
  onFileDrop: (file) => uploadFile(file),
  accept: ['.csv', '.xlsx', '.xls'],
  disabled: isUploading,
});

// Usage
<div {...dragProps}>
  {isDragActive ? 'Drop here!' : 'Drag a file'}
</div>
```

## Adding a New Hook

### API Hook Pattern
```typescript
// src/hooks/api/useNewFeature.ts
import { useState, useCallback } from 'react';
import { newService } from '@/services';

interface UseNewFeatureOptions {
  onSuccess?: (data: ResultType) => void;
  onError?: (error: string) => void;
}

export function useNewFeature(options: UseNewFeatureOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ResultType | null>(null);

  const doThing = useCallback(async (param: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await newService.doThing(param);
      setData(result);
      options.onSuccess?.(result);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed';
      setError(message);
      options.onError?.(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  return { doThing, isLoading, error, data };
}
```

### UI Hook Pattern
```typescript
// src/hooks/ui/useNewUI.ts
import { useState, useCallback } from 'react';

export function useNewUI() {
  const [state, setState] = useState(false);
  
  const toggle = useCallback(() => {
    setState(prev => !prev);
  }, []);

  return { state, toggle };
}
```

## Import Conventions

```typescript
// From hooks index (recommended)
import { useFileUpload, useDragDrop } from '@/hooks';

// Or from specific folders
import { useFileUpload } from '@/hooks/api';
import { useDragDrop } from '@/hooks/ui';
```
