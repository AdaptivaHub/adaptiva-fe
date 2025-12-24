# Features → Design System Refactoring Plan

This document outlines the plan to refactor `src/features/` components to properly use `src/design-system/` components, eliminating duplicate UI code and ensuring consistent styling.

## Goals

1. **Eliminate duplicate UI code** - Remove custom CSS for elements that exist in design-system
2. **Ensure consistency** - All UI uses the same design tokens and components
3. **Maintain separation** - Features handle business logic; design-system handles presentation
4. **Reduce CSS maintenance** - Delete feature-specific CSS files where possible

---

## Audit Summary

| Feature Component | Current State | Design System Match | Priority | Effort |
|-------------------|---------------|---------------------|----------|--------|
| `Upload.tsx` | Custom HTML/CSS | `UploadZone` | 🔴 High | Medium |
| `AuthModal.tsx` | Custom modal + form | `Dialog`, `Input`, `Button`, `Label` | 🔴 High | Medium |
| `Preview.tsx` | Custom table | `DataPreview` | 🔴 High | Low |
| `RateLimitBanner.tsx` | Custom banner | `Alert` | 🟡 Medium | Low |
| `Controls.tsx` | Custom buttons + textarea | `Button`, `Textarea` | 🟡 Medium | Medium |
| `UserMenu.tsx` | Custom dropdown | `DropdownMenu`, `Avatar`, `Button` | 🟡 Medium | Medium |
| `ResultsPanel.tsx` | Custom panel | `Card`, `Alert` | 🟢 Low | Low |
| `ChartEditor.tsx` | Custom form | `Select`, `Input`, `Label`, `Button`, `Card` | 🟡 Medium | High |
| `ChartView.tsx` | Wrapper only | Already minimal | 🟢 Low | N/A |

---

## Phase 1: High Priority (Direct Replacements)

### 1.1 `Upload.tsx` → Use `UploadZone`

**Current:** Custom drag-drop zone with inline SVG, custom CSS
**Target:** Wrap `UploadZone` from design-system

**Changes:**
```tsx
// Before
import { useFileUpload } from '../hooks/useFileUpload';
import { useDragDrop } from '../hooks/useDragDrop';
import './Upload.css';

export const Upload = ({ onDataLoaded }) => {
  const { uploadFile, isUploading, ... } = useFileUpload({ onSuccess: onDataLoaded });
  const { isDragActive, dragProps } = useDragDrop({ onFileDrop: uploadFile });
  
  return (
    <div className="upload-area" {...dragProps}>
      {/* Custom upload UI */}
    </div>
  );
};

// After
import { UploadZone } from '@design/components/UploadZone';
import { useFileUpload } from '../hooks/useFileUpload';
import { useDragDrop } from '../hooks/useDragDrop';

export const Upload = ({ onDataLoaded }) => {
  const { uploadFile, isUploading, error, fileName } = useFileUpload({ onSuccess: onDataLoaded });
  const { isDragActive } = useDragDrop({ onFileDrop: uploadFile, disabled: isUploading });
  
  return (
    <UploadZone
      onFileSelect={uploadFile}
      isLoading={isUploading}
      error={error}
      uploadingFileName={fileName}
      isDragActive={isDragActive}
    />
  );
};
```

**Files to modify:**
- `src/features/Upload.tsx` - Refactor to use UploadZone
- `src/features/Upload.css` - **DELETE**

**Blockers:** Need to verify `UploadZone` props match hook outputs

---

### 1.2 `AuthModal.tsx` → Use `Dialog`, Form components

**Current:** Custom modal overlay, form inputs, custom CSS (161 lines)
**Target:** Use `Dialog`, `Input`, `Label`, `Button` from design-system

**Changes:**
```tsx
// Before
<div className="auth-modal-overlay" onClick={onClose}>
  <div className="auth-modal" onClick={e => e.stopPropagation()}>
    <button className="auth-modal-close" onClick={onClose}>×</button>
    <form className="auth-form">
      <input type="email" className="..." />
    </form>
  </div>
</div>

// After
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@design/components/ui/dialog';
import { Input } from '@design/components/ui/input';
import { Label } from '@design/components/ui/label';
import { Button } from '@design/components/ui/button';
import { Alert, AlertDescription } from '@design/components/ui/alert';

<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>{mode === 'login' ? 'Welcome Back' : 'Create Account'}</DialogTitle>
      <DialogDescription>...</DialogDescription>
    </DialogHeader>
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" ... />
      </div>
      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
      <Button type="submit" disabled={isLoading}>Sign In</Button>
    </form>
  </DialogContent>
</Dialog>
```

**Files to modify:**
- `src/features/AuthModal.tsx` - Major refactor
- `src/features/AuthModal.css` - **DELETE** (or reduce to minimal overrides)

