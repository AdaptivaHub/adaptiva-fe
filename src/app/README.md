# App Layer

The application layer containing React Router configuration, page components, and layouts.

## Structure

```
app/
├── App.tsx           # Main app with router setup
├── layouts/          # Layout wrapper components
│   ├── MainLayout.tsx    # Protected routes (with sidebar)
│   ├── AuthLayout.tsx    # Public auth pages
│   └── index.ts
└── routes/           # Page components
    ├── DashboardPage.tsx
    ├── UploadPage.tsx
    ├── PreviewPage.tsx
    ├── ChartsPage.tsx
    ├── PredictionsPage.tsx
    ├── SettingsPage.tsx
    ├── LoginPage.tsx
    ├── RegisterPage.tsx
    └── index.ts
```

## Routing Structure

| Path | Page | Layout | Description |
|------|------|--------|-------------|
| `/` | `DashboardPage` | Main | Home/overview dashboard |
| `/upload` | `UploadPage` | Main | File upload zone |
| `/preview` | `PreviewPage` | Main | Data preview and quality analysis |
| `/charts` | `ChartsPage` | Main | AI chart generation |
| `/predictions` | `PredictionsPage` | Main | ML predictions |
| `/settings` | `SettingsPage` | Main | User settings |
| `/login` | `LoginPage` | Auth | User login |
| `/register` | `RegisterPage` | Auth | User registration |

## Layouts

### MainLayout
- Wraps protected routes
- Includes `DashboardLayout` from design-system (sidebar navigation)
- Redirects to `/login` if not authenticated
- Uses `<Outlet />` for nested route content

### AuthLayout
- Wraps public auth routes
- Redirects to `/` if already authenticated
- Centered card layout for forms

## App.tsx Responsibilities

1. **Auth Initialization** - Calls `initializeAuth()` on mount
2. **Data Refresh** - Refetches file data if metadata exists (hybrid persistence)
3. **Toast Provider** - Global toast notifications via Sonner
4. **Router Setup** - BrowserRouter with all route definitions

## Adding a New Page

1. Create `src/app/routes/NewPage.tsx`
2. Export from `src/app/routes/index.ts`
3. Add route in `App.tsx` under appropriate layout
4. Add navigation link in `DashboardLayout` sidebar (if needed)
