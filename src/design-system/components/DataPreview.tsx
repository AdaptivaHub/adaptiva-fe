import { useState, useMemo } from 'react';
import {
  Search,
  SlidersHorizontal,
  Download,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  FileSpreadsheet,
  Database,
  Calendar,
  Hash,
  Type,
} from 'lucide-react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import { cn } from './ui/utils';
import type { UploadedFile, DataQualityReport } from '../types';

interface DataPreviewProps {
  file: UploadedFile;
  onSheetChange: (sheetName: string) => void;
  qualityReport?: DataQualityReport | null;
}

type SortDirection = 'asc' | 'desc' | null;

interface ColumnStats {
  type: 'number' | 'text' | 'date' | 'unknown';
  nullCount: number;
  uniqueCount: number;
  min?: number;
  max?: number;
}

export function DataPreview({ file, onSheetChange, qualityReport: _qualityReport }: DataPreviewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  // Calculate column statistics
  const columnStats = useMemo(() => {
    const stats: Record<string, ColumnStats> = {};

    file.headers.forEach((header) => {
      const values = file.data.map((row) => row[header]);
      const nonNullValues = values.filter((v) => v != null && v !== '');

      // Detect column type
      let type: ColumnStats['type'] = 'unknown';
      if (nonNullValues.length > 0) {
        const firstValue = nonNullValues[0];
        if (typeof firstValue === 'number') {
          type = 'number';
        } else if (typeof firstValue === 'string') {
          // Check if it looks like a date
          if (!isNaN(Date.parse(firstValue as string))) {
            type = 'date';
          } else {
            type = 'text';
          }
        }
      }

      const stat: ColumnStats = {
        type,
        nullCount: values.length - nonNullValues.length,
        uniqueCount: new Set(nonNullValues).size,
      };

      // Calculate min/max for numbers
      if (type === 'number') {
        const numbers = nonNullValues.filter((v) => typeof v === 'number') as number[];
        if (numbers.length > 0) {
          stat.min = Math.min(...numbers);
          stat.max = Math.max(...numbers);
        }
      }

      stats[header] = stat;
    });

    return stats;
  }, [file.headers, file.data]);

  // Filter and sort data
  const processedData = useMemo(() => {
    let filtered = file.data;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((row) =>
        Object.values(row).some((value) =>
          String(value).toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Apply sorting
    if (sortColumn && sortDirection) {
      filtered = [...filtered].sort((a, b) => {
        const aVal = a[sortColumn];
        const bVal = b[sortColumn];

        if (aVal == null) return 1;
        if (bVal == null) return -1;

        const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    return filtered;
  }, [file.data, searchQuery, sortColumn, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(processedData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = processedData.slice(startIndex, startIndex + rowsPerPage);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortColumn(null);
        setSortDirection(null);
      }
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const getColumnIcon = (type: ColumnStats['type']) => {
    switch (type) {
      case 'number':
        return Hash;
      case 'date':
        return Calendar;
      case 'text':
        return Type;
      default:
        return Database;
    }
  };

  const formatValue = (value: unknown) => {
    if (value == null || value === '') return '-';
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    return String(value);
  };

  return (
    <div className="space-y-4">
      {/* Header with Stats */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">{file.fileName}</h2>
                <p className="text-sm text-slate-500">
                  Uploaded {file.uploadedAt.toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-50 rounded-lg p-4">
            <p className="text-sm text-slate-500 mb-1">Total Rows</p>
            <p className="text-2xl font-bold text-slate-900">
              {file.rowCount.toLocaleString()}
            </p>
          </div>
          <div className="bg-slate-50 rounded-lg p-4">
            <p className="text-sm text-slate-500 mb-1">Columns</p>
            <p className="text-2xl font-bold text-slate-900">{file.headers.length}</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-4">
            <p className="text-sm text-slate-500 mb-1">File Size</p>
            <p className="text-2xl font-bold text-slate-900">
              {((file.rowCount * file.headers.length * 50) / 1024).toFixed(0)} KB
            </p>
          </div>
          <div className="bg-slate-50 rounded-lg p-4">
            <p className="text-sm text-slate-500 mb-1">Sheets</p>
            <p className="text-2xl font-bold text-slate-900">
              {file.sheets.length || 1}
            </p>
          </div>
        </div>
      </Card>

      {/* Sheet Tabs (if Excel) */}
      {file.sheets.length > 0 && (
        <Card className="p-4">
          <Tabs value={file.activeSheet} onValueChange={onSheetChange}>
            <TabsList>
              {file.sheets.map((sheet) => (
                <TabsTrigger key={sheet} value={sheet}>
                  {sheet}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </Card>
      )}

      {/* Table Controls */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search in data..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="flex-1"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </Button>
            <Select
              value={String(rowsPerPage)}
              onValueChange={(value) => {
                setRowsPerPage(Number(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 rows</SelectItem>
                <SelectItem value="20">20 rows</SelectItem>
                <SelectItem value="50">50 rows</SelectItem>
                <SelectItem value="100">100 rows</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Data Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                {file.headers.map((header) => {
                  const stats = columnStats[header];
                  const Icon = getColumnIcon(stats?.type);
                  return (
                    <TableHead key={header} className="font-semibold">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => handleSort(header)}
                              className="flex items-center gap-2 hover:text-indigo-600 transition-colors group w-full"
                            >
                              <Icon className="w-4 h-4 text-slate-400" />
                              <span className="truncate">{header}</span>
                              {sortColumn === header ? (
                                sortDirection === 'asc' ? (
                                  <ArrowUp className="w-4 h-4 text-indigo-600" />
                                ) : (
                                  <ArrowDown className="w-4 h-4 text-indigo-600" />
                                )
                              ) : (
                                <ArrowUpDown className="w-4 h-4 opacity-0 group-hover:opacity-50 transition-opacity" />
                              )}
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            <div className="space-y-1">
                              <p className="font-semibold">{header}</p>
                              <div className="text-xs space-y-0.5">
                                <p>
                                  Type:{' '}
                                  <Badge variant="secondary" className="ml-1">
                                    {stats?.type}
                                  </Badge>
                                </p>
                                <p>Unique values: {stats?.uniqueCount}</p>
                                {stats?.nullCount > 0 && (
                                  <p className="text-yellow-600">
                                    Null values: {stats.nullCount}
                                  </p>
                                )}
                                {stats?.type === 'number' && (
                                  <p>
                                    Range: {stats.min?.toLocaleString()} -{' '}
                                    {stats.max?.toLocaleString()}
                                  </p>
                                )}
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length > 0 ? (
                paginatedData.map((row, rowIndex) => (
                  <TableRow
                    key={startIndex + rowIndex}
                    className={cn(
                      'hover:bg-slate-50',
                      (startIndex + rowIndex) % 2 === 0 && 'bg-slate-25'
                    )}
                  >
                    {file.headers.map((header) => (
                      <TableCell key={header} className="max-w-xs truncate">
                        {formatValue(row[header])}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={file.headers.length}
                    className="text-center py-12 text-slate-500"
                  >
                    No data found matching your search criteria
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200">
            <p className="text-sm text-slate-500">
              Showing {startIndex + 1} to{' '}
              {Math.min(startIndex + rowsPerPage, processedData.length)} of{' '}
              {processedData.length} results
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className={cn(
                        currentPage === pageNum &&
                          'bg-gradient-to-r from-indigo-500 to-purple-600'
                      )}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}