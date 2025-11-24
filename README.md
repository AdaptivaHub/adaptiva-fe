# Adaptiva Frontend

A React + Vite frontend for a data analysis AI tool with CSV/XLSX file upload, data preview, AI-powered insights, chart generation, predictions, and data export.

## Features

- **File Upload**: Drag-and-drop or browse CSV/XLSX files
- **Data Preview**: Interactive table view of uploaded data (first 100 rows)
- **Clean Data**: AI-powered data cleaning and preprocessing
- **Insights**: Get AI-generated insights from your data
- **Chart Generation**: Automatic chart creation using Plotly.js
- **Predictions**: Make predictions based on your data with custom instructions
- **Export**: Export processed data in various formats
- **Responsive Design**: Mobile-friendly interface with clean UI

## Tech Stack

- **React 19** - UI framework
- **Vite 7** - Build tool and dev server
- **TypeScript** - Type safety
- **Axios** - HTTP client for API calls
- **Plotly.js** - Interactive charts and visualizations
- **XLSX** - Excel and CSV file parsing

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/AdaptivaHub/adaptiva-fe.git
cd adaptiva-fe
```

2. Install dependencies:
```bash
npm install
```

3. Configure the backend API URL (optional):
```bash
cp .env.example .env
# Edit .env and set VITE_API_BASE_URL to your backend URL
```

### Development

Run the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

### Linting

Run ESLint:
```bash
npm run lint
```

## Project Structure

```
src/
├── components/         # React components
│   ├── Upload.tsx     # File upload component
│   ├── Preview.tsx    # Data table preview
│   ├── Controls.tsx   # Action buttons and instructions
│   ├── ChartView.tsx  # Plotly chart display
│   └── ResultsPanel.tsx # Results display
├── hooks/             # Custom React hooks
│   ├── useCleanData.ts
│   ├── useInsights.ts
│   ├── useChart.ts
│   ├── usePredict.ts
│   └── useExport.ts
├── types/             # TypeScript type definitions
├── utils/             # Utility functions
│   └── api.ts         # API client with Axios
└── App.tsx            # Main application component
```

## API Integration

The frontend expects the following backend API endpoints:

- `POST /api/clean` - Clean and preprocess data
- `POST /api/insights` - Get AI insights
- `POST /api/chart` - Generate chart data
- `POST /api/predict` - Make predictions
- `POST /api/export` - Export data

Configure the API base URL via the `VITE_API_BASE_URL` environment variable (defaults to `http://localhost:8000/api`).

## Security Note

The project uses the `xlsx` library which has known vulnerabilities. For production use, consider:
- Validating file sizes and content before processing
- Using a more secure alternative library
- Processing files on the backend instead

## License

MIT

