# Services Layer

Pure async functions for API communication. No React dependencies - these can be used anywhere.

## Structure

```
services/
├── api.ts              # Axios instance & interceptors
├── authService.ts      # Authentication endpoints
├── uploadService.ts    # File upload & preview
├── chartService.ts     # Chart generation
├── cleaningService.ts  # Data cleaning
├── predictionService.ts # ML predictions
├── insightsService.ts  # AI insights
├── exportService.ts    # Data export
└── index.ts            # Re-exports
```

## API Instance (`api.ts`)

Configured axios instance with:
- Base URL from `VITE_API_URL` env var (defaults to `http://localhost:8000`)
- Request interceptor: Adds `Authorization: Bearer <token>` header
- Response interceptor: Handles 401 errors (clears token, redirects to login)

```typescript
import { api } from '@/services';

// Use directly if needed
const response = await api.get('/some-endpoint');
```

## Service Files

### authService
| Function | Description |
|----------|-------------|
| `login(email, password)` | Authenticate user, returns token + user |
| `register(email, password, fullName)` | Create new account |
| `getCurrentUser()` | Fetch current user profile |
| `logout()` | Clear session (client-side) |

### uploadService
| Function | Description |
|----------|-------------|
| `uploadFile(file)` | Upload CSV/Excel file |
| `getPreview(fileId, sheet?, page?, pageSize?)` | Get paginated data preview |

### chartService
| Function | Description |
|----------|-------------|
| `generateChart(fileId, instructions)` | AI-generate chart from instructions |

### cleaningService
| Function | Description |
|----------|-------------|
| `cleanData(fileId, options)` | Apply data cleaning operations |

### predictionService
| Function | Description |
|----------|-------------|
| `predict(fileId, instructions)` | Generate ML predictions |

### insightsService
| Function | Description |
|----------|-------------|
| `getInsights(fileId)` | Get AI-generated data insights |

### exportService
| Function | Description |
|----------|-------------|
| `exportData(fileId, format)` | Export data as CSV/Excel/JSON |

## Adding a New Service

1. Create `src/services/newService.ts`:
```typescript
import { api } from './api';

export interface NewResponse {
  // response shape
}

export async function doSomething(param: string): Promise<NewResponse> {
  const response = await api.post('/endpoint', { param });
  return response.data;
}
```

2. Export from `src/services/index.ts`:
```typescript
export * from './newService';
```

3. (Optional) Create a hook in `src/hooks/api/useNew.ts` for React integration

## Error Handling

Services throw errors on failure. Hooks or calling code should handle errors:

```typescript
try {
  const result = await someService.doThing();
} catch (error) {
  if (axios.isAxiosError(error)) {
    // Handle API error
    console.error(error.response?.data?.detail);
  }
}
```