---

### 1.3 `Preview.tsx` → Use `DataPreview`

**Current:** Simple table with custom CSS (68 lines)
**Target:** Use `DataPreview` from design-system (full-featured table with pagination, sorting)

**Changes:**
```tsx
// Before
import './Preview.css';

export const Preview = ({ data, headers, sheets, activeSheet, onSheetChange }) => {
  return (
    <div className="preview-container">
      <table className="data-table">...</table>
    </div>
  );
};

// After
import { DataPreview } from '@design/components/DataPreview';

export const Preview = ({ data, headers, sheets, activeSheet, onSheetChange }) => {
  // Construct file object for DataPreview
  const file = {
    id: 'preview',
    name: 'Data Preview',
    headers,
    data,
    sheets,
    activeSheet,
  };
  
  return <DataPreview file={file} onSheetChange={onSheetChange} />;
};
```

**Files to modify:**
- `src/features/Preview.tsx` - Replace with DataPreview wrapper
- `src/features/Preview.css` - **DELETE**

**Note:** `DataPreview` is much more feature-rich (search, pagination, sorting). This is an upgrade.

---

## Phase 2: Medium Priority

### 2.1 `RateLimitBanner.tsx` → Use `Alert`

**Current:** Custom banner with progress bar (98 lines + CSS)
**Target:** Use `Alert` component with custom variants

**Design Decision:** The current banner has 3 states (exhausted, warning, info with progress). May need to keep some custom styling for the progress bar variant.

**Approach:**
- Use `Alert` for exhausted and warning states
- Keep custom progress bar element or add to design-system

```tsx
// After (partial)
import { Alert, AlertTitle, AlertDescription } from '@design/components/ui/alert';
import { Button } from '@design/components/ui/button';
import { Progress } from '@design/components/ui/progress';

// Exhausted state
<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Daily AI limit reached</AlertTitle>
  <AlertDescription>...</AlertDescription>
  <Button variant="default" size="sm" onClick={onSignUpClick}>
    Sign up for unlimited access
  </Button>
</Alert>
```

**Files to modify:**
- `src/features/RateLimitBanner.tsx` - Refactor to use Alert + Progress
- `src/features/RateLimitBanner.css` - Reduce or **DELETE**

---

### 2.2 `Controls.tsx` → Use `Button`, `Textarea`

**Current:** Custom buttons with SVG icons, custom textarea (108 lines + CSS)
**Target:** Use `Button`, `Textarea`, `Label` from design-system

**Changes:**
```tsx
// Before
<button className="control-button clean" onClick={onCleanData}>
  <svg className="button-icon">...</svg>
  Clean Data
</button>
<textarea className="instructions-textarea" ... />

// After
import { Button } from '@design/components/ui/button';
import { Textarea } from '@design/components/ui/textarea';
import { Label } from '@design/components/ui/label';
import { Trash2, Lightbulb, BarChart, Zap, Download } from 'lucide-react';

<Button variant="secondary" onClick={onCleanData} disabled={disabled}>
  <Trash2 className="mr-2 h-4 w-4" />
  Clean Data
</Button>

<div className="space-y-2">
  <Label htmlFor="instructions">Instructions</Label>
  <Textarea id="instructions" placeholder="..." value={instructions} onChange={...} />
</div>
```

**Files to modify:**
- `src/features/Controls.tsx` - Use design-system components
- `src/features/Controls.css` - Reduce to layout-only or **DELETE**

---

### 2.3 `UserMenu.tsx` → Use `DropdownMenu`, `Avatar`

**Current:** Custom dropdown with click-outside handling (98 lines + CSS)
**Target:** Use `DropdownMenu`, `Avatar`, `Button` from design-system (Radix-powered, accessible)

