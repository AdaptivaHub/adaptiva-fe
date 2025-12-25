export interface DataQualityIssue {
  type: 'missing' | 'duplicates' | 'formatting';
  count: number;
  severity: 'high' | 'medium' | 'low';
}

export interface ColumnIssue {
  column: string;
  issues: {
    type: 'missing' | 'duplicates' | 'formatting';
    count: number;
    percentage: number;
  }[];
}

export interface DataQualityReport {
  qualityScore: number;
  totalRows: number;
  cleanRows: number;
  issues: DataQualityIssue[];
  columnIssues: ColumnIssue[];
}

export function analyzeDataQuality(
  data: Record<string, unknown>[],
  headers: string[]
): DataQualityReport {
  const totalRows = data.length;
  let cleanRows = 0;
  const issues: DataQualityIssue[] = [];
  const columnIssues: ColumnIssue[] = [];
  // Track issues by type
  let totalMissing = 0;
  let totalDuplicates = 0;
  let totalFormatting = 0;

  // Analyze each column
  headers.forEach((header) => {
    const columnData = data.map((row) => row[header]);
    const columnIssuesList: ColumnIssue['issues'] = [];

    // Check for missing values
    const missingCount = columnData.filter(
      (value) => value == null || value === '' || value === 'null' || value === 'undefined'
    ).length;

    if (missingCount > 0) {
      totalMissing += missingCount;
      columnIssuesList.push({
        type: 'missing',
        count: missingCount,
        percentage: (missingCount / totalRows) * 100,
      });
    }

    // Check for duplicates (only for text/string columns)
    const nonNullValues = columnData.filter(
      (v) => v != null && v !== ''
    );
    const uniqueValues = new Set(nonNullValues);
    const duplicatesCount = nonNullValues.length - uniqueValues.size;

    if (duplicatesCount > 0 && typeof columnData[0] === 'string') {
      totalDuplicates += duplicatesCount;
    }

    // Check for formatting issues (inconsistent types)
    const types = new Set(
      columnData.filter((v) => v != null && v !== '').map((v) => typeof v)
    );
    if (types.size > 1) {
      totalFormatting += 1;
      columnIssuesList.push({
        type: 'formatting',
        count: 1,
        percentage: 100,
      });
    }    if (columnIssuesList.length > 0) {
      columnIssues.push({
        column: header,
        issues: columnIssuesList,
      });
    }
  });

  // Count clean rows (rows with no missing values)
  cleanRows = data.filter((row) => {
    return headers.every((header) => {
      const value = row[header];
      return value != null && value !== '' && value !== 'null' && value !== 'undefined';
    });
  }).length;

  // Aggregate issues
  if (totalMissing > 0) {
    issues.push({
      type: 'missing',
      count: totalMissing,
      severity: totalMissing > totalRows * 0.1 ? 'high' : 'medium',
    });
  }

  if (totalDuplicates > 0) {
    issues.push({
      type: 'duplicates',
      count: totalDuplicates,
      severity: totalDuplicates > totalRows * 0.05 ? 'high' : 'low',
    });
  }
  if (totalFormatting > 0) {
    issues.push({
      type: 'formatting',
      count: totalFormatting,
      severity: totalFormatting > 2 ? 'high' : 'medium',
    });
  }

  // Calculate quality score (0-100)
  let qualityScore = 100;

  // Deduct for missing values
  const missingPenalty = (totalMissing / (totalRows * headers.length)) * 40;
  qualityScore -= missingPenalty;

  // Deduct for formatting issues
  const formattingPenalty = (totalFormatting / headers.length) * 30;
  qualityScore -= formattingPenalty;
  // Deduct for duplicates
  const duplicatePenalty = (totalDuplicates / totalRows) * 20;
  qualityScore -= duplicatePenalty;

  qualityScore = Math.max(0, Math.min(100, Math.round(qualityScore)));

  return {
    qualityScore,
    totalRows,
    cleanRows,
    issues,
    columnIssues,
  };
}


