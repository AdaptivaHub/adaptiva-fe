/**
 * Sample Data Utilities
 * 
 * App-layer logic for downloading sample data files.
 * This was moved from the design system to keep it purely presentational.
 */

const SAMPLE_CSV_DATA = `ID,Name,Email,Sales,Region,Date
1,Customer 1,customer1@example.com,5432,North,2024-03-15
2,Customer 2,customer2@example.com,8901,South,2024-04-22
3,Customer 3,customer3@example.com,3210,East,2024-02-10
4,Customer 4,customer4@example.com,7654,West,2024-05-18
5,Customer 5,customer5@example.com,4567,North,2024-01-25`;

/**
 * Downloads a sample CSV file for users to test with.
 * Creates a Blob and triggers browser download.
 */
export function downloadSampleFile(): void {
  const blob = new Blob([SAMPLE_CSV_DATA], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'sample-data.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

/**
 * Scrolls to the upload zone element.
 * Used by EmptyState to navigate users to file upload.
 */
export function scrollToUploadZone(): void {
  const uploadElement = document.getElementById('upload-zone');
  if (uploadElement) {
    uploadElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}
