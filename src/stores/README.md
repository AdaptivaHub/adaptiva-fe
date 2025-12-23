# Stores (Zustand)

Global state management using Zustand with persistence middleware.

## Structure

```
stores/
├── authStore.ts    # Authentication state
├── fileStore.ts    # Uploaded file state
└── index.ts        # Re-exports
```

## authStore

Manages authentication state with localStorage persistence.

### State
| Field | Type | Description |
|-------|------|-------------|
| `user` | `User \| null` | Current user object |
| `token` | `string \| null` | JWT access token |
| `isAuthenticated` | `boolean` | Whether user is logged in |
| `isLoading` | `boolean` | Auth operation in progress |

### Actions
| Action | Description |
|--------|-------------|
| `login(email, password)` | Authenticate and store credentials |
| `register(email, password, fullName)` | Create account and login |
| `logout()` | Clear auth state and token |
| `initializeAuth()` | Check token validity on app load |

### Usage
```typescript
import { useAuthStore } from '@/stores';

function Component() {
  const user = useAuthStore((state) => state.user);
  const login = useAuthStore((state) => state.login);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
}
```

## fileStore

Manages uploaded file state with hybrid persistence (metadata persisted, data refetched).

### State
| Field | Type | Persisted | Description |
|-------|------|-----------|-------------|
| `metadata` | `FileMetadata \| null` | ✅ Yes | File info (name, rows, columns, sheets) |
| `data` | `Record<string, unknown>[]` | ❌ No | Actual row data |
| `headers` | `string[]` | ❌ No | Column headers |
| `isLoading` | `boolean` | ❌ No | Loading state |

### Actions
| Action | Description |
|--------|-------------|
| `setFile(metadata, data, headers)` | Store uploaded file |
| `setActiveSheet(sheetName)` | Switch Excel sheet |
| `refreshData()` | Refetch data from server using stored fileId |
| `clearFile()` | Reset all file state |

### Persistence Strategy

**Why hybrid?**
- Metadata is small and rarely changes → persist to localStorage
- Data can be large (thousands of rows) → refetch on page load
- Prevents localStorage quota issues
- Ensures fresh data after browser restart

```typescript
// On app mount (in App.tsx)
useEffect(() => {
  if (metadata?.fileId) {
    refreshData(); // Refetch data using persisted fileId
  }
}, [metadata?.fileId, refreshData]);
```

## Adding a New Store

1. Create `src/stores/newStore.ts`:
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface NewState {
  value: string;
  setValue: (v: string) => void;
}

export const useNewStore = create<NewState>()(
  persist(
    (set) => ({
      value: '',
      setValue: (value) => set({ value }),
    }),
    {
      name: 'new-storage', // localStorage key
    }
  )
);
```

2. Export from `src/stores/index.ts`:
```typescript
export { useNewStore } from './newStore';
```

## Token Storage Note

Auth tokens are stored separately in `src/utils/tokenStorage.ts`, not in the Zustand store directly. This prevents circular dependencies:

```
authStore → services/api → tokenStorage
                ↑              ↓
                └──────────────┘ (no cycle)
```