**Changes:**
```tsx
// Before
const [isOpen, setIsOpen] = useState(false);
const menuRef = useRef<HTMLDivElement>(null);
// Click-outside handling...

<div className="user-menu" ref={menuRef}>
  <button className="user-menu-trigger" onClick={() => setIsOpen(!isOpen)}>
    <div className="user-avatar">{initials}</div>
  </button>
  {isOpen && <div className="user-menu-dropdown">...</div>}
</div>

// After
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@design/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@design/components/ui/avatar';
import { Button } from '@design/components/ui/button';
import { LogOut, ChevronDown } from 'lucide-react';

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost">
      <Avatar className="h-8 w-8">
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <span>{user?.full_name || user?.email}</span>
      <ChevronDown className="h-4 w-4" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuLabel>My Account</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem onClick={handleLogout}>
      <LogOut className="mr-2 h-4 w-4" />
      Sign Out
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

**Files to modify:**
- `src/features/UserMenu.tsx` - Major simplification
- `src/features/UserMenu.css` - **DELETE**

**Benefits:** Removes manual click-outside handling, gains keyboard navigation, better accessibility

---

### 2.4 `ChartEditor.tsx` → Use Form components

**Current:** Custom form with selects, inputs, buttons (305 lines + CSS)
**Target:** Use `Select`, `Input`, `Label`, `Button`, `Card` from design-system

**Scope:** This is the largest refactor. Consider doing incrementally.

**Phase 2a - Quick wins:**
- Replace `<select>` with `<Select>` component
- Replace `<button>` with `<Button>` component
- Replace `<label>` with `<Label>` component

**Phase 2b - Full refactor:**
- Wrap in `Card` component
- Consider if `ChartCreator` from design-system can be reused

**Files to modify:**
- `src/features/ChartEditor.tsx` - Incremental refactor
- `src/features/ChartEditor.css` - Reduce significantly

---

## Phase 3: Low Priority

### 3.1 `ResultsPanel.tsx` → Use `Card`

**Current:** Simple panel with title and content (44 lines + CSS)
**Target:** Use `Card` component

**Changes:**
```tsx
// After
import { Card, CardHeader, CardTitle, CardContent } from '@design/components/ui/card';
import { cn } from '@design/components/ui/utils';

<Card className={cn(type === 'error' && 'border-destructive')}>
  <CardHeader>
    <CardTitle>{title}</CardTitle>
  </CardHeader>
  <CardContent>
    {renderContent()}
  </CardContent>
</Card>
```

**Files to modify:**
- `src/features/ResultsPanel.tsx` - Simple refactor
- `src/features/ResultsPanel.css` - Reduce or **DELETE**

---

### 3.2 `ChartView.tsx` → Already minimal

**Current:** Thin wrapper around ChartEditor + Plotly (112 lines, no complex UI)
**Target:** No changes needed

This component is already doing the right thing - composing other components.

---

## Execution Order

```
Week 1: Foundation
├── 1.1 Upload.tsx → UploadZone (High impact, clear 1:1 mapping)
├── 1.3 Preview.tsx → DataPreview (Quick win, feature upgrade)
└── 3.1 ResultsPanel.tsx → Card (Simple, builds confidence)

Week 2: Forms
├── 1.2 AuthModal.tsx → Dialog + Form components
└── 2.2 Controls.tsx → Button + Textarea

Week 3: Navigation
├── 2.3 UserMenu.tsx → DropdownMenu
└── 2.1 RateLimitBanner.tsx → Alert + Progress

Week 4: Charts
└── 2.4 ChartEditor.tsx → Select + Input + Card (incremental)
```

---

## CSS Files to Delete

After refactoring, these CSS files should be deletable:

| File | Delete After | Notes |
|------|--------------|-------|
| `Upload.css` | Phase 1.1 | Fully replaced |
| `Preview.css` | Phase 1.3 | Fully replaced |
| `AuthModal.css` | Phase 1.2 | Fully replaced |
| `UserMenu.css` | Phase 2.3 | Fully replaced |
| `Controls.css` | Phase 2.2 | May keep layout rules |
| `RateLimitBanner.css` | Phase 2.1 | May keep progress styling |
| `ResultsPanel.css` | Phase 3.1 | Fully replaced |
| `ChartEditor.css` | Phase 2.4 | Gradual reduction |
| `ChartView.css` | Keep | Layout for Plotly container |

---

## Validation Checklist

For each refactored component:

- [ ] Visual appearance matches original (or improves)
- [ ] All interactive states work (hover, focus, disabled, loading)
- [ ] Keyboard navigation works
- [ ] No TypeScript errors
- [ ] No console warnings
- [ ] Build succeeds
- [ ] Feature functionality unchanged

---

## Metrics

Track progress with:

| Metric | Before | After |
|--------|--------|-------|
| Total feature CSS lines | ~800 | < 100 |
| Custom HTML elements | ~50 | < 10 |
| Accessibility issues | Unknown | 0 |
| Design-system adoption | ~10% | > 90% |

---

## Notes

- **shadcn/ui base**: The design-system uses shadcn/ui components (Radix-based), so migration gives us accessibility for free
- **Tailwind CSS**: Design-system uses Tailwind; features may need utility class imports
- **Testing**: Each phase should include visual regression testing
- **Documentation**: Update `src/features/README.md` after each phase

---

## Questions to Resolve

1. **ChartEditor vs ChartCreator**: Are these duplicates? Should `ChartEditor` wrap `ChartCreator`?
2. **Progress component**: Does design-system `Progress` support the rate-limit banner use case?
3. **Alert variants**: Do we need to add custom variants for rate-limit states?
