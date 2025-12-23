# Feasibility Analysis: Syncing Adaptiva Design to Adaptiva FE

## Executive Summary

**Verdict: ✅ FEASIBLE with moderate setup effort**

The approach of copying `adaptiva-design` into `adaptiva-fe` as a local design system folder is a common and well-supported pattern. However, there are dependency differences and import path challenges that need addressing.

---

## 1. Comparison Analysis

### Package Dependencies

| Package | adaptiva-design | adaptiva-fe | Action Needed |
|---------|-----------------|-------------|---------------|
| React | 18.3.1 | 19.2.0 | ⚠️ Version mismatch |
| Tailwind CSS | 4.1.12 | ❌ Missing | Install |
| Radix UI | ✅ Many packages | ❌ Missing | Install |
| lucide-react | 0.487.0 | ❌ Missing | Install |
| class-variance-authority | 0.7.1 | ❌ Missing | Install |
| clsx | 2.1.1 | ❌ Missing | Install |
| tailwind-merge | 3.2.0 | ❌ Missing | Install |
| Recharts | 2.15.2 | ❌ Missing | Install (for charts) |
| Plotly | ❌ Missing | ✅ Has | Keep existing |

### Import Path Challenges

The design system uses relative imports like:
```typescript
// In DashboardLayout.tsx
import { Button } from './ui/button';
import type { UploadedFile } from '../App';
```

These need to be transformed when copied to `adaptiva-fe`.

---

## 2. Implementation Guide

### Step 1: Install Dependencies

Run in `adaptiva-fe`:

```bash
npm install tailwindcss @tailwindcss/vite postcss

npm install @radix-ui/react-slot @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-select @radix-ui/react-slider @radix-ui/react-switch @radix-ui/react-tabs @radix-ui/react-tooltip @radix-ui/react-avatar @radix-ui/react-checkbox @radix-ui/react-label @radix-ui/react-progress @radix-ui/react-separator @radix-ui/react-scroll-area @radix-ui/react-toggle @radix-ui/react-toggle-group

npm install class-variance-authority clsx tailwind-merge lucide-react recharts
```

### Step 2: Configure TypeScript Path Aliases

Update `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@design/*": ["./src/design-system/*"]
    }
  }
}
```

Update `vite.config.ts`:

```typescript
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@design': resolve(__dirname, './src/design-system'),
    },
  },
  // ... rest of config
});
```

### Step 3: Run Sync Script

```powershell
cd c:\GitHub\adaptiva-fe
.\scripts\sync-design-system.ps1
```

### Step 4: Update Main CSS

In `src/index.css` or `src/App.css`:

```css
@import "./design-system/styles/theme.css";
@import "./design-system/styles/tailwind.css";
```

### Step 5: Create Type Definitions

Create `src/types/design-system.d.ts`:

```typescript
// Types that design system components expect
export interface UploadedFile {
  fileId: string;
  fileName: string;
  sheets: string[];
  activeSheet?: string;
  headers: string[];
  data: Record<string, unknown>[];
  rowCount: number;
  uploadedAt: Date;
}

export interface DataQualityReport {
  qualityScore: number;
  totalRows: number;
  cleanRows: number;
  issues: DataQualityIssue[];
  columnIssues: ColumnIssue[];
}

// ... other shared types
```

### Step 6: Use Components

```typescript
// In your existing components
import { Button, Card, Badge } from '@design/components/ui';
import { DashboardLayout } from '@design/components/DashboardLayout';
import { cn } from '@design/components/ui/utils';
```

---

## 3. Files That Need Manual Adaptation

Some files reference app-specific types or state that need bridging:

| File | Issue | Solution |
|------|-------|----------|
| `DashboardLayout.tsx` | Uses `UploadedFile` from `../App` | Create shared types in `@/types` |
| `DataPreview.tsx` | Uses mock data | Connect to real API |
| `UploadZone.tsx` | Mock upload logic | Replace with `useFileUpload` hook |
| `ChartCreator.tsx` | Uses Recharts | Keep, or add Plotly adapter |

---

## 4. Bridging Design System with Existing FE

### Adapter Pattern

Create adapters to connect design system components with your existing hooks:

```typescript
// src/adapters/UploadZoneAdapter.tsx
import { UploadZone } from '@design/components/UploadZone';
import { useFileUpload } from '@/hooks/useFileUpload';

export function UploadZoneAdapter() {
  const { upload, loading, error } = useFileUpload();
  
  return (
    <UploadZone 
      onFileSelect={upload}
      isLoading={loading}
      error={error}
    />
  );
}
```

### Gradual Migration Path

1. **Phase 1:** Use UI primitives (`Button`, `Card`, `Badge`, etc.)
2. **Phase 2:** Adopt layout components (`DashboardLayout`)
3. **Phase 3:** Migrate feature components with adapters
4. **Phase 4:** Replace existing components entirely

---

## 5. React Version Compatibility

The design system uses React 18.3.1, while adaptiva-fe uses React 19.2.0.

**Risk Level: LOW**

React 19 is backward compatible with React 18 component APIs. The main differences are:
- New hooks (not used by design system)
- Compiler optimizations (transparent)
- Ref handling (shadcn/ui uses `forwardRef` correctly)

**Recommendation:** Keep React 19 in adaptiva-fe; components will work fine.

---

## 6. Keeping Design Repo Unmodified

The sync script is designed to **not require any changes** to `adaptiva-design`:

| Concern | How Script Handles It |
|---------|----------------------|
| Import paths | Transformed during copy |
| Type references | Bridged with local types |
| Styling | CSS copied and imported |
| Dependencies | Installed in adaptiva-fe |

The only potential change to design repo would be if you wanted to:
- Export types explicitly
- Add an `index.ts` barrel file
- Configure it as a publishable package

**None of these are required** for the copy-and-transform approach.

---

## 7. Maintenance Workflow

### When Design Changes

```powershell
# Pull latest design changes
cd ..\adaptiva-design
git pull

# Re-sync to frontend
cd ..\adaptiva-fe
.\scripts\sync-design-system.ps1

# Test and commit
npm run dev
git add src/design-system
git commit -m "chore: sync design system"
```

### Automation Option

Add to `package.json`:

```json
{
  "scripts": {
    "sync:design": "powershell -ExecutionPolicy Bypass -File ./scripts/sync-design-system.ps1"
  }
}
```



